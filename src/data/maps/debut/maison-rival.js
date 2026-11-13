// The rival's house: her older sister comments on each step of the story.
import { house } from '../interiors.js';

export default house({
  id: 'maison_rival',
  name: 'Maison de la rivale',
  music: 'hometown',
  layout: 'c',
  exit: { map: 'hameau_de_lys', x: 13, y: 5 },
  npcs: [
    {
      id: 'soeur', sprite: 'dresseuse', x: 5, y: 5, facing: 'left', movement: 'look',
      script: [
        {
          cmd: 'if_flag', flag: 'has_bestiary',
          then: [{ cmd: 'say', text: 'maison_rival_soeur_bestiaire' }],
          else: [
            {
              cmd: 'if_flag', flag: 'got_starter',
              then: [{ cmd: 'say', text: 'maison_rival_soeur_starter' }],
              else: [{ cmd: 'say', text: 'maison_rival_soeur_debut' }],
            },
          ],
        },
      ],
    },
  ],
  signs: [
    { x: 4, y: 1, text: 'maison_rival_etagere' },
    { x: 5, y: 1, text: 'maison_rival_etagere' },
  ],
});
