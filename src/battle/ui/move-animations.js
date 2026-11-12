// Short original move animations, one per type, drawn from tiny pixel patterns.
// Each animation: { duration (s), draw(ctx, t from 0 to 1, from {x, y}, to {x, y}) },
// where from/to are the centers of the attacker and the target sprites.
import { createCanvas, paintRows } from '../../gfx/bitmap.js';
import { getColor, getPaletteKey } from '../../gfx/palette.js';

const PATTERNS = {
  flame: ['...3....', '..323...', '..3213..', '.32113..', '.321123.', '3211113.', '32111123', '.322223.'],
  drop: ['...3....', '...3....', '..313...', '..313...', '.31113..', '.31013..', '.31113..', '..333...'],
  leaf: ['......33', '....3213', '...32123', '..321233', '.321233.', '.32233..', '3333....', '3.......'],
  crystal: ['...3....', '..303...', '.30103..', '3011103.', '.30103..', '..303...', '...3....', '........'],
  fist: ['.3333...', '311113..', '3111133.', '31111113', '31111113', '.3111113', '..31113.', '...333..'],
  bubble: ['..333...', '.31103..', '3110013.', '310001.3', '3100013.', '.311113.', '..3333..', '........'],
  rock: ['..3333..', '.322223.', '32212223', '32222123', '32122223', '.322223.', '..3333..', '........'],
  star: ['...3....', '...3....', '.33133..', '3311133.', '.33133..', '...3....', '...3....', '........'],
  dart: ['........', '3.......', '.33.....', '.3233333', '.33.....', '3.......', '........', '........'],
  shard: ['....3...', '...303..', '..3013..', '.30113..', '30113...', '3113....', '.33.....', '........'],
  arrowUp: ['...33...', '..3113..', '.311113.', '33311333', '..3113..', '..3113..', '..3113..', '..3333..'],
  arrowDown: ['..3333..', '..3113..', '..3113..', '..3113..', '33311333', '.311113.', '..3113..', '...33...'],
};

const cache = new Map();

function patternCanvas(name) {
  const key = `${name}|${getPaletteKey()}`;
  if (!cache.has(key)) {
    const rows = PATTERNS[name];
    const canvas = createCanvas(rows[0].length, rows.length);
    const context = canvas.getContext('2d');
    const image = context.createImageData(canvas.width, canvas.height);
    paintRows(image, rows, 0, 0, getColor);
    context.putImageData(image, 0, 0);
    if (cache.size > 64) cache.clear();
    cache.set(key, canvas);
  }
  return cache.get(key);
}

function stamp(ctx, name, x, y) {
  ctx.drawImage(patternCanvas(name), Math.round(x - 4), Math.round(y - 4));
}

/** Blocky filled circle (4 px cells), color index 0-3. */
function blockCircle(ctx, cx, cy, radius, color) {
  ctx.fillStyle = getColor(color);
  for (let dy = -radius; dy <= radius; dy += 4) {
    for (let dx = -radius; dx <= radius; dx += 4) {
      if (dx * dx + dy * dy <= radius * radius) ctx.fillRect(Math.round(cx + dx - 2), Math.round(cy + dy - 2), 4, 4);
    }
  }
}

const lerp = (a, b, t) => a + (b - a) * t;
const along = (from, to, t) => ({ x: lerp(from.x, to.x, t), y: lerp(from.y, to.y, t) });
const staggered = (t, index, count, span = 0.5) => Math.max(0, Math.min(1, (t - (index / count) * span) / (1 - span)));

function impact(ctx, x, y, size) {
  ctx.fillStyle = getColor(3);
  for (let i = 0; i < 8; i += 1) {
    const angle = (i / 8) * Math.PI * 2;
    ctx.fillRect(Math.round(x + Math.cos(angle) * size) - 1, Math.round(y + Math.sin(angle) * size) - 1, 3, 3);
  }
}

