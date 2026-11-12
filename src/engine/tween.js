export const Easing = {
  linear: (t) => t,
  easeInQuad: (t) => t * t,
  easeOutQuad: (t) => t * (2 - t),
  easeInOutQuad: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
};

/**
 * Interpolates from `from` to `to` over `duration` seconds, driven by update(dt).
 * `promise` resolves when the tween completes.
 */
export function createTween({ from = 0, to = 1, duration, easing = Easing.linear, onUpdate, onComplete }) {
  let elapsed = 0;
  let resolve;
  const promise = new Promise((done) => {
    resolve = done;
  });

  const tween = {
    value: from,
    done: false,
    promise,
    update(dt) {
      if (tween.done) return;
      elapsed += dt;
      const progress = duration > 0 ? Math.min(elapsed / duration, 1) : 1;
      tween.value = from + (to - from) * easing(progress);
      onUpdate?.(tween.value);
      if (progress >= 1) tween.finish();
    },
    finish() {
      if (tween.done) return;
      tween.value = to;
      tween.done = true;
      onComplete?.();
      resolve();
    },
  };
  return tween;
}
