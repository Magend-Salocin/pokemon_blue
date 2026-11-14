// Tour de la Mémoire, floor 3.
import { TOUR_ENCOUNTERS_LOW } from './tour-encounters.js';

export default {
  id: 'tour_memoire_3',
  name: 'Tour de la Mémoire 3F',
  tileset: 'special',
  music: 'memory_tower',
  layers: {
    ground: [
      '##############',
      '#,,,,#,,X,,,,#',
      '#,##,#,,,,##,#',
      '#,##,#,####,,#',
      '#,,,,,,#.....#',
      '###,####.###.#',
      '#.....#..#...#',
      '#.###.#..#.#.#',
      '#.#.......#..#',
      '#.#.###.###..#',
      '#.....#......#',
      '#.,,,.#..##..#',
      '#.X,,....##..#',
      '##############',
    ],
  },
  encounters: TOUR_ENCOUNTERS_LOW,
  warps: [
    { x: 2, y: 12, to: 'tour_memoire_2', toX: 11, toY: 1 },
    { x: 8, y: 1, to: 'tour_memoire_4', toX: 11, toY: 12 },
  ],
  npcs: [],
  trainers: [
    { id: 'mystique_sidonie', sprite: 'mystique', x: 7, y: 10, facing: 'right', sight: 5, trainer: 'mystique_sidonie' },
    { id: 'sbire_tour_josette', sprite: 'sbire_opale', x: 12, y: 3, facing: 'down', sight: 4, trainer: 'sbire_tour_josette' },
    { id: 'mystique_ernest', sprite: 'mystique', x: 1, y: 6, facing: 'right', sight: 4, trainer: 'mystique_ernest' },
  ],
  signs: [],
  items: [
    { x: 3, y: 8, item: 'cire_calme', flag: 'item_tour_memoire_3_1' },
    { x: 1, y: 1, item: 'sel_eveil', flag: 'item_tour_memoire_3_2' },
  ],
  hiddenItems: [],
  triggers: [],
  connections: {},
};
