import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MOVES_BY_ID } from '../src/data/moves.js';
import { computeHp, computeStat } from '../src/data/formulas.js';
import { createCreature, defaultMoves, evolveCreature, recalculateStats } from '../src/battle/logic/creature.js';
import {
  accuracyMultiplier, baseDamage, computeDamage, criticalChance, effectiveSpeed, rollHit, stageMultiplier,
} from '../src/battle/logic/damage.js';
import { freshStages } from '../src/battle/logic/battle-state.js';
import { CREATURES_BY_ID } from '../src/data/creatures.js';
import { ZERO_GENES, constantRng } from './helpers/battle.js';
import { createRng } from '../src/engine/rng.js';

/** Minimal combatant with hand-picked stats. */
function fighter(species, stats, extra = {}) {
  return {
    creature: { species, level: 50, status: null, stats: { hp: 100, atk: 100, def: 100, spa: 100, spd: 100, spe: 100, ...stats }, ...extra.creature },
    stages: { ...freshStages(), ...extra.stages },
    screens: extra.screens,
  };
}

const scratch = MOVES_BY_ID.egratignure; // Normal, physical, 40
const ember = MOVES_BY_ID.escarbille; // Feu, special, 40

test('base damage, computed by hand', () => {
  // floor(2 × 50 / 5 + 2) = 22 ; floor(22 × 40 × 100 / 80) = 1100 ; floor(1100 / 50) + 2 = 24
  assert.equal(baseDamage(50, 40, 100, 80), 24);
  // floor(2 × 5 / 5 + 2) = 4 ; floor(4 × 40 × 14 / 12) = 186 ; floor(186 / 50) + 2 = 5
  assert.equal(baseDamage(5, 40, 14, 12), 5);
});

test('STAB multiplies by 1.5', () => {
  const attacker = fighter('musaraille', { atk: 100 }); // Normal
  const defender = fighter('lapugil', { def: 80 }); // Combat, neutral to Normal
  assert.equal(computeDamage(scratch, attacker, defender).damage, 36); // floor(24 × 1.5)
  const noStab = fighter('lapugil', { atk: 100 });
  assert.equal(computeDamage(scratch, noStab, defender).damage, 24);
});

test('random factor is applied before the final floor', () => {
  const attacker = fighter('musaraille', { atk: 100 });
  const defender = fighter('lapugil', { def: 80 });
  assert.equal(computeDamage(scratch, attacker, defender, { random: 0.85 }).damage, 30); // floor(36 × 0.85 = 30.6)
});

test('critical hit ×1.5 ignores the attacker drops and the defender boosts', () => {
  const attacker = fighter('musaraille', { atk: 100 }, { stages: { atk: -2 } });
  const defender = fighter('lapugil', { def: 80 }, { stages: { def: 2 } });
  assert.equal(computeDamage(scratch, attacker, defender, { critical: true }).damage, 54); // floor(24 × 1.5 × 1.5)
  assert.ok(computeDamage(scratch, attacker, defender).damage < 20);
});

test('type effectiveness: ×2, ×4 on two weaknesses, 0 on immunity', () => {
  const attacker = fighter('lapugil', { spa: 100 }); // no STAB with Feu
  assert.equal(computeDamage(ember, attacker, fighter('feuillarve', { spd: 80 })).damage, 48); // Insecte: ×2
  assert.equal(computeDamage(ember, attacker, fighter('cristelan', { spd: 80 })).damage, 48); // Givre ×2, Arcane ×1
  assert.equal(computeDamage(MOVES_BY_ID.giclee, attacker, fighter('tisonnet', { spd: 80 })).damage, 96); // Feu and Roche: ×4
  const immune = computeDamage(scratch, fighter('lapugil', {}), fighter('sombrelin', {}));
  assert.deepEqual([immune.damage, immune.effectiveness], [0, 0]);
});

test('burn halves physical damage, not special damage', () => {
  const burned = fighter('musaraille', { atk: 100, spa: 100 }, { creature: { status: { id: 'brl' } } });
  const defender = fighter('lapugil', { def: 80, spd: 80 });
  assert.equal(computeDamage(scratch, burned, defender).damage, 18);
  assert.equal(computeDamage(ember, burned, defender).damage, 24);
});

test('screens halve damage of their category, except critical hits', () => {
  const attacker = fighter('musaraille', { atk: 100 });
  const defender = fighter('lapugil', { def: 80 }, { screens: { physical: 3, special: 0 } });
  assert.equal(computeDamage(scratch, attacker, defender).damage, 18);
  assert.equal(computeDamage(scratch, attacker, defender, { critical: true }).damage, 54);
});

test('stage, accuracy and critical multipliers', () => {
  assert.deepEqual([-6, -1, 0, 1, 6].map(stageMultiplier), [0.25, 2 / 3, 1, 1.5, 4]);
  assert.deepEqual([-6, 0, 6, 9].map(accuracyMultiplier), [1 / 3, 1, 3, 3]);
  assert.equal(criticalChance(scratch, false), 1 / 16);
  assert.equal(criticalChance(MOVES_BY_ID.percee, false), 1 / 8);
  assert.equal(criticalChance(MOVES_BY_ID.percee, true), 1 / 4);
});

test('moves with null accuracy never miss; evasion lowers the hit chance', () => {
  const stages = freshStages();
  assert.equal(rollHit(MOVES_BY_ID.eclat_astral, stages, { ...stages, eva: 6 }, constantRng(0.99)), true);
  assert.equal(rollHit(scratch, stages, stages, constantRng(0.9)), true);
  assert.equal(rollHit(scratch, stages, { ...stages, eva: 1 }, constantRng(0.9)), false); // 100 × 3/4 = 75
});

test('paralysis divides speed by 4', () => {
  const creature = { stats: { spe: 101 }, status: { id: 'par' } };
  assert.equal(effectiveSpeed(creature, freshStages()), 25);
  assert.equal(effectiveSpeed({ ...creature, status: null }, { ...freshStages(), spe: 1 }), 151);
});

test('createCreature: stats from the formulas, full HP, last four learned moves', () => {
  const creature = createCreature('pivelin', 20, createRng(3), { genes: ZERO_GENES });
  const base = CREATURES_BY_ID.pivelin.baseStats;
  assert.equal(creature.stats.hp, computeHp(base.hp, 0, 0, 20));
  assert.equal(creature.stats.spe, computeStat(base.spe, 0, 0, 20));
  assert.equal(creature.hp, creature.stats.hp);
  assert.deepEqual(creature.moves.map((slot) => slot.id), defaultMoves('pivelin', 20));
  assert.ok(creature.moves.length <= 4);
  assert.ok(creature.moves.every((slot) => slot.pp === slot.maxPp && slot.pp === MOVES_BY_ID[slot.id].pp));
});

test('recalculating stats moves current HP by the change of max HP', () => {
  const creature = createCreature('pivelin', 20, createRng(3), { genes: ZERO_GENES });
  creature.hp -= 10;
  const before = creature.stats.hp;
  creature.level = 30;
  recalculateStats(creature);
  assert.equal(creature.hp, creature.stats.hp - 10);
  assert.ok(creature.stats.hp > before);
});

test('evolveCreature changes the species, keeps moves, raises stats', () => {
  const creature = createCreature('pivelin', 20, createRng(3), { genes: ZERO_GENES });
  const moves = creature.moves.map((slot) => slot.id);
  const attack = creature.stats.atk;
  evolveCreature(creature, 'grivelin');
  assert.equal(creature.species, 'grivelin');
  assert.deepEqual(creature.moves.map((slot) => slot.id), moves);
  assert.ok(creature.stats.atk > attack);
});
