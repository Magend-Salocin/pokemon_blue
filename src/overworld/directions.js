export const DIRECTIONS = ['up', 'down', 'left', 'right'];

export const DELTAS = {
  up: { dx: 0, dy: -1 },
  down: { dx: 0, dy: 1 },
  left: { dx: -1, dy: 0 },
  right: { dx: 1, dy: 0 },
};

export const OPPOSITE = { up: 'down', down: 'up', left: 'right', right: 'left' };

/** Map edge crossed when moving in a direction. */
export const EDGE_OF_DIRECTION = { up: 'north', down: 'south', left: 'west', right: 'east' };

export function step(x, y, direction, distance = 1) {
  const { dx, dy } = DELTAS[direction];
  return { x: x + dx * distance, y: y + dy * distance };
}

/** Direction from (x1, y1) toward an adjacent or aligned (x2, y2), or null. */
export function directionTo(x1, y1, x2, y2) {
  if (x1 === x2 && y2 !== y1) return y2 < y1 ? 'up' : 'down';
  if (y1 === y2 && x2 !== x1) return x2 < x1 ? 'left' : 'right';
  return null;
}
