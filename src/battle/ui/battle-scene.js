// Battle scene: intro, action menus, event playback, outro, and the write-back to the game state.
// Input: { kind, enemyParty, trainer?, music?, canRun, onLose, state, rng }.
// `promise` resolves with { result: 'win' | 'lose' | 'run' | 'caught', caughtCreature?, evolutions }.
import { MOVES_BY_ID } from '../../data/moves.js';
import { ITEMS_BY_ID } from '../../data/items.js';
import { CREATURES_BY_ID } from '../../data/creatures.js';
import { expForLevel } from '../../data/formulas.js';
import { BATTLE_TEXTS } from '../../data/texts/battle-fr.js';
import { getText } from '../../data/texts/index.js';
import { drawSprite } from '../../gfx/draw.js';
import { drawText } from '../../gfx/font.js';
import { hooks } from '../../overworld/hooks.js';
import {
  PARTY_SIZE, addCreature, addMoney, markSeen, removeItem,
} from '../../state/game-state.js';
import { TEXT_SPEEDS, getTextSpeed } from '../../ui/dialog-box.js';
import { creatureName } from '../../ui/creature-widgets.js';
import { askBattle } from '../../ui/learn-move.js';
import { moveCursor } from '../../ui/menu-cursor.js';
import { chooseMoveSlot } from '../../ui/move-list-screen.js';
import { enterName } from '../../ui/name-entry.js';
import { choosePartyMember } from '../../ui/party-screen.js';
import { applyVariables, layoutText } from '../../ui/text-layout.js';
import { drawWindowFrame } from '../../ui/window-frame.js';
import { getOptions } from '../../state/options.js';
import { BATTLE_MUSIC, VICTORY_MUSIC, WILD_BATTLE_MUSIC } from '../../data/music.js';
import { TRAINER_CLASSES_BY_ID } from '../../data/trainer-classes.js';
import { chooseAction } from '../logic/ai.js';
import {
  battleStartEvents, chooseSwitch, createBattle, currentPending, freeSwitch, getAvailableActions, resolveTurn,
} from '../logic/engine.js';
import { itemProblem } from '../logic/items.js';
import { openBattleBag } from './bag-screen.js';
import {
  LAYOUT, createShownCreature, renderBattle, spriteCenter,
} from './battle-hud.js';
import { EventPlayer } from './event-player.js';

const TEXT_SPEED_FACTOR = 1.5;
const AUTO_ADVANCE = 0.6;
const MAIN_MENU = [
  { id: 'fight', label: 'ATTAQUE' },
  { id: 'bag', label: 'SAC' },
  { id: 'party', label: 'ÉQUIPE' },
  { id: 'run', label: 'FUITE' },
];
const STAT_ROWS = [['hp', 'PV'], ['atk', 'ATT'], ['def', 'DÉF'], ['spa', 'A.SPÉ'], ['spd', 'D.SPÉ'], ['spe', 'VIT']];
const ITEM_PROBLEMS = { fainted: 'Elle est K.O. !', not_fainted: 'Elle va bien.', default: 'Aucun effet.' };

/** Text box: types the pages, then waits for A (wait) or advances alone after a short pause. */
class MessageBox {
  constructor(text, wait) {
    this.pages = layoutText(text);
    this.wait = wait;
    this.page = 0;
    this.visible = 0;
    this.idle = 0;
    this.speed = TEXT_SPEEDS[getTextSpeed()] * TEXT_SPEED_FACTOR;
    this.promise = new Promise((resolve) => { this.resolve = resolve; });
  }

  get pageLength() {
    return this.pages[this.page].reduce((total, line) => total + Array.from(line).length, 0);
  }

  update(dt, input) {
    const pressed = input.justPressed('a') || input.justPressed('b');
    if (this.visible < this.pageLength) {
      this.visible = pressed ? this.pageLength : Math.min(this.pageLength, this.visible + this.speed * dt);
      return;
    }
    this.idle += dt;
    const last = this.page === this.pages.length - 1;
    if (pressed || (!this.wait && last && this.idle >= AUTO_ADVANCE)) {
      if (last) this.resolve();
      else {
        this.page += 1;
        this.visible = 0;
        this.idle = 0;
      }
    }
  }

  render(ctx) {
    const { x, y, width, height } = LAYOUT.textBox;
    drawWindowFrame(ctx, x, y, width, height);
    let remaining = Math.floor(this.visible);
    this.pages[this.page].forEach((line, index) => {
      const characters = Array.from(line);
      drawText(ctx, characters.slice(0, remaining).join(''), 8, 108 + index * 16);
      remaining = Math.max(0, remaining - characters.length);
    });
    const typed = this.visible >= this.pageLength;
    if (typed && (this.wait || this.page < this.pages.length - 1) && this.idle % 0.6 < 0.3) drawText(ctx, '▼', 152, 124);
  }
}

