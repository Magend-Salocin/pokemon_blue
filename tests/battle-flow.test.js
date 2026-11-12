import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { CREATURES_BY_ID } from '../src/data/creatures.js';
import { expForLevel } from '../src/data/formulas.js';
import { aiLevel, chooseAction } from '../src/battle/logic/ai.js';
import { attemptCapture, captureValue } from '../src/battle/logic/capture.js';
import {
  answerLearnMove, chooseSwitch, currentPending, resolveTurn,
} from '../src/battle/logic/engine.js';
import { experienceYield, gainExperience } from '../src/battle/logic/experience.js';
import { createRng } from '../src/engine/rng.js';
import {
  constantRng, enemy, eventsOf, makeBattle, makeCreature, move, player, scriptedRng, turn,
} from './helpers/battle.js';

const TRAINER = { id: 't', class: 'gamin', name: 'Léo', moneyBase: 15 };
const idleEnemy = (species = 'lapugil', level = 20) => makeCreature(species, level, ['point_focal']);

// ---- Statuses ---------------------------------------------------------------

test('burn and poison: 1/8 of max HP at the end of the turn', () => {
  const state = makeBattle([makeCreature('musaraille', 20, ['regard_dur'])], [idleEnemy()]);
  state.sides[1].party[0].status = { id: 'brl' };
  const { events } = turn(state, move(0));
  const damage = eventsOf(events, 'status_damage')[0];
  assert.equal(damage.amount, Math.floor(enemy(state).stats.hp / 8));
});

test('bad poison grows by 1/16 each turn', () => {
  let state = makeBattle([makeCreature('musaraille', 20, ['regard_dur'])], [idleEnemy('lapugil', 40)]);
  state.sides[1].party[0].status = { id: 'psn', badly: true, counter: 1 };
  const max = enemy(state).stats.hp;
  const first = turn(state, move(0));
  const second = turn(first.state, move(0));
  assert.equal(eventsOf(first.events, 'status_damage')[0].amount, Math.floor(max / 16));
  assert.equal(eventsOf(second.events, 'status_damage')[0].amount, Math.floor((max * 2) / 16));
});

test('sleep skips the given number of turns, then the creature wakes and acts', () => {
  let state = makeBattle([makeCreature('musaraille', 20, ['regard_dur'])], [makeCreature('lapugil', 20, ['egratignure'])]);
  state.sides[1].party[0].status = { id: 'som', turns: 2 };
  const reasons = [];
  for (let i = 0; i < 3; i += 1) {
    const result = turn(state, move(0));
    state = result.state;
    reasons.push(eventsOf(result.events, 'move_used').some((event) => event.side === 1) ? 'acted' : 'slept');
  }
  assert.deepEqual(reasons, ['slept', 'slept', 'acted']);
  assert.equal(enemy(state).status, null);
});

test('freeze: 20 % chance to thaw each turn', () => {
  const frozen = () => {
    const state = makeBattle([makeCreature('musaraille', 20, ['regard_dur'])], [makeCreature('lapugil', 20, ['egratignure'])]);
    state.sides[1].party[0].status = { id: 'gel' };
    return state;
  };
  // Draws: 2 order ties, player accuracy, then the enemy thaw roll.
  const stays = turn(frozen(), move(0), move(0), scriptedRng([0.5, 0.5, 0.5, 0.5]));
  assert.equal(enemy(stays.state).status.id, 'gel');
  const thaws = turn(frozen(), move(0), move(0), scriptedRng([0.5, 0.5, 0.5, 0.1]));
  assert.equal(enemy(thaws.state).status, null);
});

test('paralysis: 25 % chance to lose the turn', () => {
  const paralyzed = () => {
    const state = makeBattle([makeCreature('musaraille', 20, ['regard_dur'])], [makeCreature('lapugil', 20, ['egratignure'])]);
    state.sides[1].party[0].status = { id: 'par' };
    return state;
  };
  const fails = turn(paralyzed(), move(0), move(0), scriptedRng([0.5, 0.5, 0.5, 0.1]));
  assert.equal(eventsOf(fails.events, 'status_prevented')[0].reason, 'paralyzed');
  const acts = turn(paralyzed(), move(0), move(0), scriptedRng([0.5, 0.5, 0.5, 0.5]));
  assert.equal(eventsOf(acts.events, 'move_used').length, 2);
});

