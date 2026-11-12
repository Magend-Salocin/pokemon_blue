import { createInput } from './engine/input.js';
import { attachFocusPause, createLoop } from './engine/loop.js';
import { createRenderer } from './engine/renderer.js';
import { createSceneManager } from './engine/scene-manager.js';
import { getAtlas, loadAtlases } from './gfx/atlas.js';
import { cyclePalette } from './gfx/palette.js';
import { installBattleHooks } from './battle/ui/battle-setup.js';
import { TEST_START } from './data/maps/index.js';
import { DebugMenuScene } from './debug/debug-menu.js';
import { DemoScene } from './demo/demo-scene.js';
import { OverworldScene } from './overworld/overworld-scene.js';
import { LoadingScene } from './ui/loading-scene.js';
import { hooks } from './overworld/hooks.js';

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

/** Dev only: F1 opens the debug menu over the map. */
function attachDebugMenu(overworld) {
  window.addEventListener('keydown', (event) => {
    if (event.code !== 'F1' || scenes.top !== overworld || overworld.busy) return;
    event.preventDefault();
    scenes.push(new DebugMenuScene());
  });
}

async function boot() {
  const loading = scenes.push(new LoadingScene());
  try {
    await loadAtlases((loaded, total) => loading.setProgress(loaded, total));
    installBattleHooks(scenes);
    if (window.bestiora?.isDev) {
      const tilesets = getAtlas('tiles').meta.tilesets;
      const overworld = scenes.replace(new OverworldScene({ start: TEST_START, tilesets }));
      attachDebugMenu(overworld);
      // Dev only: lets the debug tools and automated checks read the running game.
      window.debugGame = { scenes, overworld, state: overworld.state, hooks };
    } else {
      scenes.replace(new DemoScene());
    }
  } catch (error) {
    loading.error = error.message;
    throw error;
  }
}

attachFocusPause(loop);
loop.start();
boot();
