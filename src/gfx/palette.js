// Colors are listed from lightest (index 0) to darkest (index 3). Index -1 is transparent.
export const PALETTES = [
  { id: 'classique', name: 'Classique', colors: ['#e8f0d8', '#a8c090', '#587860', '#203028'] },
  { id: 'azur', name: 'Azur', colors: ['#e0f0f8', '#88b8d8', '#3a6890', '#102038'] },
  { id: 'sepia', name: 'Sépia', colors: ['#f4e8d0', '#c8a878', '#7a5838', '#2c1c10'] },
  { id: 'gris', name: 'Gris', colors: ['#f0f0f0', '#a8a8a8', '#585858', '#181818'] },
  { id: 'nuit', name: 'Nuit', colors: ['#b8c0e0', '#6870a8', '#303868', '#080c20'] },
];

/** Fade levels: +1..+3 shift tints toward black, -1..-3 toward white. */
export const FADE_LEVELS = 3;

let activePalette = PALETTES[0];
let fadeLevel = 0;

export function getActivePalette() {
  return activePalette;
}

export function setActivePalette(id) {
  const palette = PALETTES.find((item) => item.id === id);
  if (!palette) throw new Error(`Unknown palette: ${id}`);
  activePalette = palette;
}

export function cyclePalette() {
  const index = PALETTES.indexOf(activePalette);
  activePalette = PALETTES[(index + 1) % PALETTES.length];
  return activePalette;
}

export function getFadeLevel() {
  return fadeLevel;
}

export function setFadeLevel(level) {
  fadeLevel = Math.max(-FADE_LEVELS, Math.min(FADE_LEVELS, Math.round(level)));
}

/** Displayed color for a palette index, with the current fade applied. */
export function getColor(index) {
  const shifted = Math.max(0, Math.min(3, index + fadeLevel));
  return activePalette.colors[shifted];
}

/** Changes whenever displayed colors change; use it to key caches of recolored bitmaps. */
export function getPaletteKey() {
  return `${activePalette.id}:${fadeLevel}`;
}
