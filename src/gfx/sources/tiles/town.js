import { capsule, ellipse, poly, rect } from '../../shape-renderer.js';
import { metatile, overlay, shapeRows, tileRows } from './tile-helpers.js';

const GROUND = tileRows(['00000001', '00000001', '00000001', '00000001', '00000001', '00000001', '00000001', '11111111']);

const ROOF_PATTERNS = {
  a: ['11111111', '12111211', '22222222', '33333333', '11111111', '11121112', '22222222', '33333333'],
  b: ['12221222', '12221222', '12221222', '33333333', '22122212', '22122212', '22122212', '33333333'],
  c: ['22222222', '32223222', '23232323', '22222222'],
  halte: ['11111111', '11111111', '22222222', '11111111'],
  comptoir: ['00221100', '00221100', '00221100', '00221100'],
  arena: ['33333333', '32223222', '32223222', '32223222'],
  lab: ['11111111', '11111111', '11111111', '12112112'],
};

const WALL_PATTERNS = {
  a: ['00000000', '00000000', '00000000', '11111111'],
  b: ['00010000', '00010000', '00010000', '11111111', '00000001', '00000001', '00000001', '11111111'],
  c: ['00000000', '01110110', '01110110', '00000000', '01101110', '01101110', '00000000', '00000000'],
  halte: ['00000000'],
  comptoir: ['00000000'],
  arena: ['10000001', '10000001', '10000001', '10000001'],
  lab: ['00000000', '00000000', '00000000', '01000000'],
};

function setColumn(rows, x, character) {
  return rows.map((row) => row.slice(0, x) + character + row.slice(x + 1));
}

function setRow(rows, y, character) {
  return rows.map((row, index) => (index === y ? character.repeat(row.length) : row));
}

/** Roof metatile: ridge on top row tiles, eave on bottom row tiles, dark sides at the ends. */
function roofTile(pattern, { top = false, bottom = false, left = false, right = false }) {
  let rows = tileRows(pattern);
  if (top) rows = setRow(setRow(rows, 0, '3'), 1, '2');
  if (bottom) rows = setRow(setRow(rows, 14, '2'), 15, '3');
  if (left) rows = setColumn(rows, 0, '3');
  if (right) rows = setColumn(rows, 15, '3');
  return rows;
}

function wallTile(pattern, { left = false, right = false }) {
  let rows = setRow(tileRows(pattern), 0, '2');
  if (left) rows = setColumn(rows, 0, '3');
  if (right) rows = setColumn(rows, 15, '3');
  return rows;
}

const WINDOW = [
  '3333333333',
  '3000330013',
  '3001330003',
  '3000330003',
  '3333333333',
  '3000330003',
  '3000330003',
  '3333333333',
  '2222222222',
];

const DOOR = [
  '33333333',
  '32222223',
  '32111123',
  '32111123',
  '32111123',
  '32222223',
  '32111123',
  '32111103',
  '32111123',
  '32111123',
  '32222223',
  '33333333',
];

const GLASS_DOOR = [
  '3333333333',
  '3000330003',
  '3010330103',
  '3001330013',
  '3000330003',
  '3000330003',
  '3000330003',
  '3000330003',
  '3000330003',
  '3333333333',
  '2222222222',
];

const HALTE_EMBLEM = shapeRows(12, 12, [
  { tone: 0, shade: false, shapes: [ellipse(6, 6, 5.5, 5.5)] },
  {
    z: 1,
    tone: 2,
    shade: false,
    shapes: [ellipse(6, 3.2, 1.6, 2.4), ellipse(6, 8.8, 1.6, 2.4), ellipse(3.2, 6, 2.4, 1.6), ellipse(8.8, 6, 2.4, 1.6)],
  },
]);

const BAG_EMBLEM = shapeRows(12, 12, [
  { z: 0, tone: 2, shade: false, shapes: [capsule([[3.5, 5], [4, 2], [8, 2], [8.5, 5]], 0.8)] },
  { z: 1, tone: 0, shapes: [poly([2, 5], [10, 5], [11, 11], [1, 11])], overlays: [{ shapes: [rect(5, 7, 2, 2)], tone: 2 }] },
]);

const ARENA_EMBLEM = shapeRows(12, 12, [
  { tone: 0, shapes: [poly([6, 0.5], [11, 3], [10, 8], [6, 11.5], [2, 8], [1, 3])], overlays: [{ shapes: [poly([6, 3], [8.5, 6], [6, 9], [3.5, 6])], tone: 2 }] },
]);

const LAB_EMBLEM = shapeRows(12, 12, [
  { tone: 0, shapes: [rect(4.5, 0.5, 3, 4), poly([4.5, 4], [7.5, 4], [11, 11], [1, 11])], overlays: [{ shapes: [rect(0, 7.5, 12, 4)], tone: 1 }] },
]);

