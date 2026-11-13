// Halte (E-flat major, warm and reassuring).
import { DRUMS, bass, halves, times } from './patterns.js';

export default {
  id: 'halte',
  tempo: 100,
  channels: {
    1: `P50 V10
      G4:4 Bb4 Eb5 G5:4 F5:4 | Eb5:4 C5 G4 C5:2 | Ab4:4 C5 Eb5 Ab5:4 G5:4 | F5:2. R:4
      G5:4 F5 Eb5 Bb4:4 Eb5:4 | G5:4 Eb5 C5 G5:2 | F5 Ab5 C6 Ab5 F5:4 D5:4 | Eb5:2. R:4
      C5:4 Eb5 Ab5 C6:2 | Bb5:4 F5 D5 Bb4:2 | D5:4 G5 Bb5 D6:2 | C6:2. R:4
      Ab5:4 Eb5 C5 Eb5:4 Ab5:4 | Bb5:4 F5 D5 F5:4 Bb5:4 | Ab5 F5 C5 F5 D5:4 Bb4:4 | Eb5:2. R:4`,
    2: `P25 V7 ${[
      halves('Bb3', 'Eb4'), halves('G3', 'C4'), halves('Ab3', 'C4'), halves('Bb3', 'D4'),
      halves('Bb3', 'Eb4'), halves('G3', 'C4'), halves('Ab3', 'D4'), 'G3:1',
      halves('Ab3', 'Eb4'), halves('Bb3', 'D4'), halves('G3', 'D4'), halves('G3', 'Eb4'),
      halves('Ab3', 'C4'), halves('Bb3', 'D4'), halves('Ab3', 'D4'), 'G3:1',
    ].join(' ')}`,
    3: `W0 V11 ${[
      bass('Eb2', 'Bb1'), bass('C2', 'G1'), bass('Ab1', 'Eb2'), bass('Bb1', 'F2'),
      bass('Eb2', 'Bb1'), bass('C2', 'G1'), 'F1:4 C2:4 Bb1:4 F2:4', bass('Eb2', 'Bb1'),
      bass('Ab1', 'Eb2'), bass('Bb1', 'F2'), bass('G1', 'D2'), bass('C2', 'G1'),
      bass('Ab1', 'Eb2'), bass('Bb1', 'F2'), 'F1:4 C2:4 Bb1:4 F2:4', bass('Eb2', 'Bb1'),
    ].join(' ')}`,
    4: `N15 V5 S-2 ${times(DRUMS.soft, 16)}`,
  },
};
