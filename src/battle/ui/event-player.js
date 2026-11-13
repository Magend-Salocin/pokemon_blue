// Plays the battle events one after the other: text, animation, sound.
// `scene` is the BattleScene (view state, text box, tweens, current logic state).
import { CREATURES_BY_ID } from '../../data/creatures.js';
import { expForLevel } from '../../data/formulas.js';
import { ITEMS_BY_ID } from '../../data/items.js';
import { MOVES_BY_ID } from '../../data/moves.js';
import { STAT_LABELS } from '../../data/texts/battle-fr.js';
import { hooks } from '../../overworld/hooks.js';
import { creatureName } from '../../ui/creature-widgets.js';
import { chooseMoveToForget } from '../../ui/learn-move.js';
import { answerLearnMove } from '../logic/engine.js';
import { CAPTURE_STARS, STAT_ANIMATIONS, TYPE_ANIMATIONS } from './move-animations.js';
import { spriteCenter } from './battle-hud.js';

const HP_SECONDS_PER_BAR = 1;
const MIN_HP_ANIMATION = 0.25;
const BLINK_COUNT = 3;
const OUTCOME_EVENTS = ['miss', 'move_failed', 'protected'];

export class EventPlayer {
  constructor(scene) {
    this.scene = scene;
  }

  get battle() {
    return this.scene.battle;
  }

  creatureAt(side, index = this.battle.sides[side].active) {
    return this.battle.sides[side].party[index];
  }

  /** Name used in texts: « Fenouillot », « Pivelin ennemi », « Pivelin sauvage ». */
  nameOf(side, index) {
    const name = creatureName(this.creatureAt(side, index));
    if (side === 0) return name;
    return this.battle.kind === 'wild' ? `${name} sauvage` : `${name} ennemi`;
  }

  say(key, variables, options) {
    return this.scene.say(key, variables, options);
  }

  async play(events) {
    for (let i = 0; i < events.length; i += 1) {
      const event = events[i];
      const handler = this[event.type];
      if (handler) await handler.call(this, event, events.slice(i + 1));
    }
  }

  // ---- Field ---------------------------------------------------------------

  async switch_in(event) {
    const { scene } = this;
    const side = event.side;
    if (side === 1 && this.battle.kind === 'trainer') {
      await scene.offerSwitchBeforeEnemy(event);
      await this.say('trainer_sends', { TRAINER: scene.trainerTitle, CREATURE: creatureName(this.creatureAt(1, event.index)) });
    } else if (side === 0) {
      await this.say('player_sends', { CREATURE: creatureName(this.creatureAt(0, event.index)) }, { wait: false });
    }
    scene.showCreature(side, event);
    hooks.playSfx('capsule_open');
    hooks.playSfx(`cry_${event.species}`);
    await scene.slide(side, side === 0 ? -48 : 48, 0, 0.3);
  }

  async switch_out(event) {
    if (event.side === 0) await this.say('player_recalls', { CREATURE: creatureName(this.creatureAt(0, event.index)) }, { wait: false });
    await this.scene.slide(event.side, 0, event.side === 0 ? -64 : 64, 0.3);
    this.scene.shown[event.side].visible = false;
    this.scene.shown[event.side].hudVisible = false;
  }

  async faint(event) {
    const shown = this.scene.shown[event.side];
    hooks.playSfx('faint');
    await this.scene.tween(0.4, (t) => { shown.clipBottom = Math.round(t * 48); });
    shown.visible = false;
    shown.clipBottom = 0;
    shown.hudVisible = event.side === 0 ? shown.hudVisible : false;
    await this.say('faint', { CREATURE: this.nameOf(event.side, event.index) });
  }

  // ---- Moves -----------------------------------------------------------------

  async move_used(event, rest) {
    const move = MOVES_BY_ID[event.move];
    await this.say('move_used', { CREATURE: this.nameOf(event.side), MOVE: move.name }, { wait: false });
    const next = rest.find((other) => other.type !== 'confused');
    const lands = next && !OUTCOME_EVENTS.includes(next.type) && next.type !== 'charging';
    if (!lands) return;
    const selfMove = move.category === 'status' && ['self_stat_up', 'heal_half', 'rest', 'protect', 'screen', 'crit_up', 'haze'].includes(move.effect);
    const from = spriteCenter(event.side);
    const to = spriteCenter(selfMove ? event.side : 1 - event.side);
    await this.scene.playAnimation(TYPE_ANIMATIONS[move.type], from, to);
  }

