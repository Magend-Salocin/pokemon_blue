// Maison de Port-Ondine 2: Maël's neighbour and a hint about the Route 5 gardener.
import { house } from '../interiors.js';

export default house({
  id: 'maison_port_ondine_2',
  name: 'Port-Ondine',
  music: 'town_1',
  layout: 'b',
  exit: { map: 'port_ondine', x: 9, y: 11 },
  npcs: [
    { id: 'voisine', sprite: 'maman', x: 3, y: 2, facing: 'down', movement: 'look', script: [{ cmd: 'say', text: 'maison_port_ondine_2_voisine' }] },
    { id: 'apprenti', sprite: 'marin', x: 5, y: 6, facing: 'left', movement: 'static', script: [{ cmd: 'say', text: 'maison_port_ondine_2_apprenti' }] },
  ],
});
