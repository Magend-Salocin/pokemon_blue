import { house } from '../interiors.js';

// Greenhouse keeper who trades a Nimbelaine for a Ronceroc.
export default house({
  id: 'maison_cendrelune_2',
  name: 'Cendrelune',
  music: 'town_2',
  layout: 'b',
  exit: { map: 'cendrelune', x: 17, y: 14 },
  npcs: [
    { id: 'echangeur', sprite: 'gentleman', x: 3, y: 2, facing: 'down', movement: 'static', script: 'echange' },
    { id: 'fillette', sprite: 'fillette', x: 6, y: 6, facing: 'left', movement: 'look', script: [{ cmd: 'say', text: 'maison_cendrelune_2_fillette' }] },
  ],
  scripts: {
    echange: [{
      cmd: 'if_flag', flag: 'echange_cendrelune_fait',
      then: [{ cmd: 'say', text: 'maison_cendrelune_2_echange_apres' }],
      else: [
        { cmd: 'say', text: 'maison_cendrelune_2_echange' },
        { cmd: 'trade', wanted: 'ronceroc', offer: { creature: 'nimbelaine', level: 27, nickname: 'Floconne', originalTrainer: 'Anselme' }, flag: 'echange_cendrelune_fait' },
      ],
    }],
  },
});
