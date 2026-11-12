// Vertical list in a window, with scrolling, ▶ cursor and arrows when more rows exist.
// Result: { value: index } on A, { value: null } on B (when cancellable).
import { TILE } from '../../engine/constants.js';
import { drawText } from '../../gfx/font.js';
import { getColor } from '../../gfx/palette.js';
import { moveCursor, scrollOffset } from '../menu-cursor.js';
import { drawWindowFrame } from '../window-frame.js';

function drawUpArrow(ctx, x, y) {
  ctx.fillStyle = getColor(3);
  for (let row = 0; row < 4; row += 1) ctx.fillRect(x + 3 - row, y + 2 + row, 1 + row * 2, 1);
}

export class ListMenu {
  /**
   * items: [{ label, detail?, disabled? }] — `detail` is drawn right-aligned on the next line.
   * options: { x, y, width, rows (visible), rowHeight, cancellable, index, onChange(index) }
   */
  constructor(items, { x = 0, y = 0, width = 160, rows = Math.min(items.length, 6), rowHeight = 16, cancellable = true, index = 0, onChange = null } = {}) {
    this.items = items;
    this.x = x;
    this.y = y;
    this.width = width;
    this.rows = Math.max(1, rows);
    this.rowHeight = rowHeight;
    this.cancellable = cancellable;
    this.index = Math.min(index, Math.max(0, items.length - 1));
    this.offset = scrollOffset(0, this.index, this.rows);
    this.onChange = onChange;
  }

  get height() {
    return Math.ceil((this.rows * this.rowHeight + TILE) / TILE) * TILE + TILE;
  }

  update(dt, input) {
    const previous = this.index;
    if (this.items.length > 0) {
      this.index = moveCursor(this.index, this.items.length, input, { wrap: this.items.length <= this.rows });
      this.offset = scrollOffset(this.offset, this.index, this.rows);
    }
    if (previous !== this.index) this.onChange?.(this.index);
    if (input.justPressed('a') && this.items.length > 0 && !this.items[this.index].disabled) return { value: this.index };
    if (input.justPressed('b') && this.cancellable) return { value: null };
    return undefined;
  }

  render(ctx) {
    drawWindowFrame(ctx, this.x, this.y, this.width, this.height);
    const visible = this.items.slice(this.offset, this.offset + this.rows);
    visible.forEach((item, row) => {
      const index = this.offset + row;
      const y = this.y + TILE + row * this.rowHeight;
      if (index === this.index) drawText(ctx, '▶', this.x + TILE, y);
      drawText(ctx, item.label, this.x + 2 * TILE, y, item.disabled ? 2 : 3);
      if (item.detail) {
        const detailX = this.x + this.width - TILE - Array.from(item.detail).length * 8;
        drawText(ctx, item.detail, detailX, y + (this.rowHeight >= 16 ? 8 : 0));
      }
    });
    if (this.offset > 0) drawUpArrow(ctx, this.x + this.width - 2 * TILE, this.y);
    if (this.offset + this.rows < this.items.length) drawText(ctx, '▼', this.x + this.width - 2 * TILE, this.y + this.height - TILE);
  }
}