class MainMenu {
  constructor(index) {
    this.index = index;
    this.promise = new Promise((resolve) => { this.resolve = resolve; });
  }

  update(dt, input) {
    this.index = moveCursor(this.index, MAIN_MENU.length, input, { columns: 2 });
    if (input.justPressed('a')) this.resolve(MAIN_MENU[this.index].id);
  }

  render(ctx) {
    drawWindowFrame(ctx, 0, 96, 160, 48);
    MAIN_MENU.forEach((entry, index) => {
      const x = index % 2 === 0 ? 16 : 96;
      const y = index < 2 ? 108 : 124;
      if (index === this.index) drawText(ctx, '▶', x - 8, y);
      drawText(ctx, entry.label, x, y);
    });
  }
}

class MoveMenu {
  constructor(creature, index) {
    this.creature = creature;
    this.index = Math.min(index, creature.moves.length - 1);
    this.message = null;
    this.promise = new Promise((resolve) => { this.resolve = resolve; });
  }

  update(dt, input) {
    const previous = this.index;
    this.index = moveCursor(this.index, this.creature.moves.length, input);
    if (previous !== this.index) this.message = null;
    if (input.justPressed('a')) {
      if (this.creature.moves[this.index].pp > 0) this.resolve(this.index);
      else this.message = 'Plus de PP !';
    } else if (input.justPressed('b')) {
      this.resolve(null);
    }
  }

  render(ctx) {
    drawWindowFrame(ctx, 0, 96, 160, 48);
    this.creature.moves.forEach((slot, index) => {
      const y = 104 + index * 8;
      if (index === this.index) drawText(ctx, '▶', 8, y);
      drawText(ctx, MOVES_BY_ID[slot.id].name, 16, y);
    });
    const slot = this.creature.moves[this.index];
    drawWindowFrame(ctx, 80, 56, 80, 40);
    drawSprite(ctx, 'ui', `type/${MOVES_BY_ID[slot.id].type}`, 88, 64);
    drawText(ctx, this.message ?? `PP ${slot.pp}/${slot.maxPp}`, 88, 76);
  }
}

/** Window with the six stats: first the gains, then (after A) the new values. */
class StatGainsWindow {
  constructor(previous, next) {
    this.previous = previous;
    this.next = next;
    this.showValues = false;
    this.promise = new Promise((resolve) => { this.resolve = resolve; });
  }

  update(dt, input) {
    if (!input.justPressed('a') && !input.justPressed('b')) return;
    if (this.showValues) this.resolve();
    else this.showValues = true;
  }

  render(ctx) {
    drawWindowFrame(ctx, 72, 0, 88, 96);
    STAT_ROWS.forEach(([key, label], index) => {
      const y = 10 + index * 13;
      drawText(ctx, label, 80, y);
      const value = this.showValues ? String(this.next[key]) : `+${this.next[key] - this.previous[key]}`;
      drawText(ctx, value.padStart(4, ' '), 120, y);
    });
  }
}

export class BattleScene {
  transparent = false;
  blocksInput = true;

  constructor({ kind, enemyParty, trainer = null, music = null, canRun = true, onLose = 'blackout', state, rng }) {
    this.gameState = state;
    this.rng = rng;
    this.trainer = trainer;
    this.canRun = canRun;
    this.onLose = onLose;
    this.music = music ?? trainer?.music ?? (kind === 'wild' ? WILD_BATTLE_MUSIC : BATTLE_MUSIC[TRAINER_CLASSES_BY_ID[trainer?.class]?.musicIntro] ?? BATTLE_MUSIC.trainer);
    this.battle = createBattle({
      kind,
      playerParty: state.party,
      enemyParty,
      trainer: trainer && { id: trainer.id, class: trainer.class, name: trainer.name, moneyBase: trainer.moneyBase, ai: trainer.ai },
    });
    this.player = new EventPlayer(this);
    this.shown = [createShownCreature(), createShownCreature()];
    this.view = {
      shown: this.shown,
      portraits: {
        player: { visible: false, frame: state.player.gender === 'girl' ? 'back/joueuse' : 'back/joueur', dx: 0 },
        trainer: { visible: false, frame: trainer?.portrait ?? null, dx: 0 },
      },
      capsule: null,
      effect: null,
      indicators: [],
      shake: 0,
      hidePlayerHud: false,
    };
    this.tweens = [];
    this.widget = null;
    this.evolutions = [];
    this.moneyGained = 0;
    this.introDone = false;
    this.menuIndex = 0;
    this.moveIndex = 0;
    this.expTrackers = state.party.map((creature) => ({ exp: creature.exp, level: creature.level }));
    this.promise = new Promise((resolve) => { this.resolvePromise = resolve; });
  }