test('confusion: may hit itself with a 40-power typeless attack', () => {
  const state = makeBattle([makeCreature('musaraille', 20, ['regard_dur'])], [makeCreature('lapugil', 20, ['egratignure'])]);
  state.sides[1].volatile.confusion = 3;
  const { events } = turn(state, move(0), move(0), scriptedRng([0.5, 0.5, 0.5, 0.1]));
  assert.equal(eventsOf(events, 'confusion_hit').length, 1);
  assert.ok(eventsOf(events, 'damage').some((event) => event.source === 'confusion' && event.side === 1));
});

test('type immunities to statuses (Feu cannot be burned)', () => {
  const state = makeBattle([makeCreature('musaraille', 20, ['braise_lente'])], [idleEnemy('braisille')]);
  const { events } = turn(state, move(0));
  assert.equal(eventsOf(events, 'move_failed')[0].reason, 'no_effect');
  assert.equal(enemy(state).status, null);
});

// ---- Turn order -----------------------------------------------------------------

test('the faster creature moves first', () => {
  const state = makeBattle([makeCreature('musaraille', 50, ['egratignure'])], [makeCreature('caillotin', 50, ['gravillons'])]);
  const { events } = turn(state, move(0));
  assert.equal(eventsOf(events, 'move_used')[0].side, 0);
});

test('priority beats speed', () => {
  const state = makeBattle([makeCreature('caillotin', 50, ['elan_vif'])], [makeCreature('musaraille', 50, ['egratignure'])]);
  assert.equal(eventsOf(turn(state, move(0)).events, 'move_used')[0].side, 0);
});

test('switches happen before moves', () => {
  const state = makeBattle([makeCreature('caillotin', 50, ['gravillons']), makeCreature('pivelin', 50, ['souffle'])],
    [makeCreature('musaraille', 50, ['egratignure'])]);
  const { events } = turn(state, { type: 'switch', index: 1 });
  assert.equal(events[0].type, 'switch_out');
  assert.equal(eventsOf(events, 'damage')[0].side, 0);
  assert.equal(eventsOf(events, 'switch_in')[0].species, 'pivelin');
});

test('paralysis slows a creature enough to move last', () => {
  const state = makeBattle([makeCreature('musaraille', 50, ['egratignure'])], [makeCreature('caillotin', 50, ['gravillons'])]);
  state.sides[0].party[0].status = { id: 'par' };
  const { events } = turn(state, move(0));
  assert.equal(eventsOf(events, 'move_used')[0].side, 1);
});

test('speed ties are decided at random', () => {
  const twins = () => makeBattle([makeCreature('musaraille', 30, ['egratignure'])], [makeCreature('musaraille', 30, ['egratignure'])]);
  const first = (values) => eventsOf(turn(twins(), move(0), move(0), scriptedRng(values)).events, 'move_used')[0].side;
  assert.equal(first([0.1, 0.9]), 0);
  assert.equal(first([0.9, 0.1]), 1);
});

// ---- Capture and running ------------------------------------------------------------

test('capture value, computed by hand', () => {
  const wild = makeCreature('pivelin', 5, ['souffle']); // catch rate 255
  wild.hp = 1;
  const max = wild.stats.hp;
  const a = ((3 * max - 2) * 255 * 1) / (3 * max);
  assert.equal(captureValue(wild, 1), a);
  wild.status = { id: 'som', turns: 2 };
  assert.equal(captureValue(wild, 1), a * 2);
});

test('capsule maîtresse and a ≥ 255 always catch with 3 shakes', () => {
  const tough = makeCreature('menhirgon', 50, ['gravillons']);
  assert.deepEqual(attemptCapture(tough, { guaranteed: true }, constantRng(0.99)), { caught: true, shakes: 3 });
  const weak = makeCreature('pivelin', 5, ['souffle']);
  weak.hp = 1;
  assert.equal(attemptCapture(weak, { bonus: 2 }, constantRng(0.99)).caught, true);
});

