// Independent checkers. Each takes the loaded game data and returns a list of error messages.
// New data families (audio, saves…) add their own checker here.
import { checkAudio } from './audio.js';
import { checkCreatures } from './creatures.js';
import { checkEvolutions } from './evolutions.js';
import { checkFlags } from './flags.js';
import { checkIds } from './ids.js';
import { checkItems, checkTrainerClasses } from './items.js';
import { checkMoves } from './moves.js';
import { checkMaps, checkTrainers } from './maps.js';
import { checkGlobalScripts } from './scripts.js';
import { checkGameTexts, checkTexts } from './texts.js';
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
  { name: 'Textes de dialogue', run: checkGameTexts },
  { name: 'Dresseurs', run: checkTrainers },
  { name: 'Scripts globaux', run: checkGlobalScripts },
  { name: 'Cartes', run: checkMaps },
  { name: 'Drapeaux', run: checkFlags },
  { name: 'Audio', run: checkAudio },
];

/** Runs every checker; returns [{ name, errors }]. */
export function runCheckers(data) {
  return CHECKERS.map(({ name, run }) => ({ name, errors: run(data) }));
}
