import { halte } from '../interiors.js';

export default halte({
  id: 'halte_cendrelune',
  name: 'Halte de Cendrelune',
  exit: { map: 'cendrelune', x: 3, y: 8 },
  npcs: [
    { id: 'randonneur', sprite: 'randonneur', x: 7, y: 5, facing: 'left', movement: 'look', script: [{ cmd: 'say', text: 'halte_cendrelune_randonneur' }] },
    { id: 'gamin', sprite: 'gamin', x: 2, y: 5, facing: 'right', movement: 'static', script: [{ cmd: 'say', text: 'halte_cendrelune_gamin' }] },
  ],
});
