// Procedural creature sprites (pure, deterministic, no DOM).
// generateCreatureSprite(spec, view) → { width: 48, height: 48, pixels: Int8Array }
// spec = { plan, seed, size, features: [], pattern }
//   size: 1 (small, first stage) to 3 (large, final stage). An evolution keeps the seed,
//   raises size and adds features, so a lineage keeps the same proportions and face.

import { createRng } from '../engine/rng.js';
import { capsule, ellipse, pair, poly, rect, renderParts } from './shape-renderer.js';
import { TRANSPARENT } from './sprite-utils.js';

export const CREATURE_SIZE = 48;

export const BODY_PLANS = [
  'biped', 'quadruped', 'bird', 'serpent', 'fish', 'insect', 'blob', 'plant', 'golem', 'ghost', 'dragon',
];
export const FEATURES = [
  'horns', 'long_ears', 'crest', 'wings', 'tail_flame', 'tail_leaf', 'tail_fin', 'tail_spikes',
  'shell', 'antennae', 'fangs', 'crystals', 'cloud', 'shadow',
];
export const PATTERNS = ['plain', 'stripes', 'spots', 'light_belly'];
export const VIEWS = ['front', 'back'];

const ASYMMETRIC_PLANS = new Set(['serpent', 'fish']);
const AXIS = CREATURE_SIZE / 2;
const GROUND = 46;

const darker = (tone) => Math.min(3, tone + 1);
const lighter = (tone) => Math.max(0, tone - 1);

function hashString(text) {
  let hash = 0x811c9dc5;
  for (const character of text) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash;
}

/** Maps nominal coordinates (designed for a full-size creature) to the scaled sprite. */
function createFrame(scale) {
  const X = (x) => AXIS + (x - AXIS) * scale;
  const Y = (y) => GROUND - (GROUND - y) * scale;
  const R = (r) => r * scale;
  const mapPoints = (points) => points.map(([x, y]) => [X(x), Y(y)]);
  return {
    X,
    Y,
    R,
    e: (cx, cy, rx, ry, angle = 0) => ellipse(X(cx), Y(cy), R(rx), R(ry), angle),
    p: (...points) => poly(...mapPoints(points)),
    c: (points, r, r1 = r) => capsule(mapPoints(points), R(r), R(r1)),
    r: (x, y, w, h) => rect(X(x), Y(y), R(w), R(h)),
    anchor: (cx, cy, rx, ry) => ({ cx: X(cx), cy: Y(cy), rx: R(rx), ry: R(ry) }),
  };
}

const mirror = (shape) => pair(shape, AXIS);

