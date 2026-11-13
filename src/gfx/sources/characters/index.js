import { composeCharacter } from './character-parts.js';

// Tones: 0 lightest → 3 darkest. hair/hairTone, top, bottom, capTone (hat, cap, hood, helmet, bandana).
export const CHARACTER_CONFIGS = {
  // Story
  joueur: { hair: 'cap', hairTone: 3, capTone: 2, top: 1, bottom: 2 },
  joueuse: { hair: 'hat', hairTone: 2, capTone: 1, top: 2, bottom: 1, body: 'dress' },
  rival: { hair: 'spiky', hairTone: 1, top: 2, bottom: 3 },
  professeure: { hair: 'long', hairTone: 2, top: 0, bottom: 2, body: 'coat', extras: ['glasses'] },
  maman: { hair: 'ponytail', hairTone: 3, top: 1, bottom: 2, body: 'dress' },
  sbire_opale: { hair: 'helmet', hairTone: 2, top: 2, bottom: 2 },
  corvin: { hair: 'short', hairTone: 1, top: 3, bottom: 3, body: 'coat', extras: ['beard'] },
  // Champions
  garance: { hair: 'long', hairTone: 3, top: 2, bottom: 2, extras: ['backpack'] },
  mael: { hair: 'spiky', hairTone: 2, top: 1, bottom: 1, body: 'shorts' },
  selene: { hair: 'ponytail', hairTone: 1, top: 2, bottom: 3, body: 'shorts' },
  aubin: { hair: 'hat', hairTone: 2, capTone: 1, top: 1, bottom: 2 },
  ysolde: { hair: 'long', hairTone: 1, top: 0, bottom: 1, body: 'dress' },
  lazare: { hair: 'hood', hairTone: 3, capTone: 3, top: 3, bottom: 3, body: 'coat' },
  brune: { hair: 'bandana', hairTone: 3, capTone: 2, top: 2, bottom: 2 },
  oswin: { hair: 'bald', hairTone: 1, top: 1, bottom: 2, body: 'coat', extras: ['beard'] },
  // Guardians of the League (names chosen in prompt 11)
  gardien_1: { hair: 'short', hairTone: 2, top: 3, bottom: 3, extras: ['glasses'] },
  gardien_2: { hair: 'long', hairTone: 3, top: 3, bottom: 2, body: 'dress' },
  gardien_3: { hair: 'spiky', hairTone: 3, top: 2, bottom: 3, extras: ['beard'] },
  gardien_4: { hair: 'hood', hairTone: 1, capTone: 1, top: 1, bottom: 3, body: 'coat' },
  // Generic NPCs
  gamin: { hair: 'cap', hairTone: 3, capTone: 1, top: 1, bottom: 2, body: 'shorts' },
  fillette: { hair: 'ponytail', hairTone: 2, top: 1, bottom: 1, body: 'dress' },
  randonneur: { hair: 'hat', hairTone: 3, capTone: 2, top: 2, bottom: 3, extras: ['backpack', 'beard'] },
  pecheur: { hair: 'hat', hairTone: 2, capTone: 1, top: 1, bottom: 3 },
  scientifique: { hair: 'short', hairTone: 3, top: 0, bottom: 2, body: 'coat', extras: ['glasses'] },
  marin: { hair: 'cap', hairTone: 3, capTone: 0, top: 0, bottom: 2 },
  vieil_homme: { hair: 'bald', hairTone: 1, top: 2, bottom: 2 },
  vieille_dame: { hair: 'ponytail', hairTone: 1, top: 2, bottom: 2, body: 'dress', extras: ['glasses'] },
  infirmiere: { hair: 'cap', hairTone: 2, capTone: 0, top: 0, bottom: 1, body: 'dress' },
  vendeur: { hair: 'short', hairTone: 2, top: 1, bottom: 2, extras: ['glasses'] },
  nageur: { hair: 'short', hairTone: 3, top: 0, bottom: 2, body: 'swimsuit' },
  motard: { hair: 'helmet', hairTone: 3, top: 3, bottom: 3 },
  dresseuse: { hair: 'long', hairTone: 2, top: 1, bottom: 3 },
  montagnard: { hair: 'bandana', hairTone: 3, capTone: 1, top: 2, bottom: 2, extras: ['backpack', 'beard'] },
  ouvrier: { hair: 'helmet', hairTone: 1, top: 1, bottom: 2 },
  gentleman: { hair: 'hat', hairTone: 1, capTone: 3, top: 3, bottom: 3, extras: ['beard'] },
  campeuse: { hair: 'bandana', hairTone: 2, capTone: 1, top: 1, bottom: 2, body: 'shorts', extras: ['backpack'] },
  mystique: { hair: 'hood', hairTone: 2, capTone: 2, top: 2, bottom: 2, body: 'dress' },
  // Variants
  joueur_bouee: { hair: 'cap', hairTone: 3, capTone: 2, top: 1, bottom: 2, buoy: true },
  joueuse_bouee: { hair: 'hat', hairTone: 2, capTone: 1, top: 2, bottom: 1, buoy: true },
};

// Single-frame overworld objects (16 × 16).
export const OBJECT_SPRITES = {
  capsule: [
    '................',
    '................',
    '................',
    '................',
    '.....333333.....',
    '....30000003....',
    '...3000000003...',
    '...3000330003...',
    '...3333003333...',
    '...3222332223...',
    '...3222222223...',
    '....32222223....',
    '.....333333.....',
    '................',
    '................',
    '................',
  ],
  rocher: [
    '................',
    '................',
    '.....333333.....',
    '...3311111133...',
    '..310011111113..',
    '..310111111123..',
    '.31111113111123.',
    '.31111131111223.',
    '.31111311112223.',
    '.31111111122223.',
    '.31211111222223.',
    '..312222222223..',
    '..332222222233..',
    '...3333333333...',
    '................',
    '................',
  ],
};

/** Electric gate of the Foudre arena, removed by its floor switch. */
OBJECT_SPRITES.barriere = [
  '................',
  '.33..........33.',
  '3113........3113',
  '31133......33113',
  '3113.3....3.3113',
  '3113..3..3..3113',
  '3113...33...3113',
  '3113..3..3..3113',
  '3113.3....3.3113',
  '31133......33113',
  '3113.3....3.3113',
  '3113..3..3..3113',
  '3223...33...3223',
  '3223........3223',
  '3333........3333',
  '................',
];

/** Atlas frames: "<id>/<direction>/<frame>" for characters and objects, plus "<id>" for objects. */
export function buildCharacterFrames() {
  const frames = {};
  for (const [id, config] of Object.entries(CHARACTER_CONFIGS)) {
    const directions = composeCharacter(config);
    for (const [direction, list] of Object.entries(directions)) {
      list.forEach((rows, frame) => {
        frames[`${id}/${direction}/${frame}`] = rows;
      });
    }
  }
  // Objects also get character frames, so a map can place them as static actors (boulders, gates).
  for (const [id, rows] of Object.entries(OBJECT_SPRITES)) {
    frames[id] = rows;
    for (const direction of ['down', 'up', 'left']) {
      for (const frame of [0, 1]) frames[`${id}/${direction}/${frame}`] = rows;
    }
  }
  return frames;
}
