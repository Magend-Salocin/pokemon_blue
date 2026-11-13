// Pension of the Route 4: the old lady raises one creature while the player walks.
import { house } from '../interiors.js';

export default house({
  id: 'pension_route_4',
  name: 'Pension',
  music: 'halte',
  layout: 'b',
  exit: { map: 'route_4', x: 4, y: 4 },
  npcs: [
    {
      id: 'pensionnaire', sprite: 'vieille_dame', x: 3, y: 2, facing: 'down', movement: 'static',
      script: [{ cmd: 'say', text: 'pension_route_4_dame' }, { cmd: 'open_menu', menu: 'daycare' }],
    },
    { id: 'mari', sprite: 'vieil_homme', x: 6, y: 6, facing: 'left', movement: 'look', script: [{ cmd: 'say', text: 'pension_route_4_mari' }] },
  ],
});
