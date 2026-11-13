// Trainer classes. Reward = highest level in the team × moneyBase (game design, section 5).
// `portrait: null` = each trainer of the class defines its own portrait (champions, Gardiens).
// `name: ''` = only the trainer's name is shown (rival).

export const MUSIC_INTROS = ['trainer', 'villain', 'rival', 'leader'];

function trainerClass(id, name, portrait, moneyBase, musicIntro = 'trainer') {
  return { id, name, portrait, moneyBase, musicIntro };
}

export const TRAINER_CLASSES = [
  trainerClass('gamin', 'Gamin', 'portrait/gamin', 15),
  trainerClass('fillette', 'Fillette', 'portrait/fillette', 15),
  trainerClass('ecolier', 'Écolier', 'portrait/ecolier', 20),
  trainerClass('randonneur', 'Randonneur', 'portrait/randonneur', 30),
  trainerClass('randonneuse', 'Randonneuse', 'portrait/randonneuse', 30),
  trainerClass('campeur', 'Campeur', 'portrait/campeur', 20),
  trainerClass('campeuse', 'Campeuse', 'portrait/campeuse', 20),
  trainerClass('pecheur', 'Pêcheur', 'portrait/pecheur', 35),
  trainerClass('marin', 'Marin', 'portrait/marin', 30),
  trainerClass('nageur', 'Nageur', 'portrait/nageur', 25),
  trainerClass('nageuse', 'Nageuse', 'portrait/nageuse', 25),
  trainerClass('motard', 'Motard', 'portrait/motard', 30),
  trainerClass('ouvrier', 'Ouvrier', 'portrait/ouvrier', 30),
  trainerClass('scientifique', 'Scientifique', 'portrait/scientifique', 50),
  trainerClass('chercheuse', 'Chercheuse', 'portrait/chercheuse', 50),
  trainerClass('dresseur', 'Dresseur', 'portrait/dresseur', 40),
  trainerClass('dresseuse', 'Dresseuse', 'portrait/dresseuse', 40),
  trainerClass('montagnard', 'Montagnard', 'portrait/montagnard', 35),
  trainerClass('gentleman', 'Gentleman', 'portrait/gentleman', 70),
  trainerClass('dame', 'Dame', 'portrait/dame', 70),
  trainerClass('mystique', 'Mystique', 'portrait/mystique', 40),
  trainerClass('danseuse', 'Danseuse', 'portrait/danseuse', 30),
  trainerClass('sbire_opale', 'Sbire Opale', 'portrait/sbire_opale', 30, 'villain'),
  trainerClass('sbire_opale_f', 'Sbire Opale', 'portrait/sbire_opale_f', 30, 'villain'),
  trainerClass('lieutenant_opale', 'Lieutenant', 'portrait/sbire_opale', 60, 'villain'),
  trainerClass('fondateur_opale', 'Fondateur', 'portrait/corvin', 100, 'villain'),
  trainerClass('rival', '', 'portrait/rival', 50, 'rival'),
  trainerClass('champion', 'Champion', null, 100, 'leader'),
  trainerClass('championne', 'Championne', null, 100, 'leader'),
  trainerClass('gardien', 'Gardien', null, 120, 'leader'),
  trainerClass('gardienne', 'Gardienne', null, 120, 'leader'),
];

export const TRAINER_CLASSES_BY_ID = Object.fromEntries(TRAINER_CLASSES.map((entry) => [entry.id, entry]));
