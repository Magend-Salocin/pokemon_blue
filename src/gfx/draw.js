import { getAtlas, getAtlasCanvas } from './atlas.js';
import { resolveMetatile } from '../overworld/map-loader.js';

/** Draws an atlas frame. `flipX` mirrors it (used for characters facing right). */
export function drawSprite(ctx, atlasName, frameId, x, y, { flipX = false } = {}) {
  const atlas = getAtlas(atlasName);
  const frame = atlas.frames[frameId];
  if (!frame) throw new Error(`Unknown frame "${frameId}" in atlas "${atlasName}"`);
  drawSpritePart(ctx, atlasName, frameId, 0, 0, frame.w, frame.h, x, y, { flipX });
}

/** Draws the (sx, sy, w, h) part of an atlas frame at (x, y). */
export function drawSpritePart(ctx, atlasName, frameId, sx, sy, w, h, x, y, { flipX = false } = {}) {
  const atlas = getAtlas(atlasName);
  const frame = atlas.frames[frameId];
  if (!frame) throw new Error(`Unknown frame "${frameId}" in atlas "${atlasName}"`);
  const canvas = getAtlasCanvas(atlas);
  if (!flipX) {
    ctx.drawImage(canvas, frame.x + sx, frame.y + sy, w, h, Math.round(x), Math.round(y), w, h);
    return;
  }
  ctx.save();
  ctx.translate(Math.round(x) + w, Math.round(y));
  ctx.scale(-1, 1);
  ctx.drawImage(canvas, frame.x + frame.w - sx - w, frame.y + sy, w, h, 0, 0, w, h);
  ctx.restore();
}

export function getFrameSize(atlasName, frameId) {
  const frame = getAtlas(atlasName).frames[frameId];
  return frame ? { width: frame.w, height: frame.h } : null;
}

/**
 * Metatile definition, following `extends` between tilesets:
 * { tileset, id, frames, solid?, grass?, water?, ledge?, ... }
 */
export function getMetatile(tilesetId, metatileId) {
  const metatile = resolveMetatile(getAtlas('tiles').meta.tilesets, tilesetId, metatileId);
  if (!metatile) throw new Error(`Unknown metatile "${metatileId}" in tileset "${tilesetId}"`);
  return metatile;
}

function metatileFrameId(metatile, animationStep) {
  return metatile.frames > 1
    ? `${metatile.tileset}/${metatile.id}/${animationStep % metatile.frames}`
    : `${metatile.tileset}/${metatile.id}`;
}

/** Draws a 16×16 metatile. `animationStep` selects the frame of animated metatiles. */
export function drawMetatile(ctx, tilesetId, metatileId, x, y, animationStep = 0) {
  drawSprite(ctx, 'tiles', metatileFrameId(getMetatile(tilesetId, metatileId), animationStep), x, y);
}

/** Draws rows [fromRow, 16) of a metatile, e.g. the top of tall grass over a character's feet. */
export function drawMetatileBottom(ctx, tilesetId, metatileId, x, y, fromRow, animationStep = 0) {
  const frameId = metatileFrameId(getMetatile(tilesetId, metatileId), animationStep);
  drawSpritePart(ctx, 'tiles', frameId, 0, fromRow, 16, 16 - fromRow, x, y + fromRow);
}
