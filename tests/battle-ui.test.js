import { test } from 'node:test';
import assert from 'node:assert/strict';
import { battleBagContents } from '../src/battle/ui/bag-screen.js';
import { BATTLE_TEXTS } from '../src/data/texts/battle-fr.js';
import { barFill, hpColor, hpText } from '../src/ui/creature-widgets.js';
import { showsNewForm } from '../src/ui/evolution-scene.js';
import { moveCursor, scrollOffset } from '../src/ui/menu-cursor.js';
import { NAME_MAX_LENGTH, applyNameCell } from '../src/ui/name-entry.js';
import { createGameState, addCreature, healParty, markSeen } from '../src/state/game-state.js';
import { makeCreature } from './helpers/battle.js';

function pressed(...buttons) {
  return { repeat: (button) => buttons.includes(button), justPressed: () => false, isDown: () => false };
}

test('HP bar color thresholds: > 50 %, > 20 %, ≤ 20 %', () => {
  assert.equal(hpColor(51, 100), 'high');
  assert.equal(hpColor(50, 100), 'mid');
  assert.equal(hpColor(21, 100), 'mid');
  assert.equal(hpColor(20, 100), 'low');
});

test('bar fill keeps one pixel while HP > 0', () => {
  assert.equal(barFill(1, 400, 48), 1);
  assert.equal(barFill(0, 40, 48), 0);
  assert.equal(barFill(20, 40, 48), 24);
  assert.equal(hpText(7.2, 45), '  8/ 45');
});

test('menu cursor: rows, columns and wrapping', () => {
  assert.equal(moveCursor(0, 4, pressed('right'), { columns: 2 }), 1);
  assert.equal(moveCursor(1, 4, pressed('down'), { columns: 2 }), 3);
  assert.equal(moveCursor(0, 4, pressed('up'), { columns: 2 }), 2);
  assert.equal(moveCursor(0, 3, pressed('up')), 2);
  assert.equal(moveCursor(0, 3, pressed('up'), { wrap: false }), 0);
  assert.equal(scrollOffset(0, 6, 5), 2);
  assert.equal(scrollOffset(3, 1, 5), 1);
});

test('name entry: typing, erasing, length limit, finishing', () => {
  assert.deepEqual(applyNameCell('Ab', 'c'), { name: 'Abc', finished: false });
  assert.deepEqual(applyNameCell('Abc', 'EFF'), { name: 'Ab', finished: false });
  assert.deepEqual(applyNameCell('Abc', 'FIN'), { name: 'Abc', finished: true });
  const full = 'É'.repeat(NAME_MAX_LENGTH);
  assert.equal(applyNameCell(full, 'x').name, full);
});

test('battle bag lists only battle items, by pocket', () => {
  const contents = battleBagContents({ potion: 2, capsule: 5, machette: 1, repulsif: 3, sucre_dorge: 1, antidote: 0 });
  assert.deepEqual(contents.items, [{ id: 'potion', count: 2 }]);
  assert.deepEqual(contents.capsules, [{ id: 'capsule', count: 5 }]);
});

test('evolution alternation speeds up', () => {
  const switches = (from, to) => {
    let count = 0;
    let previous = showsNewForm(from);
    for (let t = from; t < to; t += 0.01) {
      const current = showsNewForm(t);
      if (current !== previous) count += 1;
      previous = current;
    }
    return count;
  };
  assert.ok(switches(3, 4) > switches(0, 1) * 3);
});

test('game state: party then storage, bestiary, healing', () => {
  const state = createGameState();
  markSeen(state, 'pivelin');
  assert.deepEqual(state.bestiary.caught, {});
  for (let i = 0; i < 6; i += 1) assert.equal(addCreature(state, makeCreature('pivelin', 5, ['souffle'])), 'party');
  assert.equal(addCreature(state, makeCreature('musaraille', 5, ['egratignure'])), 'storage');
  assert.equal(state.storage.length, 1);
  assert.ok(state.bestiary.caught.musaraille && state.bestiary.seen.musaraille);
  state.party[0].hp = 0;
  state.party[0].status = { id: 'psn' };
  state.party[0].moves[0].pp = 0;
  healParty(state);
  assert.deepEqual([state.party[0].hp, state.party[0].status, state.party[0].moves[0].pp], [state.party[0].stats.hp, null, 35]);
});

test('battle texts exist for every status, prevention and capture outcome', () => {
  for (const status of ['brl', 'psn', 'par', 'som', 'gel']) assert.ok(BATTLE_TEXTS[`status_${status}`]);
  for (const reason of ['asleep', 'frozen', 'paralyzed', 'flinch', 'recharging']) assert.ok(BATTLE_TEXTS[`prevented_${reason}`]);
  for (const shakes of [0, 1, 2, 3]) assert.ok(BATTLE_TEXTS[`capture_fail_${shakes}`]);
  for (const reason of ['wake', 'thaw', 'item', 'rest']) assert.ok(BATTLE_TEXTS[`cured_${reason}`]);
});
