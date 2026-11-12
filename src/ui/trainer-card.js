// Trainer card: name, money, play time, Bestiaire count and the 8 badge slots.
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../engine/constants.js';
import { BADGE_NAMES } from '../data/field-abilities.js';
import { drawSprite } from '../gfx/draw.js';
import { drawText } from '../gfx/font.js';
import { getColor } from '../gfx/palette.js';
import { bestiaryCounts } from './bestiary-screen.js';
import { PromiseScene } from './menu-cursor.js';
import { drawWindowFrame } from './window-frame.js';

export function formatPlayTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  return `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, '0')}`;
}

export class TrainerCardScene extends PromiseScene {
  constructor(state) {
    super();
    this.state = state;
  }

  update(dt, input) {
    if (input.justPressed('a') || input.justPressed('b')) this.done(null);
  }

  render(ctx) {
    const { state } = this;
    ctx.fillStyle = getColor(0);
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    drawWindowFrame(ctx, 0, 0, SCREEN_WIDTH, 80);
    drawText(ctx, `NOM     ${state.player.name}`, 8, 10);
    drawText(ctx, `ARGENT  ${state.money}`, 8, 26);
    drawText(ctx, `TEMPS   ${formatPlayTime(state.playTime)}`, 8, 42);
    drawText(ctx, `BESTIAIRE ${bestiaryCounts(state.bestiary).caught}`, 8, 58);
    drawSprite(ctx, 'trainers', state.player.gender === 'girl' ? 'back/joueuse' : 'back/joueur', 112, 16, {});
    drawWindowFrame(ctx, 0, 80, SCREEN_WIDTH, 64);
    drawText(ctx, 'BADGES', 8, 86);
    Object.keys(BADGE_NAMES).forEach((badge, index) => {
      const x = 12 + (index % 4) * 36;
      const y = 98 + Math.floor(index / 4) * 20;
      if (state.badges.includes(badge)) drawSprite(ctx, 'ui', `badge/${badge}`, x, y);
      else {
        ctx.fillStyle = getColor(1);
        ctx.fillRect(x + 4, y + 4, 8, 8);
      }
    });
  }
}

export function openTrainerCard(manager, state) {
  return manager.push(new TrainerCardScene(state)).promise;
}
