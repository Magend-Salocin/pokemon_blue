// Party from the Start menu: RÉSUMÉ, ORDRE (swap two positions), CERF-VOLANT (when usable),
// ANNULER. Resolves with { action } when a map action (flying) must run after closing.
import { ListMenu } from './components/list-menu.js';
import { moveCursor } from './menu-cursor.js';
import { PartyScreen } from './party-screen.js';
import { showSummary } from './summary-screen.js';

export class PartyMenuScene extends PartyScreen {
  /** field: { canFly(), fly() } */
  constructor(state, field = {}) {
    super(state.party, { message: 'Quelle bestiole ?' });
    this.state = state;
    this.field = field;
    this.sub = null;
    this.busy = false;
  }

  update(dt, input) {
    this.time += dt;
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
    if (this.swapFrom !== null) {
      this.updateSwap(input);
      return;
    }
    super.update(dt, input);
  }

  /** Called by PartyScreen when A selects a creature. */
  done(index) {
    if (index === null) {
      super.done(null);
      return;
    }
    this.openActions(index);
  }

  runSub(widget) {
    return new Promise((resolve) => {
      this.sub = { widget, resolve };
    });
  }

  async openActions(index) {
    this.busy = true;
    const actions = ['RÉSUMÉ', 'ORDRE'];
    if (this.field.canFly?.()) actions.push('CERF-VOLANT');
    actions.push('ANNULER');
    const choice = await this.runSub(new ListMenu(actions.map((label) => ({ label })), { x: 48, y: 56, width: 112, rows: actions.length, rowHeight: 12 }));
    const action = actions[choice];
    if (action === 'RÉSUMÉ') await showSummary(this.manager, this.party, index);
    else if (action === 'ORDRE') {
      this.swapFrom = index;
      this.message = 'Échanger avec ?';
    } else if (action === 'CERF-VOLANT') {
      super.done({ action: () => this.field.fly() });
    }
    this.busy = false;
  }

  updateSwap(input) {
    this.index = moveCursor(this.index, this.party.length, input);
    if (input.justPressed('a')) {
      const party = this.party;
      [party[this.swapFrom], party[this.index]] = [party[this.index], party[this.swapFrom]];
      this.endSwap();
    } else if (input.justPressed('b')) {
      this.endSwap();
    }
  }

  render(ctx) {
    super.render(ctx);
    this.sub?.widget.render(ctx);
  }

  endSwap() {
    this.swapFrom = null;
    this.message = 'Quelle bestiole ?';
  }
}

export function openPartyMenu(manager, state, field) {
  return manager.push(new PartyMenuScene(state, field)).promise;
}
