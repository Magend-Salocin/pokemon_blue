// npm run map-preview [-- <map id> ...]: exports maps to out/maps/<id>.png (all maps by default).
// Markers: red = warp, blue = NPC, orange = trainer and its line of sight, green = item
// (dashed = hidden), purple = trigger area.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';

import { ALL_MAPS } from '../src/data/maps/index.js';
import { step } from '../src/overworld/directions.js';
import { buildMap } from '../src/overworld/map-loader.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'out', 'maps');
const TILE = 16;
const COLORS = {
  warp: [220, 40, 40], npc: [40, 90, 220], trainer: [240, 140, 20], item: [30, 170, 60], trigger: [150, 60, 200],
};

function readAtlas(name) {
  const json = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets', 'atlas', `${name}.json`), 'utf8'));
  const png = PNG.sync.read(fs.readFileSync(path.join(ROOT, 'assets', 'atlas', json.meta.image)));
  return { json, png };
}

function blit(target, atlas, frameId, x, y) {
  const frame = atlas.json.frames[frameId];
  if (!frame) return;
  for (let dy = 0; dy < frame.h; dy += 1) {
    for (let dx = 0; dx < frame.w; dx += 1) {
      const tx = x + dx;
      const ty = y + dy;
      if (tx < 0 || ty < 0 || tx >= target.width || ty >= target.height) continue;
      const source = ((frame.y + dy) * atlas.png.width + frame.x + dx) * 4;
      if (atlas.png.data[source + 3] < 128) continue;
      const destination = (ty * target.width + tx) * 4;
      atlas.png.data.copy(target.data, destination, source, source + 4);
    }
  }
}

function setPixel(target, x, y, [r, g, b]) {
  if (x < 0 || y < 0 || x >= target.width || y >= target.height) return;
  const index = (y * target.width + x) * 4;
  target.data[index] = r;
  target.data[index + 1] = g;
  target.data[index + 2] = b;
  target.data[index + 3] = 255;
}

function outline(target, tileX, tileY, color, { width = 1, height = 1, dashed = false } = {}) {
  const x0 = tileX * TILE;
  const y0 = tileY * TILE;
  const x1 = x0 + width * TILE - 1;
  const y1 = y0 + height * TILE - 1;
  for (let x = x0; x <= x1; x += 1) {
    if (dashed && x % 4 >= 2) continue;
    setPixel(target, x, y0, color);
    setPixel(target, x, y1, color);
  }
  for (let y = y0; y <= y1; y += 1) {
    if (dashed && y % 4 >= 2) continue;
    setPixel(target, x0, y, color);
    setPixel(target, x1, y, color);
  }
}

function metatileFrame(map, x, y) {
  const metatile = map.metatileAt(x, y);
  const suffix = metatile.frames > 1 ? '/0' : '';
  return `${metatile.tileset}/${metatile.id}${suffix}`;
}

function renderMap(map, tiles, characters) {
  const image = new PNG({ width: map.width * TILE, height: map.height * TILE });
  for (let y = 0; y < map.height; y += 1) {
    for (let x = 0; x < map.width; x += 1) blit(image, tiles, metatileFrame(map, x, y), x * TILE, y * TILE);
  }
  for (const item of map.items ?? []) {
    blit(image, characters, 'capsule', item.x * TILE, item.y * TILE);
    outline(image, item.x, item.y, COLORS.item);
  }
  for (const item of map.hiddenItems ?? []) outline(image, item.x, item.y, COLORS.item, { dashed: true });
  for (const npc of map.npcs ?? []) {
    blit(image, characters, `${npc.sprite}/${npc.facing === 'right' ? 'left' : npc.facing}/0`, npc.x * TILE, npc.y * TILE);
    outline(image, npc.x, npc.y, COLORS.npc);
  }
  for (const trainer of map.trainers ?? []) {
    blit(image, characters, `${trainer.sprite}/${trainer.facing === 'right' ? 'left' : trainer.facing}/0`, trainer.x * TILE, trainer.y * TILE);
    outline(image, trainer.x, trainer.y, COLORS.trainer);
    for (let distance = 1; distance <= trainer.sight; distance += 1) {
      const { x, y } = step(trainer.x, trainer.y, trainer.facing, distance);
      outline(image, x, y, COLORS.trainer, { dashed: true });
    }
  }
  for (const warp of map.warps ?? []) outline(image, warp.x, warp.y, COLORS.warp);
  for (const trigger of map.triggers ?? []) {
    outline(image, trigger.x, trigger.y, COLORS.trigger, { width: trigger.w ?? 1, height: trigger.h ?? 1, dashed: true });
  }
  return image;
}

const tiles = readAtlas('tiles');
const characters = readAtlas('characters');
const ids = process.argv.slice(2).length > 0 ? process.argv.slice(2) : Object.keys(ALL_MAPS);
fs.mkdirSync(OUT_DIR, { recursive: true });
for (const id of ids) {
  if (!ALL_MAPS[id]) throw new Error(`Unknown map: ${id}`);
  const map = buildMap(ALL_MAPS[id], tiles.json.meta.tilesets);
  const file = path.join(OUT_DIR, `${id}.png`);
  fs.writeFileSync(file, PNG.sync.write(renderMap(map, tiles, characters)));
  process.stdout.write(`${path.relative(ROOT, file)} (${map.width} × ${map.height})\n`);
}
