// Battle entry transition and the provisional battle screen used until prompts 05 and 06.
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../engine/constants.js';
import { drawText } from '../gfx/font.js';
import { getColor } from '../gfx/palette.js';
import { drawWindowFrame } from '../ui/window-frame.js';

const FLASH_DURATION = 0.36;
const FLASH_COUNT = 3;
const BAND_HEIGHT = 8;
const BANDS_DURATION = 0.6;

/**
 * Transition: the screen flashes three times, then dark bands slide in alternately from
 * the left and the right, each band starting a little after the previous one.
 */
export class BattleTransitionScene {
  transparent = true;
  blocksInput = true;

  constructor() {
    this.time = 0;
    this.promise = new Promise((resolve) => {
      this.resolve = resolve;
    });
  }

  enter(manager) {
    this.manager = manager;
  }

  update(dt) {
    this.time += dt;
    if (this.time >= FLASH_DURATION + BANDS_DURATION && !this.done) {
      this.done = true;
      this.resolve();
    }
  }

  render(ctx) {
    if (this.time < FLASH_DURATION) {
      const phase = Math.floor((this.time / FLASH_DURATION) * FLASH_COUNT * 2);
      if (phase % 2 === 0) {
        ctx.fillStyle = getColor(3);
        ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
      }
      return;
    }
    const progress = (this.time - FLASH_DURATION) / BANDS_DURATION;
    const bands = SCREEN_HEIGHT / BAND_HEIGHT;
    ctx.fillStyle = getColor(3);
    for (let band = 0; band < bands; band += 1) {
      const start = (band / bands) * 0.5;
      const local = Math.max(0, Math.min(1, (progress - start) / 0.5));
      const width = Math.round(local * SCREEN_WIDTH);
      const x = band % 2 === 0 ? 0 : SCREEN_WIDTH - width;
      ctx.fillRect(x, band * BAND_HEIGHT, width, BAND_HEIGHT);
    }
  }
}

/** Provisional battle: shows who the opponent is; A or B ends it with a victory. */
export class BattlePlaceholderScene {
  transparent = false;
  blocksInput = true;

  constructor(lines) {
    this.lines = lines;
    this.promise = new Promise((resolve) => {
      this.resolve = resolve;
    });
  }

  enter(manager) {
    this.manager = manager;
  }

  update(dt, input) {
    if (input.justPressed('a') || input.justPressed('b')) {
      this.manager.pop();
      this.resolve('win');
    }
  }

  render(ctx) {
    ctx.fillStyle = getColor(0);
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    drawWindowFrame(ctx, 0, 40, SCREEN_WIDTH, 64);
    this.lines.forEach((line, index) => drawText(ctx, line, 8, 52 + index * 16));
    drawText(ctx, 'A : victoire', 8, 120);
  }
}
