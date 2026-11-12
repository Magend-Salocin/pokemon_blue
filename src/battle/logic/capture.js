// Capture (game design, section 5).
//   a = ((3 × PVmax − 2 × PV) × tauxEspèce × bonusCapsule) / (3 × PVmax) × bonusStatut
//   4 shake checks succeed with b = 65536 / (255 / a)^0.1875 out of 65536; a ≥ 255 always catches.
import { getSpecies } from './creature.js';

export const SHAKE_CHECKS = 4;

export function statusBonus(creature) {
  const id = creature.status?.id;
  if (id === 'som' || id === 'gel') return 2;
  if (id === 'par' || id === 'psn' || id === 'brl') return 1.5;
  return 1;
}

export function captureValue(creature, ballBonus) {
  const { hp } = creature;
  const maxHp = creature.stats.hp;
  const rate = getSpecies(creature.species).catchRate;
  return (((3 * maxHp - 2 * hp) * rate * ballBonus) / (3 * maxHp)) * statusBonus(creature);
}

export function shakeThreshold(a) {
  return 65536 / (255 / a) ** 0.1875;
}

/** Returns { caught, shakes } with shakes from 0 to 3 (the number of visible shakes). */
export function attemptCapture(creature, ball, rng) {
  if (ball.guaranteed) return { caught: true, shakes: 3 };
  const a = captureValue(creature, ball.bonus);
  if (a >= 255) return { caught: true, shakes: 3 };
  const b = shakeThreshold(a);
  let passed = 0;
  while (passed < SHAKE_CHECKS && rng.int(0, 65535) < b) passed += 1;
  return { caught: passed === SHAKE_CHECKS, shakes: Math.min(3, passed) };
}
