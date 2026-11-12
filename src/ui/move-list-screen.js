// Lists a creature's moves with the details of the selected one (type, power, accuracy, PP).
// Used to forget a move for a new one, and to pick the move of a PP item.
// Resolves with the chosen slot (0-3), or null on B. With `newMove`, it is shown last (not selectable).
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../engine/constants.js';
import { MOVES_BY_ID } from '../data/moves.js';
import { drawSprite } from '../gfx/draw.js';
import { drawText } from '../gfx/font.js';
import { getColor } from '../gfx/palette.js';
import { creatureName } from './creature-widgets.js';
import { PromiseScene, moveCursor } from './menu-cursor.js';
import { wrapParagraph } from './text-layout.js';
import { drawWindowFrame } from './window-frame.js';

const CATEGORY_LABELS = { physical: 'PHYS.', special: 'SPÉC.', status: 'STAT.' };

export class MoveListScreen extends PromiseScene {
  constructor(creature, { newMove = null, title = null } = {}) {
    super();
    this.creature = creature;
    this.newMove = newMove;
    this.title = title ?? creatureName(creature);
    this.index = 0;
  }

  get rows() {
    const rows = this.creature.moves.map((slot) => ({ id: slot.id, pp: slot.pp, maxPp: slot.maxPp }));
    if (this.newMove) rows.push({ id: this.newMove, pp: MOVES_BY_ID[this.newMove].pp, maxPp: MOVES_BY_ID[this.newMove].pp, isNew: true });
    return rows;
  }

  update(dt, input) {
    this.index = moveCursor(this.index, this.rows.length, input);
    if (input.justPressed('a') && !this.rows[this.index].isNew) this.done(this.index);
    else if (input.justPressed('b')) this.done(null);
  }

  render(ctx) {
    ctx.fillStyle = getColor(0);
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    drawWindowFrame(ctx, 0, 0, SCREEN_WIDTH, 64);
    drawText(ctx, this.title, 8, 4);
    this.rows.forEach((row, index) => {
      const y = 16 + index * 8;
      if (index === this.index) drawText(ctx, '▶', 8, y);
      drawText(ctx, MOVES_BY_ID[row.id].name, 16, y);
      if (row.isNew) drawText(ctx, 'NEW', 128, y);
    });

    const row = this.rows[this.index];
    const move = MOVES_BY_ID[row.id];
    drawWindowFrame(ctx, 0, 64, SCREEN_WIDTH, 80);
    drawSprite(ctx, 'ui', `type/${move.type}`, 8, 72);
    drawText(ctx, CATEGORY_LABELS[move.category], 40, 72);
    drawText(ctx, `PUIS. ${move.power > 0 ? move.power : '-'}`, 8, 84);
    drawText(ctx, `PRÉC. ${move.accuracy ?? '-'}`, 88, 84);
    drawText(ctx, `PP ${row.pp}/${row.maxPp}`, 8, 96);
    drawText(ctx, wrapParagraph(move.description).join('\n'), 8, 112);
  }
}

export function chooseMoveSlot(manager, creature, options) {
  return manager.push(new MoveListScreen(creature, options)).promise;
}
