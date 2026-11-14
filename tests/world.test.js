import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MAPS } from '../src/data/maps/index.js';
import { TRAINERS_BY_ID, trainerParty } from '../src/data/trainers.js';
import { STARTERS } from '../src/data/trainers/helpers.js';
import { loadGameData } from '../tools/validators/game-data.js';
import { checkFlags } from '../tools/validators/flags.js';

const BEATS = { fenouillot: 'braisille', braisille: 'flaquin', flaquin: 'fenouillot' };

test('the first rival owns the starter that beats the player one', () => {
  for (const starter of STARTERS) {
    const party = trainerParty(TRAINERS_BY_ID.rival_1, starter);
    assert.equal(party[0].creature, BEATS[starter]);
  }
});

test('champions are smart, have a last-creature line and their own portrait', () => {
  for (const id of ['garance', 'mael', 'selene', 'aubin']) {
    const trainer = TRAINERS_BY_ID[id];
    assert.equal(trainer.ai, 'smart', id);
    assert.ok(trainer.lastText, id);
    assert.equal(trainer.portrait, `portrait/${id}`);
  }
});

test('every town of part 1 has a fly point', () => {
  for (const id of ['hameau_de_lys', 'bourg_sablon', 'port_ondine', 'vireval', 'cendrelune']) assert.ok(MAPS[id].flyPoint, id);
});

test('a flag read but never set is reported', () => {
  const data = loadGameData();
  assert.deepEqual(checkFlags(data), []);
  const broken = { ...data, maps: { ...data.maps, x: { id: 'x', npcs: [{ id: 'a', showIf: 'never_set' }] } } };
  assert.equal(checkFlags(broken).length, 1);
});
