// Builders for the standard interiors (Halte, Comptoir, house), so every town shares the same
// layouts and exterior warps can target fixed entry points.
// `exit` = { map, x, y }: the door tile of the building on the exterior map.

/** Where the player appears when entering, and the doormat that leads back outside. */
export const HALTE_ENTRY = { x: 4, y: 7 };
export const COMPTOIR_ENTRY = { x: 3, y: 7 };
export const HOUSE_ENTRY = { x: 3, y: 7 };

const EMPTY = { trainers: [], signs: [], items: [], hiddenItems: [], triggers: [], connections: {} };

function interior({ id, name, music, rows, entry, exit, npcs = [], ...rest }) {
  return {
    ...EMPTY,
    id,
    name,
    tileset: 'indoor',
    music,
    layers: { ground: rows },
    encounters: null,
    warps: [{ x: entry.x, y: entry.y, to: exit.map, toX: exit.x, toY: exit.y }],
    npcs,
    ...rest,
  };
}

/** Halte: nurse behind the counter (talk from (3, 3)), storage terminal in the top-right corner. */
export function halte({ id, name, exit, npcs = [], ...rest }) {
  return interior({
    id,
    name,
    music: 'halte',
    entry: HALTE_ENTRY,
    exit,
    rows: [
      '#wwH##wwK#',
      '#,,,,,,,,#',
      '#,[-],,,,#',
      '#,,,,,,,,#',
      '#P,,,,,,P#',
      '#,,,,,,,,#',
      '#,,,,,,,,#',
      '####m#####',
    ],
    npcs: [
      { id: 'infirmiere', sprite: 'infirmiere', x: 3, y: 1, facing: 'down', movement: 'static', script: [{ cmd: 'call', script: 'halte_heal' }] },
      ...npcs,
    ],
    ...rest,
  });
}

/**
 * Comptoir: clerk behind the counter (talk from (2, 3)).
 * stock: [{ item, badge? }] — entries with a badge appear once the badge is owned.
 */
export function comptoir({ id, name, exit, stock, npcs = [], music = 'halte', ...rest }) {
  return interior({
    id,
    name,
    music,
    entry: COMPTOIR_ENTRY,
    exit,
    rows: [
      '##w##w##',
      '#,,,,,L#',
      '#[-],,L#',
      '#,,,,,,#',
      '#,,,,,,#',
      '#P,,,,P#',
      '#,,,,,,#',
      '###m####',
    ],
    npcs: [
      { id: 'vendeur', sprite: 'vendeur', x: 2, y: 1, facing: 'down', movement: 'static', script: [{ cmd: 'open_menu', menu: 'shop', params: { stock } }] },
      ...npcs,
    ],
    ...rest,
  });
}

const HOUSE_LAYOUTS = {
  a: [
    '#w##w###',
    '#L....P#',
    '#L.....#',
    '#..tt..#',
    '#..tt..#',
    '#......#',
    '#......#',
    '###m####',
  ],
  b: [
    '##w##w##',
    '#P..L..#',
    '#...L..#',
    '#rr....#',
    '#rr..tt#',
    '#....tt#',
    '#......#',
    '###m####',
  ],
  c: [
    '#w#w##w#',
    '#B..LL.#',
    '#B..LL.#',
    '#......#',
    '#.tt..P#',
    '#.tt...#',
    '#......#',
    '###m####',
  ],
};

/** Small house (8 × 8). layout: 'a' | 'b' | 'c'. Free floor: rows 5 and 6, and most of rows 1 to 3. */
export function house({ id, name, exit, music, layout = 'a', npcs = [], ...rest }) {
  return interior({ id, name, music, entry: HOUSE_ENTRY, exit, rows: HOUSE_LAYOUTS[layout], npcs, ...rest });
}
