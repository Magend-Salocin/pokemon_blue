import { test } from 'node:test';
import assert from 'node:assert/strict';
import { packFrames } from '../tools/atlas-packer.js';
import { grayToIndex } from '../src/gfx/atlas.js';
import { flipHorizontal, parseSprite, spriteToRows, validateSprite } from '../src/gfx/sprite-utils.js';

test('packed frames stay inside the atlas and never overlap', () => {
  const sizes = {};
  for (let i = 0; i < 60; i += 1) sizes[`frame_${i}`] = { width: [8, 16, 48][i % 3], height: [8, 16, 48][(i + 1) % 3] };
  const { width, height, placements } = packFrames(sizes);
  const rects = Object.values(placements);
  for (const rect of rects) {
    assert.ok(rect.x >= 0 && rect.y >= 0 && rect.x + rect.w <= width && rect.y + rect.h <= height);
  }
  for (let i = 0; i < rects.length; i += 1) {
    for (let j = i + 1; j < rects.length; j += 1) {
      const a = rects[i];
      const b = rects[j];
      const overlap = a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
      assert.ok(!overlap, 'frames overlap');
    }
  }
});

test('packing is deterministic', () => {
  const sizes = { b: { width: 16, height: 16 }, a: { width: 16, height: 16 }, c: { width: 48, height: 48 } };
  assert.deepEqual(packFrames(sizes), packFrames({ ...sizes }));
});

test('reference grays map back to palette indices, hand-edited shades to the nearest', () => {
  assert.equal(grayToIndex(255, 255, 255, 255), 0);
  assert.equal(grayToIndex(170, 170, 170, 255), 1);
  assert.equal(grayToIndex(85, 85, 85, 255), 2);
  assert.equal(grayToIndex(0, 0, 0, 255), 3);
  assert.equal(grayToIndex(160, 180, 175, 255), 1);
  assert.equal(grayToIndex(255, 255, 255, 0), -1);
});

test('parse, flip and serialize sprites', () => {
  const rows = ['.12', '3..'];
  assert.deepEqual(spriteToRows(parseSprite(rows)), rows);
  assert.deepEqual(spriteToRows(flipHorizontal(parseSprite(rows))), ['21.', '..3']);
});

test('validateSprite reports size and character errors', () => {
  assert.deepEqual(validateSprite(['01', '23']), []);
  assert.match(validateSprite(['01', '2'])[0], /row 1/);
  assert.match(validateSprite(['0x'])[0], /invalid characters/);
  assert.match(validateSprite(['00'], { height: 2 })[0], /expected 2 rows/);
});
