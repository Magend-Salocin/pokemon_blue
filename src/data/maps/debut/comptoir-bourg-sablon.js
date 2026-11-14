// Comptoir: the clerk hands over the Colis Morvan the first time the player walks in.
import { comptoir } from '../interiors.js';

const COLIS = [
  {
    cmd: 'if_flag', flag: 'parcel_received',
    else: [
      { cmd: 'face', actor: 'vendeur', direction: 'player' },
      { cmd: 'say', text: 'comptoir_bourg_sablon_colis' },
      { cmd: 'give_item', item: 'colis_morvan' },
      { cmd: 'set_flag', flag: 'parcel_received' },
      { cmd: 'say', text: 'comptoir_bourg_sablon_colis_apres' },
    ],
  },
];

export default comptoir({
  id: 'comptoir_bourg_sablon',
  name: 'Comptoir de Bourg-Sablon',
  exit: { map: 'bourg_sablon', x: 13, y: 12 },
  stock: [
    { item: 'capsule' }, { item: 'potion' }, { item: 'antidote' },
    { item: 'sel_eveil' }, { item: 'liniment' }, { item: 'repulsif' },
  ],
  npcs: [
    { id: 'client', sprite: 'randonneur', x: 5, y: 3, facing: 'left', movement: 'look', script: [{ cmd: 'say', text: 'comptoir_bourg_sablon_client' }] },
  ],
  // The player lands on (3, 6) without firing triggers: any next step in rows 5-6 fires it.
  triggers: [{ x: 1, y: 5, w: 6, h: 2, once: true, flag: 'comptoir_bourg_sablon_colis', script: COLIS }],
});
