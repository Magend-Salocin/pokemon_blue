// Test map (dev only): interior with an exit doormat and a healing NPC.
export default {
  id: 'test_maison',
  name: 'Maison d’essai',
  tileset: 'indoor',
  music: 'house',
  layers: {
    ground: [
      '#w##w###',
      '#L....P#',
      '#L.....#',
      '#..tt..#',
      '#..tt..#',
      '#......#',
      '#......#',
      '###m####',
    ],
  },
  encounters: null,
  warps: [{ x: 3, y: 7, to: 'test_bourg', toX: 4, toY: 4 }],
  npcs: [
    { id: 'maman', sprite: 'maman', x: 5, y: 5, facing: 'down', movement: 'static', script: [{ cmd: 'say', text: 'test_mom' }, { cmd: 'heal_party' }] },
  ],
  trainers: [],
  signs: [],
  items: [],
  hiddenItems: [],
  triggers: [{ x: 1, y: 5, w: 1, h: 2, once: true, flag: 'test_trigger_corner', script: [{ cmd: 'say', text: 'test_trigger' }] }],
  connections: {},
};
