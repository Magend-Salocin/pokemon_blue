// Overworld character composer (pure). Templates use letters that a character config maps
// to palette indices:
//   o outline, e eye, f shoe → 3      s skin, a arm → 0      k backpack → 2
//   h hair, c hat/cap/hood, t top, b bottom → chosen per character
// A patch row uses '_' to keep the template pixel.

export const DIRECTIONS = ['down', 'up', 'left'];
export const CHARACTER_SIZE = 16;

const HEAD_DOWN = [
  '.....oooooo.....',
  '...oohhhhhhoo...',
  '..ohhhhhhhhhho..',
  '..ohhhhhhhhhho..',
  '..ohhsssssshho..',
  '..ohsessssesho..',
  '..ohsessssesho..',
  '..osssssssssso..',
  '...oossssssoo...',
];

const HEAD_UP = [
  '.....oooooo.....',
  '...oohhhhhhoo...',
  '..ohhhhhhhhhho..',
  '..ohhhhhhhhhho..',
  '..ohhhhhhhhhho..',
  '..ohhhhhhhhhho..',
  '..ohhhhhhhhhho..',
  '..ohhhhhhhhhho..',
  '...oohhhhhhoo...',
];

const HEAD_LEFT = [
  '.....oooooo.....',
  '...oohhhhhhoo...',
  '..ohhhhhhhhhho..',
  '..ohhhhhhhhhho..',
  '..osssssshhhho..',
  '..osesssshhhho..',
  '..osesssshhhho..',
  '..ossssssshhho..',
  '...oossssssoo...',
];

const BODY_FRONT = [
  '...otttttttto...',
  '..oattttttttao..',
  '..oattttttttao..',
  '...obbbbbbbbo...',
];

const BODY_SIDE = [
  '....otttttto....',
  '....otttatto....',
  '....otttatto....',
  '....obbbbbbo....',
];

const LEGS = {
  front: {
    stand: ['...obbboobbbo...', '...offo..offo...', '...oooo..oooo...'],
    walk: ['...obbboobbbo...', '...obbo..offo...', '...offo..oooo...'],
  },
  side: {
    stand: ['....obbbbbbo....', '...offffffo.....', '...oooooooo.....'],
    walk: ['...obbbo.obbo...', '..offfo..offo...', '..ooooo..oooo...'],
  },
};

function template(direction, frame) {
  const head = { down: HEAD_DOWN, up: HEAD_UP, left: HEAD_LEFT }[direction];
  const side = direction === 'left' ? 'side' : 'front';
  const body = side === 'side' ? BODY_SIDE : BODY_FRONT;
  return [...head, ...body, ...LEGS[side][frame === 0 ? 'stand' : 'walk']];
}

/** Rows with '_' keep the underlying pixel; `null` rows are left untouched. */
function applyPatch(rows, patch) {
  if (!patch) return rows;
  return rows.map((row, y) => {
    const patchRow = patch[y];
    if (!patchRow) return row;
    return [...row].map((pixel, x) => (patchRow[x] === '_' ? pixel : patchRow[x])).join('');
  });
}

const _ = null;

const HAIR_STYLES = {
  short: {},
  spiky: {
    down: ['...oo.oooo.oo...', '..ohhohhhhohho..'],
    up: ['...oo.oooo.oo...', '..ohhohhhhohho..'],
    left: ['...oo.oooo.oo...', '..ohhohhhhohho..'],
  },
  long: {
    down: [_, _, _, _, _, _, _, '..oh________ho..', '..ohhossssohho..', '..oh________ho..', '..oh________ho..'],
    up: [_, _, _, _, _, _, _, _, '..ohhhhhhhhhho..', '..ohhhhhhhhhho..', '...ohhhhhhhho...'],
    left: [_, _, _, _, _, _, _, _, '...oosssshhho...', '....ottthhho....', '....otttahho....'],
  },
  ponytail: {
    up: [_, _, _, _, _, _, _, _, '...oohhhhhhoo...', '......ohho......', '......ohho......'],
    left: [_, _, _, _, '__________hhhoo.', '___________hhho.', '___________hhho.', '____________hho.', '____________oo..'],
  },
  cap: {
    down: ['.....oooooo.....', '...ooccccccoo...', '..occcccccccco..', '..oooooooooooo..'],
    up: ['.....oooooo.....', '...ooccccccoo...', '..occcccccccco..', '..occcccccccco..'],
    left: ['.....oooooo.....', '...ooccccccoo...', '..occcccccccco..', '.oooooooccccco..'],
  },
  hat: {
    down: ['....oooooooo....', '...occcccccco...', '...occcccccco...', '.oooooooooooooo.'],
    up: ['....oooooooo....', '...occcccccco...', '...occcccccco...', '.oooooooooooooo.'],
    left: ['....oooooooo....', '...occcccccco...', '...occcccccco...', '.oooooooooooooo.'],
  },
  bald: {
    down: [_, '...oossssssoo...', '..osssssssssso..', '..ohssssssssho..'],
    up: [_, '...oossssssoo...', '..osssssssssso..', '..ohssssssssho..'],
    left: [_, '...oossssssoo...', '..osssssssssso..', '..ossssssshhho..'],
  },
  helmet: {
    down: [_, _, _, _, '..ohooooooooho..'],
    left: [_, _, _, _, '..oooooooohhho..'],
  },
  hood: {
    down: [
      '.....oooooo.....',
      '...ooccccccoo...',
      '..occcccccccco..',
      '..occhhhhhhcco..',
      '..ochsssssshco..',
      '..ocsessssesco..',
      '..ocsessssesco..',
      '..ocssssssssco..',
      '...occsssscco...',
    ],
    up: [
      '.....oooooo.....',
      '...ooccccccoo...',
      '..occcccccccco..',
      '..occcccccccco..',
      '..occcccccccco..',
      '..occcccccccco..',
      '..occcccccccco..',
      '..occcccccccco..',
      '...ooccccccoo...',
    ],
    left: [
      '.....oooooo.....',
      '...ooccccccoo...',
      '..occcccccccco..',
      '..ohhhhcccccco..',
      '..osssssscccco..',
      '..osesssscccco..',
      '..osesssscccco..',
      '..osssssssccco..',
      '...oossssccoo...',
    ],
  },
  bandana: {
    down: [_, _, _, '..occcccccccco..'],
    up: [_, _, _, '..occcccccccco..', '......occo......'],
    left: [_, _, _, '..occcccccccco..'],
  },
};

