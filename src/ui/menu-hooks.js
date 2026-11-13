// Connects the script command open_menu to the menus of this folder.
import { setHooks } from '../overworld/hooks.js';
import { getGameState } from '../state/game-state.js';
import { openBag } from './bag-menu.js';
import { openBestiary } from './bestiary-screen.js';
import { openPartyMenu } from './party-menu.js';
import { openDaycare } from './services.js';
import { openShop } from './shop-menu.js';
import { openStorage } from './storage-menu.js';
import { chooseStarter } from './starter-choice.js';

export function installMenuHooks(manager, getState = getGameState) {
  const menus = {
    shop: (params) => openShop(manager, getState(), params),
    storage: () => openStorage(manager, getState()),
    daycare: () => openDaycare(manager, getState()),
    party: () => openPartyMenu(manager, getState()),
    bag: () => openBag(manager, getState()),
    bestiary: () => openBestiary(manager, getState()),
  };
  setHooks({
    chooseStarter: () => chooseStarter(manager),
    openMenu: async (menu, params = {}) => {
      const open = menus[menu];
      if (!open) throw new Error(`Unknown menu: ${menu}`);
      return open(params);
    },
  });
}
