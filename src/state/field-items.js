// Items used from the bag outside battle (pure). The bag screen asks for the target, shows the
// messages and runs the evolution or move-learning scenes from the returned result.
import { ITEMS_BY_ID } from '../data/items.js';
import { MAX_LEVEL, expForLevel } from '../data/formulas.js';
import { getSpecies, recalculateStats } from '../battle/logic/creature.js';
import { gainExperience } from '../battle/logic/experience.js';
import { applyItem, itemProblem } from '../battle/logic/items.js';
import { removeItem } from './game-state.js';

export const VITAMIN_LIMIT = 100;
const CREATURE_EFFECTS = ['heal_hp', 'revive', 'cure_status', 'restore_pp', 'level_up', 'evolve', 'add_training'];

/** What the item needs: 'creature', 'move' (creature then move), or 'none'. */
export function fieldItemTarget(itemId) {
  const { effect, params } = ITEMS_BY_ID[itemId].use;
  if (effect === 'restore_pp' && !params.allMoves) return 'move';
  return CREATURE_EFFECTS.includes(effect) ? 'creature' : 'none';
}

/** Species reached by using an evolution item, or null. */
export function stoneEvolution(creature, itemId) {
  const evolutions = getSpecies(creature.species).evolution;
  const list = Array.isArray(evolutions) ? evolutions : evolutions ? [evolutions] : [];
  return list.find((evolution) => evolution.method === 'item' && evolution.value === itemId)?.to ?? null;
}

/** Why the item cannot be used on this creature (null = usable). */
export function fieldItemProblem(itemId, creature, moveIndex) {
  const item = ITEMS_BY_ID[itemId];
  const { effect, params } = item.use;
  if (item.use.context !== 'field' && item.use.context !== 'both') return 'not_here';
  if (['heal_hp', 'revive', 'cure_status', 'restore_pp'].includes(effect)) return itemProblem(item, creature, moveIndex);
  if (!creature) return 'no_target';
  if (effect === 'level_up') return creature.level >= MAX_LEVEL ? 'max_level' : null;
  if (effect === 'evolve') return stoneEvolution(creature, itemId) ? null : 'no_effect';
  if (effect === 'add_training') return creature.training[params.stat] >= VITAMIN_LIMIT ? 'no_effect' : null;
  return null;
}

/**
 * Uses a creature item: consumes it and returns
 * { events, evolution (species id or null), learnPrompts (move ids), leveledUp }.
 */
export function useItemOnCreature(state, itemId, partyIndex, moveIndex) {
  const item = ITEMS_BY_ID[itemId];
  const creature = state.party[partyIndex];
  const problem = fieldItemProblem(itemId, creature, moveIndex);
  if (problem) return { problem };
  removeItem(state, itemId);
  const { effect, params } = item.use;
  const result = { events: [], evolution: null, learnPrompts: [], leveledUp: false };

  if (effect === 'level_up') {
    const species = getSpecies(creature.species);
    const gained = gainExperience(creature, expForLevel(species.growth, creature.level + 1) - creature.exp, partyIndex);
    result.events = gained.events;
    result.learnPrompts = gained.prompts.map((prompt) => prompt.move);
    result.leveledUp = true;
  } else if (effect === 'evolve') {
    result.evolution = stoneEvolution(creature, itemId);
  } else if (effect === 'add_training') {
    creature.training[params.stat] = Math.min(VITAMIN_LIMIT, creature.training[params.stat] + params.points);
    recalculateStats(creature);
    result.events.push({ type: 'training_up', index: partyIndex, stat: params.stat });
  } else {
    result.events = applyItem(item, creature, 0, partyIndex, moveIndex);
  }
  return result;
}

/** Starts a repel; returns false (item kept) when one is already active. */
export function useRepel(state, itemId) {
  if (state.repelSteps > 0) return false;
  removeItem(state, itemId);
  state.repelSteps = ITEMS_BY_ID[itemId].use.params.steps;
  return true;
}