const EXTRAS = {
  beard: {
    down: [_, _, _, _, _, _, _, '..oshhhhhhhhso..', '...oohhhhhhoo...'],
    left: [_, _, _, _, _, _, _, '..ossshhhhhhho..', '...oohhhhhhoo...'],
  },
  backpack: {
    up: [_, _, _, _, _, _, _, _, _, '...okkkkkkkko...', '..oakkkkkkkkao..', '..oakkkkkkkkao..', '...okkkkkkkko...'],
    left: [_, _, _, _, _, _, _, _, _, _, '....otttattkko..', '....otttattkko..'],
  },
  glasses: {
    down: [_, _, _, _, _, '..ohsesoosesho..'],
    left: [_, _, _, _, _, '..oseossshhhho..'],
  },
};

const BUOY = [
  '..oooooooooooo..',
  '.o000000000000o.',
  'o00330000003300o',
  '.o000000000000o.',
  '..oooooooooooo..',
  '..0.0......0.0..',
];

function applyBody(rows, body) {
  const legsFrom = 13;
  const replaceIn = (from, to, start, end = rows.length) =>
    rows.map((row, y) => (y >= start && y < end ? row.replaceAll(from, to) : row));
  switch (body) {
    case 'dress': {
      const skirt = rows.map((row, y) => {
        if (y !== 12) return row;
        return row.includes('obbbbbbbbo') ? '..otttttttttto..' : '...otttttttto...';
      });
      return skirt.map((row, y) => (y >= legsFrom ? row.replaceAll('b', 's') : row));
    }
    case 'coat':
      return replaceIn('b', 't', 12, 13);
    case 'shorts':
      return replaceIn('b', 's', legsFrom);
    case 'swimsuit':
      return replaceIn('b', 's', legsFrom).map((row, y) => (y >= 9 && y < 12 ? row.replaceAll('t', 's') : row));
    default:
      return rows;
  }
}

function toIndices(rows, colors) {
  const map = { 0: '0', 1: '1', 2: '2', 3: '3', o: '3', e: '3', f: '3', s: '0', a: '0', k: '2', ...colors };
  return rows.map((row) => [...row].map((pixel) => (pixel === '.' ? '.' : map[pixel])).join(''));
}

/**
 * config = { hair, hairTone, top, bottom, capTone, body, extras: [], buoy }
 * Returns { down: [stand, walk], up: [...], left: [...] } as text rows.
 * The right direction is the left one mirrored at draw time.
 */
export function composeCharacter(config) {
  const colors = {
    h: String(config.hairTone ?? 3),
    c: String(config.capTone ?? 2),
    t: String(config.top ?? 1),
    b: String(config.bottom ?? 2),
  };
  const hair = HAIR_STYLES[config.hair ?? 'short'];
  if (!hair) throw new Error(`Unknown hair style: ${config.hair}`);

  const result = {};
  for (const direction of DIRECTIONS) {
    result[direction] = [0, 1].map((frame) => {
      let rows = template(direction, frame);
      rows = applyPatch(rows, hair[direction]);
      rows = applyBody(rows, config.body);
      for (const extra of config.extras ?? []) rows = applyPatch(rows, EXTRAS[extra][direction]);
      if (config.buoy) rows = [...rows.slice(0, 10), ...BUOY];
      return toIndices(rows, colors);
    });
  }
  return result;
}

export const HAIR_STYLE_NAMES = Object.keys(HAIR_STYLES);
export const EXTRA_NAMES = Object.keys(EXTRAS);
