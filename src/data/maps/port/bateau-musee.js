// Bateau-musée moored at the Port-Ondine quay: showcases about the maritime history of Brumeval.
// The guide asks a question about the exhibits and gives a Sucre d'Orge for the right answer.
export default {
  id: 'bateau_musee',
  name: 'Bateau-musée',
  tileset: 'indoor',
  music: 'town_1',
  layers: {
    ground: [
      '#w##w##w##w#',
      '#LL..LL..LL#',
      '#LL..LL..LL#',
      '#..........#',
      '#.tt....tt.#',
      '#.tt....tt.#',
      '#..........#',
      '#rrrrrrrrrr#',
      '#####m######',
    ],
  },
  encounters: null,
  warps: [{ x: 5, y: 8, to: 'port_ondine', toX: 16, toY: 11 }],
  npcs: [
    { id: 'guide', sprite: 'gentleman', x: 6, y: 4, facing: 'down', movement: 'static', script: 'guide' },
    { id: 'visiteuse', sprite: 'fillette', x: 7, y: 6, facing: 'up', movement: 'look', script: [{ cmd: 'say', text: 'bateau_musee_visiteuse' }] },
  ],
  trainers: [
    { id: 'marin_yves', sprite: 'marin', x: 10, y: 3, facing: 'left', sight: 3, trainer: 'marin_yves' },
    { id: 'marin_hugo', sprite: 'marin', x: 1, y: 6, facing: 'right', sight: 4, trainer: 'marin_hugo' },
  ],
  signs: [
    { x: 1, y: 2, text: 'bateau_musee_vitrine_1' },
    { x: 5, y: 2, text: 'bateau_musee_vitrine_2' },
    { x: 6, y: 2, text: 'bateau_musee_vitrine_3' },
    { x: 9, y: 2, text: 'bateau_musee_vitrine_4' },
    { x: 2, y: 5, text: 'bateau_musee_maquette_1' },
    { x: 9, y: 5, text: 'bateau_musee_maquette_2' },
  ],
  items: [],
  hiddenItems: [{ x: 10, y: 6, item: 'potion_forte', flag: 'hidden_bateau_musee_1' }],
  triggers: [],
  connections: {},
  scripts: {
    guide: [
      {
        cmd: 'if_flag', flag: 'bateau_musee_quiz',
        then: [{ cmd: 'say', text: 'bateau_musee_guide_after' }],
        else: [
          { cmd: 'say', text: 'bateau_musee_guide' },
          {
            cmd: 'ask', text: 'bateau_musee_guide_question',
            yes: [
              { cmd: 'say', text: 'bateau_musee_guide_bravo' },
              { cmd: 'give_item', item: 'sucre_dorge' },
              { cmd: 'set_flag', flag: 'bateau_musee_quiz' },
            ],
            no: [{ cmd: 'say', text: 'bateau_musee_guide_rate' }],
          },
        ],
      },
    ],
  },
};