export const TYPE_ANIMATIONS = {
  normal: {
    duration: 0.4,
    draw: (ctx, t, from, to) => impact(ctx, to.x, to.y, 4 + t * 12),
  },
  feu: {
    duration: 0.7,
    draw(ctx, t, from, to) {
      for (let i = 0; i < 3; i += 1) stamp(ctx, 'flame', to.x - 12 + i * 12, to.y + 10 - t * 20 + (i % 2) * 6);
    },
  },
  eau: {
    duration: 0.7,
    draw(ctx, t, from, to) {
      for (let i = 0; i < 4; i += 1) stamp(ctx, 'drop', to.x - 15 + i * 10, to.y - 28 + ((t * 2 + i * 0.25) % 1) * 36);
    },
  },
  flore: {
    duration: 0.7,
    draw(ctx, t, from, to) {
      for (let i = 0; i < 3; i += 1) {
        const point = along(from, to, staggered(t, i, 3));
        stamp(ctx, 'leaf', point.x, point.y + Math.sin(t * 12 + i) * 6);
      }
    },
  },
  foudre: {
    duration: 0.5,
    draw(ctx, t, from, to) {
      if (Math.floor(t * 12) % 2 === 1) return;
      ctx.fillStyle = getColor(3);
      let x = to.x;
      for (let y = to.y - 40; y < to.y + 8; y += 6) {
        const next = x + (Math.floor(y / 6) % 2 === 0 ? 5 : -5);
        ctx.fillRect(Math.min(x, next), y, Math.abs(next - x) + 2, 2);
        ctx.fillRect(next, y, 2, 6);
        x = next;
      }
    },
  },
  givre: {
    duration: 0.7,
    draw(ctx, t, from, to) {
      const spots = [[-14, -10], [12, -12], [-8, 12], [14, 8], [0, 0]];
      spots.forEach(([dx, dy], i) => {
        if (t > i / spots.length) stamp(ctx, 'crystal', to.x + dx, to.y + dy);
      });
    },
  },
  combat: {
    duration: 0.5,
    draw(ctx, t, from, to) {
      const shake = t < 0.6 ? Math.sin(t * 40) * 3 : 0;
      stamp(ctx, 'fist', to.x + shake, to.y);
      if (t > 0.6) impact(ctx, to.x, to.y, 10 + (t - 0.6) * 20);
    },
  },
  toxique: {
    duration: 0.8,
    draw(ctx, t, from, to) {
      for (let i = 0; i < 4; i += 1) stamp(ctx, 'bubble', to.x - 15 + i * 10, to.y + 14 - ((t * 1.5 + i * 0.3) % 1) * 30);
    },
  },
  terre: {
    duration: 0.7,
    draw(ctx, t, from, to) {
      ctx.fillStyle = getColor(2);
      for (let i = 0; i < 3; i += 1) {
        const width = Math.round((t * 40 + i * 12) % 48);
        ctx.fillRect(to.x - width / 2, to.y + 18 - i * 3, width, 2);
      }
    },
  },
  vent: {
    duration: 0.6,
    draw(ctx, t, from, to) {
      ctx.fillStyle = getColor(2);
      const direction = to.x > from.x ? 1 : -1;
      for (let i = 0; i < 4; i += 1) {
        const x = to.x - direction * 30 + direction * ((t * 60 + i * 15) % 60);
        ctx.fillRect(Math.round(x) - 6, to.y - 12 + i * 8, 12, 2);
      }
    },
  },
  arcane: {
    duration: 0.8,
    draw(ctx, t, from, to) {
      for (let i = 0; i < 4; i += 1) {
        const angle = t * Math.PI * 2 + (i * Math.PI) / 2;
        const radius = 18 - t * 8;
        stamp(ctx, 'star', to.x + Math.cos(angle) * radius, to.y + Math.sin(angle) * radius);
      }
    },
  },
  insecte: {
    duration: 0.6,
    draw(ctx, t, from, to) {
      for (let i = 0; i < 3; i += 1) {
        const point = along(from, to, staggered(t, i, 3, 0.4));
        stamp(ctx, 'dart', point.x, point.y - 6 + i * 6);
      }
    },
  },
  roche: {
    duration: 0.7,
    draw(ctx, t, from, to) {
      for (let i = 0; i < 3; i += 1) {
        const local = staggered(t, i, 3);
        stamp(ctx, 'rock', to.x - 12 + i * 12, to.y - 36 + local * 40);
      }
    },
  },
  ombre: {
    duration: 0.7,
    draw: (ctx, t, from, to) => blockCircle(ctx, to.x, to.y, Math.round(Math.sin(t * Math.PI) * 22), 3),
  },
  metal: {
    duration: 0.6,
    draw(ctx, t, from, to) {
      for (let i = 0; i < 6; i += 1) {
        const angle = (i / 6) * Math.PI * 2;
        stamp(ctx, 'shard', to.x + Math.cos(angle) * t * 24, to.y + Math.sin(angle) * t * 24);
      }
    },
  },
};

export const STAT_ANIMATIONS = {
  up: {
    duration: 0.6,
    draw(ctx, t, from, to) {
      for (let i = 0; i < 3; i += 1) stamp(ctx, 'arrowUp', to.x - 12 + i * 12, to.y + 16 - ((t + i * 0.3) % 1) * 32);
    },
  },
  down: {
    duration: 0.6,
    draw(ctx, t, from, to) {
      for (let i = 0; i < 3; i += 1) stamp(ctx, 'arrowDown', to.x - 12 + i * 12, to.y - 16 + ((t + i * 0.3) % 1) * 32);
    },
  },
};

/** Capture sparkle after a successful capture. */
export const CAPTURE_STARS = {
  duration: 0.6,
  draw(ctx, t, from, to) {
    for (let i = 0; i < 3; i += 1) stamp(ctx, 'star', to.x - 10 + i * 10, to.y - 8 - t * 12 + (i % 2) * 4);
  },
};
