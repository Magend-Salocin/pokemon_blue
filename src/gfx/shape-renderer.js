// Pure renderer that turns layered vector shapes into a 4-tint sprite (no DOM).
// Used by the creature generator, trainer portraits and the hand-drawn creature authoring.
//
// Part: {
//   shapes: Shape[], subtract?: Shape[], tone: 0-3, z: number,
//   overlays?: [{ shapes, tone }]   recolor, clipped to the part (stripes, spots, belly)
//   outline?: boolean (default true) contour against parts behind it
//   shade?: boolean (default true)   darker rim on the bottom-right (light comes from top-left)
//   highlight?: boolean              light spot on the top-left
// }
// Shape: { type: 'ellipse', cx, cy, rx, ry, angle? } | { type: 'poly', points: [[x, y]...] }
//      | { type: 'capsule', points: [[x, y]...], r, r1? } | { type: 'rect', x, y, w, h }
// Decal: { x, y, rows } stamped last ('.' keeps the pixel).
// Coordinates are continuous; pixel (x, y) is tested at its center (x + 0.5, y + 0.5).

import { TRANSPARENT, createSprite } from './sprite-utils.js';

const OUTLINE = 3;

function insideEllipse(shape, px, py) {
  const angle = shape.angle ?? 0;
  const dx = px - shape.cx;
  const dy = py - shape.cy;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const u = (dx * cos + dy * sin) / shape.rx;
  const v = (-dx * sin + dy * cos) / shape.ry;
  return u * u + v * v <= 1;
}

function insidePolygon(points, px, py) {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i, i += 1) {
    const [xi, yi] = points[i];
    const [xj, yj] = points[j];
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function insideCapsule(shape, px, py) {
  const { points } = shape;
  const r0 = shape.r;
  const r1 = shape.r1 ?? shape.r;
  const segments = points.length - 1;
  for (let i = 0; i < segments; i += 1) {
    const [ax, ay] = points[i];
    const [bx, by] = points[i + 1];
    const abx = bx - ax;
    const aby = by - ay;
    const lengthSquared = abx * abx + aby * aby || 1;
    const t = Math.max(0, Math.min(1, ((px - ax) * abx + (py - ay) * aby) / lengthSquared));
    const radius = r0 + (r1 - r0) * ((i + t) / segments);
    const dx = px - (ax + abx * t);
    const dy = py - (ay + aby * t);
    if (dx * dx + dy * dy <= radius * radius) return true;
  }
  return false;
}

export function insideShape(shape, px, py) {
  switch (shape.type) {
    case 'ellipse':
      return insideEllipse(shape, px, py);
    case 'poly':
      return insidePolygon(shape.points, px, py);
    case 'capsule':
      return insideCapsule(shape, px, py);
    case 'rect':
      return px >= shape.x && px < shape.x + shape.w && py >= shape.y && py < shape.y + shape.h;
    default:
      throw new Error(`Unknown shape type: ${shape.type}`);
  }
}

function rasterize(shapes, subtract, width, height) {
  const mask = new Uint8Array(width * height);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const px = x + 0.5;
      const py = y + 0.5;
      if (shapes.some((shape) => insideShape(shape, px, py)) && !subtract.some((shape) => insideShape(shape, px, py))) {
        mask[y * width + x] = 1;
      }
    }
  }
  return mask;
}