  move_failed() { return this.say('move_failed'); }
  charging(event) { return this.say('charging', { CREATURE: this.nameOf(event.side) }); }
  miss(event) { return this.say('miss', { CREATURE: this.nameOf(event.side) }); }
  protected(event) { return this.say('protected', { CREATURE: this.nameOf(event.side) }); }
  critical() { return this.say('critical'); }
  hits(event) { return this.say('hits', { NUMBER: event.count }); }
  ohko() { return this.say('ohko'); }

  effectiveness(event) {
    if (event.value === 0) return this.say('no_effect', { TARGET: this.nameOf(event.side) });
    return this.say(event.value > 1 ? 'super_effective' : 'not_very_effective');
  }

  async damage(event, rest) {
    const { scene } = this;
    if (event.source === 'move') {
      const effectiveness = rest.find((other) => other.type === 'effectiveness')?.value ?? 1;
      hooks.playSfx(effectiveness > 1 ? 'hit_super' : effectiveness < 1 ? 'hit_weak' : 'hit');
      const strong = rest.some((other) => other.type === 'effectiveness' && other.value > 1) || event.amount >= event.maxHp * 0.4;
      await Promise.all([scene.blink(event.side, BLINK_COUNT), strong ? scene.shakeScreen(0.3) : null]);
    } else if (event.source === 'recoil' || event.source === 'struggle') {
      await this.say('recoil', { CREATURE: this.nameOf(event.side) }, { wait: false });
    } else if (event.source === 'leech') {
      await this.say('leech_damage', { CREATURE: this.nameOf(event.side) }, { wait: false });
    } else if (event.source === 'trap') {
      await this.say('trap_damage', { CREATURE: this.nameOf(event.side) }, { wait: false });
    }
    await this.animateHp(event.side, event.hp);
  }

  async heal(event) {
    const activeIndex = this.battle.sides[event.side].active;
    if (event.index === undefined || event.index === activeIndex) await this.animateHp(event.side, event.hp);
    const key = event.source === 'drain' ? 'drain' : 'heal';
    await this.say(key, { CREATURE: this.nameOf(event.side, event.index) });
  }

  async animateHp(side, target) {
    const shown = this.scene.shown[side];
    const start = shown.hp;
    if (start === target) return;
    const duration = Math.max(MIN_HP_ANIMATION, (Math.abs(target - start) / shown.maxHp) * HP_SECONDS_PER_BAR);
    await this.scene.tween(duration, (t) => { shown.hp = start + (target - start) * t; });
    shown.hp = target;
  }

  // ---- Statuses ---------------------------------------------------------------

  status_applied(event) {
    this.scene.shown[event.side].status = { id: event.status };
    const key = event.rest ? 'status_som_rest' : `status_${event.status}${event.badly ? '_badly' : ''}`;
    return this.say(key, { CREATURE: this.nameOf(event.side) });
  }

  status_cured(event) {
    if (event.index === undefined || event.index === this.battle.sides[event.side].active) this.scene.shown[event.side].status = null;
    if (event.reason === 'rest') return null;
    return this.say(`cured_${event.reason}`, { CREATURE: this.nameOf(event.side, event.index) });
  }

  status_prevented(event) { return this.say(`prevented_${event.reason}`, { CREATURE: this.nameOf(event.side) }); }

  async status_damage(event) {
    await this.say(`status_damage_${event.status}`, { CREATURE: this.nameOf(event.side) }, { wait: false });
    await this.scene.blink(event.side, 1);
    await this.animateHp(event.side, event.hp);
  }

  confused(event) { return this.say('confused', { CREATURE: this.nameOf(event.side) }, { wait: false }); }
  confusion_hit() { return this.say('confusion_hit', {}, { wait: false }); }
  volatile_applied(event) { return this.say(`volatile_${event.volatile}`, { CREATURE: this.nameOf(event.side) }); }

  volatile_ended(event) {
    if (event.volatile !== 'confusion' && event.volatile !== 'trap') return null;
    return this.say(`ended_${event.volatile}`, { CREATURE: this.nameOf(event.side) });
  }

  async stat_change(event) {
    const variables = { STAT: STAT_LABELS[event.stat], CREATURE: this.nameOf(event.side) };
    if (event.blocked) {
      await this.say(event.delta >= 0 && event.stage >= 6 ? 'stat_blocked_up' : 'stat_blocked_down', variables);
      return;
    }
    const up = event.delta > 0;
    hooks.playSfx(up ? 'stat_up' : 'stat_down');
    const center = spriteCenter(event.side);
    await this.scene.playAnimation(up ? STAT_ANIMATIONS.up : STAT_ANIMATIONS.down, center, center);
    const strong = Math.abs(event.delta) >= 2 ? '_2' : '';
    await this.say(`stat_${up ? 'up' : 'down'}${strong}`, variables);
  }

  stats_reset() { return this.say('stats_reset'); }
  screen_up(event) { return this.say(`screen_up_${event.category}`); }
  screen_down() { return this.say('screen_down'); }

