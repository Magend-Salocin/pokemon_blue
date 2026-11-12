// npm run simulate -- [--seed 42] [--player sylvenard:40,crabastion:38] [--enemy pyrogrue:40,quartzard:38]
//                     [--ai smart|basic|wild] [--player-ai smart|basic|wild] [--kind trainer|wild]
// Two AI teams fight; the log is readable and reproducible for a given seed (balancing tool).
import { CREATURES_BY_ID } from '../src/data/creatures.js';
import { ITEMS_BY_ID } from '../src/data/items.js';
import { MOVES_BY_ID } from '../src/data/moves.js';
import { chooseAction } from '../src/battle/logic/ai.js';
import { createCreature } from '../src/battle/logic/creature.js';
import {
  answerLearnMove, battleStartEvents, chooseSwitch, createBattle, currentPending, resolveTurn,
} from '../src/battle/logic/engine.js';
import { createRng } from '../src/engine/rng.js';

const MAX_TURNS = 200;
const STATUS_NAMES = { brl: 'brûlure', psn: 'poison', par: 'paralysie', som: 'sommeil', gel: 'gel' };
const PREVENTED = { asleep: 'dort', frozen: 'est gelé', paralyzed: 'est paralysé', flinch: 'a peur', recharging: 'se repose' };
const STAT_NAMES = { atk: 'Attaque', def: 'Défense', spa: 'Att. Spé.', spd: 'Déf. Spé.', spe: 'Vitesse', acc: 'Précision', eva: 'Esquive' };

function parseArgs(argv) {
  const args = { seed: 42, player: 'sylvenard:40,crabastion:38,ampoulard:36', enemy: 'pyrogrue:40,quartzard:38,chafourbe:38', ai: 'smart', 'player-ai': 'smart', kind: 'trainer' };
  for (let i = 0; i < argv.length; i += 2) args[argv[i].replace(/^--/, '')] = argv[i + 1];
  args.seed = Number(args.seed);
  return args;
}

function buildTeam(spec, rng) {
  return spec.split(',').map((entry) => {
    const [species, level] = entry.split(':');
    if (!CREATURES_BY_ID[species]) throw new Error(`Unknown species: ${species}`);
    return createCreature(species, Number(level ?? 30), rng);
  });
}

