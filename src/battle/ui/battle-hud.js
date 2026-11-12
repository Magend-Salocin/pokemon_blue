// Battle layout at 160 × 144: enemy top right with its info box top left, player bottom left
// with its info box bottom right, text box at the bottom.
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../../engine/constants.js';
import { drawSprite } from '../../gfx/draw.js';
import { drawText } from '../../gfx/font.js';
import { getColor } from '../../gfx/palette.js';
import {
  drawHpBar, drawLevel, drawStatus, drawXpBar, hpText,
} from '../../ui/creature-widgets.js';

export const LAYOUT = {
  enemySprite: { x: 104, y: 4 },
  playerSprite: { x: 8, y: 44 },
  enemyHud: { x: 8, y: 6 },
  playerHud: { x: 80, y: 54 },
  textBox: { x: 0, y: 96, width: SCREEN_WIDTH, height: 48 },
};

export const spriteCenter = (side) => {
  const { x, y } = side === 0 ? LAYOUT.playerSprite : LAYOUT.enemySprite;
  return { x: x + 24, y: y + 24 };
};

/** One displayed combatant: what the screen shows, which may lag behind the logic state. */
export function createShownCreature() {
  return {
    visible: false, species: null, name: '', level: 1, hp: 0, maxHp: 1, status: null,
    dx: 0, dy: 0, blink: false, clipBottom: 0, expRatio: 0, hudVisible: false,
  };
}

function drawCreatureSprite(ctx, shown, side) {
  if (!shown.visible || shown.blink || !shown.species) return;
  const base = side === 0 ? LAYOUT.playerSprite : LAYOUT.enemySprite;
  const x = base.x + shown.dx;
  const y = base.y + shown.dy;
  const frame = `${shown.species}/${side === 0 ? 'back' : 'front'}`;
  if (shown.clipBottom <= 0) {
    drawSprite(ctx, 'creatures', frame, x, y);
    return;
  }
  // Faint: the sprite slides down behind the bottom of its area.
  ctx.save();
  ctx.beginPath();
  ctx.rect(base.x, base.y, 48, 48);
  ctx.clip();
  drawSprite(ctx, 'creatures', frame, x, y + shown.clipBottom);
  ctx.restore();
}

function drawEnemyHud(ctx, shown) {
  const { x, y } = LAYOUT.enemyHud;
  drawText(ctx, shown.name, x, y);
  drawLevel(ctx, shown.level, x + 32, y + 9);
  drawStatus(ctx, shown.status, x + 8, y + 9);
  drawHpBar(ctx, x + 8, y + 20, shown.hp, shown.maxHp);
}

function drawPlayerHud(ctx, shown) {
  const { x, y } = LAYOUT.playerHud;
  drawText(ctx, shown.name, x, y);
  drawLevel(ctx, shown.level, x + 40, y + 9);
  drawStatus(ctx, shown.status, x + 8, y + 9);
  drawHpBar(ctx, x + 8, y + 20, shown.hp, shown.maxHp);
  drawText(ctx, hpText(shown.hp, shown.maxHp), x + 16, y + 26);
  drawXpBar(ctx, x + 8, y + 36, shown.expRatio);
}

/** Capsule icons of a party: full, empty slot or K.O. */
function drawPartyIndicator(ctx, indicator) {
  const { side, states } = indicator;
  const y = side === 0 ? 84 : 32;
  const startX = side === 0 ? 88 : 16;
  for (let i = 0; i < 6; i += 1) drawSprite(ctx, 'ui', `capsule/${states[i] ?? 'empty'}`, startX + i * 9, y);
}

/**
 * view: { shown: [player, enemy], portraits: { player, trainer }, capsule, effect, indicators, shake }
 */
export function renderBattle(ctx, view) {
  ctx.save();
  ctx.translate(view.shake ?? 0, 0);
  ctx.fillStyle = getColor(0);
  ctx.fillRect(-4, 0, SCREEN_WIDTH + 8, SCREEN_HEIGHT);

  const { player: playerPortrait, trainer: trainerPortrait } = view.portraits;
  if (trainerPortrait.visible) drawSprite(ctx, 'trainers', trainerPortrait.frame, LAYOUT.enemySprite.x + trainerPortrait.dx, LAYOUT.enemySprite.y);
  if (playerPortrait.visible) drawSprite(ctx, 'trainers', playerPortrait.frame, LAYOUT.playerSprite.x + playerPortrait.dx, LAYOUT.playerSprite.y);
  drawCreatureSprite(ctx, view.shown[1], 1);
  drawCreatureSprite(ctx, view.shown[0], 0);
  if (view.capsule) drawSprite(ctx, 'characters', 'capsule', Math.round(view.capsule.x - 8), Math.round(view.capsule.y - 8));
  if (view.effect) view.effect.animation.draw(ctx, view.effect.t, view.effect.from, view.effect.to);

  if (view.shown[1].hudVisible) drawEnemyHud(ctx, view.shown[1]);
  if (view.shown[0].hudVisible && !view.hidePlayerHud) drawPlayerHud(ctx, view.shown[0]);
  for (const indicator of view.indicators) drawPartyIndicator(ctx, indicator);
  ctx.restore();
}
