// Scripted trades with NPCs (pure). offer: { creature, level, nickname, originalTrainer }.
import { createCreature } from '../battle/logic/creature.js';
import { markCaught } from './game-state.js';

export function canTrade(state, partyIndex, wanted) {
  const creature = state.party[partyIndex];
  if (!creature) return 'no_creature';
  if (creature.species !== wanted) return 'wrong_species';
  return null;
}

/** Replaces the party creature with the NPC's one. Returns { given, received } or { error }. */
export function tradeCreature(state, partyIndex, wanted, offer, rng) {
  const error = canTrade(state, partyIndex, wanted);
  if (error) return { error };
  const given = state.party[partyIndex];
  const received = createCreature(offer.creature, offer.level, rng, {
    nickname: offer.nickname ?? null,
    originalTrainer: offer.originalTrainer,
    caughtIn: 'capsule',
  });
  state.party[partyIndex] = received;
  markCaught(state, received.species);
  return { given, received };
}
