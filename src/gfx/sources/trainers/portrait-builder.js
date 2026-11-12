// Battle portraits (48 × 48) built from declarative configs with the shape renderer (pure).
// config = {
//   build: 'adult' | 'kid' | 'large',
//   hair: 'short' | 'long' | 'spiky' | 'bald' | 'bun' | 'ponytail' | 'curly', hairTone,
//   outfit: 'shirt' | 'coat' | 'jacket' | 'swim' | 'uniform' | 'robe', top (tone),
//   hat: null | 'cap' | 'hat' | 'helmet' | 'hood' | 'bandana' | 'beanie', hatTone,
//   extras: ['glasses', 'beard', 'mustache', 'backpack', 'scarf', 'lashes'],
//   expression: 'smile' | 'neutral' | 'smirk' | 'stern',
// }

import { capsule, ellipse, pair, poly, rect, renderParts } from '../../shape-renderer.js';
import { spriteToRows } from '../../sprite-utils.js';

export const PORTRAIT_SIZE = 48;
const AXIS = 24;
const mirror = (shape) => pair(shape, AXIS);

const BUILDS = {
  adult: { headY: 19, headRx: 10, headRy: 11.5, shoulderY: 31, shoulderHalf: 16, torsoHalf: 18 },
  kid: { headY: 21, headRx: 10.5, headRy: 11, shoulderY: 34, shoulderHalf: 12, torsoHalf: 14 },
  large: { headY: 18, headRx: 10.5, headRy: 11.5, shoulderY: 30, shoulderHalf: 19, torsoHalf: 22 },
};

function torsoShape(b) {
  const { shoulderY: y, shoulderHalf: s, torsoHalf: t } = b;
  return poly([AXIS - t, 49], [AXIS - t + 2, y + 5], [AXIS - s, y], [AXIS + s, y], [AXIS + t - 2, y + 5], [AXIS + t, 49]);
}

function hairParts(config, b) {
  const tone = config.hairTone ?? 3;
  const top = b.headY - b.headRy;
  const front = { z: 4, tone, highlight: true };
  const back = { z: 0, tone };
  switch (config.hair) {
    case 'bald':
      return [{ ...front, shapes: mirror(ellipse(AXIS - b.headRx + 1, b.headY - 2, 2.2, 4)) }];
    case 'long':
      return [
        { ...back, shapes: [ellipse(AXIS, b.headY + 3, b.headRx + 3.5, b.headRy + 5)] },
        { ...front, shapes: [ellipse(AXIS, top + 5, b.headRx + 1.2, 6.5), ...mirror(capsule([[AXIS - b.headRx, b.headY - 4], [AXIS - b.headRx - 0.5, b.headY + 8]], 2.2))] },
      ];
    case 'spiky': {
      const spikes = [];
      for (let k = -2; k <= 2; k += 1) {
        const x = AXIS + k * 4.5;
        spikes.push(poly([x - 4, top + 6], [x + k * 0.8, top - 3 + Math.abs(k)], [x + 4, top + 6]));
      }
      return [{ ...front, shapes: [ellipse(AXIS, top + 5, b.headRx + 1, 6), ...spikes] }];
    }
    case 'bun':
      return [
        { ...back, shapes: [ellipse(AXIS, top - 1, 5, 4)] },
        { ...front, shapes: [ellipse(AXIS, top + 5, b.headRx + 1, 6.5)] },
      ];
    case 'ponytail':
      return [
        { ...back, shapes: [capsule([[AXIS + 8, top + 3], [AXIS + 14, top + 9], [AXIS + 15, b.headY + 10]], 3.2, 2.2)] },
        { ...front, shapes: [ellipse(AXIS, top + 5, b.headRx + 1, 6.5)] },
      ];
    case 'curly': {
      const curls = [-9, -5, 0, 5, 9].map((dx) => ellipse(AXIS + dx, top + 3 + Math.abs(dx) * 0.25, 4, 4));
      return [{ ...front, shapes: [ellipse(AXIS, top + 5, b.headRx + 1, 6), ...curls, ...mirror(ellipse(AXIS - b.headRx, b.headY - 2, 2.8, 4))] }];
    }
    default:
      return [{ ...front, shapes: [ellipse(AXIS, top + 5, b.headRx + 1, 6.3), ...mirror(rect(AXIS - b.headRx - 0.5, top + 5, 2.5, 7))] }];
  }
}

