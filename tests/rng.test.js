import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRng } from '../src/engine/rng.js';

function sequence(rng, count) {
  return Array.from({ length: count }, () => rng.next());
}

test('same seed gives the same sequence', () => {
  assert.deepEqual(sequence(createRng(42), 100), sequence(createRng(42), 100));
});

test('different seeds give different sequences', () => {
  assert.notDeepEqual(sequence(createRng(1), 10), sequence(createRng(2), 10));
});

test('state can be saved and restored', () => {
  const rng = createRng(7);
  rng.next();
  const state = rng.getState();
  const expected = sequence(rng, 5);
  rng.setState(state);
  assert.deepEqual(sequence(rng, 5), expected);
});

test('next() stays in [0, 1)', () => {
  const rng = createRng(123);
  for (const value of sequence(rng, 10000)) {
    assert.ok(value >= 0 && value < 1);
  }
});

test('int() is inclusive on both bounds and reaches them', () => {
  const rng = createRng(99);
  const seen = new Set();
  for (let i = 0; i < 2000; i += 1) {
    const value = rng.int(3, 7);
    assert.ok(Number.isInteger(value) && value >= 3 && value <= 7);
    seen.add(value);
  }
  assert.deepEqual([...seen].sort(), [3, 4, 5, 6, 7]);
  assert.equal(rng.int(5, 5), 5);
});

test('int() rejects invalid bounds', () => {
  const rng = createRng(1);
  assert.throws(() => rng.int(5, 4), RangeError);
  assert.throws(() => rng.int(0.5, 4), RangeError);
});

test('chance() respects 0 and 1', () => {
  const rng = createRng(5);
  for (let i = 0; i < 1000; i += 1) {
    assert.equal(rng.chance(0), false);
    assert.equal(rng.chance(1), true);
  }
});

test('pick() returns an element of the array', () => {
  const rng = createRng(8);
  const items = ['a', 'b', 'c'];
  for (let i = 0; i < 100; i += 1) assert.ok(items.includes(rng.pick(items)));
  assert.throws(() => rng.pick([]), RangeError);
});

test('weighted() never returns zero-weight entries and follows weights', () => {
  const rng = createRng(2024);
  const entries = [
    { value: 'rare', weight: 1 },
    { value: 'never', weight: 0 },
    { value: 'common', weight: 9 },
  ];
  const counts = { rare: 0, never: 0, common: 0 };
  for (let i = 0; i < 10000; i += 1) counts[rng.weighted(entries).value] += 1;

  assert.equal(counts.never, 0);
  assert.ok(counts.common > counts.rare * 6, JSON.stringify(counts));
});

test('weighted() rejects empty or zero total weight', () => {
  const rng = createRng(3);
  assert.throws(() => rng.weighted([]), RangeError);
  assert.throws(() => rng.weighted([{ weight: 0 }]), RangeError);
});
