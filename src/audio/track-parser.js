// Parser of the compact track format (docs/AUDIO_FORMAT.md). Pure: works in Node and the browser.
// Output per channel: note events in ticks (24 ticks per quarter note), length and loop point.

export const TICKS_PER_QUARTER = 24;
export const TICKS_PER_WHOLE = TICKS_PER_QUARTER * 4;
export const CHANNELS = [1, 2, 3, 4];
export const DUTIES = [12, 25, 50, 75];
const LENGTHS = [1, 2, 4, 8, 16, 32];
const SEMITONES = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

export class TrackError extends Error {}

export function midiToFrequency(midi) {
  return 440 * 2 ** ((midi - 69) / 12);
}

function lengthTicks(value, dotted, fail) {
  const length = Number(value);
  if (!LENGTHS.includes(length)) fail(`durée « ${value} » invalide (1, 2, 4, 8, 16 ou 32)`);
  const ticks = TICKS_PER_WHOLE / length;
  return dotted ? ticks * 1.5 : ticks;
}

function tokenize(source) {
  return source
    .replace(/\/\/[^\n]*/g, ' ')
    .replace(/\[/g, ' [ ')
    .replace(/\](x\d+)?/g, ' ]$1 ')
    .split(/\s+/)
    .filter(Boolean);
}

/** Builds a tree: tokens and loops { loop: items, times, index }. Throws on unbalanced brackets. */
function buildTree(tokens, fail) {
  const root = [];
  const stack = [{ items: root, index: -1 }];
  tokens.forEach((token, index) => {
    if (token === '[') {
      const group = { loop: [], times: 2, index };
      stack.at(-1).items.push(group);
      stack.push({ items: group.loop, group, index });
      return;
    }
    const close = /^\](?:x(\d+))?$/.exec(token);
    if (close) {
      if (stack.length === 1) fail(`« ${token} » sans « [ » ouvrant`, index);
      const { group } = stack.pop();
      group.times = close[1] ? Number(close[1]) : 2;
      if (group.times < 1) fail(`répétition « ${token} » invalide`, index);
      return;
    }
    stack.at(-1).items.push({ token, index });
  });
  if (stack.length > 1) fail('« [ » sans « ] » fermant', stack.at(-1).index);
  return root;
}

/**
 * Parses one channel. Returns { events, lengthTicks, loopTick }.
 * Note events: { tick, ticks, midi, volume, envelope, duty, glide, wave }.
 * Noise events (channel 4): { tick, ticks, noise, mode, volume, envelope }.
 */
