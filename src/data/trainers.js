// Individual trainers. Stub for prompt 04: the content prompts (09 to 11) fill this list.
// Texts are ids from src/data/texts/. `after` is said when talked to once defeated.

export const TRAINERS = [
  {
    id: 'test_gamin',
    class: 'gamin',
    name: 'Léo',
    party: [{ creature: 'musaraille', level: 4 }, { creature: 'pivelin', level: 4 }],
    intro: 'test_gamin_intro',
    defeat: 'test_gamin_defeat',
    after: 'test_gamin_after',
  },
];

export const TRAINERS_BY_ID = Object.fromEntries(TRAINERS.map((trainer) => [trainer.id, trainer]));
