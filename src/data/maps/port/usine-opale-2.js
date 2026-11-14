// Usine Opale, upper floor: generators, stray electric creatures and the lieutenant Brisac.
// Teleporter (10, 4) leads to his office (6, 4). Beating him sets usine_opale_cleared.
export default {
  id: 'usine_opale_2',
  name: 'Usine Opale',
  tileset: 'special',
  music: 'opal_syndicate',
  layers: {
    ground: [
      '################',
      '#lllllll#llllll#',
      '#l##llll#llllll#',
      '#lllllll#llllll#',
      '#lllllXl#lXllll#',
      '#lllllll#llllll#',
      '#############l##',
      '#llllllllllllll#',
      '#lll##lllllllll#',
      '#lll##lllllllll#',
      '#Xlllllllllllll#',
      '################',
    ],
  },
  encounters: {
    rate: 8,
    cave: [
      { creature: 'boulonnet', minLevel: 20, maxLevel: 23, weight: 35 },
      { creature: 'piquevolt', minLevel: 20, maxLevel: 23, weight: 30 },
      { creature: 'crassou', minLevel: 20, maxLevel: 22, weight: 20 },
      { creature: 'ampoulin', minLevel: 21, maxLevel: 24, weight: 15 },
    ],
  },
  warps: [
    { x: 1, y: 10, to: 'usine_opale_1', toX: 13, toY: 1 },
    { x: 10, y: 4, to: 'usine_opale_2', toX: 6, toY: 4 },
    { x: 6, y: 4, to: 'usine_opale_2', toX: 10, toY: 4 },
  ],
  npcs: [
    { id: 'brisac', sprite: 'sbire_opale', x: 4, y: 1, facing: 'down', movement: 'static', hideIf: 'usine_opale_cleared', script: 'brisac' },
  ],
  trainers: [
    { id: 'sbire_usine_3', sprite: 'sbire_opale', x: 8, y: 9, facing: 'left', sight: 4, trainer: 'sbire_usine_3' },
    { id: 'chercheuse_adele', sprite: 'scientifique', x: 14, y: 3, facing: 'left', sight: 4, trainer: 'chercheuse_adele' },
    { id: 'sbire_usine_4', sprite: 'sbire_opale', x: 7, y: 1, facing: 'down', sight: 4, trainer: 'sbire_usine_4' },
  ],
  signs: [],
  items: [{ x: 14, y: 1, item: 'seve_vitale', flag: 'item_usine_opale_2_1' }],
  hiddenItems: [{ x: 1, y: 7, item: 'fil_dariane', flag: 'hidden_usine_opale_2_1' }],
  triggers: [],
  connections: {},
  scripts: {
    brisac: [
      { cmd: 'say', text: 'usine_opale_brisac' },
      { cmd: 'battle', trainer: 'lieutenant_brisac' },
      { cmd: 'say', text: 'usine_opale_brisac_aveu' },
      { cmd: 'set_flag', flag: 'usine_opale_cleared' },
      { cmd: 'fade', direction: 'out' },
      { cmd: 'hide_actor', actor: 'brisac' },
      { cmd: 'play_sfx', sfx: 'teleporter' },
      { cmd: 'fade', direction: 'in' },
      { cmd: 'say', text: 'usine_opale_courant' },
    ],
  },
};