export function parseChannel(source, { trackId = '?', channel = 1 } = {}) {
  const tokens = tokenize(source);
  const fail = (message, index) => {
    const where = index === undefined ? '' : `, symbole ${index + 1} (« ${tokens[index]} »)`;
    throw new TrackError(`Piste ${trackId}, voie ${channel}${where} : ${message}`);
  };
  const state = { octave: 4, length: 12, volume: 12, envelope: { direction: 0, step: 0 }, duty: 50, glide: 0, wave: 0, mode: 15 };
  const events = [];
  let tick = 0;
  let loopTick = null;

  const runItems = (items, insideLoop) => {
    for (const item of items) {
      if (item.loop) {
        for (let i = 0; i < item.times; i += 1) runItems(item.loop, true);
        continue;
      }
      runToken(item.token, item.index, insideLoop);
    }
  };

  const runToken = (token, index, insideLoop) => {
    const err = (message) => fail(message, index);
    let match;
    if (token === '|') {
      // Bar line: checks that the bar is complete (4/4).
      if (tick % TICKS_PER_WHOLE !== 0) err(`mesure incomplète (temps ${tick % TICKS_PER_WHOLE} sur ${TICKS_PER_WHOLE})`);
    } else if (token === '@') {
      if (insideLoop) err('le point de bouclage « @ » ne peut pas être dans une répétition');
      if (loopTick !== null) err('un seul point de bouclage « @ » par voie');
      loopTick = tick;
    } else if (token === '>') {
      state.octave += 1;
    } else if (token === '<') {
      state.octave -= 1;
    } else if ((match = /^O(\d)$/.exec(token))) {
      state.octave = Number(match[1]);
    } else if ((match = /^L(\d+)(\.)?$/.exec(token))) {
      state.length = lengthTicks(match[1], match[2], err);
    } else if ((match = /^V(\d+)$/.exec(token))) {
      const volume = Number(match[1]);
      if (volume > 15) err('volume entre 0 et 15');
      state.volume = volume;
    } else if ((match = /^S([+-]?)(\d)$/.exec(token))) {
      const step = Number(match[2]);
      if (step > 7) err('pas d’enveloppe entre 0 et 7');
      state.envelope = { direction: step === 0 ? 0 : match[1] === '+' ? 1 : -1, step };
    } else if ((match = /^P(\d+)$/.exec(token))) {
      if (channel > 2) err('le rapport cyclique ne concerne que les voies 1 et 2');
      if (!DUTIES.includes(Number(match[1]))) err('rapport cyclique 12, 25, 50 ou 75');
      state.duty = Number(match[1]);
    } else if ((match = /^H(-?\d+)$/.exec(token))) {
      if (channel !== 1) err('le glissando ne concerne que la voie 1');
      state.glide = Number(match[1]);
    } else if ((match = /^W(\d+)$/.exec(token))) {
      if (channel !== 3) err('la table d’onde ne concerne que la voie 3');
      state.wave = Number(match[1]);
    } else if ((match = /^N(7|15)$/.exec(token))) {
      if (channel !== 4) err('le mode de bruit ne concerne que la voie 4');
      state.mode = Number(match[1]);
    } else if ((match = /^R(?::(\d+)(\.)?)?$/.exec(token))) {
      tick += match[1] ? lengthTicks(match[1], match[2], err) : state.length;
    } else if ((match = /^X(\d{1,2})(?::(\d+)(\.)?)?$/.exec(token))) {
      if (channel !== 4) err('les sons de bruit « X » ne concernent que la voie 4');
      const noise = Number(match[1]);
      if (noise > 15) err('hauteur de bruit entre 0 et 15');
      const ticks = match[2] ? lengthTicks(match[2], match[3], err) : state.length;
      events.push({ tick, ticks, noise, mode: state.mode, volume: state.volume, envelope: { ...state.envelope } });
      tick += ticks;
    } else if ((match = /^([A-G])(#|b)?(\d)?(?::(\d+)(\.)?)?$/.exec(token))) {
      if (channel === 4) err('la voie 4 ne joue que du bruit (« X »)');
      const octave = match[3] === undefined ? state.octave : Number(match[3]);
      const midi = (octave + 1) * 12 + SEMITONES[match[1]] + (match[2] === '#' ? 1 : match[2] === 'b' ? -1 : 0);
      const ticks = match[4] ? lengthTicks(match[4], match[5], err) : state.length;
      events.push({ tick, ticks, midi, volume: state.volume, envelope: { ...state.envelope }, duty: state.duty, glide: state.glide, wave: state.wave });
      tick += ticks;
    } else {
      err('symbole inconnu');
    }
  };

  runItems(buildTree(tokens, fail), false);
  return { events, lengthTicks: tick, loopTick };
}

/**
 * Parses a track { id, tempo, loop, channels: { 1: '…', … } }. All channels must have the same
 * length and the same loop point. Returns { id, tempo, loop, channels, lengthTicks, loopTick,
 * secondsPerTick, duration }.
 */
export function parseTrack(track) {
  const { id, tempo, loop = true } = track;
  if (!(tempo >= 30 && tempo <= 400)) throw new TrackError(`Piste ${id} : tempo ${tempo} hors de [30, 400]`);
  const channels = {};
  for (const [key, source] of Object.entries(track.channels)) {
    const channel = Number(key);
    if (!CHANNELS.includes(channel)) throw new TrackError(`Piste ${id} : voie ${key} inconnue (1 à 4)`);
    channels[channel] = parseChannel(source, { trackId: id, channel });
  }
  const parsed = Object.entries(channels);
  if (parsed.length === 0) throw new TrackError(`Piste ${id} : aucune voie`);
  const lengths = parsed.map(([channel, data]) => `voie ${channel} = ${data.lengthTicks}`);
  if (new Set(parsed.map(([, data]) => data.lengthTicks)).size > 1) {
    throw new TrackError(`Piste ${id} : voies de longueurs différentes (${lengths.join(', ')})`);
  }
  const loops = parsed.map(([, data]) => data.loopTick);
  if (new Set(loops).size > 1) throw new TrackError(`Piste ${id} : points de bouclage « @ » différents selon les voies`);
  const lengthTicks = parsed[0][1].lengthTicks;
  const secondsPerTick = 60 / tempo / TICKS_PER_QUARTER;
  return {
    id,
    tempo,
    loop,
    channels,
    lengthTicks,
    loopTick: loops[0] ?? 0,
    secondsPerTick,
    duration: lengthTicks * secondsPerTick,
  };
}

/** True when the channel melody contains the interval pattern (in semitones) between consecutive notes. */
export function containsIntervals(events, intervals) {
  const notes = events.filter((event) => event.midi !== undefined).map((event) => event.midi);
  for (let start = 0; start + intervals.length < notes.length; start += 1) {
    if (intervals.every((interval, i) => notes[start + i + 1] - notes[start + i] === interval)) return true;
  }
  return false;
}
