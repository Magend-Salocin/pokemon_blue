// UI sprites: window frame, bars, status and type labels, party capsules, badges,
// party mini icons, title logo. Built from text rows and small vector shapes (pure).

import { capsule, ellipse, poly, rect } from '../../shape-renderer.js';
import { buildGlyphTable } from '../../font-glyphs.js';
import { BODY_PLANS } from '../../creature-generator.js';
import { shapeRows, shiftRows } from '../tiles/tile-helpers.js';
import { HAND_DRAWN_CREATURES } from '../creatures/index.js';
import { FRAME_TILES } from './frame.js';

// 3 × 5 capitals for small labels.
const MINI_FONT = {
  A: ['.3.', '3.3', '333', '3.3', '3.3'], B: ['33.', '3.3', '33.', '3.3', '33.'], C: ['.33', '3..', '3..', '3..', '.33'],
  D: ['33.', '3.3', '3.3', '3.3', '33.'], E: ['333', '3..', '33.', '3..', '333'], F: ['333', '3..', '33.', '3..', '3..'],
  G: ['.33', '3..', '3.3', '3.3', '.33'], H: ['3.3', '3.3', '333', '3.3', '3.3'], I: ['333', '.3.', '.3.', '.3.', '333'],
  K: ['3.3', '3.3', '33.', '3.3', '3.3'], L: ['3..', '3..', '3..', '3..', '333'], M: ['3.3', '333', '333', '3.3', '3.3'],
  N: ['33.', '3.3', '3.3', '3.3', '3.3'], O: ['.3.', '3.3', '3.3', '3.3', '.3.'], P: ['33.', '3.3', '33.', '3..', '3..'],
  R: ['33.', '3.3', '33.', '3.3', '3.3'], S: ['.33', '3..', '.3.', '..3', '33.'], T: ['333', '.3.', '.3.', '.3.', '.3.'],
  U: ['3.3', '3.3', '3.3', '3.3', '333'], V: ['3.3', '3.3', '3.3', '3.3', '.3.'], X: ['3.3', '3.3', '.3.', '3.3', '3.3'],
  Y: ['3.3', '3.3', '.3.', '.3.', '.3.'], Z: ['333', '..3', '.3.', '3..', '333'],
};

function miniText(text, ink) {
  const rows = ['', '', '', '', ''];
  [...text].forEach((character, index) => {
    const glyph = MINI_FONT[character];
    if (!glyph) throw new Error(`Mini font has no "${character}"`);
    glyph.forEach((row, y) => {
      rows[y] += (index > 0 ? '.' : '') + row.replaceAll('3', ink);
    });
  });
  return rows;
}

/** Rounded label box of fixed width with centered mini text. */
function label(text, width, { background, ink, border = '3' }) {
  const textRows = miniText(text, ink);
  const textWidth = textRows[0].length;
  const left = Math.floor((width - textWidth) / 2);
  const inner = (row) => {
    const content = [...background.repeat(width - 2)];
    [...row].forEach((pixel, x) => {
      if (pixel !== '.') content[left - 1 + x] = pixel;
    });
    return `${border}${content.join('')}${border}`;
  };
  return [
    `.${border.repeat(width - 2)}.`,
    ...textRows.map(inner),
    `.${border.repeat(width - 2)}.`,
  ];
}

export const STATUS_LABELS = { brl: 'BRL', psn: 'PSN', par: 'PAR', som: 'SOM', gel: 'GEL' };

export const TYPE_LABELS = {
  normal: 'NORM', feu: 'FEU', eau: 'EAU', flore: 'FLOR', foudre: 'FOUD', givre: 'GIVR', combat: 'COMB',
  toxique: 'TOXI', terre: 'TERR', vent: 'VENT', arcane: 'ARCA', insecte: 'INSE', roche: 'ROCH', ombre: 'OMBR', metal: 'META',
};

const HP_WIDTH = 48;

function barFrame(width, height) {
  return [
    `.${'3'.repeat(width + 2)}.`,
    ...Array.from({ length: height }, () => `3${'0'.repeat(width + 2)}3`),
    `.${'3'.repeat(width + 2)}.`,
  ];
}

const HP_FILL = {
  high: Array(3).fill('2'.repeat(HP_WIDTH)),
  mid: ['21'.repeat(HP_WIDTH / 2), '12'.repeat(HP_WIDTH / 2), '21'.repeat(HP_WIDTH / 2)],
  low: Array(3).fill('3'.repeat(HP_WIDTH)),
};

