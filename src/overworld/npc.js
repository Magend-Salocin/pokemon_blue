// Autonomous NPC movement: 'static', 'look' (turns at random), 'wander' (steps within a
// radius of its home tile), 'path' (loops through a list of directions).
import { DIRECTIONS, step } from './directions.js';
import { isMoving, startMove } from './actor.js';

const LOOK_DELAY = [1.5, 3.5];
const WANDER_DELAY = [1, 2.5];
const PATH_DELAY = 0.4;

function nextDelay(rng, [min, max]) {
  return min + rng.next() * (max - min);
}

export function createNpcBrain(definition) {
  return {
    movement: definition.movement ?? 'static',
    home: { x: definition.x, y: definition.y },
    radius: definition.radius ?? 2,
    path: definition.path ?? [],
    pathIndex: 0,
    timer: 1,
  };
}

/**
 * Updates one NPC. `canStep(actor, direction)` checks collisions on the map.
 * Called only while the overworld is free (no script, no dialog).
 */
export function updateNpc(actor, brain, dt, rng, canStep) {
  if (brain.movement === 'static' || isMoving(actor)) return;
  brain.timer -= dt;
  if (brain.timer > 0) return;

  if (brain.movement === 'look') {
    actor.facing = rng.pick(DIRECTIONS);
    brain.timer = nextDelay(rng, LOOK_DELAY);
    return;
  }

  if (brain.movement === 'wander') {
    const direction = rng.pick(DIRECTIONS);
    const target = step(actor.x, actor.y, direction);
    const inRadius = Math.abs(target.x - brain.home.x) <= brain.radius && Math.abs(target.y - brain.home.y) <= brain.radius;
    if (inRadius && canStep(actor, direction)) startMove(actor, direction);
    else actor.facing = direction;
    brain.timer = nextDelay(rng, WANDER_DELAY);
    return;
  }

  if (brain.movement === 'path' && brain.path.length > 0) {
    const direction = brain.path[brain.pathIndex];
    if (canStep(actor, direction)) {
      startMove(actor, direction);
      brain.pathIndex = (brain.pathIndex + 1) % brain.path.length;
    } else {
      actor.facing = direction;
    }
    brain.timer = PATH_DELAY;
  }
}
