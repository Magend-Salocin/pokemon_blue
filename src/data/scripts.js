// Named scripts shared by every map (called with { cmd: 'call', script: '<name>' }).
// A map's own `scripts` take precedence over these.
export const SCRIPTS = {
  heal_party_at_home: [{ cmd: 'heal_party' }],
};
