// Dialog flows of the Pension and of NPC trades.
import { CREATURES_BY_ID } from '../data/creatures.js';
import { daycareCost, depositInDaycare, withdrawFromDaycare } from '../state/daycare.js';
import { tradeCreature } from '../state/trade.js';
import { creatureName } from './creature-widgets.js';
import { ask, say } from './messages.js';
import { choosePartyMember } from './party-screen.js';

const DAYCARE_ERRORS = { money: 'daycare_no_money', party_full: 'daycare_party_full', last_healthy: 'daycare_last_healthy' };

export async function openDaycare(manager, state) {
  await say(manager, 'daycare_welcome');
  if (state.daycare) {
    const { creature, levelAtDeposit } = state.daycare;
    const name = creatureName(creature);
    await say(manager, 'daycare_status', { CREATURE: name, NUMBER: creature.level - levelAtDeposit });
    if (await ask(manager, 'daycare_ask_withdraw', { NUMBER: daycareCost(state) })) {
      const error = withdrawFromDaycare(state);
      await say(manager, DAYCARE_ERRORS[error] ?? 'daycare_returned', { CREATURE: name });
      if (error) return;
    }
  } else if (await ask(manager, 'daycare_ask_deposit')) {
    const index = await choosePartyMember(manager, state.party, { message: 'Confier qui ?' });
    if (index !== null) {
      const name = creatureName(state.party[index]);
      const error = depositInDaycare(state, index);
      await say(manager, DAYCARE_ERRORS[error] ?? 'daycare_deposited', { CREATURE: name });
      if (error) return;
    }
  }
  await say(manager, 'daycare_bye');
}

/**
 * NPC trade. Resolves true when the trade happened.
 * offer: { creature, level, nickname, originalTrainer }.
 */
export async function runTrade(manager, state, wanted, offer, rng) {
  const variables = { CREATURE: CREATURES_BY_ID[wanted].name, TARGET: CREATURES_BY_ID[offer.creature].name };
  if (!(await ask(manager, 'trade_ask', variables))) {
    await say(manager, 'trade_refused');
    return false;
  }
  const index = await choosePartyMember(manager, state.party, { message: 'Échanger qui ?' });
  if (index === null) {
    await say(manager, 'trade_refused');
    return false;
  }
  const given = creatureName(state.party[index]);
  const result = tradeCreature(state, index, wanted, offer, rng);
  if (result.error) {
    await say(manager, 'trade_wrong', variables);
    return false;
  }
  await say(manager, 'trade_done', { CREATURE: given, TARGET: creatureName(result.received) });
  return true;
}
