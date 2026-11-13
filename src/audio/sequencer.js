// Music sequencer: schedules parsed tracks 100 ms ahead on the AudioContext clock (stable tempo
// whatever the frame rate), loops, fades out, and reports the position for resuming later.
const LOOKAHEAD = 0.1;
const TIMER_INTERVAL = 25;
const START_DELAY = 0.05;

/** First event index at or after `tick` in each channel. */
function firstIndexAt(events, tick) {
  const index = events.findIndex((event) => event.tick >= tick);
  return index < 0 ? events.length : index;
}

export function createSequencer(synth) {
  const { ctx } = synth;
  let current = null;
  let active = [];
  let timer = null;

  function startTrack(track, { startTick = 0, onEnd = null } = {}) {
    const startTime = ctx.currentTime + START_DELAY - startTick * track.secondsPerTick;
    current = {
      track,
      startTime,
      onEnd,
      cursors: Object.entries(track.channels).map(([channel, data]) => ({
        channel: Number(channel),
        events: data.events,
        loopIndex: firstIndexAt(data.events, track.loopTick),
        index: firstIndexAt(data.events, startTick),
        offset: 0,
        done: data.events.length === 0,
      })),
    };
    timer ??= setInterval(schedule, TIMER_INTERVAL);
    schedule();
  }

  function schedule() {
    if (!current) return;
    const { track, startTime } = current;
    const horizon = ctx.currentTime + LOOKAHEAD;
    const spt = track.secondsPerTick;
    for (const cursor of current.cursors) {
      while (!cursor.done) {
        const event = cursor.events[cursor.index];
        const time = startTime + cursor.offset + event.tick * spt;
        if (time >= horizon) break;
        if (time >= ctx.currentTime - 0.01) {
          active.push(synth.scheduleNote(cursor.channel, event, time, time + event.ticks * spt, 'music'));
        }
        cursor.index += 1;
        if (cursor.index < cursor.events.length) continue;
        if (track.loop && cursor.loopIndex < cursor.events.length) {
          cursor.index = cursor.loopIndex;
          cursor.offset += (track.lengthTicks - track.loopTick) * spt;
        } else {
          cursor.done = true;
        }
      }
    }
    active = active.filter((note) => note.end > ctx.currentTime);
    const finished = !track.loop && ctx.currentTime >= startTime + track.duration;
    if (finished) {
      const { onEnd } = current;
      current = null;
      onEnd?.();
    }
  }

  /** Current tick in the track (within the loop once it has looped), or null. */
  function position() {
    if (!current) return null;
    const { track, startTime } = current;
    const elapsed = Math.max(0, (ctx.currentTime - startTime) / track.secondsPerTick);
    if (!track.loop || elapsed < track.lengthTicks) return Math.min(elapsed, track.lengthTicks);
    const loopLength = track.lengthTicks - track.loopTick;
    return track.loopTick + ((elapsed - track.loopTick) % loopLength);
  }

  /** Stops right now (short ramp, no click) and forgets the track. */
  function stop() {
    synth.cut(active);
    active = [];
    current = null;
  }

  /** Fades the music out over `seconds`, then stops. Resolves when silent. */
  function fadeOut(seconds) {
    if (!current) return Promise.resolve();
    const gain = synth.musicFade.gain;
    const now = ctx.currentTime;
    gain.cancelScheduledValues(now);
    gain.setValueAtTime(gain.value, now);
    gain.linearRampToValueAtTime(0, now + seconds);
    const fading = current;
    return new Promise((resolve) => {
      setTimeout(() => {
        if (current === fading) stop();
        gain.cancelScheduledValues(ctx.currentTime);
        gain.setValueAtTime(1, ctx.currentTime);
        resolve();
      }, seconds * 1000);
    });
  }

  /** Plays a parsed track. options: { startTick, onEnd (non-looping tracks) }. */
  function play(track, options = {}) {
    stop();
    const gain = synth.musicFade.gain;
    gain.cancelScheduledValues(ctx.currentTime);
    gain.setValueAtTime(1, ctx.currentTime);
    startTrack(track, options);
  }

  return {
    play,
    stop,
    fadeOut,
    position,
    get currentId() {
      return current?.track.id ?? null;
    },
  };
}
