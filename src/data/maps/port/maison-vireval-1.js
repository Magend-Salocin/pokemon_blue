// Maison de Vireval 1: a worker's family living with the power cut.
import { house } from '../interiors.js';

export default house({
  id: 'maison_vireval_1',
  name: 'Vireval',
  music: 'town_1',
  layout: 'a',
  exit: { map: 'vireval', x: 6, y: 7 },
  npcs: [
    { id: 'mere', sprite: 'maman', x: 5, y: 2, facing: 'down', movement: 'static', script: 'mere' },
    { id: 'fillette', sprite: 'fillette', x: 2, y: 6, facing: 'right', movement: 'look', script: [{ cmd: 'say', text: 'maison_vireval_1_fillette' }] },
  ],
  scripts: {
    mere: [{
      cmd: 'if_flag', flag: 'usine_opale_cleared',
      then: [{ cmd: 'say', text: 'maison_vireval_1_mere_after' }],
      else: [{ cmd: 'say', text: 'maison_vireval_1_mere' }],
    }],
  },
});