// Each plan returns parts plus anchors (pixel space) used by features and the face.
const PLAN_BUILDERS = {
  biped(f, traits, tone) {
    const { headScale: hs, bodyWidth: bw, limbLength: ll } = traits;
    return {
      parts: [
        { role: 'limb', z: 1, tone, shapes: mirror(f.c([[19, 33], [18.5, 39 + 2 * ll]], 3.6)) },
        { role: 'limb', z: 2, tone, shapes: mirror(f.e(17.5, 43.3, 4.6, 2.6)) },
        { role: 'body', z: 3, tone, highlight: true, shapes: [f.e(24, 30, 10.5 * bw, 9.5)] },
        { role: 'limb', z: 4, tone, shapes: mirror(f.c([[14.5, 25], [11, 31.5]], 2.8, 2.4)) },
        { role: 'head', z: 5, tone, highlight: true, shapes: [f.e(24, 16, 12 * hs, 10.5 * hs)] },
      ],
      head: f.anchor(24, 16, 12 * hs, 10.5 * hs),
      body: f.anchor(24, 30, 10.5 * bw, 9.5),
    };
  },

  quadruped(f, traits, tone) {
    const { headScale: hs, bodyWidth: bw } = traits;
    return {
      parts: [
        { role: 'limb', z: 0, tone, shapes: mirror(f.c([[11, 33], [10, 42.5]], 3.4)) },
        { role: 'body', z: 1, tone, highlight: true, shapes: [f.e(24, 29, 17 * bw, 10)] },
        { role: 'limb', z: 2, tone, shapes: mirror(f.c([[18.5, 33], [18, 42]], 3.6)) },
        { role: 'limb', z: 3, tone, shapes: mirror(f.e(17.8, 43.3, 4.2, 2.5)) },
        { role: 'limb', z: 3.5, tone, shapes: mirror(f.p([16, 17], [12.5, 8], [20, 13])) },
        { role: 'head', z: 4, tone, highlight: true, shapes: [f.e(24, 22, 11 * hs, 9 * hs)] },
        { role: 'face', z: 5, tone: lighter(tone), frontOnly: true, shapes: [f.e(24, 27.5, 5.5, 3.6)] },
      ],
      head: f.anchor(24, 20.5, 11 * hs, 9 * hs),
      body: f.anchor(24, 29, 17 * bw, 10),
    };
  },

  bird(f, traits, tone) {
    const { headScale: hs, bodyWidth: bw } = traits;
    return {
      parts: [
        { role: 'wing', z: 0, backZ: 2.5, tone, shapes: mirror(f.p([18, 23], [4, 12], [2, 20], [6, 28], [16, 33])) },
        { role: 'limb', z: 1, tone: 2, shapes: [...mirror(f.c([[21, 38], [20.5, 44]], 1.3)), ...mirror(f.p([17.5, 45], [23.5, 45], [20.5, 42.5]))] },
        { role: 'body', z: 2, tone, highlight: true, shapes: [f.e(24, 31, 10.5 * bw, 11)] },
        { role: 'head', z: 3, tone, highlight: true, shapes: [f.e(24, 16, 9 * hs, 8.5 * hs)] },
        { role: 'face', z: 4, tone: lighter(tone), frontOnly: true, shapes: [f.p([21.5, 18.5 * hs + 1], [26.5, 18.5 * hs + 1], [24, 24])] },
      ],
      head: f.anchor(24, 15, 9 * hs, 8.5 * hs),
      body: f.anchor(24, 31, 10.5 * bw, 11),
      noMouth: true,
    };
  },

  serpent(f, traits, tone) {
    const { headScale: hs } = traits;
    return {
      parts: [
        { role: 'limb', z: 0, tone, shapes: [f.c([[33, 41], [40, 38], [44, 31]], 3, 1.2)] },
        { role: 'body', z: 1, tone, highlight: true, shapes: [f.e(24, 40, 16, 6)] },
        { role: 'body', z: 2, tone, shapes: [f.c([[16, 38], [13.5, 30], [17, 23], [24, 20]], 5, 4.5)] },
        { role: 'head', z: 3, tone, highlight: true, shapes: [f.e(28, 15, 10 * hs, 7.5 * hs)] },
      ],
      head: f.anchor(28, 15, 10 * hs, 7.5 * hs),
      body: f.anchor(24, 40, 16, 6),
      tailTip: [f.X(44), f.Y(31)],
      eyes: 'side',
    };
  },

  fish(f, traits, tone) {
    const { bodyWidth: bw } = traits;
    return {
      parts: [
        { role: 'fin', z: 0, tone: lighter(tone), shapes: [f.p([36, 26], [46, 14], [42, 26], [46, 38])] },
        { role: 'fin', z: 0, tone: lighter(tone), shapes: [f.p([17, 17], [27, 7], [33, 17])] },
        { role: 'body', z: 1, tone, highlight: true, shapes: [f.e(23, 27, 16 * bw, 11)] },
        { role: 'fin', z: 2, tone: lighter(tone), shapes: [f.e(27, 31.5, 4, 2, 0.5)] },
      ],
      head: f.anchor(14, 24, 8, 8),
      body: f.anchor(23, 27, 16 * bw, 11),
      tailTip: [f.X(44), f.Y(26)],
      eyes: 'single',
    };
  },

  insect(f, traits, tone) {
    const { headScale: hs } = traits;
    const leg = (points) => mirror(f.c(points, 1.3));
    return {
      parts: [
        {
          role: 'limb',
          z: 0,
          tone: 2,
          shapes: [
            ...leg([[17, 29], [9, 26], [5, 32]]),
            ...leg([[17, 33], [9, 36], [6, 43]]),
            ...leg([[19, 37], [14, 42], [13, 45]]),
          ],
        },
        { role: 'body', z: 1, tone, highlight: true, shapes: [f.e(24, 35, 10, 9)] },
        { role: 'body', z: 2, tone, shapes: [f.e(24, 26.5, 7.5, 6)] },
        { role: 'head', z: 3, tone, highlight: true, shapes: [f.e(24, 16, 10 * hs, 8 * hs)] },
      ],
      head: f.anchor(24, 16, 10 * hs, 8 * hs),
      body: f.anchor(24, 35, 10, 9),
      defaultFeatures: ['antennae'],
      bigEyes: true,
    };
  },

  blob(f, traits, tone) {
    const { bodyWidth: bw } = traits;
    return {
      parts: [
        { role: 'limb', z: 0, tone, shapes: mirror(f.e(8.5, 36, 3.5, 4.5, 0.3)) },
        { role: 'body', z: 1, tone, highlight: true, shapes: [f.e(24, 33, 17 * bw, 12.5)] },
      ],
      head: f.anchor(24, 30, 13 * bw, 9),
      body: f.anchor(24, 34, 15 * bw, 10),
    };
  },

  plant(f, traits, tone) {
    const { headScale: hs } = traits;
    return {
      parts: [
        { role: 'leaf', z: 0, tone: darker(tone), shapes: [f.c([[24, 22], [24, 14]], 1.4)] },
        { role: 'leaf', z: 0.5, tone, shapes: [...mirror(f.e(16, 15, 8.5, 3.4, -0.5)), f.e(24, 10, 3.2, 6.5)] },
        { role: 'limb', z: 1, tone: darker(tone), shapes: mirror(f.e(17.5, 44, 4.5, 2.3)) },
        { role: 'body', z: 2, tone, highlight: true, shapes: [f.e(24, 32, 13 * hs, 12)] },
      ],
      head: f.anchor(24, 30, 11 * hs, 9),
      body: f.anchor(24, 34, 12 * hs, 9),
    };
  },

  golem(f, traits, tone) {
    const { headScale: hs, bodyWidth: bw } = traits;
    return {
      parts: [
        { role: 'limb', z: 0, tone, shapes: mirror(f.r(13.5, 36, 7.5, 9)) },
        { role: 'body', z: 1, tone, highlight: true, shapes: [f.p([24 - 13 * bw, 21], [24 + 13 * bw, 21], [24 + 10 * bw, 38], [24 - 10 * bw, 38])] },
        { role: 'limb', z: 2, tone, shapes: mirror(f.c([[10.5 - 2 * bw, 23], [7.5 - 2 * bw, 33]], 4.2, 4.8)) },
        { role: 'limb', z: 3, tone, shapes: mirror(f.e(7.5 - 2 * bw, 35.5, 4.6, 4)) },
        { role: 'head', z: 4, tone, highlight: true, shapes: [f.p([24 - 6 * hs, 8], [24 + 6 * hs, 8], [24 + 7 * hs, 20], [24 - 7 * hs, 20])] },
      ],
      head: f.anchor(24, 14, 6.5 * hs, 6),
      body: f.anchor(24, 29.5, 12 * bw, 8.5),
    };
  },

  ghost(f, traits, tone) {
    const { headScale: hs } = traits;
    const skirt = f.p([10, 22], [38, 22], [38, 40], [33, 44], [29, 39], [24, 44], [19, 39], [15, 44], [10, 40]);
    return {
      parts: [
        { role: 'body', z: 1, tone, highlight: true, shapes: [f.e(24, 21, 14 * hs, 14), skirt] },
        { role: 'limb', z: 2, tone, shapes: mirror(f.e(9.5, 27, 4, 3, 0.5)) },
      ],
      head: f.anchor(24, 20, 11 * hs, 10),
      body: f.anchor(24, 30, 12, 9),
    };
  },

  dragon(f, traits, tone) {
    const { headScale: hs, bodyWidth: bw } = traits;
    return {
      parts: [
        {
          role: 'wing',
          z: 0,
          backZ: 3.5,
          tone: lighter(tone),
          shapes: mirror(f.p([18, 24], [6, 8], [2, 14], [3, 22], [6, 20], [7, 28], [10, 26], [13, 33])),
        },
        { role: 'limb', z: 1, tone, shapes: mirror(f.c([[19, 36], [18, 42]], 3.8)) },
        { role: 'limb', z: 2, tone, shapes: mirror(f.e(17.5, 44, 4.8, 2.4)) },
        { role: 'body', z: 3, tone, highlight: true, shapes: [f.e(24, 32, 11 * bw, 10)] },
        { role: 'body', z: 4, tone, shapes: [f.c([[24, 26], [24, 19]], 5)] },
        { role: 'head', z: 5, tone, highlight: true, shapes: [f.e(24, 14, 9.5 * hs, 7.5 * hs)] },
        { role: 'face', z: 6, tone: lighter(tone), frontOnly: true, shapes: [f.e(24, 18.5, 6, 3.6)] },
      ],
      head: f.anchor(24, 13, 9.5 * hs, 7.5 * hs),
      body: f.anchor(24, 32, 11 * bw, 10),
      defaultFeatures: ['horns'],
      hasWings: true,
    };
  },
};