  // ---- Items, capture, running ----------------------------------------------------

  item_used(event) {
    this.scene.onItemConsumed(event);
    const item = ITEMS_BY_ID[event.item].name;
    if (event.side === 1) return this.say('trainer_item_used', { TRAINER: this.scene.trainerTitle, ITEM: item });
    if (ITEMS_BY_ID[event.item].use.effect === 'catch') return this.scene.throwCapsule(item);
    return this.say('item_used', { PLAYER: this.scene.playerName, ITEM: item });
  }

  item_failed() { return this.say('item_failed'); }
  capture_blocked() { return this.say('capture_blocked'); }
  revive(event) { return this.say('revive', { CREATURE: this.nameOf(event.side, event.index) }); }
  pp_restored(event) { return this.say('pp_restored', { CREATURE: this.nameOf(event.side, event.index) }); }

  async capture_shake() {
    const { scene } = this;
    hooks.playSfx('capsule_shake');
    const center = { ...scene.view.capsule };
    await scene.tween(0.5, (t) => { scene.view.capsule.x = center.x + Math.round(Math.sin(t * Math.PI * 4) * 3); });
    scene.view.capsule.x = center.x;
    await scene.wait(0.3);
  }

  async capture_success(event) {
    const { scene } = this;
    await scene.playAnimation(CAPTURE_STARS, scene.view.capsule, scene.view.capsule);
    hooks.playSfx('jingle_capture');
    await this.say('capture_success', { CREATURE: CREATURES_BY_ID[event.species].name });
  }

  async capture_fail(event) {
    const { scene } = this;
    scene.view.capsule = null;
    scene.shown[1].visible = true;
    await this.say(`capture_fail_${event.shakes}`);
  }

  run_success() {
    hooks.playSfx('run');
    return this.say('run_success');
  }
  run_fail() { return this.say('run_fail'); }
  run_blocked(event) { return this.say(`run_blocked_${event.reason}`); }

  // ---- Experience -------------------------------------------------------------------

  isShownPlayerCreature(index) {
    return index === this.battle.sides[0].active && this.scene.shown[0].visible;
  }

  async exp_gain(event) {
    const { scene } = this;
    await this.say('exp_gain', { CREATURE: creatureName(this.creatureAt(0, event.index)), NUMBER: event.amount }, { wait: false });
    const tracker = scene.expTracker(event.index);
    tracker.exp += event.amount;
    if (this.isShownPlayerCreature(event.index)) await this.fillExpBar(event.index);
  }

  /** Fills the bar up to the next level threshold (level_up events continue the filling). */
  async fillExpBar(index) {
    const { scene } = this;
    const tracker = scene.expTracker(index);
    const growth = CREATURES_BY_ID[this.creatureAt(0, index).species].growth;
    const low = expForLevel(growth, tracker.level);
    const high = expForLevel(growth, tracker.level + 1);
    const target = Math.min(1, (Math.min(tracker.exp, high) - low) / Math.max(1, high - low));
    const shown = scene.shown[0];
    const start = shown.expRatio;
    hooks.playSfx('exp');
    await scene.tween(Math.max(0.2, (target - start) * 1.2), (t) => { shown.expRatio = start + (target - start) * t; });
  }

  async level_up(event) {
    const { scene } = this;
    const tracker = scene.expTracker(event.index);
    tracker.level = event.level;
    const shownCreature = this.isShownPlayerCreature(event.index);
    if (shownCreature) {
      Object.assign(scene.shown[0], { level: event.level, maxHp: event.stats.hp });
      scene.shown[0].hp = Math.min(event.stats.hp, scene.shown[0].hp + event.stats.hp - event.previousStats.hp);
      scene.shown[0].expRatio = 0;
    }
    hooks.playSfx('jingle_level_up');
    await this.say('level_up', { CREATURE: creatureName(this.creatureAt(0, event.index)), NUMBER: event.level });
    await scene.showStatGains(event.previousStats, event.stats);
    if (shownCreature) await this.fillExpBar(event.index);
  }

  move_learned(event) {
    return this.say('move_learned', { CREATURE: creatureName(this.creatureAt(0, event.index)), MOVE: MOVES_BY_ID[event.move].name });
  }

  async learn_move_prompt(event) {
    const { scene } = this;
    const creature = this.creatureAt(0, event.index);
    const slot = await chooseMoveToForget(scene.manager, creature, event.move);
    const result = answerLearnMove(scene.battle, slot);
    scene.battle = result.state;
  }

  evolution_pending(event) {
    this.scene.evolutions.push(event);
  }

  money_gain(event) {
    this.scene.moneyGained = event.amount;
  }
}
