// Enemy AI. Levels: 'wild' (random move), 'basic' (prefers super effective moves, useful status
// moves), 'smart' (estimates damage, switches out of bad matchups, up to 2 potions under 25 % HP).
import { MOVES_BY_ID } from '../../data/moves.js';
import { getEffectiveness } from '../../data/types.js';
import { activeOf, opponentOf } from './battle-state.js';
import { computeDamage, typesOf } from './damage.js';
import { isStatusImmune } from './status.js';

export const SMART_CLASSES = ['champion', 'championne', 'gardien', 'gardienne', 'fondateur_opale'];
export const AI_POTION = 'grande_potion';
export const AI_POTION_LIMIT = 2;
const POTION_THRESHOLD = 0.25;
const AVERAGE_RANDOM = 0.925;

const STATUS_BY_EFFECT = { burn: 'brl', poison: 'psn', bad_poison: 'psn', paralyze: 'par', sleep: 'som', freeze: 'gel' };

/** AI level of a battle side: trainer.ai if set, else from the trainer class. */
export function aiLevel(state) {
  if (state.kind === 'wild') return 'wild';
  if (state.trainer?.ai) return state.trainer.ai;
  return SMART_CLASSES.includes(state.trainer?.class) ? 'smart' : 'basic';
}

function usableMoves(creature) {
  return creature.moves.map((slot, index) => ({ slot, index, move: MOVES_BY_ID[slot.id] })).filter(({ slot }) => slot.pp > 0);
}

/** Expected damage of a move (no critical, average random factor, times accuracy). */
export function expectedDamage(state, side, move) {
  const target = opponentOf(side);
  const attacker = activeOf(state, side);
  const defender = activeOf(state, target);
  const effectiveness = getEffectiveness(move.type, typesOf(defender));
  if (move.category === 'status' || effectiveness === 0) return 0;
  const accuracy = move.accuracy === null ? 1 : move.accuracy / 100;
  const fixed = {
    fixed_damage: () => move.effectParams.amount,
    level_damage: () => attacker.level,
    half_hp_damage: () => Math.floor(defender.hp / 2),
    ohko: () => (defender.level > attacker.level ? 0 : defender.hp),
    counter: () => 0,
  }[move.effect];
  if (fixed) return fixed() * accuracy;
  const { damage } = computeDamage(
    move,
    { creature: attacker, stages: state.sides[side].stages },
    { creature: defender, stages: state.sides[target].stages, screens: state.sides[target].screens },
    { random: AVERAGE_RANDOM },
  );
  const hits = move.effect === 'multi_hit' ? (move.effectParams.min + move.effectParams.max) / 2 : 1;
  const charging = move.effect === 'charge_turn' || move.effect === 'recharge' ? 0.6 : 1;
  return damage * hits * accuracy * charging;
}

/** Value of a status move in "HP of the target" units (0 = useless now). */
function statusMoveValue(state, side, move) {
  const self = state.sides[side];
  const target = state.sides[opponentOf(side)];
  const creature = activeOf(state, side);
  const defender = activeOf(state, opponentOf(side));
  const statusId = STATUS_BY_EFFECT[move.effect];
  if (statusId) return defender.status || isStatusImmune(defender, statusId) ? 0 : 0.3;
  switch (move.effect) {
    case 'confuse': return target.volatile.confusion > 0 ? 0 : 0.2;
    case 'leech': return target.volatile.leech || typesOf(defender).includes('flore') ? 0 : 0.25;
    case 'target_stat_down': return Object.entries(move.effectParams.stats).every(([stat]) => target.stages[stat] <= -2) ? 0 : 0.15;
    case 'self_stat_up': return Object.entries(move.effectParams.stats).every(([stat]) => self.stages[stat] >= 2) ? 0 : 0.2;
    case 'heal_half':
    case 'rest': {
      // Worth a part of the HP it restores, and only below half HP.
      if (creature.hp >= creature.stats.hp * 0.5) return 0;
      const restored = Math.min(creature.stats.hp - creature.hp, move.effect === 'rest' ? creature.stats.hp : creature.stats.hp / 2);
      return (restored * 0.5) / defender.stats.hp;
    }
    case 'screen': return self.screens[move.effectParams.category] > 0 ? 0 : 0.2;
    case 'crit_up': return self.volatile.critUp ? 0 : 0.1;
    case 'haze': return Object.values(target.stages).some((stage) => stage > 0) ? 0.2 : 0;
    case 'protect': return 0.05;
    default: return 0;
  }
}