function headZ(build) {
  return build.parts.find((part) => part.role === 'head')?.z ?? 1;
}

function bodyZ(build) {
  return build.parts.find((part) => part.role === 'body')?.z ?? 1;
}

/** Symmetric polygon from its left half (listed from bottom center to top center). */
function symmetricPolygon(leftHalf) {
  const right = leftHalf.slice(1, -1).reverse().map(([x, y]) => [2 * AXIS - x, y]);
  return poly(...leftHalf, ...right);
}

function flameShape(cx, bottom, top, width) {
  const h = bottom - top;
  const points = [
    [cx, bottom],
    [cx - 0.55 * width, bottom - 0.1 * h],
    [cx - 0.95 * width, bottom - 0.45 * h],
    [cx - 0.7 * width, bottom - 0.58 * h],
    [cx - 1.0 * width, top + 0.1 * h],
    [cx - 0.45 * width, bottom - 0.72 * h],
    [cx - 0.42 * width, top],
    [cx - 0.15 * width, bottom - 0.78 * h],
    [cx, top + 0.05 * h],
  ];
  if (cx === AXIS) return symmetricPolygon(points);
  return poly(...points, ...points.slice(1, -1).reverse().map(([x, y]) => [2 * cx - x, y]));
}

const FEATURE_BUILDERS = {
  horns(build, f, tone) {
    const { cx, cy, rx, ry } = build.head;
    const left = poly([cx - 0.62 * rx, cy - 0.45 * ry], [cx - 0.78 * rx, cy - ry - f.R(8)], [cx - 0.18 * rx, cy - 0.85 * ry]);
    const shapes = build.eyes === 'side' ? [left, poly(...left.points.map(([x, y]) => [2 * cx - x, y]))] : mirror(left);
    return [{ role: 'horn', z: headZ(build) - 0.5, tone: lighter(tone), shapes }];
  },

  long_ears(build, f, tone) {
    const { cx, cy, rx, ry } = build.head;
    const ear = ellipse(cx - 0.55 * rx, cy - ry - f.R(3), f.R(3.2), f.R(8.5), -0.35);
    const inner = ellipse(cx - 0.55 * rx, cy - ry - f.R(2), f.R(1.4), f.R(6), -0.35);
    return [{
      role: 'ear',
      z: headZ(build) - 0.5,
      tone,
      shapes: mirror(ear),
      overlays: [{ shapes: mirror(inner), tone: lighter(tone) }],
    }];
  },

  crest(build, f, tone) {
    const { cx, cy, rx, ry } = build.head;
    const top = cy - ry;
    const crest = symmetricPolygon([
      [cx, top + f.R(3)],
      [cx - 0.5 * rx, top + f.R(3)],
      [cx - 0.42 * rx, top - f.R(4)],
      [cx - 0.22 * rx, top - f.R(1)],
      [cx - 0.15 * rx, top - f.R(8)],
      [cx, top - f.R(3)],
    ].map(([x, y]) => [x - cx + AXIS, y]));
    const shape = build.eyes === 'side' ? poly(...crest.points.map(([x, y]) => [x - AXIS + cx, y])) : crest;
    return [{ role: 'crest', z: headZ(build) - 0.5, tone: darker(tone), shapes: [shape] }];
  },

  wings(build, f, tone) {
    if (build.hasWings || build.parts.some((part) => part.role === 'wing')) return [];
    const { cx, cy, rx, ry } = build.body;
    const wing = poly(
      [cx - 0.4 * rx, cy - 0.5 * ry],
      [cx - rx - f.R(12), cy - ry - f.R(8)],
      [cx - rx - f.R(13), cy - ry + f.R(1)],
      [cx - rx - f.R(9), cy],
      [cx - rx - f.R(6), cy + f.R(4)],
      [cx - 0.5 * rx, cy + 0.2 * ry],
    );
    return [{ role: 'wing', z: bodyZ(build) - 0.5, backZ: bodyZ(build) + 0.5, tone: lighter(tone), shapes: mirror(wing) }];
  },

  tail_flame(build, f) {
    if (build.tailTip) {
      const [tx, ty] = build.tailTip;
      return [{ role: 'tail', z: 0.5, tone: 0, shapes: [flameShape(tx, ty + f.R(4), ty - f.R(12), f.R(5))] }];
    }
    const top = build.head.cy - build.head.ry - f.R(9);
    const flame = flameShape(AXIS, build.body.cy, top, build.head.rx * 1.2);
    const inner = flameShape(AXIS, build.body.cy, top + f.R(6), build.head.rx * 0.7);
    return [{ role: 'tail', z: 0.2, tone: 1, shapes: [flame], overlays: [{ shapes: [inner], tone: 0 }] }];
  },

  tail_leaf(build, f, tone) {
    if (build.tailTip) {
      const [tx, ty] = build.tailTip;
      return [{ role: 'tail', z: 0.5, tone, shapes: [ellipse(tx, ty - f.R(6), f.R(3.5), f.R(8), 0.3)] }];
    }
    const { cx, cy, rx, ry } = build.body;
    const leaf = ellipse(cx - rx * 0.9, cy - ry * 0.9, f.R(4.5), f.R(11), -0.7);
    const vein = capsule([[cx - rx * 0.55, cy - ry * 0.45], [cx - rx * 1.25, cy - ry * 1.4]], 0.5);
    return [{ role: 'tail', z: 0.2, tone, shapes: mirror(leaf), overlays: [{ shapes: mirror(vein), tone: darker(tone) }] }];
  },

  tail_fin(build, f, tone) {
    if (build.tailTip) {
      const [tx, ty] = build.tailTip;
      return [{ role: 'tail', z: 0.5, tone: lighter(tone), shapes: [poly([tx - f.R(2), ty], [tx + f.R(3), ty - f.R(9)], [tx + f.R(4), ty + f.R(3)])] }];
    }
    const { cx, cy, rx, ry } = build.body;
    const fin = poly(
      [cx - 0.4 * rx, cy + 0.3 * ry],
      [cx - rx - f.R(9), cy - f.R(1)],
      [cx - rx - f.R(6), cy + f.R(3)],
      [cx - rx - f.R(9), cy + ry + f.R(1)],
      [cx - 0.3 * rx, cy + 0.85 * ry],
    );
    return [{ role: 'tail', z: 0.2, tone: lighter(tone), shapes: mirror(fin) }];
  },

  tail_spikes(build, f, tone) {
    const { cx, cy, rx, ry } = build.body;
    const spikes = [0, 1, 2].map((k) => {
      const bx = cx - rx * (0.45 + 0.22 * k);
      const by = cy - ry * (0.75 - 0.3 * k);
      return poly([bx - f.R(2.5), by + f.R(1)], [bx - f.R(4) - f.R(2) * k, by - f.R(7)], [bx + f.R(2.5), by]);
    });
    const shapes = build.tailTip ? spikes : spikes.flatMap((spike) => mirror(spike));
    return [{ role: 'tail', z: bodyZ(build) - 0.5, tone: darker(tone), shapes }];
  },

  shell(build, f, tone) {
    const { cx, cy, rx, ry } = build.body;
    const shell = ellipse(cx, cy - f.R(1), rx + f.R(4), ry + f.R(3));
    const ring = ellipse(cx, cy - f.R(1), rx * 0.75, ry * 0.7);
    const core = ellipse(cx, cy - f.R(1), rx * 0.6, ry * 0.55);
    return [{
      role: 'shell',
      z: bodyZ(build) - 0.6,
      backZ: bodyZ(build) + 0.6,
      tone: darker(tone),
      shapes: [shell],
      overlays: [{ shapes: [ring], tone: 3 }, { shapes: [core], tone: darker(tone) }],
    }];
  },

  antennae(build, f) {
    const { cx, cy, rx, ry } = build.head;
    const stalk = capsule([[cx - 0.25 * rx, cy - 0.8 * ry], [cx - 0.5 * rx, cy - ry - f.R(6)], [cx - 0.75 * rx, cy - ry - f.R(9)]], Math.max(0.7, f.R(1.1)));
    const tip = ellipse(cx - 0.75 * rx, cy - ry - f.R(9.5), Math.max(1.2, f.R(2.2)), Math.max(1.2, f.R(2.2)));
    return [{ role: 'antenna', z: headZ(build) - 0.5, tone: 2, shapes: build.eyes === 'side' ? [stalk, tip] : [...mirror(stalk), ...mirror(tip)] }];
  },

  crystals(build, f) {
    const { cx, cy, rx, ry } = build.body;
    const crystal = (x, y, size) => poly([x, y - f.R(7) * size], [x + f.R(2.6) * size, y - f.R(1)], [x, y + f.R(2)], [x - f.R(2.6) * size, y - f.R(1)]);
    const shoulder = crystal(cx - rx * 0.7, cy - ry * 0.75, 1);
    const top = crystal(build.head.cx, build.head.cy - build.head.ry - f.R(1), 0.8);
    const shapes = build.tailTip ? [shoulder, top] : [...mirror(shoulder), top];
    return [{ role: 'crystal', z: headZ(build) - 0.4, tone: 0, shade: true, shapes }];
  },

  cloud(build, f) {
    const y = f.Y(42.5);
    const shapes = [
      ellipse(AXIS, y, f.R(14), f.R(3)),
      ...mirror(ellipse(AXIS - f.R(9), y - f.R(1.5), f.R(6.5), f.R(3.5))),
      ellipse(AXIS, y - f.R(2), f.R(7), f.R(3.5)),
    ];
    return [{ role: 'cloud', z: 20, tone: 0, shapes }];
  },

  fangs: () => [],
  shadow: () => [],
};

