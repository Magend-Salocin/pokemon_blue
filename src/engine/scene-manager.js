import { DEFAULT_FADE_DURATION } from './constants.js';
import { IDLE_INPUT } from './input.js';
import { createTween } from './tween.js';
import { FADE_LEVELS, getFadeLevel, setFadeLevel } from '../gfx/palette.js';

/**
 * Scene contract (all members optional):
 *   transparent  true  → the scene below is rendered first (dialog over the map). Default false.
 *   blocksInput  false → the scene below is also updated and receives input. Default true.
 *   enter(manager), exit(), resume(), update(dt, input), render(ctx)
 *
 * Fades recolor the palette in 4 steps toward black or white, so the screen keeps 4 tints.
 * Scenes receive IDLE_INPUT while a fade runs.
 */
export function createSceneManager() {
  const stack = [];
  let fade = null;

  const manager = {
    push(scene) {
      stack.push(scene);
      scene.enter?.(manager);
      return scene;
    },

    pop() {
      const scene = stack.pop();
      scene?.exit?.();
      stack.at(-1)?.resume?.();
      return scene;
    },

    replace(scene) {
      stack.pop()?.exit?.();
      return manager.push(scene);
    },

    get top() {
      return stack.at(-1) ?? null;
    },

    get size() {
      return stack.length;
    },

    get isFading() {
      return fade !== null;
    },

    update(dt, input) {
      fade?.update(dt);
      const sceneInput = fade ? IDLE_INPUT : input;

      const snapshot = [...stack];
      for (let i = snapshot.length - 1; i >= 0; i -= 1) {
        snapshot[i].update?.(dt, sceneInput);
        if (snapshot[i].blocksInput !== false) break;
      }
    },

    render(ctx) {
      let first = stack.length - 1;
      while (first > 0 && stack[first].transparent) first -= 1;
      for (let i = Math.max(first, 0); i < stack.length; i += 1) stack[i].render?.(ctx);
    },

    /** Fades the screen out to black or white. Resolves when fully faded. */
    fadeOut({ color = 'black', duration = DEFAULT_FADE_DURATION } = {}) {
      return animateFade(color === 'white' ? -FADE_LEVELS : FADE_LEVELS, duration);
    },

    /** Fades back in. With `color`, starts from that color instead of the current fade. */
    fadeIn({ color, duration = DEFAULT_FADE_DURATION } = {}) {
      if (color) setFadeLevel(color === 'white' ? -FADE_LEVELS : FADE_LEVELS);
      return animateFade(0, duration);
    },

    /** Fades out, runs `action` (may be async), then fades back in. */
    async transition(action, options = {}) {
      await manager.fadeOut(options);
      await action();
      await manager.fadeIn({ duration: options.duration });
    },
  };

  function animateFade(target, duration) {
    fade?.finish();
    const tween = createTween({
      from: getFadeLevel(),
      to: target,
      duration,
      onUpdate: (value) => setFadeLevel(Math.round(value)),
      onComplete: () => {
        setFadeLevel(target);
        fade = null;
      },
    });
    fade = tween;
    if (duration <= 0) tween.finish();
    return tween.promise;
  }

  return manager;
}
