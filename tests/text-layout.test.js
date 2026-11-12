import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyVariables, layoutText, wrapParagraph } from '../src/ui/text-layout.js';

test('wraps words on 18-character lines', () => {
  assert.deepEqual(wrapParagraph('Les herbes hautes cachent des bestioles.'), [
    'Les herbes hautes',
    'cachent des',
    'bestioles.',
  ]);
});

test('a line can be exactly 18 characters', () => {
  assert.deepEqual(wrapParagraph('abcdefghi abcdefgh'), ['abcdefghi abcdefgh']);
});

test('groups lines into pages of 2', () => {
  const pages = layoutText('Les herbes hautes cachent des bestioles.');
  assert.deepEqual(pages, [['Les herbes hautes', 'cachent des'], ['bestioles.']]);
});

test('\\n forces a new line and \\f a new page', () => {
  assert.deepEqual(layoutText('Un\nDeux\fTrois'), [['Un', 'Deux'], ['Trois']]);
  assert.deepEqual(layoutText('Un\nDeux\nTrois'), [['Un', 'Deux'], ['Trois']]);
});

test('empty lines are kept', () => {
  assert.deepEqual(layoutText('Un\n\nTrois'), [['Un', ''], ['Trois']]);
  assert.deepEqual(layoutText(''), [['']]);
});

test('words longer than a line are split', () => {
  assert.deepEqual(wrapParagraph('Anticonstitutionnellement'), ['Anticonstitutionne', 'llement']);
});

test('collapses repeated spaces', () => {
  assert.deepEqual(wrapParagraph('Un   deux'), ['Un deux']);
});

test('accented characters count as one character', () => {
  // 18 characters with accents: must fit on one line.
  assert.deepEqual(wrapParagraph('Élève à Hôtel çœur'), ['Élève à Hôtel çœur']);
});

test('decomposed accents are normalized before counting', () => {
  const decomposed = 'été'; // "été" with combining accents
  assert.deepEqual(layoutText(decomposed), [['été']]);
});

test('French punctuation never starts a line', () => {
  const lines = wrapParagraph('Une bestiole sauvage !');
  assert.deepEqual(lines, ['Une bestiole', 'sauvage !']);
  assert.deepEqual(wrapParagraph('Elle a dit « bonjour » ?'), ['Elle a dit', '« bonjour » ?']);
});

test('replaces text variables from the context', () => {
  const context = { PLAYER: 'Elio', RIVAL: 'Nora', CREATURE: 'Braisille', ITEM: 'Capsule', NUMBER: 5 };
  assert.equal(
    applyVariables('{PLAYER} et {RIVAL} : {NUMBER} {ITEM}, un {CREATURE}.', context),
    'Elio et Nora : 5 Capsule, un Braisille.',
  );
});

test('unknown variables stay visible', () => {
  assert.equal(applyVariables('Salut {PLAYER} !', {}), 'Salut {PLAYER} !');
});

test('variables are measured after replacement', () => {
  const pages = layoutText(applyVariables('{PLAYER} reçoit un objet.', { PLAYER: 'Maximilienne' }));
  assert.deepEqual(pages, [['Maximilienne', 'reçoit un objet.']]);
});
