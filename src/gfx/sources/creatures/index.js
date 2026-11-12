// Hand-designed creatures (starters, legendaries, mythical). They replace the generator
// for these species. Each file exports { front, back } as 48 × 48 text rows.
import azurel from './azurel.js';
import braisille from './braisille.js';
import fenouillot from './fenouillot.js';
import fenouvert from './fenouvert.js';
import flaquin from './flaquin.js';
import fournaise from './fournaise.js';
import fulgorine from './fulgorine.js';
import glacerne from './glacerne.js';
import marevor from './marevor.js';
import mirelle from './mirelle.js';
import ondeclat from './ondeclat.js';
import pyrogrue from './pyrogrue.js';
import sylvenard from './sylvenard.js';
import volcarde from './volcarde.js';

export const HAND_DRAWN_CREATURES = {
  fenouillot, fenouvert, sylvenard,
  braisille, fournaise, pyrogrue,
  flaquin, ondeclat, marevor,
  azurel, glacerne, volcarde, fulgorine,
  mirelle,
};
