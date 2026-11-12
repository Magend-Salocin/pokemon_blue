// Helpers to author 16×16 metatiles from 8×8 tiles, overlays and vector shapes (pure).
// All functions take and return text rows ('0'-'3', '.' = transparent).

import { renderParts } from '../../shape-renderer.js';
import { spriteToRows } from '../../sprite-utils.js';

export const METATILE_SIZE = 16;

export const FLAG_NAMES = [
  'solid', 'grass', 'water', 'ledge', 'cuttable', 'pushable', 'climbable', 'door', 'counter', 'slippery', 'animated',
];

/** Metatile made of four 8×8 tiles. */
export function quad(topLeft, topRight = topLeft, bottomLeft = topLeft, bottomRight = topRight) {
  return [
    ...topLeft.map((row, y) => row + topRight[y]),
    ...bottomLeft.map((row, y) => row + bottomRight[y]),
  ];
}

/** Repeats a small pattern to fill width × height. */
export function tileRows(pattern, width = METATILE_SIZE, height = METATILE_SIZE) {
  return Array.from({ length: height }, (_, y) => {
    const row = pattern[y % pattern.length];
    return Array.from({ length: width }, (__, x) => row[x % row.length]).join('');
  });
}

export function solidRows(character, width = METATILE_SIZE, height = METATILE_SIZE) {
  return Array(height).fill(character.repeat(width));
}

/** Draws `top` over `base` at (x, y); '.' in `top` keeps the base pixel. */
export function overlay(base, top, x = 0, y = 0) {
  const result = base.map((row) => [...row]);
  top.forEach((row, dy) => {
    [...row].forEach((pixel, dx) => {
      const ty = y + dy;
      const tx = x + dx;
      if (pixel === '.' || ty < 0 || ty >= result.length || tx < 0 || tx >= result[ty].length) return;
      result[ty][tx] = pixel;
    });
  });
  return result.map((row) => row.join(''));
}

/** Cyclic shift, used for 2-frame animations (water, tall grass). */
export function shiftRows(rows, dx, dy = 0) {
  const height = rows.length;
  const width = rows[0].length;
  return Array.from({ length: height }, (_, y) => {
    const source = rows[(((y - dy) % height) + height) % height];
    return Array.from({ length: width }, (__, x) => source[(((x - dx) % width) + width) % width]).join('');
  });
}

export function flipX(rows) {
  return rows.map((row) => [...row].reverse().join(''));
}

export function flipY(rows) {
  return [...rows].reverse();
}

/** Transposes rows (turns a horizontal ledge into a vertical one). */
export function transpose(rows) {
  return [...rows[0]].map((_, x) => rows.map((row) => row[x]).join(''));
}

/** Replaces every pixel of `from` by `to`. */
export function recolor(rows, from, to) {
  return rows.map((row) => row.replaceAll(from, to));
}

/** Renders vector parts (see shape-renderer.js) to rows with transparency. */
export function shapeRows(width, height, parts, decals = [], shadeDepth = 1) {
  return spriteToRows(renderParts({ width, height, parts, decals, shadeDepth }));
}

/** Splits a 32×32 drawing into four 16×16 metatiles. */
export function splitLarge(rows) {
  const part = (x, y) => rows.slice(y, y + METATILE_SIZE).map((row) => row.slice(x, x + METATILE_SIZE));
  return { tl: part(0, 0), tr: part(16, 0), bl: part(0, 16), br: part(16, 16) };
}

/** Draws a 1-pixel frame of `character` on the given sides. */
export function edges(rows, sides, character) {
  const height = rows.length;
  const width = rows[0].length;
  return rows.map((row, y) =>
    [...row]
      .map((pixel, x) => {
        if (sides.includes('n') && y === 0) return character;
        if (sides.includes('s') && y === height - 1) return character;
        if (sides.includes('w') && x === 0) return character;
        if (sides.includes('e') && x === width - 1) return character;
        return pixel;
      })
      .join(''),
  );
}

/**
 * Metatile definition. `frames` holds 1 frame, or 2+ for animated tiles.
 * Flags: solid, grass, water, ledge ('down'|'left'|'right'), cuttable, pushable,
 * climbable, door, counter, slippery, animated.
 */
export function metatile(id, frames, flags = {}) {
  const list = Array.isArray(frames[0]) ? frames : [frames];
  return { id, frames: list, ...flags, animated: list.length > 1 };
}
