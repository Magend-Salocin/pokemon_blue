import { createInput } from './engine/input.js';
import { attachFocusPause, createLoop } from './engine/loop.js';
import { createRenderer } from './engine/renderer.js';
import { createSceneManager } from './engine/scene-manager.js';
import { getAtlas, loadAtlases } from './gfx/atlas.js';
import { cyclePalette } from './gfx/palette.js';
import { installBattleHooks } from './battle/ui/battle-setup.js';
import { GAME_START, HOME_RESPAWN, TEST_START, getMapDefinition } from './data/maps/index.js';
import { DebugMenuScene } from './debug/debug-menu.js';
import { hooks, setHooks } from './overworld/hooks.js';
import { OverworldScene } from './overworld/overworld-scene.js';
import { createGameState, getGameState, setGameState } from './state/game-state.js';
import { LoadingScene } from './ui/loading-scene.js';
import { installMenuHooks } from './ui/menu-hooks.js';
import { createAudioSystem } from './audio/audio-system.js';
import { loadAndApplyOptions, registerOptionTargets } from './ui/options-screen.js';
import { TitleScene } from './ui/title-scene.js';
import { playIntro } from './ui/intro-scene.js';

const renderer = createRenderer(document.getElementById('screen'));
const input = createInput();
const scenes = createSceneManager();
const isDev = Boolean(window.bestiora?.isDev);
let overworld = null;
let audio = null;

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
    if (overworld) getGameState().playTime += dt;
    scenes.update(dt, input);
  },
  render() {
    scenes.render(renderer.ctx);
    renderer.present();
  },
});

/** Interim save read (prompt 12 moves it to the main process). */
function readSave() {
  try {
    return JSON.parse(localStorage.getItem('bestiora-save') ?? 'null');
  } catch {
    return null;
  }
}

function startGame(state, start, respawn = HOME_RESPAWN) {
  setGameState(state);
  const tilesets = getAtlas('tiles').meta.tilesets;
  overworld = scenes.replace(new OverworldScene({ start, tilesets, state, respawn }));
  if (isDev) window.debugGame = { scenes, overworld, state, hooks, audio };
}

function showTitle() {
  const save = readSave();
  scenes.replace(new TitleScene({
    hasSave: Boolean(save),
    onChoice: (choice) => {
      if (choice === 'continue') startGame({ ...createGameState(), ...save }, save.position);
      else startNewGame();
    },
  }));
}

async function startNewGame() {
  const identity = await playIntro(scenes);
  startGame(createGameState(identity), GAME_START);
}

/** Dev only: teleports to a map, on its fly point or its first warp. */
function debugWarp(mapId) {
  const definition = getMapDefinition(mapId);
  const target = definition.flyPoint ?? definition.warps?.[0] ?? { x: 1, y: 1 };
  overworld.runBusy(() => overworld.doWarp(mapId, target.x, target.y, 'down'));
}

/** Dev only: F1 opens the debug menu over the map. */
function attachDebugMenu() {
  window.addEventListener('keydown', (event) => {
    if (event.code !== 'F1' || !overworld || scenes.top !== overworld || overworld.busy) return;
    event.preventDefault();
    scenes.push(new DebugMenuScene(getGameState(), { warp: debugWarp }));
  });
}

async function boot() {
  const loading = scenes.push(new LoadingScene());
  try {
    registerOptionTargets({ input });
    audio = createAudioSystem();
    setHooks({ playMusic: audio.playMusic, playSfx: audio.playSfx, setVolumes: audio.setVolumes });
    await loadAndApplyOptions();
    await loadAtlases((loaded, total) => loading.setProgress(loaded, total));
    installBattleHooks(scenes);
    installMenuHooks(scenes);
    if (isDev) {
      window.debugGame = { scenes, hooks, audio };
      attachDebugMenu();
      if (new URLSearchParams(window.location.search).has('newgame')) showTitle();
      else startGame(getGameState(), TEST_START, TEST_START);
    } else {
      showTitle();
    }
  } catch (error) {
    loading.error = error.message;
    throw error;
  }
}

attachFocusPause(loop);
loop.start();
boot();
