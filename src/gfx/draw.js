import { getAtlas, getAtlasCanvas } from './atlas.js';

/** Draws an atlas frame. `flipX` mirrors it (used for characters facing right). */
export function drawSprite(ctx, atlasName, frameId, x, y, { flipX = false } = {}) {
  const atlas = getAtlas(atlasName);
  const frame = atlas.frames[frameId];
  if (!frame) throw new Error(`Unknown frame "${frameId}" in atlas "${atlasName}"`);
  const canvas = getAtlasCanvas(atlas);

  if (!flipX) {
    ctx.drawImage(canvas, frame.x, frame.y, frame.w, frame.h, Math.round(x), Math.round(y), frame.w, frame.h);
    return;
  }
  ctx.save();
  ctx.translate(Math.round(x) + frame.w, Math.round(y));
  ctx.scale(-1, 1);
  ctx.drawImage(canvas, frame.x, frame.y, frame.w, frame.h, 0, 0, frame.w, frame.h);
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
  const { tilesets } = getAtlas('tiles').meta;
  let current = tilesetId;
  while (current) {
    const tileset = tilesets[current];
    if (!tileset) throw new Error(`Unknown tileset: ${current}`);
    const definition = tileset.metatiles[metatileId];
    if (definition) return { tileset: current, id: metatileId, ...definition };
    current = tileset.extends;
  }
  throw new Error(`Unknown metatile "${metatileId}" in tileset "${tilesetId}"`);
}

/** Draws a 16×16 metatile. `animationStep` selects the frame of animated metatiles. */
export function drawMetatile(ctx, tilesetId, metatileId, x, y, animationStep = 0) {
  const metatile = getMetatile(tilesetId, metatileId);
  const frameId = metatile.frames > 1
    ? `${metatile.tileset}/${metatileId}/${animationStep % metatile.frames}`
    : `${metatile.tileset}/${metatileId}`;
  drawSprite(ctx, 'tiles', frameId, x, y);
}
