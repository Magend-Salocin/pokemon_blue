// Tour de la Mémoire, floor 4.
import { TOUR_ENCOUNTERS_HIGH } from './tour-encounters.js';

export default {
  id: 'tour_memoire_4',
  name: 'Tour de la Mémoire 4F',
  tileset: 'special',
  music: 'memory_tower',
  layers: {
    ground: [
      '##############',
      '#,,,,,X,,,,,,#',
      '#,##,,,,,,##,#',
      '#,##,####,##,#',
      '#....#..#....#',
      '#.##.#..#.##.#',
      '#.##......##.#',
      '#....#..#....#',
      '###.##..##.###',
      '#.....,,.....#',
      '#.###.,,.###.#',
      '#.#.........,#',
      '#.......#..X,#',
      '##############',
    ],
  },
  encounters: TOUR_ENCOUNTERS_HIGH,
  warps: [
    { x: 11, y: 12, to: 'tour_memoire_3', toX: 8, toY: 1 },
    { x: 6, y: 1, to: 'tour_memoire_5', toX: 6, toY: 10 },
  ],
  npcs: [],
  trainers: [
    { id: 'mystique_berenice', sprite: 'mystique', x: 1, y: 9, facing: 'right', sight: 5, trainer: 'mystique_berenice' },
    { id: 'sbire_tour_anatole', sprite: 'sbire_opale', x: 6, y: 4, facing: 'down', sight: 3, trainer: 'sbire_tour_anatole' },
    { id: 'mystique_honore', sprite: 'mystique', x: 12, y: 4, facing: 'left', sight: 3, trainer: 'mystique_honore' },
  ],
  signs: [],
  items: [{ x: 3, y: 11, item: 'ranimant', flag: 'item_tour_memoire_4_1' }],
  hiddenItems: [{ x: 1, y: 1, item: 'grande_potion', flag: 'hidden_tour_memoire_4_1' }],
  triggers: [],
  connections: {},
};
