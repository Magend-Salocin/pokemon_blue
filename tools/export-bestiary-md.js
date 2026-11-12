// npm run bestiary: writes docs/BESTIAIRE.md from src/data/creatures.js.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { CREATURES, CREATURES_BY_ID, HABITATS } from '../src/data/creatures.js';
import { ITEMS_BY_ID } from '../src/data/items.js';
import { TYPES } from '../src/data/types.js';
import { evolutionsOf } from './validators/evolutions.js';
import { statTotal } from './validators/creatures.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT = path.join(ROOT, 'docs', 'BESTIAIRE.md');

function describeEvolution(evolution) {
  const target = CREATURES_BY_ID[evolution.to].name;
  if (evolution.method === 'level') return `${target} (niv. ${evolution.value})`;
  if (evolution.method === 'item') return `${target} (${ITEMS_BY_ID[evolution.value].name})`;
  return `${target} (amitié ${evolution.value})`;
}

function row(creature) {
  const number = String(creature.number).padStart(3, '0');
  const types = creature.types.map((type) => TYPES[type].name).join(' / ');
  const evolutions = evolutionsOf(creature).map(describeEvolution).join(', ') || '-';
  return `| ${number} | ${creature.name} | ${types} | ${statTotal(creature.baseStats)} | ${evolutions} | ${HABITATS[creature.habitat]} | ${creature.minLevel} |`;
}

const lines = [
  '# Bestiaire',
  '',
  'Fichier généré par `npm run bestiary` depuis `src/data/creatures.js`. Ne pas modifier à la main.',
  '',
  '« Niv. min » : niveau le plus bas auquel l’espèce peut être rencontrée (sauvage ou par évolution). Les tables de rencontres le respectent.',
  '',
  '| N° | Nom | Types | Total | Évolution | Habitat | Niv. min |',
  '|---:|---|---|---:|---|---|---:|',
  ...CREATURES.map(row),
  '',
];

fs.writeFileSync(OUTPUT, lines.join('\n'));
process.stdout.write(`${path.relative(ROOT, OUTPUT)} : ${CREATURES.length} bestioles\n`);
