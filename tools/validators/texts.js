// Display constraints: length limits (in characters, the font is monospace),
// characters the font can draw, and forbidden words.
import { wrapParagraph } from '../../src/ui/text-layout.js';
import { FORBIDDEN_WORDS } from '../forbidden-words.js';

export const TEXT_LIMITS = {
  moveName: 12,
  moveDescriptionLines: 2,
  creatureName: 10,
  creatureDescriptionLines: 3,
  creatureCategory: 18,
  itemName: 17,
  itemDescriptionLines: 3,
  trainerClassName: 12,
  lineWidth: 18,
};

export function normalizeForSearch(text) {
  return ` ${text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/œ/g, 'oe')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()} `;
}

const NORMALIZED_FORBIDDEN = FORBIDDEN_WORDS.map((word) => ({ word, needle: normalizeForSearch(word) }));

export function findForbiddenWords(text) {
  const haystack = normalizeForSearch(text);
  return NORMALIZED_FORBIDDEN.filter(({ needle }) => haystack.includes(needle)).map(({ word }) => word);
}

const length = (text) => Array.from(text).length;

/** Every displayed string with its label and constraints. */
function displayedTexts(data) {
  const texts = [];
  const add = (label, text, { maxLength, maxLines }) => texts.push({ label, text, maxLength, maxLines });
  for (const move of data.moves) {
    add(`attaque ${move.id} (nom)`, move.name, { maxLength: TEXT_LIMITS.moveName });
    add(`attaque ${move.id} (description)`, move.description, { maxLines: TEXT_LIMITS.moveDescriptionLines });
  }
  for (const creature of data.creatures) {
    add(`bestiole ${creature.id} (nom)`, creature.name, { maxLength: TEXT_LIMITS.creatureName });
    add(`bestiole ${creature.id} (catégorie)`, creature.category, { maxLength: TEXT_LIMITS.creatureCategory });
    add(`bestiole ${creature.id} (description)`, creature.description, { maxLines: TEXT_LIMITS.creatureDescriptionLines });
  }
  for (const item of data.items) {
    add(`objet ${item.id} (nom)`, item.name, { maxLength: TEXT_LIMITS.itemName });
    add(`objet ${item.id} (description)`, item.description, { maxLines: TEXT_LIMITS.itemDescriptionLines });
  }
  for (const trainerClass of data.trainerClasses) {
    add(`classe ${trainerClass.id} (nom)`, trainerClass.name, { maxLength: TEXT_LIMITS.trainerClassName });
  }
  for (const [id, type] of Object.entries(data.types)) add(`type ${id}`, type.name, {});
  for (const [id, name] of Object.entries(data.habitats)) add(`habitat ${id}`, name, {});
  return texts;
}

export function checkTexts(data) {
  const errors = [];
  for (const { label, text, maxLength, maxLines } of displayedTexts(data)) {
    if (typeof text !== 'string') {
      errors.push(`${label} : texte manquant`);
      continue;
    }
    const missing = [...new Set(Array.from(text).filter((character) => !data.glyphs.has(character)))];
    if (missing.length > 0) errors.push(`${label} : caractères absents de la police ${JSON.stringify(missing.join(''))}`);
    if (maxLength && length(text) > maxLength) errors.push(`${label} : « ${text} » dépasse ${maxLength} caractères`);
    if (maxLines) {
      const lines = wrapParagraph(text, TEXT_LIMITS.lineWidth);
      if (lines.length > maxLines) errors.push(`${label} : ${lines.length} lignes au lieu de ${maxLines} max (« ${text} »)`);
    }
    const forbidden = findForbiddenWords(text);
    if (forbidden.length > 0) errors.push(`${label} : mot interdit ${forbidden.join(', ')}`);
  }
  return errors;
}
