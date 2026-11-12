import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ASYMMETRIC_PLANS, BODY_PLANS, FEATURES, PATTERNS, generateCreatureSprite } from '../src/gfx/creature-generator.js';
import { TRANSPARENT, hashSprite, isEmptySprite } from '../src/gfx/sprite-utils.js';

const SIZE = 48;

function pixel(sprite, x, y) {
  return sprite.pixels[y * SIZE + x];
}

function borderIsEmpty(sprite) {
  for (let i = 0; i < SIZE; i += 1) {
    if (pixel(sprite, i, 0) !== TRANSPARENT || pixel(sprite, i, SIZE - 1) !== TRANSPARENT) return false;
    if (pixel(sprite, 0, i) !== TRANSPARENT || pixel(sprite, SIZE - 1, i) !== TRANSPARENT) return false;
  }
  return true;
}

/** Every opaque pixel touching transparency is the outline color. */
function hasClosedOutline(sprite) {
  for (let y = 0; y < SIZE; y += 1) {
    for (let x = 0; x < SIZE; x += 1) {
      const value = pixel(sprite, x, y);
      if (value === TRANSPARENT) continue;
      const touchesTransparent = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => pixel(sprite, x + dx, y + dy) === TRANSPARENT);
      if (touchesTransparent && value !== 3) return false;
    }
  }
  return true;
}

function isSymmetric(sprite) {
  for (let y = 0; y < SIZE; y += 1) {
    for (let x = 0; x < SIZE / 2; x += 1) {
      const left = pixel(sprite, x, y) === TRANSPARENT;
      const right = pixel(sprite, SIZE - 1 - x, y) === TRANSPARENT;
      if (left !== right) return false;
    }
  }
  return true;
}

test('same spec gives the same pixels', () => {
  const spec = { plan: 'quadruped', seed: 42, size: 2, features: ['horns', 'tail_flame'], pattern: 'spots' };
  assert.equal(hashSprite(generateCreatureSprite(spec)), hashSprite(generateCreatureSprite({ ...spec, features: [...spec.features] })));
  assert.equal(hashSprite(generateCreatureSprite(spec, 'back')), hashSprite(generateCreatureSprite(spec, 'back')));
});

test('different seeds give different sprites', () => {
  const hashes = new Set();
  for (let seed = 1; seed <= 20; seed += 1) {
    hashes.add(hashSprite(generateCreatureSprite({ plan: 'biped', seed, size: 2, features: [], pattern: 'plain' })));
  }
  assert.ok(hashes.size >= 18, `only ${hashes.size} distinct sprites out of 20`);
});

for (const plan of BODY_PLANS) {
  test(`plan ${plan}: non-empty, outlined, inside the 48×48 frame, front differs from back`, () => {
    for (const size of [1, 2, 3]) {
      const spec = { plan, seed: 1234, size, features: [], pattern: 'light_belly' };
      const front = generateCreatureSprite(spec, 'front');
      const back = generateCreatureSprite(spec, 'back');
      for (const sprite of [front, back]) {
        assert.equal(sprite.width, SIZE);
        assert.equal(sprite.height, SIZE);
        assert.ok(!isEmptySprite(sprite));
        assert.ok(sprite.pixels.includes(3), 'no outline color');
        assert.ok(hasClosedOutline(sprite), 'silhouette not fully outlined');
        assert.ok(borderIsEmpty(sprite), 'silhouette touches the frame border');
      }
      assert.notEqual(hashSprite(front), hashSprite(back));
      if (!ASYMMETRIC_PLANS.has(plan)) assert.ok(isSymmetric(front), 'silhouette should be symmetric');
    }
  });
}

test('every feature and pattern renders inside the frame', () => {
  FEATURES.forEach((feature, index) => {
    const plan = BODY_PLANS[index % BODY_PLANS.length];
    const pattern = PATTERNS[index % PATTERNS.length];
    const sprite = generateCreatureSprite({ plan, seed: 99 + index, size: 3, features: [feature], pattern });
    assert.ok(borderIsEmpty(sprite), `${feature} on ${plan} touches the border`);
    assert.ok(hasClosedOutline(sprite), `${feature} on ${plan} not outlined`);
  });
});

test('larger sizes produce larger silhouettes', () => {
  const area = (size) => generateCreatureSprite({ plan: 'biped', seed: 5, size, features: [], pattern: 'plain' }).pixels.filter((value) => value !== TRANSPARENT).length;
  assert.ok(area(1) < area(2) && area(2) < area(3));
});

test('invalid specs are rejected', () => {
  assert.throws(() => generateCreatureSprite({ plan: 'robot', seed: 1, size: 1 }), /unknown plan/);
  assert.throws(() => generateCreatureSprite({ plan: 'blob', seed: 1, size: 1, features: ['laser'] }), /unknown feature/);
  assert.throws(() => generateCreatureSprite({ plan: 'blob', seed: 1, size: 1 }, 'side'), /Unknown view/);
});
