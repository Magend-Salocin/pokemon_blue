// Type chart constraints (game design, section 5).

export const TYPE_RULES = { minStrengths: 2, minWeaknesses: 2, maxImmunities: 4, maxBalance: 3 };

/** Per type: offensive strengths, defensive weaknesses and their balance. */
export function typeBalance(typeChart) {
  const types = Object.keys(typeChart);
  return Object.fromEntries(types.map((type) => {
    const strengths = typeChart[type].strong.length;
    const weaknesses = types.filter((attacker) => typeChart[attacker].strong.includes(type)).length;
    return [type, { strengths, weaknesses, balance: strengths - weaknesses }];
  }));
}

export function checkTypes(data) {
  const errors = [];
  const ids = Object.keys(data.types);
  let immunities = 0;
  for (const [type, row] of Object.entries(data.typeChart)) {
    if (!ids.includes(type)) errors.push(`table des types : type inconnu « ${type} »`);
    const targets = [...row.strong, ...row.weak, ...row.none];
    for (const target of targets) {
      if (!ids.includes(target)) errors.push(`table des types : ${type} vise un type inconnu « ${target} »`);
    }
    if (new Set(targets).size !== targets.length) errors.push(`table des types : ${type} cite un type deux fois`);
    immunities += row.none.length;
  }
  for (const type of ids) {
    if (!data.typeChart[type]) errors.push(`table des types : ligne manquante pour ${type}`);
    if (!data.atlas.ui.has(data.types[type].icon)) errors.push(`type ${type} : icône « ${data.types[type].icon} » absente de l’atlas ui`);
  }
  if (immunities > TYPE_RULES.maxImmunities) errors.push(`table des types : ${immunities} immunités (max ${TYPE_RULES.maxImmunities})`);
  for (const [type, { strengths, weaknesses, balance }] of Object.entries(typeBalance(data.typeChart))) {
    if (strengths < TYPE_RULES.minStrengths) errors.push(`type ${type} : ${strengths} forces offensives (min ${TYPE_RULES.minStrengths})`);
    if (weaknesses < TYPE_RULES.minWeaknesses) errors.push(`type ${type} : ${weaknesses} faiblesses (min ${TYPE_RULES.minWeaknesses})`);
    if (Math.abs(balance) > TYPE_RULES.maxBalance) errors.push(`type ${type} : solde ${balance} hors de ±${TYPE_RULES.maxBalance}`);
  }
  return errors;
}
