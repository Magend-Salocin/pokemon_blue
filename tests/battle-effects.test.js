import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MOVE_EFFECT_IDS } from '../src/data/move-effects.js';
import { EFFECT_HANDLERS } from '../src/battle/logic/effects/index.js';
import { getAvailableActions } from '../src/battle/logic/engine.js';
import {
  constantRng, enemy, eventsOf, makeBattle, makeCreature, move, player, scriptedRng, turn,
} from './helpers/battle.js';

const IDLE = 'point_focal'; // the enemy's harmless move

/** Turn order draws two values first (speed ties), then the move rolls follow. */
const afterOrder = (values) => scriptedRng([0.5, 0.5, ...values]);

/** Player musaraille (faster) uses `moveId` on enemy lapugil, both level 20 unless overridden. */
function setup(moveId, { attacker = 'musaraille', defender = 'lapugil', level = 20, enemyLevel = level, enemyMoves = [IDLE] } = {}) {
  return makeBattle([makeCreature(attacker, level, [moveId, 'egratignure'])], [makeCreature(defender, enemyLevel, enemyMoves)]);
}

function use(moveId, options = {}, rng = constantRng(0.5)) {
  const state = options.state ?? setup(moveId, options);
  return turn(state, move(0), move(0), rng);
}

test('every move effect has a handler (coverage)', () => {
  const missing = MOVE_EFFECT_IDS.filter((effect) => !EFFECT_HANDLERS[effect]);
  assert.deepEqual(missing, []);
  assert.deepEqual(Object.keys(EFFECT_HANDLERS).filter((effect) => !MOVE_EFFECT_IDS.includes(effect)), []);
});

test('damage: plain hit lowers HP', () => {
  const { state, events } = use('assaut');
  assert.equal(eventsOf(events, 'damage').length, 1);
  assert.ok(enemy(state).hp < enemy(state).stats.hp);
});

test('burn (status move) burns the target', () => {
  const { state, events } = use('braise_lente');
  assert.equal(enemy(state).status.id, 'brl');
  assert.equal(eventsOf(events, 'status_applied')[0].status, 'brl');
});

test('burn (secondary) applies only when the chance roll passes', () => {
  assert.equal(enemy(use('escarbille', {}, constantRng(0.5)).state).status, null); // 50 ≥ 10 %
  assert.equal(enemy(use('escarbille', {}, afterOrder([0.5, 0.5, 0.5, 0.05])).state).status?.id, 'brl');
});

test('poison and bad poison', () => {
  assert.equal(enemy(use('poudre_fiel').state).status.id, 'psn');
  const toxic = enemy(use('toxine').state).status;
  assert.deepEqual([toxic.id, toxic.badly], ['psn', true]);
});

test('paralyze', () => {
  assert.equal(enemy(use('engourdir').state).status.id, 'par');
});

test('sleep lasts 1 to 3 turns', () => {
  const { state } = use('songe_lourd', {}, afterOrder([0.5, 0.99]));
  assert.equal(enemy(state).status.id, 'som');
  assert.ok(enemy(state).status.turns >= 1 && enemy(state).status.turns <= 3);
});

test('freeze (secondary)', () => {
  const { state } = use('gresil', {}, afterOrder([0.5, 0.5, 0.5, 0.05]));
  assert.equal(enemy(state).status.id, 'gel');
});

test('confuse', () => {
  const { state } = use('tournevent', {}, afterOrder([0.5, 0.5, 0.5, 0.05]));
  assert.ok(state.sides[1].volatile.confusion > 0);
});

test('flinch stops a slower target this turn', () => {
  const state = setup('manchette', { enemyMoves: ['egratignure'] });
  const { events } = turn(state, move(0), move(0), afterOrder([0.5, 0.5, 0.5, 0.1]));
  assert.ok(eventsOf(events, 'status_prevented').some((event) => event.side === 1 && event.reason === 'flinch'));
  assert.equal(eventsOf(events, 'move_used').length, 1);
});

test('tri_status inflicts burn, freeze or paralysis', () => {
  const { state } = use('mille_eclats', { attacker: 'mirelle', defender: 'menhirgon', enemyLevel: 60 }, afterOrder([0.5, 0.5, 0.05, 0.9]));
  assert.ok(['brl', 'gel', 'par'].includes(enemy(state).status?.id));
});

test('target_stat_down lowers the target stage', () => {
  const { state } = use('regard_dur');
  assert.equal(state.sides[1].stages.def, -1);
});

