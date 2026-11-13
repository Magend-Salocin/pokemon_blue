// Pr Morvan's lab: starter choice, first rival battle, then the Bestiaire once the parcel is brought back.

/**
 * Starter choice and first rival battle, with the player standing in front of the professor.
 * Shared with the Hameau-de-Lys gate script (which warps here first), so it only moves `player`.
 */
export const STARTER_EVENT = [
  { cmd: 'say', text: 'labo_morvan_starter_1' },
  { cmd: 'say', text: 'labo_rival_impatiente' },
  { cmd: 'say', text: 'labo_morvan_starter_2' },
  { cmd: 'choose_starter' },
  { cmd: 'set_flag', flag: 'got_starter' },
  { cmd: 'say', text: 'labo_rival_choix' },
  { cmd: 'say', text: 'labo_morvan_rival' },
  { cmd: 'say', text: 'rival_1_intro' },
  {
    cmd: 'battle', trainer: 'rival_1', onLose: 'continue',
    won: [{ cmd: 'play_music', track: 'hometown' }, { cmd: 'say', text: 'rival_1_won' }],
    lost: [{ cmd: 'play_music', track: 'hometown' }, { cmd: 'say', text: 'rival_1_lost' }],
  },
  { cmd: 'set_flag', flag: 'rival_1_done' },
  { cmd: 'say', text: 'labo_morvan_soin' },
  { cmd: 'heal_party' },
  { cmd: 'say', text: 'labo_morvan_colis' },
];

const BESTIARY_EVENT = [
  { cmd: 'say', text: 'labo_morvan_merci' },
  { cmd: 'take_item', item: 'colis_morvan' },
  { cmd: 'say', text: 'labo_morvan_bestiaire' },
  { cmd: 'set_flag', flag: 'has_bestiary' },
  { cmd: 'play_sfx', sfx: 'jingle_key_item' },
  { cmd: 'say', text: 'labo_bestiaire_recu' },
  { cmd: 'say', text: 'labo_morvan_capsules' },
  { cmd: 'give_item', item: 'capsule', count: 5 },
  { cmd: 'say', text: 'labo_morvan_mission' },
  { cmd: 'face', actor: 'rival', direction: 'player' },
  { cmd: 'say', text: 'labo_rival_depart' },
  { cmd: 'move', actor: 'rival', path: ['down', 'down', 'down', 'down', 'down', 'down', 'down', 'down', 'left', 'down'] },
  { cmd: 'play_sfx', sfx: 'door' },
  { cmd: 'hide_actor', actor: 'rival' },
];

export default {
  id: 'labo_morvan',
  name: 'Labo Morvan',
  tileset: 'indoor',
  music: 'hometown',
  layers: {
    ground: [
      '#ww#ww#ww#',
      '#LL,,,tt,#',
      '#LL,,,tt,#',
      '#,,,,,,,,#',
      '#,,,,,,,,#',
      '#tt,,,,tt#',
      '#tt,,,,tt#',
      '#,,,,,,,,#',
      '#P,,,,,,P#',
      '#,,,,,,,,#',
      '#LL,,,,LL#',
      '#LL,,,,LL#',
      '####m#####',
    ],
  },
  encounters: null,
  warps: [{ x: 4, y: 12, to: 'hameau_de_lys', toX: 13, toY: 11 }],
  npcs: [
    { id: 'morvan', sprite: 'professeure', x: 4, y: 2, facing: 'down', movement: 'static', script: 'professeure' },
    { id: 'rival', sprite: 'rival', x: 5, y: 3, facing: 'left', movement: 'static', script: 'rivale', hideIf: 'has_bestiary' },
    { id: 'assistant_1', sprite: 'scientifique', x: 2, y: 7, facing: 'right', movement: 'look', script: [{ cmd: 'say', text: 'labo_assistant_1' }] },
    {
      id: 'assistant_2', sprite: 'scientifique', x: 7, y: 9, facing: 'left', movement: 'look',
      script: [{ cmd: 'if_flag', flag: 'has_bestiary', then: [{ cmd: 'say', text: 'labo_assistant_2_apres' }], else: [{ cmd: 'say', text: 'labo_assistant_2' }] }],
    },
  ],
  trainers: [],
  signs: [
    { x: 6, y: 1, text: 'labo_table' },
    { x: 7, y: 1, text: 'labo_table' },
    { x: 6, y: 2, text: 'labo_table' },
    { x: 7, y: 2, text: 'labo_table' },
    { x: 1, y: 1, text: 'labo_etagere' },
    { x: 2, y: 1, text: 'labo_etagere' },
  ],
  items: [],
  hiddenItems: [],
  triggers: [],
  connections: {},
  scripts: {
    professeure: [
      {
        cmd: 'if_flag', flag: 'has_bestiary',
        then: [{ cmd: 'say', text: 'labo_morvan_apres' }],
        else: [
          {
            cmd: 'if_flag', flag: 'parcel_received',
            then: BESTIARY_EVENT,
            else: [
              {
                cmd: 'if_flag', flag: 'got_starter',
                then: [{ cmd: 'say', text: 'labo_morvan_attente' }],
                else: STARTER_EVENT,
              },
            ],
          },
        ],
      },
    ],
    rivale: [
      {
        cmd: 'if_flag', flag: 'rival_1_done',
        then: [
          {
            cmd: 'if_flag', flag: 'parcel_received',
            then: [{ cmd: 'say', text: 'labo_rival_colis_recu' }],
            else: [{ cmd: 'say', text: 'rival_1_after' }],
          },
        ],
        else: [{ cmd: 'say', text: 'labo_rival_attente' }],
      },
    ],
  },
};
