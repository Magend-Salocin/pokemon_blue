import { SCREEN_WIDTH, TILE } from '../engine/constants.js';
import { drawText } from '../gfx/font.js';
import { applyVariables, layoutText } from './text-layout.js';
import { drawWindowFrame } from './window-frame.js';

/** Characters revealed per second. */
export const TEXT_SPEEDS = { slow: 15, medium: 30, fast: 60 };

const BOX = { x: 0, y: 96, width: SCREEN_WIDTH, height: 48 };
const TEXT_X = BOX.x + TILE;
const LINE_Y = [108, 124];
// The arrow sits in the free space of the right border tile, so it never covers text.
const MORE_ARROW = { x: BOX.x + BOX.width - TILE, y: LINE_Y[1] };
const ARROW_BLINK_PERIOD = 0.6;

const CHOICE_BOX = { x: 112, y: 56, width: 48, height: 40 };
const CHOICES = ['OUI', 'NON'];

let textSpeed = 'medium';

export function getTextSpeed() {
  return textSpeed;
}

export function setTextSpeed(speed) {
  if (!Object.hasOwn(TEXT_SPEEDS, speed)) throw new Error(`Unknown text speed: ${speed}`);
  textSpeed = speed;
}

function pageLength(page) {
  return page.reduce((total, line) => total + Array.from(line).length, 0);
}

/**
 * Dialog scene: 2 lines of 18 characters at the bottom of the screen, revealed letter by letter.
 * A or B shows the whole page, then moves to the next one. With `question`, the last page
 * shows an OUI/NON choice. `promise` resolves with true/false for a question, undefined otherwise.
 */
export class DialogScene {
  transparent = true;
  blocksInput = true;

  constructor(text, { context = {}, question = false, speed = textSpeed } = {}) {
    this.pages = layoutText(applyVariables(text, context));
    this.question = question;
    this.charactersPerSecond = TEXT_SPEEDS[speed];
    this.pageIndex = 0;
    this.visibleCharacters = 0;
    this.blinkTime = 0;
    this.choiceIndex = 0;
    this.state = 'typing';
    this.promise = new Promise((resolve) => {
      this.resolve = resolve;
    });
  }

  enter(manager) {
    this.manager = manager;
  }

  get page() {
    return this.pages[this.pageIndex];
  }

  get isLastPage() {
    return this.pageIndex === this.pages.length - 1;
  }

  update(dt, input) {
    if (this.state === 'typing') this.updateTyping(dt, input);
    else if (this.state === 'waiting') this.updateWaiting(dt, input);
    else if (this.state === 'choosing') this.updateChoosing(input);
  }

  updateTyping(dt, input) {
    const total = pageLength(this.page);
    const skip = input.justPressed('a') || input.justPressed('b');
    this.visibleCharacters = skip ? total : Math.min(total, this.visibleCharacters + this.charactersPerSecond * dt);
    if (this.visibleCharacters < total) return;

    if (this.question && this.isLastPage) {
      this.state = 'choosing';
    } else {
      this.state = 'waiting';
      this.blinkTime = 0;
    }
  }

  updateWaiting(dt, input) {
    this.blinkTime += dt;
    if (!input.justPressed('a') && !input.justPressed('b')) return;

    if (this.isLastPage) {
      this.close(undefined);
    } else {
      this.pageIndex += 1;
      this.visibleCharacters = 0;
      this.state = 'typing';
    }
  }

  updateChoosing(input) {
    if (input.repeat('up') || input.repeat('down')) {
      this.choiceIndex = (this.choiceIndex + 1) % CHOICES.length;
    }
    if (input.justPressed('a')) this.close(this.choiceIndex === 0);
    else if (input.justPressed('b')) this.close(false);
  }

  close(result) {
    this.state = 'closed';
    if (this.manager?.top === this) this.manager.pop();
    this.resolve(result);
  }

  render(ctx) {
    drawWindowFrame(ctx, BOX.x, BOX.y, BOX.width, BOX.height);

    let remaining = Math.floor(this.visibleCharacters);
    this.page.forEach((line, index) => {
      const characters = Array.from(line);
      drawText(ctx, characters.slice(0, remaining).join(''), TEXT_X, LINE_Y[index]);
      remaining = Math.max(0, remaining - characters.length);
    });

    const arrowVisible = this.blinkTime % ARROW_BLINK_PERIOD < ARROW_BLINK_PERIOD / 2;
    if (this.state === 'waiting' && !this.isLastPage && arrowVisible) {
      drawText(ctx, '▼', MORE_ARROW.x, MORE_ARROW.y);
    }
    if (this.state === 'choosing') this.renderChoices(ctx);
  }

  renderChoices(ctx) {
    const { x, y, width, height } = CHOICE_BOX;
    drawWindowFrame(ctx, x, y, width, height);
    CHOICES.forEach((label, index) => {
      const lineY = y + TILE + index * 16;
      if (index === this.choiceIndex) drawText(ctx, '▶', x + TILE, lineY);
      drawText(ctx, label, x + 2 * TILE, lineY);
    });
  }
}

/** Pushes a dialog and resolves when the player closes it. */
export function showDialog(manager, text, options = {}) {
  const dialog = new DialogScene(text, { ...options, question: false });
  manager.push(dialog);
  return dialog.promise;
}

/** Pushes a dialog ending with an OUI/NON choice. Resolves true for OUI, false for NON or B. */
export function askYesNo(manager, text, options = {}) {
  const dialog = new DialogScene(text, { ...options, question: true });
  manager.push(dialog);
  return dialog.promise;
}
