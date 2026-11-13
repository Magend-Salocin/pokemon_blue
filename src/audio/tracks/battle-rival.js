// Rival battle (B minor, cheeky and fast).
import { battleTrack } from './patterns.js';

export default battleTrack({
  id: 'battle_rival',
  tempo: 164,
  duty: 25,
  melody: {
    intro: 'B4 D5 F#5 B5 A5 F#5 D5 A4 | F#4:4 A#4:4 C#5:4 F#5:4 |',
    a: `B5:4 F#5 D5 B5 C#6 D6:4 | B5 G5 D5 G5 B5:4 D6:4 | C#6:4 A5 E5 C#6 D6 E6:4 | F#6:4 C#6:4 A#5:4 F#5:4
      B5 D6 F#6 D6 B5:4 A5 B5 | G5:4 B5 D6 G6:4 F#6 E6 | E6 D6 B5 G5 E5 G5 B5 E6 | C#6:2 F#5:2 |`,
    b: `D6:4. B5 G5:4 B5:4 | E6:4. C#6 A5:4 C#6:4 | F#6 D6 A5 D6 F#6:4 A6:4 | F#6:2 D6:2
      G5 B5 E6 B5 G5:4 E5:4 | F#5 A#5 C#6 F#6 E6:4 C#6:4 | D6 B5 G5 B5 D6 G6 F#6 E6 | F#6:4 C#6:4 A#5:4 C#6:4 |`,
    c: `B5:16 B5:16 F#5 B5:16 B5:16 F#5 D6:4 C#6:4 | B5:16 B5:16 F#5 B5:16 B5:16 F#5 A5:4 F#5:4
      G5:16 G5:16 D5 G5:16 G5:16 D5 B5:4 A5:4 | G5:16 G5:16 D5 G5:16 G5:16 D5 F#5:4 D5:4
      E5 G5 B5 E6 D6 B5 G5 E5 | F#5 A#5 C#6 F#6 E6 C#6 A#5 F#5 | B5:2. D6:4 | C#6:4 F#5:4 A#5:4 C#6:4 |`,
  },
  chords: {
    intro: ['Bm', 'F#'],
    a: ['Bm', 'G', 'A', 'F#', 'Bm', 'G', 'Em', 'F#'],
    b: ['G', 'A', 'D', 'Bm', 'Em', 'F#', 'G', 'F#'],
    c: ['Bm', 'Bm', 'G', 'G', 'Em', 'F#', 'Bm', 'F#'],
  },
});
