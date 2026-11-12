// Loads every data module once, plus what checkers need to resolve references
// (atlas frame ids, hand-drawn sprites, displayable characters).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { CHARACTER_ALIASES, buildGlyphTable } from '../../src/gfx/font-glyphs.js';
import { HAND_DRAWN_CREATURES } from '../../src/gfx/sources/creatures/index.js';
import { CREATURES, HABITATS } from '../../src/data/creatures.js';
import { ITEMS, ITEM_EFFECTS, FIELD_ABILITIES, POCKETS } from '../../src/data/items.js';
import { MOVE_EFFECTS } from '../../src/data/move-effects.js';
import { MOVES } from '../../src/data/moves.js';
import { MUSIC_INTROS, TRAINER_CLASSES } from '../../src/data/trainer-classes.js';
import { TYPE_CHART, TYPES } from '../../src/data/types.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

function atlasFrameIds(name) {
  const json = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets', 'atlas', `${name}.json`), 'utf8'));
  return new Set(Object.keys(json.frames));
}

export function loadGameData() {
  const glyphs = new Set([...buildGlyphTable().keys(), ...Object.keys(CHARACTER_ALIASES)]);
  return {
    types: TYPES,
    typeChart: TYPE_CHART,
    moves: MOVES,
    moveEffects: MOVE_EFFECTS,
    creatures: CREATURES,
    habitats: HABITATS,
    items: ITEMS,
    itemEffects: ITEM_EFFECTS,
    fieldAbilities: FIELD_ABILITIES,
    pockets: POCKETS,
    trainerClasses: TRAINER_CLASSES,
    musicIntros: MUSIC_INTROS,
    handDrawnCreatures: new Set(Object.keys(HAND_DRAWN_CREATURES)),
    atlas: { ui: atlasFrameIds('ui'), trainers: atlasFrameIds('trainers') },
    glyphs,
  };
}
