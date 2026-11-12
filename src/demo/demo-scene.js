import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../engine/constants.js';
import { GLYPH_HP, GLYPH_LEVEL, drawText, measureText } from '../gfx/font.js';
import { getActivePalette, getColor } from '../gfx/palette.js';
import { AtlasViewerScene } from '../debug/atlas-viewer-scene.js';
import { askYesNo } from '../ui/dialog-box.js';
import { drawWindowFrame } from '../ui/window-frame.js';

const DEMO_CONTEXT = { PLAYER: 'Elio', RIVAL: 'Nora', CREATURE: 'Fenouillot', ITEM: 'Capsule', NUMBER: 3 };

const DEMO_TEXT = [
  'Bonjour, {PLAYER} ! Je suis Morvan.',
  '{RIVAL} a choisi {CREATURE} !',
  'Vois-tu bien « é à ç ô œ » ?',
].join('\f');

const ACCENT_SAMPLE = 'éèêëàâçîïôùûœ';
const SYMBOL_SAMPLE = `ÉÈÀÇ «» … ♂♀ ${GLYPH_HP} ${GLYPH_LEVEL}`;

function drawCentered(ctx, text, y) {
  drawText(ctx, text, Math.floor((SCREEN_WIDTH - measureText(text)) / 2), y);
}

/** Test scene for prompt 01: palette, font, window frame and dialog box. */
export class DemoScene {
  transparent = false;
  blocksInput = true;

  constructor() {
    this.running = false;
    this.answer = null;
  }

  enter(manager) {
    this.manager = manager;
    manager.fadeIn({ color: 'black', duration: 0.6 }).then(() => this.runDemo());
  }

  async runDemo() {
    this.running = true;
    this.answer = await askYesNo(this.manager, DEMO_TEXT, { context: DEMO_CONTEXT });
    this.running = false;
  }

  update(dt, input) {
    if (this.running) return;
    if (input.justPressed('a')) this.runDemo();
    else if (input.justPressed('select') && !input.isDown('start')) this.manager.push(new AtlasViewerScene());
  }

  render(ctx) {
    ctx.fillStyle = getColor(0);
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    drawWindowFrame(ctx, 0, 0, SCREEN_WIDTH, 32);
    drawCentered(ctx, 'BESTIORA AZUR', 12);

    drawCentered(ctx, ACCENT_SAMPLE, 36);
    drawCentered(ctx, SYMBOL_SAMPLE, 48);
    this.renderSwatches(ctx, 62);
    drawCentered(ctx, `Palette ${getActivePalette().name}`, 76);

    if (this.answer !== null) {
      drawCentered(ctx, `Réponse : ${this.answer ? 'OUI' : 'NON'}`, 88);
    }
    if (!this.running) {
      drawWindowFrame(ctx, 0, 96, SCREEN_WIDTH, 48);
      drawText(ctx, 'A:démo SEL:atlas', 8, 108);
      drawText(ctx, 'SEL+START: palette', 8, 124);
    }
  }

  renderSwatches(ctx, y) {
    const swatchWidth = 16;
    const x = (SCREEN_WIDTH - 4 * swatchWidth) / 2;
    ctx.fillStyle = getColor(3);
    ctx.fillRect(x - 1, y - 1, 4 * swatchWidth + 2, 10);
    for (let index = 0; index < 4; index += 1) {
      ctx.fillStyle = getColor(index);
      ctx.fillRect(x + index * swatchWidth, y, swatchWidth, 8);
    }
  }
}
