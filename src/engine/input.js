import {
  BUTTONS,
  GAMEPAD_AXIS_THRESHOLD,
  INPUT_REPEAT_DELAY,
  INPUT_REPEAT_INTERVAL,
} from './constants.js';

// KeyboardEvent.code values (physical keys). On AZERTY, the key labelled Z reports 'KeyW',
// so both codes are bound to B to match the "Z = annuler" rule on either layout.
export const DEFAULT_KEY_BINDINGS = {
  up: ['ArrowUp'],
  down: ['ArrowDown'],
  left: ['ArrowLeft'],
  right: ['ArrowRight'],
  a: ['KeyX'],
  b: ['KeyZ', 'KeyW'],
  start: ['Enter', 'NumpadEnter'],
  select: ['ShiftRight'],
};

// Standard Gamepad API mapping.
export const DEFAULT_GAMEPAD_BINDINGS = {
  up: [12],
  down: [13],
  left: [14],
  right: [15],
  a: [0],
  b: [1],
  start: [9],
  select: [8],
};

/** Input that reports nothing pressed; given to scenes while input is suspended. */
export const IDLE_INPUT = Object.freeze({
  isDown: () => false,
  justPressed: () => false,
  justReleased: () => false,
  repeat: () => false,
});

function cloneBindings(bindings) {
  return Object.fromEntries(BUTTONS.map((button) => [button, [...(bindings[button] ?? [])]]));
}

function createButtonState() {
  return { down: false, pressed: false, released: false, repeated: false, heldTime: 0, nextRepeat: 0 };
}

export function createInput({
  target = window,
  keyBindings = DEFAULT_KEY_BINDINGS,
  gamepadBindings = DEFAULT_GAMEPAD_BINDINGS,
} = {}) {
  let keys = cloneBindings(keyBindings);
  let pads = cloneBindings(gamepadBindings);
  const heldCodes = new Set();
  // Keys pressed since the last update, so a tap shorter than one step is not lost.
  const tappedCodes = new Set();
  const states = Object.fromEntries(BUTTONS.map((button) => [button, createButtonState()]));

  function isBoundCode(code) {
    return BUTTONS.some((button) => keys[button].includes(code));
  }

  function onKeyDown(event) {
    if (!isBoundCode(event.code)) return;
    event.preventDefault();
    if (event.repeat) return;
    heldCodes.add(event.code);
    tappedCodes.add(event.code);
  }

  function onKeyUp(event) {
    heldCodes.delete(event.code);
  }

  function clearKeys() {
    heldCodes.clear();
    tappedCodes.clear();
  }

  target.addEventListener('keydown', onKeyDown);
  target.addEventListener('keyup', onKeyUp);
  target.addEventListener('blur', clearKeys);

  function readGamepadButtons() {
    const pressed = new Set();
    const gamepads = target.navigator?.getGamepads?.() ?? [];
    for (const pad of gamepads) {
      if (!pad) continue;
      for (const button of BUTTONS) {
        if (pads[button].some((index) => pad.buttons[index]?.pressed)) pressed.add(button);
      }
      const [axisX = 0, axisY = 0] = pad.axes;
      if (axisX <= -GAMEPAD_AXIS_THRESHOLD) pressed.add('left');
      if (axisX >= GAMEPAD_AXIS_THRESHOLD) pressed.add('right');
      if (axisY <= -GAMEPAD_AXIS_THRESHOLD) pressed.add('up');
      if (axisY >= GAMEPAD_AXIS_THRESHOLD) pressed.add('down');
    }
    return pressed;
  }

  function isKeyboardDown(button) {
    return keys[button].some((code) => heldCodes.has(code) || tappedCodes.has(code));
  }

  function updateButton(state, isNowDown, dt) {
    state.pressed = isNowDown && !state.down;
    state.released = !isNowDown && state.down;
    state.down = isNowDown;
    state.repeated = state.pressed;

    if (!isNowDown) {
      state.heldTime = 0;
      return;
    }
    if (state.pressed) {
      state.heldTime = 0;
      state.nextRepeat = INPUT_REPEAT_DELAY;
      return;
    }
    state.heldTime += dt;
    if (state.heldTime >= state.nextRepeat) {
      state.repeated = true;
      state.nextRepeat += INPUT_REPEAT_INTERVAL;
    }
  }

  return {
    /** Call once per fixed step, before scenes update. */
    update(dt) {
      const gamepadDown = readGamepadButtons();
      for (const button of BUTTONS) {
        updateButton(states[button], isKeyboardDown(button) || gamepadDown.has(button), dt);
      }
      tappedCodes.clear();
    },
    isDown: (button) => states[button].down,
    justPressed: (button) => states[button].pressed,
    justReleased: (button) => states[button].released,
    /** True on the first press, then every INPUT_REPEAT_INTERVAL after INPUT_REPEAT_DELAY. For menus. */
    repeat: (button) => states[button].repeated,
    getKeyBindings: () => cloneBindings(keys),
    setKeyBindings(bindings) {
      keys = cloneBindings({ ...keys, ...bindings });
      clearKeys();
    },
    getGamepadBindings: () => cloneBindings(pads),
    setGamepadBindings(bindings) {
      pads = cloneBindings({ ...pads, ...bindings });
    },
    destroy() {
      target.removeEventListener('keydown', onKeyDown);
      target.removeEventListener('keyup', onKeyUp);
      target.removeEventListener('blur', clearKeys);
    },
  };
}
