// Introduction by the professor (F major, thoughtful).
import { DRUMS, bass, halves, times } from './patterns.js';

export default {
  id: 'intro_professor',
  tempo: 96,
  channels: {
    1: `P50 V10
      A4:4 C5 F5 E5:4 C5:4 | D5:2 F5:4 A5:4 | G5:4. F5 D5:4 Bb4:4 | C5:2. R:4
      A4:4 C5 F5 A5:4 G5:4 | E5:4 C5 E5 A5:2 | Bb5:4 A5 G5 E5:4 G5:4 | F5:2. R:4
      D5:4 F5 Bb5 A5:4 F5:4 | E5:4 G5 C6 Bb5:4 G5:4 | C5:4. E5 A5:4 G5:4 | F5:2. R:4
      G5:4 Bb5 A5 G5:4 D5:4 | E5:4 G5 F5 E5:4 C5:4 | D5:4 F5 Bb5 G5:4 E5:4 | F5:2. R:4`,
    2: `P25 V7 ${[
      halves('A3', 'C4'), halves('F3', 'A3'), halves('D4', 'F3'), halves('E3', 'G3'),
      halves('A3', 'C4'), halves('C4', 'E4'), halves('D4', 'E4'), 'A3:1',
      halves('D4', 'F4'), halves('E4', 'G4'), halves('C4', 'E4'), halves('D4', 'F4'),
      halves('Bb3', 'D4'), halves('E4', 'G4'), halves('D4', 'E4'), 'A3:1',
    ].join(' ')}`,
    3: `W0 V11 ${[
      bass('F2', 'C2'), bass('D2', 'A1'), bass('Bb1', 'F1'), bass('C2', 'G1'),
      bass('F2', 'C2'), bass('A1', 'E2'), 'Bb1:4 F2:4 C2:4 G1:4', bass('F2', 'C2'),
      bass('Bb1', 'F1'), bass('C2', 'G1'), bass('A1', 'E2'), bass('D2', 'A1'),
      bass('G1', 'D2'), bass('C2', 'G1'), 'Bb1:4 F2:4 C2:4 G1:4', bass('F2', 'C2'),
    ].join(' ')}`,
    4: `N15 V5 S-2 ${times(DRUMS.soft, 16)}`,
  },
};
