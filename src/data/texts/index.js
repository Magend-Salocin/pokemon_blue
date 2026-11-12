// Text table: id → French text. Scripts and maps reference texts by id.
import common from './common.js';
import menus from './menus.js';
import test from './test.js';

export const TEXTS = { ...common, ...menus, ...test };

export function getText(id) {
  const text = TEXTS[id];
  if (text === undefined) throw new Error(`Unknown text: ${id}`);
  return text;
}
