// Pension: one creature gains 1 XP per step of the player and learns its moves on its own
// (the oldest move is forgotten). Taking it back costs 100 + 100 × levels gained (pure).
import { createMoveSlot, MAX_MOVES } from '../battle/logic/creature.js';
import { gainExperience } from '../battle/logic/experience.js';
import { PARTY_SIZE, addMoney } from './game-state.js';
import { healthyCount } from './storage.js';

export const DAYCARE_BASE_COST = 100;
export const DAYCARE_COST_PER_LEVEL = 100;

export function depositInDaycare(state, partyIndex) {
  if (state.daycare) return 'occupied';
  const creature = state.party[partyIndex];
  if (!creature) return 'no_creature';
  const others = state.party.filter((_, index) => index !== partyIndex);
  if (healthyCount(others) === 0) return 'last_healthy';
  state.party.splice(partyIndex, 1);
  state.daycare = { creature, levelAtDeposit: creature.level };
  return null;
}

/** One step of the player. Returns the number of levels gained during this step. */
export function daycareStep(state) {
  if (!state.daycare) return 0;
  const { creature } = state.daycare;
  const { prompts, levels } = gainExperience(creature, 1, 0);
  for (const { move } of prompts) {
    if (creature.moves.length >= MAX_MOVES) creature.moves.shift();
    creature.moves.push(createMoveSlot(move));
  }
  return levels;
}

export function daycareCost(state) {
  if (!state.daycare) return 0;
  return DAYCARE_BASE_COST + DAYCARE_COST_PER_LEVEL * (state.daycare.creature.level - state.daycare.levelAtDeposit);
}

export function withdrawFromDaycare(state) {
  if (!state.daycare) return 'empty';
  if (state.party.length >= PARTY_SIZE) return 'party_full';
  const cost = daycareCost(state);
  if (state.money < cost) return 'money';
  addMoney(state, -cost);
  state.party.push(state.daycare.creature);
  state.daycare = null;
  return null;
}
