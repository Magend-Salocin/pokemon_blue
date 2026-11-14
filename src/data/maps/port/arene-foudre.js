// Arène Foudre de Vireval: floor switches remove electric barriers, in a fixed order.
// Switch 1 (1, 9) opens the barrier (7, 7); switch 2 (10, 5) then opens the barrier (5, 3) before Sélène.
const switchScript = (barrier) => [
  { cmd: 'play_sfx', sfx: 'teleporter' },
  { cmd: 'hide_actor', actor: barrier },
  { cmd: 'say', text: 'arene_foudre_interrupteur' },
];

export default {
  id: 'arene_foudre',
  name: 'Arène de Vireval',
  tileset: 'indoor',
  music: 'town_2',
  layers: {
    ground: [
      '#ww######ww#',
      '#,,,,,,,,,,#',
      '#,,,,,,,,,,#',
      '#####,######',
      '#,,,,,,,,,,#',
      '#,,,,,,,,,r#',
      '#,,,,,,,,,,#',
      '#######,####',
      '#,,,,,,,,,,#',
      '#r,,,,,,,,,#',
      '#,,,,,,,,,,#',
      '#P,,,,,,,,P#',
      '#,,,,,,,,,,#',
      '#####m######',
    ],
  },
  encounters: null,
  warps: [{ x: 5, y: 13, to: 'vireval', toX: 14, toY: 13 }],
  npcs: [
    { id: 'selene', sprite: 'selene', x: 6, y: 1, facing: 'down', movement: 'static', script: 'leader' },
    {
      id: 'barriere_1', sprite: 'barriere', x: 7, y: 7, facing: 'down', movement: 'static',
      hideIf: 'arene_foudre_plaque_1', script: [{ cmd: 'say', text: 'arene_foudre_barriere' }],
    },
    {
      id: 'barriere_2', sprite: 'barriere', x: 5, y: 3, facing: 'down', movement: 'static',
      hideIf: 'arene_foudre_plaque_2', script: [{ cmd: 'say', text: 'arene_foudre_barriere' }],
    },
    { id: 'conseiller', sprite: 'ouvrier', x: 4, y: 12, facing: 'right', movement: 'static', script: [{ cmd: 'say', text: 'arene_foudre_conseiller' }] },
  ],
  trainers: [
    { id: 'ouvrier_remi', sprite: 'ouvrier', x: 9, y: 9, facing: 'left', sight: 4, trainer: 'ouvrier_remi' },
    { id: 'scientifique_gaspard', sprite: 'scientifique', x: 2, y: 5, facing: 'right', sight: 4, trainer: 'scientifique_gaspard' },
    { id: 'chercheuse_lea', sprite: 'scientifique', x: 9, y: 2, facing: 'left', sight: 3, trainer: 'chercheuse_lea' },
  ],
  signs: [],
  items: [],
  hiddenItems: [],
  triggers: [
    { x: 1, y: 9, once: true, flag: 'arene_foudre_plaque_1', script: switchScript('barriere_1') },
    { x: 10, y: 5, once: true, flag: 'arene_foudre_plaque_2', script: switchScript('barriere_2') },
  ],
  connections: {},
  scripts: {
    leader: [
      {
        cmd: 'if_badge', badge: 'foudre',
        then: [{ cmd: 'say', text: 'selene_after' }],
        else: [
          { cmd: 'say', text: 'selene_intro' },
          { cmd: 'battle', trainer: 'selene' },
          { cmd: 'say', text: 'selene_badge' },
          { cmd: 'give_badge', badge: 'foudre' },
          { cmd: 'say', text: 'selene_badge_effect' },
          { cmd: 'give_item', item: 'pierre_orage' },
          { cmd: 'say', text: 'selene_reward' },
        ],
      },
    ],
  },
};
