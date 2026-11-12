/**
 * Seeded pseudo-random generator (mulberry32). Every random game function receives one,
 * which keeps tests and battles reproducible.
 */
export function createRng(seed = Date.now()) {
  let state = seed >>> 0;

  function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Integer in [min, max], both inclusive. */
  function int(min, max) {
    if (!Number.isInteger(min) || !Number.isInteger(max) || max < min) {
      throw new RangeError(`int(${min}, ${max}): invalid bounds`);
    }
    return min + Math.floor(next() * (max - min + 1));
  }

  function chance(probability) {
    return next() < probability;
  }

  function pick(array) {
    if (array.length === 0) throw new RangeError('pick: empty array');
    return array[Math.floor(next() * array.length)];
  }

  /** Returns one entry, with probability proportional to entry.weight. */
  function weighted(entries) {
    const total = entries.reduce((sum, entry) => sum + entry.weight, 0);
    if (!(total > 0)) throw new RangeError('weighted: total weight must be positive');

    let roll = next() * total;
    for (const entry of entries) {
      roll -= entry.weight;
      if (roll < 0) return entry;
    }
    return entries.findLast((entry) => entry.weight > 0);
  }

  return {
    next,
    int,
    chance,
    pick,
    weighted,
    getState: () => state,
    setState: (value) => {
      state = value >>> 0;
    },
  };
}