function patternOverlays(pattern, build, f, tone, rng, view) {
  const { cx, cy, rx, ry } = build.body;
  switch (pattern) {
    case 'stripes': {
      const period = Math.max(3, f.R(5));
      const thickness = Math.max(1, f.R(2));
      const shapes = [];
      for (let y = cy - ry - period; y < cy + ry + period; y += period) shapes.push(rect(0, y, CREATURE_SIZE, thickness));
      return [{ shapes, tone: darker(tone) }];
    }
    case 'spots': {
      const count = 2 + rng.int(0, 2);
      const shapes = [];
      for (let i = 0; i < count; i += 1) {
        const spot = ellipse(cx - rng.next() * rx * 0.7, cy + (rng.next() - 0.5) * ry * 1.2, Math.max(1, f.R(1.6 + rng.next() * 1.4)), Math.max(1, f.R(1.4 + rng.next())));
        shapes.push(...(build.tailTip ? [spot] : mirror(spot)));
      }
      return [{ shapes, tone: darker(tone) }];
    }
    case 'light_belly':
      return view === 'front' ? [{ shapes: [ellipse(cx, cy + ry * 0.2, rx * 0.6, ry * 0.65)], tone: lighter(tone) }] : [];
    default:
      return [];
  }
}

const EYE_STAMPS = {
  tiny: ['3', '3'],
  small: ['03', '33'],
  round: ['.33', '303', '333'],
  big: ['.33.', '3033', '3333', '.33.'],
  angry: ['3..', '.33', '333'],
  sleepy: ['333'],
};
const MOUTH_STAMPS = {
  none: null,
  line: ['33'],
  smile: ['3..3', '.33.'],
  open: ['3333', '.33.'],
};
const FANG_STAMP = ['0..0'];

