// Name entry: character grid, 10 characters max. A types, B erases, START jumps to FIN.
// Resolves with the name, or `defaultName` when left empty. Used for nicknames, the player and the rival.
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../engine/constants.js';
import { drawText } from '../gfx/font.js';
import { getColor } from '../gfx/palette.js';
import { PromiseScene, moveCursor } from './menu-cursor.js';
import { drawWindowFrame } from './window-frame.js';

export const NAME_MAX_LENGTH = 10;
const GRID = [
  'ABCDEFGHIJ',
  'KLMNOPQRST',
  'UVWXYZ-\'.!',
  'abcdefghij',
  'klmnopqrst',
  'uvwxyzéèêà',
  'çôîùëï ?♂♀',
];
const COLUMNS = 10;
const ERASE = 'EFF';
const FINISH = 'FIN';
const CELLS = [...GRID.flatMap((row) => Array.from(row)), ERASE, FINISH];

/** Pure editing step: returns { name, finished } after choosing `cell`. */
export function applyNameCell(name, cell) {
  if (cell === FINISH) return { name, finished: true };
  if (cell === ERASE) return { name: Array.from(name).slice(0, -1).join(''), finished: false };
  if (Array.from(name).length >= NAME_MAX_LENGTH) return { name, finished: false };
  return { name: name + cell, finished: false };
}

export class NameEntryScene extends PromiseScene {
  constructor({ title, defaultName = '', initial = '' }) {
    super();
    this.title = title;
    this.defaultName = defaultName;
    this.name = initial;
    this.index = 0;
  }

  get cellCount() {
    return CELLS.length;
  }

  update(dt, input) {
    // The last row holds EFF and FIN, under the first two columns' halves.
    this.index = moveCursor(this.index, this.cellCount, input, { columns: COLUMNS });
    if (input.justPressed('start')) this.index = CELLS.indexOf(FINISH);
    if (input.justPressed('b')) this.name = applyNameCell(this.name, ERASE).name;
    if (!input.justPressed('a')) return;
    const { name, finished } = applyNameCell(this.name, CELLS[this.index]);
    this.name = name;
    if (finished) this.done(this.name.trim() || this.defaultName);
  }

  render(ctx) {
    ctx.fillStyle = getColor(0);
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    drawWindowFrame(ctx, 0, 0, SCREEN_WIDTH, 32);
    drawText(ctx, this.title, 8, 6);
    const shown = Array.from(this.name);
    for (let i = 0; i < NAME_MAX_LENGTH; i += 1) drawText(ctx, shown[i] ?? '_', 40 + i * 8, 18);

    CELLS.forEach((cell, index) => {
      const row = Math.floor(index / COLUMNS);
      const column = index % COLUMNS;
      const isSpecial = cell === ERASE || cell === FINISH;
      const x = isSpecial ? 16 + column * 64 : column * 16;
      const y = 38 + row * 12;
      if (index === this.index) drawText(ctx, '▶', x, y);
      drawText(ctx, cell === ' ' ? '_' : cell, x + 8, y);
    });
  }
}

export function enterName(manager, options) {
  return manager.push(new NameEntryScene(options)).promise;
}
