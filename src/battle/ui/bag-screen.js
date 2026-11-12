// Battle bag: pockets "objets" and "capsules" (left/right), only items usable in battle.
// Resolves with an item id, or null on B.
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../../engine/constants.js';
import { ITEMS_BY_ID } from '../../data/items.js';
import { drawText } from '../../gfx/font.js';
import { getColor } from '../../gfx/palette.js';
import { getBattleItem } from '../logic/items.js';
import { PromiseScene, moveCursor, scrollOffset } from '../../ui/menu-cursor.js';
import { wrapParagraph } from '../../ui/text-layout.js';
import { drawWindowFrame } from '../../ui/window-frame.js';

const POCKETS = [{ id: 'items', label: 'OBJETS' }, { id: 'capsules', label: 'CAPSULES' }];
const VISIBLE_ROWS = 5;

/** Battle-usable items of the bag, grouped by pocket: { items: [{ id, count }], capsules: [...] }. */
export function battleBagContents(bag) {
  const contents = { items: [], capsules: [] };
  for (const [id, count] of Object.entries(bag)) {
    const item = getBattleItem(id);
    if (item && count > 0 && contents[item.pocket]) contents[item.pocket].push({ id, count });
  }
  return contents;
}

export class BattleBagScreen extends PromiseScene {
  constructor(bag) {
    super();
    this.contents = battleBagContents(bag);
    this.pocket = 0;
    this.index = 0;
    this.offset = 0;
  }

  get list() {
    return this.contents[POCKETS[this.pocket].id];
  }

  update(dt, input) {
    if (input.repeat('left') || input.repeat('right')) {
      this.pocket = (this.pocket + 1) % POCKETS.length;
      this.index = 0;
      this.offset = 0;
      return;
    }
    if (this.list.length > 0) {
      this.index = moveCursor(this.index, this.list.length, input, { wrap: false });
      this.offset = scrollOffset(this.offset, this.index, VISIBLE_ROWS);
      if (input.justPressed('a')) this.done(this.list[this.index].id);
    }
    if (input.justPressed('b')) this.done(null);
  }

  render(ctx) {
    ctx.fillStyle = getColor(0);
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    drawWindowFrame(ctx, 0, 0, SCREEN_WIDTH, 104);
    drawText(ctx, `« ${POCKETS[this.pocket].label} »`, 8, 4);
    if (this.list.length === 0) drawText(ctx, 'Rien ici.', 16, 20);
    this.list.slice(this.offset, this.offset + VISIBLE_ROWS).forEach((entry, row) => {
      const index = this.offset + row;
      const y = 18 + row * 16;
      if (index === this.index) drawText(ctx, '▶', 8, y);
      drawText(ctx, ITEMS_BY_ID[entry.id].name, 16, y);
      drawText(ctx, `×${String(entry.count).padStart(2, ' ')}`, 128, y + 8);
    });
    drawWindowFrame(ctx, 0, 104, SCREEN_WIDTH, 40);
    const selected = this.list[this.index];
    if (selected) drawText(ctx, wrapParagraph(ITEMS_BY_ID[selected.id].description).slice(0, 2).join('\n'), 8, 112);
  }
}

export function openBattleBag(manager, bag) {
  return manager.push(new BattleBagScreen(bag)).promise;
}
