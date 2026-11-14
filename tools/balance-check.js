// npm run balance [-- --runs 200 --seed 1 --only garance]
// Simulates each champion and rival battle against an "expected player" team (starter + 2 captures
// of the zones visited before, at the typical level) and prints the player's win rate.
// Targets: champions 55-75 %, rivals 60-80 %. Exit code 1 when a battle is out of its target.
import { CREATURES_BY_ID } from '../src/data/creatures.js';
import { TRAINERS_BY_ID, trainerParty } from '../src/data/trainers.js';
import { TRAINER_CLASSES_BY_ID } from '../src/data/trainer-classes.js';
import { chooseAction, chooseReplacement } from '../src/battle/logic/ai.js';
import { createCreature } from '../src/battle/logic/creature.js';
import { answerLearnMove, chooseSwitch, createBattle, currentPending, resolveTurn } from '../src/battle/logic/engine.js';
import { createRng } from '../src/engine/rng.js';

const STARTERS = ['fenouillot', 'braisille', 'flaquin'];
const MAX_TURNS = 200;
const TARGETS = { champion: [55, 75], rival: [60, 80] };

/**
 * Expected player team before each battle: starter level and the captures of the zones
 * already crossed ('espèce:niveau', evolved by level automatically).
 */
export const MATCHUPS = [
  { trainer: 'rival_1', starterLevel: 5, captures: [], playerAi: 'basic' },
  { trainer: 'garance', starterLevel: 12, captures: ['pivelin:10', 'morillon:10'] },
  { trainer: 'rival_2', starterLevel: 14, captures: ['pivelin:12', 'faonille:12'] },
  { trainer: 'mael', starterLevel: 20, captures: ['grivelin:18', 'faonille:17'] },
  { trainer: 'selene', starterLevel: 25, captures: ['fouisseron:23', 'lapugil:23'] },
  { trainer: 'aubin', starterLevel: 30, captures: ['fumelard:28', 'noctulard:28'] },
  { trainer: 'rival_3', starterLevel: 29, captures: ['fumelard:27', 'noctulard:27'] },
];

function parseArgs(argv) {
  const args = { runs: 200, seed: 1, only: null };
  for (let i = 0; i < argv.length; i += 2) args[argv[i].replace(/^--/, '')] = argv[i + 1];
  return { runs: Number(args.runs), seed: Number(args.seed), only: args.only };
}

/** Species reached by level-up evolutions at `level`. */
export function speciesAtLevel(speciesId, level) {
  let current = speciesId;
  for (;;) {
    const evolutions = [CREATURES_BY_ID[current].evolution ?? []].flat();
    const next = evolutions.find((evolution) => evolution.method === 'level' && evolution.value <= level);
    if (!next) return current;
    current = next.to;
  }
}

function playerTeam(matchup, starter, rng) {
  const specs = [`${starter}:${matchup.starterLevel}`, ...matchup.captures];
  return specs.map((spec) => {
    const [species, level] = spec.split(':');
    return createCreature(speciesAtLevel(species, Number(level)), Number(level), rng);
  });
}

/** One battle; returns true when the player wins. */
function simulate(trainer, starter, matchup, rng) {
  const enemyParty = trainerParty(trainer, starter).map((member) => createCreature(member.creature, member.level, rng, { moves: member.moves }));
  let state = createBattle({
    kind: 'trainer',
    playerParty: playerTeam(matchup, starter, rng),
    enemyParty,
    trainer: { id: trainer.id, class: trainer.class, name: trainer.name, moneyBase: 0, ai: trainer.ai },
  });
  while (!state.outcome && state.turn < MAX_TURNS) {
    const pending = currentPending(state);
    if (pending?.type === 'need_switch') state = chooseSwitch(state, chooseReplacement(state, 0)).state;
    else if (pending?.type === 'learn_move') state = answerLearnMove(state, null).state;
    else state = resolveTurn(state, chooseAction(state, 0, rng, matchup.playerAi ?? 'smart'), chooseAction(state, 1, rng), rng).state;
  }
  return state.outcome === 'win';
}

function category(trainer) {
  return trainer.class === 'rival' ? 'rival' : 'champion';
}

function run({ runs, seed, only }) {
  let failures = 0;
  for (const matchup of MATCHUPS) {
    if (only && matchup.trainer !== only) continue;
    const trainer = TRAINERS_BY_ID[matchup.trainer];
    if (!trainer) {
      console.log(`${matchup.trainer.padEnd(10)} absent de src/data/trainers.js`);
      continue;
    }
    const rng = createRng(seed);
    const rates = STARTERS.map((starter) => {
      let wins = 0;
      for (let i = 0; i < runs; i += 1) if (simulate(trainer, starter, matchup, rng)) wins += 1;
      return Math.round((wins * 100) / runs);
    });
    const average = Math.round(rates.reduce((sum, rate) => sum + rate, 0) / rates.length);
    const [low, high] = TARGETS[category(trainer)];
    const ok = average >= low && average <= high;
    if (!ok) failures += 1;
    const name = `${TRAINER_CLASSES_BY_ID[trainer.class]?.name ?? ''} ${trainer.name || 'Rivale'}`.trim();
    const detail = STARTERS.map((starter, index) => `${starter} ${String(rates[index]).padStart(3)} %`).join('  ');
    console.log(`${ok ? 'OK ' : 'KO '} ${matchup.trainer.padEnd(8)} ${name.padEnd(20)} ${String(average).padStart(3)} % (cible ${low}-${high})  ${detail}`);
  }
  return failures;
}

const failures = run(parseArgs(process.argv.slice(2)));
process.exitCode = failures > 0 ? 1 : 0;
