// Helpers to turn text pixel sources ('0'-'3' = palette index, '.' = transparent) into canvases.

export function createCanvas(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

export function hexToRgb(hex) {
  const value = Number.parseInt(hex.slice(1), 16);
  return [(value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff];
}

/**
 * Writes `rows` into `imageData` at (originX, originY).
 * `resolveColor(index)` returns a '#rrggbb' color for palette index 0-3.
 */
export function paintRows(imageData, rows, originX, originY, resolveColor) {
  for (let y = 0; y < rows.length; y += 1) {
    const row = rows[y];
    for (let x = 0; x < row.length; x += 1) {
      if (row[x] === '.') continue;
      const [r, g, b] = hexToRgb(resolveColor(Number(row[x])));
      const offset = ((originY + y) * imageData.width + originX + x) * 4;
      imageData.data[offset] = r;
      imageData.data[offset + 1] = g;
      imageData.data[offset + 2] = b;
      imageData.data[offset + 3] = 255;
    }
  }
}