test('self_stat_up raises the user stage and stops at +6', () => {
  let { state } = use('gonflette');
  assert.equal(state.sides[0].stages.atk, 2);
  for (let i = 0; i < 3; i += 1) state = turn(state, move(0)).state;
  const { events } = turn(state, move(0));
  assert.equal(state.sides[0].stages.atk, 6);
  assert.ok(eventsOf(events, 'stat_change').some((event) => event.blocked));
});

test('self_stat_down lowers the user after the hit', () => {
  const { state } = use('coup_decisif');
  assert.deepEqual([state.sides[0].stages.def, state.sides[0].stages.spd], [-1, -1]);
});

test('multi_hit hits 2 to 5 times', () => {
  const { events } = use('tambourin', {}, afterOrder([0.5, 0.95]));
  assert.equal(eventsOf(events, 'hits')[0].count, 5);
  assert.equal(eventsOf(events, 'damage').filter((event) => event.side === 1).length, 5);
});

test('recoil hurts the user by a fraction of the damage', () => {
  const { events } = use('ruee_brasier', { level: 40, enemyLevel: 50 });
  const dealt = eventsOf(events, 'damage').find((event) => event.side === 1).amount;
  const recoil = eventsOf(events, 'damage').find((event) => event.source === 'recoil');
  assert.equal(recoil.amount, Math.floor(dealt / 3));
});

test('drain heals the user by half the damage', () => {
  const state = setup('seve_volee');
  state.sides[0].party[0].hp = 10;
  const { events } = turn(state, move(0));
  const dealt = eventsOf(events, 'damage').find((event) => event.side === 1).amount;
  assert.equal(eventsOf(events, 'heal')[0].amount, Math.max(1, Math.floor(dealt / 2)));
});

test('dream_drain fails on an awake target and drains a sleeping one', () => {
  assert.equal(eventsOf(use('songe_avide').events, 'move_failed')[0].reason, 'target_awake');
  const state = setup('songe_avide', { level: 30 });
  state.sides[1].party[0].status = { id: 'som', turns: 3 };
  state.sides[0].party[0].hp = 5;
  assert.ok(eventsOf(turn(state, move(0)).events, 'heal').length === 1);
});

test('heal_half restores half the max HP and fails at full HP', () => {
  assert.equal(eventsOf(use('pansement').events, 'move_failed')[0].reason, 'hp_full');
  const state = setup('pansement');
  const creature = state.sides[0].party[0];
  creature.hp = 1;
  assert.equal(eventsOf(turn(state, move(0)).events, 'heal')[0].amount, Math.floor(creature.stats.hp / 2));
});

test('rest heals fully and sleeps 2 turns', () => {
  const state = setup('sieste');
  state.sides[0].party[0].hp = 3;
  const after = turn(state, move(0)).state;
  assert.equal(player(after).hp, player(after).stats.hp);
  assert.deepEqual(player(after).status, { id: 'som', turns: 2 });
});

test('protect blocks the opponent move this turn', () => {
  const state = setup('repli', { enemyMoves: ['assaut'] });
  const { events } = turn(state, move(0), move(0));
  assert.equal(eventsOf(events, 'protected').length, 1);
  assert.equal(player(turn(state, move(0)).state).hp, player(state).hp);
});

test('charge_turn: charges, is out of reach, then hits on turn 2', () => {
  const state = setup('abysse', { enemyMoves: ['assaut'] });
  const first = turn(state, move(0), move(0));
  assert.equal(eventsOf(first.events, 'charging').length, 1);
  assert.equal(eventsOf(first.events, 'miss').length, 1);
  assert.deepEqual(getAvailableActions(first.state, 0).forced, { type: 'move', index: 0 });
  const second = turn(first.state, move(1), move(0));
  assert.ok(eventsOf(second.events, 'damage').some((event) => event.side === 1 && event.move === 'abysse'));
  assert.equal(player(second.state).moves[0].pp, player(state).moves[0].pp - 1);
});

test('recharge: the user must rest next turn', () => {
  const first = use('onde_brute', { level: 20, enemyLevel: 60, defender: 'menhirgon' });
  assert.deepEqual(getAvailableActions(first.state, 0).forced, { type: 'recharge' });
  const second = turn(first.state, move(0));
  assert.equal(eventsOf(second.events, 'status_prevented')[0].reason, 'recharging');
});

test('fixed_damage, level_damage and half_hp_damage', () => {
  assert.equal(eventsOf(use('frappe_nette', { enemyLevel: 50 }).events, 'damage')[0].amount, 40);
  assert.equal(eventsOf(use('onde_mentale', { enemyLevel: 50 }).events, 'damage')[0].amount, 20);
  const state = setup('rongement', { enemyLevel: 50 });
  assert.equal(eventsOf(turn(state, move(0)).events, 'damage')[0].amount, Math.floor(enemy(state).hp / 2));
});