  get playerName() {
    return this.gameState.player.name;
  }

  get trainerTitle() {
    return `${this.trainer?.className ?? ''} ${this.trainer?.name ?? ''}`.trim();
  }

  enter(manager) {
    this.manager = manager;
    hooks.playMusic(this.music);
    this.run().catch((error) => {
      console.error(error);
      this.resolvePromise({ result: 'win', evolutions: [] });
    });
  }

  // ---- Primitives used by the event player -------------------------------------

  tween(duration, onUpdate) {
    return new Promise((resolve) => {
      this.tweens.push({ duration: Math.max(0.0001, duration), elapsed: 0, onUpdate, resolve });
    });
  }

  wait(seconds) {
    return this.tween(seconds, () => {});
  }

  /** Shows a text widget. wait: true = needs A at the end; false = advances alone. */
  say(key, variables = {}, { wait = true } = {}) {
    const template = BATTLE_TEXTS[key] ?? getText(key);
    const text = applyVariables(template, { PLAYER: this.playerName, RIVAL: this.gameState.rival?.name, ...variables });
    return this.runWidget(new MessageBox(text, wait));
  }

  runWidget(widget) {
    this.widget = widget;
    return widget.promise.finally(() => {
      if (this.widget === widget) this.widget = null;
    });
  }

  slide(side, from, to, duration) {
    const shown = this.shown[side];
    return this.tween(duration, (t) => { shown.dx = Math.round(from + (to - from) * t); });
  }

  async blink(side, count) {
    const shown = this.shown[side];
    await this.tween(count * 0.12, (t) => { shown.blink = Math.floor(t * count * 2) % 2 === 0 && t < 1; });
    shown.blink = false;
  }

  async shakeScreen(duration) {
    await this.tween(duration, (t) => { this.view.shake = t < 1 ? (Math.floor(t * 20) % 2 === 0 ? 2 : -2) : 0; });
    this.view.shake = 0;
  }

  async playAnimation(animation, from, to) {
    if (!getOptions().battleAnimations) return;
    this.view.effect = { animation, t: 0, from, to };
    await this.tween(animation.duration, (t) => { this.view.effect.t = t; });
    this.view.effect = null;
  }

  showCreature(side, event) {
    const creature = this.battle.sides[side].party[event.index];
    const shown = this.shown[side];
    Object.assign(shown, {
      visible: true, species: event.species, name: creatureName(creature), level: event.level,
      hp: event.hp, maxHp: event.maxHp, status: creature.status, hudVisible: true, clipBottom: 0,
    });
    if (side === 0) shown.expRatio = this.expRatio(event.index, creature.species);
    else markSeen(this.gameState, event.species);
  }

  expTracker(index) {
    const creature = this.battle.sides[0].party[index];
    this.expTrackers[index] ??= { exp: creature.exp, level: creature.level };
    return this.expTrackers[index];
  }

  expRatio(index, species) {
    const { exp, level } = this.expTracker(index);
    const growth = CREATURES_BY_ID[species].growth;
    const low = expForLevel(growth, level);
    const high = expForLevel(growth, level + 1);
    return Math.max(0, Math.min(1, (exp - low) / Math.max(1, high - low)));
  }

  showStatGains(previous, next) {
    return this.runWidget(new StatGainsWindow(previous, next));
  }

  onItemConsumed(event) {
    if (event.side === 0) removeItem(this.gameState, event.item);
  }

  async throwCapsule(itemName) {
    await this.say('item_used', { ITEM: itemName }, { wait: false });
    const from = spriteCenter(0);
    const to = spriteCenter(1);
    this.view.capsule = { ...from };
    hooks.playSfx('capsule_throw');
    await this.tween(0.5, (t) => {
      this.view.capsule.x = from.x + (to.x - from.x) * t;
      this.view.capsule.y = from.y + (to.y - from.y) * t - Math.sin(t * Math.PI) * 24;
    });
    await this.blink(1, 2);
    this.shown[1].visible = false;
    await this.tween(0.2, (t) => { this.view.capsule.y = to.y + t * 16; });
  }