function boundingBox(mask, width) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  mask.forEach((value, index) => {
    if (!value) return;
    const x = index % width;
    const y = Math.floor(index / width);
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  });
  return { minX, minY, maxX, maxY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

const darker = (tone) => Math.min(3, tone + 1);
const lighter = (tone) => Math.max(0, tone - 1);

export function renderParts({ width, height, parts, decals = [], shadeDepth = 2 }) {
  const ordered = parts
    .map((part, index) => ({ ...part, order: index }))
    .sort((a, b) => (a.z ?? 0) - (b.z ?? 0) || a.order - b.order);

  const owner = new Int16Array(width * height).fill(-1);
  const tones = new Int8Array(width * height).fill(TRANSPARENT);
  const masks = ordered.map((part) => rasterize(part.shapes, part.subtract ?? [], width, height));

  masks.forEach((mask, partIndex) => {
    mask.forEach((value, index) => {
      if (!value) return;
      owner[index] = partIndex;
      tones[index] = ordered[partIndex].tone;
    });
  });

  const ownedBy = (x, y, partIndex) =>
    x >= 0 && y >= 0 && x < width && y < height && owner[y * width + x] === partIndex;

  // Overlays (patterns) are clipped to the pixels the part still owns.
  ordered.forEach((part, partIndex) => {
    for (const overlay of part.overlays ?? []) {
      const mask = rasterize(overlay.shapes, [], width, height);
      mask.forEach((value, index) => {
        if (value && owner[index] === partIndex) tones[index] = overlay.tone;
      });
    }
  });

  // Shading: bottom-right rim of each part.
  const shaded = new Uint8Array(width * height);
  owner.forEach((partIndex, index) => {
    if (partIndex < 0 || ordered[partIndex].shade === false) return;
    const x = index % width;
    const y = Math.floor(index / width);
    const nearRightOrBottom = !ownedBy(x + 1, y, partIndex) || !ownedBy(x, y + 1, partIndex);
    const nearDiagonal = !ownedBy(x + shadeDepth, y + shadeDepth, partIndex);
    if (nearRightOrBottom || nearDiagonal) shaded[index] = 1;
  });
  shaded.forEach((value, index) => {
    if (value) tones[index] = darker(tones[index]);
  });

  // Highlight: small light spot on the top-left of large parts.
  ordered.forEach((part, partIndex) => {
    if (!part.highlight) return;
    const box = boundingBox(masks[partIndex], width);
    if (box.width < 8 || box.height < 8) return;
    const spot = {
      type: 'ellipse',
      cx: box.minX + box.width * 0.3,
      cy: box.minY + box.height * 0.28,
      rx: Math.max(1.2, box.width * 0.1),
      ry: Math.max(1, box.height * 0.08),
    };
    owner.forEach((ownerIndex, index) => {
      if (ownerIndex !== partIndex || shaded[index]) return;
      if (insideShape(spot, (index % width) + 0.5, Math.floor(index / width) + 0.5)) {
        tones[index] = lighter(tones[index]);
      }
    });
  });

  const sprite = createSprite(width, height);
  sprite.pixels.set(tones);

  // Internal contours: a part behind gets a line where a front part touches it.
  const neighbors = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  owner.forEach((partIndex, index) => {
    if (partIndex < 0) return;
    const x = index % width;
    const y = Math.floor(index / width);
    for (const [dx, dy] of neighbors) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      const other = owner[ny * width + nx];
      if (other > partIndex && ordered[other].outline !== false) {
        sprite.pixels[index] = OUTLINE;
        break;
      }
    }
  });

  // Outer outline.
  owner.forEach((partIndex, index) => {
    if (partIndex >= 0) return;
    const x = index % width;
    const y = Math.floor(index / width);
    for (const [dx, dy] of neighbors) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && ny >= 0 && nx < width && ny < height && owner[ny * width + nx] >= 0) {
        sprite.pixels[index] = OUTLINE;
        break;
      }
    }
  });

  for (const decal of decals) stampRows(sprite, decal.rows, Math.round(decal.x), Math.round(decal.y));
  return sprite;
}

export function stampRows(sprite, rows, x, y) {
  rows.forEach((row, dy) => {
    for (let dx = 0; dx < row.length; dx += 1) {
      if (row[dx] === '.') continue;
      const tx = x + dx;
      const ty = y + dy;
      if (tx < 0 || ty < 0 || tx >= sprite.width || ty >= sprite.height) continue;
      sprite.pixels[ty * sprite.width + tx] = Number(row[dx]);
    }
  });
}

// Shape helpers.
export const ellipse = (cx, cy, rx, ry, angle = 0) => ({ type: 'ellipse', cx, cy, rx, ry, angle });
export const poly = (...points) => ({ type: 'poly', points });
export const capsule = (points, r, r1 = r) => ({ type: 'capsule', points, r, r1 });
export const rect = (x, y, w, h) => ({ type: 'rect', x, y, w, h });

/** Mirrors a shape around the vertical axis x = axis (24 for a 48-wide sprite). */
export function mirrorShape(shape, axis) {
  const mx = (x) => 2 * axis - x;
  switch (shape.type) {
    case 'ellipse':
      return { ...shape, cx: mx(shape.cx), angle: -(shape.angle ?? 0) };
    case 'poly':
      return { ...shape, points: shape.points.map(([x, y]) => [mx(x), y]) };
    case 'capsule':
      return { ...shape, points: shape.points.map(([x, y]) => [mx(x), y]) };
    case 'rect':
      return { ...shape, x: mx(shape.x + shape.w) };
    default:
      throw new Error(`Unknown shape type: ${shape.type}`);
  }
}

/** The shape and its mirror. */
export function pair(shape, axis) {
  return [shape, mirrorShape(shape, axis)];
}
