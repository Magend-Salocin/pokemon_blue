// Actors (player, NPCs, trainers) move tile by tile. A step is 16 px; speed is in px per
// update (60 updates per second): 1 = walk (16 frames per tile), 2 = run or jump.
import { METATILE } from '../engine/constants.js';
import { DELTAS, step } from './directions.js';

export const WALK_SPEED = 1;
export const RUN_SPEED = 2;
export const JUMP_HEIGHT = 8;

/** `movement` of a map definition ('look', 'wander'…) belongs to the NPC brain, not the actor. */
export function createActor({ id, sprite, x, y, facing = 'down', visible = true, movement, ...extra }) {
  return { ...extra, id, sprite, x, y, facing, visible, movement: null, stepCount: 0 };
}

/**
 * Starts a move of `distance` tiles. `jump` draws an arc (ledges, grappling).
 * The actor keeps its tile coordinates until the move completes; `targetOf` gives the reserved tile.
 */
export function startMove(actor, direction, { speed = WALK_SPEED, distance = 1, jump = false } = {}) {
  actor.facing = direction;
  actor.movement = { direction, progress: 0, total: distance * METATILE, speed, jump };
}

export const isMoving = (actor) => actor.movement !== null;

export function targetOf(actor) {
  if (!actor.movement) return { x: actor.x, y: actor.y };
  return step(actor.x, actor.y, actor.movement.direction, actor.movement.total / METATILE);
}

/** Advances the move by one update. Returns true on the update the move completes. */
export function advanceMove(actor) {
  const { movement } = actor;
  if (!movement) return false;
  movement.progress = Math.min(movement.total, movement.progress + movement.speed);
  if (movement.progress < movement.total) return false;
  const target = targetOf(actor);
  actor.x = target.x;
  actor.y = target.y;
  actor.movement = null;
  actor.stepCount += 1;
  return true;
}

/** Pixel position (top-left of the tile) in map space, plus the jump lift. */
export function pixelPosition(actor) {
  const base = { px: actor.x * METATILE, py: actor.y * METATILE, lift: 0 };
  const { movement } = actor;
  if (!movement) return base;
  const { dx, dy } = DELTAS[movement.direction];
  const lift = movement.jump ? Math.round(Math.sin((movement.progress / movement.total) * Math.PI) * JUMP_HEIGHT) : 0;
  return { px: base.px + dx * movement.progress, py: base.py + dy * movement.progress, lift };
}

/** Walking animation frame (0 standing, 1 step) and mirroring for up/down steps. */
export function animationFrame(actor) {
  const { movement } = actor;
  if (!movement || movement.jump || movement.slide) return { frame: 0, flip: actor.facing === 'right' };
  const stepping = movement.progress % METATILE < METATILE / 2;
  const frame = stepping ? 1 : 0;
  if (actor.facing === 'left' || actor.facing === 'right') return { frame, flip: actor.facing === 'right' };
  // Up and down use one step frame, mirrored every other step to alternate the legs.
  return { frame, flip: frame === 1 && actor.stepCount % 2 === 1 };
}
