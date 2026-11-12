// Bag outside battle: pockets Objets / Capsules / Objets clés (left/right), then
// UTILISER / JETER / ANNULER. `field` gives the actions that need the map: { escape(), fly() }.
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../engine/constants.js';
import { ITEMS_BY_ID } from '../data/items.js';
import { RUNNING_ITEM } from '../data/field-abilities.js';
import { drawText } from '../gfx/font.js';
import { getColor } from '../gfx/palette.js';
import { MOVES_BY_ID } from '../data/moves.js';
import { fieldItemProblem, fieldItemTarget, useItemOnCreature, useRepel } from '../state/field-items.js';
import { removeItem } from '../state/game-state.js';
import { ListMenu } from './components/list-menu.js';
import { QuantityWindow } from './components/small-windows.js';
import { creatureName } from './creature-widgets.js';
import { playEvolution } from './evolution-scene.js';
import { learnMoveOutsideBattle, sayBattle } from './learn-move.js';
import { ask, say } from './messages.js';
import { PromiseScene } from './menu-cursor.js';
import { chooseMoveSlot } from './move-list-screen.js';
import { choosePartyMember } from './party-screen.js';
import { wrapParagraph } from './text-layout.js';
import { drawWindowFrame } from './window-frame.js';

const POCKETS = [{ id: 'items', label: 'OBJETS' }, { id: 'capsules', label: 'CAPSULES' }, { id: 'key', label: 'OBJETS CLÉS' }];
const ACTIONS = ['UTILISER', 'JETER', 'ANNULER'];

export function bagPocket(bag, pocket) {
  return Object.entries(bag)
    .filter(([id, count]) => count > 0 && ITEMS_BY_ID[id]?.pocket === pocket)
    .map(([id, count]) => ({ id, count }));
}

export class BagScene extends PromiseScene {
  constructor(state, field = {}) {
    super();
    this.state = state;
    this.field = field;
    this.pocket = 0;
    this.list = this.buildList(0);
    this.sub = null;
    this.busy = false;
  }

  get entries() {
    return bagPocket(this.state.bag, POCKETS[this.pocket].id);
  }

  buildList(index) {
    const items = this.entries.map((entry) => ({
      label: ITEMS_BY_ID[entry.id].name,
      detail: POCKETS[this.pocket].id === 'key' ? null : `×${String(entry.count).padStart(2, ' ')}`,
    }));
    return new ListMenu(items, { x: 0, y: 8, width: 160, rows: 5, index });
  }

  refresh() {
    this.list = this.buildList(Math.min(this.list.index, Math.max(0, this.entries.length - 1)));
  }

  /** Shows a widget over the bag and resolves with its result. */
  runSub(widget) {
    return new Promise((resolve) => {
      this.sub = { widget, resolve };
    });
  }

  update(dt, input) {
    if (this.sub) {
      const result = this.sub.widget.update(dt, input);
      if (result) {
        const { resolve } = this.sub;
        this.sub = null;
        resolve(result.value);
      }
      return;
    }
    if (this.busy) return;
    if (input.repeat('left') || input.repeat('right')) {
      this.pocket = (this.pocket + (input.repeat('left') ? POCKETS.length - 1 : 1)) % POCKETS.length;
      this.list = this.buildList(0);
      return;
    }
    const result = this.list.update(dt, input);
    if (!result) return;
    if (result.value === null) this.done(null);
    else this.openActions();
  }

  async openActions() {
    this.busy = true;
    try {
      const choice = await this.runSub(new ListMenu(ACTIONS.map((label) => ({ label })), { x: 72, y: 64, width: 88, rows: 3, rowHeight: 12 }));
      const entry = this.entries[this.list.index];
      if (choice === 0) await this.use(entry.id);
      else if (choice === 1) await this.toss(entry);
    } finally {
      if (!this.closed) this.refresh();
      this.busy = false;
    }
  }

  async toss(entry) {
    const item = ITEMS_BY_ID[entry.id];
    if (item.pocket === 'key') {
      await say(this.manager, 'bag_cannot_toss');
      return;
    }
    const quantity = entry.count === 1 ? 1 : await this.runSub(new QuantityWindow({ max: entry.count, x: 64, y: 80 }));
    if (!quantity) return;
    const label = `${item.name} ×${quantity}`;
    if (!(await ask(this.manager, 'bag_toss_ask', { ITEM: label }))) return;
    removeItem(this.state, entry.id, quantity);
    await say(this.manager, 'bag_tossed', { ITEM: label });
  }

