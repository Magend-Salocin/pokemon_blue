import { buildBackPortrait, buildPortrait } from './portrait-builder.js';

// One portrait per trainer class (ids reused by src/data/trainer-classes.js), plus story characters.
export const PORTRAIT_CONFIGS = {
  gamin: { build: 'kid', hair: 'short', hairTone: 3, hat: 'cap', hatTone: 1, top: 1, expression: 'smile' },
  fillette: { build: 'kid', hair: 'ponytail', hairTone: 2, top: 1, extras: ['lashes'], expression: 'smile' },
  ecolier: { build: 'kid', hair: 'curly', hairTone: 3, outfit: 'jacket', top: 2, extras: ['backpack'], expression: 'neutral' },
  randonneur: { build: 'large', hair: 'short', hairTone: 3, hat: 'hat', hatTone: 2, top: 2, outfit: 'jacket', extras: ['beard', 'backpack'], expression: 'smile' },
  randonneuse: { hair: 'ponytail', hairTone: 2, hat: 'cap', hatTone: 2, top: 1, outfit: 'jacket', extras: ['backpack', 'lashes'], expression: 'smile' },
  campeur: { build: 'kid', hair: 'short', hairTone: 2, hat: 'bandana', hatTone: 2, top: 1, extras: ['backpack'], expression: 'smirk' },
  campeuse: { build: 'kid', hair: 'bun', hairTone: 3, hat: 'bandana', hatTone: 1, top: 2, extras: ['lashes'], expression: 'smile' },
  pecheur: { hair: 'short', hairTone: 2, hat: 'hat', hatTone: 1, top: 1, outfit: 'jacket', extras: ['mustache'], expression: 'neutral' },
  marin: { build: 'large', hair: 'short', hairTone: 3, hat: 'beanie', hatTone: 2, top: 0, outfit: 'shirt', extras: ['beard'], expression: 'smirk' },
  nageur: { hair: 'short', hairTone: 3, outfit: 'swim', top: 2, expression: 'smile' },
  nageuse: { hair: 'long', hairTone: 2, outfit: 'swim', top: 1, extras: ['lashes'], expression: 'smile' },
  motard: { build: 'large', hair: 'short', hairTone: 3, hat: 'helmet', hatTone: 2, top: 3, outfit: 'jacket', expression: 'stern' },
  ouvrier: { build: 'large', hair: 'short', hairTone: 2, hat: 'helmet', hatTone: 1, top: 1, outfit: 'jacket', extras: ['mustache'], expression: 'neutral' },
  scientifique: { hair: 'short', hairTone: 3, top: 2, outfit: 'coat', extras: ['glasses'], expression: 'neutral' },
  chercheuse: { hair: 'bun', hairTone: 2, top: 1, outfit: 'coat', extras: ['glasses', 'lashes'], expression: 'smirk' },
  dresseur: { hair: 'spiky', hairTone: 3, top: 2, outfit: 'jacket', expression: 'smirk' },
  dresseuse: { hair: 'long', hairTone: 3, top: 1, outfit: 'jacket', extras: ['lashes'], expression: 'smirk' },
  montagnard: { build: 'large', hair: 'curly', hairTone: 3, hat: 'beanie', hatTone: 1, top: 2, outfit: 'jacket', extras: ['beard', 'scarf'], expression: 'smile' },
  gentleman: { hair: 'short', hairTone: 1, hat: 'hat', hatTone: 3, top: 3, outfit: 'jacket', extras: ['mustache'], expression: 'smile' },
  dame: { hair: 'bun', hairTone: 1, top: 2, outfit: 'robe', extras: ['lashes'], expression: 'smile' },
  mystique: { hair: 'long', hairTone: 3, hat: 'hood', hatTone: 2, top: 2, outfit: 'robe', extras: ['lashes'], expression: 'neutral' },
  danseuse: { hair: 'curly', hairTone: 2, top: 1, outfit: 'robe', extras: ['lashes', 'scarf'], scarfTone: 0, expression: 'smile' },
  sbire_opale: { hair: 'short', hairTone: 3, hat: 'helmet', hatTone: 2, top: 2, outfit: 'uniform', expression: 'stern' },
  sbire_opale_f: { hair: 'ponytail', hairTone: 3, hat: 'helmet', hatTone: 2, top: 2, outfit: 'uniform', extras: ['lashes'], expression: 'stern' },
  // Story
  rival: { hair: 'spiky', hairTone: 1, top: 2, outfit: 'jacket', extras: ['lashes'], expression: 'smirk' },
  professeure: { hair: 'long', hairTone: 2, top: 1, outfit: 'coat', extras: ['glasses', 'lashes'], expression: 'smile' },
  corvin: { build: 'large', hair: 'short', hairTone: 1, top: 3, outfit: 'coat', extras: ['beard', 'scarf'], scarfTone: 0, expression: 'stern' },
  garance: { hair: 'curly', hairTone: 3, hat: 'bandana', hatTone: 2, top: 2, outfit: 'jacket', extras: ['lashes'], expression: 'smirk' },
  mael: { build: 'large', hair: 'spiky', hairTone: 2, outfit: 'swim', top: 1, expression: 'smile' },
  selene: { hair: 'ponytail', hairTone: 1, top: 3, outfit: 'jacket', extras: ['lashes', 'glasses'], expression: 'smirk' },
  aubin: { hair: 'curly', hairTone: 2, hat: 'hat', hatTone: 1, top: 1, outfit: 'shirt', expression: 'smile' },
  ysolde: { hair: 'long', hairTone: 1, top: 0, outfit: 'robe', extras: ['lashes', 'scarf'], scarfTone: 1, expression: 'neutral' },
  lazare: { hair: 'long', hairTone: 3, hat: 'hood', hatTone: 3, top: 3, outfit: 'robe', expression: 'stern' },
  brune: { build: 'large', hair: 'spiky', hairTone: 3, hat: 'bandana', hatTone: 1, top: 2, outfit: 'jacket', extras: ['lashes'], expression: 'smirk' },
  oswin: { hair: 'bald', hairTone: 1, top: 2, outfit: 'robe', extras: ['beard', 'glasses'], expression: 'neutral' },
  gardien_1: { hair: 'short', hairTone: 3, top: 3, outfit: 'coat', extras: ['glasses'], expression: 'stern' },
  gardien_2: { hair: 'long', hairTone: 3, top: 2, outfit: 'robe', extras: ['lashes'], expression: 'smirk' },
  gardien_3: { build: 'large', hair: 'spiky', hairTone: 2, top: 3, outfit: 'jacket', extras: ['beard'], expression: 'stern' },
  gardien_4: { hair: 'bun', hairTone: 1, hat: 'hood', hatTone: 1, top: 1, outfit: 'robe', extras: ['lashes'], expression: 'neutral' },
};

export const BACK_CONFIGS = {
  joueur: { hairTone: 3, hat: 'cap', hatTone: 2, top: 1, backpack: true },
  joueuse: { hairTone: 2, hair: 'long', hat: 'hat', hatTone: 1, top: 2, backpack: true },
};

/** Atlas frames: "portrait/<id>" and "back/<id>". */
export function buildTrainerFrames() {
  const frames = {};
  for (const [id, config] of Object.entries(PORTRAIT_CONFIGS)) frames[`portrait/${id}`] = buildPortrait(config);
  for (const [id, config] of Object.entries(BACK_CONFIGS)) frames[`back/${id}`] = buildBackPortrait(config);
  return frames;
}
