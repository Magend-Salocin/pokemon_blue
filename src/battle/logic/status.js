// Major statuses, volatile effects and shared state helpers used by effects and the engine.
import { MAX_STAGE, MIN_STAGE, activeOf } from './battle-state.js';
import { typesOf } from './damage.js';

export const MAJOR_STATUSES = ['brl', 'psn', 'par', 'som', 'gel'];

/** Types immune to a major status. */
const STATUS_IMMUNITIES = { brl: ['feu'], gel: ['givre'], psn: ['toxique', 'metal'], par: ['foudre'] };

export const PARALYSIS_FAIL_CHANCE = 0.25;
export const THAW_CHANCE = 0.2;
export const CONFUSION_SELF_HIT_CHANCE = 1 / 3;
export const CONFUSION_POWER = 40;
export const SLEEP_TURNS = [1, 3];
export const REST_SLEEP_TURNS = 2;
export const CONFUSION_TURNS = [1, 4];
export const END_OF_TURN_FRACTION = 1 / 8;

export function isStatusImmune(creature, statusId) {
  return (STATUS_IMMUNITIES[statusId] ?? []).some((type) => typesOf(creature).includes(type));
}

/**
 * Gives a major status to the active creature of `side`. Returns false (no event) when
 * it already has one, is immune or has fainted. badly: true = poison grave.
 */
export function applyMajorStatus(state, side, statusId, rng, events, { badly = false } = {}) {
  const creature = activeOf(state, side);
  if (creature.hp <= 0 || creature.status || isStatusImmune(creature, statusId)) return false;
  creature.status = { id: statusId };
  if (statusId === 'som') creature.status.turns = rng.int(...SLEEP_TURNS);
  if (statusId === 'psn' && badly) Object.assign(creature.status, { badly: true, counter: 1 });
  events.push({ type: 'status_applied', side, status: statusId, badly });
  return true;
}

export function cureStatus(creature, side, events, reason) {
  if (!creature.status) return false;
  events.push({ type: 'status_cured', side, status: creature.status.id, reason });
  creature.status = null;
  return true;
}

export function applyConfusion(state, side, rng, events) {
  const { volatile } = state.sides[side];
  if (activeOf(state, side).hp <= 0 || volatile.confusion > 0) return false;
  volatile.confusion = rng.int(...CONFUSION_TURNS);
  events.push({ type: 'volatile_applied', side, volatile: 'confusion' });
  return true;
}

/** Changes stat stages; emits one stat_change per stat (blocked: true at the limit). */
export function changeStages(state, side, changes, events) {
  const { stages } = state.sides[side];
  let changed = false;
  for (const [stat, delta] of Object.entries(changes)) {
    const next = Math.max(MIN_STAGE, Math.min(MAX_STAGE, stages[stat] + delta));
    const applied = next - stages[stat];
    stages[stat] = next;
    changed ||= applied !== 0;
    events.push({ type: 'stat_change', side, stat, delta: applied, stage: next, blocked: applied === 0 });
  }
  return changed;
}

/** Removes HP (clamped) and emits a damage event. Returns the HP removed. */
export function dealDamage(state, side, amount, events, source, extra = {}) {
  const creature = activeOf(state, side);
  const removed = Math.min(creature.hp, Math.max(0, amount));
  creature.hp -= removed;
  events.push({ type: 'damage', side, amount: removed, hp: creature.hp, maxHp: creature.stats.hp, source, ...extra });
  return removed;
}

/** Restores HP (clamped) and emits a heal event. Returns the HP restored. */
export function heal(state, side, amount, events, source) {
  const creature = activeOf(state, side);
  const restored = Math.min(creature.stats.hp - creature.hp, Math.max(0, amount));
  if (restored <= 0) return 0;
  creature.hp += restored;
  events.push({ type: 'heal', side, amount: restored, hp: creature.hp, maxHp: creature.stats.hp, source });
  return restored;
}

export const fraction = (creature, part) => Math.max(1, Math.floor(creature.stats.hp * part));

/**
 * Checks before a move. Returns true when the creature can act. Order: recharge, sleep,
 * freeze, flinch, confusion (may hit itself), paralysis.
 */
export function canAct(state, side, rng, events, hitSelf) {
  const creature = activeOf(state, side);
  const { volatile } = state.sides[side];
  if (volatile.recharging) {
    volatile.recharging = false;
    events.push({ type: 'status_prevented', side, reason: 'recharging' });
    return false;
  }
  if (creature.status?.id === 'som') {
    if (creature.status.turns > 0) {
      creature.status.turns -= 1;
      events.push({ type: 'status_prevented', side, reason: 'asleep' });
      return false;
    }
    cureStatus(creature, side, events, 'wake');
  }
  if (creature.status?.id === 'gel') {
    if (rng.next() >= THAW_CHANCE) {
      events.push({ type: 'status_prevented', side, reason: 'frozen' });
      return false;
    }
    cureStatus(creature, side, events, 'thaw');
  }
  if (volatile.flinch) {
    events.push({ type: 'status_prevented', side, reason: 'flinch' });
    return false;
  }
  if (volatile.confusion > 0) {
    volatile.confusion -= 1;
    if (volatile.confusion === 0) {
      events.push({ type: 'volatile_ended', side, volatile: 'confusion' });
    } else {
      events.push({ type: 'confused', side });
      if (rng.next() < CONFUSION_SELF_HIT_CHANCE) {
        hitSelf();
        return false;
      }
    }
  }
  if (creature.status?.id === 'par' && rng.next() < PARALYSIS_FAIL_CHANCE) {
    events.push({ type: 'status_prevented', side, reason: 'paralyzed' });
    return false;
  }
  return true;
}

/**
 * End of turn for one side, in this fixed order: burn or poison, trap, leech.
 * Leech heals the opponent's active creature.
 */
export function endOfTurnSide(state, side, events) {
  const creature = activeOf(state, side);
  const { volatile } = state.sides[side];
  if (creature.hp <= 0) return;

  const status = creature.status;
  if (status?.id === 'brl' || status?.id === 'psn') {
    const amount = status.badly ? Math.max(1, Math.floor((creature.stats.hp * status.counter) / 16)) : fraction(creature, END_OF_TURN_FRACTION);
    if (status.badly) status.counter += 1;
    const removed = Math.min(creature.hp, amount);
    creature.hp -= removed;
    events.push({ type: 'status_damage', side, status: status.id, amount: removed, hp: creature.hp, maxHp: creature.stats.hp });
    if (creature.hp <= 0) return;
  }
  if (volatile.trap) {
    dealDamage(state, side, fraction(creature, END_OF_TURN_FRACTION), events, 'trap');
    volatile.trap.turns -= 1;
    if (volatile.trap.turns <= 0) {
      volatile.trap = null;
      events.push({ type: 'volatile_ended', side, volatile: 'trap' });
    }
    if (creature.hp <= 0) return;
  }
  if (volatile.leech) {
    const drained = dealDamage(state, side, fraction(creature, END_OF_TURN_FRACTION), events, 'leech');
    const opponent = 1 - side;
    if (activeOf(state, opponent).hp > 0) heal(state, opponent, drained, events, 'leech');
  }
}
