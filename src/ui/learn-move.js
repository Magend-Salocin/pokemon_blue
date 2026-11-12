// Shared "learn a fifth move" dialog flow, used in battle and after an evolution.
import { MOVES_BY_ID } from '../data/moves.js';
import { BATTLE_TEXTS } from '../data/texts/battle-fr.js';
import { createMoveSlot, MAX_MOVES } from '../battle/logic/creature.js';
import { learnMove } from '../battle/logic/experience.js';
import { askYesNo, showDialog } from './dialog-box.js';
import { creatureName } from './creature-widgets.js';
import { chooseMoveSlot } from './move-list-screen.js';

export function sayBattle(manager, key, context = {}) {
  return showDialog(manager, BATTLE_TEXTS[key], { context });
}

export function askBattle(manager, key, context = {}) {
  return askYesNo(manager, BATTLE_TEXTS[key], { context });
}

/** Asks which move to forget. Resolves with the slot (0-3) or null when the player gives up. */
export async function chooseMoveToForget(manager, creature, moveId) {
  const context = { CREATURE: creatureName(creature), MOVE: MOVES_BY_ID[moveId].name };
  await sayBattle(manager, 'learn_move_wants', context);
  for (;;) {
    if (!(await askBattle(manager, 'learn_move_ask', context))) {
      await sayBattle(manager, 'learn_move_skip', context);
      return null;
    }
    const slot = await chooseMoveSlot(manager, creature, { newMove: moveId });
    if (slot === null) continue;
    const forgotten = MOVES_BY_ID[creature.moves[slot].id].name;
    if (await askBattle(manager, 'learn_move_confirm', { MOVE: forgotten })) {
      await sayBattle(manager, 'learn_move_forgot', { ...context, TARGET: forgotten });
      return slot;
    }
  }
}

/** Outside battle: learns directly with free room, otherwise asks. Mutates the creature. */
export async function learnMoveOutsideBattle(manager, creature, moveId) {
  if (creature.moves.some((slot) => slot.id === moveId)) return;
  if (creature.moves.length < MAX_MOVES) {
    creature.moves.push(createMoveSlot(moveId));
    await sayBattle(manager, 'move_learned', { CREATURE: creatureName(creature), MOVE: MOVES_BY_ID[moveId].name });
    return;
  }
  const slot = await chooseMoveToForget(manager, creature, moveId);
  learnMove(creature, 0, moveId, slot);
}
