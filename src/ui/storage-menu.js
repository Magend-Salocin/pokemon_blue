// Storage terminal: DÉPOSER, RETIRER, DÉPLACER, LIBÉRER, CHANGER (current box),
// NOM (rename), QUITTER. The current box name is shown at the top.
import { drawText } from '../gfx/font.js';
import { PARTY_SIZE } from '../state/game-state.js';
import {
  BOX_SIZE, deposit, moveCreature, releaseCreature, renameBox, withdraw,
} from '../state/storage.js';
import { ListMenu } from './components/list-menu.js';
import { openAndKeep, withMenuLayer } from './components/menu-layer.js';
import { creatureName } from './creature-widgets.js';
import { ask, say } from './messages.js';
import { enterName } from './name-entry.js';
import { choosePartyMember } from './party-screen.js';
import { showSummary } from './summary-screen.js';
import { drawWindowFrame } from './window-frame.js';

const MAIN = ['DÉPOSER', 'RETIRER', 'DÉPLACER', 'LIBÉRER', 'CHANGER', 'NOM', 'QUITTER'];
const ERRORS = { last_healthy: 'storage_last_healthy', box_full: 'storage_box_full', party_full: 'storage_party_full' };

class BoxHeader {
  constructor(storage) {
    this.storage = storage;
  }

  update() {
    return undefined;
  }

  render(ctx) {
    const box = this.storage.boxes[this.storage.current];
    drawWindowFrame(ctx, 0, 0, 160, 24);
    drawText(ctx, box.name, 8, 8);
  }
}

function chooseBox(layer, storage, index = storage.current) {
  const items = storage.boxes.map((box) => ({ label: box.name, detail: `${box.creatures.length}/${BOX_SIZE}` }));
  return layer.open(new ListMenu(items, { x: 0, y: 24, width: 160, rows: 5, index }));
}

/** Lists the creatures of the current box; resolves with a slot or null. */
async function chooseStored(manager, layer, storage) {
  const box = storage.boxes[storage.current];
  if (box.creatures.length === 0) {
    await say(manager, 'storage_empty');
    return null;
  }
  const items = box.creatures.map((creature) => ({ label: creatureName(creature), detail: `Nv${creature.level}` }));
  return layer.open(new ListMenu(items, { x: 0, y: 24, width: 160, rows: 5 }));
}

/** Creature from the box, then RÉSUMÉ or the given action. */
async function pickStoredWithSummary(manager, layer, storage, actionLabel) {
  for (;;) {
    const slot = await chooseStored(manager, layer, storage);
    if (slot === null) return null;
    const choice = await layer.open(new ListMenu([{ label: actionLabel }, { label: 'RÉSUMÉ' }, { label: 'ANNULER' }], { x: 72, y: 80, width: 88, rows: 3, rowHeight: 12 }));
    if (choice === 0) return slot;
    if (choice === 1) await showSummary(manager, storage.boxes[storage.current].creatures, slot);
  }
}

async function runChoice(manager, layer, state, choice) {
  const { storage } = state;
  const box = storage.current;
  if (choice === 'DÉPOSER') {
    const index = await choosePartyMember(manager, state.party, { message: 'Déposer qui ?' });
    if (index === null) return;
    const creature = state.party[index];
    const error = deposit(state, index, box);
    await say(manager, ERRORS[error] ?? 'storage_deposited', { CREATURE: creatureName(creature) });
  } else if (choice === 'RETIRER') {
    const slot = await pickStoredWithSummary(manager, layer, storage, 'RETIRER');
    if (slot === null) return;
    const creature = storage.boxes[box].creatures[slot];
    const error = withdraw(state, box, slot, PARTY_SIZE);
    await say(manager, ERRORS[error] ?? 'storage_withdrawn', { CREATURE: creatureName(creature) });
  } else if (choice === 'DÉPLACER') {
    const slot = await pickStoredWithSummary(manager, layer, storage, 'DÉPLACER');
    if (slot === null) return;
    const target = await chooseBox(layer, storage);
    if (target === null) return;
    const error = moveCreature(storage, box, slot, target);
    if (error) await say(manager, ERRORS[error]);
  } else if (choice === 'LIBÉRER') {
    const slot = await pickStoredWithSummary(manager, layer, storage, 'LIBÉRER');
    if (slot === null) return;
    const creature = storage.boxes[box].creatures[slot];
    const name = creatureName(creature);
    if (!(await ask(manager, 'storage_release_ask', { CREATURE: name }))) return;
    releaseCreature(storage, box, slot);
    await say(manager, 'storage_released', { CREATURE: name });
  } else if (choice === 'CHANGER') {
    const target = await chooseBox(layer, storage);
    if (target !== null) storage.current = target;
  } else if (choice === 'NOM') {
    const name = await enterName(manager, { title: 'Nom de la boîte ?', defaultName: storage.boxes[box].name, initial: '' });
    renameBox(storage, box, name);
  }
}

export async function openStorage(manager, state) {
  await say(manager, 'storage_welcome');
  await withMenuLayer(manager, async (layer) => {
    layer.show(new BoxHeader(state.storage));
    for (;;) {
      const menu = new ListMenu(MAIN.map((label) => ({ label })), { x: 0, y: 24, width: 96, rows: MAIN.length, rowHeight: 12 });
      const leave = await openAndKeep(layer, menu, async (index) => {
        if (index === null || MAIN[index] === 'QUITTER') return true;
        await runChoice(manager, layer, state, MAIN[index]);
        return false;
      });
      if (leave) return;
    }
  });
}

