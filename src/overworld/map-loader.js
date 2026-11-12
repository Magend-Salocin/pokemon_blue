// Converts map definitions (readable legend strings, see docs/MAP_FORMAT.md) into runtime
// maps: a grid of metatile ids with their flags. Pure: works in Node and in the browser.

const TREE = { pattern: [['tree_tl', 'tree_tr'], ['tree_bl', 'tree_br']] };

/** Default legend per tileset. A map legend adds or overrides characters. */
export const DEFAULT_LEGENDS = {
  outdoor: {
    '.': 'grass', ',': 'tall_grass', ':': 'path', s: 'sand', '*': 'flowers', T: TREE, b: 'shrub', o: 'boulder',
    v: 'ledge_down', '<': 'ledge_left', '>': 'ledge_right', '#': 'cliff', g: 'grapple_ledge', '~': 'water',
    F: 'fence', S: 'sign', M: 'mailbox', '=': 'bridge_h', '|': 'bridge_v',
  },
  indoor: {
    '.': 'floor_wood', ',': 'floor_tile', c: 'carpet', r: 'rug', m: 'doormat', '#': 'wall', w: 'wall_window',
    t: { pattern: [['table_tl', 'table_tr'], ['table_bl', 'table_br']] }, h: 'chair',
    B: { pattern: [['bed_top'], ['bed_bottom']] }, L: { pattern: [['shelf_top'], ['shelf_bottom']] }, P: 'plant',
    '[': 'counter_l', '-': 'counter_m', ']': 'counter_r', K: 'storage_terminal', H: 'heal_machine',
    U: 'stairs_up', D: 'stairs_down',
  },
  cave: { '.': 'floor', '#': 'wall', U: 'ladder_up', D: 'ladder_down', '~': 'water', A: 'stalagmite', i: 'ice' },
  special: {
    '.': 'memory_floor', ',': 'memory_floor_alt', l: 'lab_floor', X: 'teleporter', f: 'league_floor',
    c: 'league_carpet', '~': 'lava', '#': 'crystal_pillar',
  },
};
DEFAULT_LEGENDS.town = { ...DEFAULT_LEGENDS.outdoor, _: 'ground' };

/** Tile shown after cutting a shrub or pushing a boulder away. */
export const CLEAR_TILES = { outdoor: 'grass', town: 'ground', indoor: 'floor_wood', cave: 'floor', special: 'memory_floor' };

const BUILDINGS_WITH_EMBLEM = ['halte', 'comptoir', 'arena', 'lab'];
export const BUILDING_TYPES = ['house_a', 'house_b', 'house_c', ...BUILDINGS_WITH_EMBLEM];

function buildingCells(prefix, width = 4, door = 1) {
  const middle = (part) => Array.from({ length: width - 2 }, () => `${prefix}_${part}`);
  const roof = middle('roof_m');
  if (BUILDINGS_WITH_EMBLEM.includes(prefix)) roof[Math.floor((width - 2) / 2)] = `${prefix}_roof_emblem`;
  const wall = middle('window').map((id, index) => (index % 2 === 1 ? `${prefix}_wall` : id));
  const cells = [
    [`${prefix}_roof_top_l`, ...middle('roof_top_m'), `${prefix}_roof_top_r`],
    [`${prefix}_roof_l`, ...roof, `${prefix}_roof_r`],
    [`${prefix}_wall_l`, ...wall, `${prefix}_wall_r`],
  ];
  cells[2][door] = `${prefix}_door`;
  return cells;
}

/** Multi-metatile objects placed with `structures: [{ type, x, y, width?, door? }]`. null keeps the ground. */
export function structureCells({ type, width, door }) {
  if (BUILDING_TYPES.includes(type)) return buildingCells(type, width, door);
  if (type === 'tree') return TREE.pattern;
  if (type === 'lighthouse') return [['lighthouse_top'], ['lighthouse_mid'], ['lighthouse_base']];
  if (type === 'turbine') return [['turbine_top'], ['turbine_mast']];
  if (type === 'factory') {
    const w = width ?? 4;
    const cells = [
      Array.from({ length: w }, (_, i) => (i === 1 ? 'factory_chimney' : null)),
      Array(w).fill('factory_roof'),
      Array(w).fill('factory_wall'),
    ];
    cells[2][door ?? 1] = 'factory_door';
    return cells;
  }
  throw new Error(`Unknown structure type: ${type}`);
}

