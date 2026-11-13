// Route 2 (A minor, adventurous).
import { DRUMS, arp8, bass, times } from './patterns.js';

export default {
  id: 'route_2',
  tempo: 120,
  channels: {
    1: `P25 V12
      A4 C5 E5 A5:4. G5 E5 | F5:4 C5 A4 F4:2 | E5 G5 C6 B5 C6:4 G5:4 | B4:4 D5 G5 B5:2
      A5 E5 C5 E5 A5:4 B5:4 | C6:4 A5 F5 C6:4 A5:4 | F5 E5 D5 F5 E5:4 G#5:4 | A5:2. R:4
      C6:4 A5 F5 C6:4. F5 | D6:4 B5 G5 D6:4. G5 | B5 G5 E5 G5 B5:4 E6:4 | C6:2. R:4
      F5 A5 D6 A5 F5:4 D5:4 | G5 B5 D6 B5 G5:4 B4:4 | E5:4 G#5:4 B5:4 D6:4 | A5:2. R:4`,
    2: `P50 V7 ${[
      arp8('A3', 'C4', 'E4', 'C4'), arp8('F3', 'A3', 'C4', 'A3'), arp8('C4', 'E4', 'G4', 'E4'), arp8('G3', 'B3', 'D4', 'B3'),
      arp8('A3', 'C4', 'E4', 'C4'), arp8('F3', 'A3', 'C4', 'A3'), 'D4 F4 A4 F4 E4 G#4 B4 G#4', arp8('A3', 'C4', 'E4', 'C4'),
      arp8('F3', 'A3', 'C4', 'A3'), arp8('G3', 'B3', 'D4', 'B3'), arp8('E3', 'G3', 'B3', 'G3'), arp8('A3', 'C4', 'E4', 'C4'),
      arp8('D3', 'F3', 'A3', 'F3'), arp8('G3', 'B3', 'D4', 'B3'), arp8('E3', 'G#3', 'B3', 'D4'), arp8('A3', 'C4', 'E4', 'C4'),
    ].join(' ')}`,
    3: `W2 V10 ${[
      bass('A1', 'E2'), bass('F1', 'C2'), bass('C2', 'G2'), bass('G1', 'D2'),
      bass('A1', 'E2'), bass('F1', 'C2'), 'D2:4 A2:4 E2:4 B1:4', bass('A1', 'E2'),
      bass('F1', 'C2'), bass('G1', 'D2'), bass('E2', 'B1'), bass('A1', 'E2'),
      bass('D2', 'A1'), bass('G1', 'D2'), bass('E2', 'B1'), bass('A1', 'E2'),
    ].join(' ')}`,
    4: `N15 V9 S-2 ${times(DRUMS.march, 14)} ${DRUMS.fill} ${DRUMS.march}`,
  },
};
