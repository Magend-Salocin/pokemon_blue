// Text table: id → French text. Scripts and maps reference texts by id.
import common from './common.js';
import menus from './menus.js';
import intro from './intro.js';
import debut from './debut.js';
import bois from './bois.js';
import port from './port.js';
import cendrelune from './cendrelune.js';
import test from './test.js';

export const TEXTS = { ...common, ...menus, ...intro, ...debut, ...bois, ...port, ...cendrelune, ...test };

export function getText(id) {
  const text = TEXTS[id];
  if (text === undefined) throw new Error(`Unknown text: ${id}`);
  return text;
}
