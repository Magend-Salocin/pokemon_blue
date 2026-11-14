// Usine Opale, ground floor: the Syndicat diverts Vireval's power from here.
// Route: up the west hall, through the gap of the inner wall (7, 2), teleporter (13, 1) to the upper floor.
export default {
  id: 'usine_opale_1',
  name: 'Usine Opale',
  tileset: 'special',
  music: 'opal_syndicate',
  layers: {
    ground: [
      '################',
      '#llllll#lllllXl#',
      '#llllllllllllll#',
      '#ll##ll#lllllll#',
      '#ll##ll#lllllll#',
      '#llllll#lllllll#',
      '#llllll#########',
      '#llllll#lllllll#',
      '#lllllllll##lll#',
      '#lllllllll##lll#',
      '#llllllllllllll#',
      '########l#######',
    ],
  },
  encounters: null,
  warps: [
    { x: 8, y: 11, to: 'vireval', toX: 4, toY: 13 },
    { x: 13, y: 1, to: 'usine_opale_2', toX: 1, toY: 10 },
  ],
  npcs: [
    { id: 'ouvrier_retenu', sprite: 'ouvrier', x: 13, y: 7, facing: 'left', movement: 'static', script: [{ cmd: 'say', text: 'usine_opale_1_ouvrier' }] },
  ],
  trainers: [
    { id: 'sbire_usine_1', sprite: 'sbire_opale', x: 3, y: 8, facing: 'right', sight: 4, trainer: 'sbire_usine_1' },
    { id: 'sbire_usine_2', sprite: 'sbire_opale', x: 1, y: 2, facing: 'right', sight: 5, trainer: 'sbire_usine_2' },
    { id: 'scientifique_ohmer', sprite: 'scientifique', x: 10, y: 1, facing: 'down', sight: 3, trainer: 'scientifique_ohmer' },
  ],
  signs: [],
  items: [
    { x: 14, y: 10, item: 'super_capsule', flag: 'item_usine_opale_1_1' },
    { x: 1, y: 10, item: 'potion_forte', flag: 'item_usine_opale_1_2' },
  ],
  hiddenItems: [],
  triggers: [],
  connections: {},
};