  async use(itemId) {
    const item = ITEMS_BY_ID[itemId];
    const { effect } = item.use;
    if (itemId === RUNNING_ITEM) return say(this.manager, 'bag_run_shoes');
    if (effect === 'field_ability') {
      if (item.use.params.ability === 'fly' && this.field.fly) return this.closeThen(() => this.field.fly());
      return say(this.manager, 'bag_use_on_obstacle');
    }
    if (effect === 'repel') {
      if (!useRepel(this.state, itemId)) return say(this.manager, 'bag_repel_active');
      return say(this.manager, 'bag_repel_used', { ITEM: item.name });
    }
    if (effect === 'escape') {
      if (!this.field.canEscape?.()) return say(this.manager, 'bag_escape_no');
      removeItem(this.state, itemId);
      return this.closeThen(() => this.field.escape());
    }
    if (fieldItemTarget(itemId) === 'none' || !['field', 'both'].includes(item.use.context)) return say(this.manager, 'bag_cannot_use');
    return this.useOnCreature(itemId);
  }

  /** Closes the bag (and the menus below, through the callback) then runs a map action. */
  closeThen(action) {
    this.done({ action });
  }

  async useOnCreature(itemId) {
    const target = await choosePartyMember(this.manager, this.state.party, {
      message: 'Sur qui ?',
      canSelect: (creature) => (fieldItemTarget(itemId) === 'move' || !fieldItemProblem(itemId, creature) ? null : 'Aucun effet.'),
    });
    if (target === null) return;
    let moveIndex;
    if (fieldItemTarget(itemId) === 'move') {
      moveIndex = await chooseMoveSlot(this.manager, this.state.party[target]);
      if (moveIndex === null) return;
      if (fieldItemProblem(itemId, this.state.party[target], moveIndex)) {
        await say(this.manager, 'bag_no_effect');
        return;
      }
    }
    const creature = this.state.party[target];
    const before = creature.hp;
    const result = useItemOnCreature(this.state, itemId, target, moveIndex);
    if (result.problem) {
      await say(this.manager, 'bag_no_effect');
      return;
    }
    const name = creatureName(creature);
    const effect = ITEMS_BY_ID[itemId].use.effect;
    if (effect === 'heal_hp') await say(this.manager, 'bag_healed', { CREATURE: name, NUMBER: creature.hp - before });
    else if (effect === 'revive') await say(this.manager, 'bag_revived', { CREATURE: name });
    else if (effect === 'cure_status') await say(this.manager, 'bag_cured', { CREATURE: name });
    else if (effect === 'restore_pp') await say(this.manager, 'bag_pp', { CREATURE: name });
    else if (effect === 'add_training') await say(this.manager, 'bag_training', { CREATURE: name });
    else if (effect === 'level_up') {
      await say(this.manager, 'bag_level', { CREATURE: name, NUMBER: creature.level });
      for (const event of result.events.filter((other) => other.type === 'move_learned')) {
        await sayBattle(this.manager, 'move_learned', { CREATURE: name, MOVE: MOVES_BY_ID[event.move].name });
      }
      for (const moveId of result.learnPrompts) await learnMoveOutsideBattle(this.manager, creature, moveId);
    }
    if (result.evolution) await playEvolution(this.manager, creature, result.evolution, { canCancel: false });
  }

  render(ctx) {
    ctx.fillStyle = getColor(0);
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    drawText(ctx, `« ${POCKETS[this.pocket].label} »`, 8, 0);
    this.list.render(ctx);
    if (this.list.items.length === 0) drawText(ctx, 'Vide.', 16, 16);
    drawWindowFrame(ctx, 0, 104, SCREEN_WIDTH, 40);
    const entry = this.entries[this.list.index];
    if (entry) drawText(ctx, wrapParagraph(ITEMS_BY_ID[entry.id].description).slice(0, 2).join('\n'), 8, 112);
    this.sub?.widget.render(ctx);
  }
}

/** Opens the bag. Resolves with { action } when a map action (fly, escape) must run, else null. */
export function openBag(manager, state, field) {
  return manager.push(new BagScene(state, field)).promise;
}

