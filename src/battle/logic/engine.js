// Battle engine (pure). Every call takes a state and returns a new state plus the ordered
// events to display. Contract of the events: docs/PROGRESS.md (prompt 05).
import { MOVES_BY_ID } from '../../data/moves.js';
import { chooseReplacement } from './ai.js';
import {
  ENEMY, PLAYER, activeOf, createBattleState, markParticipant, opponentOf, resetOnSwitch,
} from './battle-state.js';
import { attemptCapture } from './capture.js';
import {
  baseDamage, computeDamage, criticalChance, effectiveSpeed, effectiveStat, rollHit, rollRandomFactor,
} from './damage.js';
import { getEffectHandler } from './effects/index.js';
import {
  addTrainingYield, experienceYield, gainExperience, learnMove, pendingEvolution,
} from './experience.js';
import { applyItem, getBattleItem, itemProblem } from './items.js';
import { CONFUSION_POWER, applyConfusion, canAct, cureStatus, dealDamage, endOfTurnSide } from './status.js';

export const STRUGGLE_MOVE = 'baroud';
const ACTION_FIRST = 10;

export function createBattle(config) {
  return createBattleState(config);
}

/** Events that introduce the battle: both active creatures enter. */
export function battleStartEvents(state) {
  return [ENEMY, PLAYER].map((side) => switchInEvent(state, side));
}

function switchInEvent(state, side) {
  const { active } = state.sides[side];
  const creature = activeOf(state, side);
  return { type: 'switch_in', side, index: active, species: creature.species, level: creature.level, hp: creature.hp, maxHp: creature.stats.hp };
}

const aliveBench = (state, side) => state.sides[side].party
  .map((creature, index) => ({ creature, index }))
  .filter(({ creature, index }) => creature.hp > 0 && index !== state.sides[side].active)
  .map(({ index }) => index);

/** What a side may do this turn. `forced` is set when the side has no choice. */
export function getAvailableActions(state, side) {
  const { volatile } = state.sides[side];
  const creature = activeOf(state, side);
  const moves = creature.moves.map((slot, index) => ({ index, id: slot.id, pp: slot.pp, maxPp: slot.maxPp, usable: slot.pp > 0 }));
  let forced = null;
  if (volatile.recharging) forced = { type: 'recharge' };
  else if (volatile.charging) forced = { type: 'move', index: volatile.charging.moveIndex };
  else if (volatile.rampage) forced = { type: 'move', index: volatile.rampage.moveIndex };
  else if (!moves.some((move) => move.usable)) forced = { type: 'struggle' };
  const trapped = Boolean(volatile.trap);
  const switches = trapped ? [] : aliveBench(state, side);
  return {
    forced,
    moves,
    switches,
    canSwitch: switches.length > 0,
    canRun: side === PLAYER && state.kind === 'wild' && !trapped,
    canUseItems: side === PLAYER,
  };
}

function validateAction(state, side, action) {
  const available = getAvailableActions(state, side);
  if (available.forced) return available.forced;
  if (action.type === 'move' && !available.moves[action.index]?.usable) throw new Error(`Move ${action.index} is not usable`);
  if (action.type === 'switch' && !available.switches.includes(action.index)) throw new Error(`Cannot switch to ${action.index}`);
  if (action.type === 'run' && side !== PLAYER) throw new Error('Only the player can run');
  if (action.type === 'item' && side !== PLAYER && !state.trainer) throw new Error('Wild creatures cannot use items');
  return action;
}

function priorityOf(state, side, action) {
  if (action.type !== 'move') return ACTION_FIRST;
  return MOVES_BY_ID[activeOf(state, side).moves[action.index].id].priority;
}

