// Tour de la Mémoire (unsettling: half steps, tritones, a slow heartbeat).
import { arp, times } from './patterns.js';

export default {
  id: 'memory_tower',
  tempo: 84,
  channels: {
    1: `P12 V9
      B4:2 C5:2 | B4:4 F5:4 E5:2 | D5:2 C#5:4 A#4:4 | B4:1
      D5:2 Eb5:2 | D5:4 G#5:4 G5:2 | F#5:2 F5:4 C#5:4 | D5:1
      F#5:4 G5:4 F#5:4 C6:4 | B5:2. A#5:4 | G5:4 F#5:4 E5:4 A#4:4 | B4:1
      C5:4 B4:4 F5:4 E5:4 | D5:4 C#5:4 G5:4 F#5:4 | E5:4 D#5:4 A#4:4 C#5:4 | B4:1`,
    2: `P50 V5 ${[
      arp('B3', 'C4', 'B3', 'C4'), arp('B3', 'F4', 'B3', 'F4'), arp('A#3', 'C#4', 'A#3', 'C#4'), arp('B3', 'D4', 'B3', 'D4'),
      arp('D4', 'Eb4', 'D4', 'Eb4'), arp('D4', 'G#4', 'D4', 'G#4'), arp('C#4', 'F4', 'C#4', 'F4'), arp('D4', 'F#4', 'D4', 'F#4'),
      arp('F#3', 'C4', 'F#3', 'C4'), arp('A#3', 'B3', 'A#3', 'B3'), arp('E3', 'A#3', 'E3', 'A#3'), arp('B3', 'D4', 'B3', 'D4'),
      arp('C4', 'F4', 'C4', 'F4'), arp('C#4', 'G4', 'C#4', 'G4'), arp('D#4', 'A#3', 'D#4', 'A#3'), arp('B3', 'D4', 'B3', 'D4'),
    ].join(' ')}`,
    3: `W3 V9 B1:1 B1:1 G1:1 F#1:1 B1:1 G1:1 E1:2 F#1:2 B1:1 | B1:1 G1:1 E1:1 F#1:1 F1:1 E1:1 F#1:2 F1:2 B1:1`,
    4: `N15 V8 S-2 ${times('X13 X13 R:4 R:2', 16)}`,
  },
};
