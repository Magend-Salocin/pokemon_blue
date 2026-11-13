// Map registry. Game maps are grouped by zone (one folder per zone, see docs/WORLD_MAP.md).
// TEST_MAPS are only loaded in dev mode and never shipped in the game flow.
import debut from './debut/index.js';
import bois from './bois/index.js';
import port from './port/index.js';
import cendrelune from './cendrelune/index.js';
import testBourg from './test/test-bourg.js';
import testGrotte from './test/test-grotte.js';
import testHalte from './test/test-halte.js';
import testMaison from './test/test-maison.js';
import testRoute from './test/test-route.js';

const byId = (maps) => Object.fromEntries(maps.map((map) => [map.id, map]));

export const MAPS = byId([...debut, ...bois, ...port, ...cendrelune]);

export const TEST_MAPS = byId([testBourg, testRoute, testMaison, testGrotte, testHalte]);

export const TEST_START = { map: 'test_bourg', x: 6, y: 7, facing: 'down' };

/** New game: the player's bedroom. Respawn before any Halte: in front of Maman. */
export const GAME_START = { map: 'maison_joueur_2f', x: 3, y: 4, facing: 'down' };
export const HOME_RESPAWN = { map: 'maison_joueur_1f', x: 5, y: 4, facing: 'down' };

export const ALL_MAPS = { ...MAPS, ...TEST_MAPS };

export function getMapDefinition(id) {
  const definition = ALL_MAPS[id];
  if (!definition) throw new Error(`Unknown map: ${id}`);
  return definition;
}
