// Procedural creature cries (pure, deterministic). A cry mixes 2 or 3 pulse segments with glides
// and a noise burst. The shape comes from the line (an evolution sounds close to its base form),
// the pitch from the weight (heavier = lower) and the length from the stat total (0.3 to 0.8 s).
import { CREATURES, CREATURES_BY_ID } from '../data/creatures.js';
import { createRng } from '../engine/rng.js';
import { TICKS_PER_QUARTER } from './track-parser.js';

const CRY_TEMPO = 150; // 1 tick = 1/60 s
const SECONDS_PER_TICK = 60 / CRY_TEMPO / TICKS_PER_QUARTER;
const MIN_SECONDS = 0.3;
const MAX_SECONDS = 0.8;

const parents = new Map();
for (const creature of CREATURES) {
  const evolutions = Array.isArray(creature.evolution) ? creature.evolution : creature.evolution ? [creature.evolution] : [];
  for (const evolution of evolutions) parents.set(evolution.to, creature.id);
}

/** First form of the species' line, and how many evolutions separate them. */
export function lineRoot(speciesId) {
  let id = speciesId;
  let stage = 0;
  while (parents.has(id)) {
    id = parents.get(id);
    stage += 1;
  }
  return { root: id, stage };
}

function hashString(text) {
  let hash = 0x811c9dc5;
  for (const character of text) hash = Math.imul(hash ^ character.charCodeAt(0), 0x01000193) >>> 0;
  return hash;
}

const statTotal = (stats) => Object.values(stats).reduce((sum, value) => sum + value, 0);

/** Base MIDI pitch: heavier creatures cry lower; each evolution stage lowers it a little more. */
export function cryPitch(speciesId) {
  const species = CREATURES_BY_ID[speciesId];
  const { stage } = lineRoot(speciesId);
  const pitch = 86 - Math.log2(species.weight + 1) * 4.5 - stage * 2;
  return Math.round(Math.max(40, Math.min(86, pitch)));
}

/** Parsed-track structure (see track-parser.js), played as a sound effect on channels 1 and 4. */
export function generateCry(speciesId) {
  const species = CREATURES_BY_ID[speciesId];
  if (!species) throw new Error(`Unknown species: ${speciesId}`);
  const { root } = lineRoot(speciesId);
  const rng = createRng(hashString(root));
  const seconds = MIN_SECONDS + Math.min(1, Math.max(0, (statTotal(species.baseStats) - 250) / 430)) * (MAX_SECONDS - MIN_SECONDS);
  const lengthTicks = Math.round(seconds / SECONDS_PER_TICK);
  const base = cryPitch(speciesId);

  const segmentCount = 2 + Math.floor(rng.next() * 2);
  const duty = rng.pick([12, 25, 50, 75]);
  const pulses = [];
  let tick = 0;
  for (let i = 0; i < segmentCount; i += 1) {
    const ticks = i === segmentCount - 1 ? lengthTicks - tick : Math.max(3, Math.round((lengthTicks / segmentCount) * (0.7 + rng.next() * 0.6)));
    if (ticks <= 0) break;
    pulses.push({
      tick,
      ticks,
      midi: base + Math.round((rng.next() - 0.4) * 10),
      volume: 15 - i * 2,
      envelope: { direction: -1, step: i === segmentCount - 1 ? 2 : 0 },
      duty,
      glide: Math.round((rng.next() - 0.5) * 14),
      wave: 0,
    });
    tick += ticks;
  }
  const noiseTicks = Math.round(lengthTicks * (0.3 + rng.next() * 0.3));
  // The noise burst depends on the species itself, so two forms of a line never sound identical.
  const own = hashString(speciesId);
  const noise = [{ tick: 0, ticks: noiseTicks, noise: 2 + (own % 9), mode: (own >> 4) % 4 === 0 ? 7 : 15, volume: 9, envelope: { direction: -1, step: 1 } }];

  return {
    id: `cry_${speciesId}`,
    tempo: CRY_TEMPO,
    loop: false,
    channels: {
      1: { events: pulses, lengthTicks, loopTick: null },
      4: { events: noise, lengthTicks, loopTick: null },
    },
    lengthTicks,
    loopTick: 0,
    secondsPerTick: SECONDS_PER_TICK,
    duration: lengthTicks * SECONDS_PER_TICK,
  };
}
