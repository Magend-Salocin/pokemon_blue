// Evolution: the old and new silhouettes alternate faster and faster. B cancels (except for
// stone evolutions). Then the new form may learn moves at its current level.
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../engine/constants.js';
import { createCanvas } from '../gfx/bitmap.js';
import { drawSprite } from '../gfx/draw.js';
import { getColor, getPaletteKey } from '../gfx/palette.js';
import { evolveCreature, getSpecies, movesLearnedAt } from '../battle/logic/creature.js';
import { hooks } from '../overworld/hooks.js';
import { getGameState, markCaught } from '../state/game-state.js';
import { creatureName } from './creature-widgets.js';
import { learnMoveOutsideBattle, sayBattle } from './learn-move.js';
import { PromiseScene } from './menu-cursor.js';

const DURATION = 4;
const SPRITE_X = 56;
const SPRITE_Y = 32;
const silhouetteCache = new Map();

/** The front sprite filled with the darkest color. */
function silhouette(species) {
  const key = `${species}|${getPaletteKey()}`;
  if (!silhouetteCache.has(key)) {
    const canvas = createCanvas(48, 48);
    const context = canvas.getContext('2d');
    drawSprite(context, 'creatures', `${species}/front`, 0, 0);
    context.globalCompositeOperation = 'source-in';
    context.fillStyle = getColor(3);
    context.fillRect(0, 0, 48, 48);
    silhouetteCache.set(key, canvas);
  }
  return silhouetteCache.get(key);
}

/** Phase of the alternation: which form shows at time t (faster near the end). */
export function showsNewForm(time) {
  const progress = Math.min(1, time / DURATION);
  const frequency = 1 + progress * progress * 9; // 1 → 10 switches per second
  return Math.floor(time * frequency) % 2 === 1;
}

export class EvolutionScene extends PromiseScene {
  constructor(creature, targetId, { canCancel = true } = {}) {
    super();
    this.creature = creature;
    this.from = creature.species;
    this.targetId = targetId;
    this.canCancel = canCancel;
    this.phase = 'intro';
    this.time = 0;
  }

  enter(manager) {
    super.enter(manager);
    this.run();
  }

  async run() {
    const name = creatureName(this.creature);
    await sayBattle(this.manager, 'evolution_start', { CREATURE: name });
    this.phase = 'morphing';
    const cancelled = await new Promise((resolve) => {
      this.finishMorph = resolve;
    });
    if (cancelled) {
      this.phase = 'cancelled';
      await sayBattle(this.manager, 'evolution_cancel', { CREATURE: name });
      this.done(false);
      return;
    }
    evolveCreature(this.creature, this.targetId);
    markCaught(getGameState(), this.targetId);
    this.phase = 'done';
    hooks.playSfx('jingle_evolution');
    await sayBattle(this.manager, 'evolution_done', { CREATURE: name, TARGET: getSpecies(this.targetId).name });
    for (const moveId of movesLearnedAt(this.targetId, this.creature.level)) {
      await learnMoveOutsideBattle(this.manager, this.creature, moveId);
    }
    this.done(true);
  }

  update(dt, input) {
    if (this.phase !== 'morphing') return;
    this.time += dt;
    if (this.canCancel && input.justPressed('b')) this.finishMorph(true);
    else if (this.time >= DURATION) this.finishMorph(false);
  }

  render(ctx) {
    ctx.fillStyle = getColor(0);
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    if (this.phase === 'morphing') {
      ctx.drawImage(silhouette(showsNewForm(this.time) ? this.targetId : this.from), SPRITE_X, SPRITE_Y);
    } else {
      const species = this.phase === 'done' ? this.targetId : this.from;
      drawSprite(ctx, 'creatures', `${species}/front`, SPRITE_X, SPRITE_Y);
    }
  }
}

export function playEvolution(manager, creature, targetId, options) {
  return manager.push(new EvolutionScene(creature, targetId, options)).promise;
}
