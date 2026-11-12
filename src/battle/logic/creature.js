// Creature instances (pure). Serializable: plain objects, ids instead of references.
import { CREATURES_BY_ID } from '../../data/creatures.js';
import {
  MAX_GENE, MAX_TRAINING, STAT_KEYS, computeStats, expForLevel,
} from '../../data/formulas.js';
import { MOVES_BY_ID } from '../../data/moves.js';

export const MAX_MOVES = 4;
export const DEFAULT_FRIENDSHIP = 70;
export const MAX_FRIENDSHIP = 255;

export function getSpecies(speciesId) {
  const species = CREATURES_BY_ID[speciesId];
  if (!species) throw new Error(`Unknown species: ${speciesId}`);
  return species;
}

export function createMoveSlot(moveId) {
  const move = MOVES_BY_ID[moveId];
  if (!move) throw new Error(`Unknown move: ${moveId}`);
  return { id: moveId, pp: move.pp, maxPp: move.pp };
}

/** Last MAX_MOVES distinct moves of the learnset known at `level`. */
export function defaultMoves(speciesId, level) {
  const known = [];
  for (const [learnLevel, moveId] of getSpecies(speciesId).learnset) {
    if (learnLevel > level) break;
    const index = known.indexOf(moveId);
    if (index >= 0) known.splice(index, 1);
    known.push(moveId);
  }
  return known.slice(-MAX_MOVES);
}

/** Moves learned exactly at `level`. */
export function movesLearnedAt(speciesId, level) {
  return getSpecies(speciesId).learnset.filter(([learnLevel]) => learnLevel === level).map(([, moveId]) => moveId);
}

function randomGenes(rng) {
  return Object.fromEntries(STAT_KEYS.map((key) => [key, rng.int(0, MAX_GENE)]));
}

/**
 * options: { nickname, genes, training, moves (ids), originalTrainer, caughtIn, friendship, uid }
 */
export function createCreature(speciesId, level, rng, options = {}) {
  const species = getSpecies(speciesId);
  const creature = {
    uid: options.uid ?? `${speciesId}-${rng.int(0, 0x7fffffff).toString(36)}`,
    species: speciesId,
    nickname: options.nickname ?? null,
    level,
    exp: expForLevel(species.growth, level),
    genes: options.genes ?? randomGenes(rng),
    training: options.training ?? Object.fromEntries(STAT_KEYS.map((key) => [key, 0])),
    stats: null,
    hp: 0,
    moves: (options.moves ?? defaultMoves(speciesId, level)).map(createMoveSlot),
    status: null,
    friendship: options.friendship ?? DEFAULT_FRIENDSHIP,
    originalTrainer: options.originalTrainer ?? null,
    caughtIn: options.caughtIn ?? null,
  };
  recalculateStats(creature);
  creature.hp = creature.stats.hp;
  return creature;
}

/** Recomputes stats; current HP rises or falls by the change of max HP (never below 1 if alive). */
export function recalculateStats(creature) {
  const previousMax = creature.stats?.hp ?? null;
  creature.stats = computeStats(getSpecies(creature.species).baseStats, creature.level, creature.genes, creature.training);
  if (previousMax !== null && creature.hp > 0) {
    creature.hp = Math.max(1, Math.min(creature.stats.hp, creature.hp + creature.stats.hp - previousMax));
  }
  return creature;
}

export function addTraining(creature, stat, points) {
  creature.training[stat] = Math.min(MAX_TRAINING, creature.training[stat] + points);
}

export const isFainted = (creature) => creature.hp <= 0;

export function displayName(creature) {
  return creature.nickname ?? getSpecies(creature.species).name;
}

/** Applies an evolution outside battle: new species, stats recomputed, moves and nickname kept. */
export function evolveCreature(creature, targetId) {
  getSpecies(targetId);
  creature.species = targetId;
  recalculateStats(creature);
  return creature;
}
