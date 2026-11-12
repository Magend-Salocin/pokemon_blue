// Current map plus its connected neighbors (pure). Coordinates outside the current map
// resolve into the neighbor on that side, so connected maps scroll continuously.
import { METATILE, SCREEN_HEIGHT, SCREEN_WIDTH } from '../engine/constants.js';

/** Player sprite position on screen when the camera follows freely. */
export const PLAYER_SCREEN = { x: 64, y: 64 };

/**
 * `loadMap(id)` returns a runtime map (see map-loader). Neighbors are loaded on demand
 * and cached until the current map changes.
 */
export function createWorld(loadMap, startMapId) {
  const world = {
    map: loadMap(startMapId),
    neighbors: {},
    neighbor(edge) {
      const id = world.map.connections?.[edge];
      if (!id) return null;
      world.neighbors[edge] ??= loadMap(id);
      return world.neighbors[edge];
    },
    setMap(id, keepNeighbor = null) {
      const previous = world.map;
      world.map = keepNeighbor ?? loadMap(id);
      world.neighbors = {};
      // Re-use the map we just left as the neighbor on the opposite side.
      for (const [edge, neighborId] of Object.entries(world.map.connections ?? {})) {
        if (neighborId === previous.id) world.neighbors[edge] = previous;
      }
    },
  };
  return world;
}

/** Edge of the current map that contains (x, y) when it is outside, or null. */
export function edgeOf(map, x, y) {
  if (y < 0 && x >= 0 && x < map.width) return 'north';
  if (y >= map.height && x >= 0 && x < map.width) return 'south';
  if (x < 0 && y >= 0 && y < map.height) return 'west';
  if (x >= map.width && y >= 0 && y < map.height) return 'east';
  return null;
}

/** Converts current-map coordinates beyond `edge` into neighbor coordinates. */
export function toNeighborCoordinates(map, neighbor, edge, x, y) {
  if (edge === 'north') return { x, y: y + neighbor.height };
  if (edge === 'south') return { x, y: y - map.height };
  if (edge === 'west') return { x: x + neighbor.width, y };
  return { x: x - map.width, y };
}

/** { map, x, y } holding the tile at current-map coordinates, or null (border or void). */
export function locateTile(world, x, y) {
  const { map } = world;
  if (map.inBounds(x, y)) return { map, x, y };
  const edge = edgeOf(map, x, y);
  const neighbor = edge ? world.neighbor(edge) : null;
  if (!neighbor) return null;
  const local = toNeighborCoordinates(map, neighbor, edge, x, y);
  return neighbor.inBounds(local.x, local.y) ? { map: neighbor, ...local } : null;
}

/**
 * Camera top-left in pixels. Follows the player, stops at unconnected edges, and centers
 * maps smaller than the screen.
 */
export function computeCamera(map, playerPx, playerPy) {
  const connected = (edge) => Boolean(map.connections?.[edge]);
  const axis = (playerPos, screenOffset, mapSize, screenSize, startEdge, endEdge) => {
    let camera = playerPos - screenOffset;
    const max = mapSize * METATILE - screenSize;
    if (max < 0 && !connected(startEdge) && !connected(endEdge)) return Math.floor(max / 2);
    if (!connected(startEdge)) camera = Math.max(camera, 0);
    if (!connected(endEdge)) camera = Math.min(camera, Math.max(max, connected(startEdge) ? max : 0));
    return camera;
  };
  return {
    x: axis(playerPx, PLAYER_SCREEN.x, map.width, SCREEN_WIDTH, 'west', 'east'),
    y: axis(playerPy, PLAYER_SCREEN.y, map.height, SCREEN_HEIGHT, 'north', 'south'),
  };
}
