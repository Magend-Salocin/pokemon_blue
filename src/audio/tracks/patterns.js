// Accompaniment helpers for writing tracks. Each helper returns the text of one 4/4 bar
// (96 ticks). Melodies are written note by note in the track files.

/** Root and fifth: quarter, two eighths, two quarters. */
export const bass = (root, fifth) => `${root}:4 ${fifth} ${root} ${root}:4 ${fifth}:4`;

/** Driving eighth-note bass for battles. */
export const drive = (root, fifth) => `${root} ${root} ${fifth} ${root} ${root} ${fifth} ${root} ${fifth}`;

/** Four quarters (walking line). */
export const walk = (a, b, c, d) => `${a}:4 ${b}:4 ${c}:4 ${d}:4`;

/** Two half notes. */
export const halves = (a, b) => `${a}:2 ${b}:2`;

/** Sixteenth-note arpeggio over the bar (4 notes repeated 4 times). */
export const arp = (a, b, c, d) => `${a}:16 ${b}:16 ${c}:16 ${d}:16 `.repeat(4).trim();

/** Eighth-note arpeggio (4 notes twice). */
export const arp8 = (a, b, c, d) => `${a} ${b} ${c} ${d} ${a} ${b} ${c} ${d}`;

export const DRUMS = {
  calm: 'X12:4 X3 X3 X5:4 X3:4',
  march: 'X12 X3 X5 X3 X12 X12 X5 X3',
  battle: 'X12:16 X12:16 X2 X5 X2 X12 X2 X5 X2',
  fill: 'X5:16 X5:16 X5:16 X5:16 X4:16 X4:16 X4:16 X4:16 X12 X12 X5:4',
  soft: 'X3:4 X3:4 X3:4 X1:4',
  sea: 'X12:4. X3 X5:4 X3:4',
};

/** Repeats one bar `count` times. */
export const times = (bar, count) => Array(count).fill(bar).join(' ');

const NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const ROOTS = { C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11 };
const noteName = (midi) => `${NAMES[midi % 12]}${Math.floor(midi / 12) - 1}`;

/**
 * Notes of a chord written 'Am', 'F#m', 'Bb', 'Bdim': bass root (E1 to D#2) and its fifth,
 * and the triad between E3 and D#5.
 */
export function chord(name) {
  const match = /^([A-G](?:#|b)?)(m|dim)?$/.exec(name);
  if (!match) throw new Error(`Unknown chord: ${name}`);
  const offset = (ROOTS[match[1]] - 4 + 12) % 12;
  const third = match[2] ? 3 : 4;
  const fifth = match[2] === 'dim' ? 6 : 7;
  const bassRoot = 28 + offset;
  const triadRoot = 52 + offset;
  return {
    root: noteName(bassRoot),
    fifth: noteName(bassRoot + fifth),
    tones: [triadRoot, triadRoot + third, triadRoot + fifth].map(noteName),
  };
}

/** One bar per chord name. */
export const chordArp = (names) => names.map((name) => {
  const [a, b, c] = chord(name).tones;
  return arp(a, b, c, b);
}).join(' ');

/**
 * Battle theme layout: 2-bar intro, then sections A B A C of 8 bars, looping after the intro.
 * melody: { intro, a, b, c } texts; chords: { intro, a, b, c } chord names (one per bar).
 */
export function battleTrack({ id, tempo, duty = 50, wave = 2, melody, chords }) {
  const body = (render) => [chords.a, chords.b, chords.a, chords.c].map(render).join(' ');
  const drums = `${times(DRUMS.battle, 7)} ${DRUMS.fill}`;
  return {
    id,
    tempo,
    channels: {
      1: `P${duty} V12 ${melody.intro} @ ${melody.a} ${melody.b} ${melody.a} ${melody.c}`,
      2: `P25 V7 ${chordArp(chords.intro)} @ ${body(chordArp)}`,
      3: `W${wave} V11 ${chordDrive(chords.intro)} @ ${body(chordDrive)}`,
      4: `N15 V10 S-2 X12:4 X12:4 X12:4 X5:4 ${DRUMS.fill} @ ${times(drums, 4)}`,
    },
  };
}

export const chordDrive = (names) => names.map((name) => drive(chord(name).root, chord(name).fifth)).join(' ');
export const chordBass = (names) => names.map((name) => bass(chord(name).root, chord(name).fifth)).join(' ');
export const chordHalves = (names) => names.map((name) => halves(chord(name).tones[1], chord(name).tones[2])).join(' ');
