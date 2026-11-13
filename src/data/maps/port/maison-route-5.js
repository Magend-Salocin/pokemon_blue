// House of the Route 5, before the shrubs: the gardener gives the Machette once the Eau badge is
// won, and a farmer trades a Noisetin for a Bovaillon.
import { house } from '../interiors.js';

export default house({
  id: 'maison_route_5',
  name: 'Route 5',
  music: 'route_2',
  layout: 'c',
  exit: { map: 'route_5', x: 23, y: 4 },
  npcs: [
    { id: 'jardinier', sprite: 'vieil_homme', x: 4, y: 3, facing: 'down', movement: 'static', script: 'jardinier' },
    { id: 'fermiere', sprite: 'campeuse', x: 6, y: 5, facing: 'left', movement: 'static', script: 'echange' },
  ],
  scripts: {
    jardinier: [
      {
        cmd: 'if_flag', flag: 'route_5_machette',
        then: [{ cmd: 'say', text: 'maison_route_5_jardinier_after' }],
        else: [
          {
            cmd: 'if_badge', badge: 'eau',
            then: [
              { cmd: 'say', text: 'maison_route_5_jardinier_don' },
              { cmd: 'give_item', item: 'machette' },
              { cmd: 'set_flag', flag: 'route_5_machette' },
              { cmd: 'say', text: 'maison_route_5_jardinier_conseil' },
            ],
            else: [{ cmd: 'say', text: 'maison_route_5_jardinier_refus' }],
          },
        ],
      },
    ],
    echange: [
      {
        cmd: 'if_flag', flag: 'route_5_echange',
        then: [{ cmd: 'say', text: 'maison_route_5_fermiere_after' }],
        else: [
          { cmd: 'say', text: 'maison_route_5_fermiere' },
          {
            cmd: 'trade', wanted: 'bovaillon', flag: 'route_5_echange',
            offer: { creature: 'noisetin', level: 18, nickname: 'Grignotte', originalTrainer: 'Odile' },
          },
        ],
      },
    ],
  },
});