const CAPSULE_ICONS = {
  full: ['..3333..', '.300003.', '30000003', '33300333', '32233223', '32222223', '.322223.', '..3333..'],
  empty: ['..3333..', '.3....3.', '3......3', '333..333', '3..33..3', '3......3', '.3....3.', '..3333..'],
  ko: ['..3333..', '.322223.', '32222223', '33322333', '32233223', '32222223', '.322223.', '..3333..'],
};

const BADGE_EMBLEMS = {
  roche: [poly([8, 2], [13, 5], [13, 11], [8, 14], [3, 11], [3, 5])],
  eau: [ellipse(8, 10, 4.5, 4.5), poly([8, 1.5], [12, 9], [4, 9])],
  foudre: [poly([9, 1], [4, 9], [8, 9], [6, 15], [12, 6], [8.5, 6], [11, 1])],
  flore: [ellipse(8, 8, 3.2, 6.5, 0.7), capsule([[4, 13], [7, 9]], 0.6)],
  vent: [capsule([[3, 5], [10, 4], [12, 6], [10, 8], [8, 7]], 1.1), capsule([[3, 10], [11, 10], [13, 12], [11, 14]], 1.1)],
  ombre: [ellipse(8, 8, 6, 6)],
  feu: [poly([8, 15], [3, 11], [4, 5], [6, 8], [8, 1], [10, 7], [12, 4], [13, 11])],
  arcane: [poly([8, 1], [9.8, 6], [15, 6], [10.8, 9.2], [12.4, 14.5], [8, 11.4], [3.6, 14.5], [5.2, 9.2], [1, 6], [6.2, 6])],
};

function badge(type) {
  const emblem = { z: 1, tone: 0, shapes: BADGE_EMBLEMS[type] };
  if (type === 'ombre') emblem.subtract = [ellipse(10.5, 6.5, 5, 5)];
  return shapeRows(16, 16, [{ z: 0, tone: 2, shapes: [ellipse(8, 8, 7.5, 7.5)] }, emblem], [], 1);
}

// Party mini icons: one per body plan, 2 frames (second one bounces 1 pixel).
const MINI_ICONS = {
  biped: [{ tone: 1, shapes: [ellipse(8, 11, 4, 3.5), ...[5.5, 10.5].map((x) => ellipse(x, 14, 1.6, 1.2))] }, { z: 1, tone: 1, shapes: [ellipse(8, 6, 4.5, 4)] }],
  quadruped: [{ tone: 1, shapes: [ellipse(8, 10, 6, 3.5), ...[3.5, 6.5, 9.5, 12.5].map((x) => rect(x - 0.8, 11, 1.6, 4))] }, { z: 1, tone: 1, shapes: [ellipse(5, 7, 3.5, 3.2), poly([3, 5], [3, 1.5], [5.5, 4])] }],
  bird: [{ tone: 1, shapes: [poly([8, 9], [1, 5], [2, 11]), poly([8, 9], [15, 5], [14, 11])] }, { z: 1, tone: 1, shapes: [ellipse(8, 10, 3.5, 4), ellipse(8, 5, 3, 2.8)] }],
  serpent: [{ tone: 1, shapes: [capsule([[3, 14], [12, 14], [12, 9], [5, 8], [6, 4]], 1.8)] }, { z: 1, tone: 1, shapes: [ellipse(8, 4, 3, 2.5)] }],
  fish: [{ tone: 1, shapes: [ellipse(7, 9, 5.5, 4), poly([11, 9], [15, 5], [15, 13])] }],
  insect: [{ tone: 2, shapes: [...[4, 12].map((x) => capsule([[8, 10], [x, 13]], 0.6)), capsule([[6, 4], [5, 1]], 0.5), capsule([[10, 4], [11, 1]], 0.5)] }, { z: 1, tone: 1, shapes: [ellipse(8, 11, 3.5, 3.5), ellipse(8, 6, 3.5, 3)] }],
  blob: [{ tone: 1, shapes: [ellipse(8, 10, 6.5, 5)] }],
  plant: [{ tone: 1, shapes: [ellipse(5, 4, 3.5, 1.5, -0.5), ellipse(11, 4, 3.5, 1.5, 0.5)] }, { z: 1, tone: 1, shapes: [ellipse(8, 10, 5, 4.5)] }],
  golem: [{ tone: 1, shapes: [rect(3, 6, 10, 8), rect(1, 7, 2, 5), rect(13, 7, 2, 5)] }, { z: 1, tone: 1, shapes: [rect(5.5, 2, 5, 4)] }],
  ghost: [{ tone: 1, shapes: [ellipse(8, 7, 5, 5), poly([3, 7], [13, 7], [13, 14], [10.5, 12], [8, 14], [5.5, 12], [3, 14])] }],
  dragon: [{ tone: 1, shapes: [poly([7, 8], [1, 3], [2, 9]), poly([9, 8], [15, 3], [14, 9])] }, { z: 1, tone: 1, shapes: [ellipse(8, 11, 3.5, 3.5), ellipse(8, 5.5, 3, 2.8), poly([6, 4], [5, 1], [7, 3]), poly([10, 4], [11, 1], [9, 3])] }],
};

