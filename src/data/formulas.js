// Pure stat and experience formulas (game design, section 5).

export const MAX_LEVEL = 100;
export const MAX_GENE = 15;
export const MAX_TRAINING = 255;
export const STAT_KEYS = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];
export const GROWTH_RATES = ['fast', 'medium', 'slow'];

function statCore(base, gene, training, level) {
  return Math.floor(((2 * base + gene + Math.floor(training / 4)) * level) / 100);
}

/** PV = floor((2 × base + gène + floor(entr / 4)) × niveau / 100) + niveau + 10 */
export function computeHp(base, gene, training, level) {
  return statCore(base, gene, training, level) + level + 10;
}

/** Stat = floor((2 × base + gène + floor(entr / 4)) × niveau / 100) + 5 */
export function computeStat(base, gene, training, level) {
  return statCore(base, gene, training, level) + 5;
}

/** All six stats. `genes` and `training` are { hp, atk, … } objects (missing keys = 0). */
export function computeStats(baseStats, level, genes = {}, training = {}) {
  const result = {};
  for (const key of STAT_KEYS) {
    const compute = key === 'hp' ? computeHp : computeStat;
    result[key] = compute(baseStats[key], genes[key] ?? 0, training[key] ?? 0, level);
  }
  return result;
}

const CURVES = {
  fast: (n) => Math.floor((4 * n ** 3) / 5),
  medium: (n) => n ** 3,
  slow: (n) => Math.floor((5 * n ** 3) / 4),
};

/** Total experience needed to reach `level` (0 at level 1). */
export function expForLevel(growth, level) {
  const curve = CURVES[growth];
  if (!curve) throw new Error(`Unknown growth rate: ${growth}`);
  if (level <= 1) return 0;
  return curve(Math.min(level, MAX_LEVEL));
}

/** Highest level whose experience threshold is reached by `exp`. */
export function levelForExp(growth, exp) {
  let level = 1;
  while (level < MAX_LEVEL && expForLevel(growth, level + 1) <= exp) level += 1;
  return level;
}
