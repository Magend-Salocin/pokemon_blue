import { capsule, ellipse, rect } from '../../shape-renderer.js';
import { flipX, metatile, overlay, quad, shapeRows, shiftRows, splitLarge, tileRows, transpose } from './tile-helpers.js';

export const GRASS = quad(
  ['00000000', '00000000', '02000200', '00200020', '00000000', '00000000', '00020000', '00002000'],
  ['00000000', '00002000', '00000200', '00000000', '02000000', '00200000', '00000000', '00000000'],
  ['00000000', '00000020', '00000002', '00000000', '00200000', '00020000', '00000000', '00000000'],
  ['00000000', '00000000', '00200000', '00020000', '00000000', '00000200', '00000020', '00000000'],
);

const TALL_GRASS = tileRows([
  '11111111',
  '13111311',
  '32313231',
  '22222222',
  '11111111',
  '11311131',
  '13231323',
  '22222222',
]);

export const WATER = tileRows([
  '11111111',
  '11000111',
  '10111011',
  '11111111',
  '11111111',
  '01111100',
  '10111011',
  '11111111',
]);
export const WATER_FRAMES = [WATER, shiftRows(WATER, 2, 1)];

const PATH = quad(
  ['00000000', '00000000', '00010000', '00000000', '00000000', '00000010', '00000000', '00000000'],
  ['00000000', '00000100', '00000000', '00000000', '01000000', '00000000', '00000000', '00000000'],
  ['00000000', '00000000', '00000000', '01000000', '00000000', '00000000', '00001000', '00000000'],
  ['00000000', '00100000', '00000000', '00000000', '00000001', '00000000', '00000000', '00000000'],
);

const SAND = tileRows(['00010000', '00000001', '01000000', '00000100', '00100000', '00000000', '10000010', '00001000']);

const FLOWERS = overlay(tileRows(['00000000']), [
  '................',
  '..1.............',
  '.131.......1....',
  '..1.......131...',
  '..2........1....',
  '...........2....',
  '.....1..........',
  '....131.........',
  '.....1.......1..',
  '.....2......131.',
  '.............1..',
  '..1..........2..',
  '.131............',
  '..1.....1.......',
  '..2....131......',
  '........1.......',
]);

const TREE = splitLarge(overlay(
  tileRows(GRASS, 32, 32),
  shapeRows(32, 32, [
    { z: 0, tone: 2, shade: false, shapes: [rect(13, 21, 6, 9)], overlays: [{ shapes: [rect(15, 22, 1, 8)], tone: 3 }] },
    {
      z: 1,
      tone: 1,
      shapes: [ellipse(16, 11.5, 14, 10.5), ellipse(9, 17, 7, 5), ellipse(23, 17, 7, 5)],
      overlays: [
        { shapes: [ellipse(11, 8, 3, 2), ellipse(20, 6, 3, 2), ellipse(16, 13, 3, 2), ellipse(7, 15, 2.5, 2), ellipse(25, 14, 2.5, 2)], tone: 2 },
        { shapes: [ellipse(10, 6, 2, 1.2), ellipse(18, 4.5, 2, 1)], tone: 0 },
      ],
    },
  ]),
));

const SHRUB = overlay(GRASS, shapeRows(16, 16, [{
  tone: 1,
  shapes: [ellipse(8, 9, 6.5, 5.5), ellipse(5, 7, 3.5, 3), ellipse(11, 7, 3.5, 3)],
  overlays: [{ shapes: [ellipse(6, 9, 1.5, 1), ellipse(10, 10, 1.5, 1), ellipse(8, 6, 1.2, 1)], tone: 2 }],
}]));

export const BOULDER = shapeRows(16, 16, [{
  tone: 1,
  shapes: [ellipse(8, 9, 6.8, 6)],
  overlays: [{ shapes: [ellipse(5.5, 6.5, 1.8, 1.2)], tone: 0 }, { shapes: [capsule([[9, 6], [10, 9], [8.5, 11]], 0.5)], tone: 3 }],
}], [], 2);

const LEDGE_DOWN = overlay(GRASS, [
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '1111111111111111',
  '3333333333333333',
  '2222222222222222',
  '2020202020202020',
  '................',
  '................',
  '................',
]);
const LEDGE_LEFT = flipX(transpose(LEDGE_DOWN));

