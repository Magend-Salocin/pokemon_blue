// Jingles: the music stops, the jingle plays once, then the music resumes where it was.
import { chordArp, chordBass, chordHalves } from './patterns.js';

const jingle = (id, channels, tempo = 150) => ({ id, tempo, loop: false, channels });

export const JINGLES = [
  jingle('jingle_item', {
    1: 'P50 V12 C5:16 E5:16 G5:16 C6:16 E6:4 D6 E6 G6:4 | C6:2. R:4',
    2: 'P25 V8 E4:2 G4:2 | E4:2. R:4',
    3: 'W0 V10 C2:2 G2:2 | C2:2. R:4',
  }),
  jingle('jingle_key_item', {
    1: 'P50 V12 G4 C5 E5 G5 C6:4 B5 C6 | D6 C6 B5 A5 G5:4 E5:4 | C6:2. R:4',
    2: `P25 V8 ${chordHalves(['C', 'G'])} E4:2. R:4`,
    3: `W0 V10 ${chordBass(['C', 'G'])} C2:2. R:4`,
  }),
  jingle('jingle_badge', {
    1: 'P75 V12 C5:4 E5:4 G5:4 C6:4 | B5:4. A5 G5:2 | A5 C6 F6 C6 E6:4 D6:4 | C6:2. R:4',
    2: `P25 V8 ${chordHalves(['C', 'G', 'F'])} E4:2. R:4`,
    3: `W0 V11 ${chordBass(['C', 'G', 'F'])} C2:2. R:4`,
    4: 'N15 V9 S-2 X12:4 X5:4 X12:4 X5:4 X12:4 X5:4 X12:4 X5:4 X12:4 X5:4 X12:4 X5:4 X5:2 R:2',
  }, 130),
  jingle('jingle_heal', {
    1: 'P25 V10 E5 G5 C6:4 B5 G5 E5:4 | C5:2. R:4',
    2: 'P12 V7 G4:2 E4:2 | E4:2. R:4',
  }, 120),
  jingle('jingle_capture', {
    1: 'P50 V12 G5 E5 G5 C6 E6:4 C6:4 | D6 B5 G5 B5 D6:4 F6:4 | E6:2. R:4',
    2: `P25 V8 ${chordHalves(['C', 'G'])} E4:2. R:4`,
    3: `W0 V10 ${chordBass(['C', 'G'])} C2:2. R:4`,
  }),
  jingle('jingle_evolution', {
    1: 'P50 V12 C5 E5 G5 C6 E5 G5 C6 E6 | F5 A5 C6 F6 G5 B5 D6 G6 | E6:4 G6:4 C7:2 | C7:2. R:4',
    2: `P25 V7 ${chordArp(['C', 'F'])} E4:2 G4:2 E4:2. R:4`,
    3: `W0 V10 ${chordBass(['C', 'F', 'C'])} C2:2. R:4`,
  }, 130),
  jingle('jingle_level_up', {
    1: 'P50 V11 C5:16 E5:16 G5:16 C6:16 G5:16 C6:16 E6:16 G6:16 C7:4 R:4',
    2: 'P25 V7 E4:2 G4:4 R:4',
  }, 160),
];
