// Damage, critical hits and accuracy (game design, section 5).
import { getEffectiveness } from '../../data/types.js';
import { getSpecies } from './creature.js';

export const STAB = 1.5;
export const CRITICAL_MULTIPLIER = 1.5;
export const BURN_MULTIPLIER = 0.5;
export const SCREEN_MULTIPLIER = 0.5;

/** Multiplier of a stat stage (−6 to +6) for atk, def, spa, spd, spe. */
export function stageMultiplier(stage) {
  return stage >= 0 ? (2 + stage) / 2 : 2 / (2 - stage);
}

/** Multiplier of a combined accuracy − evasion stage. */
export function accuracyMultiplier(stage) {
  const clamped = Math.max(-6, Math.min(6, stage));
  return clamped >= 0 ? (3 + clamped) / 3 : 3 / (3 - clamped);
}

export function effectiveStat(creature, stages, stat) {
  return Math.max(1, Math.floor(creature.stats[stat] * stageMultiplier(stages[stat])));
}

/** Speed used for turn order: stages, then ÷4 when paralyzed. */
export function effectiveSpeed(creature, stages) {
  const speed = effectiveStat(creature, stages, 'spe');
  return creature.status?.id === 'par' ? Math.max(1, Math.floor(speed / 4)) : speed;
}

export function typesOf(creature) {
  return getSpecies(creature.species).types;
}

/** 1/16, 1/8 with a high-crit move or focus, 1/4 with both. */
export function criticalChance(move, critUp) {
  const level = (move.highCrit ? 1 : 0) + (critUp ? 1 : 0);
  return [1 / 16, 1 / 8, 1 / 4][level];
}

/** Hit check. `accuracy: null` never misses. */
export function rollHit(move, attackerStages, defenderStages, rng) {
  if (move.accuracy === null) return true;
  const chance = move.accuracy * accuracyMultiplier(attackerStages.acc - defenderStages.eva);
  return rng.next() * 100 < chance;
}

/** base = floor(floor(floor(2 × niveau / 5 + 2) × puissance × Att / Déf) / 50) + 2 */
export function baseDamage(level, power, attack, defense) {
  return Math.floor(Math.floor(Math.floor((2 * level) / 5 + 2) * power * attack / defense) / 50) + 2;
}

/**
 * Full damage of one hit. attacker/defender: { creature, stages, screens? }.
 * options: { critical, random (0.85 to 1), power (override) }.
 * Returns { damage, effectiveness, critical }.
 */
export function computeDamage(move, attacker, defender, { critical = false, random = 1, power = move.power } = {}) {
  const effectiveness = getEffectiveness(move.type, typesOf(defender.creature));
  if (effectiveness === 0) return { damage: 0, effectiveness, critical: false };
  const physical = move.category === 'physical';
  const attackStat = physical ? 'atk' : 'spa';
  const defenseStat = physical ? 'def' : 'spd';
  // A critical hit ignores the attacker's drops and the defender's boosts.
  const attackStages = { ...attacker.stages, [attackStat]: critical ? Math.max(0, attacker.stages[attackStat]) : attacker.stages[attackStat] };
  const defenseStages = { ...defender.stages, [defenseStat]: critical ? Math.min(0, defender.stages[defenseStat]) : defender.stages[defenseStat] };
  const attack = effectiveStat(attacker.creature, attackStages, attackStat);
  const defense = effectiveStat(defender.creature, defenseStages, defenseStat);

  let multiplier = typesOf(attacker.creature).includes(move.type) ? STAB : 1;
  multiplier *= effectiveness;
  if (critical) multiplier *= CRITICAL_MULTIPLIER;
  if (physical && attacker.creature.status?.id === 'brl') multiplier *= BURN_MULTIPLIER;
  if (!critical && defender.screens?.[move.category] > 0) multiplier *= SCREEN_MULTIPLIER;

  const base = baseDamage(attacker.creature.level, power, attack, defense);
  const damage = Math.max(1, Math.floor(base * multiplier * random));
  return { damage, effectiveness, critical };
}

/** Random factor in [0.85, 1], in steps of 0.01. */
export function rollRandomFactor(rng) {
  return (85 + rng.int(0, 15)) / 100;
}
