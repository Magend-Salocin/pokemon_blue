// Every move effect of src/data/move-effects.js maps to a handler here (tested for coverage).
//
// Handler contract (all members optional):
//   affects  'self' | 'target' (default). A 'self' status move skips accuracy and protection,
//            and a 'self' secondary effect applies even if the target fainted.
//   check(ctx)  → failure reason or null, before the accuracy check (move_failed).
//   hits(ctx)   → [{ damage, effectiveness, critical, fixed?, ohko? }] instead of one standard hit.
//   apply(ctx)  → boolean. Primary effect of a status move, or secondary effect of a damaging
//                 move (the engine rolls effectChance first; null = always).
//   after(ctx)  → always runs after a damaging move hits (recoil, drain, recharge…).
//   onMiss(ctx) → runs when the move misses.
//   charge      → true for two-turn moves.
// ctx = { state, rng, events, side, target, move, moveIndex, totalDamage, standardHit() }
import damage from './damage.js';
import stats from './stats.js';
import status from './status.js';
import support from './support.js';

export const EFFECT_HANDLERS = { ...damage, ...status, ...stats, ...support };

export function getEffectHandler(effect) {
  const handler = EFFECT_HANDLERS[effect];
  if (!handler) throw new Error(`Unimplemented move effect: ${effect}`);
  return handler;
}
