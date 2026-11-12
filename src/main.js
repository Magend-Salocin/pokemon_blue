import { createInput } from './engine/input.js';
import { attachFocusPause, createLoop } from './engine/loop.js';
import { createRenderer } from './engine/renderer.js';
import { createSceneManager } from './engine/scene-manager.js';
import { cyclePalette } from './gfx/palette.js';
import { DemoScene } from './demo/demo-scene.js';

const renderer = createRenderer(document.getElementById('screen'));
const input = createInput();
const scenes = createSceneManager();

function isPaletteShortcut() {
  return (
    (input.isDown('select') && input.justPressed('start')) ||
    (input.isDown('start') && input.justPressed('select'))
  );
}

const loop = createLoop({
  update(dt) {
    input.update(dt);
    if (isPaletteShortcut()) cyclePalette();
    scenes.update(dt, input);
  },
  render() {
    scenes.render(renderer.ctx);
    renderer.present();
  },
});

attachFocusPause(loop);
scenes.push(new DemoScene());
loop.start();
