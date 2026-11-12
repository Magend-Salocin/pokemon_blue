import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../engine/constants.js';
import { drawText, measureText } from '../gfx/font.js';
import { getColor } from '../gfx/palette.js';

/** Plain loading screen; `progress` and `error` are set by the loader. */
export class LoadingScene {
  transparent = false;
  blocksInput = true;

  constructor() {
    this.loaded = 0;
    this.total = 0;
    this.error = null;
  }

  setProgress(loaded, total) {
    this.loaded = loaded;
    this.total = total;
  }

  render(ctx) {
    ctx.fillStyle = getColor(0);
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    const lines = this.error
      ? ['Erreur de', 'chargement :', ...this.error.match(/.{1,18}(\s|$)/g).map((line) => line.trim())]
      : ['Chargement…', `${this.loaded}/${this.total}`];
    const top = Math.floor((SCREEN_HEIGHT - lines.length * 12) / 2);
    lines.forEach((line, index) => {
      drawText(ctx, line, Math.floor((SCREEN_WIDTH - measureText(line)) / 2), top + index * 12);
    });
  }
}
