// Rest house of Route 3: a free heal (without changing the respawn point) and a tip.
import { house } from '../interiors.js';

export default house({
  id: 'maison_route_3',
  name: 'Maison de repos',
  music: 'route_2',
  layout: 'b',
  exit: { map: 'route_3', x: 15, y: 5 },
  npcs: [
    { id: 'hotesse', sprite: 'vieille_dame', x: 2, y: 2, facing: 'down', movement: 'static', script: [
      { cmd: 'say', text: 'maison_route_3_hotesse' },
      { cmd: 'play_sfx', sfx: 'jingle_heal' },
      { cmd: 'fade', direction: 'out', color: 'white' },
      { cmd: 'heal_party' },
      { cmd: 'wait', seconds: 0.4 },
      { cmd: 'fade', direction: 'in' },
      { cmd: 'say', text: 'maison_route_3_hotesse_fin' },
    ] },
    { id: 'randonneur_repos', sprite: 'randonneur', x: 6, y: 6, facing: 'left', movement: 'look',
      script: [{ cmd: 'say', text: 'maison_route_3_randonneur' }] },
  ],
});
