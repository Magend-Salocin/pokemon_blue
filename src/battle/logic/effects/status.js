// Effects that inflict a major status or a volatile effect on the target.
import { activeOf } from '../battle-state.js';
import { typesOf } from '../damage.js';
import { applyConfusion, applyMajorStatus } from '../status.js';

const major = (statusId, options) => ({
  apply: (ctx) => applyMajorStatus(ctx.state, ctx.target, statusId, ctx.rng, ctx.events, options),
});

export default {
  burn: major('brl'),
  poison: major('psn'),
  bad_poison: major('psn', { badly: true }),
  paralyze: major('par'),
  sleep: major('som'),
  freeze: major('gel'),

  tri_status: {
    apply: (ctx) => applyMajorStatus(ctx.state, ctx.target, ctx.rng.pick(['brl', 'gel', 'par']), ctx.rng, ctx.events),
  },

  confuse: { apply: (ctx) => applyConfusion(ctx.state, ctx.target, ctx.rng, ctx.events) },

  flinch: {
    // Only works if the target has not acted yet this turn.
    apply(ctx) {
      const { volatile } = ctx.state.sides[ctx.target];
      if (volatile.acted || activeOf(ctx.state, ctx.target).hp <= 0) return false;
      volatile.flinch = true;
      return true;
    },
  },

  leech: {
    apply(ctx) {
      const { volatile } = ctx.state.sides[ctx.target];
      if (volatile.leech || typesOf(activeOf(ctx.state, ctx.target)).includes('flore')) return false;
      volatile.leech = true;
      ctx.events.push({ type: 'volatile_applied', side: ctx.target, volatile: 'leech' });
      return true;
    },
  },

  trap: {
    apply(ctx) {
      const { volatile } = ctx.state.sides[ctx.target];
      if (volatile.trap || activeOf(ctx.state, ctx.target).hp <= 0) return false;
      volatile.trap = { turns: ctx.rng.int(...ctx.move.effectParams.turns) };
      ctx.events.push({ type: 'volatile_applied', side: ctx.target, volatile: 'trap', move: ctx.move.id });
      return true;
    },
  },
};
