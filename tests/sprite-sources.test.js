import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildCharacterFrames } from '../src/gfx/sources/characters/index.js';
import { HAND_DRAWN_CREATURES } from '../src/gfx/sources/creatures/index.js';
import { TILESETS, buildMetatileIndex } from '../src/gfx/sources/tiles/index.js';
import { FLAG_NAMES } from '../src/gfx/sources/tiles/tile-helpers.js';
import { buildTrainerFrames } from '../src/gfx/sources/trainers/index.js';
import { buildUiFrames } from '../src/gfx/sources/ui/index.js';
import { parseSprite, validateSprite } from '../src/gfx/sprite-utils.js';

const ID_PATTERN = /^[a-z0-9_]+(\/[a-z0-9_]+)*$/;

function assertValidFrames(frames, size) {
  for (const [id, rows] of Object.entries(frames)) {
    assert.match(id, ID_PATTERN, `invalid id "${id}"`);
    assert.deepEqual(validateSprite(rows, size), [], `source "${id}"`);
  }
}

test('every metatile frame is a valid 16×16 source', () => {
  for (const tileset of TILESETS) {
    for (const definition of tileset.metatiles) {
      assert.match(definition.id, ID_PATTERN);
      assert.ok(definition.frames.length >= 1, `${tileset.id}/${definition.id} has no frame`);
      definition.frames.forEach((rows, index) => {
        assert.deepEqual(validateSprite(rows, { width: 16, height: 16 }), [], `${tileset.id}/${definition.id} frame ${index}`);
        assert.ok(!rows.join('').includes('.'), `${tileset.id}/${definition.id} must be opaque`);
      });
    }
  }
});

test('metatile flags are known and ids are unique per tileset', () => {
  const known = new Set(['id', 'frames', ...FLAG_NAMES]);
  for (const tileset of TILESETS) {
    const ids = tileset.metatiles.map((definition) => definition.id);
    assert.equal(new Set(ids).size, ids.length, `duplicate metatile id in ${tileset.id}`);
    for (const definition of tileset.metatiles) {
      for (const key of Object.keys(definition)) assert.ok(known.has(key), `${tileset.id}/${definition.id}: unknown flag ${key}`);
    }
  }
});

test('the town tileset inherits outdoor metatiles', () => {
  const index = buildMetatileIndex();
  assert.equal(index.get('town').get('grass').tileset, 'outdoor');
  assert.equal(index.get('town').get('halte_door').door, true);
});

test('the tilesets required by the game design exist with their key metatiles', () => {
  const index = buildMetatileIndex();
  const required = {
    outdoor: ['grass', 'tall_grass', 'path', 'sand', 'flowers', 'tree_tl', 'shrub', 'boulder', 'ledge_down', 'grapple_ledge', 'water', 'bank_ne', 'bridge_h', 'fence', 'sign', 'mailbox'],
    town: ['house_a_door', 'house_b_roof_m', 'house_c_window', 'halte_roof_emblem', 'comptoir_roof_emblem', 'arena_door', 'lab_door', 'lighthouse_top', 'turbine_top', 'factory_chimney'],
    indoor: ['floor_wood', 'rug', 'wall', 'table_tl', 'chair', 'bed_top', 'shelf_top', 'plant', 'counter_m', 'storage_terminal', 'heal_machine', 'stairs_up', 'stairs_down'],
    cave: ['floor', 'wall', 'ladder_up', 'water', 'stalagmite', 'ice'],
    special: ['memory_floor', 'teleporter', 'league_floor', 'lava'],
  };
  for (const [tileset, ids] of Object.entries(required)) {
    for (const id of ids) assert.ok(index.get(tileset).has(id), `${tileset}/${id} missing`);
  }
  assert.equal(index.get('outdoor').get('tall_grass').grass, true);
  assert.equal(index.get('outdoor').get('shrub').cuttable, true);
  assert.equal(index.get('outdoor').get('ledge_down').ledge, 'down');
  assert.equal(index.get('indoor').get('counter_m').counter, true);
});

test('characters have 3 directions × 2 frames of 16×16', () => {
  const frames = buildCharacterFrames();
  assertValidFrames(frames, { width: 16, height: 16 });
  const characters = new Set(Object.keys(frames).filter((id) => id.includes('/')).map((id) => id.split('/')[0]));
  assert.ok(characters.size >= 38, `only ${characters.size} characters`);
  for (const id of characters) {
    for (const direction of ['down', 'up', 'left']) {
      for (const frame of [0, 1]) assert.ok(frames[`${id}/${direction}/${frame}`], `${id}/${direction}/${frame} missing`);
    }
  }
  for (const id of ['joueur', 'joueuse', 'rival', 'professeure', 'maman', 'sbire_opale', 'corvin', 'joueur_bouee']) {
    assert.ok(characters.has(id), `${id} missing`);
  }
  assert.ok(frames.capsule && frames.rocher, 'overworld objects missing');
});

test('trainer portraits and player backs are 48×48', () => {
  const frames = buildTrainerFrames();
  assertValidFrames(frames, { width: 48, height: 48 });
  assert.ok(frames['back/joueur'] && frames['back/joueuse']);
  for (const id of ['rival', 'professeure', 'corvin', 'garance', 'oswin', 'gardien_4', 'sbire_opale']) {
    assert.ok(frames[`portrait/${id}`], `portrait/${id} missing`);
  }
});

test('hand-drawn creatures have valid 48×48 front and back views', () => {
  assert.equal(Object.keys(HAND_DRAWN_CREATURES).length, 14);
  for (const [id, views] of Object.entries(HAND_DRAWN_CREATURES)) {
    assertValidFrames({ [`${id}/front`]: views.front, [`${id}/back`]: views.back }, { width: 48, height: 48 });
    assert.notDeepEqual(views.front, views.back, `${id}: back view identical to front`);
  }
});

test('UI sources are valid and complete', () => {
  const frames = buildUiFrames();
  assertValidFrames(frames);
  const count = (prefix) => Object.keys(frames).filter((id) => id.startsWith(prefix)).length;
  assert.equal(count('type/'), 15);
  assert.equal(count('status/'), 5);
  assert.equal(count('badge/'), 8);
  assert.equal(count('capsule/'), 3);
  assert.equal(count('icon/'), 22);
  for (const id of ['hp/frame', 'hp/high', 'hp/mid', 'hp/low', 'xp/frame', 'xp/fill', 'logo/bestiora', 'title/azurel']) {
    assert.ok(frames[id], `${id} missing`);
  }
  assert.ok(parseSprite(frames['logo/bestiora']).width > 100);
});
