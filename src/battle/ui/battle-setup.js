// Connects the real battle to the overworld hooks: builds the enemy party, plays the entry
// transition, runs the battle scene, then the evolutions, and returns the result.
import { createRng } from '../../engine/rng.js';
import { TRAINER_CLASSES_BY_ID } from '../../data/trainer-classes.js';
import { trainerParty } from '../../data/trainers.js';
import { BattleTransitionScene } from '../../overworld/battle-stub.js';
import { setHooks } from '../../overworld/hooks.js';
import { getGameState, healParty, isPartyAlive } from '../../state/game-state.js';
import { playEvolution } from '../../ui/evolution-scene.js';
import { createCreature } from '../logic/creature.js';
import { BattleScene } from './battle-scene.js';

/** Battle options for a trainer of src/data/trainers.js. */
export function trainerBattleConfig(trainer, state = getGameState()) {
  const trainerClass = TRAINER_CLASSES_BY_ID[trainer.class];
  return {
    id: trainer.id,
    class: trainer.class,
    className: trainerClass?.name ?? '',
    name: trainer.class === 'rival' ? state.rival.name : trainer.name,
    moneyBase: trainerClass?.moneyBase ?? 0,
    ai: trainer.ai,
    portrait: trainer.portrait ?? trainerClass?.portrait ?? 'portrait/dresseur',
    defeat: trainer.defeat,
    lastText: trainer.lastText,
    music: trainer.music,
  };
}

export function buildTrainerParty(trainer, rng, starter = getGameState().starter) {
  return trainerParty(trainer, starter).map((member) => createCreature(member.creature, member.level, rng, { moves: member.moves }));
}

/**
 * Runs a full battle from the overworld. options: { kind, enemyParty, trainer?, music?, canRun, onLose }.
 * Resolves with 'win' | 'lose' | 'run' | 'caught'.
 */
export async function runBattle(manager, options, { state = getGameState(), rng = createRng(Date.now()) } = {}) {
  if (!isPartyAlive(state)) return 'run';
  const transition = manager.push(new BattleTransitionScene());
  await transition.promise;
  manager.pop();
  const scene = manager.push(new BattleScene({ ...options, state, rng }));
  const { result } = await scene.promise;
  await manager.fadeOut();
  manager.pop();

  const pending = result === 'lose' ? [] : uniqueEvolutions(scene.evolutions);
  if (pending.length > 0) {
    await manager.fadeIn();
    for (const evolution of pending) {
      await playEvolution(manager, state.party[evolution.index], evolution.target);
    }
    await manager.fadeOut();
  }
  // The overworld fades back in itself after a blackout; otherwise we do it here.
  if (result !== 'lose' || options.onLose !== 'blackout') await manager.fadeIn();
  return result;
}

function uniqueEvolutions(events) {
  const byIndex = new Map();
  for (const event of events) byIndex.set(event.index, event);
  return [...byIndex.values()];
}

/** Replaces the provisional battle hooks of the overworld with the real battle. */
export function installBattleHooks(manager, { getState = getGameState } = {}) {
  const rng = createRng(Date.now());
  setHooks({
    startBattle: (trainer, { onLose = 'blackout', music } = {}) => runBattle(manager, {
      kind: 'trainer',
      enemyParty: buildTrainerParty(trainer, rng, getState().starter),
      trainer: trainerBattleConfig(trainer, getState()),
      music,
      onLose,
    }, { state: getState(), rng }),
    startWildBattle: ({ creature, level, canRun = true }) => runBattle(manager, {
      kind: 'wild',
      enemyParty: [createCreature(creature, level, rng)],
      canRun,
      onLose: 'blackout',
    }, { state: getState(), rng }),
    healParty: () => healParty(getState()),
  });
}
