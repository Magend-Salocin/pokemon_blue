// 4-channel synthesizer on the Web Audio API, in the spirit of 8-bit handhelds:
// channels 1-2 pulse waves (12.5, 25, 50, 75 %), channel 3 a 32-sample wave table,
// channel 4 noise (15-bit or 7-bit LFSR). Music and effects use separate buses; an effect
// borrows a channel and mutes the music on that channel only while it plays.
import { midiToFrequency } from './track-parser.js';
import { WAVE_TABLES, lfsrSamples, noiseClock } from './waves.js';

const CHANNEL_MIX = 0.16;
const ATTACK = 0.002;
const RELEASE = 0.004;
const ENVELOPE_STEP = 1 / 64;

function pulseWave(ctx, duty) {
  const harmonics = 64;
  const real = new Float32Array(harmonics);
  const imag = new Float32Array(harmonics);
  for (let k = 1; k < harmonics; k += 1) real[k] = (2 / (k * Math.PI)) * Math.sin(Math.PI * k * duty);
  return ctx.createPeriodicWave(real, imag);
}

function tableWave(ctx, samples) {
  const size = samples.length;
  const harmonics = size / 2;
  const real = new Float32Array(harmonics);
  const imag = new Float32Array(harmonics);
  const centered = samples.map((value) => (value - 7.5) / 7.5);
  for (let k = 1; k < harmonics; k += 1) {
    for (let j = 0; j < size; j += 1) {
      real[k] += (2 / size) * centered[j] * Math.cos((2 * Math.PI * k * j) / size);
      imag[k] += (2 / size) * centered[j] * Math.sin((2 * Math.PI * k * j) / size);
    }
  }
  return ctx.createPeriodicWave(real, imag);
}

function noiseBuffer(ctx, mode) {
  const length = 48000;
  const buffer = ctx.createBuffer(1, length, 48000);
  buffer.copyToChannel(lfsrSamples(length, mode), 0);
  return buffer;
}

/** Volume steps of an envelope: [{ time offset, level 0-15 }], until `duration`. */
export function envelopeSteps(volume, envelope, duration) {
  const steps = [{ offset: 0, level: volume }];
  if (!envelope.step) return steps;
  const interval = envelope.step * ENVELOPE_STEP;
  let level = volume;
  for (let offset = interval; offset < duration; offset += interval) {
    const next = Math.max(0, Math.min(15, level + envelope.direction));
    if (next === level) break;
    level = next;
    steps.push({ offset, level });
  }
  return steps;
}

export function createSynth(ctx) {
  const master = ctx.createGain();
  master.connect(ctx.destination);
  const musicBus = ctx.createGain();
  const sfxBus = ctx.createGain();
  // Fades and hard stops of the music act on this gain, not on the volume of the options.
  const musicFade = ctx.createGain();
  musicFade.connect(musicBus);
  musicBus.connect(master);
  sfxBus.connect(master);
  const musicChannels = [1, 2, 3, 4].map(() => {
    const gain = ctx.createGain();
    gain.connect(musicFade);
    return gain;
  });
  const busyUntil = [0, 0, 0, 0];

  const pulses = Object.fromEntries([12, 25, 50, 75].map((duty) => [duty, pulseWave(ctx, duty / 100)]));
  const waves = WAVE_TABLES.map((table) => tableWave(ctx, table));
  const noises = { 15: noiseBuffer(ctx, 15), 7: noiseBuffer(ctx, 7) };

  function createSource(channel, event, start, end) {
    if (channel === 4) {
      const source = ctx.createBufferSource();
      source.buffer = noises[event.mode];
      source.loop = true;
      source.playbackRate.value = noiseClock(event.noise) / 48000;
      return source;
    }
    const source = ctx.createOscillator();
    source.setPeriodicWave(channel === 3 ? waves[event.wave] ?? waves[0] : pulses[event.duty] ?? pulses[50]);
    const frequency = midiToFrequency(event.midi);
    source.frequency.setValueAtTime(frequency, start);
    if (event.glide) source.frequency.exponentialRampToValueAtTime(frequency * 2 ** (event.glide / 12), end);
    return source;
  }

  /**
   * Schedules one event on a channel (1-4) between start and end (AudioContext seconds).
   * target: 'music' or 'sfx'. Returns { source, gain, end } so the caller can cut it.
   */
  function scheduleNote(channel, event, start, end, target = 'music') {
    const gain = ctx.createGain();
    gain.connect(target === 'music' ? musicChannels[channel - 1] : sfxBus);
    const duration = Math.max(0.01, end - start);
    const steps = envelopeSteps(event.volume, event.envelope, duration);
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime((steps[0].level / 15) * CHANNEL_MIX, start + ATTACK);
    for (const step of steps.slice(1)) gain.gain.setValueAtTime((step.level / 15) * CHANNEL_MIX, start + step.offset);
    const lastLevel = steps.at(-1).level;
    gain.gain.setValueAtTime((lastLevel / 15) * CHANNEL_MIX, Math.max(start + ATTACK, end - RELEASE));
    gain.gain.linearRampToValueAtTime(0, end);
    const source = createSource(channel, event, start, end);
    source.connect(gain);
    source.start(start);
    source.stop(end + 0.01);
    return { source, gain, end };
  }

  /** An effect takes channel `channel` between start and end: the music is muted there only. */
  function borrowChannel(channel, start, end) {
    const index = channel - 1;
    const { gain } = musicChannels[index];
    busyUntil[index] = Math.max(busyUntil[index], end);
    gain.cancelScheduledValues(start);
    gain.setValueAtTime(gain.value, start);
    gain.linearRampToValueAtTime(0, start + 0.005);
    gain.setValueAtTime(0, busyUntil[index]);
    gain.linearRampToValueAtTime(1, busyUntil[index] + 0.005);
  }

  /** Cuts notes already scheduled (smoothly, to avoid clicks). */
  function cut(notes, at = ctx.currentTime) {
    for (const note of notes) {
      if (note.end <= at) continue;
      note.gain.gain.cancelScheduledValues(at);
      note.gain.gain.setValueAtTime(note.gain.gain.value, at);
      note.gain.gain.linearRampToValueAtTime(0, at + 0.01);
      note.source.stop(at + 0.02);
    }
  }

  function setVolumes(music, sfx) {
    musicBus.gain.setValueAtTime(Math.max(0, Math.min(1, music)), ctx.currentTime);
    sfxBus.gain.setValueAtTime(Math.max(0, Math.min(1, sfx)), ctx.currentTime);
  }

  return { ctx, musicFade, scheduleNote, borrowChannel, cut, setVolumes };
}
