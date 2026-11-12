// Comptoir: buying and selling (pure). Selling gives half the price.
import { ITEMS_BY_ID } from '../data/items.js';
import { MAX_ITEM_COUNT, addItem, addMoney, hasBadge, itemCount, removeItem } from './game-state.js';

export const sellPrice = (itemId) => Math.floor(ITEMS_BY_ID[itemId].price / 2);

export const isSellable = (itemId) => {
  const item = ITEMS_BY_ID[itemId];
  return item.pocket !== 'key' && item.price > 0;
};

/** Stock of a Comptoir: [{ item, badge? }] entries whose badge is owned. */
export function availableStock(stock, state) {
  return stock.filter((entry) => !entry.badge || hasBadge(state, entry.badge)).map((entry) => entry.item);
}

/** Largest quantity the player can buy (money and the 99 limit). */
export function maxBuyable(state, itemId) {
  const price = ITEMS_BY_ID[itemId].price;
  return Math.max(0, Math.min(MAX_ITEM_COUNT - itemCount(state, itemId), Math.floor(state.money / price)));
}

/** Returns an error key ('money', 'bag_full', 'quantity') or null after a purchase. */
export function buyItem(state, itemId, quantity) {
  if (!(quantity >= 1)) return 'quantity';
  const total = ITEMS_BY_ID[itemId].price * quantity;
  if (total > state.money) return 'money';
  if (itemCount(state, itemId) + quantity > MAX_ITEM_COUNT) return 'bag_full';
  addMoney(state, -total);
  addItem(state, itemId, quantity);
  return null;
}

export function sellItem(state, itemId, quantity) {
  if (!isSellable(itemId)) return 'not_sellable';
  if (!(quantity >= 1) || itemCount(state, itemId) < quantity) return 'quantity';
  removeItem(state, itemId, quantity);
  addMoney(state, sellPrice(itemId) * quantity);
  return null;
}
