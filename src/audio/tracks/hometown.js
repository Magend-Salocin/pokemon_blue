// Hameau-de-Lys (G major, gentle). Bars 1 and 5 restate the game motif, slower.
import { DRUMS, arp8, bass, times } from './patterns.js';

export default {
  id: 'hometown',
  tempo: 100,
  channels: {
    1: `P25 V11
      G4:4 D5 C5 E5:4 D5:4 | B4:4 A4 G4 E4:2 | C5:4. E5 G5:4 E5:4 | D5:2. R:4
      G4:4 D5 C5 E5:4 G5:4 | F#5:4 E5 D5 B4:2 | C5 E5 A5 G5 F#5:4 A4:4 | G4:2. R:4
      E5:4 G5 E5 C5:2 | D5:4 F#5 A5 D5:2 | B4:4. D5 F#5:4 D5:4 | E5:2. R:4
      G5:4 E5 C5 E5:4 G5:4 | A5:4 F#5 D5 F#5:4 A5:4 | G5:4 E5 B4 A4:4 C5:4 | B4:2. R:4`,
    2: `P12 V7 ${[
      arp8('G3', 'B3', 'D4', 'B3'), arp8('E3', 'G3', 'B3', 'G3'), arp8('C3', 'E3', 'G3', 'E3'), arp8('D3', 'F#3', 'A3', 'F#3'),
      arp8('G3', 'B3', 'D4', 'B3'), arp8('E3', 'G3', 'B3', 'G3'), 'A3 C4 E4 C4 D3 F#3 A3 F#3', arp8('G3', 'B3', 'D4', 'B3'),
      arp8('C3', 'E3', 'G3', 'E3'), arp8('D3', 'F#3', 'A3', 'F#3'), arp8('B2', 'D3', 'F#3', 'D3'), arp8('E3', 'G3', 'B3', 'G3'),
      arp8('C3', 'E3', 'G3', 'E3'), arp8('D3', 'F#3', 'A3', 'F#3'), 'E3 G3 B3 G3 D3 F#3 A3 F#3', arp8('G3', 'B3', 'D4', 'B3'),
    ].join(' ')}`,
    3: `W1 V11 ${[
      bass('G2', 'D2'), bass('E2', 'B1'), bass('C2', 'G1'), bass('D2', 'A1'),
      bass('G2', 'D2'), bass('E2', 'B1'), 'A1:4 E2:4 D2:4 A1:4', bass('G2', 'D2'),
      bass('C2', 'G1'), bass('D2', 'A1'), bass('B1', 'F#1'), bass('E2', 'B1'),
      bass('C2', 'G1'), bass('D2', 'A1'), 'E2:4 B1:4 D2:4 A1:4', bass('G2', 'D2'),
    ].join(' ')}`,
    4: `N15 V6 S-2 ${times(DRUMS.soft, 16)}`,
  },
};
