// Experience, level-ups, move learning and evolution checks (pure).
import { MAX_LEVEL, expForLevel } from '../../data/formulas.js';
import {
  MAX_FRIENDSHIP, MAX_MOVES, addTraining, createMoveSlot, getSpecies, movesLearnedAt, recalculateStats,
} from './creature.js';

export const TRAINER_EXP_BONUS = 1.5;
export const LEVEL_UP_FRIENDSHIP = 3;

/** Experience for each participant: floor(base × level / 7) × 1.5 (trainer) / participants. */
export function experienceYield(defeated, participantCount, isTrainer) {
  const base = Math.floor((getSpecies(defeated.species).baseExp * defeated.level) / 7);
  return Math.max(1, Math.floor((base * (isTrainer ? TRAINER_EXP_BONUS : 1)) / Math.max(1, participantCount)));
}

export function addTrainingYield(creature, defeated) {
  const { stat, points } = getSpecies(defeated.species).trainingYield;
  addTraining(creature, stat, points);
}

/**
 * Adds experience and handles every level gained. Moves are learned directly while the creature
 * has fewer than 4; otherwise they are returned in `prompts` for the player to decide.
 * `partyIndex` is copied into the events. Returns { events, prompts, levels }.
 */
export function gainExperience(creature, amount, partyIndex) {
  const species = getSpecies(creature.species);
  const events = [{ type: 'exp_gain', side: 0, index: partyIndex, amount }];
  const prompts = [];
  const maxExp = expForLevel(species.growth, MAX_LEVEL);
  creature.exp = Math.min(maxExp, creature.exp + amount);
  let levels = 0;

  while (creature.level < MAX_LEVEL && creature.exp >= expForLevel(species.growth, creature.level + 1)) {
    const previousStats = { ...creature.stats };
    creature.level += 1;
    levels += 1;
    recalculateStats(creature);
    creature.friendship = Math.min(MAX_FRIENDSHIP, creature.friendship + LEVEL_UP_FRIENDSHIP);
    events.push({ type: 'level_up', side: 0, index: partyIndex, level: creature.level, stats: { ...creature.stats }, previousStats });
    for (const moveId of movesLearnedAt(creature.species, creature.level)) {
      if (creature.moves.some((slot) => slot.id === moveId)) continue;
      if (creature.moves.length < MAX_MOVES) {
        creature.moves.push(createMoveSlot(moveId));
        events.push({ type: 'move_learned', side: 0, index: partyIndex, move: moveId });
      } else {
        prompts.push({ index: partyIndex, move: moveId });
      }
    }
  }
  return { events, prompts, levels };
}

/**
 * Replaces move `slot` (0-3) by `moveId`, or skips when slot is null.
 * Returns the matching event.
 */
export function learnMove(creature, partyIndex, moveId, slot) {
  if (slot === null || slot === undefined) return { type: 'move_not_learned', side: 0, index: partyIndex, move: moveId };
  const oldMove = creature.moves[slot].id;
  creature.moves[slot] = createMoveSlot(moveId);
  return { type: 'move_forgotten', side: 0, index: partyIndex, oldMove, move: moveId };
}

/** Level or friendship evolution reached (stones are used from the bag). Returns a species id or null. */
export function pendingEvolution(creature) {
  const evolutions = getSpecies(creature.species).evolution;
  if (!evolutions) return null;
  for (const evolution of Array.isArray(evolutions) ? evolutions : [evolutions]) {
    if (evolution.method === 'level' && creature.level >= evolution.value) return evolution.to;
    if (evolution.method === 'friendship' && creature.friendship >= evolution.value) return evolution.to;
  }
  return null;
}