test('capture rate at a fixed seed: easier at low HP and with better capsules', () => {
  const rng = createRng(7);
  const rate = (hp, bonus) => {
    let caught = 0;
    for (let i = 0; i < 1000; i += 1) {
      const wild = makeCreature('salamoue', 20, ['giclee']); // catch rate 190
      wild.hp = Math.max(1, Math.floor(wild.stats.hp * hp));
      if (attemptCapture(wild, { bonus }, rng).caught) caught += 1;
    }
    return caught / 1000;
  };
  const fullHp = rate(1, 1);
  const lowHp = rate(0.05, 1);
  assert.ok(fullHp > 0.2 && fullHp < 0.7, `PV pleins : ${fullHp}`);
  assert.ok(lowHp > fullHp, `${lowHp} > ${fullHp}`);
  assert.ok(rate(1, 2) > fullHp);
});

test('throwing a capsule: shakes then success ends the battle', () => {
  const state = makeBattle([makeCreature('musaraille', 20, ['egratignure'])], [idleEnemy('pivelin', 3)]);
  const { state: after, events } = turn(state, { type: 'item', itemId: 'capsule_maitresse' });
  assert.equal(eventsOf(events, 'capture_shake').length, 3);
  assert.equal(eventsOf(events, 'capture_success').length, 1);
  assert.equal(after.outcome, 'caught');
  assert.equal(enemy(after).caughtIn, 'capsule_maitresse');
});

test('capsules are blocked against a trainer', () => {
  const state = makeBattle([makeCreature('musaraille', 20, ['egratignure'])], [idleEnemy()], { trainer: TRAINER });
  const { state: after, events } = turn(state, { type: 'item', itemId: 'capsule' });
  assert.equal(eventsOf(events, 'capture_blocked').length, 1);
  assert.equal(after.outcome, null);
});

test('running: a much faster creature escapes; impossible against a trainer', () => {
  const wild = makeBattle([makeCreature('musaraille', 50, ['egratignure'])], [idleEnemy('caillotin', 5)]);
  const fled = turn(wild, { type: 'run' });
  assert.equal(fled.state.outcome, 'fled');
  assert.equal(eventsOf(fled.events, 'run_success').length, 1);
  const trainer = makeBattle([makeCreature('musaraille', 50, ['egratignure'])], [idleEnemy()], { trainer: TRAINER });
  const blocked = turn(trainer, { type: 'run' });
  assert.equal(eventsOf(blocked.events, 'run_blocked')[0].reason, 'trainer');
  assert.equal(blocked.state.outcome, null);
});

test('running fails more rarely after each attempt', () => {
  const state = makeBattle([makeCreature('caillotin', 10, ['gravillons'])], [makeCreature('musaraille', 40, ['regard_dur'])]);
  const first = turn(state, { type: 'run' }, move(0), constantRng(0.99));
  assert.equal(eventsOf(first.events, 'run_fail').length, 1);
  assert.equal(first.state.runAttempts, 1);
});

// ---- Experience --------------------------------------------------------------------

test('experience yield: floor(base × level / 7), ×1.5 against a trainer, shared', () => {
  const defeated = makeCreature('pivelin', 10, ['souffle']);
  const base = Math.floor((CREATURES_BY_ID.pivelin.baseExp * 10) / 7);
  assert.equal(experienceYield(defeated, 1, false), base);
  assert.equal(experienceYield(defeated, 1, true), Math.floor(base * 1.5));
  assert.equal(experienceYield(defeated, 2, false), Math.floor(base / 2));
});

test('gaining several levels at once: stats, events and moves learned', () => {
  const creature = makeCreature('musaraille', 15, ['egratignure']);
  const target = expForLevel('fast', 22) - creature.exp;
  const { events, levels } = gainExperience(creature, target, 0);
  assert.equal(levels, 7);
  assert.equal(creature.level, 22);
  assert.equal(eventsOf(events, 'level_up').length, 7);
  assert.deepEqual(creature.moves.map((slot) => slot.id), ['egratignure', 'tambourin']); // learned at 18
  assert.equal(eventsOf(events, 'move_learned')[0].move, 'tambourin');
  assert.equal(creature.hp, creature.stats.hp);
});

