import { TILE } from '../engine/constants.js';
import { createCanvas, mirrorHorizontal, mirrorVertical, paintRows } from '../gfx/bitmap.js';
import { getColor, getPaletteKey } from '../gfx/palette.js';

// 8×8 tiles: outer line index 3, inner line index 2, background index 0.
const CORNER = [
  '..333333',
  '.3000000',
  '30022222',
  '30200000',
  '30200000',
  '30200000',
  '30200000',
  '30200000',
];
const TOP_EDGE = [
  '33333333',
  '00000000',
  '22222222',
  '00000000',
  '00000000',
  '00000000',
  '00000000',
  '00000000',
];
const LEFT_EDGE = Array(8).fill('30200000');

// Index in TILES of each frame part.
const TOP_LEFT = 0;
const TOP = 1;
const TOP_RIGHT = 2;
const LEFT = 3;
const RIGHT = 4;
const BOTTOM_LEFT = 5;
const BOTTOM = 6;
const BOTTOM_RIGHT = 7;

const TILES = [
  CORNER,
  TOP_EDGE,
  mirrorHorizontal(CORNER),
  LEFT_EDGE,
  mirrorHorizontal(LEFT_EDGE),
  mirrorVertical(CORNER),
  mirrorVertical(TOP_EDGE),
  mirrorVertical(mirrorHorizontal(CORNER)),
];

const tileSheetCache = new Map();

function getTileSheet() {
  const key = getPaletteKey();
  let sheet = tileSheetCache.get(key);
  if (!sheet) {
    sheet = createCanvas(TILES.length * TILE, TILE);
    const context = sheet.getContext('2d');
    const image = context.createImageData(sheet.width, sheet.height);
    TILES.forEach((rows, index) => paintRows(image, rows, index * TILE, 0, getColor));
    context.putImageData(image, 0, 0);
    tileSheetCache.set(key, sheet);
  }
  return sheet;
}

function drawTile(ctx, sheet, tile, x, y) {
  ctx.drawImage(sheet, tile * TILE, 0, TILE, TILE, x, y, TILE, TILE);
}

/**
 * Draws an opaque window. Position and size are in pixels; width and height must be
 * multiples of 8 and at least 16.
 */
export function drawWindowFrame(ctx, x, y, width, height) {
  if (width % TILE || height % TILE || width < 2 * TILE || height < 2 * TILE) {
    throw new RangeError(`drawWindowFrame: invalid size ${width}×${height}`);
  }
  const sheet = getTileSheet();
  const right = x + width - TILE;
  const bottom = y + height - TILE;

  ctx.fillStyle = getColor(0);
  ctx.fillRect(x + TILE, y + TILE, width - 2 * TILE, height - 2 * TILE);

  for (let tileX = x + TILE; tileX < right; tileX += TILE) {
    drawTile(ctx, sheet, TOP, tileX, y);
    drawTile(ctx, sheet, BOTTOM, tileX, bottom);
  }
  for (let tileY = y + TILE; tileY < bottom; tileY += TILE) {
    drawTile(ctx, sheet, LEFT, x, tileY);
    drawTile(ctx, sheet, RIGHT, right, tileY);
  }
  drawTile(ctx, sheet, TOP_LEFT, x, y);
  drawTile(ctx, sheet, TOP_RIGHT, right, y);
  drawTile(ctx, sheet, BOTTOM_LEFT, x, bottom);
  drawTile(ctx, sheet, BOTTOM_RIGHT, right, bottom);
}
