import { ellipse, poly } from '../../shape-renderer.js';
import { metatile, overlay, shapeRows, shiftRows, tileRows } from './tile-helpers.js';

const FLOOR = tileRows(['11111111', '11121111', '11111111', '11111121', '12111111', '11111111', '11112111', '11111111']);

const WALL = tileRows([
  '22222222',
  '23322232',
  '32233323',
  '22222222',
  '22322223',
  '23233232',
  '32222322',
  '22222222',
]);

const WATER = tileRows(['22222222', '22111222', '21222122', '22222222', '22222222', '12222211', '21222122', '22222222']);

const LADDER = [
  '..3........3....',
  '..3........3....',
  '..3333333333....',
  '..3000000003....',
  '..3........3....',
  '..3333333333....',
  '..3000000003....',
  '..3........3....',
  '..3333333333....',
  '..3000000003....',
  '..3........3....',
  '..3333333333....',
  '..3000000003....',
  '..3........3....',
  '..3........3....',
  '..3........3....',
];

const HOLE = shapeRows(16, 16, [{ tone: 3, shade: false, shapes: [ellipse(8, 8, 6.5, 5.5)] }]);

const STALAGMITE = shapeRows(16, 16, [
  { z: 0, tone: 1, shapes: [poly([2, 15], [5, 4], [8, 9], [10, 1], [14, 15])], overlays: [{ shapes: [poly([9, 4], [10, 2], [11, 8])], tone: 0 }] },
]);

const ICE = tileRows(['00000000', '00000010', '00000100', '00001000', '00000000', '01000000', '10000000', '00000000']);

export default {
  id: 'cave',
  metatiles: [
    metatile('floor', FLOOR),
    metatile('wall', WALL, { solid: true }),
    metatile('ladder_up', overlay(FLOOR, LADDER), { door: true }),
    metatile('ladder_down', overlay(overlay(FLOOR, HOLE), LADDER.slice(0, 10), 0, 3), { door: true }),
    metatile('water', [WATER, shiftRows(WATER, 2, 1)], { water: true }),
    metatile('stalagmite', overlay(FLOOR, STALAGMITE), { solid: true }),
    metatile('ice', ICE, { slippery: true }),
  ],
};