test('a fifth move asks the player; answerLearnMove replaces or skips', () => {
  const learner = makeCreature('musaraille', 17, ['egratignure', 'regard_dur', 'elan_vif', 'repli']);
  learner.exp = expForLevel('fast', 18) - 1; // tambourin at level 18
  const state = makeBattle([learner], [idleEnemy('pivelin', 20)]);
  state.sides[1].party[0].hp = 1;
  const { state: after, events } = turn(state, move(0));
  assert.ok(eventsOf(events, 'learn_move_prompt').length >= 1);
  assert.equal(currentPending(after).type, 'learn_move');
  const answered = answerLearnMove(after, 0);
  assert.equal(answered.events[0].type, 'move_forgotten');
  assert.equal(player(answered.state).moves[0].id, 'tambourin');
  assert.equal(answerLearnMove(after, null).events[0].type, 'move_not_learned');
});

test('experience is shared between the creatures that fought', () => {
  const state = makeBattle([makeCreature('musaraille', 30, ['egratignure']), makeCreature('pivelin', 30, ['souffle'])], [idleEnemy('caillotin', 30)]);
  let current = turn(state, { type: 'switch', index: 1 }).state;
  current.sides[1].party[0].hp = 1;
  const { events } = turn(current, move(0));
  const gains = eventsOf(events, 'exp_gain');
  assert.equal(gains.length, 2);
  assert.equal(gains[0].amount, experienceYield(enemy(state), 2, false));
});

// ---- End of battle ------------------------------------------------------------------

test('winning against a trainer: money and battle_end', () => {
  const state = makeBattle([makeCreature('musaraille', 30, ['egratignure'])], [idleEnemy('lapugil', 12)], { trainer: TRAINER });
  state.sides[1].party[0].hp = 1;
  const { state: after, events } = turn(state, move(0));
  assert.equal(after.outcome, 'win');
  assert.deepEqual(eventsOf(events, 'money_gain')[0], { type: 'money_gain', amount: 12 * 15 });
  assert.equal(events.at(-1).type, 'battle_end');
});

test('trainer sends the next creature after a faint', () => {
  const state = makeBattle([makeCreature('musaraille', 30, ['egratignure'])], [idleEnemy('lapugil', 12), idleEnemy('pivelin', 12)], { trainer: TRAINER });
  state.sides[1].party[0].hp = 1;
  const { state: after, events } = turn(state, move(0));
  assert.equal(after.outcome, null);
  assert.equal(eventsOf(events, 'switch_in')[0].species, 'pivelin');
});

test('player faint: need_switch, then chooseSwitch; losing the last one ends the battle', () => {
  const state = makeBattle([makeCreature('musaraille', 10, ['regard_dur']), makeCreature('pivelin', 10, ['souffle'])],
    [makeCreature('lapugil', 50, ['assaut'])]);
  const { state: after, events } = turn(state, move(0));
  assert.equal(eventsOf(events, 'need_switch').length, 1);
  assert.throws(() => resolveTurn(after, move(0), move(0), constantRng(0.5)), /Pending/);
  const switched = chooseSwitch(after, 1);
  assert.equal(eventsOf(switched.events, 'switch_in')[0].species, 'pivelin');
  const lost = turn(switched.state, move(0));
  assert.equal(lost.state.outcome, 'lose');
});

test('evolution_pending at the end of the battle after reaching the level', () => {
  const pivelin = makeCreature('pivelin', 13, ['souffle']);
  pivelin.exp = expForLevel('medium', 14) - 1;
  const state = makeBattle([pivelin], [idleEnemy('musaraille', 10)]);
  state.sides[1].party[0].hp = 1;
  const { events } = turn(state, move(0));
  assert.deepEqual(eventsOf(events, 'evolution_pending')[0].target, 'grivelin');
});

// ---- Items ------------------------------------------------------------------------