function scoreMove(state, side, move, level, rng) {
  const defender = activeOf(state, opponentOf(side));
  const noise = 0.9 + rng.next() * 0.2;
  if (move.category === 'status') return statusMoveValue(state, side, move) * defender.stats.hp * noise;
  if (level === 'basic') {
    const effectiveness = getEffectiveness(move.type, typesOf(defender));
    if (effectiveness === 0) return 0;
    const stab = typesOf(activeOf(state, side)).includes(move.type) ? 1.5 : 1;
    const power = move.power === 0 ? 60 : move.power;
    const accuracy = move.accuracy === null ? 1 : move.accuracy / 100;
    // Scaled so a neutral 60-power move is worth about a third of the target's HP.
    return ((power * stab * effectiveness * accuracy) / 180) * defender.stats.hp * noise;
  }
  const damage = expectedDamage(state, side, move);
  const knockOut = damage >= defender.hp ? 1.5 : 1;
  return Math.min(damage, defender.hp) * knockOut * noise;
}

function bestMatchupIndex(state, side, candidates) {
  const opponent = activeOf(state, opponentOf(side));
  const threat = (creature) => Math.max(...typesOf(opponent).map((type) => getEffectiveness(type, typesOf(creature))));
  const offense = (creature) => Math.max(...creature.moves.map((slot) => {
    const move = MOVES_BY_ID[slot.id];
    return move.category === 'status' ? 0 : getEffectiveness(move.type, typesOf(opponent));
  }));
  return candidates
    .map((index) => ({ index, score: offense(state.sides[side].party[index]) - threat(state.sides[side].party[index]) }))
    .sort((a, b) => b.score - a.score)[0]?.index;
}

/** Next creature after a faint: best matchup for 'smart', otherwise the first one alive. */
export function chooseReplacement(state, side) {
  const candidates = state.sides[side].party.map((creature, index) => ({ creature, index }))
    .filter(({ creature }) => creature.hp > 0).map(({ index }) => index);
  if (candidates.length === 0) return state.sides[side].active;
  return aiLevel(state) === 'smart' ? bestMatchupIndex(state, side, candidates) : candidates[0];
}

function smartSpecialAction(state, side) {
  const creature = activeOf(state, side);
  if (state.kind === 'trainer' && state.sides[side].potionsUsed < AI_POTION_LIMIT && creature.hp < creature.stats.hp * POTION_THRESHOLD) {
    return { type: 'item', itemId: AI_POTION, target: state.sides[side].active };
  }
  const sideState = state.sides[side];
  if (sideState.volatile.trap || sideState.lastSwitchTurn === state.turn) return null;
  const opponent = activeOf(state, opponentOf(side));
  const threatened = typesOf(opponent).some((type) => getEffectiveness(type, typesOf(creature)) >= 2);
  const bestDamage = Math.max(0, ...usableMoves(creature).map(({ move }) => expectedDamage(state, side, move)));
  if (!threatened || bestDamage >= opponent.hp * 0.3) return null;
  const bench = sideState.party.map((member, index) => ({ member, index }))
    .filter(({ member, index }) => member.hp > 0 && index !== sideState.active)
    .filter(({ member }) => typesOf(opponent).every((type) => getEffectiveness(type, typesOf(member)) <= 1))
    .map(({ index }) => index);
  if (bench.length === 0) return null;
  return { type: 'switch', index: bestMatchupIndex(state, side, bench) };
}

/** Action for an AI-controlled side (forced actions are applied by the engine anyway). */
export function chooseAction(state, side, rng, level = aiLevel(state)) {
  const moves = usableMoves(activeOf(state, side));
  if (moves.length === 0) return { type: 'struggle' };
  if (level === 'wild') return { type: 'move', index: rng.pick(moves).index };
  if (level === 'smart') {
    const special = smartSpecialAction(state, side);
    if (special) return special;
  }
  const scored = moves.map(({ move, index }) => ({ index, score: scoreMove(state, side, move, level, rng) }));
  scored.sort((a, b) => b.score - a.score);
  return { type: 'move', index: scored[0].index };
}
