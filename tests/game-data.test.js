import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CREATURES, CREATURES_BY_ID } from '../src/data/creatures.js';
import { ITEMS } from '../src/data/items.js';
import { MOVES } from '../src/data/moves.js';
import { loadGameData } from '../tools/validators/game-data.js';
import { checkEvolutions, evolutionsOf } from '../tools/validators/evolutions.js';
import { runCheckers } from '../tools/validators/index.js';
import { findForbiddenWords } from '../tools/validators/texts.js';

const data = loadGameData();

test('every data checker passes', () => {
  for (const { name, errors } of runCheckers(data)) {
    assert.deepEqual(errors, [], `${name} :\n${errors.join('\n')}`);
  }
});

test('content volumes match the game design', () => {
  assert.equal(CREATURES.length, 150);
  assert.ok(MOVES.length >= 155 && MOVES.length <= 175, `${MOVES.length} attaques`);
  assert.ok(ITEMS.length >= 40 && ITEMS.length <= 50, `${ITEMS.length} objets`);
});

test('starters, legendaries and mythical have the numbers of the game design', () => {
  const starters = ['fenouillot', 'fenouvert', 'sylvenard', 'braisille', 'fournaise', 'pyrogrue', 'flaquin', 'ondeclat', 'marevor'];
  starters.forEach((id, index) => assert.equal(CREATURES_BY_ID[id].number, index + 1));
  ['azurel', 'glacerne', 'volcarde', 'fulgorine', 'mirelle'].forEach((id, index) => {
    assert.equal(CREATURES_BY_ID[id].number, 146 + index);
    assert.equal(CREATURES_BY_ID[id].evolution, null);
  });
});

test('evolution levels increase along each line', () => {
  for (const creature of CREATURES) {
    for (const evolution of evolutionsOf(creature)) {
      if (evolution.method !== 'level') continue;
      for (const next of evolutionsOf(CREATURES_BY_ID[evolution.to])) {
        if (next.method === 'level') assert.ok(next.value > evolution.value, `${creature.id} → ${evolution.to} → ${next.to}`);
      }
    }
  }
});

test('evolution checker detects a cycle and a decreasing level', () => {
  const base = (id, number, evolution) => ({
    id, number, evolution, minLevel: 30, baseStats: { hp: 50 + number, atk: 50, def: 50, spa: 50, spd: 50, spe: 50 },
  });
  const cycle = { ...data, creatures: [base('a', 1, { to: 'b', method: 'level', value: 30 }), base('b', 2, { to: 'a', method: 'level', value: 40 })] };
  assert.ok(checkEvolutions(cycle).length > 0);
  const decreasing = {
    ...data,
    creatures: [
      base('a', 1, { to: 'b', method: 'level', value: 30 }),
      base('b', 2, { to: 'c', method: 'level', value: 20 }),
      base('c', 3, null),
    ],
  };
  assert.ok(checkEvolutions(decreasing).some((error) => error.includes('non croissant')));
});

test('forbidden words match regardless of case and accents', () => {
  assert.deepEqual(findForbiddenWords('Le POKÉDEX est plein'), ['pokedex']);
  assert.deepEqual(findForbiddenWords('Un Super Bonbon'), ['super bonbon']);
  assert.deepEqual(findForbiddenWords('Une capsule et un Bestiaire'), []);
});
