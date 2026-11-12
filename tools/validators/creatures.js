// Species fields, stat totals, learnsets, sprites and type distribution.
import { validateCreatureSpec } from '../../src/gfx/creature-generator.js';
import { GROWTH_RATES, STAT_KEYS } from '../../src/data/formulas.js';

export const LEGENDARY_NUMBERS = [146, 147, 148, 149, 150];
export const STAT_TOTALS = { regular: [250, 600], legendary: [580, 680] };
export const MIN_CREATURES_PER_TYPE = 6;
const MIN_MOVES_AT_MIN_LEVEL = 4;
const LAST_LEARNSET_LEVEL = 60;
const MAX_TYPE_MOVE_GAP = 16;

export const statTotal = (baseStats) => STAT_KEYS.reduce((sum, key) => sum + baseStats[key], 0);
export const isLegendary = (creature) => LEGENDARY_NUMBERS.includes(creature.number);

function checkFields(creature, data) {
  const errors = [];
  const label = `bestiole ${creature.id}`;
  if (!Array.isArray(creature.types) || creature.types.length < 1 || creature.types.length > 2) errors.push(`${label} : 1 ou 2 types`);
  for (const type of creature.types ?? []) if (!data.types[type]) errors.push(`${label} : type inconnu « ${type} »`);
  if (new Set(creature.types).size !== creature.types.length) errors.push(`${label} : type en double`);
  for (const key of STAT_KEYS) {
    if (!(Number.isInteger(creature.baseStats?.[key]) && creature.baseStats[key] > 0)) errors.push(`${label} : stat ${key} invalide`);
  }
  const [min, max] = isLegendary(creature) ? STAT_TOTALS.legendary : STAT_TOTALS.regular;
  const total = statTotal(creature.baseStats);
  if (total < min || total > max) errors.push(`${label} : total de stats ${total} hors de [${min}, ${max}]`);
  if (!GROWTH_RATES.includes(creature.growth)) errors.push(`${label} : croissance inconnue « ${creature.growth} »`);
  if (!(Number.isInteger(creature.catchRate) && creature.catchRate >= 3 && creature.catchRate <= 255)) errors.push(`${label} : catchRate hors de [3, 255]`);
  if (!(Number.isInteger(creature.baseExp) && creature.baseExp > 0)) errors.push(`${label} : baseExp invalide`);
  const { stat, points } = creature.trainingYield ?? {};
  if (!STAT_KEYS.includes(stat) || !(points >= 1 && points <= 3)) errors.push(`${label} : trainingYield invalide`);
  if (!Array.isArray(creature.teachable)) errors.push(`${label} : teachable doit être un tableau`);
  if (!(creature.height > 0 && creature.weight > 0)) errors.push(`${label} : taille et poids positifs`);
  if (!data.habitats[creature.habitat]) errors.push(`${label} : habitat inconnu « ${creature.habitat} »`);
  if (!(Number.isInteger(creature.minLevel) && creature.minLevel >= 1 && creature.minLevel <= 100)) errors.push(`${label} : minLevel invalide`);
  return errors;
}

function checkSprite(creature, data) {
  const label = `bestiole ${creature.id}`;
  if (creature.sprite === 'handmade') {
    return data.handDrawnCreatures.has(creature.id) ? [] : [`${label} : sprite 'handmade' sans source dessinée`];
  }
  if (!creature.sprite || typeof creature.sprite !== 'object') return [`${label} : sprite manquant`];
  return validateCreatureSpec(creature.sprite).map((error) => `${label} : sprite ${error}`);
}

function checkLearnset(creature, data) {
  const errors = [];
  const label = `bestiole ${creature.id}`;
  const learnset = creature.learnset ?? [];
  const moves = new Map(data.moves.map((move) => [move.id, move]));
  let previous = 0;
  for (const [level, moveId] of learnset) {
    const move = moves.get(moveId);
    if (!move) errors.push(`${label} : attaque inconnue « ${moveId} »`);
    else if (move.learnable === false) errors.push(`${label} : « ${moveId} » ne s’apprend pas`);
    else if (move.exclusiveTo && !move.exclusiveTo.includes(creature.id)) errors.push(`${label} : « ${moveId} » est réservée à ${move.exclusiveTo.join(', ')}`);
    if (!(Number.isInteger(level) && level >= 1 && level <= 100)) errors.push(`${label} : niveau invalide pour ${moveId}`);
    if (level < previous) errors.push(`${label} : learnset non trié (${moveId})`);
    previous = level;
  }
  const ids = learnset.map(([, moveId]) => moveId);
  if (new Set(ids).size !== ids.length) errors.push(`${label} : attaque apprise deux fois`);
  const known = learnset.filter(([level]) => level <= creature.minLevel).length;
  if (known < MIN_MOVES_AT_MIN_LEVEL) errors.push(`${label} : ${known} attaques au niveau ${creature.minLevel} (min ${MIN_MOVES_AT_MIN_LEVEL})`);
  const firstDamaging = learnset.find(([level, moveId]) => level === 1 && moves.get(moveId)?.category !== 'status');
  if (!firstDamaging) errors.push(`${label} : aucune attaque offensive au niveau 1`);
  errors.push(...checkTypeMoveRhythm(creature, moves));
  return errors;
}

/** Own-type moves are learned regularly up to level 60 (gaps of at most MAX_TYPE_MOVE_GAP). */
function checkTypeMoveRhythm(creature, moves) {
  const levels = creature.learnset
    .filter(([, moveId]) => creature.types.includes(moves.get(moveId)?.type))
    .map(([level]) => level);
  const checkpoints = [1, ...levels.filter((level) => level <= LAST_LEARNSET_LEVEL), LAST_LEARNSET_LEVEL];
  for (let i = 1; i < checkpoints.length; i += 1) {
    if (checkpoints[i] - checkpoints[i - 1] > MAX_TYPE_MOVE_GAP) {
      return [`bestiole ${creature.id} : aucune attaque de son type entre les niveaux ${checkpoints[i - 1]} et ${checkpoints[i]}`];
    }
  }
  return [];
}

export function checkCreatures(data) {
  const errors = data.creatures.flatMap((creature) => [
    ...checkFields(creature, data),
    ...checkSprite(creature, data),
    ...checkLearnset(creature, data),
  ]);
  for (const type of Object.keys(data.types)) {
    const count = data.creatures.filter((creature) => creature.types[0] === type).length;
    if (count < MIN_CREATURES_PER_TYPE) errors.push(`type ${type} : ${count} bestioles de type principal (min ${MIN_CREATURES_PER_TYPE})`);
  }
  return errors;
}