/** Switches and items first, then move priority, then speed; ties are random. */
export function orderActions(state, entries, rng) {
  const speeds = entries.map(({ side }) => effectiveSpeed(activeOf(state, side), state.sides[side].stages));
  const ties = entries.map(() => rng.next());
  return entries
    .map((entry, i) => ({ ...entry, priority: priorityOf(state, entry.side, entry.action), speed: speeds[i], tie: ties[i] }))
    .sort((a, b) => b.priority - a.priority || (a.priority === ACTION_FIRST ? a.side - b.side : 0) || b.speed - a.speed || a.tie - b.tie);
}

/**
 * Resolves one turn. Actions: { type: 'move', index } | { type: 'switch', index } |
 * { type: 'item', itemId, target, moveIndex? } | { type: 'run' }. Forced actions (recharge,
 * two-turn moves, rampage, Lutte) replace the given ones. Returns { state, events }.
 */
export function resolveTurn(state, playerAction, enemyAction, rng) {
  if (state.outcome) throw new Error('The battle is over');
  if (state.pending.length > 0) throw new Error(`Pending decision: ${state.pending[0].type}`);
  const s = structuredClone(state);
  const events = [];
  s.turn += 1;
  for (const side of s.sides) {
    side.volatile.damageTaken = null;
    side.volatile.acted = false;
  }
  const entries = [
    { side: PLAYER, action: validateAction(s, PLAYER, playerAction) },
    { side: ENEMY, action: validateAction(s, ENEMY, enemyAction) },
  ];

  const run = entries.find((entry) => entry.action.type === 'run');
  if (run) {
    tryRun(s, rng, events);
    if (s.outcome) return { state: s, events };
  }

  for (const entry of orderActions(s, entries.filter((e) => e.action.type !== 'run'), rng)) {
    if (s.outcome) break;
    executeAction(s, entry.side, entry.action, rng, events);
    handleFaints(s, events);
  }
  if (!s.outcome) endOfTurn(s, events);
  if (!s.outcome) replaceFainted(s, rng, events);
  return { state: s, events };
}

function executeAction(s, side, action, rng, events) {
  if (action.type === 'switch') {
    switchIn(s, side, action.index, events);
    return;
  }
  if (action.type === 'item') {
    useItem(s, side, action, rng, events);
    return;
  }
  if (activeOf(s, side).hp <= 0) return;
  useMove(s, side, action, rng, events);
}

function switchIn(s, side, index, events) {
  const sideState = s.sides[side];
  if (activeOf(s, side).hp > 0) events.push({ type: 'switch_out', side, index: sideState.active });
  const leaving = activeOf(s, side);
  if (leaving.status?.badly) leaving.status.counter = 1;
  resetOnSwitch(sideState);
  sideState.active = index;
  sideState.lastSwitchTurn = s.turn;
  events.push(switchInEvent(s, side));
  markParticipant(s);
}

// ---- Moves ---------------------------------------------------------------

function confusionSelfHit(s, side, rng, events) {
  const creature = activeOf(s, side);
  const { stages } = s.sides[side];
  const attack = effectiveStat(creature, stages, 'atk');
  const defense = effectiveStat(creature, stages, 'def');
  const damage = Math.max(1, Math.floor(baseDamage(creature.level, CONFUSION_POWER, attack, defense) * rollRandomFactor(rng)));
  events.push({ type: 'confusion_hit', side });
  dealDamage(s, side, damage, events, 'confusion');
}

const rollChance = (chance, rng) => chance === null || rng.next() * 100 < chance;

function standardHit(s, side, target, move, rng) {
  const critical = rng.next() < criticalChance(move, s.sides[side].volatile.critUp);
  const random = rollRandomFactor(rng);
  return computeDamage(
    move,
    { creature: activeOf(s, side), stages: s.sides[side].stages },
    { creature: activeOf(s, target), stages: s.sides[target].stages, screens: s.sides[target].screens },
    { critical, random },
  );
}

