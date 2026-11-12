// Dialog helpers for menus and services: text ids from src/data/texts/, with {PLAYER} and
// {RIVAL} filled from the game state.
import { getText } from '../data/texts/index.js';
import { getGameState } from '../state/game-state.js';
import { askYesNo, showDialog } from './dialog-box.js';

function context(variables) {
  const state = getGameState();
  return { PLAYER: state.player.name, RIVAL: state.rival.name, ...variables };
}

export const say = (manager, id, variables = {}) => showDialog(manager, getText(id), { context: context(variables) });
export const ask = (manager, id, variables = {}) => askYesNo(manager, getText(id), { context: context(variables) });
/** Literal text (already in French), for short menu feedback. */
export const sayLiteral = (manager, text) => showDialog(manager, text);
