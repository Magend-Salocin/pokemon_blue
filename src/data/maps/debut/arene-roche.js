// Roche arena: three rocks block the way to Garance. Each rug plate moves one rock aside, and each
// rock guards the band where the next plate lies, so the order is forced and nothing can get stuck.
function plate(index) {
  return [
    { cmd: 'play_sfx', sfx: 'push' },
    { cmd: 'shake_screen', seconds: 0.3 },
    { cmd: 'hide_actor', actor: `rocher_${index}` },
    { cmd: 'say', text: 'arene_roche_plaque' },
  ];
}

const ROCK_SCRIPT = [{ cmd: 'say', text: 'arene_roche_rocher' }];

export default {
  id: 'arene_roche',
  name: 'Arène de Bourg-Sablon',
  tileset: 'indoor',
  music: 'town_2',
  layers: {
    ground: [
      '#ww#####ww#',
      '#P...c...P#',
      '#....c....#',
      '#####.#####',
      '#r........#',
      '#.........#',
      '#########.#',
      '#.........#',
      '#........r#',
      '#.#########',
      '#........r#',
      '#.........#',
      '#P.......P#',
      '#####m#####',
    ],
  },
  encounters: null,
  warps: [{ x: 5, y: 13, to: 'bourg_sablon', toX: 4, toY: 4 }],
  npcs: [
    { id: 'garance', sprite: 'garance', x: 5, y: 1, facing: 'down', movement: 'static', script: 'leader' },
    { id: 'guide', sprite: 'gentleman', x: 7, y: 12, facing: 'left', movement: 'static', script: 'guide' },
    { id: 'rocher_1', sprite: 'rocher', x: 1, y: 9, facing: 'down', movement: 'static', hideIf: 'arene_roche_plaque_1', script: ROCK_SCRIPT },
    { id: 'rocher_2', sprite: 'rocher', x: 9, y: 6, facing: 'down', movement: 'static', hideIf: 'arene_roche_plaque_2', script: ROCK_SCRIPT },
    { id: 'rocher_3', sprite: 'rocher', x: 5, y: 3, facing: 'down', movement: 'static', hideIf: 'arene_roche_plaque_3', script: ROCK_SCRIPT },
  ],
  trainers: [
    { id: 'randonneur_basile', sprite: 'randonneur', x: 3, y: 10, facing: 'down', sight: 2, trainer: 'arene_roche_randonneur_basile' },
    { id: 'montagnard_gaspard', sprite: 'montagnard', x: 5, y: 7, facing: 'down', sight: 1, trainer: 'arene_roche_montagnard_gaspard' },
    { id: 'randonneuse_ines', sprite: 'campeuse', x: 5, y: 5, facing: 'up', sight: 1, trainer: 'arene_roche_randonneuse_ines' },
  ],
  signs: [],
  items: [],
  hiddenItems: [],
  triggers: [
    { x: 9, y: 10, once: true, flag: 'arene_roche_plaque_1', script: plate(1) },
    { x: 9, y: 8, once: true, flag: 'arene_roche_plaque_2', script: plate(2) },
    { x: 1, y: 4, once: true, flag: 'arene_roche_plaque_3', script: plate(3) },
  ],
  connections: {},
  scripts: {
    guide: [
      {
        cmd: 'if_badge', badge: 'roche',
        then: [{ cmd: 'say', text: 'arene_roche_guide_apres' }],
        else: [{ cmd: 'say', text: 'arene_roche_guide' }],
      },
    ],
    leader: [
      {
        cmd: 'if_badge', badge: 'roche',
        then: [{ cmd: 'say', text: 'garance_after' }],
        else: [
          { cmd: 'say', text: 'garance_intro' },
          { cmd: 'battle', trainer: 'garance' },
          { cmd: 'play_music', track: 'town_2' },
          { cmd: 'say', text: 'garance_badge' },
          { cmd: 'give_badge', badge: 'roche' },
          { cmd: 'say', text: 'garance_badge_effect' },
          { cmd: 'give_item', item: 'pierre_lunaire' },
          { cmd: 'say', text: 'garance_reward' },
        ],
      },
    ],
  },
};
