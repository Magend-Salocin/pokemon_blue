// Caves (D minor, sparse, water drops on the noise channel).
import { halves, times } from './patterns.js';

export default {
  id: 'cave',
  tempo: 90,
  channels: {
    1: `P12 V9 S-1
      D5:2 R:4 A4:4 | F5:4. E5 D5:2 | Bb4:2. R:4 | A4:4 C#5:4 E5:2
      D5:2 R:4 F5:4 | G5:4. F5 D5:2 | F5:4 D5:4 E5:4 C#5:4 | D5:1
      A5:2 R:4 F5:4 | G5:4. E5 C5:2 | Bb4:2 D5:4 G5:4 | E5:2. R:4
      F5:4 E5 D5 A4:2 | Bb4:4 D5:4 F5:2 | G5:4 Bb5:4 A5:4 C#5:4 | D5:1`,
    2: `P25 V5 ${[
      halves('F3', 'A3'), halves('F3', 'A3'), halves('D3', 'F3'), halves('C#3', 'E3'),
      halves('F3', 'A3'), halves('Bb3', 'D4'), halves('D3', 'E3'), 'F3:1',
      halves('A3', 'C4'), halves('G3', 'E3'), halves('Bb3', 'D4'), halves('C#3', 'E3'),
      halves('F3', 'A3'), halves('D3', 'F3'), halves('Bb3', 'C#4'), 'F3:1',
    ].join(' ')}`,
    3: `W3 V10 D2:1 D2:1 Bb1:1 A1:1 D2:1 G1:1 Bb1:2 A1:2 D2:1 F1:1 C2:1 G1:1 A1:1 D2:1 Bb1:1 G1:2 A1:2 D2:1`,
    4: `N15 V6 S-1 ${times('R:2 X0:16 R:16 R:8 R:4', 16)}`,
  },
};
