import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../engine/constants.js';
import { ATLAS_NAMES, getAtlas } from '../gfx/atlas.js';
import { drawSprite } from '../gfx/draw.js';
import { drawText } from '../gfx/font.js';
import { getColor } from '../gfx/palette.js';
import { drawWindowFrame } from '../ui/window-frame.js';

const ANIMATION_STEP = 0.4;
const LINE_LENGTH = 18;
const SHEET_COLUMNS = 3;
const SHEET_ROWS = 2;
const SHEET_PAGE_SIZE = SHEET_COLUMNS * SHEET_ROWS;
const SHEET_MODE = 'planche';
const TILE_FLAGS = ['solid', 'grass', 'water', 'ledge', 'cuttable', 'pushable', 'climbable', 'door', 'counter', 'slippery'];

/** Groups animation frames ("outdoor/water/0", "/1") under one entry. */
function groupFrames(frameIds) {
  const groups = new Map();
  for (const id of [...frameIds].sort()) {
    const match = id.match(/^(.*)\/(\d+)$/);
    const key = match ? match[1] : id;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(id);
  }
  return [...groups].map(([id, frames]) => ({ id, frames }));
}

function fitLine(text) {
  return text.length <= LINE_LENGTH ? text : `…${text.slice(-(LINE_LENGTH - 1))}`;
}

/**
 * Debug scene: browse every atlas entry (animated when it has several frames),
 * plus a sheet of the generated creatures.
 * Controls: ←/→ entry or page, ↑/↓ atlas, A mirror, B back. Select+Start still changes palette.
 */
export class AtlasViewerScene {
  transparent = false;
  blocksInput = true;

  constructor() {
    this.modes = [...ATLAS_NAMES, SHEET_MODE];
    this.entries = Object.fromEntries(ATLAS_NAMES.map((name) => [name, groupFrames(Object.keys(getAtlas(name).frames))]));
    this.positions = Object.fromEntries(this.modes.map((mode) => [mode, 0]));
    this.modeIndex = 0;
    this.time = 0;
    this.flip = false;
    const { generated = [] } = getAtlas('creatures').meta;
    this.sheetIds = generated;
  }

  enter(manager) {
    this.manager = manager;
  }

  get mode() {
    return this.modes[this.modeIndex];
  }

  get count() {
    return this.mode === SHEET_MODE
      ? Math.max(1, Math.ceil(this.sheetIds.length / SHEET_PAGE_SIZE))
      : this.entries[this.mode].length;
  }

  update(dt, input) {
    this.time += dt;
    if (input.justPressed('b')) {
      this.manager.pop();
      return;
    }
    if (input.justPressed('a')) this.flip = !this.flip;
    if (input.repeat('up')) this.changeMode(-1);
    if (input.repeat('down')) this.changeMode(1);
    if (input.repeat('left')) this.move(-1);
    if (input.repeat('right')) this.move(1);
  }

  changeMode(step) {
    this.modeIndex = (this.modeIndex + step + this.modes.length) % this.modes.length;
    this.time = 0;
  }

  move(step) {
    this.positions[this.mode] = (this.positions[this.mode] + step + this.count) % this.count;
    this.time = 0;
  }

  render(ctx) {
    ctx.fillStyle = getColor(0);
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    const position = this.positions[this.mode];

    drawWindowFrame(ctx, 0, 0, SCREEN_WIDTH, 32);
    drawText(ctx, fitLine(`${this.mode} ${position + 1}/${this.count}`), 8, 8);

    if (this.mode === SHEET_MODE) {
      this.renderSheet(ctx, position);
      drawText(ctx, 'bestioles générées', 8, 16);
      return;
    }

    const entry = this.entries[this.mode][position];
    const frameId = entry.frames[Math.floor(this.time / ANIMATION_STEP) % entry.frames.length];
    drawText(ctx, fitLine(entry.id), 8, 16);
    this.renderFrame(ctx, frameId);
    drawText(ctx, fitLine(this.footer(entry)), 8, 132);
  }

  renderFrame(ctx, frameId) {
    const frame = getAtlas(this.mode).frames[frameId];
    const areaTop = 36;
    const areaHeight = 92;
    const small = frame.w <= 24 && frame.h <= 24;
    const x = Math.floor((SCREEN_WIDTH - frame.w * (small ? 3 : 1) - (small ? 8 : 0)) / 2);
    const y = areaTop + Math.floor((areaHeight - frame.h * (small ? 2 : 1)) / 2);
    drawSprite(ctx, this.mode, frameId, x, y, { flipX: this.flip });
    if (small) {
      // Same frame at 2× next to the 1× version.
      ctx.save();
      ctx.translate(x + frame.w + 8, y);
      ctx.scale(2, 2);
      drawSprite(ctx, this.mode, frameId, 0, 0, { flipX: this.flip });
      ctx.restore();
    }
  }

  footer(entry) {
    if (this.mode !== 'tiles') return entry.frames.length > 1 ? `${entry.frames.length} frames` : 'A:miroir B:retour';
    const [tileset, id] = entry.id.split('/');
    const definition = getAtlas('tiles').meta.tilesets[tileset].metatiles[id];
    const flags = TILE_FLAGS.filter((flag) => definition[flag]);
    return flags.length > 0 ? flags.join(' ') : 'sol';
  }

  renderSheet(ctx, page) {
    const ids = this.sheetIds.slice(page * SHEET_PAGE_SIZE, (page + 1) * SHEET_PAGE_SIZE);
    ids.forEach((id, index) => {
      const x = 8 + (index % SHEET_COLUMNS) * 48;
      const y = 36 + Math.floor(index / SHEET_COLUMNS) * 54;
      drawSprite(ctx, 'creatures', `${id}/front`, x, y, { flipX: this.flip });
    });
  }
}
