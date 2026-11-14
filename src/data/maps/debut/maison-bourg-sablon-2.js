import { house } from '../interiors.js';

export default house({
  id: 'maison_bourg_sablon_2',
  name: 'Maison',
  music: 'town_1',
  layout: 'a',
  exit: { map: 'bourg_sablon', x: 4, y: 12 },
  npcs: [
    {
      id: 'jardiniere', sprite: 'vieille_dame', x: 5, y: 5, facing: 'left', movement: 'static',
      script: [
        {
          cmd: 'if_flag', flag: 'maison_bourg_sablon_2_cadeau',
          then: [{ cmd: 'say', text: 'maison_bourg_sablon_2_apres' }],
          else: [
            { cmd: 'say', text: 'maison_bourg_sablon_2_cadeau' },
            { cmd: 'give_item', item: 'antidote', count: 2 },
            { cmd: 'set_flag', flag: 'maison_bourg_sablon_2_cadeau' },
          ],
        },
      ],
    },
  ],
});
