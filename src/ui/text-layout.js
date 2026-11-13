// Pure text layout for dialog boxes (no DOM). Lengths are counted in characters,
// since the font is monospace.

export const DIALOG_LINE_WIDTH = 18;
export const DIALOG_LINES_PER_PAGE = 2;

/** Variables available in game texts, filled from a context object with the same keys. */
export const TEXT_VARIABLES = ['PLAYER', 'RIVAL', 'CREATURE', 'ITEM', 'NUMBER', 'MOVE', 'TARGET', 'TRAINER', 'STAT', 'TYPE'];

const VARIABLE_PATTERN = /\{([A-Z_]+)\}/g;
const NO_BREAK_SPACE = ' ';

function length(text) {
  return Array.from(text).length;
}

/** Replaces {PLAYER}, {RIVAL}… with context values. Unknown variables are left visible. */
export function applyVariables(text, context = {}) {
  return text.replace(VARIABLE_PATTERN, (token, name) =>
    Object.hasOwn(context, name) ? String(context[name]) : token,
  );
}

/** Keeps French punctuation attached to its word: "Oui !" never wraps before "!". */
function bindFrenchPunctuation(text) {
  return text
    .replace(/ ([!?:;»])/g, `${NO_BREAK_SPACE}$1`)
    .replace(/« /g, `«${NO_BREAK_SPACE}`);
}

function splitLongWord(word, width) {
  const characters = Array.from(word);
  const chunks = [];
  for (let i = 0; i < characters.length; i += width) {
    chunks.push(characters.slice(i, i + width).join(''));
  }
  return chunks;
}

/** Greedy word wrap of one paragraph (no '\n' inside). Always returns at least one line. */
export function wrapParagraph(paragraph, width = DIALOG_LINE_WIDTH) {
  const words = bindFrenchPunctuation(paragraph.normalize('NFC'))
    .split(' ')
    .filter((word) => word !== '');
  const lines = [];
  let current = '';

  for (const word of words.flatMap((item) => (length(item) > width ? splitLongWord(item, width) : [item]))) {
    if (current === '') {
      current = word;
    } else if (length(current) + 1 + length(word) <= width) {
      current = `${current} ${word}`;
    } else {
      lines.push(current);
      current = word;
    }
  }
  lines.push(current);
  return lines.map((line) => line.replaceAll(NO_BREAK_SPACE, ' '));
}

/**
 * Splits text into pages of lines. '\n' forces a new line, '\f' a new page.
 * Returns string[][]: pages, each an array of at most `linesPerPage` lines.
 */
export function layoutText(text, { lineWidth = DIALOG_LINE_WIDTH, linesPerPage = DIALOG_LINES_PER_PAGE } = {}) {
  const pages = [];

  for (const block of text.split('\f')) {
    const lines = block.split('\n').flatMap((paragraph) => wrapParagraph(paragraph, lineWidth));
    for (let i = 0; i < lines.length; i += linesPerPage) {
      pages.push(lines.slice(i, i + linesPerPage));
    }
  }
  return pages;
}
