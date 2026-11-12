// Test map (dev only): Halte with nurse, Comptoir clerk and storage terminal.
export default {
  id: 'test_halte',
  name: 'Halte d’essai',
  tileset: 'indoor',
  music: 'halte',
  layers: {
    ground: [
      '##H###K#',
      '#,,,,,,#',
      '#[--],,#',
      '#,,,,,,#',
      '#P,,,,P#',
      '#,,,,,,#',
      '#,,,,,,#',
      '###m####',
    ],
  },
  encounters: null,
  warps: [{ x: 3, y: 7, to: 'test_bourg', toX: 9, toY: 3 }],
  npcs: [
    { id: 'infirmiere', sprite: 'infirmiere', x: 2, y: 1, facing: 'down', movement: 'static', script: [{ cmd: 'call', script: 'halte_heal' }] },
    {
      id: 'vendeur', sprite: 'vendeur', x: 4, y: 1, facing: 'down', movement: 'static',
      script: [{
        cmd: 'open_menu', menu: 'shop',
        params: { stock: [{ item: 'potion' }, { item: 'antidote' }, { item: 'capsule' }, { item: 'repulsif' }, { item: 'super_capsule', badge: 'eau' }, { item: 'potion_forte', badge: 'foudre' }] },
      }],
    },
  ],
  trainers: [],
  signs: [],
  items: [],
  hiddenItems: [],
  triggers: [],
  connections: {},
};
