// Ending theme (D major). The game motif opens it, returns a fifth higher (bar 5) and,
// stretched out, in the coda.
import { DRUMS, chordBass, chordHalves, times } from './patterns.js';

const CHORDS = [
  'D', 'Bm', 'G', 'A', 'A', 'F#m', 'G', 'D',
  'G', 'A', 'F#m', 'Bm', 'G', 'A', 'A', 'D',
  'D', 'G', 'A', 'D',
];

export default {
  id: 'ending',
  tempo: 96,
  channels: {
    1: `P50 V11
      D5:4 A5 G5 B5:4 A5:4 | F#5:4 D5 B4 D5:2 | B4:4 D5 G5 B5:4. A5 | A5:2. R:4
      A4:4 E5 D5 F#5:4 E5:4 | C#5:4 A4 F#4 C#5:2 | B4 D5 G5 B5 A5:4 C#6:4 | D6:2. R:4
      B5:4 G5 D5 G5:2 | C#6:4 A5 E5 A5:2 | A5:4. F#5 C#5:4 F#5:4 | D5:2. R:4
      G5:4 B5 D6 G6:4. F#6 | E6:4 C#6 A5 E6:4. D6 | C#6 B5 A5 G5 E5:4 C#5:4 | D5:2. R:4
      D5:2 A5:2 | G5:2 B5:2 | A5:1 | D6:2. R:4`,
    2: `P25 V7 ${chordHalves(CHORDS)}`,
    3: `W1 V11 ${chordBass(CHORDS)}`,
    4: `N15 V6 S-2 ${times(DRUMS.calm, 16)} ${times(DRUMS.soft, 4)}`,
  },
};