function resolveMoveChoice(s, side, action) {
  const { volatile } = s.sides[side];
  if (action.type === 'struggle') return { move: MOVES_BY_ID[STRUGGLE_MOVE], moveIndex: -1, continuing: false };
  if (volatile.charging) return { move: MOVES_BY_ID[activeOf(s, side).moves[volatile.charging.moveIndex].id], moveIndex: volatile.charging.moveIndex, continuing: true };
  if (volatile.rampage) return { move: MOVES_BY_ID[activeOf(s, side).moves[volatile.rampage.moveIndex].id], moveIndex: volatile.rampage.moveIndex, continuing: true };
  return { move: MOVES_BY_ID[activeOf(s, side).moves[action.index].id], moveIndex: action.index, continuing: false };
}

function useMove(s, side, action, rng, events) {
  const target = opponentOf(side);
  const { volatile } = s.sides[side];
  volatile.acted = true;
  const rampageActive = Boolean(volatile.rampage);
  const choice = action.type === 'recharge' || volatile.recharging ? null : resolveMoveChoice(s, side, action);

  if (!canAct(s, side, rng, events, () => confusionSelfHit(s, side, rng, events))) {
    volatile.charging = null;
    volatile.rampage = null;
    return;
  }
  if (!choice) return;
  const { move, moveIndex, continuing } = choice;
  const creature = activeOf(s, side);
  if (!continuing && moveIndex >= 0) creature.moves[moveIndex].pp = Math.max(0, creature.moves[moveIndex].pp - 1);
  if (move.effect !== 'protect') volatile.protectChain = 0;
  events.push({ type: 'move_used', side, move: move.id });

  const handler = getEffectHandler(move.effect);
  if (handler.charge && !volatile.charging) {
    volatile.charging = { moveIndex, semiInvulnerable: move.effectParams?.semiInvulnerable ?? null };
    events.push({ type: 'charging', side, move: move.id, semiInvulnerable: volatile.charging.semiInvulnerable });
    return;
  }
  volatile.charging = null;

  performMove(s, side, target, move, moveIndex, handler, rng, events);

  if (rampageActive && volatile.rampage) {
    volatile.rampage.turns -= 1;
    if (volatile.rampage.turns <= 0) {
      volatile.rampage = null;
      if (activeOf(s, side).hp > 0) applyConfusion(s, side, rng, events);
    }
  }
}

function performMove(s, side, target, move, moveIndex, handler, rng, events) {
  const ctx = {
    state: s, rng, events, side, target, move, moveIndex, totalDamage: 0,
    standardHit: () => standardHit(s, side, target, move, rng),
  };
  const fail = (reason) => events.push({ type: 'move_failed', side, move: move.id, reason });
  const selfTargeted = move.category === 'status' && handler.affects === 'self';

  const reason = handler.check?.(ctx);
  if (reason) {
    fail(reason);
    return;
  }
  if (!selfTargeted) {
    const defender = s.sides[target];
    if (activeOf(s, target).hp <= 0) {
      fail('no_target');
      return;
    }
    if (defender.volatile.protect) {
      events.push({ type: 'protected', side: target });
      return;
    }
    const hidden = Boolean(defender.volatile.charging?.semiInvulnerable);
    if (hidden || !rollHit(move, s.sides[side].stages, defender.stages, rng)) {
      events.push({ type: 'miss', side, move: move.id });
      handler.onMiss?.(ctx);
      return;
    }
  }

  if (move.category === 'status') {
    const applied = rollChance(move.effectChance, rng) && handler.apply?.(ctx);
    if (!applied) fail('no_effect');
    return;
  }

  const hits = handler.hits ? handler.hits(ctx) : [ctx.standardHit()];
  if (hits[0].effectiveness === 0) {
    events.push({ type: 'effectiveness', side: target, value: 0 });
    return;
  }
  let count = 0;
  for (const hit of hits) {
    if (activeOf(s, target).hp <= 0) break;
    const removed = dealDamage(s, target, hit.damage, events, 'move', { move: move.id });
    if (hit.critical) events.push({ type: 'critical', side: target });
    ctx.totalDamage += removed;
    count += 1;
    const defenderVolatile = s.sides[target].volatile;
    defenderVolatile.damageTaken = { amount: (defenderVolatile.damageTaken?.amount ?? 0) + removed, category: move.category };
  }
  if (count > 1) events.push({ type: 'hits', count });
  if (!hits[0].fixed && hits[0].effectiveness !== 1) events.push({ type: 'effectiveness', side: target, value: hits[0].effectiveness });
  if (hits[0].ohko) events.push({ type: 'ohko', side: target });
  const defender = activeOf(s, target);
  if (move.type === 'feu' && defender.status?.id === 'gel') cureStatus(defender, target, events, 'thaw');

  if (handler.apply) {
    const targetAlive = defender.hp > 0;
    if ((handler.affects === 'self' || targetAlive) && rollChance(move.effectChance, rng)) handler.apply(ctx);
  }
  handler.after?.(ctx);
}

