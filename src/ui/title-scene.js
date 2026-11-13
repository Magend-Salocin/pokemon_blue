// Title screen: logo, Azurel silhouette that floats, « APPUYEZ SUR START » blinking.
// Then CONTINUER (when a save exists), NOUVELLE PARTIE, OPTIONS.
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../engine/constants.js';
import { drawSprite } from '../gfx/draw.js';
import { drawText, measureText } from '../gfx/font.js';
import { getColor } from '../gfx/palette.js';
import { ListMenu } from './components/list-menu.js';
import { openOptions } from './options-screen.js';
import { hooks } from '../overworld/hooks.js';

export class TitleScene {
  transparent = false;
  blocksInput = true;

  /** onChoice(choice) is called with 'continue' or 'new'. hasSave tells whether CONTINUER is shown. */
  constructor({ hasSave = false, onChoice }) {
    this.hasSave = hasSave;
    this.onChoice = onChoice;
    this.time = 0;
    this.menu = null;
    this.busy = false;
  }

  enter(manager) {
    this.manager = manager;
    manager.fadeIn({ color: 'black', duration: 0.6 });
    hooks.playMusic('title');
  }

  get entries() {
    return [...(this.hasSave ? [{ id: 'continue', label: 'CONTINUER' }] : []), { id: 'new', label: 'NOUVELLE PARTIE' }, { id: 'options', label: 'OPTIONS' }];
  }

  async select(id) {
    if (id === 'options') {
      this.busy = true;
      await openOptions(this.manager);
      this.busy = false;
      return;
    }
    this.busy = true;
    await this.manager.fadeOut();
    this.onChoice(id);
  }

  update(dt, input) {
    this.time += dt;
    if (this.busy) return;
    if (!this.menu) {
      if (input.justPressed('start') || input.justPressed('a')) {
        this.menu = new ListMenu(this.entries.map((entry) => ({ label: entry.label })), { x: 8, y: 80, width: 144, rows: this.entries.length, rowHeight: 14 });
      }
      return;
    }
    const result = this.menu.update(dt, input);
    if (!result) return;
    if (result.value === null) this.menu = null;
    else this.select(this.entries[result.value].id);
  }

  render(ctx) {
    ctx.fillStyle = getColor(0);
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    drawSprite(ctx, 'ui', 'logo/bestiora', 15, 8);
    drawSprite(ctx, 'ui', 'logo/azur', 47, 30);
    const float = Math.round(Math.sin(this.time * 2) * 3);
    drawSprite(ctx, 'ui', 'title/azurel', 56, 52 + float);
    if (this.menu) {
      this.menu.render(ctx);
    } else if (Math.floor(this.time * 2) % 2 === 0) {
      const text = 'APPUYEZ SUR START';
      drawText(ctx, text, Math.floor((SCREEN_WIDTH - measureText(text)) / 2), 116);
    }
  }
}
