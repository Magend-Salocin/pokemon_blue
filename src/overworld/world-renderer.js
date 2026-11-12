// Draws the visible part of the world: tiles (with connected neighbors), objects, actors,
// tall grass over feet, the "!" emote and the darkness of unlit caves.
import { METATILE, SCREEN_HEIGHT, SCREEN_WIDTH } from '../engine/constants.js';
import { createCanvas } from '../gfx/bitmap.js';
import { drawMetatile, drawMetatileBottom, drawSprite } from '../gfx/draw.js';
import { drawText } from '../gfx/font.js';
import { getColor, getPaletteKey } from '../gfx/palette.js';
import { animationFrame, pixelPosition } from './actor.js';
import { locateTile } from './world.js';

/** Characters are drawn 4 px above their tile so they look grounded. */
export const SPRITE_OFFSET_Y = -4;
const GRASS_COVER_ROW = 10;
const DARK_RADIUS = 24;
const DARK_CELL = 4;

function drawTiles(ctx, world, camera, animationStep) {
  const firstX = Math.floor(camera.x / METATILE);
  const firstY = Math.floor(camera.y / METATILE);
  const columns = Math.ceil(SCREEN_WIDTH / METATILE) + 1;
  const rows = Math.ceil(SCREEN_HEIGHT / METATILE) + 1;
  const { map } = world;

  ctx.fillStyle = getColor(3);
  ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
  for (let ty = firstY; ty < firstY + rows; ty += 1) {
    for (let tx = firstX; tx < firstX + columns; tx += 1) {
      const sx = tx * METATILE - camera.x;
      const sy = ty * METATILE - camera.y;
      const located = locateTile(world, tx, ty);
      if (located) drawMetatile(ctx, located.map.tileset, located.map.tileAt(located.x, located.y), sx, sy, animationStep);
      else if (map.borderTile) drawMetatile(ctx, map.tileset, map.borderTile, sx, sy, animationStep);
    }
  }
}

function spriteFrameId(actor, frame) {
  const direction = actor.facing === 'right' ? 'left' : actor.facing;
  return `${actor.sprite}/${direction}/${frame}`;
}

function drawActor(ctx, actor, camera) {
  const { px, py, lift } = pixelPosition(actor);
  const x = px - camera.x;
  const y = py - camera.y + SPRITE_OFFSET_Y;
  if (lift > 0) {
    // Shadow on the ground during a jump.
    ctx.fillStyle = getColor(2);
    ctx.fillRect(x + 4, py - camera.y + 12, 8, 2);
  }
  const { frame, flip } = animationFrame(actor);
  drawSprite(ctx, 'characters', spriteFrameId(actor, frame), x, y - lift, { flipX: flip });
}

/** Tile under an actor's feet: the target tile once past the middle of a step. */
function feetTile(actor) {
  const { px, py } = pixelPosition(actor);
  return { x: Math.round(px / METATILE), y: Math.round(py / METATILE) };
}

function drawGrassOverFeet(ctx, world, actor, camera, animationStep) {
  if (actor.movement?.jump) return;
  const { x, y } = feetTile(actor);
  const located = locateTile(world, x, y);
  if (!located || !located.map.metatileAt(located.x, located.y)?.grass) return;
  drawMetatileBottom(ctx, located.map.tileset, located.map.tileAt(located.x, located.y),
    x * METATILE - camera.x, y * METATILE - camera.y, GRASS_COVER_ROW, animationStep);
}

function drawEmote(ctx, actor, camera) {
  const { px, py } = pixelPosition(actor);
  const x = px - camera.x + 3;
  const y = py - camera.y + SPRITE_OFFSET_Y - 12;
  ctx.fillStyle = getColor(3);
  ctx.fillRect(x - 1, y - 1, 12, 12);
  ctx.fillStyle = getColor(0);
  ctx.fillRect(x, y, 10, 10);
  drawText(ctx, '!', x + 1, y + 1);
}

const darknessCache = new Map();

/** Screen-sized darkness with a blocky hole, drawn from a canvas twice the screen size. */
function darknessCanvas() {
  const key = getPaletteKey();
  if (darknessCache.has(key)) return darknessCache.get(key);
  const width = SCREEN_WIDTH * 2;
  const height = SCREEN_HEIGHT * 2;
  const canvas = createCanvas(width, height);
  const context = canvas.getContext('2d');
  context.fillStyle = getColor(3);
  for (let y = 0; y < height; y += DARK_CELL) {
    for (let x = 0; x < width; x += DARK_CELL) {
      const dx = x + DARK_CELL / 2 - width / 2;
      const dy = y + DARK_CELL / 2 - height / 2;
      if (dx * dx + dy * dy > DARK_RADIUS * DARK_RADIUS) context.fillRect(x, y, DARK_CELL, DARK_CELL);
    }
  }
  darknessCache.clear();
  darknessCache.set(key, canvas);
  return canvas;
}

/**
 * scene: { world, camera, player, actors, objects, animationStep, emote, dark, shake }
 * `objects` are { x, y, frame } drawn from the characters atlas (items on the ground).
 */
export function renderWorld(ctx, scene) {
  const { world, player, actors, objects, animationStep, emote, dark } = scene;
  const camera = { x: scene.camera.x + (scene.shake ?? 0), y: scene.camera.y };

  drawTiles(ctx, world, camera, animationStep);
  for (const object of objects) {
    drawSprite(ctx, 'characters', object.frame, object.x * METATILE - camera.x, object.y * METATILE - camera.y + SPRITE_OFFSET_Y);
  }
  const visible = [...actors.filter((actor) => actor.visible), player].sort((a, b) => pixelPosition(a).py - pixelPosition(b).py);
  for (const actor of visible) drawActor(ctx, actor, camera);
  for (const actor of visible) drawGrassOverFeet(ctx, world, actor, camera, animationStep);
  if (emote) drawEmote(ctx, emote, camera);

  if (dark) {
    const { px, py } = pixelPosition(player);
    const centerX = px - camera.x + METATILE / 2;
    const centerY = py - camera.y + METATILE / 2 + SPRITE_OFFSET_Y;
    ctx.drawImage(darknessCanvas(), Math.round(centerX - SCREEN_WIDTH), Math.round(centerY - SCREEN_HEIGHT));
  }
}
