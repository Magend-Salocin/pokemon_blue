// Debug menu (F1, dev only): battles against any species or a random AI team, test party, heal.
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../engine/constants.js';
import { createRng } from '../engine/rng.js';
import { CREATURES } from '../data/creatures.js';
import { drawText } from '../gfx/font.js';
import { getColor } from '../gfx/palette.js';
import { createCreature } from '../battle/logic/creature.js';
import { hooks } from '../overworld/hooks.js';
import { addItem, getGameState, healParty } from '../state/game-state.js';
import { PromiseScene, moveCursor } from '../ui/menu-cursor.js';
import { drawWindowFrame } from '../ui/window-frame.js';

const ROWS = ['species', 'level', 'wild', 'trainer', 'party', 'heal', 'close'];
const TEST_PARTY = ['fenouvert', 'ondeclat', 'fournaise'];

export class DebugMenuScene extends PromiseScene {
  constructor(state = getGameState()) {
    super();
    this.state = state;
    this.index = 0;
    this.speciesIndex = 9;
    this.level = 10;
    this.message = '';
    this.rng = createRng(Date.now());
  }

  get species() {
    return CREATURES[this.speciesIndex];
  }

  update(dt, input) {
    this.index = moveCursor(this.index, ROWS.length, input);
    const row = ROWS[this.index];
    const delta = (input.repeat('right') ? 1 : 0) - (input.repeat('left') ? 1 : 0);
    if (row === 'species' && delta) this.speciesIndex = (this.speciesIndex + delta + CREATURES.length) % CREATURES.length;
    if (row === 'level' && delta) this.level = Math.max(1, Math.min(100, this.level + delta * (input.isDown('select') ? 10 : 1)));
    if (input.justPressed('b')) this.done(null);
    if (input.justPressed('a')) this.activate(row);
  }

  activate(row) {
    if (row === 'wild') {
      this.done(null);
      hooks.startWildBattle?.({ creature: this.species.id, level: this.level });
    } else if (row === 'trainer') {
      this.done(null);
      hooks.startBattle?.(this.randomTrainer(), { onLose: 'continue' });
    } else if (row === 'party') {
      this.state.party = TEST_PARTY.map((id) => createCreature(id, this.level, this.rng, { originalTrainer: this.state.player.name }));
      addItem(this.state, 'potion', 5);
      addItem(this.state, 'capsule', 10);
      addItem(this.state, 'antidote', 2);
      addItem(this.state, 'ranimant', 2);
      this.message = 'Équipe prête.';
    } else if (row === 'heal') {
      healParty(this.state);
      this.message = 'Équipe soignée.';
    } else if (row === 'close') {
      this.done(null);
    }
  }

  randomTrainer() {
    const regular = CREATURES.filter((creature) => creature.number < 146);
    return {
      id: 'debug_trainer',
      class: 'dresseur',
      name: 'Test',
      ai: 'smart',
      party: Array.from({ length: 3 }, () => ({ creature: this.rng.pick(regular).id, level: this.level })),
      intro: 'trainer_placeholder_after',
      defeat: 'trainer_placeholder_after',
      after: 'trainer_placeholder_after',
    };
  }

  render(ctx) {
    ctx.fillStyle = getColor(0);
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    drawWindowFrame(ctx, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    drawText(ctx, 'DEBUG', 8, 4);
    const labels = {
      species: `${String(this.species.number).padStart(3, '0')} ${this.species.name}`,
      level: `Niveau ${this.level}`,
      wild: 'Combat sauvage',
      trainer: 'Dresseur IA',
      party: 'Équipe de test',
      heal: 'Soigner',
      close: 'Fermer',
    };
    ROWS.forEach((row, index) => {
      const y = 20 + index * 13;
      if (index === this.index) drawText(ctx, '▶', 8, y);
      drawText(ctx, labels[row], 16, y);
    });
    drawText(ctx, this.message, 8, 120);
  }
}