function stampWidth(rows) {
  return rows[0].length;
}

function faceDecals(build, traits, features) {
  const { cx, cy, rx, ry } = build.head;
  const decals = [];
  const eyeRows = EYE_STAMPS[traits.eyeStyle];
  const width = stampWidth(eyeRows);
  const eyeY = Math.round(cy - eyeRows.length / 2 + ry * 0.05);

  if (build.eyes === 'single') {
    decals.push({ x: Math.round(cx - width / 2), y: eyeY, rows: eyeRows });
    return decals;
  }
  if (build.eyes === 'side') {
    const gap = Math.max(2, Math.round(rx * 0.35));
    decals.push({ x: Math.round(cx - gap - width), y: eyeY, rows: eyeRows });
    decals.push({ x: Math.round(cx + gap - 1), y: eyeY, rows: eyeRows });
    return decals;
  }

  const offset = Math.max(1, Math.round(rx * traits.eyeSpacing));
  const leftX = Math.round(AXIS - offset - width);
  decals.push({ x: leftX, y: eyeY, rows: eyeRows });
  decals.push({ x: CREATURE_SIZE - leftX - width, y: eyeY, rows: eyeRows });

  const mouth = build.noMouth ? null : MOUTH_STAMPS[traits.mouth];
  const mouthY = Math.round(eyeY + eyeRows.length + Math.max(1, ry * 0.25));
  if (mouth) decals.push({ x: AXIS - stampWidth(mouth) / 2, y: mouthY, rows: mouth });
  if (features.includes('fangs')) {
    decals.push({ x: AXIS - 2, y: mouth ? mouthY + mouth.length - 1 : mouthY, rows: FANG_STAMP });
  }
  return decals;
}