// ---- Items, capture, running ----------------------------------------------

function useItem(s, side, action, rng, events) {
  const item = getBattleItem(action.itemId);
  if (!item) {
    events.push({ type: 'item_failed', side, item: action.itemId, reason: 'unusable' });
    return;
  }
  if (item.use.effect === 'catch') {
    throwCapsule(s, item, rng, events);
    return;
  }
  const party = s.sides[side].party;
  const creature = party[action.target];
  const problem = itemProblem(item, creature, action.moveIndex);
  if (problem) {
    events.push({ type: 'item_failed', side, item: item.id, target: action.target, reason: problem });
    return;
  }
  s.sides[side].potionsUsed += 1;
  events.push({ type: 'item_used', side, item: item.id, target: action.target });
  events.push(...applyItem(item, creature, side, action.target, action.moveIndex));
}

function throwCapsule(s, item, rng, events) {
  if (s.kind === 'trainer') {
    events.push({ type: 'capture_blocked', item: item.id });
    return;
  }
  events.push({ type: 'item_used', side: PLAYER, item: item.id, target: null });
  const wild = activeOf(s, ENEMY);
  const { caught, shakes } = attemptCapture(wild, item.use.params, rng);
  for (let count = 1; count <= shakes; count += 1) events.push({ type: 'capture_shake', count });
  if (!caught) {
    events.push({ type: 'capture_fail', shakes });
    return;
  }
  wild.caughtIn = item.id;
  events.push({ type: 'capture_success', species: wild.species, index: s.sides[ENEMY].active });
  finish(s, 'caught', events);
}

/** Wild only: odds = floor(speed × 128 / wild speed) + 30 × previous attempts, out of 256. */
function tryRun(s, rng, events) {
  if (s.kind === 'trainer') {
    events.push({ type: 'run_blocked', reason: 'trainer' });
    return;
  }
  if (s.sides[PLAYER].volatile.trap) {
    events.push({ type: 'run_blocked', reason: 'trapped' });
    return;
  }
  const playerSpeed = effectiveSpeed(activeOf(s, PLAYER), s.sides[PLAYER].stages);
  const enemySpeed = effectiveSpeed(activeOf(s, ENEMY), s.sides[ENEMY].stages);
  const odds = Math.floor((playerSpeed * 128) / Math.max(1, enemySpeed)) + 30 * s.runAttempts;
  s.runAttempts += 1;
  if (odds > 255 || rng.int(0, 255) < odds) {
    events.push({ type: 'run_success' });
    finish(s, 'fled', events);
  } else {
    events.push({ type: 'run_fail' });
  }
}

// ---- Faints, experience, end of turn ---------------------------------------

function handleFaints(s, events) {
  for (const side of [ENEMY, PLAYER]) {
    const sideState = s.sides[side];
    const creature = activeOf(s, side);
    if (creature.hp > 0 || sideState.volatile.fainted) continue;
    sideState.volatile.fainted = true;
    creature.status = null;
    events.push({ type: 'faint', side, index: sideState.active, species: creature.species });
    if (side === ENEMY) distributeExperience(s, creature, sideState.active, events);
  }
  if (s.outcome) return;
  const allFainted = (side) => s.sides[side].party.every((creature) => creature.hp <= 0);
  if (allFainted(PLAYER)) finish(s, 'lose', events);
  else if (allFainted(ENEMY)) finish(s, 'win', events);
}

