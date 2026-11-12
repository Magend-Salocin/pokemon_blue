import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createScriptRunner } from '../src/overworld/script-runner.js';
import { createGameState, hasFlag } from '../src/state/game-state.js';
import { loadGameData } from '../tools/validators/game-data.js';
import { checkMaps } from '../tools/validators/maps.js';
import { checkScript } from '../tools/validators/scripts.js';

/** Fake overworld: records calls, answers questions and battles from lists. */
function fakeContext({ answers = [], outcomes = [] } = {}) {
  const log = [];
  const state = createGameState();
  const ctx = {
    state,
    log,
    say: async (text, variables) => { log.push(variables ? `say:${text}:${JSON.stringify(variables)}` : `say:${text}`); },
    ask: async (text) => { log.push(`ask:${text}`); return answers.shift(); },
    moveActor: async (actor, path) => { log.push(`move:${actor}:${path.join(',')}`); },
    faceActor: (actor, direction) => log.push(`face:${actor}:${direction}`),
    wait: async () => {},
    battle: async (trainer) => { log.push(`battle:${trainer}`); return outcomes.shift() ?? 'win'; },
    wildBattle: async () => 'win',
    blackout: async () => { log.push('blackout'); },
    warp: async (map) => { log.push(`warp:${map}`); },
    setActorVisible: (actor, visible) => log.push(`${visible ? 'show' : 'hide'}:${actor}`),
    playMusic: () => {},
    playSfx: () => {},
    fade: async () => {},
    shake: async () => {},
    openMenu: async (menu) => { log.push(`menu:${menu}`); },
    getScript: (name) => ({ sub: [{ cmd: 'say', text: 'from_sub' }] })[name],
    setRivalName: async () => {},
    chooseStarter: async () => {},
    healParty: () => log.push('heal'),
    itemName: (id) => id.toUpperCase(),
    creatureName: (id) => id,
  };
  return ctx;
}

test('commands run in order and change the game state', async () => {
  const ctx = fakeContext();
  await createScriptRunner(ctx).run([
    { cmd: 'say', text: 'hello' },
    { cmd: 'set_flag', flag: 'met' },
    { cmd: 'give_item', item: 'potion', count: 2 },
    { cmd: 'give_money', amount: 500 },
    { cmd: 'give_badge', badge: 'roche' },
    { cmd: 'heal_party' },
  ]);
  assert.deepEqual(ctx.log, ['say:hello', 'say:got_item:{"ITEM":"POTION","NUMBER":2}', 'heal']);
  assert.ok(hasFlag(ctx.state, 'met'));
  assert.equal(ctx.state.bag.potion, 2);
  assert.equal(ctx.state.money, 3500);
  assert.deepEqual(ctx.state.badges, ['roche']);
});

test('conditions, questions and sub-scripts pick the right branch', async () => {
  const ctx = fakeContext({ answers: [false] });
  ctx.state.flags.seen = true;
  await createScriptRunner(ctx).run([
    { cmd: 'if_flag', flag: 'seen', then: [{ cmd: 'say', text: 'again' }], else: [{ cmd: 'say', text: 'first' }] },
    { cmd: 'if_item', item: 'potion', then: [{ cmd: 'say', text: 'has' }], else: [{ cmd: 'say', text: 'none' }] },
    { cmd: 'ask', text: 'q', yes: [{ cmd: 'say', text: 'yes' }], no: [{ cmd: 'say', text: 'no' }] },
    { cmd: 'call', script: 'sub' },
  ]);
  assert.deepEqual(ctx.log, ['say:again', 'say:none', 'ask:q', 'say:no', 'say:from_sub']);
});

test('a lost battle with blackout stops the script; onLose continue does not', async () => {
  const ctx = fakeContext({ outcomes: ['lose', 'lose'] });
  const stopped = await createScriptRunner(ctx).run([
    { cmd: 'battle', trainer: 'rival_1', onLose: 'continue' },
    { cmd: 'say', text: 'after_first' },
    { cmd: 'battle', trainer: 'rival_2' },
    { cmd: 'say', text: 'never' },
  ]);
  assert.deepEqual(ctx.log, ['battle:rival_1', 'say:after_first', 'battle:rival_2', 'blackout']);
  assert.equal(stopped.stopped, true);
});

test('end stops the script and async moves are awaited', async () => {
  const ctx = fakeContext();
  const result = await createScriptRunner(ctx).run([
    { cmd: 'move', actor: 'prof', path: ['up', 'up'], async: true },
    { cmd: 'move', actor: 'player', path: ['left'] },
    { cmd: 'wait_moves' },
    { cmd: 'end' },
    { cmd: 'say', text: 'never' },
  ]);
  assert.deepEqual(ctx.log, ['move:prof:up,up', 'move:player:left']);
  assert.equal(result.stopped, true);
});

test('unknown commands throw', async () => {
  await assert.rejects(createScriptRunner(fakeContext()).run([{ cmd: 'dance' }]), /Unknown script command/);
});

const data = loadGameData();

test('script checker reports unknown commands and references', () => {
  const scope = { label: 's', actors: new Set(['prof']), scriptNames: new Set() };
  const errors = checkScript([
    { cmd: 'dance' },
    { cmd: 'say', text: 'no_such_text' },
    { cmd: 'give_item' },
    { cmd: 'move', actor: 'ghost', path: ['up'] },
    { cmd: 'if_flag', flag: 'x', then: [{ cmd: 'call', script: 'missing' }] },
  ], data, scope);
  assert.equal(errors.length, 5, errors.join('\n'));
});

test('map checker reports layers, warps and connections', () => {
  const maps = {
    a: {
      id: 'a', tileset: 'outdoor', layers: { ground: ['..?', '...'] }, warps: [], connections: {},
    },
    b: {
      id: 'b', tileset: 'outdoor', layers: { ground: ['...', '...'] },
      warps: [{ x: 0, y: 0, to: 'nowhere', toX: 0, toY: 0 }], connections: { south: 'c' },
    },
    c: { id: 'c', tileset: 'outdoor', layers: { ground: ['..', '..'] }, connections: {} },
  };
  const errors = checkMaps({ ...data, maps });
  assert.ok(errors.some((error) => error.includes('Unknown legend character')), errors.join('\n'));
  assert.ok(errors.some((error) => error.includes('carte inconnue « nowhere »')));
  assert.ok(errors.some((error) => error.includes('non réciproque')));
  assert.ok(errors.some((error) => error.includes('même largeur')));
});
