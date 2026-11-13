// All tracks by id. Maps (`music`) and src/data/music.js refer to these ids.
import battleFinal from './battle-final.js';
import battleLeader from './battle-leader.js';
import battleRival from './battle-rival.js';
import battleTrainer from './battle-trainer.js';
import battleWild from './battle-wild.js';
import cave from './cave.js';
import { ENCOUNTERS } from './encounters.js';
import ending from './ending.js';
import forest from './forest.js';
import halte from './halte.js';
import hometown from './hometown.js';
import introProfessor from './intro-professor.js';
import { JINGLES } from './jingles.js';
import memoryTower from './memory-tower.js';
import opalSyndicate from './opal-syndicate.js';
import route1 from './route-1.js';
import route2 from './route-2.js';
import title from './title.js';
import town1 from './town-1.js';
import town2 from './town-2.js';
import { victoryTrainer, victoryWild } from './victory.js';

/** The 20 themes of the game (map, battle and story music). */
export const THEMES = [
  title, introProfessor, hometown, route1, route2, town1, town2, halte, cave, forest, memoryTower,
  opalSyndicate, battleWild, battleTrainer, battleLeader, battleRival, battleFinal, victoryWild, victoryTrainer, ending,
];

/** Map tracks must last at least 30 s before looping, battle themes at least 45 s. */
export const MAP_TRACKS = ['hometown', 'route_1', 'route_2', 'town_1', 'town_2', 'halte', 'cave', 'forest', 'memory_tower', 'opal_syndicate'];
export const BATTLE_TRACKS = ['battle_wild', 'battle_trainer', 'battle_leader', 'battle_rival', 'battle_final'];
/** Tracks that restate the game motif. */
export const MOTIF_TRACKS = ['title', 'hometown', 'ending'];

export const TRACKS = Object.fromEntries([...THEMES, ...JINGLES, ...ENCOUNTERS].map((track) => [track.id, track]));
