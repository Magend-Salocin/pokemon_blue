// Serializable battle state. Side 0 = player, side 1 = enemy.

export const PLAYER = 0;
export const ENEMY = 1;
export const STAGE_KEYS = ['atk', 'def', 'spa', 'spd', 'spe', 'acc', 'eva'];
export const MIN_STAGE = -6;
export const MAX_STAGE = 6;

export const opponentOf = (side) => 1 - side;

export function freshStages() {
  return Object.fromEntries(STAGE_KEYS.map((key) => [key, 0]));
}

/** Volatile state, cleared when the creature leaves the field. */
export function freshVolatile() {
  return {
    confusion: 0,
    flinch: false,
    trap: null, // { turns }
    leech: false,
    critUp: false,
    protect: false,
    protectChain: 0,
    charging: null, // { moveIndex, semiInvulnerable }
    recharging: false,
    rampage: null, // { moveIndex, turns }
    damageTaken: null, // { amount, category } this turn
    acted: false,
  };
}

function createSide(party) {
  const active = party.findIndex((creature) => creature.hp > 0);
  return {
    party,
    active: Math.max(0, active),
    stages: freshStages(),
    volatile: freshVolatile(),
    screens: { physical: 0, special: 0 },
    potionsUsed: 0, // potions used by the AI of this side
  };
}

/**
 * config: { kind: 'wild' | 'trainer', playerParty, enemyParty, trainer?: { id, class, name, moneyBase, ai } }
 * Parties hold creature instances (see creature.js); the battle works on its own copy.
 */
export function createBattleState(config) {
  const playerParty = structuredClone(config.playerParty);
  const enemyParty = structuredClone(config.enemyParty);
  const state = {
    kind: config.kind,
    trainer: config.trainer ?? null,
    turn: 0,
    sides: [createSide(playerParty), createSide(enemyParty)],
    runAttempts: 0,
    outcome: null,
    pending: [],
    // Player party indices that fought each enemy creature (for experience sharing).
    participants: enemyParty.map(() => []),
    leveledUp: [],
  };
  markParticipant(state);
  return state;
}

export const activeOf = (state, side) => state.sides[side].party[state.sides[side].active];

export function markParticipant(state) {
  const enemyIndex = state.sides[ENEMY].active;
  const playerIndex = state.sides[PLAYER].active;
  const list = state.participants[enemyIndex];
  if (list && !list.includes(playerIndex) && activeOf(state, PLAYER).hp > 0) list.push(playerIndex);
}

export function resetOnSwitch(side) {
  side.stages = freshStages();
  side.volatile = freshVolatile();
}
