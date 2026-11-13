// Compact builders for src/data/trainers/<zone>.js.
// A party member is 'species:level' or { creature, level, moves }.
// Text ids are derived from the trainer id: <id>_intro, <id>_defeat, <id>_after (and <id>_last
// with `last: true`, said before the trainer sends the last creature).

export const STARTERS = ['fenouillot', 'braisille', 'flaquin'];

function member(entry) {
  if (typeof entry !== 'string') return entry;
  const [creature, level] = entry.split(':');
  return { creature, level: Number(level) };
}

/** trainer('gamin_leo', 'gamin', 'Léo', ['pivelin:3', 'musaraille:4'], { ai: 'smart', last: true }) */
export function trainer(id, trainerClass, name, party, { last = false, ...options } = {}) {
  return {
    id,
    class: trainerClass,
    name,
    party: party.map(member),
    intro: `${id}_intro`,
    defeat: `${id}_defeat`,
    after: `${id}_after`,
    ...(last ? { lastText: `${id}_last` } : {}),
    ...options,
  };
}

/**
 * Rival battle: one party per starter of the PLAYER (keys of STARTERS). The rival owns the
 * starter that beats the player's. `party` (used when no starter is known) is the first one.
 */
export function rival(id, partiesByPlayerStarter, options = {}) {
  const partyByStarter = Object.fromEntries(STARTERS.map((starter) => [starter, partiesByPlayerStarter[starter].map(member)]));
  return { ...trainer(id, 'rival', '', partiesByPlayerStarter.fenouillot, options), partyByStarter };
}
