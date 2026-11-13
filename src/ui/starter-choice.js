// Starter choice at the lab: the three starters side by side, left/right to browse,
// A asks for confirmation. Resolves with the chosen species id (B does nothing: a choice is required).
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../engine/constants.js';
import { CREATURES_BY_ID } from '../data/creatures.js';
import { TYPES } from '../data/types.js';
import { getText } from '../data/texts/index.js';
import { drawSprite } from '../gfx/draw.js';
import { drawText, measureText } from '../gfx/font.js';
import { getColor } from '../gfx/palette.js';
import { hooks } from '../overworld/hooks.js';
import { askYesNo } from './dialog-box.js';
import { PromiseScene, moveCursor } from './menu-cursor.js';
import { drawWindowFrame } from './window-frame.js';

export const STARTER_IDS = ['fenouillot', 'braisille', 'flaquin'];
const SLOT_X = [4, 56, 108];
const SPRITE_Y = 28;

export class StarterChoiceScene extends PromiseScene {
  constructor() {
    super();
    this.index = 0;
    this.busy = false;
    this.time = 0;
  }

  get species() {
    return CREATURES_BY_ID[STARTER_IDS[this.index]];
  }

  update(dt, input) {
    this.time += dt;
    if (this.busy) return;
    const previous = this.index;
    this.index = moveCursor(this.index, STARTER_IDS.length, input, { columns: STARTER_IDS.length });
    if (previous !== this.index) {
      hooks.playSfx('cursor');
      hooks.playSfx(`cry_${this.species.id}`);
    }
    if (input.justPressed('a')) this.confirm();
  }

  async confirm() {
    this.busy = true;
    const { species } = this;
    const text = getText('starter_confirm');
    const yes = await askYesNo(this.manager, text, { context: { CREATURE: species.name, TYPE: TYPES[species.types[0]].name } });
    this.busy = false;
    if (yes) this.done(species.id);
  }

  render(ctx) {
    ctx.fillStyle = getColor(0);
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    drawWindowFrame(ctx, 0, 0, SCREEN_WIDTH, 24);
    const title = getText('starter_title');
    drawText(ctx, title, Math.floor((SCREEN_WIDTH - measureText(title)) / 2), 8);
    STARTER_IDS.forEach((id, slot) => {
      const bob = slot === this.index && Math.floor(this.time * 3) % 2 === 0 ? -2 : 0;
      drawSprite(ctx, 'creatures', `${id}/front`, SLOT_X[slot], SPRITE_Y + bob);
    });
    const cursorX = SLOT_X[this.index] + 20;
    drawText(ctx, '▼', cursorX, SPRITE_Y - 4 + 52);
    const { species } = this;
    const label = `${species.name}  ${TYPES[species.types[0]].name}`;
    drawText(ctx, label, Math.floor((SCREEN_WIDTH - measureText(label)) / 2), 86);
    if (!this.busy) {
      drawWindowFrame(ctx, 0, 96, SCREEN_WIDTH, 48);
      drawText(ctx, getText('starter_hint'), 8, 108);
      drawText(ctx, getText('starter_hint_2'), 8, 124);
    }
  }
}

export function chooseStarter(manager) {
  return manager.push(new StarterChoiceScene()).promise;
}
