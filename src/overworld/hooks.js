// Hooks for systems built in later prompts (audio, battle, menus). The overworld calls them;
// later prompts replace them with setHooks({ ... }). Defaults are silent or provisional.

const defaults = {
  playSfx() {},
  playMusic() {},
  /** Trainer battle. Resolves 'win' or 'lose'. Default: provisional screen, see overworld-scene. */
  startBattle: null,
  /** Wild battle. Resolves 'win' | 'lose' | 'caught' | 'fled'. */
  startWildBattle: null,
  /** Menus (shop, storage, nickname…). Resolves with the menu result. */
  openMenu: async () => null,
  /** Name entry for the rival. Resolves with the chosen name. */
  nameRival: async () => null,
  /** Starter choice. Resolves with a creature id. */
  chooseStarter: async () => 'fenouillot',
  healParty() {},
};

export const hooks = { ...defaults };

export function setHooks(partial) {
  Object.assign(hooks, partial);
}

export function resetHooks() {
  Object.assign(hooks, defaults);
}