function drawTraits(seed) {
  const rng = createRng(seed);
  const pick = (values) => values[Math.floor(rng.next() * values.length)];
  return {
    headScale: 0.9 + rng.next() * 0.25,
    bodyWidth: 0.85 + rng.next() * 0.3,
    limbLength: 0.9 + rng.next() * 0.2,
    eyeStyle: pick(['small', 'round', 'round', 'angry', 'sleepy', 'big']),
    eyeSpacing: 0.25 + rng.next() * 0.2,
    mouth: pick(['none', 'line', 'smile', 'open']),
    darkBody: rng.next() < 0.2,
    patternSeed: Math.floor(rng.next() * 2 ** 31),
  };
}

function eyeStyleForScale(style, scale) {
  if (scale < 0.7 && (style === 'big' || style === 'round' || style === 'angry')) return 'small';
  if (scale < 0.85 && style === 'big') return 'round';
  return style;
}

export function validateCreatureSpec(spec) {
  const errors = [];
  if (!BODY_PLANS.includes(spec.plan)) errors.push(`unknown plan "${spec.plan}"`);
  if (!Number.isInteger(spec.seed)) errors.push('seed must be an integer');
  if (!(spec.size >= 1 && spec.size <= 3)) errors.push('size must be between 1 and 3');
  for (const feature of spec.features ?? []) {
    if (!FEATURES.includes(feature)) errors.push(`unknown feature "${feature}"`);
  }
  if (spec.pattern && !PATTERNS.includes(spec.pattern)) errors.push(`unknown pattern "${spec.pattern}"`);
  return errors;
}

