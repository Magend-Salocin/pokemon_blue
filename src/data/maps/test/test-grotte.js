// Test map (dev only): dark cave with ice, water, items and cave encounters.
export default {
  id: 'test_grotte',
  name: 'Grotte d’essai',
  tileset: 'cave',
  music: 'cave',
  dark: true,
  layers: {
    ground: [
      '############',
      '#....A.....#',
      '#.iiii.....#',
      '#.iiii..A..#',
      '#.iiii.....#',
      '#......~~~.#',
      '#..A...~~~.#',
      '#..........#',
      '#..........#',
      '#..........#',
      '#....U.....#',
      '############',
    ],
  },
  encounters: {
    rate: 8,
    cave: [
      { creature: 'noctule', minLevel: 8, maxLevel: 10, weight: 60 },
      { creature: 'caillotin', minLevel: 8, maxLevel: 10, weight: 40 },
    ],
  },
  warps: [{ x: 5, y: 10, to: 'test_route', toX: 6, toY: 16 }],
  npcs: [],
  trainers: [],
  signs: [],
  items: [{ x: 10, y: 1, item: 'super_capsule', flag: 'item_test_grotte_1' }],
  hiddenItems: [{ x: 1, y: 7, item: 'repulsif', flag: 'hidden_test_grotte_1' }],
  triggers: [],
  connections: {},
};
