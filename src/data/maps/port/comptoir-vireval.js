// Comptoir de Vireval: adds the Fil d'Ariane, the Répulsif Fort and the Baume Froid.
import { comptoir } from '../interiors.js';

export default comptoir({
  id: 'comptoir_vireval',
  name: 'Comptoir de Vireval',
  exit: { map: 'vireval', x: 12, y: 4 },
  stock: [
    { item: 'capsule' },
    { item: 'super_capsule' },
    { item: 'potion' },
    { item: 'potion_forte' },
    { item: 'antidote' },
    { item: 'sel_eveil' },
    { item: 'liniment' },
    { item: 'baume_froid' },
    { item: 'repulsif' },
    { item: 'repulsif_fort' },
    { item: 'fil_dariane' },
  ],
  npcs: [
    { id: 'cliente', sprite: 'dresseuse', x: 5, y: 3, facing: 'left', movement: 'static', script: [{ cmd: 'say', text: 'comptoir_vireval_cliente' }] },
  ],
});
