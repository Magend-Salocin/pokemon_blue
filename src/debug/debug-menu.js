// Debug menu (F1, dev only): battles against any species or a random AI team, test party, heal,
// teleport to any game map, next badge with its field item, jukebox (tracks, sound effects, cries).
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../engine/constants.js';
import { createRng } from '../engine/rng.js';
import { CREATURES } from '../data/creatures.js';
import { MAPS } from '../data/maps/index.js';
import { drawText } from '../gfx/font.js';
import { getColor } from '../gfx/palette.js';
import { createCreature } from '../battle/logic/creature.js';
import { hooks } from '../overworld/hooks.js';
import { AtlasViewerScene } from './atlas-viewer-scene.js';
import { SFX } from '../audio/sfx.js';
import { TRACKS } from '../audio/tracks/index.js';
import { addBadge, addItem, getGameState, healParty, setFlag } from '../state/game-state.js';
import { PromiseScene, moveCursor } from '../ui/menu-cursor.js';
import { drawWindowFrame } from '../ui/window-frame.js';

const ROWS = ['species', 'level', 'wild', 'trainer', 'party', 'heal', 'map', 'badge', 'music', 'sfx', 'cry', 'atlas', 'close'];
const MAP_IDS = Object.keys(MAPS);
/** Badges in arena order, with the field item unlocked at that point of the story. */
const BADGE_STEPS = [
  { badge: 'roche' },
  { badge: 'eau', item: 'machette' },
  { badge: 'foudre', item: 'lanterne' },
  { badge: 'flore', item: 'grappin' },
];
const TRACK_IDS = Object.keys(TRACKS);
const SFX_IDS = SFX.map((effect) => effect.id);
const TEST_PARTY = ['fenouvert', 'ondeclat', 'fournaise'];

export class DebugMenuScene extends PromiseScene {
  /** warp(mapId): teleports the player (provided by the overworld). */
  constructor(state = getGameState(), { warp = null } = {}) {
    super();
    this.state = state;
    this.warp = warp;
    this.mapIndex = 0;
    this.index = 0;
    this.speciesIndex = 9;
    this.level = 10;
    this.trackIndex = 0;
    this.sfxIndex = 0;
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
    if (row === 'map' && delta && MAP_IDS.length) this.mapIndex = (this.mapIndex + delta + MAP_IDS.length) % MAP_IDS.length;
    if (row === 'music' && delta) this.trackIndex = (this.trackIndex + delta + TRACK_IDS.length) % TRACK_IDS.length;
    if (row === 'sfx' && delta) this.sfxIndex = (this.sfxIndex + delta + SFX_IDS.length) % SFX_IDS.length;
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
    } else if (row === 'map' && this.warp && MAP_IDS.length) {
      this.done(null);
      this.warp(MAP_IDS[this.mapIndex]);
    } else if (row === 'badge') {
      const next = BADGE_STEPS.find((step) => !this.state.badges.includes(step.badge));
      if (!next) return;
      addBadge(this.state, next.badge);
      setFlag(this.state, 'has_bestiary');
      if (next.item) addItem(this.state, next.item);
      this.message = `Badge ${next.badge}${next.item ? ` + ${next.item}` : ''}`;
    } else if (row === 'music') {
      hooks.playMusic(TRACK_IDS[this.trackIndex]);
    } else if (row === 'sfx') {
      hooks.playSfx(SFX_IDS[this.sfxIndex]);
    } else if (row === 'cry') {
      hooks.playSfx(`cry_${this.species.id}`);
    } else if (row === 'atlas') {
      this.manager.replace(new AtlasViewerScene());
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
      map: `Carte ${MAP_IDS[this.mapIndex] ?? '-'}`.slice(0, 18),
      badge: 'Badge suivant',
      music: `Piste ${TRACK_IDS[this.trackIndex]}`.slice(0, 18),
      sfx: `Effet ${SFX_IDS[this.sfxIndex]}`.slice(0, 18),
      cry: `Cri ${this.species.name}`,
      atlas: 'Atlas',
      close: 'Fermer',
    };
    ROWS.forEach((row, index) => {
      const y = 14 + index * 9;
      if (index === this.index) drawText(ctx, '▶', 8, y);
      drawText(ctx, labels[row], 16, y);
    });
    drawText(ctx, this.message.slice(0, 18), 8, 132);
  }
}
