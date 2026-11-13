// New game introduction: Pr Morvan presents the world with a creature on screen, then asks
// boy or girl, the player's name and the rival's name (typed or one of 3 suggestions).
// Resolves with { player: { name, gender }, rival: { name } }.
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../engine/constants.js';
import { getText } from '../data/texts/index.js';
import { drawSprite } from '../gfx/draw.js';
import { getColor } from '../gfx/palette.js';
import { hooks } from '../overworld/hooks.js';
import { ListMenu } from './components/list-menu.js';
import { withMenuLayer } from './components/menu-layer.js';
import { showDialog } from './dialog-box.js';
import { PromiseScene } from './menu-cursor.js';
import { enterName } from './name-entry.js';

export const NAME_SUGGESTIONS = {
  boy: ['Elio', 'Malo', 'Basile'],
  girl: ['Elia', 'Lou', 'Maëlle'],
  rival: ['Nora', 'Iris', 'Jade'],
};
const NEW_NAME = 'NOUVEAU NOM';
const PORTRAIT = { x: 56, y: 24 };
const CREATURE = { x: 96, y: 40 };
const INTRO_CREATURE = 'pivelin';

export class IntroScene extends PromiseScene {
  constructor() {
    super();
    this.portrait = 'portrait/professeure';
    this.creature = null;
    this.context = {};
  }

  enter(manager) {
    super.enter(manager);
    hooks.playMusic('intro_professor');
    manager.fadeIn({ color: 'black' });
    this.run();
  }

  say(id) {
    return showDialog(this.manager, getText(id), { context: this.context });
  }

  choose(labels) {
    return withMenuLayer(this.manager, (layer) =>
      layer.open(new ListMenu(labels.map((label) => ({ label })), { x: 0, y: 0, width: 96, rows: labels.length, cancellable: false })));
  }

  async chooseName(title, suggestions) {
    const index = await this.choose([NEW_NAME, ...suggestions]);
    if (index > 0) return suggestions[index - 1];
    return enterName(this.manager, { title, defaultName: suggestions[0] });
  }

  async run() {
    await this.say('intro_welcome');
    this.creature = INTRO_CREATURE;
    hooks.playSfx(`cry_${INTRO_CREATURE}`);
    await this.say('intro_world');
    this.creature = null;
    await this.say('intro_ask_gender');
    const gender = (await this.choose(['GARÇON', 'FILLE'])) === 1 ? 'girl' : 'boy';
    this.portrait = gender === 'girl' ? 'back/joueuse' : 'back/joueur';
    await this.say('intro_ask_name');
    const playerName = await this.chooseName('Ton nom ?', NAME_SUGGESTIONS[gender]);
    this.context = { PLAYER: playerName };
    await this.say('intro_player_named');
    this.portrait = 'portrait/rival';
    await this.say('intro_rival');
    const rivalName = await this.chooseName('Son nom ?', NAME_SUGGESTIONS.rival);
    this.context = { PLAYER: playerName, RIVAL: rivalName };
    await this.say('intro_rival_named');
    this.portrait = 'portrait/professeure';
    await this.say('intro_farewell');
    await this.manager.fadeOut({ color: 'white', duration: 0.6 });
    this.done({ player: { name: playerName, gender }, rival: { name: rivalName } });
  }

  render(ctx) {
    ctx.fillStyle = getColor(0);
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    if (this.creature) {
      drawSprite(ctx, 'trainers', this.portrait, PORTRAIT.x - 32, PORTRAIT.y);
      drawSprite(ctx, 'creatures', `${this.creature}/front`, CREATURE.x, CREATURE.y);
    } else {
      drawSprite(ctx, 'trainers', this.portrait, PORTRAIT.x, PORTRAIT.y);
    }
  }
}

export function playIntro(manager) {
  return manager.push(new IntroScene()).promise;
}
