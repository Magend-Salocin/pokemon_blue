// Bourg-Sablon: first Halte, Comptoir (Colis Morvan) and the Roche arena.
// The east exit to Route 2 stays locked until the player has the Bestiaire.
/** East exit without the Bestiaire: the guard stops the player, who steps back. */
const GATE_ROUTE_2 = [
  {
    cmd: 'if_flag', flag: 'has_bestiary',
    else: [
      { cmd: 'face', actor: 'garde', direction: 'player' },
      { cmd: 'say', text: 'bourg_sablon_gate' },
      { cmd: 'move', actor: 'player', path: ['left'] },
    ],
  },
];

export default {
  id: 'bourg_sablon',
  name: 'Bourg-Sablon',
  tileset: 'town',
  music: 'town_1',
  border: 'T',
  flyPoint: { x: 14, y: 5 },
  layers: {
    ground: [
      'TTTTTTTTTTTTTTTTTTTT',
      'TTTTTTTTTTTTTTTTTTTT',
      'TT________________TT',
      'TT________________TT',
      'TT________________TT',
      'TT__:__S_:____:___TT',
      'TT__::::::::::::__TT',
      'TT_______::_______TT',
      'TT_______:::::::::::',
      'TT_______:::::::::::',
      'TT_______::_______TT',
      'TT_______::_______TT',
      'TT_______::_______TT',
      'TT__::::::::::::__TT',
      'TT_**____::S___**_TT',
      'TT_______::_______TT',
      'FTTTTTTTT::TTTTTTTTF',
      'FTTTTTTTT::TTTTTTTTF',
    ],
  },
  structures: [
    { type: 'arena', x: 2, y: 2, width: 5, door: 2 },
    { type: 'house_b', x: 8, y: 2, width: 4, door: 1 },
    { type: 'halte', x: 13, y: 2, width: 4, door: 1 },
    { type: 'house_a', x: 3, y: 10, width: 4, door: 1 },
    { type: 'comptoir', x: 12, y: 10, width: 4, door: 1 },
  ],
  encounters: null,
  warps: [
    { x: 4, y: 4, to: 'arene_roche', toX: 5, toY: 13 },
    { x: 9, y: 4, to: 'maison_bourg_sablon_1', toX: 3, toY: 7 },
    { x: 14, y: 4, to: 'halte_bourg_sablon', toX: 4, toY: 7 },
    { x: 4, y: 12, to: 'maison_bourg_sablon_2', toX: 3, toY: 7 },
    { x: 13, y: 12, to: 'comptoir_bourg_sablon', toX: 3, toY: 7 },
  ],
  npcs: [
    {
      id: 'garde', sprite: 'vieil_homme', x: 17, y: 7, facing: 'down', movement: 'static',
      script: [{ cmd: 'if_flag', flag: 'has_bestiary', then: [{ cmd: 'say', text: 'bourg_sablon_garde_apres' }], else: [{ cmd: 'say', text: 'bourg_sablon_gate' }] }],
    },
    { id: 'dame', sprite: 'vieille_dame', x: 7, y: 7, facing: 'down', movement: 'look', script: [{ cmd: 'say', text: 'bourg_sablon_dame' }] },
    { id: 'gamin', sprite: 'gamin', x: 6, y: 15, facing: 'up', movement: 'wander', radius: 1, script: [{ cmd: 'say', text: 'bourg_sablon_gamin' }] },
    { id: 'randonneur', sprite: 'randonneur', x: 16, y: 11, facing: 'left', movement: 'look', script: [{ cmd: 'say', text: 'bourg_sablon_randonneur' }] },
    { id: 'ouvrier', sprite: 'ouvrier', x: 13, y: 15, facing: 'left', movement: 'static', script: [{ cmd: 'say', text: 'bourg_sablon_ouvrier' }] },
    { id: 'dresseuse', sprite: 'dresseuse', x: 11, y: 7, facing: 'down', movement: 'look', script: [{ cmd: 'say', text: 'bourg_sablon_dresseuse' }] },
  ],
  trainers: [],
  signs: [
    { x: 11, y: 14, text: 'sign_bourg_sablon' },
    { x: 7, y: 5, text: 'sign_arene_roche' },
  ],
  items: [{ x: 17, y: 3, item: 'repulsif', flag: 'item_bourg_sablon_1' }],
  hiddenItems: [{ x: 2, y: 15, item: 'capsule', flag: 'hidden_bourg_sablon_1' }],
  triggers: [{ x: 19, y: 8, w: 1, h: 2, script: GATE_ROUTE_2 }],
  connections: { north: null, south: 'route_1', east: 'route_2', west: null },
};
