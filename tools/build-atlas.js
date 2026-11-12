// Builds assets/atlas/*.png and *.json from the sprite sources.
// Usage: npm run atlas [-- --keep-edited]
//   --keep-edited  keep a PNG (and its JSON) that was modified by hand since the last build.
// PNG pixels use the 4 reference grays (index 0 = #ffffff … 3 = #000000), alpha 0 = transparent.

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { PNG } from 'pngjs';

import { generateCreatureSprite } from '../src/gfx/creature-generator.js';
import { buildCharacterFrames } from '../src/gfx/sources/characters/index.js';
import { HAND_DRAWN_CREATURES } from '../src/gfx/sources/creatures/index.js';
import { TILESETS, metatileFrameId } from '../src/gfx/sources/tiles/index.js';
import { FLAG_NAMES, METATILE_SIZE } from '../src/gfx/sources/tiles/tile-helpers.js';
import { buildTrainerFrames } from '../src/gfx/sources/trainers/index.js';
import { buildUiFrames } from '../src/gfx/sources/ui/index.js';
import { TRANSPARENT, parseSprite, validateSprite } from '../src/gfx/sprite-utils.js';
import { packFrames } from './atlas-packer.js';
import { SAMPLE_CREATURES } from './sample-creatures.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT_DIR = path.join(ROOT, 'assets', 'atlas');
const CREATURE_DATA = path.join(ROOT, 'src', 'data', 'creatures.js');
const ATLAS_VERSION = 1;

export const REFERENCE_GRAYS = ['#ffffff', '#aaaaaa', '#555555', '#000000'];
const GRAY_VALUES = [255, 170, 85, 0];

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function rowsToSprites(frames) {
  const sprites = {};
  for (const [id, rows] of Object.entries(frames)) {
    const errors = validateSprite(rows);
    if (errors.length > 0) throw new Error(`Invalid source "${id}": ${errors.join('; ')}`);
    sprites[id] = parseSprite(rows);
  }
  return sprites;
}

function tileAtlas() {
  const frames = {};
  const tilesets = {};
  for (const tileset of TILESETS) {
    const metatiles = {};
    for (const definition of tileset.metatiles) {
      definition.frames.forEach((rows, index) => {
        const errors = validateSprite(rows, { width: METATILE_SIZE, height: METATILE_SIZE });
        if (errors.length > 0) throw new Error(`Invalid metatile ${tileset.id}/${definition.id}: ${errors.join('; ')}`);
        frames[metatileFrameId(tileset.id, definition.id, index, definition.frames.length)] = rows;
      });
      const flags = Object.fromEntries(FLAG_NAMES.filter((flag) => definition[flag]).map((flag) => [flag, definition[flag]]));
      metatiles[definition.id] = { frames: definition.frames.length, ...flags };
    }
    tilesets[tileset.id] = { extends: tileset.extends ?? null, metatiles };
  }
  return { sprites: rowsToSprites(frames), meta: { tilesets } };
}

async function loadCreatureList() {
  if (!fs.existsSync(CREATURE_DATA)) return { source: 'tools/sample-creatures.js', creatures: SAMPLE_CREATURES };
  const module = await import(pathToFileURL(CREATURE_DATA).href);
  const creatures = module.CREATURES ?? module.default;
  if (!Array.isArray(creatures)) throw new Error('src/data/creatures.js must export an array (CREATURES or default)');
  return { source: 'src/data/creatures.js', creatures };
}

async function creatureAtlas() {
  const { source, creatures } = await loadCreatureList();
  const sprites = {};
  const generated = [];
  for (const creature of creatures) {
    if (HAND_DRAWN_CREATURES[creature.id]) continue;
    if (!creature.sprite) throw new Error(`Creature "${creature.id}" has no sprite spec`);
    sprites[`${creature.id}/front`] = generateCreatureSprite(creature.sprite, 'front');
    sprites[`${creature.id}/back`] = generateCreatureSprite(creature.sprite, 'back');
    generated.push(creature.id);
  }
  for (const [id, views] of Object.entries(HAND_DRAWN_CREATURES)) {
    Object.assign(sprites, rowsToSprites({ [`${id}/front`]: views.front, [`${id}/back`]: views.back }));
  }
  return { sprites, meta: { source, generated, handDrawn: Object.keys(HAND_DRAWN_CREATURES) } };
}

