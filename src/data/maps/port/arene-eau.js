// Arène Eau de Port-Ondine: slippery slabs between pools. The player slides until an obstacle
// (stalagmite, pool edge, wall or floor tile). Intended route from the entrance platform:
// up column 11 to (11, 5), left to (8, 5), up to (8, 4), left to (5, 4), up to Maël.
// The bottom floor row spans the whole room, so every slide down leads back to the entrance.
export default {
  id: 'arene_eau',
  name: 'Arène de Port-Ondine',
  tileset: 'cave',
  music: 'town_2',
  layers: {
    ground: [
      '#############',
      '#~~~~...~~~~#',
      '#~~~~...~~~~#',
      '#~~~~iiiA~~~#',
      '#~~~Aiiii~~~#',
      '#iiii~~~iiii#',
      '#iiii~~~iiAi#',
      '#iAiiiiiiiii#',
      '#i..iiiiAiii#',
      '#iiiiiiiiiii#',
      '#iiiiiA..iii#',
      '#Aiiiiiiiiii#',
      '#...........#',
      '#####...#####',
      '######.######',
    ],
  },
  encounters: null,
  warps: [{ x: 6, y: 14, to: 'port_ondine', toX: 18, toY: 4 }],
  npcs: [
    { id: 'mael', sprite: 'mael', x: 6, y: 1, facing: 'down', movement: 'static', script: 'leader' },
    { id: 'conseiller', sprite: 'marin', x: 7, y: 13, facing: 'left', movement: 'static', script: [{ cmd: 'say', text: 'arene_eau_conseiller' }] },
  ],
  trainers: [
    { id: 'nageur_theo', sprite: 'nageur', x: 2, y: 8, facing: 'right', sight: 3, trainer: 'nageur_theo' },
    { id: 'pecheur_rene', sprite: 'pecheur', x: 8, y: 10, facing: 'left', sight: 1, trainer: 'pecheur_rene' },
  ],
  signs: [],
  items: [],
  hiddenItems: [],
  triggers: [],
  connections: {},
  scripts: {
    leader: [
      {
        cmd: 'if_badge', badge: 'eau',
        then: [{ cmd: 'say', text: 'mael_after' }],
        else: [
          { cmd: 'say', text: 'mael_intro' },
          { cmd: 'battle', trainer: 'mael' },
          { cmd: 'say', text: 'mael_badge' },
          { cmd: 'give_badge', badge: 'eau' },
          { cmd: 'say', text: 'mael_badge_effect' },
          { cmd: 'give_item', item: 'pierre_marine' },
          { cmd: 'say', text: 'mael_reward' },
        ],
      },
    ],
  },
};
