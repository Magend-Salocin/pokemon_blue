// Audio: every track and effect parses, durations, motif, and tracks referenced by maps,
// trainer classes and trainers exist.
import { SFX } from '../../src/audio/sfx.js';
import { parseTrack, containsIntervals } from '../../src/audio/track-parser.js';
import { BATTLE_TRACKS, MAP_TRACKS, MOTIF_TRACKS, THEMES, TRACKS } from '../../src/audio/tracks/index.js';
import { MOTIF_INTERVALS } from '../../src/audio/tracks/title.js';
import { BATTLE_MUSIC, ENCOUNTER_MUSIC, VICTORY_MUSIC, WILD_BATTLE_MUSIC } from '../../src/data/music.js';

export const MIN_MAP_SECONDS = 30;
export const MIN_BATTLE_SECONDS = 45;
export const REQUIRED_THEMES = 20;

export function checkAudio(data) {
  const errors = [];
  const parsed = {};
  for (const track of [...Object.values(TRACKS), ...SFX]) {
    try {
      parsed[track.id] = parseTrack(track);
    } catch (error) {
      errors.push(error.message);
    }
  }
  if (THEMES.length < REQUIRED_THEMES) errors.push(`${THEMES.length} thèmes au lieu de ${REQUIRED_THEMES}`);
  for (const id of MAP_TRACKS) {
    if (parsed[id] && parsed[id].duration < MIN_MAP_SECONDS) errors.push(`piste ${id} : ${parsed[id].duration.toFixed(1)} s avant de boucler (min ${MIN_MAP_SECONDS})`);
  }
  for (const id of BATTLE_TRACKS) {
    if (parsed[id] && parsed[id].duration < MIN_BATTLE_SECONDS) errors.push(`piste ${id} : ${parsed[id].duration.toFixed(1)} s avant de boucler (min ${MIN_BATTLE_SECONDS})`);
  }
  for (const id of MOTIF_TRACKS) {
    if (parsed[id] && !containsIntervals(parsed[id].channels[1].events, MOTIF_INTERVALS.slice(0, 3))) errors.push(`piste ${id} : le motif du jeu est absent de la voie 1`);
  }

  const referenced = [
    ...Object.values(data.maps).map((map) => [`carte ${map.id}`, map.music]),
    ...data.trainerClasses.flatMap((trainerClass) => [
      [`classe ${trainerClass.id} (repérage)`, ENCOUNTER_MUSIC[trainerClass.musicIntro]],
      [`classe ${trainerClass.id} (combat)`, BATTLE_MUSIC[trainerClass.musicIntro]],
    ]),
    ...data.trainers.filter((trainer) => trainer.music).map((trainer) => [`dresseur ${trainer.id}`, trainer.music]),
    ['combat sauvage', WILD_BATTLE_MUSIC],
    ...Object.entries(VICTORY_MUSIC).map(([kind, id]) => [`victoire ${kind}`, id]),
  ];
  for (const [label, id] of referenced) {
    if (!id) errors.push(`${label} : aucune musique`);
    else if (!TRACKS[id]) errors.push(`${label} : piste inconnue « ${id} »`);
  }
  return errors;
}
