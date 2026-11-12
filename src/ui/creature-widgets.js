// Drawing helpers shared by the battle HUD and the menus: HP bar, XP bar, status label.
import { drawSprite } from '../gfx/draw.js';
import { GLYPH_HP, GLYPH_LEVEL, drawText } from '../gfx/font.js';
import { getSpecies } from '../battle/logic/creature.js';

export const HP_BAR_WIDTH = 48;
export const XP_BAR_WIDTH = 64;

/** 'high' above 50 %, 'mid' above 20 %, 'low' otherwise. */
export function hpColor(hp, maxHp) {
  const ratio = maxHp > 0 ? hp / maxHp : 0;
  if (ratio > 0.5) return 'high';
  if (ratio > 0.2) return 'mid';
  return 'low';
}

/** Fill width in pixels; at least 1 pixel while HP > 0. */
export function barFill(value, max, width) {
  if (max <= 0 || value <= 0) return 0;
  return Math.max(1, Math.min(width, Math.round((value / max) * width)));
}

/** "PV" glyph followed by the bar (52 × 5 frame). */
export function drawHpBar(ctx, x, y, hp, maxHp) {
  drawText(ctx, GLYPH_HP, x, y - 2);
  const barX = x + 8;
  drawSprite(ctx, 'ui', 'hp/frame', barX, y);
  const width = barFill(hp, maxHp, HP_BAR_WIDTH);
  if (width > 0) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(barX + 2, y + 1, width, 3);
    ctx.clip();
    drawSprite(ctx, 'ui', `hp/${hpColor(hp, maxHp)}`, barX + 2, y + 1);
    ctx.restore();
  }
}

/** XP bar (68 × 4 frame); `ratio` from 0 to 1. */
export function drawXpBar(ctx, x, y, ratio) {
  drawSprite(ctx, 'ui', 'xp/frame', x, y);
  const width = Math.round(Math.max(0, Math.min(1, ratio)) * XP_BAR_WIDTH);
  if (width > 0) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x + 2, y + 1, width, 2);
    ctx.clip();
    drawSprite(ctx, 'ui', 'xp/fill', x + 2, y + 1);
    ctx.restore();
  }
}

export function drawLevel(ctx, level, x, y) {
  drawText(ctx, `${GLYPH_LEVEL}${level}`, x, y);
}

export function drawStatus(ctx, status, x, y) {
  if (status) drawSprite(ctx, 'ui', `status/${status.id}`, x, y);
}

export function creatureName(creature) {
  return creature.nickname ?? getSpecies(creature.species).name;
}

/** "hp/maxHp" right-aligned in 7 characters. */
export function hpText(hp, maxHp) {
  return `${String(Math.max(0, Math.ceil(hp))).padStart(3, ' ')}/${String(maxHp).padStart(3, ' ')}`;
}