  /** Before a trainer's next creature: « Changer de bestiole ? » (free switch). */
  async offerSwitchBeforeEnemy(event) {
    if (!this.introDone || this.shown[1].visible || getOptions().battleStyle === 'set') return;
    const player = this.battle.sides[0].party[this.battle.sides[0].active];
    if (player.hp <= 0 || !getAvailableActions(this.battle, 0).canSwitch) return;
    const next = creatureName(this.battle.sides[1].party[event.index]);
    await this.say('trainer_will_send', { TRAINER: this.trainerTitle, CREATURE: next }, { wait: false });
    if (!(await askBattle(this.manager, 'ask_switch'))) return;
    const index = await this.choosePartyIndex(false);
    if (index === null) return;
    const result = freeSwitch(this.battle, index);
    this.battle = result.state;
    await this.player.play(result.events);
  }

  // ---- Flow ------------------------------------------------------------------------

  async run() {
    await this.intro();
    this.introDone = true;
    while (!this.battle.outcome) {
      const action = await this.choosePlayerAction();
      const enemyAction = chooseAction(this.battle, 1, this.rng);
      const { state, events } = resolveTurn(this.battle, action, enemyAction, this.rng);
      this.battle = state;
      await this.player.play(events);
      await this.resolvePendingSwitch();
    }
    const outcome = await this.outro();
    this.writeBack();
    this.resolvePromise(outcome);
  }

  async intro() {
    const { portraits } = this.view;
    const [enemyEvent, playerEvent] = battleStartEvents(this.battle);
    portraits.player.visible = true;
    portraits.player.dx = 120;
    if (this.battle.kind === 'trainer') {
      portraits.trainer.visible = true;
      portraits.trainer.dx = -120;
      await this.tween(0.8, (t) => {
        portraits.player.dx = Math.round(120 * (1 - t));
        portraits.trainer.dx = Math.round(-120 * (1 - t));
      });
      this.view.indicators = [0, 1].map((side) => ({ side, states: this.partyStates(side) }));
      await this.say('trainer_wants_battle', { TRAINER: this.trainerTitle });
      this.view.indicators = [];
      await this.tween(0.3, (t) => { portraits.trainer.dx = Math.round(t * 80); });
      portraits.trainer.visible = false;
      await this.player.play([enemyEvent]);
    } else {
      this.showCreature(1, enemyEvent);
      this.shown[1].hudVisible = false;
      this.shown[1].dx = -120;
      await this.tween(0.8, (t) => {
        portraits.player.dx = Math.round(120 * (1 - t));
        this.shown[1].dx = Math.round(-120 * (1 - t));
      });
      hooks.playSfx(`cry_${enemyEvent.species}`);
      this.shown[1].hudVisible = true;
      await this.say('wild_appears', { CREATURE: creatureName(this.battle.sides[1].party[0]) });
    }
    await this.tween(0.3, (t) => { portraits.player.dx = Math.round(-t * 80); });
    portraits.player.visible = false;
    await this.player.play([playerEvent]);
  }

  partyStates(side) {
    return this.battle.sides[side].party.map((creature) => (creature.hp > 0 ? 'full' : 'ko'));
  }

  async resolvePendingSwitch() {
    if (currentPending(this.battle)?.type !== 'need_switch') return;
    const index = await this.choosePartyIndex(true);
    const result = chooseSwitch(this.battle, index);
    this.battle = result.state;
    await this.player.play(result.events);
  }

  choosePartyIndex(forced) {
    const { party, active } = this.battle.sides[0];
    return choosePartyMember(this.manager, party, {
      forced,
      canSelect: (creature, index) => {
        if (creature.hp <= 0) return ITEM_PROBLEMS.fainted;
        if (index === active) return 'Déjà au combat !';
        return null;
      },
    });
  }

  async choosePlayerAction() {
    const available = getAvailableActions(this.battle, 0);
    if (available.forced) {
      if (available.forced.type === 'struggle') await this.say('struggle', { CREATURE: this.shown[0].name }, { wait: false });
      return available.forced;
    }
    for (;;) {
      const menu = new MainMenu(this.menuIndex);
      const choice = await this.runWidget(menu);
      this.menuIndex = menu.index;
      const action = await this.handleMenuChoice(choice, available);
      if (action) return action;
    }
  }