function distributeExperience(s, defeated, enemyIndex, events) {
  const party = s.sides[PLAYER].party;
  const winners = s.participants[enemyIndex].filter((index) => party[index].hp > 0);
  const amount = experienceYield(defeated, winners.length, s.kind === 'trainer');
  for (const index of winners) {
    const creature = party[index];
    addTrainingYield(creature, defeated);
    const result = gainExperience(creature, amount, index);
    events.push(...result.events);
    if (result.levels > 0 && !s.leveledUp.includes(index)) s.leveledUp.push(index);
    for (const prompt of result.prompts) {
      events.push({ type: 'learn_move_prompt', side: PLAYER, index: prompt.index, move: prompt.move });
      s.pending.push({ type: 'learn_move', index: prompt.index, move: prompt.move });
    }
  }
}

function finish(s, outcome, events) {
  s.outcome = outcome;
  if (outcome === 'win' && s.trainer) {
    const maxLevel = Math.max(...s.sides[ENEMY].party.map((creature) => creature.level));
    events.push({ type: 'money_gain', amount: maxLevel * (s.trainer.moneyBase ?? 0) });
  }
  if (outcome !== 'lose') {
    for (const index of s.leveledUp) {
      const creature = s.sides[PLAYER].party[index];
      const target = creature.hp > 0 ? pendingEvolution(creature) : null;
      if (target) events.push({ type: 'evolution_pending', side: PLAYER, index, species: creature.species, target });
    }
  }
  s.pending = s.pending.filter((entry) => entry.type === 'learn_move');
  events.push({ type: 'battle_end', outcome });
}

/** Fixed order: player side, then enemy side; then screens count down. */
function endOfTurn(s, events) {
  for (const side of [PLAYER, ENEMY]) {
    endOfTurnSide(s, side, events);
    handleFaints(s, events);
    if (s.outcome) return;
  }
  s.sides.forEach((sideState, side) => {
    sideState.volatile.flinch = false;
    sideState.volatile.protect = false;
    for (const category of ['physical', 'special']) {
      if (sideState.screens[category] <= 0) continue;
      sideState.screens[category] -= 1;
      if (sideState.screens[category] === 0) events.push({ type: 'screen_down', side, category });
    }
  });
}

function replaceFainted(s, rng, events) {
  if (activeOf(s, ENEMY).hp <= 0) {
    const index = chooseReplacement(s, ENEMY);
    switchIn(s, ENEMY, index, events);
  }
  if (activeOf(s, PLAYER).hp <= 0) {
    s.pending.push({ type: 'need_switch', side: PLAYER });
    events.push({ type: 'need_switch', side: PLAYER });
  }
}

// ---- Player decisions -------------------------------------------------------

export const currentPending = (state) => state.pending[0] ?? null;

/** Answers a learn_move prompt: slot 0-3 replaces that move, null keeps the current moves. */
export function answerLearnMove(state, slot) {
  const pending = currentPending(state);
  if (pending?.type !== 'learn_move') throw new Error('No move to learn');
  const s = structuredClone(state);
  s.pending.shift();
  const creature = s.sides[PLAYER].party[pending.index];
  return { state: s, events: [learnMove(creature, pending.index, pending.move, slot)] };
}

/** Sends a new creature after the active one fainted. */
export function chooseSwitch(state, index) {
  const pending = currentPending(state);
  if (pending?.type !== 'need_switch') throw new Error('No switch needed');
  if (!aliveBench(state, PLAYER).includes(index)) throw new Error(`Cannot switch to ${index}`);
  const s = structuredClone(state);
  s.pending.shift();
  const events = [];
  switchIn(s, PLAYER, index, events);
  return { state: s, events };
}
