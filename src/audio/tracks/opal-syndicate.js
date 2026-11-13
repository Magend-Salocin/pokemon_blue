// Syndicat Opale (C minor, heavy march).
import { DRUMS, drive, times } from './patterns.js';

const offbeat = (note) => `R ${note} R ${note} R ${note} R ${note}`;

export default {
  id: 'opal_syndicate',
  tempo: 120,
  channels: {
    1: `P75 V12
      C5:4 C5 Eb5 G5:4 F5 Eb5 | D5:4 Eb5 D5 C5:2 | Ab4:4 C5 Eb5 Ab5:4 G5 F5 | G5:2 B4:2
      C5:4 C5 Eb5 G5:4 Bb5 Ab5 | G5:4 F5 Ab5 C6:2 | Ab5 G5 F5 Eb5 D5:4 B4:4 | C5:2. R:4
      F5:4 Ab5 C6 F6:4 Eb6 Db6 | C6:4 G5 Eb5 C5:2 | Ab5:4 C6 Ab5 Eb5:4 F5 G5 | G5:2. R:4
      F5 Ab5 C6 Ab5 F5:4 Eb5:4 | Eb5 G5 C6 G5 Eb5:4 D5:4 | Db5:4 F5:4 B4:4 D5:4 | C5:2. R:4`,
    2: `P50 V8 ${[
      offbeat('Eb4'), offbeat('G4'), offbeat('C4'), offbeat('D4'),
      offbeat('Eb4'), offbeat('F4'), 'R C4 R C4 R B3 R B3', offbeat('Eb4'),
      offbeat('Ab4'), offbeat('G4'), offbeat('Eb4'), offbeat('D4'),
      offbeat('Ab4'), offbeat('G4'), 'R F4 R F4 R D4 R D4', offbeat('Eb4'),
    ].join(' ')}`,
    3: `W2 V11 ${[
      drive('C2', 'G2'), drive('C2', 'G2'), drive('Ab1', 'Eb2'), drive('G1', 'D2'),
      drive('C2', 'G2'), drive('F1', 'C2'), 'Ab1 Ab1 Eb2 Ab1 G1 G1 D2 G1', drive('C2', 'G2'),
      drive('F1', 'C2'), drive('C2', 'G2'), drive('Ab1', 'Eb2'), drive('G1', 'D2'),
      drive('F1', 'C2'), drive('C2', 'G2'), 'Db2 Db2 Ab2 Db2 G1 G1 D2 G1', drive('C2', 'G2'),
    ].join(' ')}`,
    4: `N15 V10 S-2 ${times(DRUMS.march, 15)} ${DRUMS.fill}`,
  },
};
