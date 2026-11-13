// Game audio: music (sequencer), jingles (pause the music, then resume it), sound effects and
// cries (borrow channels). The AudioContext starts on the first key or click, as browsers require.
import { isBattleMusic } from '../data/music.js';
import { generateCry } from './cries.js';
import { createSequencer } from './sequencer.js';
import { SFX_BY_ID } from './sfx.js';
import { createSynth } from './synth.js';
import { parseTrack } from './track-parser.js';
import { TRACKS } from './tracks/index.js';

export function createAudioSystem() {
  let ctx = null;
  let synth = null;
  let sequencer = null;
  let wanted = null;
  let volumes = { music: 0.8, sfx: 0.8 };
  let resume = null; // { id, tick }: map music to resume after a battle
  let jingle = null; // { after: { id, tick } } while a jingle plays
  const parsed = new Map();

  function parsedTrack(id) {
    if (!parsed.has(id)) {
      const source = TRACKS[id] ?? SFX_BY_ID[id];
      parsed.set(id, source ? parseTrack(source) : id.startsWith('cry_') ? generateCry(id.slice(4)) : null);
    }
    return parsed.get(id);
  }

  function unlock() {
    if (ctx) {
      if (ctx.state === 'suspended' && document.hasFocus()) ctx.resume();
      return;
    }
    ctx = new AudioContext();
    synth = createSynth(ctx);
    sequencer = createSequencer(synth);
    synth.setVolumes(volumes.music, volumes.sfx);
    if (wanted) playMusic(wanted);
  }

  window.addEventListener('keydown', unlock);
  window.addEventListener('pointerdown', unlock);
  window.addEventListener('blur', () => ctx?.suspend());
  window.addEventListener('focus', () => ctx?.resume());

  function startMusic(id, startTick = 0) {
    const track = parsedTrack(id);
    if (track) sequencer.play(track, { startTick: startTick % Math.max(1, track.lengthTicks) });
  }

  function playMusic(id) {
    if (!id || !TRACKS[id]) return;
    wanted = id;
    if (!ctx) return;
    if (jingle) {
      jingle.after = { id, tick: jingle.after?.id === id ? jingle.after.tick : 0 };
      return;
    }
    const previous = sequencer.currentId;
    if (previous === id) return;
    if (previous && !isBattleMusic(previous) && isBattleMusic(id)) resume = { id: previous, tick: sequencer.position() };
    let startTick = 0;
    if (resume?.id === id) {
      startTick = resume.tick;
      resume = null;
    }
    startMusic(id, startTick);
  }

  function stopMusic(fade = 0) {
    wanted = null;
    if (!sequencer) return Promise.resolve();
    return fade > 0 ? sequencer.fadeOut(fade) : Promise.resolve(sequencer.stop());
  }

  /** Short tune that interrupts the music; the music then resumes where it was. */
  function playJingle(id) {
    const track = parsedTrack(id);
    if (!ctx || !track) return;
    const after = jingle?.after ?? (sequencer.currentId ? { id: sequencer.currentId, tick: sequencer.position() } : null);
    jingle = { after };
    sequencer.play(track, {
      onEnd: () => {
        const next = jingle?.after;
        jingle = null;
        if (next) startMusic(next.id, next.tick);
      },
    });
  }

  /** Plays an effect on its channels; the music goes silent on those channels only. */
  function playEffect(track) {
    const start = ctx.currentTime + 0.01;
    for (const [channel, data] of Object.entries(track.channels)) {
      const number = Number(channel);
      synth.borrowChannel(number, start, start + track.duration);
      for (const event of data.events) {
        const time = start + event.tick * track.secondsPerTick;
        synth.scheduleNote(number, event, time, time + event.ticks * track.secondsPerTick, 'sfx');
      }
    }
  }

  function playSfx(id) {
    if (!ctx || !id) return;
    if (id.startsWith('jingle_')) {
      playJingle(id);
      return;
    }
    const track = parsedTrack(id);
    if (track) playEffect(track);
  }

  function setVolumes(music, sfx) {
    volumes = { music, sfx };
    synth?.setVolumes(music, sfx);
  }

  return {
    playMusic,
    stopMusic,
    playSfx,
    setVolumes,
    get currentMusic() {
      return sequencer?.currentId ?? wanted;
    },
  };
}
