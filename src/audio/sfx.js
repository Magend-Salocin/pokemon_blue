// Sound effects, written in the track format (docs/AUDIO_FORMAT.md). An effect borrows the
// channels it uses; the music keeps playing on the others. Cries come from cries.js.

const sfx = (id, channels, tempo = 240) => ({ id, tempo, loop: false, channels });

export const SFX = [
  sfx('cursor', { 1: 'P50 V9 S-1 C6:32' }),
  sfx('confirm', { 1: 'P50 V11 E5:32 A5:16' }),
  sfx('cancel', { 1: 'P50 V11 A5:32 E5:16' }),
  sfx('bump', { 1: 'P25 V12 S-2 C3:16', 4: 'V8 S-2 X12:16' }),
  sfx('door', { 4: 'V12 S-1 X6:8 X9:8' }),
  sfx('stairs', { 1: 'P50 V10 S-1 G5:32 E5:32 C5:32 G4:32' }),
  sfx('teleporter', { 1: 'P50 V10 H24 C4:16 H-24 C6:16 H24 C4:16 H-24 C6:16' }),
  sfx('jump', { 1: 'P50 V11 S-1 H12 C5:8' }),
  sfx('grass', { 4: 'V5 S-1 X1:16' }),
  sfx('surf', { 4: 'V7 S+1 X3:8 S-1 X3:8' }),
  sfx('cut', { 1: 'P12 V10 H-12 C6:16', 4: 'V12 S-2 X1:16' }),
  sfx('push', { 4: 'V13 S-1 X13:4' }),
  sfx('fly', { 1: 'P25 V9 H7 G4:8 C5:8 E5:8', 4: 'V5 S-1 X2:8 X2:8 X2:8' }),
  sfx('exclamation', { 1: 'P50 V12 E6:32 R:32 E6:16' }),
  sfx('buy', { 1: 'P50 V11 C6:32 G6:16 R:32' }),
  sfx('save', { 1: 'P50 V10 C5:16 E5:16 G5:16 C6:8' }),
  sfx('capsule_throw', { 1: 'P12 V10 H-12 C6:8' }),
  sfx('capsule_open', { 1: 'P25 V12 H12 C5:16 S-2 G5:16', 4: 'V10 S-2 X3:8' }),
  sfx('capsule_shake', { 1: 'P50 V8 S-2 A3:32 R:32 R:16', 4: 'V9 S-2 X7:16 R:16' }),
  sfx('hit', { 1: 'P50 V10 S-2 H-12 G3:16 R:16', 4: 'V15 S-2 X5:8' }),
  sfx('hit_super', { 1: 'P75 V12 H-24 C4:8 R:8', 4: 'V15 S-1 X4:8 X6:8' }),
  sfx('hit_weak', { 4: 'V10 S-3 X8:8' }),
  sfx('faint', { 1: 'P50 V12 S-1 H-24 C5:4' }),
  sfx('stat_up', { 1: 'P25 V10 C5:32 E5:32 G5:32 C6:32 E6:32 G6:32 R:16' }),
  sfx('stat_down', { 1: 'P25 V10 G6:32 E6:32 C6:32 G5:32 E5:32 C5:32 R:16' }),
  sfx('run', { 1: 'P50 V10 S-1 C4:16 E4:16 G4:16 R:16', 4: 'V6 S-1 X2:8 X2:8' }),
  sfx('exp', { 1: 'P25 V8 [C6:32 E6:32]x4' }),
  sfx('item_pickup', { 1: 'P50 V10 G5:32 C6:16 R:32' }),
];

export const SFX_BY_ID = Object.fromEntries(SFX.map((effect) => [effect.id, effect]));
