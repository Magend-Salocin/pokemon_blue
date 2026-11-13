// Player's house, ground floor: Maman heals the party (respawn point before any Halte, see ../index.js).
export default {
  id: 'maison_joueur_1f',
  name: 'Maison',
  tileset: 'indoor',
  music: 'hometown',
  layers: {
    ground: [
      '#w##ww##',
      '#LL..PU#',
      '#LL....#',
      '#......#',
      '#tt....#',
      '#tt....#',
      '#......#',
      '###m####',
    ],
  },
  encounters: null,
  warps: [
    { x: 3, y: 7, to: 'hameau_de_lys', toX: 4, toY: 5 },
    { x: 6, y: 1, to: 'maison_joueur_2f', toX: 6, toY: 1 },
  ],
  npcs: [{ id: 'maman', sprite: 'maman', x: 5, y: 5, facing: 'up', movement: 'static', script: 'maman' }],
  trainers: [],
  signs: [
    { x: 1, y: 1, text: 'maison_joueur_bocaux' },
    { x: 2, y: 1, text: 'maison_joueur_bocaux' },
  ],
  items: [],
  hiddenItems: [],
  triggers: [],
  connections: {},
  scripts: {
    maman: [
      {
        cmd: 'if_flag', flag: 'got_starter',
        then: [
          {
            cmd: 'if_flag', flag: 'maman_chaussures',
            then: [{ cmd: 'say', text: 'maman_soin' }],
            else: [
              { cmd: 'say', text: 'maman_chaussures' },
              { cmd: 'give_item', item: 'chaussures' },
              { cmd: 'set_flag', flag: 'maman_chaussures' },
              { cmd: 'say', text: 'maman_chaussures_apres' },
            ],
          },
        ],
        else: [{ cmd: 'say', text: 'maman_debut' }],
      },
      { cmd: 'play_sfx', sfx: 'jingle_heal' },
      { cmd: 'fade', direction: 'out', color: 'white' },
      { cmd: 'heal_party' },
      { cmd: 'wait', seconds: 0.4 },
      { cmd: 'fade', direction: 'in' },
      { cmd: 'say', text: 'maman_soin_fin' },
    ],
  },
};
