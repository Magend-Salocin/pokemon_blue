// Creature summary, 3 pages: (1) identity and XP, (2) stats, (3) moves.
// Left/right: page. Up/down: previous/next creature. On page 3, A selects a move to read its
// description (up/down then browse the moves, B goes back). B closes.
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../engine/constants.js';
import { CREATURES_BY_ID } from '../data/creatures.js';
import { expForLevel } from '../data/formulas.js';
import { MOVES_BY_ID } from '../data/moves.js';
import { drawSprite } from '../gfx/draw.js';
import { drawText } from '../gfx/font.js';
import { getColor } from '../gfx/palette.js';
import { creatureName, drawHpBar, drawLevel, drawStatus, hpText } from './creature-widgets.js';
import { PromiseScene } from './menu-cursor.js';
import { wrapParagraph } from './text-layout.js';
import { drawWindowFrame } from './window-frame.js';

const PAGES = 3;
const STATS = [['atk', 'ATTAQUE'], ['def', 'DÉFENSE'], ['spa', 'ATT. SPÉ.'], ['spd', 'DÉF. SPÉ.'], ['spe', 'VITESSE']];

export class SummaryScreen extends PromiseScene {
  constructor(creatures, index = 0) {
    super();
    this.creatures = creatures;
    this.index = index;
    this.page = 0;
    this.moveCursor = null;
  }

  get creature() {
    return this.creatures[this.index];
  }

  update(dt, input) {
    if (this.moveCursor !== null) {
      const count = this.creature.moves.length;
      if (input.repeat('up')) this.moveCursor = (this.moveCursor + count - 1) % count;
      if (input.repeat('down')) this.moveCursor = (this.moveCursor + 1) % count;
      if (input.justPressed('b')) this.moveCursor = null;
      return;
    }
    if (input.repeat('left')) this.page = (this.page + PAGES - 1) % PAGES;
    if (input.repeat('right')) this.page = (this.page + 1) % PAGES;
    if (input.repeat('up')) this.index = (this.index + this.creatures.length - 1) % this.creatures.length;
    if (input.repeat('down')) this.index = (this.index + 1) % this.creatures.length;
    if (input.justPressed('a') && this.page === 2) this.moveCursor = 0;
    if (input.justPressed('b')) this.done(null);
  }

  render(ctx) {
    const creature = this.creature;
    const species = CREATURES_BY_ID[creature.species];
    ctx.fillStyle = getColor(0);
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    drawText(ctx, `${this.page + 1}/${PAGES}`, 128, 0);
    if (this.page === 0) this.renderIdentity(ctx, creature, species);
    else if (this.page === 1) this.renderStats(ctx, creature);
    else this.renderMoves(ctx, creature);
  }

  renderIdentity(ctx, creature, species) {
    drawSprite(ctx, 'creatures', `${creature.species}/front`, 4, 8);
    drawText(ctx, `No ${String(species.number).padStart(3, '0')}`, 64, 10);
    drawText(ctx, creatureName(creature), 64, 22);
    drawLevel(ctx, creature.level, 64, 34);
    drawStatus(ctx, creature.status, 104, 35);
    species.types.forEach((type, index) => drawSprite(ctx, 'ui', `type/${type}`, 64 + index * 24, 46));
    drawWindowFrame(ctx, 0, 64, SCREEN_WIDTH, 80);
    drawHpBar(ctx, 8, 76, creature.hp, creature.stats.hp);
    drawText(ctx, hpText(creature.hp, creature.stats.hp), 72, 74);
    drawText(ctx, `D.O. ${creature.originalTrainer ?? '-'}`, 8, 88);
    drawText(ctx, `XP ${creature.exp}`, 8, 104);
    const next = creature.level >= 100 ? 0 : expForLevel(species.growth, creature.level + 1) - creature.exp;
    drawText(ctx, `Niv. suivant ${next}`, 8, 120);
  }

  renderStats(ctx, creature) {
    drawWindowFrame(ctx, 0, 8, SCREEN_WIDTH, 136);
    drawText(ctx, creatureName(creature), 8, 16);
    drawText(ctx, 'PV', 8, 36);
    drawText(ctx, `${creature.hp}/${creature.stats.hp}`.padStart(7, ' '), 96, 36);
    STATS.forEach(([key, label], index) => {
      const y = 54 + index * 16;
      drawText(ctx, label, 8, y);
      drawText(ctx, String(creature.stats[key]).padStart(7, ' '), 96, y);
    });
  }

  renderMoves(ctx, creature) {
    drawWindowFrame(ctx, 0, 8, SCREEN_WIDTH, 72);
    creature.moves.forEach((slot, index) => {
      const move = MOVES_BY_ID[slot.id];
      const y = 16 + index * 14;
      if (index === this.moveCursor) drawText(ctx, '▶', 8, y);
      drawText(ctx, move.name, 16, y);
      drawText(ctx, `${slot.pp}/${slot.maxPp}`.padStart(5, ' '), 112, y + 6);
    });
    drawWindowFrame(ctx, 0, 80, SCREEN_WIDTH, 64);
    const slot = creature.moves[this.moveCursor ?? 0];
    if (!slot) return;
    const move = MOVES_BY_ID[slot.id];
    drawSprite(ctx, 'ui', `type/${move.type}`, 8, 88);
    drawText(ctx, `P ${move.power > 0 ? move.power : '-'}`, 40, 88);
    drawText(ctx, `PR ${move.accuracy ?? '-'}`, 96, 88);
    if (this.moveCursor === null) drawText(ctx, 'A : détails', 8, 112);
    else drawText(ctx, wrapParagraph(move.description).join('\n'), 8, 104);
  }
}

export function showSummary(manager, creatures, index) {
  return manager.push(new SummaryScreen(creatures, index)).promise;
}
