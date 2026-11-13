// Maps: layers and legend, entities, warps, connections, encounters and inline scripts.
import { DIRECTIONS } from '../../src/overworld/directions.js';
import { buildMap } from '../../src/overworld/map-loader.js';
import { checkScript } from './scripts.js';

const MOVEMENTS = ['static', 'look', 'wander', 'path'];
const OPPOSITE_EDGE = { north: 'south', south: 'north', east: 'west', west: 'east' };
const ENCOUNTER_KINDS = ['grass', 'water', 'cave'];

function checkLayers(definition, label) {
  const errors = [];
  const { ground, collision } = definition.layers ?? {};
  if (!Array.isArray(ground) || ground.length === 0) return [`${label} : couche ground manquante`];
  const width = Array.from(ground[0]).length;
  ground.forEach((row, y) => {
    if (Array.from(row).length !== width) errors.push(`${label} : ligne ${y} de ground de largeur ${Array.from(row).length} au lieu de ${width}`);
  });
  if (definition.width !== undefined && definition.width !== width) errors.push(`${label} : width ${definition.width} ≠ ${width}`);
  if (definition.height !== undefined && definition.height !== ground.length) errors.push(`${label} : height ${definition.height} ≠ ${ground.length}`);
  if (collision) {
    if (collision.length !== ground.length) errors.push(`${label} : collision n’a pas la hauteur de ground`);
    collision.forEach((row, y) => {
      if (Array.from(row).length !== width) errors.push(`${label} : ligne ${y} de collision de mauvaise largeur`);
      if (/[^.#_]/.test(row)) errors.push(`${label} : ligne ${y} de collision : seuls « . # _ » sont permis`);
    });
  }
  return errors;
}

function buildOrError(definition, data, label) {
  if (!data.tilesets[definition.tileset]) return { error: `${label} : tileset inconnu « ${definition.tileset} »` };
  try {
    return { map: buildMap(definition, data.tilesets) };
  } catch (error) {
    return { error: `${label} : ${error.message}` };
  }
}

function checkTiles(map, label) {
  const errors = [];
  const unknown = new Set(map.tiles.filter((id) => !map.resolve(id)));
  for (const id of unknown) errors.push(`${label} : métatuile « ${id} » absente du tileset ${map.tileset}`);
  if (map.borderTile && !map.resolve(map.borderTile)) errors.push(`${label} : tuile de bordure inconnue`);
  if (!map.resolve(map.clearTile)) errors.push(`${label} : clearTile « ${map.clearTile} » inconnue`);
  return errors;
}

const isStandable = (map, x, y) => map.inBounds(x, y) && !map.metatileAt(x, y)?.solid && map.collisionAt(x, y) !== 1;

function checkEntities(map, data, label) {
  const errors = [];
  const at = (entity) => `(${entity.x},${entity.y})`;
  const inside = (entity, what) => {
    if (!map.inBounds(entity.x, entity.y)) errors.push(`${label} : ${what} ${at(entity)} hors de la carte`);
  };
  const actors = new Set();
  const scriptNames = new Set([...Object.keys(map.scripts ?? {}), ...Object.keys(data.scripts)]);
  const scope = (what) => ({ label: `${label} ${what}`, actors, scriptNames });

  for (const npc of [...(map.npcs ?? []), ...(map.trainers ?? [])]) {
    if (actors.has(npc.id)) errors.push(`${label} : acteur en double « ${npc.id} »`);
    actors.add(npc.id);
    inside(npc, `acteur ${npc.id}`);
    if (!data.atlas.characters.has(`${npc.sprite}/down/0`)) errors.push(`${label} : sprite « ${npc.sprite} » inconnu`);
    if (!DIRECTIONS.includes(npc.facing)) errors.push(`${label} : ${npc.id} orientation invalide`);
    if (npc.movement && !MOVEMENTS.includes(npc.movement)) errors.push(`${label} : ${npc.id} mouvement inconnu`);
    if (npc.movement === 'path' && !(npc.path?.length > 0 && npc.path.every((d) => DIRECTIONS.includes(d)))) {
      errors.push(`${label} : ${npc.id} chemin invalide`);
    }
    if (map.inBounds(npc.x, npc.y) && !isStandable(map, npc.x, npc.y)) errors.push(`${label} : ${npc.id} sur une tuile bloquante`);
  }
  for (const trainer of map.trainers ?? []) {
    if (!data.trainers.some((entry) => entry.id === trainer.trainer)) errors.push(`${label} : dresseur inconnu « ${trainer.trainer} »`);
    if (!(Number.isInteger(trainer.sight) && trainer.sight >= 1 && trainer.sight <= 5)) errors.push(`${label} : ${trainer.id} sight entre 1 et 5`);
  }
  for (const npc of map.npcs ?? []) {
    if (typeof npc.script === 'string') {
      if (!scriptNames.has(npc.script)) errors.push(`${label} : ${npc.id} script inconnu « ${npc.script} »`);
    } else {
      errors.push(...checkScript(npc.script, data, scope(`PNJ ${npc.id}`)));
    }
  }
  for (const [name, commands] of Object.entries(map.scripts ?? {})) errors.push(...checkScript(commands, data, scope(`script ${name}`)));

  if (map.flyPoint && !isStandable(map, map.flyPoint.x, map.flyPoint.y)) errors.push(`${label} : flyPoint bloquant ou hors de la carte`);
  for (const sign of map.signs ?? []) {
    inside(sign, 'panneau');
    if (data.texts[sign.text] === undefined) errors.push(`${label} : panneau ${at(sign)} texte inconnu « ${sign.text} »`);
  }
  const flags = new Set();
  for (const item of [...(map.items ?? []), ...(map.hiddenItems ?? [])]) {
    inside(item, 'objet');
    if (!data.items.some((entry) => entry.id === item.item)) errors.push(`${label} : objet inconnu « ${item.item} »`);
    if (!item.flag) errors.push(`${label} : objet ${at(item)} sans drapeau`);
    if (flags.has(item.flag)) errors.push(`${label} : drapeau d’objet en double « ${item.flag} »`);
    flags.add(item.flag);
  }
  for (const item of map.items ?? []) {
    if (map.inBounds(item.x, item.y) && !isStandable(map, item.x, item.y)) errors.push(`${label} : objet ${at(item)} sur une tuile bloquante`);
  }
  (map.triggers ?? []).forEach((trigger, index) => {
    const w = trigger.w ?? 1;
    const h = trigger.h ?? 1;
    if (!map.inBounds(trigger.x, trigger.y) || !map.inBounds(trigger.x + w - 1, trigger.y + h - 1)) errors.push(`${label} : déclencheur ${index} hors de la carte`);
    errors.push(...checkScript(trigger.script, data, scope(`déclencheur ${index}`)));
  });
  return errors;
}

function checkWarps(map, mapsById, label) {
  const errors = [];
  for (const warp of map.warps ?? []) {
    const where = `warp (${warp.x},${warp.y})`;
    if (!map.inBounds(warp.x, warp.y)) errors.push(`${label} : ${where} hors de la carte`);
    else if (!isStandable(map, warp.x, warp.y)) errors.push(`${label} : ${where} sur une tuile bloquante`);
    const target = mapsById.get(warp.to);
    if (!target) {
      errors.push(`${label} : ${where} vers une carte inconnue « ${warp.to} »`);
      continue;
    }
    if (!target.inBounds(warp.toX, warp.toY)) errors.push(`${label} : ${where} arrive hors de ${warp.to}`);
    else if (!isStandable(target, warp.toX, warp.toY)) errors.push(`${label} : ${where} arrive sur une tuile bloquante de ${warp.to}`);
  }
  return errors;
}

function checkConnections(map, mapsById, label) {
  const errors = [];
  for (const [edge, targetId] of Object.entries(map.connections ?? {})) {
    if (!targetId) continue;
    if (!OPPOSITE_EDGE[edge]) {
      errors.push(`${label} : bord de connexion inconnu « ${edge} »`);
      continue;
    }
    const target = mapsById.get(targetId);
    if (!target) {
      errors.push(`${label} : connexion ${edge} vers une carte inconnue « ${targetId} »`);
      continue;
    }
    if (target.connections?.[OPPOSITE_EDGE[edge]] !== map.id) errors.push(`${label} : connexion ${edge} vers ${targetId} non réciproque`);
    const vertical = edge === 'north' || edge === 'south';
    if (vertical && target.width !== map.width) errors.push(`${label} : ${targetId} doit avoir la même largeur (${map.width})`);
    if (!vertical && target.height !== map.height) errors.push(`${label} : ${targetId} doit avoir la même hauteur (${map.height})`);
  }
  return errors;
}

function checkEncounters(map, data, label) {
  const { encounters } = map;
  if (!encounters) return [];
  const errors = [];
  if (!(encounters.rate > 0 && encounters.rate <= 100)) errors.push(`${label} : rate de rencontre entre 1 et 100 (%)`);
  for (const [kind, table] of Object.entries(encounters)) {
    if (kind === 'rate') continue;
    if (!ENCOUNTER_KINDS.includes(kind)) {
      errors.push(`${label} : table de rencontre inconnue « ${kind} »`);
      continue;
    }
    for (const entry of table) {
      const creature = data.creatures.find((candidate) => candidate.id === entry.creature);
      const where = `${label} : rencontre ${kind} ${entry.creature}`;
      if (!creature) {
        errors.push(`${where} : bestiole inconnue`);
        continue;
      }
      if (!(entry.minLevel >= 1 && entry.maxLevel >= entry.minLevel && entry.maxLevel <= 100)) errors.push(`${where} : niveaux invalides`);
      if (entry.minLevel < creature.minLevel) errors.push(`${where} : niveau ${entry.minLevel} sous le minLevel ${creature.minLevel} de l’espèce`);
      if (!(entry.weight > 0)) errors.push(`${where} : poids positif requis`);
    }
  }
  return errors;
}

export function checkMaps(data) {
  const errors = [];
  const mapsById = new Map();
  for (const [key, definition] of Object.entries(data.maps)) {
    const label = `carte ${key}`;
    if (definition.id !== key) errors.push(`${label} : id « ${definition.id} » différent de la clé`);
    const layerErrors = checkLayers(definition, label);
    errors.push(...layerErrors);
    if (layerErrors.length > 0) continue;
    const { map, error } = buildOrError(definition, data, label);
    if (error) errors.push(error);
    else mapsById.set(key, map);
  }
  for (const [key, map] of mapsById) {
    const label = `carte ${key}`;
    errors.push(...checkTiles(map, label));
    errors.push(...checkEntities(map, data, label));
    errors.push(...checkWarps(map, mapsById, label));
    errors.push(...checkConnections(map, mapsById, label));
    errors.push(...checkEncounters(map, data, label));
  }
  return errors;
}

export function checkTrainers(data) {
  const errors = [];
  const seen = new Set();
  for (const trainer of data.trainers) {
    const label = `dresseur ${trainer.id}`;
    if (seen.has(trainer.id)) errors.push(`${label} : id en double`);
    seen.add(trainer.id);
    if (!data.trainerClasses.some((entry) => entry.id === trainer.class)) errors.push(`${label} : classe inconnue « ${trainer.class} »`);
    if (!(trainer.party?.length >= 1 && trainer.party.length <= 6)) errors.push(`${label} : équipe de 1 à 6 bestioles`);
    const parties = [trainer.party ?? [], ...Object.values(trainer.partyByStarter ?? {})];
    for (const member of parties.flat()) {
      if (!data.creatures.some((entry) => entry.id === member.creature)) errors.push(`${label} : bestiole inconnue « ${member.creature} »`);
      if (!(member.level >= 1 && member.level <= 100)) errors.push(`${label} : niveau invalide`);
      for (const move of member.moves ?? []) {
        if (!data.moves.some((entry) => entry.id === move)) errors.push(`${label} : attaque inconnue « ${move} »`);
      }
    }
    for (const field of ['intro', 'defeat', 'after', ...(trainer.lastText ? ['lastText'] : [])]) {
      if (data.texts[trainer[field]] === undefined) errors.push(`${label} : texte ${field} inconnu « ${trainer[field]} »`);
    }
  }
  errors.push(...checkTrainersReachable(data));
  return errors;
}

/** Trainer ids used by `battle` commands of a script, nested lists included. */
function battleTrainers(commands, found = new Set()) {
  if (!Array.isArray(commands)) return found;
  for (const command of commands) {
    if (command?.cmd === 'battle') found.add(command.trainer);
    for (const value of Object.values(command ?? {})) if (Array.isArray(value)) battleTrainers(value, found);
  }
  return found;
}

/** Every trainer must stand on a map or be fought from a script. */
function checkTrainersReachable(data) {
  const used = new Set();
  Object.values(data.scripts).forEach((commands) => battleTrainers(commands, used));
  for (const map of Object.values(data.maps)) {
    (map.trainers ?? []).forEach((entry) => used.add(entry.trainer));
    Object.values(map.scripts ?? {}).forEach((commands) => battleTrainers(commands, used));
    [...(map.npcs ?? []), ...(map.triggers ?? [])].forEach((entry) => battleTrainers(entry.script, used));
  }
  return data.trainers.filter((trainer) => !used.has(trainer.id)).map((trainer) => `dresseur ${trainer.id} : utilisé par aucune carte ni aucun script`);
}
