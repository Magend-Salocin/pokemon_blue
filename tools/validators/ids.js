// Unique, stable identifiers (snake_case ASCII) for every data collection.

const ID_PATTERN = /^[a-z][a-z0-9_]*$/;

function checkCollection(label, entries) {
  const errors = [];
  const seen = new Set();
  for (const entry of entries) {
    if (!ID_PATTERN.test(entry.id ?? '')) errors.push(`${label} : id invalide « ${entry.id} »`);
    if (seen.has(entry.id)) errors.push(`${label} : id en double « ${entry.id} »`);
    seen.add(entry.id);
  }
  return errors;
}

export function checkIds(data) {
  const errors = [
    ...checkCollection('attaques', data.moves),
    ...checkCollection('bestioles', data.creatures),
    ...checkCollection('objets', data.items),
    ...checkCollection('classes de dresseurs', data.trainerClasses),
  ];
  const numbers = data.creatures.map((creature) => creature.number);
  const expected = Array.from({ length: data.creatures.length }, (_, i) => i + 1);
  if ([...numbers].sort((a, b) => a - b).join() !== expected.join()) {
    errors.push(`bestioles : les numéros doivent aller de 1 à ${data.creatures.length} sans trou ni doublon`);
  }
  return errors;
}
