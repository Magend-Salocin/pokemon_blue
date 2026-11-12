// Shelf packer for atlas frames (pure). Frames are sorted by height, then placed row by row.

const PADDING = 1;

/**
 * @param {Record<string, { width: number, height: number }>} sizes
 * @returns {{ width: number, height: number, placements: Record<string, { x, y, w, h }> }}
 */
export function packFrames(sizes, { padding = PADDING, minWidth = 128 } = {}) {
  const entries = Object.entries(sizes);
  const area = entries.reduce((sum, [, size]) => sum + (size.width + padding) * (size.height + padding), 0);
  const widest = Math.max(0, ...entries.map(([, size]) => size.width + padding));
  const width = Math.max(minWidth, widest, Math.ceil(Math.sqrt(area) / 16) * 16);

  // Stable order: tallest first, then by id, so builds are reproducible.
  entries.sort(([idA, a], [idB, b]) => b.height - a.height || idA.localeCompare(idB));

  const placements = {};
  let x = 0;
  let y = 0;
  let shelfHeight = 0;
  for (const [id, size] of entries) {
    if (x + size.width > width) {
      x = 0;
      y += shelfHeight + padding;
      shelfHeight = 0;
    }
    placements[id] = { x, y, w: size.width, h: size.height };
    x += size.width + padding;
    shelfHeight = Math.max(shelfHeight, size.height);
  }
  return { width, height: y + shelfHeight, placements };
}
