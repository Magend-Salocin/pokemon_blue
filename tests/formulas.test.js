import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeHp, computeStat, computeStats, expForLevel, levelForExp } from '../src/data/formulas.js';

test('HP formula, hand-computed', () => {
  // floor((2×45 + 0 + 0) × 5 / 100) + 5 + 10 = floor(4.5) + 15 = 19
  assert.equal(computeHp(45, 0, 0, 5), 19);
  // floor((2×100 + 15 + floor(255/4)) × 50 / 100) + 50 + 10 = floor(139) + 60 = 199
  assert.equal(computeHp(100, 15, 255, 50), 199);
  // floor((2×80 + 10 + 25) × 100 / 100) + 110 = 195 + 110 = 305
  assert.equal(computeHp(80, 10, 100, 100), 305);
});

test('other stats formula, hand-computed', () => {
  // floor((2×50 + 8 + 0) × 10 / 100) + 5 = floor(10.8) + 5 = 15
  assert.equal(computeStat(50, 8, 0, 10), 15);
  // floor((2×130 + 15 + 63) × 100 / 100) + 5 = 338 + 5 = 343
  assert.equal(computeStat(130, 15, 255, 100), 343);
});

test('computeStats fills all six stats with default genes and training', () => {
  const stats = computeStats({ hp: 45, atk: 50, def: 50, spa: 50, spd: 50, spe: 50 }, 5);
  assert.deepEqual(stats, { hp: 19, atk: 10, def: 10, spa: 10, spd: 10, spe: 10 });
});

test('experience curves, hand-computed', () => {
  assert.equal(expForLevel('medium', 1), 0);
  assert.equal(expForLevel('medium', 10), 1000);
  assert.equal(expForLevel('fast', 10), 800);
  assert.equal(expForLevel('slow', 10), 1250);
  assert.equal(expForLevel('fast', 5), 100);
  assert.equal(expForLevel('slow', 7), 428); // floor(5 × 343 / 4)
  assert.equal(expForLevel('medium', 100), 1000000);
  assert.equal(expForLevel('slow', 100), 1250000);
});

test('levelForExp is the inverse of expForLevel', () => {
  assert.equal(levelForExp('medium', 0), 1);
  assert.equal(levelForExp('medium', 999), 9);
  assert.equal(levelForExp('medium', 1000), 10);
  assert.equal(levelForExp('slow', 1250000), 100);
  assert.equal(levelForExp('slow', 99999999), 100);
  for (const growth of ['fast', 'medium', 'slow']) {
    for (let level = 1; level <= 100; level += 1) {
      assert.equal(levelForExp(growth, expForLevel(growth, level)), level);
    }
  }
});

test('unknown growth rate throws', () => {
  assert.throws(() => expForLevel('erratic', 10));
});
