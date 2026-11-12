// Event script interpreter. A script is a list of commands ({ cmd, ... }) run in order.
// The runner owns the game state changes; everything visual or not built yet goes through
// `ctx` (provided by the overworld scene, or a fake in tests).
import {
  addBadge, addCreature, addItem, addMoney, clearFlag, hasBadge, hasFlag, hasItem, removeItem, setFlag,
} from '../state/game-state.js';

/**
 * Field kinds per command, used by the validator. Kinds: text, flag, item, badge, creature,
 * trainer, map, actor, script (nested list), scriptName, menu, direction, number, any.
 * A trailing '?' marks an optional field.
 */
export const SCRIPT_COMMANDS = {
  say: { text: 'text' },
  ask: { text: 'text', yes: 'script?', no: 'script?' },
  move: { actor: 'actor', path: 'path', async: 'any?' },
  wait_moves: {},
  face: { actor: 'actor', direction: 'direction' },
  wait: { seconds: 'number' },
  set_flag: { flag: 'flag' },
  clear_flag: { flag: 'flag' },
  if_flag: { flag: 'flag', then: 'script?', else: 'script?' },
  if_item: { item: 'item', count: 'number?', then: 'script?', else: 'script?' },
  if_badge: { badge: 'badge', then: 'script?', else: 'script?' },
  give_item: { item: 'item', count: 'number?', silent: 'any?' },
  take_item: { item: 'item', count: 'number?' },
  give_creature: { creature: 'creature', level: 'number' },
  give_money: { amount: 'number' },
  give_badge: { badge: 'badge' },
  heal_party: {},
  battle: { trainer: 'trainer', onLose: 'any?' },
  wild_battle: { creature: 'creature', level: 'number' },
  warp: { map: 'map', x: 'number', y: 'number', facing: 'direction?' },
  show_actor: { actor: 'actor' },
  hide_actor: { actor: 'actor' },
  play_music: { track: 'any' },
  play_sfx: { sfx: 'any' },
  fade: { direction: 'any', color: 'any?' },
  shake_screen: { seconds: 'number?' },
  open_menu: { menu: 'menu', params: 'any?' },
  call: { script: 'scriptName' },
  set_rival_name: {},
  set_respawn: {},
  trade: { wanted: 'creature', offer: 'trade_offer', flag: 'flag?' },
  choose_starter: {},
  end: {},
};

export const MENUS = ['shop', 'storage', 'daycare', 'party', 'bag', 'bestiary'];

const STOP = Symbol('stop');

export function createScriptRunner(ctx) {
  const pendingMoves = [];
  const { state } = ctx;

  async function runList(commands) {
    for (const command of commands ?? []) {
      const result = await runCommand(command);
      if (result === STOP) return STOP;
    }
    return undefined;
  }

  const handlers = {
    say: (c) => ctx.say(c.text),
    ask: async (c) => runList((await ctx.ask(c.text)) ? c.yes : c.no),
    move: (c) => {
      const promise = ctx.moveActor(c.actor, c.path);
      if (c.async) pendingMoves.push(promise);
      else return promise;
      return undefined;
    },
    wait_moves: async () => {
      await Promise.all(pendingMoves.splice(0));
    },
    face: (c) => ctx.faceActor(c.actor, c.direction),
    wait: (c) => ctx.wait(c.seconds),
    set_flag: (c) => setFlag(state, c.flag),
    clear_flag: (c) => clearFlag(state, c.flag),
    if_flag: (c) => runList(hasFlag(state, c.flag) ? c.then : c.else),
    if_item: (c) => runList(hasItem(state, c.item, c.count ?? 1) ? c.then : c.else),
    if_badge: (c) => runList(hasBadge(state, c.badge) ? c.then : c.else),
    give_item: async (c) => {
      addItem(state, c.item, c.count ?? 1);
      if (!c.silent) await ctx.say('got_item', { ITEM: ctx.itemName(c.item), NUMBER: c.count ?? 1 });
    },
    take_item: (c) => {
      removeItem(state, c.item, c.count ?? 1);
    },
    give_creature: async (c) => {
      addCreature(state, ctx.createCreature(c.creature, c.level));
      await ctx.say('got_creature', { CREATURE: ctx.creatureName(c.creature) });
    },
    give_money: (c) => addMoney(state, c.amount),
    give_badge: (c) => addBadge(state, c.badge),
    heal_party: () => ctx.healParty(),
    battle: async (c) => {
      const onLose = c.onLose ?? 'blackout';
      const outcome = await ctx.battle(c.trainer, onLose);
      if (outcome === 'lose' && onLose === 'blackout') {
        await ctx.blackout();
        return STOP;
      }
      return undefined;
    },
    wild_battle: async (c) => {
      const outcome = await ctx.wildBattle(c.creature, c.level);
      if (outcome === 'lose') {
        await ctx.blackout();
        return STOP;
      }
      return undefined;
    },
    warp: (c) => ctx.warp(c.map, c.x, c.y, c.facing),
    show_actor: (c) => ctx.setActorVisible(c.actor, true),
    hide_actor: (c) => ctx.setActorVisible(c.actor, false),
    play_music: (c) => ctx.playMusic(c.track),
    play_sfx: (c) => ctx.playSfx(c.sfx),
    fade: (c) => ctx.fade(c.direction, c.color ?? 'black'),
    shake_screen: (c) => ctx.shake(c.seconds ?? 0.5),
    open_menu: (c) => ctx.openMenu(c.menu, c.params),
    call: (c) => runList(ctx.getScript(c.script)),
    set_rival_name: () => ctx.setRivalName(),
    set_respawn: () => ctx.setRespawn(),
    trade: async (c) => {
      if ((await ctx.trade(c.wanted, c.offer)) && c.flag) setFlag(state, c.flag);
    },
    choose_starter: () => ctx.chooseStarter(),
    end: () => STOP,
  };

  async function runCommand(command) {
    const handler = handlers[command.cmd];
    if (!handler) throw new Error(`Unknown script command: ${command.cmd}`);
    return handler(command);
  }

  return {
    /** Runs a script to the end. Resolves with { stopped } (true after `end` or a blackout). */
    async run(commands) {
      const result = await runList(commands);
      await Promise.all(pendingMoves.splice(0));
      return { stopped: result === STOP };
    },
  };
}
