// Creature storage: 12 boxes of 30, reached from the Halte terminals (pure).

export const BOX_COUNT = 12;
export const BOX_SIZE = 30;
export const BOX_NAME_MAX = 10;

export function createStorage() {
  return {
    current: 0,
    boxes: Array.from({ length: BOX_COUNT }, (_, index) => ({ name: `Boîte ${index + 1}`, creatures: [] })),
  };
}

export const healthyCount = (party) => party.filter((creature) => creature.hp > 0).length;

/** Puts a creature in the current box, or the next one with room. Returns { box, slot } or null. */
export function storeCreature(storage, creature) {
  for (let offset = 0; offset < BOX_COUNT; offset += 1) {
    const box = (storage.current + offset) % BOX_COUNT;
    const { creatures } = storage.boxes[box];
    if (creatures.length < BOX_SIZE) {
      creatures.push(creature);
      return { box, slot: creatures.length - 1 };
    }
  }
  return null;
}

/** The party must keep at least one creature able to fight. */
function leavesHealthyCreature(party, removedIndex) {
  return party.some((creature, index) => index !== removedIndex && creature.hp > 0);
}

/** Moves a party creature to a box. Returns an error key or null. */
export function deposit(state, partyIndex, boxIndex) {
  const creature = state.party[partyIndex];
  if (!creature) return 'no_creature';
  if (!leavesHealthyCreature(state.party, partyIndex)) return 'last_healthy';
  const box = state.storage.boxes[boxIndex];
  if (box.creatures.length >= BOX_SIZE) return 'box_full';
  state.party.splice(partyIndex, 1);
  box.creatures.push(creature);
  return null;
}

export function withdraw(state, boxIndex, slot, partySize) {
  const box = state.storage.boxes[boxIndex];
  if (!box.creatures[slot]) return 'no_creature';
  if (state.party.length >= partySize) return 'party_full';
  state.party.push(box.creatures.splice(slot, 1)[0]);
  return null;
}

export function moveCreature(storage, fromBox, slot, toBox) {
  const source = storage.boxes[fromBox];
  const target = storage.boxes[toBox];
  if (!source.creatures[slot]) return 'no_creature';
  if (fromBox === toBox) return null;
  if (target.creatures.length >= BOX_SIZE) return 'box_full';
  target.creatures.push(source.creatures.splice(slot, 1)[0]);
  return null;
}

/** Releases a stored creature (from a box) for good. */
export function releaseCreature(storage, boxIndex, slot) {
  const box = storage.boxes[boxIndex];
  if (!box.creatures[slot]) return 'no_creature';
  box.creatures.splice(slot, 1);
  return null;
}

export function renameBox(storage, boxIndex, name) {
  const trimmed = Array.from(name.trim()).slice(0, BOX_NAME_MAX).join('');
  if (trimmed) storage.boxes[boxIndex].name = trimmed;
}

export const storedCount = (storage) => storage.boxes.reduce((total, box) => total + box.creatures.length, 0);
