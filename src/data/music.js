// Which track plays when. Track ids are those of src/audio/tracks/.

/** Short loop played when a trainer spots the player, by `musicIntro` of the trainer class. */
export const ENCOUNTER_MUSIC = {
  trainer: 'encounter_trainer',
  villain: 'encounter_villain',
  rival: 'encounter_rival',
  leader: 'encounter_trainer',
};

/** Battle theme by `musicIntro` of the trainer class (a trainer may set its own `music`). */
export const BATTLE_MUSIC = {
  trainer: 'battle_trainer',
  villain: 'battle_trainer',
  rival: 'battle_rival',
  leader: 'battle_leader',
};

export const WILD_BATTLE_MUSIC = 'battle_wild';
export const VICTORY_MUSIC = { wild: 'victory_wild', trainer: 'victory_trainer' };

/** Tracks after which the map music resumes where it stopped. */
export const isBattleMusic = (id) => /^(battle_|victory_|encounter_)/.test(id ?? '');
