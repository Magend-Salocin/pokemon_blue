// Wave tables of channel 3: 32 samples of 4 bits (0-15). Selected in tracks with W<index>.

export const WAVE_TABLES = [
  // 0: soft triangle (bass)
  [8, 9, 10, 11, 12, 13, 14, 15, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 0, 1, 2, 3, 4, 5, 6, 7],
  // 1: round organ
  [8, 11, 13, 14, 15, 14, 13, 11, 9, 8, 8, 9, 11, 12, 11, 9, 7, 4, 2, 1, 0, 1, 2, 4, 6, 7, 7, 6, 4, 3, 4, 6],
  // 2: bright saw
  [15, 15, 14, 14, 13, 13, 12, 12, 11, 11, 10, 10, 9, 9, 8, 8, 7, 7, 6, 6, 5, 5, 4, 4, 3, 3, 2, 2, 1, 1, 0, 0],
  // 3: hollow flute
  [8, 12, 14, 15, 14, 12, 8, 4, 2, 1, 2, 4, 8, 10, 11, 10, 8, 6, 5, 6, 8, 12, 14, 15, 14, 12, 8, 4, 2, 1, 2, 4],
];

export const NOISE_PITCHES = 16;

/** Clock of the noise generator for X0 (hiss) to X15 (rumble), in LFSR steps per second. */
export function noiseClock(pitch) {
  return 48000 / 2 ** (pitch * 0.5);
}

/**
 * Linear-feedback shift register as on the original hardware: XOR of bits 0 and 1, shifted in at
 * bit 14 (and bit 6 in 7-bit mode, which gives a short metallic period). Returns ±1 samples.
 */
export function lfsrSamples(length, mode = 15) {
  const samples = new Float32Array(length);
  let register = 0x7fff;
  for (let i = 0; i < length; i += 1) {
    const bit = (register ^ (register >> 1)) & 1;
    register = (register >> 1) | (bit << 14);
    if (mode === 7) register = (register & ~(1 << 6)) | (bit << 6);
    samples[i] = register & 1 ? -1 : 1;
  }
  return samples;
}
