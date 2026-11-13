// Trainer registry. Each zone file of src/data/trainers/ exports a list built with helpers.js.
// Texts are ids from src/data/texts/. `after` is said when talked to once defeated.
import debut from './trainers/debut.js';
import bois from './trainers/bois.js';
import port from './trainers/port.js';
import cendrelune from './trainers/cendrelune.js';
import test from './trainers/test.js';

export const TRAINERS = [...debut, ...bois, ...port, ...cendrelune, ...test];

export const TRAINERS_BY_ID = Object.fromEntries(TRAINERS.map((trainer) => [trainer.id, trainer]));

/** Party for this battle: rivals adapt to the player's starter. */
export function trainerParty(trainer, playerStarter) {
  return trainer.partyByStarter?.[playerStarter] ?? trainer.party;
}
