// Grotte des Cascades, level 2: ladder up to level 1 (bottom left), exit ladder to Port-Ondine
// at (22, 10). The rival waits in the exit corridor (trigger across x = 16, rows 9-11).
export default {
  id: 'grotte_des_cascades_2',
  name: 'Grotte des Cascades',
  tileset: 'cave',
  music: 'cave',
  dark: false,
  layers: {
    ground: [
      '########################',
      '#.....A......#.........#',
      '#.~~~~.......#..A......#',
      '#.~~~~...A...#......~~.#',
      '#.~~~~.......#......~~.#',
      '#............#..A......#',
      '#..A...####..#.........#',
      '#......####............#',
      '###.......A...##########',
      '#.....................##',
      '#...A.................U#',
      '#.......~~~...........##',
      '###.....~~~...##########',
      '#.......~~~....A.......#',
      '#..A..........######...#',
      '#######..A....#..A.....#',
      '#......................#',
      '#.U....###.....A....A..#',
      '#......###.............#',
      '########################',
    ],
  },
  encounters: {
    rate: 8,
    cave: [
      { creature: 'caillotin', minLevel: 11, maxLevel: 13, weight: 25 },
      { creature: 'noctule', minLevel: 11, maxLevel: 13, weight: 25 },
      { creature: 'quartzelle', minLevel: 11, maxLevel: 13, weight: 15 },
      { creature: 'fouisseron', minLevel: 11, maxLevel: 13, weight: 15 },
      { creature: 'crabouille', minLevel: 11, maxLevel: 14, weight: 12 },
      { creature: 'grenaillon', minLevel: 12, maxLevel: 14, weight: 8 },
    ],
  },
  warps: [
    { x: 2, y: 17, to: 'grotte_des_cascades', toX: 25, toY: 2 },
    { x: 22, y: 10, to: 'port_ondine', toX: 0, toY: 8 },
  ],
  npcs: [
    // Never shown on load (rival_2_visible is never set): appears only during the scene.
    { id: 'rivale', sprite: 'rival', x: 21, y: 10, facing: 'left', movement: 'static',
      showIf: 'rival_2_visible', script: [{ cmd: 'say', text: 'rival_2_after' }] },
  ],
  trainers: [
    { id: 'montagnard_auguste', sprite: 'montagnard', x: 9, y: 3, facing: 'down', sight: 3, trainer: 'montagnard_auguste' },
    { id: 'randonneuse_berenice', sprite: 'dresseuse', x: 3, y: 13, facing: 'right', sight: 4, trainer: 'randonneuse_berenice' },
    { id: 'randonneur_lucien', sprite: 'randonneur', x: 13, y: 16, facing: 'down', sight: 2, trainer: 'randonneur_lucien' },
  ],
  signs: [],
  items: [
    { x: 22, y: 1, item: 'potion_forte', flag: 'item_grotte_des_cascades_2_1' },
    { x: 22, y: 18, item: 'sel_eveil', flag: 'item_grotte_des_cascades_2_2' },
  ],
  hiddenItems: [{ x: 1, y: 18, item: 'potion', flag: 'hidden_grotte_des_cascades_2_1' }],
  // Not `once`: after a defeat (back to the Halte) the rival waits here again.
  triggers: [{ x: 16, y: 9, w: 1, h: 3, script: [{ cmd: 'call', script: 'rival_2' }] }],
  connections: {},
  scripts: {
    rival_2: [{ cmd: 'if_flag', flag: 'rival_2_done', else: [
      { cmd: 'play_music', track: 'encounter_rival' },
      { cmd: 'show_actor', actor: 'rivale' },
      { cmd: 'move', actor: 'rivale', path: ['left', 'left', 'left'] },
      { cmd: 'face', actor: 'rivale', direction: 'player' },
      { cmd: 'face', actor: 'player', direction: 'right' },
      { cmd: 'say', text: 'rival_2_intro' },
      { cmd: 'battle', trainer: 'rival_2' },
      { cmd: 'set_flag', flag: 'rival_2_done' },
      { cmd: 'play_music', track: 'cave' },
      { cmd: 'say', text: 'rival_2_after' },
      { cmd: 'move', actor: 'rivale', path: ['right', 'right', 'right', 'right'] },
      { cmd: 'hide_actor', actor: 'rivale' },
    ] }],
  },
};
