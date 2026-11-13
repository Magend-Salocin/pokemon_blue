import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CREATURES } from '../src/data/creatures.js';
import { cryPitch, generateCry, lineRoot } from '../src/audio/cries.js';
import { envelopeSteps } from '../src/audio/synth.js';
import { TrackError, midiToFrequency, parseChannel, parseTrack } from '../src/audio/track-parser.js';
import { lfsrSamples, noiseClock } from '../src/audio/waves.js';
import { loadGameData } from '../tools/validators/game-data.js';
import { checkAudio } from '../tools/validators/audio.js';

test('notes: names, accidentals, octaves and frequencies', () => {
  const { events } = parseChannel('C4 D#5 Eb5 O3 A > A < < A');
  assert.deepEqual(events.map((event) => event.midi), [60, 75, 75, 57, 69, 45]);
  assert.equal(midiToFrequency(69), 440);
  assert.ok(Math.abs(midiToFrequency(60) - 261.63) < 0.01);
});

test('lengths: default, explicit, dotted, rests', () => {
  const { events, lengthTicks } = parseChannel('L4 C4 D4:8 E4:8. R:16 F4:1');
  assert.deepEqual(events.map((event) => [event.tick, event.ticks]), [[0, 24], [24, 12], [36, 18], [60, 96]]);
  assert.equal(lengthTicks, 156);
});

test('settings: volume, envelope, duty, glide, wave, noise', () => {
  const [note] = parseChannel('V9 S-3 P25 H-12 C5', { channel: 1 }).events;
  assert.deepEqual([note.volume, note.envelope, note.duty, note.glide], [9, { direction: -1, step: 3 }, 25, -12]);
  assert.equal(parseChannel('W2 C3', { channel: 3 }).events[0].wave, 2);
  const [noise] = parseChannel('N7 X5:16', { channel: 4 }).events;
  assert.deepEqual([noise.noise, noise.mode, noise.ticks], [5, 7, 6]);
});

test('loops, nested loops and the loop point', () => {
  const { events, loopTick } = parseChannel('C4 @ [D4 [E4]x3]x2');
  assert.deepEqual(events.map((event) => event.midi), [60, 62, 64, 64, 64, 62, 64, 64, 64]);
  assert.equal(loopTick, 12);
  assert.equal(parseChannel('[C4 D4]').events.length, 4);
});

test('explicit errors with the position of the symbol', () => {
  assert.throws(() => parseChannel('C4 Z9', { trackId: 't', channel: 2 }), /Piste t, voie 2, symbole 2 \(« Z9 »\) : symbole inconnu/);
  assert.throws(() => parseChannel('[C4 D4'), /« \[ » sans « \] »/);
  assert.throws(() => parseChannel('C4 ]x2'), /sans « \[ »/);
  assert.throws(() => parseChannel('C4:3'), /durée « 3 » invalide/);
  assert.throws(() => parseChannel('C4 |'), /mesure incomplète/);
  assert.throws(() => parseChannel('[@ C4]'), /bouclage/);
  assert.throws(() => parseChannel('C4', { channel: 4 }), /bruit/);
  assert.throws(() => parseChannel('P30 C4', { channel: 1 }), /rapport cyclique/);
  assert.throws(() => parseTrack({ id: 'x', tempo: 120, channels: { 1: 'C4:4', 2: 'C4:2' } }), TrackError);
});

test('track timing: seconds per tick and duration', () => {
  const track = parseTrack({ id: 'x', tempo: 120, channels: { 1: 'C4:1 C4:1' } });
  assert.equal(track.secondsPerTick, 0.5 / 24);
  assert.equal(track.duration, 4);
});

test('envelope steps and noise generator', () => {
  assert.deepEqual(envelopeSteps(3, { direction: -1, step: 4 }, 1).map((step) => step.level), [3, 2, 1, 0]);
  assert.deepEqual(envelopeSteps(8, { direction: 0, step: 0 }, 1), [{ offset: 0, level: 8 }]);
  const short = lfsrSamples(254, 7);
  assert.deepEqual(Array.from(short.slice(0, 127)), Array.from(short.slice(127, 254)));
  assert.ok(noiseClock(0) > noiseClock(15));
});

test('cries are deterministic, 0.3 to 0.8 s, distinct per species', () => {
  assert.deepEqual(generateCry('pivelin'), generateCry('pivelin'));
  const signatures = new Set();
  for (const creature of CREATURES) {
    const cry = generateCry(creature.id);
    assert.ok(cry.duration >= 0.29 && cry.duration <= 0.81, `${creature.id} : ${cry.duration}`);
    signatures.add(JSON.stringify(cry.channels));
  }
  assert.equal(signatures.size, CREATURES.length);
});

test('an evolution cries close to its base form, but lower', () => {
  assert.equal(lineRoot('aquilard').root, 'pivelin');
  assert.ok(cryPitch('grivelin') < cryPitch('pivelin'));
  assert.ok(cryPitch('aquilard') < cryPitch('grivelin'));
  const base = generateCry('pivelin').channels[1].events.map((event) => event.duty);
  const evolved = generateCry('grivelin').channels[1].events.map((event) => event.duty);
  assert.equal(base[0], evolved[0]);
});

test('audio checker: tracks parse, durations, motif and references', () => {
  assert.deepEqual(checkAudio(loadGameData()), []);
  const broken = { ...loadGameData(), maps: { a: { id: 'a', music: 'inconnue' } } };
  assert.ok(checkAudio(broken).some((error) => error.includes('piste inconnue « inconnue »')));
});
