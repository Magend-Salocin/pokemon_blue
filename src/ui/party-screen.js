// Minimal party screen (replaced by the full component in prompt 07): list with level, HP and
// status. Resolves with the chosen index, or null on B (unless `forced`).
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../engine/constants.js';
import { drawText } from '../gfx/font.js';
import { getColor } from '../gfx/palette.js';
import {
  creatureName, drawHpBar, drawLevel, drawStatus, hpText,
} from './creature-widgets.js';
import { PromiseScene, moveCursor } from './menu-cursor.js';
import { drawWindowFrame } from './window-frame.js';

const ROW_HEIGHT = 20;
const MESSAGE_Y = 120;

export class PartyScreen extends PromiseScene {
  /**
   * options: { forced, message, canSelect(creature, index) → error message or null }
   */
  constructor(party, { forced = false, message = 'Quelle bestiole ?', canSelect = () => null, startIndex = 0 } = {}) {
    super();
    this.party = party;
    this.forced = forced;
    this.message = message;
    this.canSelect = canSelect;
    // Start on the first selectable creature (a forced switch never starts on a K.O. one).
    const selectable = party.findIndex((creature, index) => index >= startIndex && !canSelect(creature, index));
    this.index = selectable >= 0 ? selectable : startIndex;
    this.error = null;
  }

  update(dt, input) {
    const previous = this.index;
    this.index = moveCursor(this.index, this.party.length, input);
    if (this.index !== previous) this.error = null;
    if (input.justPressed('a')) {
      const error = this.canSelect(this.party[this.index], this.index);
      if (error) this.error = error;
      else this.done(this.index);
    } else if (input.justPressed('b') && !this.forced) {
      this.done(null);
    }
  }

  render(ctx) {
    ctx.fillStyle = getColor(0);
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    this.party.forEach((creature, index) => {
      const y = index * ROW_HEIGHT + 2;
      if (index === this.index) drawText(ctx, '▶', 0, y + 4);
      drawText(ctx, creatureName(creature), 8, y);
      drawLevel(ctx, creature.level, 96, y);
      if (creature.hp <= 0) drawText(ctx, 'K.O.', 128, y);
      else drawStatus(ctx, creature.status, 136, y);
      drawHpBar(ctx, 8, y + 11, creature.hp, creature.stats.hp);
      drawText(ctx, hpText(creature.hp, creature.stats.hp), 96, y + 9);
    });
    drawWindowFrame(ctx, 0, MESSAGE_Y, SCREEN_WIDTH, 24);
    drawText(ctx, this.error ?? this.message, 8, MESSAGE_Y + 8);
  }
}

export function choosePartyMember(manager, party, options) {
  return manager.push(new PartyScreen(party, options)).promise;
}
