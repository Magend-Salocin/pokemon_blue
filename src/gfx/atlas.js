// Loads the PNG atlases at startup and recolors them with the active palette.
// PNG grays are converted to palette indices, so hand-edited PNGs work as long as they
// stay close to the 4 reference grays (#ffffff, #aaaaaa, #555555, #000000).

import { createCanvas, hexToRgb } from './bitmap.js';
import { getColor, getPaletteKey } from './palette.js';

export const ATLAS_NAMES = ['tiles', 'characters', 'trainers', 'creatures', 'ui'];

const ATLAS_URL = new URL('../../assets/atlas/', import.meta.url);
const MAX_CACHED_PALETTES = 8;

const atlases = new Map();

/** Nearest reference gray → palette index; mostly transparent pixels → -1. */
export function grayToIndex(red, green, blue, alpha) {
  if (alpha < 128) return -1;
  const level = (red + green + blue) / 3;
  if (level >= 213) return 0;
  if (level >= 128) return 1;
  if (level >= 43) return 2;
  return 3;
}

function loadImage(url) {
  const image = new Image();
  image.src = url;
  return image.decode().then(() => image);
}

function readIndices(image) {
  const canvas = createCanvas(image.width, image.height);
  const context = canvas.getContext('2d', { willReadFrequently: true });
  context.drawImage(image, 0, 0);
  const { data } = context.getImageData(0, 0, image.width, image.height);
  const indices = new Int8Array(image.width * image.height);
  for (let i = 0; i < indices.length; i += 1) {
    indices[i] = grayToIndex(data[i * 4], data[i * 4 + 1], data[i * 4 + 2], data[i * 4 + 3]);
  }
  return indices;
}

async function loadAtlas(name) {
  const response = await fetch(new URL(`${name}.json`, ATLAS_URL), { cache: 'no-store' });
  if (!response.ok) throw new Error(`Atlas ${name}.json introuvable (lancer npm run atlas)`);
  const json = await response.json();
  // The query string forces a fresh read of a PNG edited by hand.
  const image = await loadImage(new URL(`${json.meta.image}?t=${Date.now()}`, ATLAS_URL));
  return {
    name,
    width: image.width,
    height: image.height,
    frames: json.frames,
    meta: json.meta,
    indices: readIndices(image),
    canvases: new Map(),
  };
}

/** Loads every atlas. `onProgress(loaded, total)` is called after each one. */
export async function loadAtlases(onProgress = () => {}) {
  let loaded = 0;
  await Promise.all(
    ATLAS_NAMES.map(async (name) => {
      atlases.set(name, await loadAtlas(name));
      loaded += 1;
      onProgress(loaded, ATLAS_NAMES.length);
    }),
  );
  return atlases;
}

export function getAtlas(name) {
  const atlas = atlases.get(name);
  if (!atlas) throw new Error(`Atlas not loaded: ${name}`);
  return atlas;
}

export function hasFrame(name, frameId) {
  return Boolean(atlases.get(name)?.frames[frameId]);
}

function paint(atlas) {
  const canvas = createCanvas(atlas.width, atlas.height);
  const context = canvas.getContext('2d');
  const image = context.createImageData(atlas.width, atlas.height);
  const colors = [0, 1, 2, 3].map((index) => hexToRgb(getColor(index)));
  atlas.indices.forEach((index, pixel) => {
    if (index < 0) return;
    const [red, green, blue] = colors[index];
    image.data[pixel * 4] = red;
    image.data[pixel * 4 + 1] = green;
    image.data[pixel * 4 + 2] = blue;
    image.data[pixel * 4 + 3] = 255;
  });
  context.putImageData(image, 0, 0);
  return canvas;
}

/** Atlas canvas in the current palette (cached per palette and fade level). */
export function getAtlasCanvas(atlas) {
  const key = getPaletteKey();
  let canvas = atlas.canvases.get(key);
  if (!canvas) {
    if (atlas.canvases.size >= MAX_CACHED_PALETTES) atlas.canvases.delete(atlas.canvases.keys().next().value);
    canvas = paint(atlas);
    atlas.canvases.set(key, canvas);
  }
  return canvas;
}
