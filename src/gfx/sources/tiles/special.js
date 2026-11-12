import { ellipse, poly } from '../../shape-renderer.js';
import { metatile, overlay, shapeRows, shiftRows, tileRows } from './tile-helpers.js';

const MEMORY_FLOOR = tileRows([
  '22222222',
  '21111112',
  '21222212',
  '21211212',
  '21211212',
  '21222212',
  '21111112',
  '22222222',
]);

const MEMORY_FLOOR_ALT = tileRows([
  '11111111',
  '12222221',
  '12111121',
  '12122121',
  '12122121',
  '12111121',
  '12222221',
  '11111111',
]);

const LAB_FLOOR = tileRows(['11111112', '11111112', '11111112', '11111112', '11111112', '11111112', '11111112', '22222222']);

function teleporter(glow) {
  return overlay(LAB_FLOOR, shapeRows(16, 16, [
    { z: 0, tone: 2, shapes: [ellipse(8, 8, 7, 6.5)] },
    { z: 1, tone: glow ? 0 : 1, shade: false, shapes: [ellipse(8, 8, 4.5, 4)] },
    { z: 2, tone: glow ? 1 : 0, shade: false, shapes: [ellipse(8, 8, 2, 1.8)] },
  ]));
}

const LEAGUE_FLOOR = tileRows([
  '00000000',
  '01111110',
  '01000010',
  '01011010',
  '01011010',
  '01000010',
  '01111110',
  '00000000',
]);

const LEAGUE_CARPET = [
  '3222222222222223',
  '3211111111111123',
  '3211111111111123',
  '3211121111211123',
  '3211222112221123',
  '3211121111211123',
  '3211111111111123',
  '3211111111111123',
  '3211111111111123',
  '3211111111111123',
  '3211121111211123',
  '3211222112221123',
  '3211121111211123',
  '3211111111111123',
  '3211111111111123',
  '3222222222222223',
];

const LAVA = tileRows(['22222222', '21122222', '10012222', '21122212', '22222101', '22212212', '22101222', '22212222']);

const CRYSTAL_PILLAR = shapeRows(16, 16, [
  { tone: 0, shapes: [poly([5, 15], [4, 5], [8, 0.5], [12, 5], [11, 15])], overlays: [{ shapes: [poly([8, 1], [10, 5], [9.5, 14], [8, 15])], tone: 1 }] },
]);

export default {
  id: 'special',
  metatiles: [
    metatile('memory_floor', MEMORY_FLOOR),
    metatile('memory_floor_alt', MEMORY_FLOOR_ALT),
    metatile('lab_floor', LAB_FLOOR),
    metatile('teleporter', [teleporter(false), teleporter(true)], { door: true }),
    metatile('league_floor', LEAGUE_FLOOR),
    metatile('league_carpet', LEAGUE_CARPET),
    metatile('lava', [LAVA, shiftRows(LAVA, 1, 1)], { solid: true }),
    metatile('crystal_pillar', overlay(LEAGUE_FLOOR, CRYSTAL_PILLAR), { solid: true }),
  ],
};
