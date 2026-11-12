import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSceneManager } from '../src/engine/scene-manager.js';
import { getFadeLevel, setFadeLevel } from '../src/gfx/palette.js';

const PRESSED_INPUT = {
  isDown: () => true,
  justPressed: () => true,
  justReleased: () => false,
  repeat: () => true,
};

function createScene(name, log, props = {}) {
  return {
    ...props,
    update: (dt, input) => log.push(`update:${name}:${input.justPressed('a')}`),
    render: () => log.push(`render:${name}`),
  };
}

test('only the top scene updates unless it lets input through', () => {
  const log = [];
  const scenes = createSceneManager();
  scenes.push(createScene('map', log));
  scenes.push(createScene('hud', log, { blocksInput: false }));
  scenes.push(createScene('dialog', log));

  scenes.update(1 / 60, PRESSED_INPUT);
  assert.deepEqual(log, ['update:dialog:true']);

  scenes.pop();
  log.length = 0;
  scenes.update(1 / 60, PRESSED_INPUT);
  assert.deepEqual(log, ['update:hud:true', 'update:map:true']);
});

test('transparent scenes render the scenes below, bottom first', () => {
  const log = [];
  const scenes = createSceneManager();
  scenes.push(createScene('title', log));
  scenes.push(createScene('map', log));
  scenes.push(createScene('dialog', log, { transparent: true }));

  scenes.render(null);
  assert.deepEqual(log, ['render:map', 'render:dialog']);
});

test('replace swaps the top scene and calls exit/enter', () => {
  const events = [];
  const scenes = createSceneManager();
  scenes.push({ exit: () => events.push('exit:a') });
  const b = scenes.replace({ enter: () => events.push('enter:b') });

  assert.equal(scenes.top, b);
  assert.equal(scenes.size, 1);
  assert.deepEqual(events, ['exit:a', 'enter:b']);
});

test('fades step the palette, block input and resolve their promise', async () => {
  setFadeLevel(0);
  const log = [];
  const scenes = createSceneManager();
  scenes.push(createScene('map', log));

  let resolved = false;
  scenes.fadeOut({ color: 'white', duration: 0.3 }).then(() => {
    resolved = true;
  });
  scenes.update(0.1, PRESSED_INPUT);
  assert.deepEqual(log, ['update:map:false']);
  assert.equal(getFadeLevel(), -1);

  scenes.update(0.25, PRESSED_INPUT);
  await Promise.resolve();
  assert.equal(getFadeLevel(), -3);
  assert.equal(resolved, true);
  assert.equal(scenes.isFading, false);

  const fadeIn = scenes.fadeIn({ duration: 0.2 });
  scenes.update(0.2, PRESSED_INPUT);
  await fadeIn;
  assert.equal(getFadeLevel(), 0);
});
