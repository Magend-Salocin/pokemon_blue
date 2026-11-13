// Harbour town (B-flat major, swaying dotted rhythm).
import { DRUMS, arp8, bass, times } from './patterns.js';

export default {
  id: 'town_2',
  tempo: 112,
  channels: {
    1: `P25 V11
      F5:4. D5 Bb4:4 D5:4 | G5:4. F5 D5:2 | Eb5:4. G5 Bb5:4 G5:4 | F5:2. R:4
      F5:4. D5 F5:4 Bb5:4 | A5:4. G5 D5:2 | C5:4. Eb5 G5:4 A4:4 | Bb4:2. R:4
      G5:4. Bb5 Eb6:4 Bb5:4 | A5:4. F5 C5:2 | D5:4. F5 A5:4 F5:4 | G5:2. R:4
      Bb5:4. G5 Eb5:4 G5:4 | C6:4. A5 F5:4 Eb5:4 | D5:4. G5 F5:4 A4:4 | Bb4:2. R:4`,
    2: `P12 V6 ${[
      arp8('Bb3', 'D4', 'F4', 'D4'), arp8('G3', 'Bb3', 'D4', 'Bb3'), arp8('Eb3', 'G3', 'Bb3', 'G3'), arp8('F3', 'A3', 'C4', 'A3'),
      arp8('Bb3', 'D4', 'F4', 'D4'), arp8('G3', 'Bb3', 'D4', 'Bb3'), 'C4 Eb4 G4 Eb4 F3 A3 C4 A3', arp8('Bb3', 'D4', 'F4', 'D4'),
      arp8('Eb3', 'G3', 'Bb3', 'G3'), arp8('F3', 'A3', 'C4', 'A3'), arp8('D3', 'F3', 'A3', 'F3'), arp8('G3', 'Bb3', 'D4', 'Bb3'),
      arp8('Eb3', 'G3', 'Bb3', 'G3'), arp8('F3', 'A3', 'C4', 'A3'), 'G3 Bb3 D4 Bb3 F3 A3 C4 A3', arp8('Bb3', 'D4', 'F4', 'D4'),
    ].join(' ')}`,
    3: `W1 V11 ${[
      bass('Bb1', 'F2'), bass('G1', 'D2'), bass('Eb2', 'Bb1'), bass('F1', 'C2'),
      bass('Bb1', 'F2'), bass('G1', 'D2'), 'C2:4 G2:4 F1:4 C2:4', bass('Bb1', 'F2'),
      bass('Eb2', 'Bb1'), bass('F1', 'C2'), bass('D2', 'A1'), bass('G1', 'D2'),
      bass('Eb2', 'Bb1'), bass('F1', 'C2'), 'G1:4 D2:4 F1:4 C2:4', bass('Bb1', 'F2'),
    ].join(' ')}`,
    4: `N15 V7 S-2 ${times(DRUMS.sea, 16)}`,
  },
};
