// Global game state (pure data + small helpers). Serialized as-is by the save system (prompt 12).

export function createGameState(overrides = {}) {
  return {
    player: { name: 'Elio', gender: 'boy' },
    rival: { name: 'Nora' },
    flags: {},
    bag: {},
    party: [],
    storage: [],
    bestiary: { seen: {}, caught: {} },
    money: 3000,
    badges: [],
    position: { map: null, x: 0, y: 0, facing: 'down' },
    lastHalte: null,
    repelSteps: 0,
    ...overrides,
  };
}

let current = createGameState();

export function getGameState() {
  return current;
}

export function setGameState(state) {
  current = state;
}

export const hasFlag = (state, flag) => state.flags[flag] === true;
export const setFlag = (state, flag) => {
  state.flags[flag] = true;
};
export const clearFlag = (state, flag) => {
  delete state.flags[flag];
};

export const itemCount = (state, item) => state.bag[item] ?? 0;
export const hasItem = (state, item, count = 1) => itemCount(state, item) >= count;

export function addItem(state, item, count = 1) {
  state.bag[item] = itemCount(state, item) + count;
}

/** Removes up to `count` items; returns false (and changes nothing) if there are not enough. */
export function removeItem(state, item, count = 1) {
  if (!hasItem(state, item, count)) return false;
  state.bag[item] -= count;
  if (state.bag[item] === 0) delete state.bag[item];
  return true;
}

export const hasBadge = (state, badge) => state.badges.includes(badge);
export function addBadge(state, badge) {
  if (!hasBadge(state, badge)) state.badges.push(badge);
}

export function addMoney(state, amount) {
  state.money = Math.max(0, Math.min(999999, state.money + amount));
}

export const PARTY_SIZE = 6;

/**
 * Adds a creature instance (src/battle/logic/creature.js) to the party, or to the storage
 * when the party is full. Returns 'party' or 'storage'. Marks the species as caught.
 */
export function addCreature(state, creature) {
  markCaught(state, creature.species);
  if (state.party.length < PARTY_SIZE) {
    state.party.push(creature);
    return 'party';
  }
  state.storage.push(creature);
  return 'storage';
}

/** Full HP, no status, full PP for every party creature. */
export function healParty(state) {
  for (const creature of state.party) {
    creature.hp = creature.stats.hp;
    creature.status = null;
    for (const slot of creature.moves) slot.pp = slot.maxPp;
  }
}

export const isPartyAlive = (state) => state.party.some((creature) => creature.hp > 0);

export function markSeen(state, species) {
  state.bestiary.seen[species] = true;
}

export function markCaught(state, species) {
  state.bestiary.seen[species] = true;
  state.bestiary.caught[species] = true;
}
