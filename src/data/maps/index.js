// Map registry. Game maps are added to MAPS by the content prompts (09 to 11).
// TEST_MAPS are only loaded in dev mode and never shipped in the game flow.
import testBourg from './test/test-bourg.js';
import testGrotte from './test/test-grotte.js';
import testHalte from './test/test-halte.js';
import testMaison from './test/test-maison.js';
import testRoute from './test/test-route.js';

export const MAPS = {};

export const TEST_MAPS = Object.fromEntries([testBourg, testRoute, testMaison, testGrotte, testHalte].map((map) => [map.id, map]));

export const TEST_START = { map: 'test_bourg', x: 6, y: 7, facing: 'down' };

export const ALL_MAPS = { ...MAPS, ...TEST_MAPS };

export function getMapDefinition(id) {
  const definition = ALL_MAPS[id];
  if (!definition) throw new Error(`Unknown map: ${id}`);
  return definition;
}
