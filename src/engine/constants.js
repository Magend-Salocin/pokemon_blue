export const SCREEN_WIDTH = 160;
export const SCREEN_HEIGHT = 144;
export const TILE = 8;
export const METATILE = 16;
export const FPS = 60;

// Fixed simulation step, in seconds. Every update(dt) in the engine uses seconds.
export const FIXED_STEP = 1 / FPS;
export const MAX_UPDATES_PER_FRAME = 5;

export const INPUT_REPEAT_DELAY = 0.3;
export const INPUT_REPEAT_INTERVAL = 0.08;
export const GAMEPAD_AXIS_THRESHOLD = 0.5;

export const BUTTONS = ['up', 'down', 'left', 'right', 'a', 'b', 'start', 'select'];

export const DEFAULT_FADE_DURATION = 0.4;
