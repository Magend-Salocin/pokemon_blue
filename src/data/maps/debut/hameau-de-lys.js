// Hameau-de-Lys: home town. The north exit is locked by Pr Morvan until the player has a starter.
import { STARTER_EVENT } from './labo-morvan.js';

/** Pr Morvan runs from the lab to the player standing on the north exit, then takes them to the lab. */
function gateScript(morvanPath) {
  return [
    {
      cmd: 'if_flag', flag: 'got_starter',
      else: [
        { cmd: 'say', text: 'hameau_morvan_stop' },
        { cmd: 'face', actor: 'player', direction: 'down' },
        { cmd: 'set_flag', flag: 'hameau_morvan_visible' },
        { cmd: 'show_actor', actor: 'morvan' },
        { cmd: 'move', actor: 'morvan', path: morvanPath },
        { cmd: 'face', actor: 'morvan', direction: 'up' },
        { cmd: 'say', text: 'hameau_morvan_danger' },
        { cmd: 'clear_flag', flag: 'hameau_morvan_visible' },
        { cmd: 'fade', direction: 'out' },
        { cmd: 'warp', map: 'labo_morvan', x: 4, y: 12, facing: 'up' },
        { cmd: 'move', actor: 'player', path: ['up', 'up', 'up', 'up', 'up', 'up', 'up', 'up'] },
        ...STARTER_EVENT,
      ],
    },
  ];
}

export default {
  id: 'hameau_de_lys',
  name: 'Hameau-de-Lys',
  tileset: 'town',
  music: 'hometown',
  border: 'T',
  flyPoint: { x: 4, y: 6 },
  layers: {
    ground: [
      'FTTTTTTTT::TTTTTTTTF',
      'FTTTTTTTT::TTTTTTTTF',
      'TT_______::_______TT',
      'TT_______::_______TT',
      'TT_______::_______TT',
      'TT_____M_::_____M_TT',
      'TT__::::::::::::__TT',
      'TT______S::_______TT',
      'TT_______::_______TT',
      'TT_______::_______TT',
      'TT_~~~~__::_______TT',
      'TT_~~~~__::_______TT',
      'TT_~~~~__:::::S___TT',
      'TT______*_**_*____TT',
      'TT_**_____________TT',
      'TT________________TT',
      'TTTTTTTTTTTTTTTTTTTT',
      'TTTTTTTTTTTTTTTTTTTT',
    ],
  },
  structures: [
    { type: 'house_a', x: 3, y: 3, width: 4, door: 1 },
    { type: 'house_b', x: 12, y: 3, width: 4, door: 1 },
    { type: 'lab', x: 11, y: 9, width: 6, door: 2 },
  ],
  encounters: null,
  warps: [
    { x: 4, y: 5, to: 'maison_joueur_1f', toX: 3, toY: 7 },
    { x: 13, y: 5, to: 'maison_rival', toX: 3, toY: 7 },
    { x: 13, y: 11, to: 'labo_morvan', toX: 4, toY: 12 },
  ],
  npcs: [
    { id: 'morvan', sprite: 'professeure', x: 9, y: 8, facing: 'up', movement: 'static', showIf: 'hameau_morvan_visible', script: [{ cmd: 'say', text: 'hameau_morvan_danger' }] },
    { id: 'voisine', sprite: 'vieille_dame', x: 15, y: 7, facing: 'down', movement: 'look', script: [{ cmd: 'say', text: 'hameau_voisine' }] },
    { id: 'gamin', sprite: 'gamin', x: 6, y: 14, facing: 'down', movement: 'wander', radius: 2, script: [{ cmd: 'say', text: 'hameau_gamin' }] },
    { id: 'pecheur', sprite: 'pecheur', x: 7, y: 11, facing: 'left', movement: 'static', script: [{ cmd: 'say', text: 'hameau_pecheur' }] },
    {
      id: 'assistant', sprite: 'scientifique', x: 16, y: 13, facing: 'left', movement: 'look',
      script: [{ cmd: 'if_flag', flag: 'got_starter', then: [{ cmd: 'say', text: 'hameau_assistant_apres' }], else: [{ cmd: 'say', text: 'hameau_assistant' }] }],
    },
  ],
  trainers: [],
  signs: [
    { x: 8, y: 7, text: 'sign_hameau_de_lys' },
    { x: 14, y: 12, text: 'sign_labo_morvan' },
    { x: 7, y: 5, text: 'hameau_boite_joueur' },
    { x: 16, y: 5, text: 'hameau_boite_rival' },
  ],
  items: [],
  hiddenItems: [{ x: 2, y: 2, item: 'potion', flag: 'hidden_hameau_de_lys_1' }],
  triggers: [
    { x: 9, y: 2, w: 1, h: 1, script: gateScript(['up', 'up', 'up', 'up', 'up']) },
    { x: 10, y: 2, w: 1, h: 1, script: gateScript(['up', 'up', 'up', 'up', 'right', 'up']) },
  ],
  connections: { north: 'route_1', south: null, east: null, west: null },
};
