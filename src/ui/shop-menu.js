// Comptoir: ACHETER / VENDRE / QUITTER with quantity and money windows.
// stock: [{ item, badge? }] defined by the map script (open_menu shop, params.stock).
import { ITEMS_BY_ID } from '../data/items.js';
import {
  availableStock, buyItem, isSellable, maxBuyable, sellItem, sellPrice,
} from '../state/shop.js';
import { ListMenu } from './components/list-menu.js';
import { openAndKeep, withMenuLayer } from './components/menu-layer.js';
import { MoneyWindow, QuantityWindow } from './components/small-windows.js';
import { ask, say } from './messages.js';

const MAIN = ['ACHETER', 'VENDRE', 'QUITTER'];

async function buyFlow(manager, layer, state, items) {
  for (;;) {
    const list = new ListMenu(items.map((id) => ({ label: ITEMS_BY_ID[id].name, detail: String(ITEMS_BY_ID[id].price) })), { x: 0, y: 56, width: 160, rows: 4 });
    const done = await openAndKeep(layer, list, (index) => (index === null ? true : buyOne(manager, layer, state, items[index])));
    if (done) return;
  }
}

async function buyOne(manager, layer, state, itemId) {
  const max = maxBuyable(state, itemId);
  if (max < 1) {
    await say(manager, state.money < ITEMS_BY_ID[itemId].price ? 'shop_no_money' : 'shop_bag_full');
    return false;
  }
  const quantity = await layer.open(new QuantityWindow({ max, unitPrice: ITEMS_BY_ID[itemId].price, x: 64, y: 120 }));
  if (!quantity) return false;
  const total = ITEMS_BY_ID[itemId].price * quantity;
  if (!(await ask(manager, 'shop_buy_confirm', { ITEM: `${ITEMS_BY_ID[itemId].name} ×${quantity}`, NUMBER: total }))) return false;
  const error = buyItem(state, itemId, quantity);
  await say(manager, error === 'money' ? 'shop_no_money' : error === 'bag_full' ? 'shop_bag_full' : 'shop_thanks');
  return false;
}

async function sellFlow(manager, layer, state) {
  for (;;) {
    const entries = Object.entries(state.bag).filter(([id, count]) => count > 0 && ITEMS_BY_ID[id]?.pocket !== 'key');
    if (entries.length === 0) {
      await say(manager, 'shop_nothing_to_sell');
      return;
    }
    const list = new ListMenu(entries.map(([id, count]) => ({ label: ITEMS_BY_ID[id].name, detail: `×${String(count).padStart(2, ' ')}` })), { x: 0, y: 56, width: 160, rows: 4 });
    const done = await openAndKeep(layer, list, (index) => (index === null ? true : sellOne(manager, layer, state, entries[index])));
    if (done) return;
  }
}

async function sellOne(manager, layer, state, [itemId, count]) {
  if (!isSellable(itemId)) {
    await say(manager, 'shop_cannot_sell');
    return false;
  }
  const quantity = await layer.open(new QuantityWindow({ max: count, unitPrice: sellPrice(itemId), x: 64, y: 120 }));
  if (!quantity) return false;
  if (!(await ask(manager, 'shop_sell_confirm', { NUMBER: sellPrice(itemId) * quantity }))) return false;
  sellItem(state, itemId, quantity);
  await say(manager, 'shop_thanks');
  return false;
}

export async function openShop(manager, state, { stock = [] } = {}) {
  const items = availableStock(stock, state);
  await say(manager, 'shop_welcome');
  await withMenuLayer(manager, async (layer) => {
    layer.show(new MoneyWindow(() => state.money, { x: 88, y: 0 }));
    for (;;) {
      const menu = new ListMenu(MAIN.map((label) => ({ label })), { x: 0, y: 0, width: 88, rows: 3, rowHeight: 12 });
      const leave = await openAndKeep(layer, menu, async (choice) => {
        if (choice === 0) await buyFlow(manager, layer, state, items);
        else if (choice === 1) await sellFlow(manager, layer, state);
        return choice !== 0 && choice !== 1;
      });
      if (leave) break;
    }
  });
  await say(manager, 'shop_goodbye');
}
