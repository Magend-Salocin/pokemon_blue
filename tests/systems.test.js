import { test } from 'node:test';
import assert from 'node:assert/strict';
import { expForLevel } from '../src/data/formulas.js';
import {
  MAX_ITEM_COUNT, addCreature, addItem, createGameState, itemCount, removeItem,
} from '../src/state/game-state.js';
import {
  BOX_SIZE, deposit, moveCreature, releaseCreature, renameBox, storedCount, withdraw,
} from '../src/state/storage.js';
import { fieldItemProblem, fieldItemTarget, stoneEvolution, useItemOnCreature, useRepel } from '../src/state/field-items.js';
import { availableStock, buyItem, maxBuyable, sellItem, sellPrice } from '../src/state/shop.js';
import { daycareCost, daycareStep, depositInDaycare, withdrawFromDaycare } from '../src/state/daycare.js';
import { tradeCreature } from '../src/state/trade.js';
import { makeCreature } from './helpers/battle.js';
import { createRng } from '../src/engine/rng.js';

const creature = (species = 'pivelin', level = 10) => makeCreature(species, level, ['souffle']);

// ---- Inventory ------------------------------------------------------------------

test('inventory: add up to 99, remove only what exists', () => {
  const state = createGameState();
  assert.equal(addItem(state, 'potion', 60), 60);
  assert.equal(addItem(state, 'potion', 60), 39);
  assert.equal(itemCount(state, 'potion'), MAX_ITEM_COUNT);
  assert.equal(removeItem(state, 'potion', 100), false);
  assert.equal(removeItem(state, 'potion', 99), true);
  assert.equal(state.bag.potion, undefined);
});

// ---- Storage ---------------------------------------------------------------------

test('storage: deposit keeps at least one healthy creature in the party', () => {
  const state = createGameState();
  state.party = [creature(), creature('musaraille')];
  state.party[1].hp = 0;
  assert.equal(deposit(state, 0, 0), 'last_healthy');
  assert.equal(deposit(state, 1, 0), null);
  assert.equal(state.storage.boxes[0].creatures.length, 1);
  assert.equal(state.party.length, 1);
});

test('storage: withdraw needs room in the party, boxes hold 30', () => {
  const state = createGameState();
  state.party = Array.from({ length: 6 }, () => creature());
  state.storage.boxes[0].creatures.push(creature('musaraille'));
  assert.equal(withdraw(state, 0, 0, 6), 'party_full');
  state.party.pop();
  assert.equal(withdraw(state, 0, 0, 6), null);
  assert.equal(state.party.at(-1).species, 'musaraille');
  state.storage.boxes[1].creatures = Array.from({ length: BOX_SIZE }, () => creature());
  state.storage.boxes[0].creatures.push(creature());
  assert.equal(moveCreature(state.storage, 0, 0, 1), 'box_full');
  assert.equal(moveCreature(state.storage, 0, 0, 2), null);
});

test('storage: release, rename, overflow of a full party goes to the boxes', () => {
  const state = createGameState();
  state.party = Array.from({ length: 6 }, () => creature());
  assert.equal(addCreature(state, creature('noctule')), 'storage');
  assert.equal(storedCount(state.storage), 1);
  assert.equal(releaseCreature(state.storage, 0, 0), null);
  assert.equal(storedCount(state.storage), 0);
  renameBox(state.storage, 0, '  Favoris  ');
  assert.equal(state.storage.boxes[0].name, 'Favoris');
  renameBox(state.storage, 0, '');
  assert.equal(state.storage.boxes[0].name, 'Favoris');
});

// ---- Field items -----------------------------------------------------------------------

test('field items: targets and problems', () => {
  assert.equal(fieldItemTarget('potion'), 'creature');
  assert.equal(fieldItemTarget('infusion'), 'move');
  assert.equal(fieldItemTarget('repulsif'), 'none');
  const healthy = creature();
  assert.equal(fieldItemProblem('potion', healthy), 'hp_full');
  assert.equal(fieldItemProblem('capsule', healthy), 'not_here');
  assert.equal(fieldItemProblem('pierre_lunaire', healthy), 'no_effect');
});

test('field items: potion heals and is consumed', () => {
  const state = createGameState();
  state.party = [creature()];
  state.party[0].hp = 1;
  addItem(state, 'potion', 2);
  const result = useItemOnCreature(state, 'potion', 0);
  assert.equal(result.events[0].type, 'heal');
  assert.equal(state.bag.potion, 1);
});

