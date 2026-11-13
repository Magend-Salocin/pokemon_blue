// Arena champion battle (G minor, heroic).
import { battleTrack } from './patterns.js';

export default battleTrack({
  id: 'battle_leader',
  tempo: 166,
  duty: 75,
  melody: {
    intro: 'G4:4 G4 G4 Bb4:4 D5:4 | F#5:2 D5:2 |',
    a: `G5:4 D5 G5 Bb5:4 A5 G5 | Eb6:4 Bb5 G5 Eb5:2 | F5:4 C6 A5 F5 A5 C6 F6 | D6:2 F#5:2
      G5 A5 Bb5 D6 G6:4 F6 Eb6 | D6 Eb6 D6 Bb5 G5:2 | C6 Bb5 A5 G5 A5 C6 Eb6 C6 | D6:2. R:4 |`,
    b: `Bb5:4. G5 Eb5:4 G5:4 | C6:4. A5 F5:4 A5:4 | D6 F6 D6 Bb5 F5:4 Bb5:4 | G5:2 D6:2
      Eb6 D6 C6 G5 Eb5:4 G5:4 | F#5 A5 D6 F#6 A6:4 F#6:4 | G6:4 Eb6 Bb5 G5:4 Bb5:4 | A5:4 F#5:4 D5:4 F#5:4 |`,
    c: `G5:16 G5:16 D5 G5:16 G5:16 D5 Bb5:4 A5:4 | G5:16 G5:16 D5 G5:16 G5:16 D5 F5:4 D5:4
      Eb5 G5 Bb5 Eb6 D6 Bb5 G5 Eb5 | F5 A5 C6 F6 Eb6 C6 A5 F5 | G5:4. Bb5 D6:4 G6:4 | Eb6:4. D6 C6:4 G5:4
      F#5:16 G5:16 A5:16 Bb5:16 C6:16 D6:16 Eb6:16 F#6:16 A6:2 | D6:4 A5:4 F#5:4 D5:4 |`,
  },
  chords: {
    intro: ['Gm', 'D'],
    a: ['Gm', 'Eb', 'F', 'D', 'Gm', 'Eb', 'Cm', 'D'],
    b: ['Eb', 'F', 'Bb', 'Gm', 'Cm', 'D', 'Eb', 'D'],
    c: ['Gm', 'Gm', 'Eb', 'F', 'Gm', 'Cm', 'D', 'D'],
  },
});
