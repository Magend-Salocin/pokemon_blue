// Route 1 (C major, cheerful, bouncing notes).
import { DRUMS, arp, bass, times } from './patterns.js';

export default {
  id: 'route_1',
  tempo: 124,
  channels: {
    1: `P50 V12 S-3
      C5 E5 G5 E5 C6:4 G5:4 | A5 G5 E5 C5 A4:2 | F5 A5 C6 A5 F5:4 E5 F5 | G5:4 D5:4 B4:4 G4:4
      C5 E5 G5 E5 C6:4 E6:4 | D6 C6 A5 E5 A5:2 | F5 E5 D5 F5 G5 F5 E5 D5 | C5:4 G4:4 C5:2
      A5:4 C6 A5 F5:4 A5:4 | G5:4 B5 G5 D5:4 G5:4 | E5 G5 B5 G5 E5:4 G5:4 | A5:2. R:4
      C6:4 A5 F5 C5:4 F5:4 | D6:4 B5 G5 D5:4 G5:4 | E5 A5 C6 A5 B5 G5 D5 B4 | C5:2. R:4`,
    2: `P12 V6 ${[
      arp('C4', 'E4', 'G4', 'E4'), arp('A3', 'C4', 'E4', 'C4'), arp('F3', 'A3', 'C4', 'A3'), arp('G3', 'B3', 'D4', 'B3'),
      arp('C4', 'E4', 'G4', 'E4'), arp('A3', 'C4', 'E4', 'C4'), 'D4:16 F4:16 A4:16 F4:16 D4:16 F4:16 A4:16 F4:16 G3:16 B3:16 D4:16 B3:16 G3:16 B3:16 D4:16 B3:16', arp('C4', 'E4', 'G4', 'E4'),
      arp('F3', 'A3', 'C4', 'A3'), arp('G3', 'B3', 'D4', 'B3'), arp('E3', 'G3', 'B3', 'G3'), arp('A3', 'C4', 'E4', 'C4'),
      arp('F3', 'A3', 'C4', 'A3'), arp('G3', 'B3', 'D4', 'B3'), 'A3:16 C4:16 E4:16 C4:16 A3:16 C4:16 E4:16 C4:16 G3:16 B3:16 D4:16 B3:16 G3:16 B3:16 D4:16 B3:16', arp('C4', 'E4', 'G4', 'E4'),
    ].join(' ')}`,
    3: `W0 V12 ${[
      bass('C2', 'G2'), bass('A1', 'E2'), bass('F1', 'C2'), bass('G1', 'D2'),
      bass('C2', 'G2'), bass('A1', 'E2'), 'D2:4 A2:4 G1:4 D2:4', bass('C2', 'G2'),
      bass('F1', 'C2'), bass('G1', 'D2'), bass('E2', 'B1'), bass('A1', 'E2'),
      bass('F1', 'C2'), bass('G1', 'D2'), 'A1:4 E2:4 G1:4 D2:4', bass('C2', 'G2'),
    ].join(' ')}`,
    4: `N15 V9 S-2 ${times(DRUMS.march, 16)}`,
  },
};
