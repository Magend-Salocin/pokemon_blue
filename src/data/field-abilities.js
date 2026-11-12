// Field items and the badge each one requires (game design, section 4).
// Badge ids follow the arenas: roche, eau, foudre, flore, vent, ombre, feu, arcane.

export const FIELD_REQUIREMENTS = {
  cut: { item: 'machette', badge: 'eau' },
  flash: { item: 'lanterne', badge: 'foudre' },
  climb: { item: 'grappin', badge: 'flore' },
  surf: { item: 'bouee', badge: 'vent' },
  strength: { item: 'gants_de_force', badge: 'vent' },
  fly: { item: 'cerf_volant', badge: 'ombre' },
};

/** Item that lets the player run while holding B. */
export const RUNNING_ITEM = 'chaussures';

export const BADGE_NAMES = {
  roche: 'Roche', eau: 'Eau', foudre: 'Foudre', flore: 'Flore', vent: 'Vent', ombre: 'Ombre', feu: 'Feu', arcane: 'Arcane',
};

/** 'ok' | 'no_item' | 'no_badge' for a field ability, given the game state helpers. */
export function fieldAbilityStatus(ability, { hasItem, hasBadge }) {
  const requirement = FIELD_REQUIREMENTS[ability];
  if (!hasItem(requirement.item)) return 'no_item';
  if (!hasBadge(requirement.badge)) return 'no_badge';
  return 'ok';
}