test('ohko knocks out a lower level target and fails against a higher one', () => {
  const hit = use('prise_fatale', { level: 30, enemyLevel: 20 }, afterOrder([0.1]));
  assert.equal(enemy(hit.state).hp, 0);
  assert.equal(eventsOf(hit.events, 'ohko').length, 1);
  const fail = use('prise_fatale', { level: 20, enemyLevel: 30 });
  assert.equal(eventsOf(fail.events, 'move_failed')[0].reason, 'level_too_low');
});

test('trap: damage at end of turn and no switching or running', () => {
  const state = makeBattle([makeCreature('musaraille', 20, ['egratignure']), makeCreature('pivelin', 20, ['egratignure'])],
    [makeCreature('anguilet', 20, ['remous'])]);
  const { state: after, events } = turn(state, move(0), move(0), scriptedRng([0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5]));
  assert.ok(after.sides[0].volatile.trap);
  assert.ok(eventsOf(events, 'damage').some((event) => event.source === 'trap'));
  const actions = getAvailableActions(after, 0);
  assert.deepEqual([actions.canSwitch, actions.canRun], [false, false]);
});

test('self_destruct knocks out the user', () => {
  const { state } = use('implosion', { enemyLevel: 60, defender: 'menhirgon' });
  assert.equal(player(state).hp, 0);
});

test('leech drains the target at the end of each turn, never a Flore target', () => {
  const state = setup('germe_voleur');
  state.sides[0].party[0].hp = 5;
  const { events } = turn(state, move(0));
  assert.ok(eventsOf(events, 'damage').some((event) => event.source === 'leech' && event.side === 1));
  assert.ok(eventsOf(events, 'heal').some((event) => event.source === 'leech' && event.side === 0));
  assert.equal(eventsOf(use('germe_voleur', { defender: 'faonille' }).events, 'move_failed').length, 1);
});

test('counter returns twice the physical damage received this turn', () => {
  const state = setup('contre_coup', { enemyMoves: ['assaut'], level: 30 });
  const { events } = turn(state, move(0), move(0));
  const received = eventsOf(events, 'damage').find((event) => event.side === 0).amount;
  const returned = eventsOf(events, 'damage').find((event) => event.side === 1).amount;
  assert.equal(returned, Math.min(received * 2, enemy(state).hp));
  assert.equal(eventsOf(use('contre_coup').events, 'move_failed')[0].reason, 'nothing_to_counter');
});

test('haze resets every stage', () => {
  const state = setup('grand_air');
  state.sides[0].stages.atk = 3;
  state.sides[1].stages.def = -2;
  const after = turn(state, move(0)).state;
  assert.equal(after.sides[0].stages.atk, 0);
  assert.equal(after.sides[1].stages.def, 0);
});

test('crit_up raises the critical rate once', () => {
  const { state } = use('point_focal');
  assert.equal(state.sides[0].volatile.critUp, true);
  assert.equal(eventsOf(turn(state, move(0)).events, 'move_failed').length >= 1, true);
});

test('screen halves physical damage for 5 turns', () => {
  const { state, events } = use('mur_de_givre');
  assert.equal(state.sides[0].screens.physical, 4); // 5, minus the end of this turn
  assert.equal(eventsOf(events, 'screen_up').length, 1);
});

test('rampage locks the move for 2-3 turns, then confuses the user', () => {
  const state = setup('frenesie', { level: 20, enemyLevel: 70, defender: 'menhirgon' });
  let current = turn(state, move(0), move(0), constantRng(0.99)).state;
  assert.ok(current.sides[0].volatile.rampage);
  let confused = false;
  for (let i = 0; i < 3 && !confused; i += 1) {
    const result = turn(current, move(1), move(0), constantRng(0.99));
    current = result.state;
    confused = eventsOf(result.events, 'volatile_applied').some((event) => event.volatile === 'confusion');
  }
  assert.ok(confused);
  assert.equal(current.sides[0].volatile.rampage, null);
});

test('struggle (Baroud) when no PP left, with recoil', () => {
  const state = setup('egratignure');
  state.sides[0].party[0].moves.forEach((slot) => { slot.pp = 0; });
  assert.deepEqual(getAvailableActions(state, 0).forced, { type: 'struggle' });
  const { events } = turn(state, move(0));
  assert.equal(eventsOf(events, 'move_used')[0].move, 'baroud');
  assert.ok(eventsOf(events, 'damage').some((event) => event.source === 'struggle' && event.side === 0));
});