function hatParts(config, b) {
  const tone = config.hatTone ?? 2;
  const top = b.headY - b.headRy;
  const z = 6;
  switch (config.hat) {
    case 'cap':
      return [
        { z, tone, highlight: true, shapes: [ellipse(AXIS, top + 4.5, b.headRx + 1.5, 6.5)] },
        { z: z + 1, tone, shapes: [poly([AXIS - 12, top + 8], [AXIS + 12, top + 8], [AXIS + 14, top + 11], [AXIS - 14, top + 11])] },
      ];
    case 'hat':
      return [
        { z, tone, shapes: [ellipse(AXIS, top + 7, 18, 3.6)] },
        { z: z + 1, tone, highlight: true, shapes: [rect(AXIS - 8, top - 3, 16, 10), ellipse(AXIS, top - 3, 8, 2)], overlays: [{ shapes: [rect(AXIS - 8, top + 3, 16, 2)], tone: tone === 3 ? 1 : 3 }] },
      ];
    case 'helmet':
      return [
        { z, tone, highlight: true, shapes: [ellipse(AXIS, b.headY - 3, b.headRx + 3, b.headRy + 1)], subtract: [rect(AXIS - b.headRx + 1, b.headY - 1, 2 * b.headRx - 2, 20)] },
        { z: z + 1, tone: 3, shapes: [rect(AXIS - b.headRx - 1, b.headY - 5, 2 * b.headRx + 2, 3.5)] },
      ];
    case 'hood':
      return [
        { z: -1, tone, shapes: [ellipse(AXIS, b.headY + 2, b.headRx + 5, b.headRy + 6)] },
        { z, tone, highlight: true, shapes: [ellipse(AXIS, top + 3, b.headRx + 3, 7)] },
      ];
    case 'bandana':
      return [{ z, tone, shapes: [rect(AXIS - b.headRx - 1, top + 6, 2 * b.headRx + 2, 4), poly([AXIS + b.headRx, top + 7], [AXIS + b.headRx + 6, top + 12], [AXIS + b.headRx + 2, top + 13])] }];
    case 'beanie':
      return [{ z, tone, highlight: true, shapes: [ellipse(AXIS, top + 3, b.headRx + 1.5, 6), ellipse(AXIS, top - 3.5, 2.5, 2.5)], overlays: [{ shapes: [rect(0, top + 5.5, 48, 3)], tone: Math.max(0, tone - 1) }] }];
    default:
      return [];
  }
}

function outfitParts(config, b) {
  const tone = config.top ?? 1;
  const torso = torsoShape(b);
  const y = b.shoulderY;
  const collar = poly([AXIS - 4.5, y - 0.5], [AXIS + 4.5, y - 0.5], [AXIS, y + 6]);
  switch (config.outfit) {
    case 'coat':
      return [
        { z: 1, tone: 0, shapes: [torso], overlays: [{ shapes: [poly([AXIS - 5, y], [AXIS + 5, y], [AXIS + 3, 49], [AXIS - 3, 49])], tone }] },
        { z: 1.5, tone: 1, shade: false, shapes: [...mirror(poly([AXIS - 6, y], [AXIS - 2, y], [AXIS - 3, y + 10]))] },
      ];
    case 'jacket':
      return [{ z: 1, tone, shapes: [torso], overlays: [{ shapes: [rect(AXIS - 0.5, y + 4, 1, 20)], tone: 3 }, { shapes: [collar], tone: 0 }] }];
    case 'swim':
      return [{ z: 1, tone: 0, shapes: [torso], overlays: [{ shapes: [...mirror(rect(AXIS - 9, y, 2.5, 20)), rect(0, y + 11, 48, 10)], tone }] }];
    case 'uniform': {
      const logo = poly([AXIS, y + 5], [AXIS + 4, y + 9], [AXIS, y + 13], [AXIS - 4, y + 9]);
      return [{ z: 1, tone, shapes: [torso], overlays: [{ shapes: [logo], tone: 0 }, { shapes: [rect(0, y + 15, 48, 2)], tone: 3 }] }];
    }
    case 'robe':
      return [{ z: 1, tone, shapes: [torso], overlays: [{ shapes: [poly([AXIS - 9, y], [AXIS + 9, y], [AXIS, y + 12])], tone: Math.max(0, tone - 1) }] }];
    default:
      return [{ z: 1, tone, shapes: [torso], overlays: [{ shapes: [collar], tone: 0 }] }];
  }
}

function extraParts(config, b) {
  const parts = [];
  const extras = config.extras ?? [];
  if (extras.includes('backpack')) parts.push({ z: 1.6, tone: 2, shapes: mirror(rect(AXIS - b.shoulderHalf + 2, b.shoulderY, 3, 20)) });
  if (extras.includes('scarf')) parts.push({ z: 2.5, tone: config.scarfTone ?? 2, shapes: [capsule([[AXIS - 8, b.shoulderY], [AXIS + 8, b.shoulderY]], 3), capsule([[AXIS + 5, b.shoulderY], [AXIS + 7, b.shoulderY + 9]], 2)] });
  if (extras.includes('beard')) parts.push({ z: 4.5, tone: config.hairTone ?? 3, shapes: [ellipse(AXIS, b.headY + 7, b.headRx - 1, 6)], subtract: [rect(0, 0, 48, b.headY + 4)] });
  return parts;
}

