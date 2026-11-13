// Trainer battle (E minor).
import { battleTrack } from './patterns.js';

export default battleTrack({
  id: 'battle_trainer',
  tempo: 160,
  duty: 50,
  melody: {
    intro: 'E5:16 B4:16 E5:16 B4:16 E5:16 B4:16 E5:16 B4:16 F#5:16 B4:16 F#5:16 B4:16 G5:16 B4:16 A5:16 B4:16 | B5:4 R B4 B4:4 R:4 |',
    a: `E5 G5 B5 G5 E6:4 D6:4 | C6 B5 G5 E5 C6:4 G5:4 | D6 C6 A5 F#5 D6:4 A5:4 | B5:4 D#6:4 F#6:4 B5:4
      E6 D6 B5 G5 E5 G5 B5 E6 | C6 E6 G6 E6 C6:4 B5:4 | A5 C6 E6 C6 A5:4 F#5:4 | B5:2 D#6:2 |`,
    b: `G5:4. E5 C5:4 E5:4 | A5:4. F#5 D5:4 F#5:4 | B5 D6 G6 D6 B5 G5 D5 G5 | E5:2 G5:2
      C6:4 A5 C6 E6:4 C6:4 | D6:4 A5 D6 F#6:4 D6:4 | B5:16 A#5:16 B5:16 C#6:16 D#6:4 F#6:4 B5:4 | D#6:4 B5:4 F#5:4 D#5:4 |`,
    c: `E5:16 E5:16 B5 E5:16 E5:16 B5 G5:4 E5:4 | E5:16 E5:16 B5 E5:16 E5:16 C6 B5:4 G5:4
      C6:16 C6:16 G5 C6:16 C6:16 G5 E6:4 C6:4 | C6:16 C6:16 G5 C6:16 C6:16 A5 G5:4 E5:4
      A5 C6 E6 C6 A5 E5 C5 E5 | B4 D#5 F#5 B5 A5 F#5 D#5 B4 | E5:2. G5:4 | F#5:4 B5:4 D#6:4 F#6:4 |`,
  },
  chords: {
    intro: ['Em', 'B'],
    a: ['Em', 'C', 'D', 'B', 'Em', 'C', 'Am', 'B'],
    b: ['C', 'D', 'G', 'Em', 'Am', 'D', 'B', 'B'],
    c: ['Em', 'Em', 'C', 'C', 'Am', 'B', 'Em', 'B'],
  },
});