test('potions heal a party member; a full creature makes the item fail', () => {
  const state = makeBattle([makeCreature('musaraille', 20, ['egratignure'])], [idleEnemy()]);
  assert.equal(eventsOf(turn(state, { type: 'item', itemId: 'potion', target: 0 }).events, 'item_failed')[0].reason, 'hp_full');
  state.sides[0].party[0].hp = 5;
  const { state: after, events } = turn(state, { type: 'item', itemId: 'potion', target: 0 });
  assert.equal(eventsOf(events, 'item_used').length, 1);
  assert.equal(player(after).hp, Math.min(player(after).stats.hp, 25));
});

test('revive and status cures', () => {
  const state = makeBattle([makeCreature('musaraille', 20, ['egratignure']), makeCreature('pivelin', 20, ['souffle'])], [idleEnemy()]);
  state.sides[0].party[1].hp = 0;
  state.sides[0].party[0].status = { id: 'psn' };
  const revived = turn(state, { type: 'item', itemId: 'ranimant', target: 1 }).state;
  assert.equal(revived.sides[0].party[1].hp, Math.floor(revived.sides[0].party[1].stats.hp / 2));
  const cured = turn(revived, { type: 'item', itemId: 'antidote', target: 0 }).state;
  assert.equal(player(cured).status, null);
});

// ---- AI ---------------------------------------------------------------------------

test('basic AI picks the super effective move and avoids immune targets', () => {
  const state = makeBattle([makeCreature('faonille', 20, ['brindille'])], [makeCreature('lapugil', 20, ['egratignure', 'escarbille'])], { trainer: TRAINER });
  assert.deepEqual(chooseAction(state, 1, constantRng(0.5), 'basic'), { type: 'move', index: 1 });
  const ghost = makeBattle([makeCreature('sombrelin', 20, ['pas_furtif'])], [makeCreature('lapugil', 20, ['egratignure', 'taloche'])], { trainer: TRAINER });
  assert.deepEqual(chooseAction(ghost, 1, constantRng(0.5), 'basic'), { type: 'move', index: 1 });
});

test('smart AI uses a potion under 25 % HP, at most twice', () => {
  const state = makeBattle([makeCreature('musaraille', 20, ['egratignure'])], [makeCreature('lapugil', 20, ['taloche'])], { trainer: { ...TRAINER, class: 'champion' } });
  state.sides[1].party[0].hp = 2;
  assert.equal(chooseAction(state, 1, constantRng(0.5)).type, 'item');
  state.sides[1].potionsUsed = 2;
  assert.equal(chooseAction(state, 1, constantRng(0.5)).type, 'move');
});

test('smart AI switches out of a bad matchup', () => {
  const state = makeBattle([makeCreature('salamarde', 30, ['giclee'])], [makeCreature('braisille', 20, ['egratignure']), makeCreature('goujonet', 30, ['giclee'])],
    { trainer: { ...TRAINER, class: 'champion' } });
  assert.deepEqual(chooseAction(state, 1, constantRng(0.5)), { type: 'switch', index: 1 });
});

test('AI level comes from the battle kind and the trainer class', () => {
  assert.equal(aiLevel({ kind: 'wild' }), 'wild');
  assert.equal(aiLevel({ kind: 'trainer', trainer: { class: 'gamin' } }), 'basic');
  assert.equal(aiLevel({ kind: 'trainer', trainer: { class: 'championne' } }), 'smart');
  assert.equal(aiLevel({ kind: 'trainer', trainer: { class: 'rival', ai: 'smart' } }), 'smart');
  const wild = makeBattle([makeCreature('musaraille', 5, ['egratignure'])], [makeCreature('pivelin', 5, ['souffle', 'regard_dur'])]);
  assert.equal(chooseAction(wild, 1, createRng(3)).type, 'move');
});

test('the battle logic never imports rendering code', () => {
  const directory = new URL('../src/battle/logic/', import.meta.url);
  const files = fs.readdirSync(directory, { recursive: true }).filter((file) => String(file).endsWith('.js'));
  for (const file of files) {
    const source = fs.readFileSync(path.join(directory.pathname.replace(/^\/(\w:)/, '$1'), String(file)), 'utf8');
    assert.ok(!/from '.*\/(gfx|ui|overworld)\//.test(source), `${file} importe du rendu`);
    assert.ok(!/\b(document|window)\./.test(source), `${file} utilise le DOM`);
  }
});
