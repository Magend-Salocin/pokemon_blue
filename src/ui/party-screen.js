// Party screen: 6 rows with animated icon, name, level, HP bar and status.
// Used to choose a creature (battle, items, scripts) and by the Start menu.
// Resolves with the chosen index, or null on B (unless `forced`).
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../engine/constants.js';
import { CREATURES_BY_ID } from '../data/creatures.js';
import { drawSprite } from '../gfx/draw.js';
import { drawText } from '../gfx/font.js';
import { getColor } from '../gfx/palette.js';
import {
  creatureName, drawHpBar, drawLevel, drawStatus, hpText,
} from './creature-widgets.js';
import { PromiseScene, moveCursor } from './menu-cursor.js';
import { drawWindowFrame } from './window-frame.js';

const ROW_HEIGHT = 20;
const MESSAGE_Y = 120;
/** Icons of the hand-drawn species, which have no generator plan. */
const HANDMADE_ICONS = {
  fenouillot: 'quadruped', fenouvert: 'quadruped', sylvenard: 'quadruped',
  braisille: 'bird', fournaise: 'bird', pyrogrue: 'bird',
  flaquin: 'fish', ondeclat: 'quadruped', marevor: 'dragon',
  azurel: 'bird', glacerne: 'golem', volcarde: 'dragon', fulgorine: 'bird', mirelle: 'insect',
};

export function iconPlan(species) {
  const sprite = CREATURES_BY_ID[species].sprite;
  return sprite === 'handmade' ? HANDMADE_ICONS[species] ?? 'blob' : sprite.plan;
}

/** Icon frame: 2 frames, faster when HP is high. */
export function drawCreatureIcon(ctx, creature, x, y, time) {
  const ratio = creature.stats.hp > 0 ? creature.hp / creature.stats.hp : 0;
  const period = creature.hp <= 0 ? Infinity : ratio > 0.5 ? 0.25 : ratio > 0.2 ? 0.5 : 1;
  const frame = Number.isFinite(period) ? Math.floor(time / period) % 2 : 0;
  drawSprite(ctx, 'ui', `icon/${iconPlan(creature.species)}/${frame}`, x, y);
}

export class PartyScreen extends PromiseScene {
  /**
   * options: { forced, message, canSelect(creature, index) → error message or null, startIndex, swapFrom }
   */
  constructor(party, { forced = false, message = 'Quelle bestiole ?', canSelect = () => null, startIndex = 0, swapFrom = null } = {}) {
    super();
    this.party = party;
    this.forced = forced;
    this.message = message;
    this.canSelect = canSelect;
    this.swapFrom = swapFrom;
    // Start on the first selectable creature (a forced switch never starts on a K.O. one).
    const selectable = party.findIndex((creature, index) => index >= startIndex && !canSelect(creature, index));
    this.index = selectable >= 0 ? selectable : startIndex;
    this.error = null;
    this.time = 0;
  }

  update(dt, input) {
    this.time += dt;
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
      const y = index * ROW_HEIGHT;
      if (index === this.swapFrom) {
        ctx.fillStyle = getColor(1);
        ctx.fillRect(0, y, SCREEN_WIDTH, ROW_HEIGHT);
      }
      if (index === this.index) drawText(ctx, '▶', 0, y + 6);
      drawCreatureIcon(ctx, creature, 8, y + 2, index === this.index ? this.time : 0);
      drawText(ctx, creatureName(creature), 24, y + 2);
      drawLevel(ctx, creature.level, 112, y + 2);
      drawStatus(ctx, creature.status, 144, y + 12);
      drawHpBar(ctx, 24, y + 13, creature.hp, creature.stats.hp);
      drawText(ctx, hpText(creature.hp, creature.stats.hp), 88, y + 11);
    });
    drawWindowFrame(ctx, 0, MESSAGE_Y, SCREEN_WIDTH, 24);
    drawText(ctx, this.error ?? this.message, 8, MESSAGE_Y + 8);
  }
}

export function choosePartyMember(manager, party, options) {
  return manager.push(new PartyScreen(party, options)).promise;
}
