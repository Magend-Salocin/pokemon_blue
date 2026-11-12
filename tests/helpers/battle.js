// Test helpers for the battle engine: controllable RNG and quick battle setup.
import { createCreature } from '../../src/battle/logic/creature.js';
import { createBattle, resolveTurn } from '../../src/battle/logic/engine.js';
import { createRng } from '../../src/engine/rng.js';

export const ZERO_GENES = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };

/**
 * RNG returning `values` in order, then `fallback` forever. int/pick/weighted are derived
 * from next(), like the real RNG.
 */
export function scriptedRng(values = [], fallback = 0.5) {
  const queue = [...values];
  const next = () => (queue.length > 0 ? queue.shift() : fallback);
  return {
    next,
    int: (min, max) => min + Math.floor(next() * (max - min + 1)),
    chance: (p) => next() < p,
    pick: (array) => array[Math.floor(next() * array.length)],
    weighted: (entries) => entries[0],
  };
}

export const constantRng = (value) => scriptedRng([], value);

export function makeCreature(species, level, moves, options = {}) {
  return createCreature(species, level, createRng(1), { genes: ZERO_GENES, moves, ...options });
}

/** Wild battle by default; `trainer` makes it a trainer battle. */
export function makeBattle(playerParty, enemyParty, { trainer = null } = {}) {
  return createBattle({
    kind: trainer ? 'trainer' : 'wild',
    playerParty,
    enemyParty,
    trainer,
  });
}

export const move = (index = 0) => ({ type: 'move', index });

/** Resolves one turn with the given actions (enemy defaults to its first move). */
export function turn(state, playerAction, enemyAction = move(0), rng = constantRng(0.5)) {
  return resolveTurn(state, playerAction, enemyAction, rng);
}

export const eventsOf = (events, type) => events.filter((event) => event.type === type);
export const player = (state) => state.sides[0].party[state.sides[0].active];
export const enemy = (state) => state.sides[1].party[state.sides[1].active];
