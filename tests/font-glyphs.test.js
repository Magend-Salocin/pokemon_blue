import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GLYPH_HP, GLYPH_LEVEL, GLYPH_SIZE, buildGlyphTable } from '../src/gfx/font-glyphs.js';

const table = buildGlyphTable();

const REQUIRED = [
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  'abcdefghijklmnopqrstuvwxyz',
  '0123456789',
  ` .,!?'"-:;()/%+=`,
  'éèêëàâçîïôùûœÉÈÀÇ',
  '«»…♂♀▶▼',
  GLYPH_HP + GLYPH_LEVEL,
].join('');

test('every required character has a glyph', () => {
  const missing = [...REQUIRED].filter((character) => !table.has(character));
  assert.deepEqual(missing, []);
});

test('every glyph is 8×8 and uses only palette indices or "."', () => {
  for (const [character, rows] of table) {
    assert.equal(rows.length, GLYPH_SIZE, `glyph ${character}: row count`);
    for (const row of rows) {
      assert.match(row, /^[0-3.]{8}$/, `glyph ${character}: invalid row "${row}"`);
    }
  }
});

test('accented letters differ from their base letter', () => {
  for (const [accented, base] of [['é', 'e'], ['è', 'e'], ['ê', 'e'], ['ë', 'e'], ['ç', 'c'], ['É', 'E'], ['À', 'A']]) {
    assert.notDeepEqual(table.get(accented), table.get(base), accented);
  }
  assert.notDeepEqual(table.get('é'), table.get('è'));
  assert.notDeepEqual(table.get('ê'), table.get('ë'));
});