function encodePng(width, height, sprites, placements) {
  const png = new PNG({ width, height });
  png.data.fill(0);
  for (const [id, sprite] of Object.entries(sprites)) {
    const { x, y } = placements[id];
    for (let sy = 0; sy < sprite.height; sy += 1) {
      for (let sx = 0; sx < sprite.width; sx += 1) {
        const value = sprite.pixels[sy * sprite.width + sx];
        if (value === TRANSPARENT) continue;
        const offset = ((y + sy) * width + x + sx) * 4;
        png.data[offset] = GRAY_VALUES[value];
        png.data[offset + 1] = GRAY_VALUES[value];
        png.data[offset + 2] = GRAY_VALUES[value];
        png.data[offset + 3] = 255;
      }
    }
  }
  return PNG.sync.write(png, { colorType: 6 });
}

function readStoredHash(jsonPath) {
  try {
    return JSON.parse(fs.readFileSync(jsonPath, 'utf8')).meta?.pngHash ?? null;
  } catch {
    return null;
  }
}

/** True when the PNG on disk no longer matches the hash written by the last build. */
function isEditedByHand(pngPath, jsonPath) {
  if (!fs.existsSync(pngPath)) return false;
  const storedHash = readStoredHash(jsonPath);
  return storedHash !== null && storedHash !== sha256(fs.readFileSync(pngPath));
}

function writeAtlas(name, { sprites, meta }, { keepEdited }) {
  const pngPath = path.join(OUTPUT_DIR, `${name}.png`);
  const jsonPath = path.join(OUTPUT_DIR, `${name}.json`);

  if (keepEdited && isEditedByHand(pngPath, jsonPath)) {
    process.stdout.write(`  ! ${name}.png modifié à la main depuis le dernier build : conservé (sources ignorées).\n`);
    return;
  }

  const sizes = Object.fromEntries(Object.entries(sprites).map(([id, sprite]) => [id, sprite]));
  const { width, height, placements } = packFrames(sizes);
  const png = encodePng(width, height, sprites, placements);
  const sortedFrames = Object.fromEntries(Object.keys(placements).sort().map((id) => [id, placements[id]]));
  const json = {
    frames: sortedFrames,
    meta: {
      version: ATLAS_VERSION,
      image: `${name}.png`,
      size: { w: width, h: height },
      levels: REFERENCE_GRAYS,
      pngHash: sha256(png),
      ...meta,
    },
  };

  fs.writeFileSync(pngPath, png);
  fs.writeFileSync(jsonPath, `${JSON.stringify(json, null, 2)}\n`);
  process.stdout.write(`  ${name}.png ${width}×${height}, ${Object.keys(sprites).length} frames\n`);
}

async function main() {
  const keepEdited = process.argv.includes('--keep-edited');
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const creatures = await creatureAtlas();
  const atlases = {
    tiles: tileAtlas(),
    characters: { sprites: rowsToSprites(buildCharacterFrames()), meta: {} },
    trainers: { sprites: rowsToSprites(buildTrainerFrames()), meta: {} },
    creatures,
    ui: { sprites: rowsToSprites(buildUiFrames()), meta: {} },
  };

  process.stdout.write(`Atlas (bestioles : ${creatures.meta.source})\n`);
  for (const [name, atlas] of Object.entries(atlases)) writeAtlas(name, atlas, { keepEdited });
}

main().catch((error) => {
  process.stderr.write(`${error.stack}\n`);
  process.exitCode = 1;
});
