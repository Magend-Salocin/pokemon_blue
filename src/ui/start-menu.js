// Start menu (window on the right): BESTIAIRE (once obtained), BESTIOLES, SAC, {PLAYER},
// SAUVER, OPTIONS, FERMER. Hidden entries are not shown. `field` gives the map actions.
import { hasFlag } from '../state/game-state.js';
import { hooks } from '../overworld/hooks.js';
import { openBag } from './bag-menu.js';
import { openBestiary } from './bestiary-screen.js';
import { ListMenu } from './components/list-menu.js';
import { withMenuLayer } from './components/menu-layer.js';
import { ask, say } from './messages.js';
import { openOptions } from './options-screen.js';
import { openPartyMenu } from './party-menu.js';
import { openTrainerCard } from './trainer-card.js';

export const BESTIARY_FLAG = 'has_bestiary';

export function startMenuEntries(state) {
  const entries = [];
  if (hasFlag(state, BESTIARY_FLAG)) entries.push({ id: 'bestiary', label: 'BESTIAIRE' });
  if (state.party.length > 0) entries.push({ id: 'party', label: 'BESTIOLES' });
  entries.push({ id: 'bag', label: 'SAC' }, { id: 'card', label: state.player.name.toUpperCase() });
  entries.push({ id: 'save', label: 'SAUVER' }, { id: 'options', label: 'OPTIONS' }, { id: 'close', label: 'FERMER' });
  return entries;
}

/**
 * field: { save(), fly(), canFly(), escape(), canEscape() }.
 * Resolves with a map action to run after the menu closed (fly, escape), or null.
 */
export function openStartMenu(manager, state, field) {
  let index = 0;
  return withMenuLayer(manager, async (layer) => {
    for (;;) {
      const entries = startMenuEntries(state);
      const menu = new ListMenu(entries.map((entry) => ({ label: entry.label })), { x: 64, y: 0, width: 96, rows: entries.length, rowHeight: 14, index });
      const choice = await layer.open(menu);
      if (choice === null) return null;
      index = choice;
      const { id } = entries[choice];
      if (id === 'close') return null;
      if (id === 'bestiary') await openBestiary(manager, state);
      else if (id === 'card') await openTrainerCard(manager, state);
      else if (id === 'options') await openOptions(manager);
      else if (id === 'save') {
        if (await ask(manager, 'menu_save_ask')) {
          const saved = await field.save?.();
          if (saved) hooks.playSfx('save');
          await say(manager, saved ? 'menu_saved' : 'menu_save_failed');
        }
      } else {
        const result = id === 'party' ? await openPartyMenu(manager, state, field) : await openBag(manager, state, field);
        if (result?.action) return result.action;
      }
    }
  });
}
