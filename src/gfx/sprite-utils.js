// Pure helpers for pixel sprites (no DOM): used by the atlas build (Node) and the game.
// Text source: array of equal-length strings, '0'-'3' = palette index, '.' = transparent.
// Sprite: { width, height, pixels: Int8Array } with -1 for transparent pixels.

export const TRANSPARENT = -1;

const SOURCE_PIXEL = /^[0-3.]$/;

export function createSprite(width, height, fill = TRANSPARENT) {
  return { width, height, pixels: new Int8Array(width * height).fill(fill) };
}

export function parseSprite(rows) {
  const height = rows.length;
  const width = height > 0 ? rows[0].length : 0;
  const sprite = createSprite(width, height);
  rows.forEach((row, y) => {
    for (let x = 0; x < width; x += 1) {
      const character = row[x];
      sprite.pixels[y * width + x] = character === '.' || character === undefined ? TRANSPARENT : Number(character);
    }
  });
  return sprite;
}

export function spriteToRows(sprite) {
  const rows = [];
  for (let y = 0; y < sprite.height; y += 1) {
    let row = '';
    for (let x = 0; x < sprite.width; x += 1) {
      const value = sprite.pixels[y * sprite.width + x];
      row += value === TRANSPARENT ? '.' : String(value);
    }
    rows.push(row);
  }
  return rows;
}

export function flipHorizontal(sprite) {
  const flipped = createSprite(sprite.width, sprite.height);
  for (let y = 0; y < sprite.height; y += 1) {
    for (let x = 0; x < sprite.width; x += 1) {
      flipped.pixels[y * sprite.width + x] = sprite.pixels[y * sprite.width + (sprite.width - 1 - x)];
    }
  }
  return flipped;
}

/** Returns a list of problems; empty when the source is valid. */
export function validateSprite(rows, { width, height } = {}) {
  const errors = [];
  if (!Array.isArray(rows) || rows.length === 0) return ['source must be a non-empty array of strings'];

  const expectedWidth = width ?? rows[0].length;
  if (height !== undefined && rows.length !== height) {
    errors.push(`expected ${height} rows, got ${rows.length}`);
  }
  rows.forEach((row, y) => {
    if (typeof row !== 'string') {
      errors.push(`row ${y} is not a string`);
      return;
    }
    if (row.length !== expectedWidth) errors.push(`row ${y}: expected ${expectedWidth} characters, got ${row.length}`);
    const invalid = [...row].filter((character) => !SOURCE_PIXEL.test(character));
    if (invalid.length > 0) errors.push(`row ${y}: invalid characters ${JSON.stringify([...new Set(invalid)].join(''))}`);
  });
  return errors;
}

export function isEmptySprite(sprite) {
  return sprite.pixels.every((value) => value === TRANSPARENT);
}

/** Stable short hash of the pixels (FNV-1a), for determinism tests and change detection. */
export function hashSprite(sprite) {
  let hash = 0x811c9dc5;
  for (const value of sprite.pixels) {
    hash ^= value & 0xff;
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}
