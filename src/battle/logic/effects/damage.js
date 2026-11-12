// Effects that change how damage is computed or what happens right after the hit.
// Handler contract: see effects/index.js.
import { activeOf } from '../battle-state.js';
import { getEffectiveness } from '../../../data/types.js';
import { typesOf } from '../damage.js';
import { dealDamage, fraction, heal } from '../status.js';

/** Fixed amount, but a type immunity still blocks it. */
function fixedHit(ctx, amount) {
  const effectiveness = getEffectiveness(ctx.move.type, typesOf(activeOf(ctx.state, ctx.target))) === 0 ? 0 : 1;
  return [{ damage: effectiveness === 0 ? 0 : Math.max(1, amount), effectiveness, critical: false, fixed: true }];
}

/** Number of hits for 2 to 5 hit moves: 2 and 3 (3/8 each), 4 and 5 (1/8 each). */
export function rollHitCount(rng, min, max) {
  if (min === max) return min;
  const roll = rng.next();
  const counts = roll < 3 / 8 ? 2 : roll < 6 / 8 ? 3 : roll < 7 / 8 ? 4 : 5;
  return Math.max(min, Math.min(max, counts));
}

export default {
  damage: {},

  multi_hit: {
    hits(ctx) {
      const count = rollHitCount(ctx.rng, ctx.move.effectParams.min, ctx.move.effectParams.max);
      return Array.from({ length: count }, () => ctx.standardHit());
    },
  },

  fixed_damage: { hits: (ctx) => fixedHit(ctx, ctx.move.effectParams.amount) },
  level_damage: { hits: (ctx) => fixedHit(ctx, activeOf(ctx.state, ctx.side).level) },
  half_hp_damage: { hits: (ctx) => fixedHit(ctx, Math.floor(activeOf(ctx.state, ctx.target).hp / 2)) },

  ohko: {
    check: (ctx) => (activeOf(ctx.state, ctx.target).level > activeOf(ctx.state, ctx.side).level ? 'level_too_low' : null),
    hits: (ctx) => fixedHit(ctx, activeOf(ctx.state, ctx.target).hp).map((hit) => ({ ...hit, ohko: hit.damage > 0 })),
  },

  counter: {
    check(ctx) {
      const taken = ctx.state.sides[ctx.side].volatile.damageTaken;
      return taken?.category === 'physical' && taken.amount > 0 ? null : 'nothing_to_counter';
    },
    hits(ctx) {
      const taken = ctx.state.sides[ctx.side].volatile.damageTaken;
      return [{ damage: taken.amount * 2, effectiveness: 1, critical: false, fixed: true }];
    },
  },

  struggle: {
    after(ctx) {
      dealDamage(ctx.state, ctx.side, fraction(activeOf(ctx.state, ctx.side), 1 / 4), ctx.events, 'struggle');
    },
  },

  self_destruct: {
    after(ctx) {
      dealDamage(ctx.state, ctx.side, activeOf(ctx.state, ctx.side).hp, ctx.events, 'self_destruct');
    },
    onMiss(ctx) {
      dealDamage(ctx.state, ctx.side, activeOf(ctx.state, ctx.side).hp, ctx.events, 'self_destruct');
    },
  },

  recoil: {
    after(ctx) {
      if (ctx.totalDamage <= 0) return;
      dealDamage(ctx.state, ctx.side, Math.max(1, Math.floor(ctx.totalDamage * ctx.move.effectParams.fraction)), ctx.events, 'recoil');
    },
  },

  drain: {
    after(ctx) {
      if (ctx.totalDamage <= 0) return;
      heal(ctx.state, ctx.side, Math.max(1, Math.floor(ctx.totalDamage * ctx.move.effectParams.fraction)), ctx.events, 'drain');
    },
  },

  dream_drain: {
    check: (ctx) => (activeOf(ctx.state, ctx.target).status?.id === 'som' ? null : 'target_awake'),
    after(ctx) {
      if (ctx.totalDamage > 0) heal(ctx.state, ctx.side, Math.max(1, Math.floor(ctx.totalDamage / 2)), ctx.events, 'drain');
    },
  },

  recharge: {
    after(ctx) {
      ctx.state.sides[ctx.side].volatile.recharging = true;
    },
  },

  // The engine runs the charging turn; the second turn is a normal hit.
  charge_turn: { charge: true },

  rampage: {
    after(ctx) {
      const { volatile } = ctx.state.sides[ctx.side];
      if (!volatile.rampage) {
        const [min, max] = ctx.move.effectParams.turns;
        volatile.rampage = { moveIndex: ctx.moveIndex, turns: ctx.rng.int(min, max) - 1 };
      }
    },
  },
};
