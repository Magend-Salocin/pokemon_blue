// Pure movement rules: what happens when an actor tries to step from (x, y) in a direction.
import { COLLISION } from './map-loader.js';
import { EDGE_OF_DIRECTION, step } from './directions.js';

/**
 * Result types:
 *   { type: 'walk', x, y, disembark? }  normal step (disembark: leaves the water)
 *   { type: 'jump', x, y }              ledge jump, lands two tiles away
 *   { type: 'edge', edge }              leaves the map (the caller resolves connections)
 *   { type: 'blocked', reason }         'solid' | 'water' | 'ledge' | 'actor'
 * `occupied(x, y)` tells whether another actor or object stands on the tile.
 */
export function evaluateMove(map, x, y, direction, { surfing = false, occupied = () => false } = {}) {
  const target = step(x, y, direction);
  if (!map.inBounds(target.x, target.y)) return { type: 'edge', edge: EDGE_OF_DIRECTION[direction], ...target };
  return evaluateTile(map, target.x, target.y, direction, { surfing, occupied });
}

/** Rules for entering the tile (x, y) of `map` while moving in `direction`. */
export function evaluateTile(map, x, y, direction, { surfing = false, occupied = () => false } = {}) {
  const override = map.collisionAt(x, y);
  const tile = map.metatileAt(x, y);
  if (occupied(x, y)) return { type: 'blocked', reason: 'actor' };
  if (override === COLLISION.SOLID) return { type: 'blocked', reason: 'solid' };
  if (override === COLLISION.WALKABLE) return { type: 'walk', x, y, disembark: surfing };

  if (tile.ledge) {
    if (surfing || tile.ledge !== direction) return { type: 'blocked', reason: 'ledge' };
    const landing = step(x, y, direction);
    if (!map.inBounds(landing.x, landing.y) || !isWalkableLand(map, landing.x, landing.y) || occupied(landing.x, landing.y)) {
      return { type: 'blocked', reason: 'ledge' };
    }
    return { type: 'jump', ...landing };
  }
  if (tile.solid) return { type: 'blocked', reason: 'solid' };
  if (tile.water) return surfing ? { type: 'walk', x, y } : { type: 'blocked', reason: 'water' };
  return { type: 'walk', x, y, disembark: surfing };
}

/** Land tile an actor can stand on (no water, no solid, no ledge). */
export function isWalkableLand(map, x, y) {
  const override = map.collisionAt(x, y);
  if (override === COLLISION.SOLID) return false;
  if (override === COLLISION.WALKABLE) return true;
  const tile = map.metatileAt(x, y);
  return Boolean(tile) && !tile.solid && !tile.water && !tile.ledge;
}

/** Whether a tile stops a line of sight or a pushed boulder (solid, water or ledge). */
export function blocksSight(map, x, y) {
  if (!map.inBounds(x, y)) return true;
  const override = map.collisionAt(x, y);
  if (override === COLLISION.SOLID) return true;
  if (override === COLLISION.WALKABLE) return false;
  const tile = map.metatileAt(x, y);
  return Boolean(tile.solid || tile.ledge);
}

/**
 * Trainer line of sight: distance (in tiles) to the player if seen, otherwise null.
 * `isBlocked(x, y)` reports obstacles (solid tiles, other actors) between them.
 */
export function trainerSees(trainer, player, isBlocked) {
  for (let distance = 1; distance <= trainer.sight; distance += 1) {
    const { x, y } = step(trainer.x, trainer.y, trainer.facing, distance);
    if (x === player.x && y === player.y) return distance;
    if (isBlocked(x, y)) return null;
  }
  return null;
}