test('field items: evolution stone gives the target species', () => {
  const state = createGameState();
  state.party = [makeCreature('lumidanse', 25, ['lueur'])];
  addItem(state, 'pierre_lunaire');
  assert.equal(stoneEvolution(state.party[0], 'pierre_lunaire'), 'lumirande');
  assert.equal(useItemOnCreature(state, 'pierre_lunaire', 0).evolution, 'lumirande');
  assert.equal(state.bag.pierre_lunaire, undefined);
});

test('field items: Sucre d’Orge raises one level; vitamins add training up to 100', () => {
  const state = createGameState();
  state.party = [makeCreature('musaraille', 17, ['egratignure', 'regard_dur', 'elan_vif', 'repli'])];
  addItem(state, 'sucre_dorge');
  const result = useItemOnCreature(state, 'sucre_dorge', 0);
  assert.equal(state.party[0].level, 18);
  assert.equal(state.party[0].exp, expForLevel('fast', 18));
  assert.deepEqual(result.learnPrompts, ['tambourin']);
  addItem(state, 'poudre_force', 12);
  for (let i = 0; i < 10; i += 1) useItemOnCreature(state, 'poudre_force', 0);
  assert.equal(state.party[0].training.atk, 100);
  assert.equal(useItemOnCreature(state, 'poudre_force', 0).problem, 'no_effect');
});

test('field items: a repel only starts when none is active', () => {
  const state = createGameState();
  addItem(state, 'repulsif', 2);
  assert.equal(useRepel(state, 'repulsif'), true);
  assert.equal(state.repelSteps, 100);
  assert.equal(useRepel(state, 'repulsif'), false);
  assert.equal(state.bag.repulsif, 1);
});

// ---- Comptoir --------------------------------------------------------------------------

test('Comptoir: prices, missing money, the 99 limit, selling at half price', () => {
  const state = createGameState({ money: 1000 });
  assert.equal(maxBuyable(state, 'potion'), 5);
  assert.equal(buyItem(state, 'potion', 6), 'money');
  assert.equal(buyItem(state, 'potion', 5), null);
  assert.equal(state.money, 0);
  assert.equal(sellPrice('potion'), 100);
  assert.equal(sellItem(state, 'potion', 2), null);
  assert.equal(state.money, 200);
  assert.equal(sellItem(state, 'machette', 1), 'not_sellable');
  state.money = 999999;
  addItem(state, 'antidote', 98);
  assert.equal(buyItem(state, 'antidote', 2), 'bag_full');
  assert.deepEqual(availableStock([{ item: 'potion' }, { item: 'super_capsule', badge: 'eau' }], state), ['potion']);
});

// ---- Pension and trades --------------------------------------------------------------------

test('Pension: gains XP per step, learns moves alone, costs 100 + 100 per level', () => {
  const state = createGameState({ money: 1000 });
  state.party = [creature(), makeCreature('musaraille', 17, ['egratignure', 'regard_dur', 'elan_vif', 'repli'])];
  state.party[1].exp = expForLevel('fast', 18) - 1;
  assert.equal(depositInDaycare(state, 1), null);
  assert.equal(depositInDaycare(state, 0), 'occupied');
  assert.equal(daycareStep(state), 1);
  assert.equal(state.daycare.creature.moves.at(-1).id, 'tambourin');
  assert.equal(state.daycare.creature.moves[0].id, 'regard_dur');
  assert.equal(daycareCost(state), 200);
  assert.equal(withdrawFromDaycare(state), null);
  assert.equal(state.money, 800);
  assert.equal(state.party.length, 2);
});

test('trade: only the wanted species, the received creature keeps its nickname and trainer', () => {
  const state = createGameState();
  state.party = [creature('pivelin')];
  const offer = { creature: 'noctule', level: 12, nickname: 'Pipistrou', originalTrainer: 'Marius' };
  assert.equal(tradeCreature(state, 0, 'musaraille', offer, createRng(1)).error, 'wrong_species');
  const { received } = tradeCreature(state, 0, 'pivelin', offer, createRng(1));
  assert.equal(state.party[0], received);
  assert.deepEqual([received.species, received.nickname, received.originalTrainer], ['noctule', 'Pipistrou', 'Marius']);
  assert.ok(state.bestiary.caught.noctule);
});
