// Ligue and legendary battles (C minor, dramatic).
import { battleTrack } from './patterns.js';

export default battleTrack({
  id: 'battle_final',
  tempo: 170,
  duty: 75,
  wave: 1,
  melody: {
    intro: 'C6:16 G5:16 Eb5:16 C5:16 C6:16 G5:16 Eb5:16 C5:16 Db6:16 Ab5:16 F5:16 Db5:16 Db6:16 Ab5:16 F5:16 Db5:16 | B5:2 G5:2 |',
    a: `C5 Eb5 G5 C6 Bb5:4 G5:4 | Ab5 G5 Eb5 C5 Ab5:4 C6:4 | Bb5 Ab5 F5 D5 Bb5:4 F6:4 | D6:4 B5:4 G5:4 D5:4
      C6 D6 Eb6 C6 G6:4 Eb6:4 | F6 Eb6 C6 Ab5 F5:4 C6:4 | Db6 C6 Ab5 F5 Db6:4 F6:4 | D6:4 B5:4 G5:4 F6:4 |`,
    b: `Eb6:4. C6 Ab5:4 Eb5:4 | F6:4. D6 Bb5:4 F5:4 | G5 Bb5 Eb6 G6 F6 Eb6 Bb5 G5 | C6:2 Eb6:2
      Ab5 C6 F6 C6 Ab5 F5 C5 F5 | G5 B5 D6 G6 F6 D6 B5 G5 | Ab5:4 C6 Eb6 Ab6:4 Eb6:4 | D6:4 B5 G5 D5:2 |`,
    c: `C6:16 C6:16 G5 C6:16 C6:16 G5 Eb6:4 D6:4 | C6:16 C6:16 G5 C6:16 C6:16 G5 Bb5:4 G5:4
      Ab5:16 Ab5:16 Eb5 Ab5:16 Ab5:16 Eb5 C6:4 Bb5:4 | Ab5:16 Ab5:16 Eb5 Ab5:16 Ab5:16 Eb5 G5:4 Eb5:4
      F5 Ab5 C6 F6 Eb6 C6 Ab5 F5 | G5 B5 D6 G6 F6 D6 B5 G5 | C6:2. Eb6:4 | D6:4 G5:4 B5:4 D6:4 |`,
  },
  chords: {
    intro: ['Cm', 'G'],
    a: ['Cm', 'Ab', 'Bb', 'G', 'Cm', 'Fm', 'Db', 'G'],
    b: ['Ab', 'Bb', 'Eb', 'Cm', 'Fm', 'G', 'Ab', 'G'],
    c: ['Cm', 'Cm', 'Ab', 'Ab', 'Fm', 'G', 'Cm', 'G'],
  },
});
