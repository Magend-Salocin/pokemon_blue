// Halte de Port-Ondine.
import { halte } from '../interiors.js';

export default halte({
  id: 'halte_port_ondine',
  name: 'Halte de Port-Ondine',
  exit: { map: 'port_ondine', x: 4, y: 4 },
  npcs: [
    { id: 'voyageuse', sprite: 'dresseuse', x: 6, y: 5, facing: 'left', movement: 'look', script: [{ cmd: 'say', text: 'halte_port_ondine_voyageuse' }] },
  ],
});