const CLIFF = tileRows(['22222222', '21122112', '23322332', '22222222', '12211221', '32233223', '22222222', '22222222']);
const GRAPPLE_LEDGE = overlay(CLIFF, [
  '................',
  '................',
  '.....3333.......',
  '....300003......',
  '....30..03......',
  '....300003......',
  '.....3333.......',
  '.......3........',
  '.......3........',
  '................',
]);

/** Water with a shore on the given sides (n, s, e, w); corners combine two sides. */
function bank(sides, water) {
  return water.map((row, y) =>
    [...row]
      .map((pixel, x) => {
        const distances = [];
        if (sides.includes('n')) distances.push(y);
        if (sides.includes('s')) distances.push(15 - y);
        if (sides.includes('w')) distances.push(x);
        if (sides.includes('e')) distances.push(15 - x);
        const distance = Math.min(...distances);
        if (distance < 3) return GRASS[y][x];
        if (distance === 3) return '3';
        if (distance === 4) return '0';
        return pixel;
      })
      .join(''),
  );
}

const BRIDGE_H = overlay(WATER, [
  '3333333333333333',
  '2222222222222222',
  '1101110111011101',
  '1101110111011101',
  '3333333333333333',
  '1110111011101110',
  '1110111011101110',
  '3333333333333333',
  '1101110111011101',
  '1101110111011101',
  '3333333333333333',
  '1110111011101110',
  '1110111011101110',
  '3333333333333333',
  '2222222222222222',
  '3333333333333333',
]);
const BRIDGE_V = transpose(BRIDGE_H);

const FENCE = overlay(GRASS, [
  '................',
  '................',
  '..333......333..',
  '..303......303..',
  '3330333333330333',
  '0000000000000000',
  '3330333333330333',
  '..303......303..',
  '3330333333330333',
  '0000000000000000',
  '3332333333332333',
  '..323......323..',
  '..323......323..',
  '..333......333..',
  '................',
  '................',
]);

const SIGN = overlay(GRASS, [
  '................',
  '................',
  '.33333333333333.',
  '.30000000000003.',
  '.30333033033303.',
  '.30000000000003.',
  '.30330333033003.',
  '.30000000000003.',
  '.32222222222223.',
  '.33333322333333.',
  '......3223......',
  '......3223......',
  '......3223......',
  '.....333333.....',
  '................',
  '................',
]);

const MAILBOX = overlay(GRASS, [
  '................',
  '................',
  '....33333333....',
  '...3000000003...',
  '...3000000003.3.',
  '...30333333033..',
  '...3000000003.3.',
  '...3111111113...',
  '...3222222223...',
  '...3333333333...',
  '......3223......',
  '......3223......',
  '......3223......',
  '.....333333.....',
  '................',
  '................',
]);

export default {
  id: 'outdoor',
  metatiles: [
    metatile('grass', GRASS),
    metatile('tall_grass', [TALL_GRASS, shiftRows(TALL_GRASS, 1)], { grass: true }),
    metatile('path', PATH),
    metatile('sand', SAND),
    metatile('flowers', [FLOWERS, shiftRows(FLOWERS, 1)]),
    metatile('tree_tl', TREE.tl, { solid: true }),
    metatile('tree_tr', TREE.tr, { solid: true }),
    metatile('tree_bl', TREE.bl, { solid: true }),
    metatile('tree_br', TREE.br, { solid: true }),
    metatile('shrub', SHRUB, { solid: true, cuttable: true }),
    metatile('boulder', overlay(GRASS, BOULDER), { solid: true, pushable: true }),
    metatile('ledge_down', LEDGE_DOWN, { ledge: 'down' }),
    metatile('ledge_left', LEDGE_LEFT, { ledge: 'left' }),
    metatile('ledge_right', flipX(LEDGE_LEFT), { ledge: 'right' }),
    metatile('cliff', CLIFF, { solid: true }),
    metatile('grapple_ledge', GRAPPLE_LEDGE, { solid: true, climbable: true }),
    metatile('water', WATER_FRAMES, { water: true }),
    ...['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'].map((sides) =>
      metatile(`bank_${sides}`, WATER_FRAMES.map((water) => bank(sides, water)), { water: true }),
    ),
    metatile('bridge_h', BRIDGE_H),
    metatile('bridge_v', BRIDGE_V),
    metatile('fence', FENCE, { solid: true }),
    metatile('sign', SIGN, { solid: true }),
    metatile('mailbox', MAILBOX, { solid: true }),
  ],
};
