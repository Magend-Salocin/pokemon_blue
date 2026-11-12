// Text table: id → French text. Scripts and maps reference texts by id.
import common from './common.js';
import test from './test.js';

export const TEXTS = { ...common, ...test };

export function getText(id) {
  const text = TEXTS[id];
  if (text === undefined) throw new Error(`Unknown text: ${id}`);
  return text;
}