const EYES = {
  normal: ['33', '33', '33'],
  lashes: ['3..', '33.', '33.', '33.'],
  closed: ['3..3', '.33.'],
};
const MOUTHS = {
  smile: ['3....3', '.3333.'],
  neutral: ['3333'],
  smirk: ['....3', '3333.'],
  stern: ['33333'],
};
const BROWS = { stern: ['3333.', '..333'], smirk: ['.333', '3...'] };

function faceDecals(config, b) {
  const decals = [];
  const expression = config.expression ?? 'neutral';
  const extras = config.extras ?? [];
  const eyeY = Math.round(b.headY);
  const eye = extras.includes('lashes') ? EYES.lashes : EYES.normal;
  const eyeX = AXIS - 6;
  decals.push({ x: eyeX, y: eyeY - (eye.length - 3), rows: eye });
  decals.push({ x: 2 * AXIS - eyeX - eye[0].length, y: eyeY - (eye.length - 3), rows: eye.map((row) => [...row].reverse().join('')) });

  const brow = BROWS[expression];
  if (brow) {
    decals.push({ x: eyeX - 2, y: eyeY - 4, rows: brow });
    decals.push({ x: 2 * AXIS - (eyeX - 2) - brow[0].length, y: eyeY - 4, rows: brow.map((row) => [...row].reverse().join('')) });
  }
  if (extras.includes('glasses')) {
    const lens = ['33333', '3...3', '3...3', '33333'];
    decals.push({ x: eyeX - 2, y: eyeY - 1, rows: lens });
    decals.push({ x: 2 * AXIS - (eyeX - 2) - 5, y: eyeY - 1, rows: lens });
    decals.push({ x: AXIS - 2, y: eyeY, rows: ['3333'] });
  }
  decals.push({ x: AXIS, y: eyeY + 4, rows: ['2', '2'] });
  const mouth = MOUTHS[expression];
  const mouthY = eyeY + 7;
  if (extras.includes('mustache')) decals.push({ x: AXIS - 4, y: mouthY - 1, rows: ['.333333.', '33....33'] });
  decals.push({ x: AXIS - Math.floor(mouth[0].length / 2), y: mouthY + (extras.includes('mustache') ? 1 : 0), rows: mouth });
  return decals;
}

export function buildPortrait(config) {
  const b = BUILDS[config.build ?? 'adult'];
  const parts = [
    { z: 0.5, tone: 0, shapes: [rect(AXIS - 3.5, b.headY + 6, 7, b.shoulderY - b.headY - 4)] },
    ...outfitParts(config, b),
    ...extraParts(config, b),
    { z: 2.8, tone: 0, shapes: mirror(ellipse(AXIS - b.headRx, b.headY + 1, 2.2, 3.2)) },
    { z: 3, tone: 0, shade: true, shapes: [ellipse(AXIS, b.headY, b.headRx, b.headRy)] },
    ...hairParts(config, b),
    ...hatParts(config, b),
  ];
  return spriteToRows(renderParts({ width: PORTRAIT_SIZE, height: PORTRAIT_SIZE, parts, decals: faceDecals(config, b), shadeDepth: 2 }));
}

/** Player seen from behind (bottom of the battle screen). */
export function buildBackPortrait(config) {
  const b = { ...BUILDS.large, headY: 20 };
  const hairTone = config.hairTone ?? 3;
  const parts = [
    { z: 1, tone: config.top ?? 1, shapes: [torsoShape(b)] },
    { z: 3, tone: hairTone, highlight: true, shapes: [ellipse(AXIS, b.headY, b.headRx + 1, b.headRy)] },
    ...hatParts(config, b).map((part) => ({ ...part, shapes: part.shapes.filter((shape) => shape.type !== 'poly') })),
  ];
  if (config.hair === 'long') parts.push({ z: 3.5, tone: hairTone, shapes: [ellipse(AXIS, b.headY + 8, b.headRx + 2, 10)] });
  if (config.backpack) {
    parts.push({ z: 2, tone: 2, highlight: true, shapes: [rect(AXIS - 9, b.shoulderY + 4, 18, 16)], overlays: [{ shapes: [rect(AXIS - 9, b.shoulderY + 9, 18, 2)], tone: 3 }] });
  }
  return spriteToRows(renderParts({ width: PORTRAIT_SIZE, height: PORTRAIT_SIZE, parts: parts.filter((part) => part.shapes.length > 0), shadeDepth: 2 }));
}
