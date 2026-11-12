import cave from './cave.js';
import indoor from './indoor.js';
import outdoor from './outdoor.js';
import special from './special.js';
import town from './town.js';

/** All tilesets. A tileset with `extends` also exposes the metatiles of its parent. */
export const TILESETS = [outdoor, town, indoor, cave, special];

/** Atlas frame id of a metatile frame: "outdoor/grass", "outdoor/water/1". */
export function metatileFrameId(tilesetId, metatileId, frame, frameCount) {
  return frameCount > 1 ? `${tilesetId}/${metatileId}/${frame}` : `${tilesetId}/${metatileId}`;
}

/** Map of tileset id → Map of metatile id → definition, including inherited metatiles. */
export function buildMetatileIndex(tilesets = TILESETS) {
  const byId = new Map(tilesets.map((tileset) => [tileset.id, tileset]));
  const index = new Map();

  function resolve(tileset) {
    if (index.has(tileset.id)) return index.get(tileset.id);
    const parent = tileset.extends ? resolve(byId.get(tileset.extends)) : new Map();
    const own = new Map(parent);
    for (const definition of tileset.metatiles) own.set(definition.id, { ...definition, tileset: tileset.id });
    index.set(tileset.id, own);
    return own;
  }

  tilesets.forEach(resolve);
  return index;
}
