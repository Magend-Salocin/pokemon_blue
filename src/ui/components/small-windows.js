// Small reusable windows: grid menu, OUI/NON confirmation, quantity (with total price), money.
import { TILE } from '../../engine/constants.js';
import { drawText } from '../../gfx/font.js';
import { moveCursor } from '../menu-cursor.js';
import { drawWindowFrame } from '../window-frame.js';

/** Grid of labels. Result: index on A, null on B. */
export class GridMenu {
  constructor(labels, { x = 0, y = 96, width = 160, columns = 2, columnWidth = 80, index = 0, cancellable = true } = {}) {
    Object.assign(this, { labels, x, y, width, columns, columnWidth, index, cancellable });
    this.rows = Math.ceil(labels.length / columns);
  }

  update(dt, input) {
    this.index = moveCursor(this.index, this.labels.length, input, { columns: this.columns });
    if (input.justPressed('a')) return { value: this.index };
    if (input.justPressed('b') && this.cancellable) return { value: null };
    return undefined;
  }

  render(ctx) {
    drawWindowFrame(ctx, this.x, this.y, this.width, this.rows * 16 + 2 * TILE);
    this.labels.forEach((label, index) => {
      const x = this.x + TILE + (index % this.columns) * this.columnWidth;
      const y = this.y + TILE + Math.floor(index / this.columns) * 16;
      if (index === this.index) drawText(ctx, '▶', x, y);
      drawText(ctx, label, x + TILE, y);
    });
  }
}

/** OUI / NON. Result: true or false (B = false). */
export class ConfirmWindow {
  constructor({ x = 112, y = 56 } = {}) {
    this.x = x;
    this.y = y;
    this.index = 0;
  }

  update(dt, input) {
    if (input.repeat('up') || input.repeat('down')) this.index = 1 - this.index;
    if (input.justPressed('a')) return { value: this.index === 0 };
    if (input.justPressed('b')) return { value: false };
    return undefined;
  }

  render(ctx) {
    drawWindowFrame(ctx, this.x, this.y, 48, 40);
    ['OUI', 'NON'].forEach((label, index) => {
      const y = this.y + TILE + index * 16;
      if (index === this.index) drawText(ctx, '▶', this.x + TILE, y);
      drawText(ctx, label, this.x + 2 * TILE, y);
    });
  }
}

/** Quantity from 1 to max: up/down ±1, right/left ±10. Shows the total when unitPrice is set. */
export class QuantityWindow {
  constructor({ max, unitPrice = null, x = 64, y = 72 }) {
    Object.assign(this, { max: Math.max(1, max), unitPrice, x, y });
    this.quantity = 1;
  }

  update(dt, input) {
    const step = (input.repeat('up') ? 1 : 0) - (input.repeat('down') ? 1 : 0) + (input.repeat('right') ? 10 : 0) - (input.repeat('left') ? 10 : 0);
    if (step) this.quantity = Math.max(1, Math.min(this.max, this.quantity + step));
    if (input.justPressed('a')) return { value: this.quantity };
    if (input.justPressed('b')) return { value: null };
    return undefined;
  }

  render(ctx) {
    drawWindowFrame(ctx, this.x, this.y, 96, 24);
    drawText(ctx, `×${String(this.quantity).padStart(2, '0')}`, this.x + TILE, this.y + TILE);
    if (this.unitPrice !== null) {
      const total = String(this.quantity * this.unitPrice);
      drawText(ctx, total, this.x + 96 - TILE - total.length * 8, this.y + TILE);
    }
  }
}

/** Passive window showing the player's money. */
export class MoneyWindow {
  constructor(getMoney, { x = 88, y = 0 } = {}) {
    Object.assign(this, { getMoney, x, y });
  }

  update() {
    return undefined;
  }

  render(ctx) {
    drawWindowFrame(ctx, this.x, this.y, 72, 32);
    drawText(ctx, 'ARGENT', this.x + TILE, this.y + 6);
    const money = String(this.getMoney());
    drawText(ctx, money, this.x + 72 - TILE - money.length * 8, this.y + 16);
  }
}
