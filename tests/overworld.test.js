import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { blocksSight, evaluateMove, trainerSees } from '../src/overworld/collision.js';
import { encounterKind, rollEncounter } from '../src/overworld/encounters.js';
import { buildMap, convertLegendRows } from '../src/overworld/map-loader.js';
import { computeCamera, createWorld, locateTile } from '../src/overworld/world.js';

const TILESETS = JSON.parse(fs.readFileSync(new URL('../assets/atlas/tiles.json', import.meta.url), 'utf8')).meta.tilesets;

function outdoorMap(rows, extra = {}) {
  return buildMap({ id: 'm', tileset: 'outdoor', layers: { ground: rows }, ...extra }, TILESETS);
}

test('legend conversion maps characters to metatile ids', () => {
  assert.deepEqual(convertLegendRows(['.,~'], { '.': 'grass', ',': 'tall_grass', '~': 'water' }), ['grass', 'tall_grass', 'water']);
  assert.throws(() => convertLegendRows(['.?'], { '.': 'grass' }), /Unknown legend character "\?"/);
});

test('pattern entries tile from the top-left of each run (2×2 trees)', () => {
  const map = outdoorMap(['TTTT', 'TTTT', '.TT.']);
  assert.deepEqual(map.tiles.slice(0, 4), ['tree_tl', 'tree_tr', 'tree_tl', 'tree_tr']);
  assert.deepEqual(map.tiles.slice(4, 8), ['tree_bl', 'tree_br', 'tree_bl', 'tree_br']);
  // Row 2, column 1: the run in that column starts at row 0, so it is a top tile again.
  assert.equal(map.tileAt(1, 2), 'tree_tl');
});

test('structures overwrite the ground and place the door', () => {
  const map = buildMap({
    id: 't', tileset: 'town', layers: { ground: ['______', '______', '______'] },
    structures: [{ type: 'halte', x: 1, y: 0, width: 4, door: 2 }],
  }, TILESETS);
  assert.equal(map.tileAt(1, 0), 'halte_roof_top_l');
  assert.equal(map.tileAt(3, 1), 'halte_roof_emblem');
  assert.equal(map.tileAt(3, 2), 'halte_door');
  assert.equal(map.tileAt(0, 0), 'ground');
});

test('walking, solid tiles, map edges and occupied tiles', () => {
  const map = outdoorMap(['..F', '...']);
  assert.deepEqual(evaluateMove(map, 0, 0, 'right'), { type: 'walk', x: 1, y: 0, disembark: false });
  assert.deepEqual(evaluateMove(map, 1, 0, 'right'), { type: 'blocked', reason: 'solid' });
  assert.equal(evaluateMove(map, 0, 0, 'up').type, 'edge');
  assert.deepEqual(evaluateMove(map, 0, 0, 'down', { occupied: (x, y) => x === 0 && y === 1 }), { type: 'blocked', reason: 'actor' });
});

test('collision layer overrides tile flags', () => {
  const map = outdoorMap(['.F'], { layers: { ground: ['.F'], collision: ['#_'] } });
  assert.equal(evaluateMove(map, 1, 0, 'left').type, 'blocked');
  assert.equal(evaluateMove(map, 0, 0, 'right').type, 'walk');
});

test('water needs surfing; leaving the water disembarks', () => {
  const map = outdoorMap(['.~~']);
  assert.deepEqual(evaluateMove(map, 0, 0, 'right'), { type: 'blocked', reason: 'water' });
  assert.equal(evaluateMove(map, 0, 0, 'right', { surfing: true }).type, 'walk');
  assert.deepEqual(evaluateMove(map, 1, 0, 'left', { surfing: true }), { type: 'walk', x: 0, y: 0, disembark: true });
});

