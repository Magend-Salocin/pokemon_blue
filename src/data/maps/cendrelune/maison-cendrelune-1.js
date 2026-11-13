import { house } from '../interiors.js';

// Old lady whose companion rests in the Tour de la Mémoire.
export default house({
  id: 'maison_cendrelune_1',
  name: 'Cendrelune',
  music: 'town_2',
  layout: 'a',
  exit: { map: 'cendrelune', x: 18, y: 4 },
  npcs: [
    { id: 'vieille_dame', sprite: 'vieille_dame', x: 5, y: 2, facing: 'down', movement: 'static', script: [{ cmd: 'say', text: 'maison_cendrelune_1_vieille_dame' }] },
    { id: 'gamin', sprite: 'gamin', x: 2, y: 6, facing: 'right', movement: 'look', script: [{ cmd: 'say', text: 'maison_cendrelune_1_gamin' }] },
  ],
});
