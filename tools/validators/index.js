// Independent checkers. Each takes the loaded game data and returns a list of error messages.
// Maps and trainers (prompts 04, 09 to 11) add their own checkers here.
import { checkCreatures } from './creatures.js';
import { checkEvolutions } from './evolutions.js';
import { checkIds } from './ids.js';
import { checkItems, checkTrainerClasses } from './items.js';
import { checkMoves } from './moves.js';
import { checkTexts } from './texts.js';
import { checkTypes } from './types.js';

export const CHECKERS = [
  { name: 'Identifiants', run: checkIds },
  { name: 'Types', run: checkTypes },
  { name: 'Attaques', run: checkMoves },
  { name: 'Bestioles', run: checkCreatures },
  { name: 'Évolutions', run: checkEvolutions },
  { name: 'Objets', run: checkItems },
  { name: 'Classes de dresseurs', run: checkTrainerClasses },
  { name: 'Textes', run: checkTexts },
];

/** Runs every checker; returns [{ name, errors }]. */
export function runCheckers(data) {
  return CHECKERS.map(({ name, run }) => ({ name, errors: run(data) }));
}
