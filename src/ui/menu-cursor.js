// Cursor movement shared by menus and lists (pure). Up/down move by row, left/right by column.

/** New index after directional input in a grid of `count` items laid out row by row. */
export function moveCursor(index, count, input, { columns = 1, wrap = true } = {}) {
  const rows = Math.ceil(count / columns);
  let row = Math.floor(index / columns);
  let column = index % columns;
  if (input.repeat('up')) row -= 1;
  else if (input.repeat('down')) row += 1;
  else if (columns > 1 && input.repeat('left')) column -= 1;
  else if (columns > 1 && input.repeat('right')) column += 1;
  else return index;
  if (wrap) {
    row = (row + rows) % rows;
    column = (column + columns) % columns;
  } else {
    row = Math.max(0, Math.min(rows - 1, row));
    column = Math.max(0, Math.min(columns - 1, column));
  }
  const next = row * columns + column;
  return next < count ? next : index;
}

/** First visible row of a scrolling list so that `index` stays on screen. */
export function scrollOffset(offset, index, visible) {
  if (index < offset) return index;
  if (index >= offset + visible) return index - visible + 1;
  return offset;
}

/** Base for promise-returning screens: `this.done(value)` pops the scene and resolves. */
export class PromiseScene {
  transparent = false;
  blocksInput = true;

  constructor() {
    this.promise = new Promise((resolve) => {
      this.resolvePromise = resolve;
    });
  }

  enter(manager) {
    this.manager = manager;
  }

  done(value) {
    if (this.closed) return;
    this.closed = true;
    if (this.manager.top === this) this.manager.pop();
    this.resolvePromise(value);
  }
}
