// The 15 types and the effectiveness table (game design, section 5).
// Each attacking type lists its super effective targets (×2), resisted targets (×0.5)
// and immune targets (×0). Any pair not listed is neutral (×1).

export const TYPES = {
  normal: { name: 'Normal', icon: 'type/normal' },
  feu: { name: 'Feu', icon: 'type/feu' },
  eau: { name: 'Eau', icon: 'type/eau' },
  flore: { name: 'Flore', icon: 'type/flore' },
  foudre: { name: 'Foudre', icon: 'type/foudre' },
  givre: { name: 'Givre', icon: 'type/givre' },
  combat: { name: 'Combat', icon: 'type/combat' },
  toxique: { name: 'Toxique', icon: 'type/toxique' },
  terre: { name: 'Terre', icon: 'type/terre' },
  vent: { name: 'Vent', icon: 'type/vent' },
  arcane: { name: 'Arcane', icon: 'type/arcane' },
  insecte: { name: 'Insecte', icon: 'type/insecte' },
  roche: { name: 'Roche', icon: 'type/roche' },
  ombre: { name: 'Ombre', icon: 'type/ombre' },
  metal: { name: 'Métal', icon: 'type/metal' },
};

export const TYPE_IDS = Object.keys(TYPES);

export const TYPE_CHART = {
  normal: {
    strong: [
      'insecte', // Normal écrase Insecte
      'arcane', // Normal dissipe Arcane par le bon sens
    ],
    weak: [
      'roche', // Roche encaisse Normal
      'metal', // Métal encaisse Normal
    ],
    none: [
      'ombre', // Normal traverse Ombre sans la toucher
    ],
  },
  feu: {
    strong: [
      'flore', // Feu brûle Flore
      'givre', // Feu fait fondre Givre
      'insecte', // Feu grille Insecte
      'metal', // Feu fond Métal
    ],
    weak: [
      'feu', // Feu ne brûle pas Feu
      'eau', // Eau éteint Feu
      'roche', // Roche ne brûle pas
      'terre', // Terre étouffe Feu
    ],
    none: [],
  },
  eau: {
    strong: [
      'feu', // Eau éteint Feu
      'terre', // Eau détrempe Terre
      'roche', // Eau érode Roche
    ],
    weak: [
      'eau', // Eau se mêle à Eau
      'flore', // Flore boit Eau
      'givre', // Givre fige Eau
    ],
    none: [],
  },
  flore: {
    strong: [
      'eau', // Flore boit Eau
      'terre', // Flore s'enracine dans Terre
      'roche', // Flore fend Roche
    ],
    weak: [
      'feu', // Feu brûle Flore
      'flore', // Flore ne nourrit pas Flore
      'vent', // Vent disperse Flore
      'insecte', // Insecte dévore Flore
      'toxique', // Toxique flétrit Flore
      'metal', // Métal tranche Flore
    ],
    none: [],
  },
  foudre: {
    strong: [
      'eau', // Foudre électrise Eau
      'vent', // Foudre frappe Vent en plein ciel
      'metal', // Foudre traverse Métal
    ],
    weak: [
      'foudre', // Foudre se perd dans Foudre
      'flore', // Flore isole Foudre
    ],
    none: [
      'terre', // Terre absorbe Foudre
    ],
  },
  givre: {
    strong: [
      'vent', // Givre alourdit Vent
      'flore', // Givre gèle Flore
      'terre', // Givre durcit Terre
    ],
    weak: [
      'feu', // Feu fait fondre Givre
      'givre', // Givre ne gèle pas Givre
      'metal', // Métal résiste au froid
      'eau', // Eau dilue Givre
    ],
    none: [],
  },
  combat: {
    strong: [
      'normal', // Combat domine Normal
      'roche', // Combat brise Roche
      'givre', // Combat brise Givre
      'metal', // Combat cabosse Métal
      'ombre', // Combat chasse Ombre
    ],
    weak: [
      'vent', // Vent esquive Combat
      'toxique', // Toxique affaiblit Combat
      'insecte', // Insecte esquive Combat
      'arcane', // Arcane détourne Combat
    ],
    none: [],
  },
  toxique: {
    strong: [
      'flore', // Toxique flétrit Flore
      'arcane', // Toxique corrompt Arcane
    ],
    weak: [
      'toxique', // Toxique ne s'empoisonne pas
      'terre', // Terre filtre Toxique
      'roche', // Roche ne s'empoisonne pas
      'ombre', // Ombre absorbe Toxique
    ],
    none: [
      'metal', // Métal ne peut pas être empoisonné
    ],
  },
  terre: {
    strong: [
      'feu', // Terre étouffe Feu
      'foudre', // Terre absorbe Foudre
      'toxique', // Terre filtre Toxique
      'roche', // Terre ébranle Roche
      'metal', // Terre enterre Métal
    ],
    weak: [
      'flore', // Flore retient Terre
      'insecte', // Insecte creuse Terre
    ],
    none: [
      'vent', // Vent survole Terre
    ],
  },
  vent: {
    strong: [
      'flore', // Vent disperse Flore
      'insecte', // Vent emporte Insecte
      'combat', // Vent déséquilibre Combat
    ],
    weak: [
      'foudre', // Foudre frappe Vent en plein ciel
      'roche', // Roche brise Vent
      'metal', // Métal fend Vent
    ],
    none: [],
  },
  arcane: {
    strong: [
      'combat', // Arcane détourne Combat
      'toxique', // Arcane purifie Toxique
      'ombre', // Arcane illumine Ombre
    ],
    weak: [
      'arcane', // Arcane s'annule face à Arcane
      'metal', // Métal renvoie Arcane
    ],
    none: [],
  },
  insecte: {
    strong: [
      'flore', // Insecte dévore Flore
      'arcane', // Insecte grignote les grimoires d'Arcane
      'ombre', // Insecte débusque Ombre
    ],
    weak: [
      'feu', // Feu grille Insecte
      'vent', // Vent emporte Insecte
      'combat', // Combat écrase Insecte
      'metal', // Métal protège d'Insecte
      'toxique', // Toxique repousse Insecte
    ],
    none: [],
  },
  roche: {
    strong: [
      'feu', // Roche étouffe Feu
      'givre', // Roche brise Givre
      'vent', // Roche brise Vent
      'insecte', // Roche écrase Insecte
      'foudre', // Roche isole Foudre
    ],
    weak: [
      'combat', // Combat brise Roche
      'terre', // Terre ébranle Roche
      'metal', // Métal raye Roche
    ],
    none: [],
  },
  ombre: {
    strong: [
      'arcane', // Ombre éteint Arcane
      'ombre', // Ombre dévore Ombre
      'normal', // Ombre effraie Normal
    ],
    weak: [
      'combat', // Combat chasse Ombre
      'metal', // Métal reflète Ombre
    ],
    none: [],
  },
  metal: {
    strong: [
      'givre', // Métal brise Givre
      'roche', // Métal raye Roche
      'arcane', // Métal renvoie Arcane
    ],
    weak: [
      'feu', // Feu fond Métal
      'eau', // Eau rouille Métal
      'foudre', // Foudre traverse Métal
      'metal', // Métal raye à peine Métal
    ],
    none: [],
  },
};

/** Multiplier of one attacking type against one defending type: 0, 0.5, 1 or 2. */
export function getTypeMultiplier(attackType, defenderType) {
  const row = TYPE_CHART[attackType];
  if (!row) throw new Error(`Unknown attack type: ${attackType}`);
  if (row.none.includes(defenderType)) return 0;
  if (row.strong.includes(defenderType)) return 2;
  if (row.weak.includes(defenderType)) return 0.5;
  return 1;
}

/** Combined multiplier against one or two defending types: 0 to 4. */
export function getEffectiveness(attackType, defenderTypes) {
  return defenderTypes.reduce((total, type) => total * getTypeMultiplier(attackType, type), 1);
}
