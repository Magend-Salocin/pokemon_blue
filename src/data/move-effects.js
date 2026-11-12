// Closed list of move effects. The battle engine (prompt 05) implements every entry.
// `effectChance` on a move is the chance in percent of the secondary effect (null = always,
// once the move hits). `params` documents the expected `effectParams` keys.
// Stat keys used in params: atk, def, spa, spd, spe, acc (précision), eva (esquive).

export const MOVE_EFFECTS = {
  damage: { description: 'Dégâts simples, sans effet secondaire.' },
  burn: { description: 'Brûle la cible (effectChance %).' },
  poison: { description: 'Empoisonne la cible (effectChance %).' },
  bad_poison: { description: 'Empoisonne gravement la cible : dégâts croissants à chaque tour.' },
  paralyze: { description: 'Paralyse la cible (effectChance %).' },
  sleep: { description: 'Endort la cible pour 1 à 3 tours.' },
  freeze: { description: 'Gèle la cible (effectChance %).' },
  confuse: { description: 'Rend la cible confuse (effectChance %).' },
  flinch: { description: 'Apeure la cible (effectChance %) : elle perd son tour si elle agit après.' },
  tri_status: { description: 'Brûle, gèle ou paralyse la cible au hasard (effectChance %).' },
  target_stat_down: { description: 'Baisse des stats de la cible.', params: { stats: '{ stat: -paliers }' } },
  self_stat_up: { description: 'Monte des stats du lanceur.', params: { stats: '{ stat: +paliers }' } },
  self_stat_down: { description: 'Baisse des stats du lanceur après l’attaque.', params: { stats: '{ stat: -paliers }' } },
  multi_hit: { description: 'Frappe plusieurs fois de suite.', params: { min: 'coups minimum', max: 'coups maximum' } },
  recoil: { description: 'Le lanceur subit une fraction des dégâts infligés.', params: { fraction: 'part des dégâts' } },
  drain: { description: 'Le lanceur récupère une fraction des dégâts infligés.', params: { fraction: 'part des dégâts' } },
  dream_drain: { description: 'Ne fonctionne que sur une cible endormie ; draine la moitié des dégâts.' },
  heal_half: { description: 'Le lanceur récupère la moitié de ses PV max.' },
  rest: { description: 'Le lanceur récupère tous ses PV, soigne son statut et dort 2 tours.' },
  protect: { description: 'Protège de toutes les attaques ce tour-ci ; échoue de plus en plus souvent si répété.' },
  charge_turn: {
    description: 'Charge au premier tour, frappe au second. Peut rendre le lanceur hors d’atteinte.',
    params: { semiInvulnerable: "'air' | 'underground' | 'underwater' | null" },
  },
  recharge: { description: 'Le lanceur doit se reposer au tour suivant.' },
  fixed_damage: { description: 'Inflige toujours le même nombre de PV.', params: { amount: 'PV' } },
  level_damage: { description: 'Inflige autant de PV que le niveau du lanceur.' },
  half_hp_damage: { description: 'Inflige la moitié des PV restants de la cible.' },
  ohko: { description: 'Met la cible K.O. si elle touche ; échoue contre un niveau supérieur.' },
  trap: { description: 'Piège la cible : elle ne peut pas fuir et perd 1/8 de ses PV par tour.', params: { turns: '[min, max]' } },
  self_destruct: { description: 'Le lanceur tombe K.O. après l’attaque.' },
  leech: { description: 'Graine : la cible perd 1/8 de ses PV par tour au profit du lanceur.' },
  counter: { description: 'Renvoie le double des dégâts physiques reçus ce tour-ci.' },
  haze: { description: 'Annule toutes les modifications de stats des deux camps.' },
  crit_up: { description: 'Augmente le taux de critique du lanceur jusqu’à sa sortie.' },
  screen: {
    description: 'Divise par deux les dégâts d’une catégorie pendant plusieurs tours.',
    params: { category: "'physical' | 'special'", turns: 'tours' },
  },
  rampage: { description: 'Attaque 2 ou 3 tours de suite, puis rend le lanceur confus.', params: { turns: '[min, max]' } },
  struggle: { description: 'Attaque de secours sans PP : le lanceur perd 1/4 de ses PV max.' },
};

export const MOVE_EFFECT_IDS = Object.keys(MOVE_EFFECTS);