test('ledges are jumped only in their direction and need a free landing', () => {
  const map = outdoorMap(['.', 'v', '.', 'F', 'v', 'F']);
  assert.deepEqual(evaluateMove(map, 0, 0, 'down'), { type: 'jump', x: 0, y: 2 });
  assert.deepEqual(evaluateMove(map, 0, 2, 'up'), { type: 'blocked', reason: 'ledge' });
  assert.deepEqual(evaluateMove(map, 0, 0, 'down', { occupied: (x, y) => y === 2 }), { type: 'blocked', reason: 'ledge' });
  const blockedLanding = outdoorMap(['.', 'v', 'F']);
  assert.deepEqual(evaluateMove(blockedLanding, 0, 0, 'down'), { type: 'blocked', reason: 'ledge' });
});

test('trainer line of sight: range, direction and obstacles', () => {
  const map = outdoorMap(['......', '..F...']);
  const isBlocked = (x, y) => blocksSight(map, x, y);
  const trainer = { x: 5, y: 0, facing: 'left', sight: 4 };
  assert.equal(trainerSees(trainer, { x: 2, y: 0 }, isBlocked), 3);
  assert.equal(trainerSees(trainer, { x: 0, y: 0 }, isBlocked), null);
  assert.equal(trainerSees({ ...trainer, facing: 'right' }, { x: 2, y: 0 }, isBlocked), null);
  const blocked = { x: 4, y: 1, facing: 'left', sight: 4 };
  assert.equal(trainerSees(blocked, { x: 1, y: 1 }, isBlocked), null);
  assert.equal(trainerSees(trainer, { x: 3, y: 0 }, (x) => x === 4), null);
});

test('connected maps resolve tiles across the edge', () => {
  const maps = {
    a: { id: 'a', tileset: 'outdoor', layers: { ground: ['..', '..'] }, connections: { south: 'b' } },
    b: { id: 'b', tileset: 'outdoor', layers: { ground: ['~~', '~~', '~~'] }, connections: { north: 'a' } },
  };
  const world = createWorld((id) => buildMap(maps[id], TILESETS), 'a');
  const below = locateTile(world, 1, 3);
  assert.equal(below.map.id, 'b');
  assert.deepEqual([below.x, below.y], [1, 1]);
  assert.equal(locateTile(world, 1, -1), null);
});

test('camera centers small maps and stops at unconnected edges', () => {
  const small = outdoorMap(['....', '....']);
  assert.deepEqual(computeCamera(small, 0, 0), { x: -48, y: -56 });
  const large = outdoorMap(Array(20).fill('.'.repeat(20)));
  assert.deepEqual(computeCamera(large, 0, 0), { x: 0, y: 0 });
  assert.deepEqual(computeCamera(large, 160, 160), { x: 96, y: 96 });
  assert.deepEqual(computeCamera(large, 19 * 16, 19 * 16), { x: 160, y: 176 });
});

function fakeRng(values) {
  let index = 0;
  const next = () => values[index++ % values.length];
  return { next, int: (min) => min, weighted: (entries) => entries[0] };
}

test('encounters: tile kinds, rate and repel', () => {
  const mapEncounters = { rate: 10, grass: [{ creature: 'pivelin', minLevel: 3, maxLevel: 3, weight: 1 }], cave: [] };
  assert.equal(encounterKind({ grass: true }, { surfing: false, mapEncounters }), 'grass');
  assert.equal(encounterKind({}, { surfing: true, mapEncounters }), null);
  assert.equal(encounterKind({}, { surfing: false, mapEncounters }), 'cave');
  assert.equal(encounterKind({ grass: true }, { surfing: false, mapEncounters: null }), null);
  assert.deepEqual(rollEncounter({ mapEncounters, kind: 'grass', rng: fakeRng([0.05]) }), { creature: 'pivelin', level: 3 });
  assert.equal(rollEncounter({ mapEncounters, kind: 'grass', rng: fakeRng([0.5]) }), null);
  assert.equal(rollEncounter({ mapEncounters, kind: 'grass', rng: fakeRng([0.05]), repelActive: true, leadLevel: 5 }), null);
  assert.ok(rollEncounter({ mapEncounters, kind: 'grass', rng: fakeRng([0.05]), repelActive: true, leadLevel: 3 }));
});
