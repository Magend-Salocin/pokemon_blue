// Wild battle (A minor). 2-bar intro, then A B A C (32 bars) loops from « @ ».
import { DRUMS, chordArp, chordDrive, times } from './patterns.js';

const INTRO = 'A5:16 G#5:16 G5:16 F#5:16 F5:16 E5:16 D#5:16 D5:16 C#5:16 C5:16 B4:16 A#4:16 A4:4 | E4 E4 R E4 E5:4 R:4 |';
const A = `A4 C5 E5 A5 G5:4 E5:4 | F5 E5 C5 A4 F5:4 A5:4 | G5 F5 D5 B4 G5:4 D6:4 | B5:4 G#5:4 E5:4 B4:4
  A5 B5 C6 A5 E6:4 C6:4 | D6 C6 A5 F5 C6:4 A5:4 | F5 E5 D5 E5 F5 A5 D6 F5 | E5:4 G#5:4 B5:4 E6:4 |`;
const B = `C6:4. A5 F5:4 C5:4 | D6:4. B5 G5:4 D5:4 | E5 G5 B5 E6 D6 B5 G5 E5 | A5:2 C6:2
  F5 A5 D6 A5 F5 D5 A4 D5 | G5 B5 D6 B5 G5 D5 B4 D5 | C6:4 B5 C6 E6:4 C6:4 | B5:4 G#5 E5 B4:2 |`;
const C = `A5:16 A5:16 E5 A5:16 A5:16 E5 C6:4 B5:4 | A5:16 A5:16 E5 A5:16 A5:16 E5 G5:4 E5:4
  F5:16 F5:16 C5 F5:16 F5:16 C5 A5:4 G5:4 | F5:16 F5:16 C5 F5:16 F5:16 C5 E5:4 C5:4
  D5 F5 A5 D6 C6 A5 F5 D5 | E5 G#5 B5 E6 D6 B5 G#5 E5 | A5:2. C6:4 | B5:4 E5:4 G#5:4 B5:4 |`;

const PROGRESSION = {
  intro: ['E', 'E'],
  a: ['Am', 'F', 'G', 'E', 'Am', 'F', 'Dm', 'E'],
  b: ['F', 'G', 'Em', 'Am', 'Dm', 'G', 'C', 'E'],
  c: ['Am', 'Am', 'F', 'F', 'Dm', 'E', 'Am', 'E'],
};
const body = (render) => [PROGRESSION.a, PROGRESSION.b, PROGRESSION.a, PROGRESSION.c].map(render).join(' ');
const drums = `${DRUMS.battle} ${times(DRUMS.battle, 6)} ${DRUMS.fill}`;

export default {
  id: 'battle_wild',
  tempo: 160,
  channels: {
    1: `P50 V12 ${INTRO} @ ${A} ${B} ${A} ${C}`,
    2: `P25 V7 ${chordArp(PROGRESSION.intro)} @ ${body(chordArp)}`,
    3: `W2 V11 ${chordDrive(PROGRESSION.intro)} @ ${body(chordDrive)}`,
    4: `N15 V10 S-2 X12:4 X12:4 X12:4 X5:4 ${DRUMS.fill} @ ${times(drums, 4)}`,
  },
};
