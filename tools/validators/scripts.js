// Event scripts: known commands, required fields and valid references.
import { BADGE_NAMES } from '../../src/data/field-abilities.js';
import { DIRECTIONS } from '../../src/overworld/directions.js';
import { MENUS, SCRIPT_COMMANDS } from '../../src/overworld/script-runner.js';

/**
 * Checks a list of commands. `scope` = { label, actors: Set|null, scriptNames: Set }.
 * actors null = global script (actor ids are not checked).
 */
export function checkScript(commands, data, scope) {
  const errors = [];
  if (!Array.isArray(commands)) return [`${scope.label} : le script doit être une liste de commandes`];
  commands.forEach((command, index) => {
    const label = `${scope.label} [${index}] ${command?.cmd}`;
    const schema = SCRIPT_COMMANDS[command?.cmd];
    if (!schema) {
      errors.push(`${label} : commande inconnue`);
      return;
    }
    for (const [field, rawKind] of Object.entries(schema)) {
      const optional = rawKind.endsWith('?');
      const kind = rawKind.replace('?', '');
      const value = command[field];
      if (value === undefined) {
        if (!optional) errors.push(`${label} : champ « ${field} » manquant`);
        continue;
      }
      const error = checkReference(kind, value, data, scope);
      if (error) errors.push(`${label} : ${field} ${error}`);
      if (kind === 'script') errors.push(...checkScript(value, data, { ...scope, label: `${label}.${field}` }));
    }
  });
  return errors;
}

function checkReference(kind, value, data, scope) {
  const has = (collection, id) => collection.some((entry) => entry.id === id);
  switch (kind) {
    case 'text': return data.texts[value] === undefined ? `texte inconnu « ${value} »` : null;
    case 'item': return has(data.items, value) ? null : `objet inconnu « ${value} »`;
    case 'creature': return has(data.creatures, value) ? null : `bestiole inconnue « ${value} »`;
    case 'trainer': return has(data.trainers, value) ? null : `dresseur inconnu « ${value} »`;
    case 'badge': return BADGE_NAMES[value] ? null : `badge inconnu « ${value} »`;
    case 'map': return data.maps[value] ? null : `carte inconnue « ${value} »`;
    case 'menu': return MENUS.includes(value) ? null : `menu inconnu « ${value} »`;
    case 'flag': return typeof value === 'string' && value.length > 0 ? null : 'drapeau invalide';
    case 'number': return typeof value === 'number' ? null : 'doit être un nombre';
    case 'direction': return DIRECTIONS.includes(value) || value === 'player' ? null : `direction inconnue « ${value} »`;
    case 'path': return Array.isArray(value) && value.every((d) => DIRECTIONS.includes(d)) ? null : 'chemin invalide';
    case 'actor':
      if (value === 'player' || scope.actors === null) return null;
      return scope.actors.has(value) ? null : `acteur inconnu « ${value} »`;
    case 'scriptName': return scope.scriptNames.has(value) ? null : `script inconnu « ${value} »`;
    case 'script': return Array.isArray(value) ? null : 'doit être une liste';
    default: return null;
  }
}

export function checkGlobalScripts(data) {
  const scriptNames = new Set(Object.keys(data.scripts));
  return Object.entries(data.scripts).flatMap(([name, commands]) =>
    checkScript(commands, data, { label: `script global ${name}`, actors: null, scriptNames }));
}
