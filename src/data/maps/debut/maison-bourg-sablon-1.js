import { house } from '../interiors.js';

export default house({
  id: 'maison_bourg_sablon_1',
  name: 'Maison',
  music: 'town_1',
  layout: 'b',
  exit: { map: 'bourg_sablon', x: 9, y: 4 },
  npcs: [
    { id: 'conteur', sprite: 'vieil_homme', x: 2, y: 6, facing: 'right', movement: 'static', script: [{ cmd: 'say', text: 'maison_bourg_sablon_1_conteur' }] },
    { id: 'fillette', sprite: 'fillette', x: 2, y: 1, facing: 'down', movement: 'look', script: [{ cmd: 'say', text: 'maison_bourg_sablon_1_fillette' }] },
  ],
});
