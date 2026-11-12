// Wild encounters (pure). Tables: [{ creature, minLevel, maxLevel, weight }].
// `encounters.rate` is the chance in percent per step on an encounter tile.

/** Table kind for the tile the player just stepped on, or null. */
export function encounterKind(tile, { surfing, mapEncounters }) {
  if (!mapEncounters) return null;
  if (surfing) return mapEncounters.water ? 'water' : null;
  if (tile.grass) return mapEncounters.grass ? 'grass' : null;
  if (mapEncounters.cave && !tile.solid && !tile.water) return 'cave';
  return null;
}

/** Picks an entry by weight and a level in its range. */
export function pickEncounter(table, rng) {
  const entry = rng.weighted(table);
  return { creature: entry.creature, level: rng.int(entry.minLevel, entry.maxLevel) };
}

/**
 * Rolls a step. Returns { creature, level } or null.
 * With a repel active, wild creatures below the level of the first party member are ignored.
 */
export function rollEncounter({ mapEncounters, kind, rng, repelActive = false, leadLevel = 0 }) {
  if (!kind) return null;
  if (rng.next() * 100 >= mapEncounters.rate) return null;
  const encounter = pickEncounter(mapEncounters[kind], rng);
  if (repelActive && encounter.level < leadLevel) return null;
  return encounter;
}
