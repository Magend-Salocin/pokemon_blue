import { halte } from '../interiors.js';

export default halte({
  id: 'halte_bourg_sablon',
  name: 'Halte de Bourg-Sablon',
  exit: { map: 'bourg_sablon', x: 14, y: 4 },
  npcs: [
    { id: 'voyageuse', sprite: 'campeuse', x: 6, y: 5, facing: 'left', movement: 'look', script: [{ cmd: 'say', text: 'halte_bourg_sablon_voyageuse' }] },
    { id: 'vieux', sprite: 'vieil_homme', x: 2, y: 6, facing: 'up', movement: 'static', script: [{ cmd: 'say', text: 'halte_bourg_sablon_vieux' }] },
  ],
});
