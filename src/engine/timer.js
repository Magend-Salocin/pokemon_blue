/** Counts `duration` seconds, driven by update(dt). Calls onComplete once (or each period if repeat). */
export function createTimer(duration, { repeat = false, onComplete } = {}) {
  const timer = {
    elapsed: 0,
    done: false,
    get progress() {
      return duration > 0 ? Math.min(timer.elapsed / duration, 1) : 1;
    },
    update(dt) {
      if (timer.done) return;
      timer.elapsed += dt;
      while (timer.elapsed >= duration && !timer.done) {
        onComplete?.();
        if (repeat && duration > 0) {
          timer.elapsed -= duration;
        } else {
          timer.done = true;
        }
      }
    },
    reset() {
      timer.elapsed = 0;
      timer.done = false;
    },
  };
  return timer;
}

/** Holds several timers and updates them together. */
export function createScheduler() {
  let timers = [];

  function add(timer) {
    timers.push(timer);
    return timer;
  }

  return {
    after: (seconds, callback) => add(createTimer(seconds, { onComplete: callback })),
    every: (seconds, callback) => add(createTimer(seconds, { repeat: true, onComplete: callback })),
    wait: (seconds) => new Promise((resolve) => add(createTimer(seconds, { onComplete: resolve }))),
    cancel(timer) {
      timers = timers.filter((item) => item !== timer);
    },
    update(dt) {
      for (const timer of [...timers]) timer.update(dt);
      timers = timers.filter((timer) => !timer.done);
    },
    clear() {
      timers = [];
    },
  };
}
