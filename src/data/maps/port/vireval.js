// Vireval: industrial town. The Syndicat Opale diverts the town's power from its factory, so the
// Arène Foudre stays closed (a worker blocks its door) until the usine is cleared.
// North passage (columns 9-10) leads to the Route 6.
export default {
  id: 'vireval',
  name: 'Vireval',
  tileset: 'town',
  music: 'town_1',
  border: 'T',
  flyPoint: { x: 3, y: 5 },
  layers: {
    ground: [
      'TTTTTTTT#::#TTTTTTTT',
      'TTTTTTTT#::#TTTTTTTT',
      'TT_______::_______TT',
      'TT_______::_______TT',
      'TT_______::_______TT',
      'TT_______::_______TT',
      'TT_______::_______TT',
      'TT_______::_______TT',
      '::::::::::::::::::TT',
      '::::::::::::::::::TT',
      'TT*_____S::_______TT',
      'TT_______::_______TT',
      'TT_______::_______TT',
      'TT_______::_______TT',
      'TT_______::_______TT',
      'TT_______::**_____TT',
      'TTTTTTTTTTTTTTTTTTTT',
      'TTTTTTTTTTTTTTTTTTTT',
    ],
  },
  structures: [
    { type: 'halte', x: 2, y: 2, width: 4, door: 1 },
    { type: 'house_b', x: 5, y: 5, width: 4, door: 1 },
    { type: 'comptoir', x: 11, y: 2, width: 4, door: 1 },
    { type: 'turbine', x: 16, y: 2 },
    { type: 'turbine', x: 17, y: 2 },
    { type: 'house_c', x: 14, y: 5, width: 4, door: 1 },
    { type: 'factory', x: 2, y: 11, width: 6, door: 2 },
    { type: 'arena', x: 12, y: 11, width: 5, door: 2 },
    { type: 'turbine', x: 17, y: 14 },
  ],
  encounters: null,
  warps: [
    { x: 3, y: 4, to: 'halte_vireval', toX: 4, toY: 7 },
    { x: 6, y: 7, to: 'maison_vireval_1', toX: 3, toY: 7 },
    { x: 12, y: 4, to: 'comptoir_vireval', toX: 3, toY: 7 },
    { x: 15, y: 7, to: 'maison_vireval_2', toX: 3, toY: 7 },
    { x: 4, y: 13, to: 'usine_opale_1', toX: 8, toY: 11 },
    { x: 14, y: 13, to: 'arene_foudre', toX: 5, toY: 13 },
  ],
  npcs: [
    {
      id: 'ouvrier_panne', sprite: 'ouvrier', x: 14, y: 14, facing: 'down', movement: 'static',
      hideIf: 'usine_opale_cleared', script: [{ cmd: 'say', text: 'vireval_ouvrier_panne' }],
    },
    { id: 'ingenieure', sprite: 'scientifique', x: 16, y: 4, facing: 'down', movement: 'look', script: 'ingenieure' },
    { id: 'gamin', sprite: 'gamin', x: 6, y: 14, facing: 'up', movement: 'wander', radius: 1, script: [{ cmd: 'say', text: 'vireval_gamin' }] },
    { id: 'vieille_dame', sprite: 'vieille_dame', x: 3, y: 15, facing: 'right', movement: 'look', script: [{ cmd: 'say', text: 'vireval_vieille_dame' }] },
    { id: 'contremaitre', sprite: 'ouvrier', x: 11, y: 6, facing: 'down', movement: 'look', script: [{ cmd: 'say', text: 'vireval_contremaitre' }] },
    { id: 'randonneur', sprite: 'randonneur', x: 11, y: 2, facing: 'left', movement: 'static', script: [{ cmd: 'say', text: 'vireval_randonneur' }] },
  ],
  trainers: [],
  signs: [{ x: 8, y: 10, text: 'sign_vireval' }],
  items: [{ x: 17, y: 10, item: 'repulsif_fort', flag: 'item_vireval_1' }],
  hiddenItems: [{ x: 2, y: 15, item: 'liniment', flag: 'hidden_vireval_1' }],
  triggers: [],
  connections: { north: 'route_6', south: null, east: null, west: 'route_5' },
  scripts: {
    ingenieure: [
      {
        cmd: 'if_flag', flag: 'vireval_lanterne',
        then: [{ cmd: 'say', text: 'vireval_ingenieure_after' }],
        else: [
          {
            cmd: 'if_badge', badge: 'foudre',
            then: [
              { cmd: 'say', text: 'vireval_ingenieure_don' },
              { cmd: 'give_item', item: 'lanterne' },
              { cmd: 'set_flag', flag: 'vireval_lanterne' },
              { cmd: 'say', text: 'vireval_ingenieure_conseil' },
            ],
            else: [
              {
                cmd: 'if_flag', flag: 'usine_opale_cleared',
                then: [{ cmd: 'say', text: 'vireval_ingenieure_arene' }],
                else: [{ cmd: 'say', text: 'vireval_ingenieure_panne' }],
              },
            ],
          },
        ],
      },
    ],
  },
};
