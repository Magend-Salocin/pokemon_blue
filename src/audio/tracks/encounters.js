// Short loops played when a trainer spots the player, until the battle starts.
import { DRUMS, chordArp, chordDrive, times } from './patterns.js';

const encounter = (id, melody, chords, duty) => ({
  id,
  tempo: 140,
  channels: {
    1: `P${duty} V12 ${melody}`,
    2: `P25 V7 ${chordArp(chords)}`,
    3: `W2 V11 ${chordDrive(chords)}`,
    4: `N15 V9 S-2 ${times(DRUMS.march, 4)}`,
  },
});

export const ENCOUNTERS = [
  encounter('encounter_trainer', 'E5 E5 R E5 G5 E5 B5:4 | A5 G5 F#5 G5 E5:2 | E5 E5 R E5 G5 B5 E6:4 | D#6:4 B5:4 F#5:4 D#5:4', ['Em', 'C', 'Em', 'B'], 50),
  encounter('encounter_villain', 'C5:4 R C5 Eb5:4 D5 B4 | C5:2 G4:2 | C5:4 R C5 Eb5:4 F5 G5 | Ab5:4 G5:4 F5:4 D5:4', ['Cm', 'Cm', 'Cm', 'G'], 75),
  encounter('encounter_rival', 'B4 D5 F#5 B5 A5:4 F#5:4 | G5 F#5 E5 D5 C#5:2 | B4 D5 F#5 B5 D6:4 B5:4 | C#6:4 A#5:4 F#5:4 C#5:4', ['Bm', 'Em', 'Bm', 'F#'], 25),
];
