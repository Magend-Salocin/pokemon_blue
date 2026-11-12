// Bestiaire: numbered list (« ----- » if never seen, capsule icon if caught), seen/caught
// counters, entry page (sprite, category, size, weight, types, description if caught) and a
// zones page (region map with the zones where the species appears).
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../engine/constants.js';
import { CREATURES } from '../data/creatures.js';
import { ALL_MAPS } from '../data/maps/index.js';
import { LAND, REGION_SIZE, ZONES, zonesOfSpecies } from '../data/region.js';
import { drawSprite } from '../gfx/draw.js';
import { drawText } from '../gfx/font.js';
import { getColor } from '../gfx/palette.js';
import { PromiseScene, moveCursor, scrollOffset } from './menu-cursor.js';
import { wrapParagraph } from './text-layout.js';
import { drawWindowFrame } from './window-frame.js';

const VISIBLE_ROWS = 7;
const REGION_ORIGIN = { x: 0, y: 16 };

export function bestiaryCounts(bestiary) {
  return { seen: Object.keys(bestiary.seen).length, caught: Object.keys(bestiary.caught).length };
}

const formatMeasure = (value, unit) => `${String(value).replace('.', ',')} ${unit}`;

export class BestiaryScreen extends PromiseScene {
  constructor(state) {
    super();
    this.state = state;
    this.index = 0;
    this.offset = 0;
    this.view = 'list';
    this.time = 0;
  }

  get species() {
    return CREATURES[this.index];
  }

  isSeen(species) {
    return Boolean(this.state.bestiary.seen[species.id]);
  }

  isCaught(species) {
    return Boolean(this.state.bestiary.caught[species.id]);
  }

  update(dt, input) {
    this.time += dt;
    if (this.view === 'list') {
      this.index = moveCursor(this.index, CREATURES.length, input, { wrap: false });
      if (input.repeat('right')) this.index = Math.min(CREATURES.length - 1, this.index + VISIBLE_ROWS);
      if (input.repeat('left')) this.index = Math.max(0, this.index - VISIBLE_ROWS);
      this.offset = scrollOffset(this.offset, this.index, VISIBLE_ROWS);
      if (input.justPressed('a') && this.isSeen(this.species)) this.view = 'entry';
      else if (input.justPressed('b')) this.done(null);
      return;
    }
    if (input.repeat('left') || input.repeat('right')) this.view = this.view === 'entry' ? 'zones' : 'entry';
    if (input.justPressed('b')) this.view = 'list';
  }

  render(ctx) {
    ctx.fillStyle = getColor(0);
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    if (this.view === 'list') this.renderList(ctx);
    else if (this.view === 'entry') this.renderEntry(ctx);
    else this.renderZones(ctx);
  }

  renderList(ctx) {
    const { seen, caught } = bestiaryCounts(this.state.bestiary);
    drawWindowFrame(ctx, 0, 0, SCREEN_WIDTH, 128);
    CREATURES.slice(this.offset, this.offset + VISIBLE_ROWS).forEach((species, row) => {
      const index = this.offset + row;
      const y = 8 + row * 16;
      if (index === this.index) drawText(ctx, '▶', 8, y);
      drawText(ctx, String(species.number).padStart(3, '0'), 16, y);
      if (this.isCaught(species)) drawSprite(ctx, 'ui', 'capsule/full', 48, y);
      drawText(ctx, this.isSeen(species) ? species.name : '-----', 64, y);
    });
    drawText(ctx, `VUS ${seen}  PRIS ${caught}`, 8, 132);
  }

  renderEntry(ctx) {
    const species = this.species;
    drawSprite(ctx, 'creatures', `${species.id}/front`, 4, 4);
    drawText(ctx, `No ${String(species.number).padStart(3, '0')}`, 64, 6);
    drawText(ctx, species.name, 64, 18);
    drawText(ctx, species.category.replace(/^Bestiole /, ''), 64, 30);
    species.types.forEach((type, index) => drawSprite(ctx, 'ui', `type/${type}`, 64 + index * 24, 42));
    drawText(ctx, `T ${formatMeasure(species.height, 'm')}`, 8, 56);
    drawText(ctx, `P ${formatMeasure(species.weight, 'kg')}`, 80, 56);
    drawWindowFrame(ctx, 0, 72, SCREEN_WIDTH, 72);
    const text = this.isCaught(species) ? species.description : 'Capturez-la pour en savoir plus.';
    drawText(ctx, wrapParagraph(text).slice(0, 3).join('\n'), 8, 82);
  }

  renderZones(ctx) {
    const { cell } = REGION_SIZE;
    const { x: ox, y: oy } = REGION_ORIGIN;
    drawText(ctx, `ZONES : ${this.species.name}`, 0, 2);
    ctx.fillStyle = getColor(1);
    ctx.fillRect(ox, oy, REGION_SIZE.columns * cell, REGION_SIZE.rows * cell);
    ctx.fillStyle = getColor(0);
    for (const land of LAND) ctx.fillRect(ox + land.x * cell, oy + land.y * cell, land.w * cell, land.h * cell);
    ctx.fillStyle = getColor(2);
    for (const zone of ZONES) ctx.fillRect(ox + zone.x * cell + 2, oy + zone.y * cell + 2, zone.w * cell - 4, zone.h * cell - 4);
    const zones = zonesOfSpecies(this.species.id, ALL_MAPS);
    if (Math.floor(this.time * 3) % 2 === 0) {
      ctx.fillStyle = getColor(3);
      for (const zone of zones) ctx.fillRect(ox + zone.x * cell, oy + zone.y * cell, zone.w * cell, zone.h * cell);
    }
    drawText(ctx, zones.length === 0 ? 'Zone inconnue.' : zones[0].name, 0, 132);
  }
}

export function openBestiary(manager, state) {
  return manager.push(new BestiaryScreen(state)).promise;
}
