// npm run validate: checks every data module and exits with code 1 on any error.
import { loadGameData } from './validators/game-data.js';
import { runCheckers } from './validators/index.js';

const data = loadGameData();
const results = runCheckers(data);
let errorCount = 0;

for (const { name, errors } of results) {
  errorCount += errors.length;
  process.stdout.write(`${errors.length === 0 ? 'OK ' : 'ERR'} ${name}${errors.length ? ` (${errors.length})` : ''}\n`);
  for (const error of errors) process.stdout.write(`    ${error}\n`);
}

process.stdout.write(
  `\n${data.creatures.length} bestioles, ${data.moves.length} attaques, ${data.items.length} objets, ` +
  `${data.trainerClasses.length} classes de dresseurs : ${errorCount === 0 ? 'données valides' : `${errorCount} erreur(s)`}\n`,
);
process.exitCode = errorCount === 0 ? 0 : 1;
