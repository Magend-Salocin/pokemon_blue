import { FIXED_STEP, MAX_UPDATES_PER_FRAME } from './constants.js';

/**
 * Fixed-step game loop: update() runs at exactly `step` seconds, render() once per frame.
 * Scheduling functions are injectable so the loop can be tested without a browser.
 */
export function createLoop({
  update,
  render,
  step = FIXED_STEP,
  maxUpdatesPerFrame = MAX_UPDATES_PER_FRAME,
  requestFrame = (callback) => requestAnimationFrame(callback),
  cancelFrame = (id) => cancelAnimationFrame(id),
}) {
  let frameId = null;
  let lastTime = null;
  let accumulator = 0;
  let running = false;
  let paused = false;

  function frame(now) {
    frameId = requestFrame(frame);

    if (lastTime === null) {
      lastTime = now;
      render();
      return;
    }

    accumulator += (now - lastTime) / 1000;
    lastTime = now;

    let updates = 0;
    while (accumulator >= step && updates < maxUpdatesPerFrame) {
      update(step);
      accumulator -= step;
      updates += 1;
    }

    // Spiral-of-death guard: drop the time we could not catch up on.
    if (updates === maxUpdatesPerFrame) accumulator = 0;

    render();
  }

  function schedule() {
    lastTime = null;
    accumulator = 0;
    frameId = requestFrame(frame);
  }

  function unschedule() {
    if (frameId !== null) cancelFrame(frameId);
    frameId = null;
  }

  return {
    start() {
      if (running) return;
      running = true;
      if (!paused) schedule();
    },
    stop() {
      running = false;
      unschedule();
    },
    pause() {
      if (paused) return;
      paused = true;
      unschedule();
    },
    resume() {
      if (!paused) return;
      paused = false;
      if (running) schedule();
    },
    get isPaused() {
      return paused;
    },
  };
}

/** Pauses the loop while the window is unfocused or hidden. Returns a detach function. */
export function attachFocusPause(loop, target = window) {
  const onBlur = () => loop.pause();
  const onFocus = () => loop.resume();
  const onVisibility = () => (target.document.hidden ? onBlur() : onFocus());

  target.addEventListener('blur', onBlur);
  target.addEventListener('focus', onFocus);
  target.document.addEventListener('visibilitychange', onVisibility);

  return () => {
    target.removeEventListener('blur', onBlur);
    target.removeEventListener('focus', onFocus);
    target.document.removeEventListener('visibilitychange', onVisibility);
  };
}
