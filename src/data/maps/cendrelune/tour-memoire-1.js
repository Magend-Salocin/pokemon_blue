// Tour de la Mémoire, ground floor: memorial steles, rival battle 3 at the entrance.
// Floors are linked by memory tiles (teleporters X).
export default {
  id: 'tour_memoire_1',
  name: 'Tour de la Mémoire',
  tileset: 'special',
  music: 'memory_tower',
  layers: {
    ground: [
      '##############',
      '#,,,,,X,,,,,,#',
      '#,#,,,,,,,,#,#',
      '#............#',
      '#.#..,,,,..#.#',
      '#....,,,,....#',
      '#.#..,,,,..#.#',
      '#............#',
      '#............#',
      '#............#',
      '#............#',
      '######.#######',
    ],
  },
  encounters: null,
  warps: [
    { x: 6, y: 11, to: 'cendrelune', toX: 11, toY: 4 },
    { x: 6, y: 1, to: 'tour_memoire_2', toX: 6, toY: 12 },
  ],
  npcs: [
    { id: 'rival', sprite: 'rival', x: 6, y: 3, facing: 'down', movement: 'static', showIf: 'rival_3_visible', hideIf: 'rival_3_done', script: [] },
    { id: 'recueillie', sprite: 'vieille_dame', x: 3, y: 5, facing: 'up', movement: 'static', script: [{ cmd: 'say', text: 'tour_memoire_1_vieille_dame' }] },
    { id: 'mystique', sprite: 'mystique', x: 10, y: 8, facing: 'left', movement: 'look', script: [{ cmd: 'say', text: 'tour_memoire_1_mystique' }] },
  ],
  trainers: [],
  signs: [
    { x: 2, y: 4, text: 'tour_memoire_stele_1' },
    { x: 11, y: 4, text: 'tour_memoire_stele_2' },
    { x: 2, y: 6, text: 'tour_memoire_stele_3' },
    { x: 11, y: 6, text: 'tour_memoire_stele_4' },
  ],
  items: [],
  hiddenItems: [],
  triggers: [{ x: 1, y: 9, w: 12, h: 1, script: [{ cmd: 'call', script: 'rival_3' }] }],
  connections: {},
  scripts: {
    rival_3: [{
      cmd: 'if_flag', flag: 'rival_3_done',
      else: [
        { cmd: 'set_flag', flag: 'rival_3_visible' },
        { cmd: 'show_actor', actor: 'rival' },
        { cmd: 'say', text: 'tour_memoire_rival_appel' },
        { cmd: 'move', actor: 'rival', path: ['down', 'down', 'down'] },
        { cmd: 'face', actor: 'player', direction: 'up' },
        { cmd: 'say', text: 'rival_3_intro' },
        {
          cmd: 'battle', trainer: 'rival_3', onLose: 'continue',
          won: [{ cmd: 'say', text: 'tour_memoire_rival_gagne' }],
          lost: [{ cmd: 'heal_party' }, { cmd: 'say', text: 'tour_memoire_rival_perdu' }],
        },
        { cmd: 'set_flag', flag: 'rival_3_done' },
        { cmd: 'say', text: 'tour_memoire_rival_syndicat' },
        { cmd: 'move', actor: 'rival', path: ['up', 'up', 'up', 'up', 'up'] },
        { cmd: 'hide_actor', actor: 'rival' },
      ],
    }],
  },
};
