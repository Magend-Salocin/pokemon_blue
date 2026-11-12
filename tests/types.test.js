import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TYPE_CHART, TYPE_IDS, getEffectiveness, getTypeMultiplier } from '../src/data/types.js';
import { TYPE_RULES, typeBalance } from '../tools/validators/types.js';

test('there are 15 types, each with a chart row', () => {
  assert.equal(TYPE_IDS.length, 15);
  assert.deepEqual(Object.keys(TYPE_CHART).sort(), [...TYPE_IDS].sort());
});

test('intuitive relations from the game design', () => {
  assert.equal(getTypeMultiplier('eau', 'feu'), 2);
  assert.equal(getTypeMultiplier('feu', 'flore'), 2);
  assert.equal(getTypeMultiplier('flore', 'eau'), 2);
  assert.equal(getTypeMultiplier('foudre', 'eau'), 2);
  assert.equal(getTypeMultiplier('terre', 'foudre'), 2);
  assert.equal(getTypeMultiplier('givre', 'vent'), 2);
});

test('resistances, immunities and neutral pairs', () => {
  assert.equal(getTypeMultiplier('feu', 'eau'), 0.5);
  assert.equal(getTypeMultiplier('foudre', 'terre'), 0);
  assert.equal(getTypeMultiplier('normal', 'ombre'), 0);
  assert.equal(getTypeMultiplier('normal', 'feu'), 1);
});

test('dual types multiply', () => {
  assert.equal(getEffectiveness('eau', ['feu', 'roche']), 4);
  assert.equal(getEffectiveness('feu', ['flore', 'eau']), 1);
  assert.equal(getEffectiveness('foudre', ['eau', 'terre']), 0);
  assert.equal(getEffectiveness('givre', ['feu', 'metal']), 0.25);
});

test('unknown attack type throws', () => {
  assert.throws(() => getTypeMultiplier('dragon', 'feu'));
});

test('balance constraints of section 5', () => {
  const immunities = Object.values(TYPE_CHART).reduce((sum, row) => sum + row.none.length, 0);
  assert.ok(immunities <= TYPE_RULES.maxImmunities, `${immunities} immunités`);
  for (const [type, { strengths, weaknesses, balance }] of Object.entries(typeBalance(TYPE_CHART))) {
    assert.ok(strengths >= 2, `${type} : ${strengths} forces`);
    assert.ok(weaknesses >= 2, `${type} : ${weaknesses} faiblesses`);
    assert.ok(Math.abs(balance) <= 3, `${type} : solde ${balance}`);
  }
});
