// Forest (E minor, light and a little mysterious).
import { DRUMS, arp8, bass, times } from './patterns.js';

export default {
  id: 'forest',
  tempo: 108,
  channels: {
    1: `P25 V11
      E5 G5 B5 E6 D6:4 B5:4 | C6:4 G5 E5 C5:2 | D5 F#5 A5 D6 C6:4 A5:4 | B5:2. R:4
      E6:4 D6 B5 G5:4 E5:4 | C5 E5 G5 C6 B5:4 G5:4 | A5 C6 E6 C6 B5:4 D#5:4 | E5:2. R:4
      G5:4 E5 C5 E5:4 G5:4 | A5:4 F#5 D5 F#5:4 A5:4 | B5 D6 G6 D6 B5:4 G5:4 | E5:2. R:4
      C6:4 B5 A5 G5:4 E5:4 | D6:4 C6 B5 A5:4 F#5:4 | A5 G5 F#5 E5 D#5:4 F#5:4 | E5:2. R:4`,
    2: `P50 V6 ${[
      arp8('E3', 'G3', 'B3', 'G3'), arp8('C3', 'E3', 'G3', 'E3'), arp8('D3', 'F#3', 'A3', 'F#3'), arp8('B2', 'D3', 'F#3', 'D3'),
      arp8('E3', 'G3', 'B3', 'G3'), arp8('C3', 'E3', 'G3', 'E3'), 'A3 C4 E4 C4 B2 D#3 F#3 D#3', arp8('E3', 'G3', 'B3', 'G3'),
      arp8('C3', 'E3', 'G3', 'E3'), arp8('D3', 'F#3', 'A3', 'F#3'), arp8('G3', 'B3', 'D4', 'B3'), arp8('E3', 'G3', 'B3', 'G3'),
      arp8('C3', 'E3', 'G3', 'E3'), arp8('D3', 'F#3', 'A3', 'F#3'), 'A3 C4 E4 C4 B2 D#3 F#3 A3', arp8('E3', 'G3', 'B3', 'G3'),
    ].join(' ')}`,
    3: `W1 V11 ${[
      bass('E2', 'B1'), bass('C2', 'G1'), bass('D2', 'A1'), bass('B1', 'F#1'),
      bass('E2', 'B1'), bass('C2', 'G1'), 'A1:4 E2:4 B1:4 F#2:4', bass('E2', 'B1'),
      bass('C2', 'G1'), bass('D2', 'A1'), bass('G1', 'D2'), bass('E2', 'B1'),
      bass('C2', 'G1'), bass('D2', 'A1'), 'A1:4 E2:4 B1:4 F#2:4', bass('E2', 'B1'),
    ].join(' ')}`,
    4: `N15 V7 S-2 ${times(DRUMS.calm, 16)}`,
  },
};
