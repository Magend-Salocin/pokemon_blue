// Effects on stat stages and the critical-hit rate.
import { freshStages } from '../battle-state.js';
import { changeStages } from '../status.js';

export default {
  target_stat_down: {
    apply: (ctx) => changeStages(ctx.state, ctx.target, ctx.move.effectParams.stats, ctx.events),
  },

  self_stat_up: {
    affects: 'self',
    apply: (ctx) => changeStages(ctx.state, ctx.side, ctx.move.effectParams.stats, ctx.events),
  },

  self_stat_down: {
    affects: 'self',
    apply: (ctx) => {
      changeStages(ctx.state, ctx.side, ctx.move.effectParams.stats, ctx.events);
      return true;
    },
  },

  haze: {
    affects: 'self',
    apply(ctx) {
      for (const side of ctx.state.sides) side.stages = freshStages();
      ctx.events.push({ type: 'stats_reset' });
      return true;
    },
  },

  crit_up: {
    affects: 'self',
    apply(ctx) {
      const { volatile } = ctx.state.sides[ctx.side];
      if (volatile.critUp) return false;
      volatile.critUp = true;
      ctx.events.push({ type: 'volatile_applied', side: ctx.side, volatile: 'focus' });
      return true;
    },
  },
};
