// Comptoir de Port-Ondine: Super Capsule in stock, Potion Forte once the Eau badge is won.
import { comptoir } from '../interiors.js';

export default comptoir({
  id: 'comptoir_port_ondine',
  name: 'Comptoir de Port-Ondine',
  exit: { map: 'port_ondine', x: 9, y: 4 },
  stock: [
    { item: 'capsule' },
    { item: 'super_capsule' },
    { item: 'potion' },
    { item: 'potion_forte', badge: 'eau' },
    { item: 'antidote' },
    { item: 'sel_eveil' },
    { item: 'liniment' },
    { item: 'repulsif' },
  ],
  npcs: [
    { id: 'client', sprite: 'pecheur', x: 4, y: 4, facing: 'up', movement: 'static', script: [{ cmd: 'say', text: 'comptoir_port_ondine_client' }] },
  ],
});
