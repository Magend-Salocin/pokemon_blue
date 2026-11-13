// Maison de Port-Ondine 1: an old sailor tells the legend of the inner sea.
import { house } from '../interiors.js';

export default house({
  id: 'maison_port_ondine_1',
  name: 'Port-Ondine',
  music: 'town_1',
  layout: 'a',
  exit: { map: 'port_ondine', x: 4, y: 11 },
  npcs: [
    { id: 'conteur', sprite: 'vieil_homme', x: 5, y: 2, facing: 'down', movement: 'static', script: [{ cmd: 'say', text: 'maison_port_ondine_1_conteur' }] },
    { id: 'petite_fille', sprite: 'fillette', x: 2, y: 5, facing: 'right', movement: 'look', script: [{ cmd: 'say', text: 'maison_port_ondine_1_fillette' }] },
  ],
});