function miniIconFrames(plan) {
  const rows = shapeRows(16, 16, MINI_ICONS[plan].map((part, index) => ({ z: index, ...part })), [], 1);
  return [rows, shiftRows(rows, 0, -1)];
}

/** Title logo: font glyphs at 2× with a 1-pixel outline and 2-tone shading. */
function logoRows(text) {
  const glyphs = buildGlyphTable();
  const scale = 2;
  const width = text.length * 8 * scale + 2;
  const height = 8 * scale + 2;
  const grid = Array.from({ length: height }, () => Array(width).fill('.'));
  [...text].forEach((character, index) => {
    const rows = glyphs.get(character) ?? glyphs.get('?');
    rows.forEach((row, y) => {
      [...row].forEach((pixel, x) => {
        if (pixel === '.') return;
        for (let dy = 0; dy < scale; dy += 1) {
          for (let dx = 0; dx < scale; dx += 1) {
            const py = 1 + y * scale + dy;
            grid[py][1 + index * 8 * scale + x * scale + dx] = py <= 1 + 1 * scale + 2 ? '0' : py >= height - 1 - 3 * scale ? '2' : '1';
          }
        }
      });
    });
  });
  const isInk = (x, y) => y >= 0 && y < height && x >= 0 && x < width && grid[y][x] !== '.' && grid[y][x] !== '3';
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (grid[y][x] === '.' && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => isInk(x + dx, y + dy))) grid[y][x] = '3';
    }
  }
  return grid.map((row) => row.join(''));
}

function silhouette(rows) {
  return rows.map((row) => row.replace(/[0-3]/g, '3'));
}

/** Atlas frames: "frame/<part>", "hp/<state>", "status/<id>", "type/<id>", "capsule/<state>", "badge/<type>", "icon/<plan>/<n>", "logo/<word>", "title/azurel". */
export function buildUiFrames() {
  const frames = {};
  for (const [part, rows] of Object.entries(FRAME_TILES)) frames[`frame/${part}`] = rows;
  frames['hp/frame'] = barFrame(HP_WIDTH, 3);
  for (const [state, rows] of Object.entries(HP_FILL)) frames[`hp/${state}`] = rows;
  frames['xp/frame'] = barFrame(64, 2);
  frames['xp/fill'] = Array(2).fill('2'.repeat(64));
  for (const [id, text] of Object.entries(STATUS_LABELS)) frames[`status/${id}`] = label(text, 16, { background: '3', ink: '0' });
  for (const [id, text] of Object.entries(TYPE_LABELS)) frames[`type/${id}`] = label(text, 20, { background: '0', ink: '3' });
  for (const [state, rows] of Object.entries(CAPSULE_ICONS)) frames[`capsule/${state}`] = rows;
  for (const type of Object.keys(BADGE_EMBLEMS)) frames[`badge/${type}`] = badge(type);
  for (const plan of BODY_PLANS) {
    miniIconFrames(plan).forEach((rows, index) => {
      frames[`icon/${plan}/${index}`] = rows;
    });
  }
  frames['logo/bestiora'] = logoRows('BESTIORA');
  frames['logo/azur'] = logoRows('AZUR');
  frames['title/azurel'] = silhouette(HAND_DRAWN_CREATURES.azurel.front);
  return frames;
}