function describe(state, event) {
  const sideName = (side) => (side === 0 ? 'Joueur' : 'Ennemi');
  const creatureOf = (side, index = state.sides[side].active) => state.sides[side].party[index];
  const name = (side, index) => `${CREATURES_BY_ID[creatureOf(side, index).species].name} (${sideName(side)})`;
  switch (event.type) {
    case 'switch_in': return `${sideName(event.side)} envoie ${CREATURES_BY_ID[event.species].name} Nv ${event.level} (${event.hp}/${event.maxHp} PV)`;
    case 'switch_out': return `${name(event.side, event.index)} revient`;
    case 'move_used': return `${name(event.side)} utilise ${MOVES_BY_ID[event.move].name}`;
    case 'move_failed': return `  mais ça échoue (${event.reason})`;
    case 'charging': return `  ${name(event.side)} se prépare`;
    case 'miss': return '  mais rate sa cible';
    case 'protected': return `  ${name(event.side)} se protège`;
    case 'damage': return `  ${name(event.side)} perd ${event.amount} PV (${event.hp}/${event.maxHp})${event.source !== 'move' ? ` [${event.source}]` : ''}`;
    case 'heal': return `  ${name(event.side, event.index)} récupère ${event.amount} PV (${event.hp}/${event.maxHp})`;
    case 'critical': return '  Coup critique !';
    case 'effectiveness': return event.value === 0 ? '  Aucun effet.' : event.value > 1 ? '  C’est super efficace !' : '  Ce n’est pas très efficace.';
    case 'hits': return `  Touché ${event.count} fois`;
    case 'ohko': return '  K.O. en un coup !';
    case 'status_applied': return `  ${name(event.side)} subit : ${STATUS_NAMES[event.status]}${event.badly ? ' grave' : ''}`;
    case 'status_cured': return `  ${name(event.side, event.index)} n’a plus : ${STATUS_NAMES[event.status]}`;
    case 'status_prevented': return `${name(event.side)} ${PREVENTED[event.reason]}`;
    case 'status_damage': return `  ${name(event.side)} souffre de ${STATUS_NAMES[event.status]} : −${event.amount} (${event.hp}/${event.maxHp})`;
    case 'confused': return `${name(event.side)} est confus`;
    case 'confusion_hit': return '  Il se blesse dans sa confusion';
    case 'volatile_applied': return `  ${name(event.side)} : ${event.volatile}`;
    case 'volatile_ended': return `  ${name(event.side)} : fin de ${event.volatile}`;
    case 'stat_change': return event.blocked ? `  ${STAT_NAMES[event.stat]} de ${name(event.side)} ne bouge plus` : `  ${STAT_NAMES[event.stat]} de ${name(event.side)} ${event.delta > 0 ? '+' : ''}${event.delta}`;
    case 'stats_reset': return '  Les stats sont réinitialisées';
    case 'screen_up': return `  Écran ${event.category} pour ${sideName(event.side)}`;
    case 'screen_down': return `Fin de l’écran ${event.category} de ${sideName(event.side)}`;
    case 'faint': return `${CREATURES_BY_ID[event.species].name} (${sideName(event.side)}) est K.O.`;
    case 'item_used': return `${sideName(event.side)} utilise ${ITEMS_BY_ID[event.item].name}`;
    case 'item_failed': return `  ${ITEMS_BY_ID[event.item]?.name ?? event.item} sans effet (${event.reason})`;
    case 'exp_gain': return `  ${name(0, event.index)} gagne ${event.amount} XP`;
    case 'level_up': return `  ${name(0, event.index)} passe au niveau ${event.level}`;
    case 'move_learned': return `  ${name(0, event.index)} apprend ${MOVES_BY_ID[event.move].name}`;
    case 'learn_move_prompt': return `  ${name(0, event.index)} veut apprendre ${MOVES_BY_ID[event.move].name}`;
    case 'move_not_learned': return `  ${MOVES_BY_ID[event.move].name} n’est pas apprise`;
    case 'evolution_pending': return `  ${name(0, event.index)} va évoluer en ${CREATURES_BY_ID[event.target].name}`;
    case 'need_switch': return 'Le joueur doit envoyer une autre bestiole';
    case 'money_gain': return `Le joueur gagne ${event.amount} pièces`;
    case 'battle_end': return `Fin du combat : ${event.outcome}`;
    default: return `  (${event.type})`;
  }
}

function play(args) {
  const rng = createRng(args.seed);
  let state = createBattle({
    kind: args.kind,
    playerParty: buildTeam(args.player, rng),
    enemyParty: buildTeam(args.enemy, rng),
    trainer: args.kind === 'trainer' ? { id: 'simulation', class: 'dresseur', name: 'Simulation', moneyBase: 40, ai: args.ai } : null,
  });
  const log = (events, before) => events.forEach((event) => console.log(describe(event.type === 'faint' || event.type === 'switch_out' ? before : state, event)));
  log(battleStartEvents(state), state);

  while (!state.outcome && state.turn < MAX_TURNS) {
    const pending = currentPending(state);
    const before = state;
    let result;
    if (pending?.type === 'need_switch') {
      const next = state.sides[0].party.findIndex((creature) => creature.hp > 0);
      result = chooseSwitch(state, next);
    } else if (pending?.type === 'learn_move') {
      result = answerLearnMove(state, null);
    } else {
      console.log(`\n— Tour ${state.turn + 1} —`);
      result = resolveTurn(state, chooseAction(state, 0, rng, args['player-ai']), chooseAction(state, 1, rng, args.ai), rng);
    }
    state = result.state;
    log(result.events, before);
  }
  while (currentPending(state)?.type === 'learn_move') state = answerLearnMove(state, null).state;
  console.log(`\nRésultat : ${state.outcome ?? 'interrompu'} en ${state.turn} tours (seed ${args.seed})`);
}

play(parseArgs(process.argv.slice(2)));
