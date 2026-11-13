// Story flags: every flag read by a script or a showIf/hideIf must be set somewhere
// (catches typos that would block the story forever).
import { STARTERS } from '../../src/data/trainers/helpers.js';

/** Calls visit(command) on every command of a script, nested lists included. */
function walk(commands, visit) {
  if (!Array.isArray(commands)) return;
  for (const command of commands) {
    visit(command);
    for (const value of Object.values(command ?? {})) if (Array.isArray(value)) walk(value, visit);
  }
}

function allScripts(data) {
  const scripts = Object.entries(data.scripts).map(([name, commands]) => ({ where: `script global ${name}`, commands }));
  for (const map of Object.values(data.maps)) {
    for (const [name, commands] of Object.entries(map.scripts ?? {})) scripts.push({ where: `carte ${map.id}, script ${name}`, commands });
    for (const entry of [...(map.npcs ?? []), ...(map.triggers ?? [])]) {
      if (Array.isArray(entry.script)) scripts.push({ where: `carte ${map.id}`, commands: entry.script });
    }
  }
  return scripts;
}

export function checkFlags(data) {
  const set = new Set(STARTERS.map((starter) => `starter_${starter}`));
  const read = [];
  for (const { where, commands } of allScripts(data)) {
    walk(commands, (command) => {
      if (command.cmd === 'set_flag' || (command.cmd === 'trade' && command.flag)) set.add(command.flag);
      if (command.cmd === 'if_flag') read.push({ flag: command.flag, where });
    });
  }
  for (const map of Object.values(data.maps)) {
    (map.trainers ?? []).forEach((entry) => set.add(`trainer_${entry.trainer}`));
    [...(map.items ?? []), ...(map.hiddenItems ?? [])].forEach((entry) => set.add(entry.flag));
    (map.triggers ?? []).forEach((entry, index) => set.add(entry.flag ?? `trigger_${map.id}_${index}`));
    for (const actor of [...(map.npcs ?? []), ...(map.trainers ?? [])]) {
      for (const field of ['showIf', 'hideIf']) if (actor[field]) read.push({ flag: actor[field], where: `carte ${map.id}, ${actor.id}.${field}` });
    }
  }
  return read.filter(({ flag }) => !set.has(flag)).map(({ flag, where }) => `${where} : drapeau « ${flag} » lu mais jamais posé`);
}
