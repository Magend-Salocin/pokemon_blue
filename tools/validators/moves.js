// Move fields, closed effect list and per-type coverage.

const CATEGORIES = ['physical', 'special', 'status'];
const STAT_STAGE_KEYS = ['atk', 'def', 'spa', 'spd', 'spe', 'acc', 'eva'];
const VARIABLE_POWER_EFFECTS = ['fixed_damage', 'level_damage', 'half_hp_damage', 'ohko', 'counter'];
const MIN_DAMAGING_MOVES_PER_TYPE = 8;

function checkMove(move, data) {
  const errors = [];
  const label = `attaque ${move.id}`;
  if (!data.types[move.type]) errors.push(`${label} : type inconnu « ${move.type} »`);
  if (!CATEGORIES.includes(move.category)) errors.push(`${label} : catégorie inconnue « ${move.category} »`);
  if (!data.moveEffects[move.effect]) errors.push(`${label} : effet hors liste « ${move.effect} »`);
  if (!Number.isInteger(move.power) || move.power < 0 || move.power > 250) errors.push(`${label} : puissance invalide`);
  if (move.category === 'status' && move.power !== 0) errors.push(`${label} : une attaque de statut a une puissance de 0`);
  if (move.category !== 'status' && move.power === 0 && !VARIABLE_POWER_EFFECTS.includes(move.effect)) {
    errors.push(`${label} : puissance 0 réservée aux effets ${VARIABLE_POWER_EFFECTS.join(', ')}`);
  }
  if (move.accuracy !== null && !(Number.isInteger(move.accuracy) && move.accuracy >= 1 && move.accuracy <= 100)) {
    errors.push(`${label} : précision invalide`);
  }
  if (!(Number.isInteger(move.pp) && move.pp >= 1 && move.pp <= 40)) errors.push(`${label} : PP invalides`);
  if (!(Number.isInteger(move.priority) && Math.abs(move.priority) <= 7)) errors.push(`${label} : priorité invalide`);
  if (move.effectChance !== null && !(move.effectChance >= 1 && move.effectChance <= 100)) errors.push(`${label} : effectChance invalide`);
  if (typeof move.highCrit !== 'boolean') errors.push(`${label} : highCrit doit être un booléen`);
  for (const key of Object.keys(move.effectParams?.stats ?? {})) {
    if (!STAT_STAGE_KEYS.includes(key)) errors.push(`${label} : stat inconnue « ${key} »`);
  }
  for (const species of move.exclusiveTo ?? []) {
    if (!data.creatures.some((creature) => creature.id === species)) errors.push(`${label} : exclusiveTo vise « ${species} » inconnue`);
  }
  return errors;
}

export function checkMoves(data) {
  const errors = data.moves.flatMap((move) => checkMove(move, data));
  const usedEffects = new Set(data.moves.map((move) => move.effect));
  for (const effect of Object.keys(data.moveEffects)) {
    if (!usedEffects.has(effect)) errors.push(`effet ${effect} : utilisé par aucune attaque`);
  }
  for (const type of Object.keys(data.types)) {
    const count = data.moves.filter((move) => move.type === type && move.category !== 'status' && !move.exclusiveTo).length;
    if (count < MIN_DAMAGING_MOVES_PER_TYPE) errors.push(`type ${type} : ${count} attaques offensives (min ${MIN_DAMAGING_MOVES_PER_TYPE})`);
  }
  return errors;
}