  async handleMenuChoice(choice, available) {
    const active = this.battle.sides[0].party[this.battle.sides[0].active];
    if (choice === 'fight') {
      this.view.hidePlayerHud = true;
      const menu = new MoveMenu(active, this.moveIndex);
      const index = await this.runWidget(menu);
      this.view.hidePlayerHud = false;
      this.moveIndex = menu.index;
      return index === null ? null : { type: 'move', index };
    }
    if (choice === 'party') {
      if (!available.canSwitch) {
        await this.say('run_blocked_trapped');
        return null;
      }
      const index = await this.choosePartyIndex(false);
      return index === null ? null : { type: 'switch', index };
    }
    if (choice === 'bag') return this.chooseItemAction();
    if (this.battle.kind === 'trainer') {
      await this.say('run_blocked_trainer');
      return null;
    }
    if (!this.canRun) {
      await this.say('run_fail');
      return null;
    }
    return { type: 'run' };
  }

  async chooseItemAction() {
    const itemId = await openBattleBag(this.manager, this.gameState.bag);
    if (!itemId) return null;
    const item = ITEMS_BY_ID[itemId];
    if (item.use.effect === 'catch') return { type: 'item', itemId };
    const party = this.battle.sides[0].party;
    const target = await choosePartyMember(this.manager, party, {
      message: 'Sur qui ?',
      canSelect: (creature) => {
        const problem = item.use.effect === 'restore_pp' ? null : itemProblem(item, creature);
        return problem ? (ITEM_PROBLEMS[problem] ?? ITEM_PROBLEMS.default) : null;
      },
    });
    if (target === null) return null;
    let moveIndex;
    if (item.use.effect === 'restore_pp' && !item.use.params.allMoves) {
      moveIndex = await chooseMoveSlot(this.manager, party[target]);
      if (moveIndex === null) return null;
    }
    return { type: 'item', itemId, target, moveIndex };
  }

  async outro() {
    const outcome = this.battle.outcome;
    if (outcome === 'win' || outcome === 'caught') hooks.playMusic(VICTORY_MUSIC[this.battle.kind]);
    if (outcome === 'win' && this.battle.kind === 'trainer') {
      const portrait = this.view.portraits.trainer;
      portrait.visible = true;
      portrait.dx = 80;
      await this.tween(0.4, (t) => { portrait.dx = Math.round(80 * (1 - t)); });
      await this.say('trainer_defeated', { TRAINER: this.trainerTitle });
      if (this.trainer.defeat) await this.say(this.trainer.defeat);
      if (this.moneyGained > 0) {
        addMoney(this.gameState, this.moneyGained);
        await this.say('money_gain', { NUMBER: this.moneyGained });
      }
      return { result: 'win' };
    }
    if (outcome === 'lose') {
      await this.say('blackout');
      if (this.onLose === 'blackout') {
        const lost = Math.floor(this.gameState.money / 2);
        addMoney(this.gameState, -lost);
        if (lost > 0) await this.say('blackout_money', { NUMBER: lost });
      }
      return { result: 'lose' };
    }
    if (outcome === 'caught') return this.afterCapture();
    if (outcome === 'fled') return { result: 'run' };
    return { result: 'win' };
  }

  async afterCapture() {
    const caught = structuredClone(this.battle.sides[1].party[this.battle.sides[1].active]);
    caught.originalTrainer = this.playerName;
    const name = CREATURES_BY_ID[caught.species].name;
    if (await askBattle(this.manager, 'ask_nickname', { CREATURE: name })) {
      const nickname = await enterName(this.manager, { title: `Surnom de ${name} ?`, defaultName: name });
      if (nickname !== name) caught.nickname = nickname;
    }
    this.caught = caught;
    if (this.battle.sides[0].party.length >= PARTY_SIZE) await this.say('sent_to_storage', { CREATURE: creatureName(caught) });
    return { result: 'caught', caughtCreature: caught };
  }

  /** PV, PP, statuts, XP and levels go back to the game state; the caught creature joins it. */
  writeBack() {
    this.gameState.party = this.battle.sides[0].party;
    if (this.caught) {
      const where = addCreature(this.gameState, this.caught);
      this.storedCaught = where === 'storage';
    }
  }

  // ---- Scene loop -----------------------------------------------------------------------

  update(dt, input) {
    for (const tween of [...this.tweens]) {
      tween.elapsed += dt;
      const t = Math.min(1, tween.elapsed / tween.duration);
      tween.onUpdate(t);
      if (t >= 1) {
        this.tweens.splice(this.tweens.indexOf(tween), 1);
        tween.resolve();
      }
    }
    this.widget?.update(dt, input);
  }

  render(ctx) {
    renderBattle(ctx, this.view);
    drawWindowFrame(ctx, 0, 96, 160, 48);
    this.widget?.render(ctx);
  }
}