function building(prefix, style, { emblem, door = DOOR, windowRows = WINDOW } = {}) {
  const roof = ROOF_PATTERNS[style];
  const wall = WALL_PATTERNS[style];
  const roofBottomMiddle = roofTile(roof, { bottom: true });
  return [
    metatile(`${prefix}_roof_top_l`, roofTile(roof, { top: true, left: true }), { solid: true }),
    metatile(`${prefix}_roof_top_m`, roofTile(roof, { top: true }), { solid: true }),
    metatile(`${prefix}_roof_top_r`, roofTile(roof, { top: true, right: true }), { solid: true }),
    metatile(`${prefix}_roof_l`, roofTile(roof, { bottom: true, left: true }), { solid: true }),
    metatile(`${prefix}_roof_m`, roofBottomMiddle, { solid: true }),
    ...(emblem ? [metatile(`${prefix}_roof_emblem`, overlay(roofBottomMiddle, emblem, 2, 1), { solid: true })] : []),
    metatile(`${prefix}_roof_r`, roofTile(roof, { bottom: true, right: true }), { solid: true }),
    metatile(`${prefix}_wall_l`, wallTile(wall, { left: true }), { solid: true }),
    metatile(`${prefix}_wall`, wallTile(wall, {}), { solid: true }),
    metatile(`${prefix}_wall_r`, wallTile(wall, { right: true }), { solid: true }),
    metatile(`${prefix}_window`, overlay(wallTile(wall, {}), windowRows, 3, 3), { solid: true }),
    metatile(`${prefix}_door`, overlay(wallTile(wall, {}), door, Math.floor((16 - door[0].length) / 2), 16 - door.length), { door: true }),
  ];
}

const LIGHTHOUSE_TOP = shapeRows(16, 16, [
  { z: 0, tone: 2, shapes: [poly([3, 5], [8, 0.5], [13, 5])] },
  { z: 1, tone: 0, shapes: [rect(4, 5, 8, 6)], overlays: [{ shapes: [ellipse(8, 8, 2, 2)], tone: 1 }] },
  { z: 2, tone: 2, shapes: [rect(2, 11, 12, 2), rect(4, 13, 8, 3)] },
]);
const LIGHTHOUSE_MID = shapeRows(16, 16, [
  { tone: 0, shapes: [poly([4, 0], [12, 0], [13, 16], [3, 16])], overlays: [{ shapes: [rect(0, 4, 16, 4), rect(0, 12, 16, 4)], tone: 2 }] },
]);
const LIGHTHOUSE_BASE = overlay(shapeRows(16, 16, [
  { tone: 0, shapes: [poly([3, 0], [13, 0], [14, 15], [2, 15])], overlays: [{ shapes: [rect(0, 4, 16, 3)], tone: 2 }] },
]), ['3333', '3113', '3113', '3113', '3103', '3113'], 6, 9);

function turbineHead(angle) {
  const blade = (a) => capsule([[8, 6], [8 + Math.cos(a) * 7, 6 + Math.sin(a) * 6]], 1.2, 0.6);
  return shapeRows(16, 16, [
    { z: 0, tone: 0, shapes: [0, 1, 2].map((k) => blade(angle + (k * 2 * Math.PI) / 3)) },
    { z: 0, tone: 1, shapes: [rect(7, 7, 2, 9)] },
    { z: 1, tone: 2, shapes: [ellipse(8, 6, 2, 2)] },
  ]);
}
const TURBINE_MAST = shapeRows(16, 16, [{ tone: 1, shapes: [rect(7, 0, 2, 13), poly([5, 13], [11, 13], [12, 16], [4, 16])] }]);

const FACTORY_ROOF = tileRows(['33000000', '32300000', '32230000', '32223000', '32222300', '32222230', '32222223', '33333333']);
const FACTORY_WALL = tileRows(['10101010']).map((row, y) => (y === 0 ? '2'.repeat(16) : row));
const FACTORY_CHIMNEY = shapeRows(16, 16, [
  { z: 0, tone: 0, shade: false, shapes: [ellipse(9, 2.5, 3, 2), ellipse(12, 1.5, 2.5, 1.5)] },
  { z: 1, tone: 1, shapes: [rect(5, 4, 6, 12)], overlays: [{ shapes: [rect(0, 6, 16, 2), rect(0, 11, 16, 2)], tone: 2 }] },
]);
const ROLLING_DOOR = ['3333333333', ...Array(10).fill('3222222223').map((row, y) => (y % 2 ? '3111111113' : row)), '3333333333'];

export default {
  id: 'town',
  extends: 'outdoor',
  metatiles: [
    metatile('ground', GROUND),
    ...building('house_a', 'a'),
    ...building('house_b', 'b'),
    ...building('house_c', 'c'),
    ...building('halte', 'halte', { emblem: HALTE_EMBLEM, door: GLASS_DOOR }),
    ...building('comptoir', 'comptoir', { emblem: BAG_EMBLEM, door: GLASS_DOOR }),
    ...building('arena', 'arena', { emblem: ARENA_EMBLEM }),
    ...building('lab', 'lab', { emblem: LAB_EMBLEM, door: GLASS_DOOR }),
    metatile('lighthouse_top', overlay(GROUND, LIGHTHOUSE_TOP), { solid: true }),
    metatile('lighthouse_mid', overlay(GROUND, LIGHTHOUSE_MID), { solid: true }),
    metatile('lighthouse_base', overlay(GROUND, LIGHTHOUSE_BASE), { door: true }),
    metatile('turbine_top', [0, Math.PI / 3].map((angle) => overlay(GROUND, turbineHead(angle - Math.PI / 2))), { solid: true }),
    metatile('turbine_mast', overlay(GROUND, TURBINE_MAST), { solid: true }),
    metatile('factory_roof', FACTORY_ROOF, { solid: true }),
    metatile('factory_wall', FACTORY_WALL, { solid: true }),
    metatile('factory_chimney', overlay(FACTORY_ROOF, FACTORY_CHIMNEY), { solid: true }),
    metatile('factory_door', overlay(FACTORY_WALL, ROLLING_DOOR, 3, 4), { door: true }),
  ],
};