function touchesBorder(sprite) {
  const { width, height, pixels } = sprite;
  for (let i = 0; i < width; i += 1) {
    if (pixels[i] !== TRANSPARENT || pixels[(height - 1) * width + i] !== TRANSPARENT) return true;
  }
  for (let j = 0; j < height; j += 1) {
    if (pixels[j * width] !== TRANSPARENT || pixels[j * width + width - 1] !== TRANSPARENT) return true;
  }
  return false;
}

function renderAtScale(spec, view, traits, scale) {
  const f = createFrame(scale);
  const features = [...new Set([...(spec.features ?? [])])];
  const tone = features.includes('shadow') || traits.darkBody ? 2 : 1;
  const build = PLAN_BUILDERS[spec.plan](f, traits, tone);
  const allFeatures = [...new Set([...(build.defaultFeatures ?? []), ...features])];

  const parts = [...build.parts];
  for (const feature of allFeatures) {
    parts.push(...FEATURE_BUILDERS[feature](build, f, tone));
  }

  const patternRng = createRng(traits.patternSeed);
  const overlays = patternOverlays(spec.pattern ?? 'plain', build, f, tone, patternRng, view);
  const isBack = view === 'back';

  const finalParts = parts
    .filter((part) => !(isBack && part.frontOnly))
    .map((part) => {
      const z = isBack && part.backZ !== undefined ? part.backZ : part.z;
      const withPattern = part.role === 'body' ? [...(part.overlays ?? []), ...overlays] : part.overlays;
      return { ...part, z, overlays: withPattern, highlight: !isBack && part.highlight };
    });

  const decals = isBack ? [] : faceDecals(build, { ...traits, eyeStyle: eyeStyleForScale(traits.eyeStyle, scale) }, allFeatures);
  return renderParts({ width: CREATURE_SIZE, height: CREATURE_SIZE, parts: finalParts, decals, shadeDepth: isBack ? 3 : 2 });
}

/** Deterministic: the same spec and view always give the same pixels. */
export function generateCreatureSprite(spec, view = 'front') {
  const errors = validateCreatureSpec(spec);
  if (errors.length > 0) throw new Error(`Invalid creature spec: ${errors.join(', ')}`);
  if (!VIEWS.includes(view)) throw new Error(`Unknown view: ${view}`);

  const traits = drawTraits(spec.seed ^ hashString(spec.plan));
  let scale = Math.min(1, 0.44 + 0.18 * spec.size);
  let sprite = renderAtScale(spec, view, traits, scale);
  // Features can push the silhouette out of the frame: shrink until it fits.
  while (touchesBorder(sprite) && scale > 0.4) {
    scale *= 0.93;
    sprite = renderAtScale(spec, view, traits, scale);
  }
  return sprite;
}

export { ASYMMETRIC_PLANS };
