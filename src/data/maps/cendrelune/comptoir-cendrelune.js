import { comptoir } from '../interiors.js';

export default comptoir({
  id: 'comptoir_cendrelune',
  name: 'Comptoir de Cendrelune',
  exit: { map: 'cendrelune', x: 8, y: 8 },
  stock: [
    { item: 'capsule' },
    { item: 'super_capsule' },
    { item: 'potion' },
    { item: 'potion_forte' },
    { item: 'grande_potion', badge: 'flore' },
    { item: 'antidote' },
    { item: 'sel_eveil' },
    { item: 'liniment' },
    { item: 'degivrant' },
    { item: 'repulsif' },
    { item: 'repulsif_fort' },
  ],
  npcs: [
    { id: 'dame', sprite: 'vieille_dame', x: 4, y: 4, facing: 'left', movement: 'static', script: [{ cmd: 'say', text: 'comptoir_cendrelune_dame' }] },
  ],
});
