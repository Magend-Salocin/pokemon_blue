// Maison de Vireval 2: Sélène's former teacher talks about the town and its turbines.
import { house } from '../interiors.js';

export default house({
  id: 'maison_vireval_2',
  name: 'Vireval',
  music: 'town_1',
  layout: 'c',
  exit: { map: 'vireval', x: 14, y: 7 },
  npcs: [
    { id: 'professeur', sprite: 'gentleman', x: 3, y: 3, facing: 'down', movement: 'static', script: [{ cmd: 'say', text: 'maison_vireval_2_professeur' }] },
  ],
});