/** Metatile definition following `extends` between tilesets, or null. */
export function resolveMetatile(tilesets, tilesetId, metatileId) {
  let current = tilesetId;
  while (current) {
    const tileset = tilesets[current];
    if (!tileset) return null;
    const definition = tileset.metatiles[metatileId];
    if (definition) return { tileset: current, id: metatileId, ...definition };
    current = tileset.extends;
  }
  return null;
}

/** Start of the run of identical characters containing (x, y), along x then y. */
function runOrigin(rows, x, y) {
  const character = rows[y][x];
  let x0 = x;
  while (x0 > 0 && rows[y][x0 - 1] === character) x0 -= 1;
  let y0 = y;
  while (y0 > 0 && rows[y0 - 1][x] === character) y0 -= 1;
  return { x0, y0 };
}

/** Converts legend rows into metatile ids. Throws on unknown characters. */
export function convertLegendRows(rows, legend) {
  const ids = [];
  rows.forEach((row, y) => {
    Array.from(row).forEach((character, x) => {
      const entry = legend[character];
      if (entry === undefined) throw new Error(`Unknown legend character "${character}" at ${x},${y}`);
      if (typeof entry === 'string') {
        ids.push(entry);
        return;
      }
      const { x0, y0 } = runOrigin(rows, x, y);
      const pattern = entry.pattern;
      const patternRow = pattern[(y - y0) % pattern.length];
      ids.push(patternRow[(x - x0) % patternRow.length]);
    });
  });
  return ids;
}

const COLLISION_CODES = { '.': 0, '#': 1, _: 2 };
export const COLLISION = { DEFAULT: 0, SOLID: 1, WALKABLE: 2 };

/**
 * Builds a runtime map. `tilesets` is the `meta.tilesets` object of the tiles atlas.
 * Result: definition fields + { width, height, tiles, collision, metatileAt, setTile, inBounds }.
 */
export function buildMap(definition, tilesets) {
  const rows = definition.layers.ground;
  const height = rows.length;
  const width = Array.from(rows[0]).length;
  const legend = { ...DEFAULT_LEGENDS[definition.tileset], ...definition.legend };
  const tiles = convertLegendRows(rows, legend);

  for (const structure of definition.structures ?? []) {
    structureCells(structure).forEach((cellRow, dy) => {
      cellRow.forEach((id, dx) => {
        const x = structure.x + dx;
        const y = structure.y + dy;
        if (id !== null && x >= 0 && x < width && y >= 0 && y < height) tiles[y * width + x] = id;
      });
    });
  }

  const collision = new Uint8Array(width * height);
  (definition.layers.collision ?? []).forEach((row, y) => {
    Array.from(row).forEach((character, x) => {
      collision[y * width + x] = COLLISION_CODES[character] ?? COLLISION.DEFAULT;
    });
  });

  const borderTile = definition.border ? convertLegendRows([definition.border], legend)[0] : null;
  const cache = new Map();
  const resolve = (id) => {
    if (!cache.has(id)) cache.set(id, resolveMetatile(tilesets, definition.tileset, id));
    return cache.get(id);
  };

  const map = {
    ...definition,
    width,
    height,
    tiles,
    collision,
    borderTile,
    clearTile: definition.clearTile ?? CLEAR_TILES[definition.tileset],
    inBounds: (x, y) => x >= 0 && y >= 0 && x < width && y < height,
    tileAt: (x, y) => (map.inBounds(x, y) ? tiles[y * width + x] : null),
    /** Metatile definition with flags, or null outside the map. */
    metatileAt: (x, y) => (map.inBounds(x, y) ? resolve(tiles[y * width + x]) : null),
    collisionAt: (x, y) => collision[y * width + x],
    setTile(x, y, id) {
      tiles[y * width + x] = id;
    },
    resolve,
  };
  return map;
}
