// Named scripts shared by every map (called with { cmd: 'call', script: '<name>' }).
// A map's own `scripts` take precedence over these.
export const SCRIPTS = {
  heal_party_at_home: [{ cmd: 'heal_party' }],

  // Halte nurse: heal with a short white flash, then this Halte becomes the respawn point.
  halte_heal: [
    {
      cmd: 'ask', text: 'halte_welcome',
      yes: [
        { cmd: 'say', text: 'halte_wait' },
        { cmd: 'play_sfx', sfx: 'heal' },
        { cmd: 'fade', direction: 'out', color: 'white' },
        { cmd: 'heal_party' },
        { cmd: 'wait', seconds: 0.4 },
        { cmd: 'fade', direction: 'in' },
        { cmd: 'set_respawn' },
        { cmd: 'say', text: 'halte_done' },
      ],
      no: [{ cmd: 'say', text: 'halte_no' }],
    },
  ],
};
