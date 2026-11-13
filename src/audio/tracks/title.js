// Title theme (D major). Opens with the game motif: up a fifth, down a step, up a third,
// down a step (D A G B A). The motif returns, varied, in `hometown` and `ending`.
import { DRUMS, bass, halves, times, walk } from './patterns.js';

export const MOTIF_INTERVALS = [7, -2, 4, -2];

export default {
  id: 'title',
  tempo: 110,
  channels: {
    1: `P50 V12
      D5:4 A5 G5 B5:4 A5:4 | F#5:4 E5 D5 B4:2 | G4:4 B4 D5 G5:4. F#5 | E5:2. R:4
      D5:4 A5 G5 B5:4 A5:4 | D6:4 C#6 B5 A5:2 | G5 F#5 E5 G5 A5:4 C#5:4 | D5:2. R:4
      B4:4 D5 G5 B5:4. A5 | A5:4 G5 F#5 E5:2 | F#5:4. A5 C#6:2 | B5:2. R:4
      G5:4 F#5 E5 D5:4 B4:4 | C#5:4 E5 A5 G5:4 E5:4 | F#5:4 D5 B4 C#5:4 E5:4 | D5:2. R:4`,
    2: `P25 V8 ${[
      halves('F#4', 'A4'), halves('D4', 'F#4'), halves('B3', 'D4'), halves('C#4', 'E4'),
      halves('F#4', 'A4'), halves('D4', 'F#4'), halves('G4', 'C#4'), 'F#4:1',
      halves('B3', 'D4'), halves('C#4', 'E4'), halves('C#4', 'A3'), halves('D4', 'F#4'),
      halves('D4', 'B3'), halves('E4', 'C#4'), halves('D4', 'C#4'), 'F#4:1',
    ].join(' ')}`,
    3: `W0 V12 ${[
      bass('D2', 'A2'), bass('B1', 'F#2'), bass('G1', 'D2'), bass('A1', 'E2'),
      bass('D2', 'A2'), bass('B1', 'F#2'), walk('E2', 'B2', 'A1', 'E2'), bass('D2', 'A2'),
      bass('G1', 'D2'), bass('A1', 'E2'), bass('F#1', 'C#2'), bass('B1', 'F#2'),
      bass('G1', 'D2'), bass('A1', 'E2'), walk('B1', 'F#2', 'A1', 'E2'), bass('D2', 'A2'),
    ].join(' ')}`,
    4: `N15 V9 S-2 ${times(DRUMS.calm, 16)}`,
  },
};
