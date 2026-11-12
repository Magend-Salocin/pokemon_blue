// Healing, protection and screens (moves the user casts on itself or its side).
import { activeOf } from '../battle-state.js';
import { REST_SLEEP_TURNS, cureStatus, heal } from '../status.js';

const fullHp = (ctx) => {
  const creature = activeOf(ctx.state, ctx.side);
  return creature.hp >= creature.stats.hp;
};

export default {
  heal_half: {
    affects: 'self',
    check: (ctx) => (fullHp(ctx) ? 'hp_full' : null),
    apply: (ctx) => heal(ctx.state, ctx.side, Math.floor(activeOf(ctx.state, ctx.side).stats.hp / 2), ctx.events, 'move') > 0,
  },

  rest: {
    affects: 'self',
    check: (ctx) => (fullHp(ctx) && !activeOf(ctx.state, ctx.side).status ? 'hp_full' : null),
    apply(ctx) {
      const creature = activeOf(ctx.state, ctx.side);
      if (creature.status?.id !== 'som') cureStatus(creature, ctx.side, ctx.events, 'rest');
      heal(ctx.state, ctx.side, creature.stats.hp, ctx.events, 'move');
      creature.status = { id: 'som', turns: REST_SLEEP_TURNS };
      ctx.events.push({ type: 'status_applied', side: ctx.side, status: 'som', badly: false, rest: true });
      return true;
    },
  },

  protect: {
    affects: 'self',
    // Success chance halves with each consecutive use: 1, 1/2, 1/4…
    apply(ctx) {
      const { volatile } = ctx.state.sides[ctx.side];
      const chance = 1 / 2 ** volatile.protectChain;
      if (ctx.rng.next() >= chance) {
        volatile.protectChain = 0;
        return false;
      }
      volatile.protect = true;
      volatile.protectChain += 1;
      ctx.events.push({ type: 'volatile_applied', side: ctx.side, volatile: 'protect' });
      return true;
    },
  },

  screen: {
    affects: 'self',
    apply(ctx) {
      const { category, turns } = ctx.move.effectParams;
      const { screens } = ctx.state.sides[ctx.side];
      if (screens[category] > 0) return false;
      screens[category] = turns;
      ctx.events.push({ type: 'screen_up', side: ctx.side, category });
      return true;
    },
  },
};
