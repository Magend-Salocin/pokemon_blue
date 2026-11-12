// Player options (pure data). Saved in the game save and in a separate options file
// (electron: userData/options.json, through window.bestiora.saveOptions / loadOptions).

export const OPTION_LIMITS = { volume: [0, 10], windowScale: [2, 6] };
export const TEXT_SPEED_IDS = ['slow', 'medium', 'fast'];
export const BATTLE_STYLES = ['choice', 'set'];

export const DEFAULT_OPTIONS = {
  textSpeed: 'medium',
  battleAnimations: true,
  battleStyle: 'choice', // 'choice': offered to switch when the trainer sends its next creature
  musicVolume: 8,
  sfxVolume: 8,
  palette: 'classique',
  windowScale: 4,
  fullscreen: false,
  keyBindings: null, // null = defaults of src/engine/input.js
};

let current = { ...DEFAULT_OPTIONS };

export const getOptions = () => current;

const clamp = (value, [min, max], fallback) => (Number.isInteger(value) ? Math.max(min, Math.min(max, value)) : fallback);

/** Fills missing or invalid values with the defaults (old saves, hand-edited files). */
export function normalizeOptions(raw = {}) {
  const options = { ...DEFAULT_OPTIONS };
  if (TEXT_SPEED_IDS.includes(raw.textSpeed)) options.textSpeed = raw.textSpeed;
  if (typeof raw.battleAnimations === 'boolean') options.battleAnimations = raw.battleAnimations;
  if (BATTLE_STYLES.includes(raw.battleStyle)) options.battleStyle = raw.battleStyle;
  options.musicVolume = clamp(raw.musicVolume, OPTION_LIMITS.volume, DEFAULT_OPTIONS.musicVolume);
  options.sfxVolume = clamp(raw.sfxVolume, OPTION_LIMITS.volume, DEFAULT_OPTIONS.sfxVolume);
  if (typeof raw.palette === 'string') options.palette = raw.palette;
  options.windowScale = clamp(raw.windowScale, OPTION_LIMITS.windowScale, DEFAULT_OPTIONS.windowScale);
  if (typeof raw.fullscreen === 'boolean') options.fullscreen = raw.fullscreen;
  if (raw.keyBindings && typeof raw.keyBindings === 'object') options.keyBindings = raw.keyBindings;
  return options;
}

export function setOptions(options) {
  current = normalizeOptions(options);
  return current;
}
