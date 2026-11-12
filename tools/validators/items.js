// Items and trainer classes.

const USE_CONTEXTS = ['field', 'battle', 'both', 'none'];
const CLASSES_WITH_OWN_PORTRAIT = ['champion', 'championne', 'gardien', 'gardienne'];

export function checkItems(data) {
  const errors = [];
  for (const item of data.items) {
    const label = `objet ${item.id}`;
    if (!data.pockets.includes(item.pocket)) errors.push(`${label} : poche inconnue « ${item.pocket} »`);
    if (!(Number.isInteger(item.price) && item.price >= 0)) errors.push(`${label} : prix invalide`);
    if (item.pocket === 'key' && item.price !== 0) errors.push(`${label} : un objet clé n’est pas vendable (prix 0)`);
    if (!USE_CONTEXTS.includes(item.use?.context)) errors.push(`${label} : contexte d’usage inconnu`);
    if (!data.itemEffects[item.use?.effect]) errors.push(`${label} : effet hors liste « ${item.use?.effect} »`);
    if (item.use?.effect === 'field_ability' && !data.fieldAbilities.includes(item.use.params?.ability)) {
      errors.push(`${label} : action de terrain inconnue`);
    }
  }
  for (const effect of Object.keys(data.itemEffects)) {
    if (!data.items.some((item) => item.use.effect === effect)) errors.push(`effet d’objet ${effect} : utilisé par aucun objet`);
  }
  return errors;
}

export function checkTrainerClasses(data) {
  const errors = [];
  for (const trainerClass of data.trainerClasses) {
    const label = `classe ${trainerClass.id}`;
    if (trainerClass.portrait === null) {
      if (!CLASSES_WITH_OWN_PORTRAIT.includes(trainerClass.id)) errors.push(`${label} : portrait manquant`);
    } else if (!data.atlas.trainers.has(trainerClass.portrait)) {
      errors.push(`${label} : portrait « ${trainerClass.portrait} » absent de l’atlas trainers`);
    }
    if (!(Number.isInteger(trainerClass.moneyBase) && trainerClass.moneyBase > 0)) errors.push(`${label} : moneyBase invalide`);
    if (!data.musicIntros.includes(trainerClass.musicIntro)) errors.push(`${label} : musicIntro inconnue`);
  }
  return errors;
}
