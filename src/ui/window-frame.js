import { TILE } from '../engine/constants.js';
import { createCanvas, paintRows } from '../gfx/bitmap.js';
import { getColor, getPaletteKey } from '../gfx/palette.js';
import { FRAME_TILES } from '../gfx/sources/ui/frame.js';

// Drawn from the text sources (not the atlas) so windows work before atlases are loaded.
const TILE_NAMES = Object.keys(FRAME_TILES);
const tileSheetCache = new Map();

function getTileSheet() {
  const key = getPaletteKey();
  let sheet = tileSheetCache.get(key);
  if (!sheet) {
    sheet = createCanvas(TILE_NAMES.length * TILE, TILE);
    const context = sheet.getContext('2d');
    const image = context.createImageData(sheet.width, sheet.height);
    TILE_NAMES.forEach((name, index) => paintRows(image, FRAME_TILES[name], index * TILE, 0, getColor));
    context.putImageData(image, 0, 0);
    tileSheetCache.set(key, sheet);
  }
  return sheet;
}

function drawTile(ctx, sheet, name, x, y) {
  ctx.drawImage(sheet, TILE_NAMES.indexOf(name) * TILE, 0, TILE, TILE, x, y, TILE, TILE);
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
    drawTile(ctx, sheet, 'top', tileX, y);
    drawTile(ctx, sheet, 'bottom', tileX, bottom);
  }
  for (let tileY = y + TILE; tileY < bottom; tileY += TILE) {
    drawTile(ctx, sheet, 'left', x, tileY);
    drawTile(ctx, sheet, 'right', right, tileY);
  }
  drawTile(ctx, sheet, 'top_left', x, y);
  drawTile(ctx, sheet, 'top_right', right, y);
  drawTile(ctx, sheet, 'bottom_left', x, bottom);
  drawTile(ctx, sheet, 'bottom_right', right, bottom);
}
