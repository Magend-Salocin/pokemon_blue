// Items used during battle: healing, revival, status cures, PP and capsules (capture is in engine.js).
import { ITEMS_BY_ID } from '../../data/items.js';

export const BATTLE_ITEM_EFFECTS = ['heal_hp', 'revive', 'cure_status', 'restore_pp', 'catch'];

export function getBattleItem(itemId) {
  const item = ITEMS_BY_ID[itemId];
  if (!item || !BATTLE_ITEM_EFFECTS.includes(item.use.effect) || !['battle', 'both'].includes(item.use.context)) return null;
  return item;
}

/** Why `item` cannot be used on `creature` (null = usable). `moveIndex` for PP items. */
export function itemProblem(item, creature, moveIndex) {
  const { effect, params } = item.use;
  if (effect === 'catch') return null;
  if (!creature) return 'no_target';
  if (effect === 'revive') return creature.hp > 0 ? 'not_fainted' : null;
  if (creature.hp <= 0) return 'fainted';
  if (effect === 'heal_hp') return creature.hp >= creature.stats.hp ? 'hp_full' : null;
  if (effect === 'cure_status') {
    if (!creature.status) return 'no_status';
    return params.status === 'all' || params.status === creature.status.id ? null : 'wrong_status';
  }
  if (effect === 'restore_pp') {
    const slots = params.allMoves ? creature.moves : [creature.moves[moveIndex]];
    if (slots.some((slot) => !slot)) return 'no_target';
    return slots.some((slot) => slot.pp < slot.maxPp) ? null : 'pp_full';
  }
  return 'unusable';
}

/** Applies a non-capture item to a party creature; returns the events. */
export function applyItem(item, creature, side, index, moveIndex) {
  const { effect, params } = item.use;
  const events = [];
  if (effect === 'heal_hp') {
    const amount = params.amount === 'full' ? creature.stats.hp : params.amount;
    const restored = Math.min(creature.stats.hp - creature.hp, amount);
    creature.hp += restored;
    events.push({ type: 'heal', side, index, amount: restored, hp: creature.hp, maxHp: creature.stats.hp, source: 'item' });
  } else if (effect === 'revive') {
    creature.hp = Math.max(1, Math.floor(creature.stats.hp * params.fraction));
    creature.status = null;
    events.push({ type: 'revive', side, index, hp: creature.hp, maxHp: creature.stats.hp });
  } else if (effect === 'cure_status') {
    events.push({ type: 'status_cured', side, index, status: creature.status.id, reason: 'item' });
    creature.status = null;
  } else if (effect === 'restore_pp') {
    const slots = params.allMoves ? creature.moves : [creature.moves[moveIndex]];
    for (const slot of slots) slot.pp = Math.min(slot.maxPp, slot.pp + params.amount);
    events.push({ type: 'pp_restored', side, index, moves: slots.map((slot) => slot.id) });
  }
  return events;
}
