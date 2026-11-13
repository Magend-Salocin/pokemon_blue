// Victory fanfares (C major, short, no loop).
import { chordBass, chordHalves } from './patterns.js';

const ENDING_DRUMS = 'X12:4 X5:4 X12:4 X5:4';

export const victoryWild = {
  id: 'victory_wild',
  tempo: 140,
  loop: false,
  channels: {
    1: 'P50 V12 C5 E5 G5 C6:2 G5 | A5 F5 C6 A5 G5:2 | E5 G5 C6 E6 D6:4 B5:4 | C6:2. R:4',
    2: `P25 V8 ${chordHalves(['C', 'F', 'G'])} E4:2. R:4`,
    3: `W0 V11 ${chordBass(['C', 'F', 'G'])} C2:2. R:4`,
    4: `N15 V9 S-2 ${ENDING_DRUMS} ${ENDING_DRUMS} ${ENDING_DRUMS} X5:2 R:2`,
  },
};

export const victoryTrainer = {
  id: 'victory_trainer',
  tempo: 140,
  loop: false,
  channels: {
    1: `P75 V12 G4:16 C5:16 E5:16 G5:16 C6:2. | B5 A5 G5 F5 E5:2 | F5 A5 C6 F6 E6:4 C6:4
      D6 B5 G5 B5 D6:2 | E6:4 C6 G5 E6:4 G6:4 | C6:2. R:4`,
    2: `P25 V8 ${chordHalves(['C', 'C', 'F', 'G', 'C'])} E4:2. R:4`,
    3: `W0 V11 ${chordBass(['C', 'C', 'F', 'G', 'C'])} C2:2. R:4`,
    4: `N15 V9 S-2 ${Array(5).fill(ENDING_DRUMS).join(' ')} X5:2 R:2`,
  },
};
