// Evolution references and consistency: no cycle, increasing levels and totals along a line.
import { statTotal } from './creatures.js';

const METHODS = ['level', 'item', 'friendship'];

/** Evolution entries of a species as an array (null → []). */
export function evolutionsOf(creature) {
  if (!creature.evolution) return [];
  return Array.isArray(creature.evolution) ? creature.evolution : [creature.evolution];
}

function checkEntry(creature, evolution, data, byId) {
  const label = `bestiole ${creature.id}`;
  const errors = [];
  if (!byId.has(evolution.to)) errors.push(`${label} : évolue en « ${evolution.to} » inconnue`);
  if (!METHODS.includes(evolution.method)) errors.push(`${label} : méthode d’évolution inconnue « ${evolution.method} »`);
  if (evolution.method === 'level' && !(Number.isInteger(evolution.value) && evolution.value >= 2 && evolution.value <= 100)) {
    errors.push(`${label} : niveau d’évolution invalide`);
  }
  if (evolution.method === 'friendship' && !(evolution.value >= 1 && evolution.value <= 255)) errors.push(`${label} : seuil d’amitié invalide`);
  if (evolution.method === 'item') {
    const item = data.items.find((entry) => entry.id === evolution.value);
    if (!item) errors.push(`${label} : objet d’évolution « ${evolution.value} » inconnu`);
    else if (item.use.effect !== 'evolve') errors.push(`${label} : « ${evolution.value} » n’est pas un objet d’évolution`);
  }
  const target = byId.get(evolution.to);
  if (target) {
    if (statTotal(target.baseStats) <= statTotal(creature.baseStats)) errors.push(`${label} : ${target.id} doit avoir un total de stats supérieur`);
    if (evolution.method === 'level' && target.minLevel < evolution.value) errors.push(`${target.id} : minLevel inférieur au niveau d’évolution`);
  }
  return errors;
}

/** Follows evolutions from `start`: detects cycles and non-increasing evolution levels. */
function checkChain(start, byId) {
  const errors = [];
  const walk = (creature, visited, lastLevel) => {
    for (const evolution of evolutionsOf(creature)) {
      const target = byId.get(evolution.to);
      if (!target) continue;
      if (visited.has(target.id)) {
        errors.push(`bestiole ${start.id} : cycle d’évolution via ${target.id}`);
        continue;
      }
      let level = lastLevel;
      if (evolution.method === 'level') {
        if (evolution.value <= lastLevel) errors.push(`bestiole ${creature.id} : niveau d’évolution ${evolution.value} non croissant dans la lignée`);
        level = evolution.value;
      }
      walk(target, new Set([...visited, target.id]), level);
    }
  };
  walk(start, new Set([start.id]), 0);
  return errors;
}

export function checkEvolutions(data) {
  const byId = new Map(data.creatures.map((creature) => [creature.id, creature]));
  const errors = [];
  const preEvolutions = new Map();
  for (const creature of data.creatures) {
    for (const evolution of evolutionsOf(creature)) {
      errors.push(...checkEntry(creature, evolution, data, byId));
      if (preEvolutions.has(evolution.to)) errors.push(`bestiole ${evolution.to} : plusieurs formes de base`);
      preEvolutions.set(evolution.to, creature.id);
    }
  }
  for (const creature of data.creatures) {
    if (!preEvolutions.has(creature.id)) errors.push(...checkChain(creature, byId));
  }
  return errors;
}
