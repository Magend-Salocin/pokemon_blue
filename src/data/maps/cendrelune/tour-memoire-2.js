// Tour de la Mémoire, floor 2.
import { TOUR_ENCOUNTERS_LOW } from './tour-encounters.js';

export default {
  id: 'tour_memoire_2',
  name: 'Tour de la Mémoire 2F',
  tileset: 'special',
  music: 'memory_tower',
  layers: {
    ground: [
      '##############',
      '#,,,,,,,,,,X,#',
      '#,##,,##,,####',
      '#,##,,##,,,,,#',
      '#,,,,,,,,,##,#',
      '####,####,##,#',
      '#......#.....#',
      '#.##...#..##.#',
      '#.##.......#.#',
      '#......#...#.#',
      '####.###...#.#',
      '#............#',
      '#.....X......#',
      '##############',
    ],
  },
  encounters: TOUR_ENCOUNTERS_LOW,
  warps: [
    { x: 6, y: 12, to: 'tour_memoire_1', toX: 6, toY: 1 },
    { x: 11, y: 1, to: 'tour_memoire_3', toX: 2, toY: 12 },
  ],
  npcs: [],
  trainers: [
    { id: 'mystique_amandine', sprite: 'mystique', x: 1, y: 9, facing: 'right', sight: 5, trainer: 'mystique_amandine' },
    { id: 'sbire_tour_rufin', sprite: 'sbire_opale', x: 12, y: 6, facing: 'down', sight: 4, trainer: 'sbire_tour_rufin' },
  ],
  signs: [],
  items: [{ x: 1, y: 3, item: 'potion_forte', flag: 'item_tour_memoire_2_1' }],
  hiddenItems: [{ x: 12, y: 3, item: 'super_capsule', flag: 'hidden_tour_memoire_2_1' }],
  triggers: [],
  connections: {},
};
