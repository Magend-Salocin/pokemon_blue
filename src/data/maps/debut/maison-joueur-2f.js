// Player's bedroom, where a new game starts (GAME_START in ../index.js: (3, 4) facing down).
export default {
  id: 'maison_joueur_2f',
  name: 'Chambre',
  tileset: 'indoor',
  music: 'hometown',
  layers: {
    ground: [
      '#w##w###',
      '#B..LLD#',
      '#B..LL.#',
      '#......#',
      '#......#',
      '#.tt..P#',
      '#.tt...#',
      '########',
    ],
  },
  encounters: null,
  warps: [{ x: 6, y: 1, to: 'maison_joueur_1f', toX: 6, toY: 1 }],
  npcs: [],
  trainers: [],
  signs: [
    { x: 2, y: 5, text: 'maison_joueur_ordinateur' },
    { x: 3, y: 5, text: 'maison_joueur_ordinateur' },
    { x: 4, y: 2, text: 'maison_joueur_etagere' },
    { x: 5, y: 2, text: 'maison_joueur_etagere' },
    { x: 1, y: 2, text: 'maison_joueur_lit' },
  ],
  items: [{ x: 5, y: 6, item: 'potion', flag: 'item_maison_joueur_2f_1' }],
  hiddenItems: [],
  triggers: [],
  connections: {},
};
