// Exploration scene: player input, NPCs, trainers, warps, connections, field actions,
// event scripts and wild encounters. Rendering lives in world-renderer.js.
import { createRng } from '../engine/rng.js';
import { createCreature } from '../battle/logic/creature.js';
import { createScheduler } from '../engine/timer.js';
import { CREATURES_BY_ID } from '../data/creatures.js';
import { RUNNING_ITEM, fieldAbilityStatus } from '../data/field-abilities.js';
import { ITEMS_BY_ID } from '../data/items.js';
import { getMapDefinition } from '../data/maps/index.js';
import { SCRIPTS } from '../data/scripts.js';
import { getText } from '../data/texts/index.js';
import { TRAINER_CLASSES_BY_ID } from '../data/trainer-classes.js';
import { TRAINERS_BY_ID } from '../data/trainers.js';
import {
  addItem, getGameState, hasBadge, hasFlag, hasItem, isPartyAlive, setFlag,
} from '../state/game-state.js';
import { askYesNo, showDialog } from '../ui/dialog-box.js';
import {
  RUN_SPEED, WALK_SPEED, advanceMove, createActor, isMoving, pixelPosition, startMove, targetOf,
} from './actor.js';
import { BattlePlaceholderScene, BattleTransitionScene } from './battle-stub.js';
import { blocksSight, evaluateMove, evaluateTile, isWalkableLand, trainerSees } from './collision.js';
import { DIRECTIONS, OPPOSITE, directionTo, step } from './directions.js';
import { encounterKind, rollEncounter } from './encounters.js';
import { hooks } from './hooks.js';
import { buildMap } from './map-loader.js';
import { createNpcBrain, updateNpc } from './npc.js';
import { createScriptRunner } from './script-runner.js';
import { computeCamera, createWorld, edgeOf, toNeighborCoordinates } from './world.js';
import { renderWorld } from './world-renderer.js';
import { ENCOUNTER_MUSIC } from '../data/music.js';
import { daycareStep } from '../state/daycare.js';
import { ListMenu } from '../ui/components/list-menu.js';
import { withMenuLayer } from '../ui/components/menu-layer.js';
import { say } from '../ui/messages.js';
import { runTrade } from '../ui/services.js';
import { openStartMenu } from '../ui/start-menu.js';
import { openStorage } from '../ui/storage-menu.js';

const TURN_FRAMES = 6;
const BUMP_COOLDOWN = 0.3;
const EMOTE_DURATION = 0.8;
const ANIMATION_RATE = 2;
const SLIDE_SPEED = 2;

export class OverworldScene {
  transparent = false;
  blocksInput = true;

  /** start: { map, x, y, facing }. tilesets: `meta.tilesets` of the tiles atlas. */
  constructor({ start, tilesets, state = getGameState(), respawn = start }) {
    this.state = state;
    this.tilesets = tilesets;
    this.respawn = respawn;
    this.world = createWorld((id) => buildMap(getMapDefinition(id), tilesets), start.map);
    this.player = createActor({ id: 'player', sprite: 'joueur', x: start.x, y: start.y, facing: start.facing ?? 'down' });
    this.surfing = false;
    this.sliding = false;
    this.turnFrames = 0;
    this.chaining = false;
    this.bumpCooldown = 0;
    this.busy = false;
    this.emote = null;
    this.shakeTime = 0;
    this.animationTime = 0;
    this.scheduler = createScheduler();
    this.rng = createRng(Date.now());
    this.actors = [];
    this.brains = new Map();
    this.objects = [];
  }

  get map() {
    return this.world.map;
  }

  enter(manager) {
    this.manager = manager;
    this.onMapEntered();
    manager.fadeIn({ color: 'black' });
  }

  // ---- Map loading -------------------------------------------------------

  onMapEntered() {
    if (this.map.flyPoint && !this.state.visitedTowns.includes(this.map.id)) this.state.visitedTowns.push(this.map.id);
    this.spawnActors();
    this.updatePlayerSprite();
    this.savePosition();
    hooks.playMusic(this.map.music);
  }

  loadMapAt(mapId, x, y, facing) {
    this.world.setMap(mapId);
    Object.assign(this.player, { x, y, facing: facing ?? this.player.facing, movement: null });
    this.surfing = Boolean(this.map.metatileAt(x, y)?.water);
    this.sliding = false;
    this.onMapEntered();
  }

  isShown(definition) {
    if (definition.showIf && !hasFlag(this.state, definition.showIf)) return false;
    if (definition.hideIf && hasFlag(this.state, definition.hideIf)) return false;
    return true;
  }

  spawnActors() {
    const { map } = this;
    this.brains.clear();
    const npcs = (map.npcs ?? []).map((definition) => {
      const actor = createActor({ ...definition, visible: this.isShown(definition) });
      this.brains.set(actor, createNpcBrain(definition));
      return actor;
    });
    const trainers = (map.trainers ?? []).map((definition) => {
      const actor = createActor({ ...definition, trainerId: definition.trainer, visible: this.isShown(definition) });
      this.brains.set(actor, createNpcBrain(definition));
      return actor;
    });
    this.actors = [...npcs, ...trainers];
    this.objects = (map.items ?? [])
      .filter((item) => !hasFlag(this.state, item.flag))
      .map((item) => ({ ...item, frame: 'capsule' }));
  }

  updatePlayerSprite() {
    const base = this.state.player.gender === 'girl' ? 'joueuse' : 'joueur';
    this.player.sprite = this.surfing ? `${base}_bouee` : base;
  }

  savePosition() {
    const { x, y, facing } = this.player;
    this.state.position = { map: this.map.id, x, y, facing };
  }

  // ---- Queries -----------------------------------------------------------

  actorAt(x, y) {
    return this.actors.find((actor) => {
      if (!actor.visible) return false;
      const target = targetOf(actor);
      return (actor.x === x && actor.y === y) || (target.x === x && target.y === y);
    }) ?? null;
  }

  isOccupied(x, y, except) {
    const player = this.player;
    if (player !== except) {
      const target = targetOf(player);
      if ((player.x === x && player.y === y) || (target.x === x && target.y === y)) return true;
    }
    const actor = this.actorAt(x, y);
    if (actor && actor !== except) return true;
    return this.objects.some((object) => object.x === x && object.y === y);
  }

  /** Movement rules for an actor, crossing into connected maps for the player. */
  evaluate(actor, direction) {
    const isPlayer = actor === this.player;
    const options = { surfing: isPlayer && this.surfing, occupied: (x, y) => this.isOccupied(x, y, actor) };
    const result = evaluateMove(this.map, actor.x, actor.y, direction, options);
    if (result.type !== 'edge') return result;
    const neighbor = isPlayer ? this.world.neighbor(result.edge) : null;
    if (!neighbor) return { type: 'blocked', reason: 'edge' };
    const local = toNeighborCoordinates(this.map, neighbor, result.edge, result.x, result.y);
    if (!neighbor.inBounds(local.x, local.y)) return { type: 'blocked', reason: 'edge' };
    const inside = evaluateTile(neighbor, local.x, local.y, direction, { surfing: options.surfing });
    return inside.type === 'walk' ? { ...inside, x: result.x, y: result.y } : { type: 'blocked', reason: inside.reason };
  }

  canStep(actor, direction) {
    return this.evaluate(actor, direction).type === 'walk';
  }

  // ---- Update ------------------------------------------------------------

  update(dt, input) {
    this.animationTime += dt;
    this.bumpCooldown = Math.max(0, this.bumpCooldown - dt);
    this.shakeTime = Math.max(0, this.shakeTime - dt);
    this.scheduler.update(dt);

    for (const actor of this.actors) {
      if (advanceMove(actor)) actor.onArrive?.();
    }
    if (advanceMove(this.player)) this.onPlayerArrived();

    if (this.busy) return;
    for (const actor of this.actors) updateNpc(actor, this.brains.get(actor), dt, this.rng, (a, d) => this.canStep(a, d));
    this.handlePlayerInput(input);
  }

  heldDirection(input) {
    if (input.isDown(this.player.facing)) return this.player.facing;
    return DIRECTIONS.find((direction) => input.isDown(direction)) ?? null;
  }

  handlePlayerInput(input) {
    const { player } = this;
    if (isMoving(player)) return;
    if (this.sliding) {
      this.continueSlide();
      return;
    }
    if (input.justPressed('a')) {
      this.interact();
      return;
    }
    if (input.justPressed('start')) {
      this.runBusy(() => this.openStartMenu());
      return;
    }
    const direction = this.heldDirection(input);
    if (!direction) {
      this.chaining = false;
      this.turnFrames = 0;
      return;
    }
    if (direction !== player.facing && !this.chaining) {
      player.facing = direction;
      this.turnFrames = TURN_FRAMES;
      return;
    }
    if (this.turnFrames > 0) {
      this.turnFrames -= 1;
      return;
    }
    const running = !this.surfing && input.isDown('b') && hasItem(this.state, RUNNING_ITEM);
    this.tryPlayerStep(direction, running ? RUN_SPEED : WALK_SPEED);
  }

  tryPlayerStep(direction, speed = WALK_SPEED) {
    const { player } = this;
    const result = this.evaluate(player, direction);
    if (result.type === 'walk') {
      if (result.disembark) {
        this.surfing = false;
        this.updatePlayerSprite();
      }
      startMove(player, direction, { speed });
      this.chaining = true;
      return true;
    }
    if (result.type === 'jump') {
      hooks.playSfx('jump');
      startMove(player, direction, { speed: RUN_SPEED, distance: 2, jump: true });
      this.chaining = true;
      return true;
    }
    player.facing = direction;
    this.chaining = false;
    if (this.bumpCooldown === 0) {
      hooks.playSfx('bump');
      this.bumpCooldown = BUMP_COOLDOWN;
    }
    return false;
  }

  continueSlide() {
    const { player } = this;
    if (this.evaluate(player, player.facing).type !== 'walk') {
      this.sliding = false;
      return;
    }
    startMove(player, player.facing, { speed: SLIDE_SPEED });
    player.movement.slide = true;
  }

  onPlayerArrived() {
    const { player } = this;
    if (player.onArrive) {
      const callback = player.onArrive;
      player.onArrive = null;
      callback();
      return;
    }
    if (!this.map.inBounds(player.x, player.y)) this.crossConnection();
    this.savePosition();

    const warp = (this.map.warps ?? []).find((entry) => entry.x === player.x && entry.y === player.y);
    if (warp) {
      this.rememberEscapePoint(warp);
      this.runBusy(() => this.doWarp(warp.to, warp.toX, warp.toY));
      return;
    }
    daycareStep(this.state);
    const trigger = this.triggerAt(player.x, player.y);
    if (trigger) {
      setFlag(this.state, this.triggerFlag(trigger));
      this.runScript(trigger.script);
      return;
    }
    const tile = this.map.metatileAt(player.x, player.y);
    if (tile.grass) hooks.playSfx('grass');
    this.sliding = Boolean(tile.slippery) && !this.surfing;
    if (this.sliding) return;

    if (this.updateRepel()) return;
    const spotter = this.findSpottingTrainer();
    if (spotter) {
      this.runBusy(() => this.trainerEncounter(spotter.actor, spotter.distance));
      return;
    }
    this.checkWildEncounter(tile);
  }

  crossConnection() {
    const { player } = this;
    const edge = edgeOf(this.map, player.x, player.y);
    const neighbor = this.world.neighbor(edge);
    const local = toNeighborCoordinates(this.map, neighbor, edge, player.x, player.y);
    this.world.setMap(neighbor.id, neighbor);
    player.x = local.x;
    player.y = local.y;
    this.onMapEntered();
  }

  triggerFlag(trigger) {
    return trigger.flag ?? `trigger_${this.map.id}_${this.map.triggers.indexOf(trigger)}`;
  }

  triggerAt(x, y) {
    return (this.map.triggers ?? []).find((trigger) => {
      const inside = x >= trigger.x && x < trigger.x + (trigger.w ?? 1) && y >= trigger.y && y < trigger.y + (trigger.h ?? 1);
      return inside && !(trigger.once && hasFlag(this.state, this.triggerFlag(trigger)));
    }) ?? null;
  }

  /** Counts down the repel; returns true if its end message was shown. */
  updateRepel() {
    if (this.state.repelSteps <= 0) return false;
    this.state.repelSteps -= 1;
    if (this.state.repelSteps > 0) return false;
    this.runBusy(() => this.say('repel_ended'));
    return true;
  }

  findSpottingTrainer() {
    if (!isPartyAlive(this.state)) return null;
    for (const actor of this.actors) {
      if (!actor.trainerId || !actor.visible || hasFlag(this.state, `trainer_${actor.trainerId}`)) continue;
      const distance = trainerSees(actor, this.player, (x, y) => blocksSight(this.map, x, y) || this.isOccupied(x, y, actor));
      if (distance) return { actor, distance };
    }
    return null;
  }

  checkWildEncounter(tile) {
    if (!isPartyAlive(this.state)) return;
    const mapEncounters = this.map.encounters;
    const kind = encounterKind(tile, { surfing: this.surfing, mapEncounters });
    const encounter = rollEncounter({
      mapEncounters,
      kind,
      rng: this.rng,
      repelActive: this.state.repelSteps > 0,
      leadLevel: this.state.party[0]?.level ?? 0,
    });
    if (encounter) this.runBusy(() => this.wildBattle(encounter.creature, encounter.level));
  }

  // ---- Interaction -------------------------------------------------------

  interact() {
    const { player, map } = this;
    const front = step(player.x, player.y, player.facing);
    let actor = this.actorAt(front.x, front.y);
    if (!actor && map.metatileAt(front.x, front.y)?.counter) {
      const behind = step(front.x, front.y, player.facing);
      actor = this.actorAt(behind.x, behind.y);
    }
    if (actor) {
      this.runBusy(() => this.talkTo(actor));
      return;
    }
    const object = this.objects.find((entry) => entry.x === front.x && entry.y === front.y);
    if (object) {
      this.runBusy(() => this.pickUp(object, 'got_item'));
      return;
    }
    const sign = (map.signs ?? []).find((entry) => entry.x === front.x && entry.y === front.y);
    if (sign) {
      this.runBusy(() => this.say(sign.text));
      return;
    }
    const hidden = (map.hiddenItems ?? []).find((entry) => entry.x === front.x && entry.y === front.y && !hasFlag(this.state, entry.flag));
    if (hidden) {
      this.runBusy(() => this.pickUp(hidden, 'found_item'));
      return;
    }
    const tile = map.metatileAt(front.x, front.y);
    if (!tile) return;
    if (tile.id === 'storage_terminal') this.runBusy(() => openStorage(this.manager, this.state));
    else if (tile.cuttable) this.runBusy(() => this.fieldCut(front));
    else if (tile.pushable) this.runBusy(() => this.fieldPush(front));
    else if (tile.climbable) this.runBusy(() => this.fieldClimb(front));
    else if (tile.water && !this.surfing) this.runBusy(() => this.fieldSurf());
  }

  async talkTo(actor) {
    actor.facing = OPPOSITE[this.player.facing];
    if (actor.trainerId) {
      if (hasFlag(this.state, `trainer_${actor.trainerId}`)) await this.say(TRAINERS_BY_ID[actor.trainerId].after);
      else if (!isPartyAlive(this.state)) await this.say('no_healthy_creature');
      else await this.trainerEncounter(actor, 1);
      return;
    }
    await this.runScriptNow(actor.script);
  }

  async pickUp(entry, textId) {
    addItem(this.state, entry.item);
    setFlag(this.state, entry.flag);
    this.objects = this.objects.filter((object) => object !== entry);
    hooks.playSfx(ITEMS_BY_ID[entry.item]?.pocket === 'key' ? 'jingle_key_item' : 'jingle_item');
    await this.say(textId, { ITEM: this.itemName(entry.item) });
  }

  fieldStatus(ability) {
    return fieldAbilityStatus(ability, {
      hasItem: (item) => hasItem(this.state, item),
      hasBadge: (badge) => hasBadge(this.state, badge),
    });
  }

  /** Shows the "blocked" or "missing badge" message; returns true when the ability can be used. */
  async checkFieldAbility(ability, prefix) {
    const status = this.fieldStatus(ability);
    if (status === 'no_item') await this.say(`${prefix}_blocked`);
    else if (status === 'no_badge') await this.say(`${prefix}_no_badge`);
    return status === 'ok';
  }

  async fieldCut(front) {
    if (!(await this.checkFieldAbility('cut', 'field_cut'))) return;
    if (!(await this.ask('field_cut_ask'))) return;
    hooks.playSfx('cut');
    this.map.setTile(front.x, front.y, this.map.clearTile);
  }

  async fieldPush(front) {
    if (!(await this.checkFieldAbility('strength', 'field_strength'))) return;
    const destination = step(front.x, front.y, this.player.facing);
    const hasWarp = (this.map.warps ?? []).some((warp) => warp.x === destination.x && warp.y === destination.y);
    const free = this.map.inBounds(destination.x, destination.y)
      && isWalkableLand(this.map, destination.x, destination.y)
      && !this.isOccupied(destination.x, destination.y)
      && !hasWarp;
    if (!free) {
      await this.say('field_strength_stuck');
      return;
    }
    hooks.playSfx('push');
    this.map.setTile(destination.x, destination.y, this.map.tileAt(front.x, front.y));
    this.map.setTile(front.x, front.y, this.map.clearTile);
  }

  async fieldClimb(front) {
    if (!(await this.checkFieldAbility('climb', 'field_climb'))) return;
    const landing = step(front.x, front.y, this.player.facing);
    if (!this.map.inBounds(landing.x, landing.y) || !isWalkableLand(this.map, landing.x, landing.y) || this.isOccupied(landing.x, landing.y)) return;
    if (!(await this.ask('field_climb_ask'))) return;
    hooks.playSfx('jump');
    await this.movePlayerScripted(this.player.facing, { speed: RUN_SPEED, distance: 2, jump: true });
  }

  async fieldSurf() {
    if (!(await this.checkFieldAbility('surf', 'field_surf'))) return;
    if (!(await this.ask('field_surf_ask'))) return;
    this.surfing = true;
    hooks.playSfx('surf');
    this.updatePlayerSprite();
    await this.movePlayerScripted(this.player.facing);
  }

  // ---- Trainers, battles, warps -----------------------------------------

  async trainerEncounter(actor, distance) {
    const trainer = TRAINERS_BY_ID[actor.trainerId];
    this.sliding = false;
    this.emote = actor;
    hooks.playSfx('exclamation');
    hooks.playMusic(ENCOUNTER_MUSIC[TRAINER_CLASSES_BY_ID[trainer.class]?.musicIntro] ?? ENCOUNTER_MUSIC.trainer);
    await this.scheduler.wait(EMOTE_DURATION);
    this.emote = null;
    for (let i = 1; i < distance; i += 1) await this.moveActorStep(actor, actor.facing);
    this.player.facing = OPPOSITE[actor.facing];
    await this.say(trainer.intro);
    const outcome = await this.battle(trainer.id);
    if (outcome === 'win') {
      setFlag(this.state, `trainer_${trainer.id}`);
      hooks.playMusic(this.map.music);
    } else {
      await this.blackout();
    }
  }

  async runBattleStub(lines) {
    const transition = this.manager.push(new BattleTransitionScene());
    await transition.promise;
    this.manager.pop();
    const battle = this.manager.push(new BattlePlaceholderScene(lines));
    return battle.promise;
  }

  battle(trainerId, onLose = 'blackout') {
    const trainer = TRAINERS_BY_ID[trainerId];
    if (hooks.startBattle) return hooks.startBattle(trainer, { onLose });
    const className = TRAINER_CLASSES_BY_ID[trainer.class]?.name ?? '';
    return this.runBattleStub(['Combat contre', `${className} ${trainer.name}`.trim()]);
  }

  async wildBattle(creature, level) {
    const outcome = hooks.startWildBattle
      ? await hooks.startWildBattle({ creature, level })
      : await this.runBattleStub([`${this.creatureName(creature)} sauvage`, `Niveau ${level}`]);
    if (outcome === 'lose') await this.blackout();
    else hooks.playMusic(this.map.music);
    return outcome;
  }

  async doWarp(mapId, x, y, facing = this.player.facing) {
    const fromTile = this.map.tileAt(this.player.x, this.player.y) ?? '';
    hooks.playSfx(/stairs|ladder/.test(fromTile) ? 'stairs' : fromTile === 'teleporter' ? 'teleporter' : 'door');
    await this.manager.fadeOut();
    this.loadMapAt(mapId, x, y, facing);
    await this.manager.fadeIn();
    // Leave the door or stairs by one step when the way is free.
    const result = this.evaluate(this.player, this.player.facing);
    if (result.type === 'walk' && this.map.inBounds(result.x, result.y)) await this.movePlayerScripted(this.player.facing);
  }

  /** After a lost battle (the battle scene already showed the message): heal and go back. */
  async blackout() {
    hooks.healParty();
    const destination = this.state.lastHalte ?? this.respawn;
    await this.manager.fadeOut();
    this.loadMapAt(destination.map, destination.x, destination.y, destination.facing ?? 'down');
    await this.manager.fadeIn();
  }

  // ---- Scripts -----------------------------------------------------------

  /** Runs an async action with player input and NPC movement frozen. */
  async runBusy(action) {
    this.busy = true;
    try {
      await action();
    } finally {
      this.busy = false;
    }
  }

  runScript(script) {
    return this.runBusy(() => this.runScriptNow(script));
  }

  async runScriptNow(script) {
    const commands = typeof script === 'string' ? this.getScript(script) : script;
    await createScriptRunner(this.scriptContext()).run(commands ?? []);
  }

  getScript(name) {
    return this.map.scripts?.[name] ?? SCRIPTS[name];
  }

  textContext(variables = {}) {
    return { PLAYER: this.state.player.name, RIVAL: this.state.rival.name, ...variables };
  }

  say(textId, variables) {
    return showDialog(this.manager, getText(textId), { context: this.textContext(variables) });
  }

  ask(textId, variables) {
    return askYesNo(this.manager, getText(textId), { context: this.textContext(variables) });
  }

  itemName(id) {
    return ITEMS_BY_ID[id]?.name ?? id;
  }

  creatureName(id) {
    return CREATURES_BY_ID[id]?.name ?? id;
  }

  findActor(id) {
    return id === 'player' ? this.player : this.actors.find((actor) => actor.id === id);
  }

  moveActorStep(actor, direction, options) {
    return new Promise((resolve) => {
      startMove(actor, direction, options);
      actor.onArrive = () => {
        actor.onArrive = null;
        resolve();
      };
    });
  }

  movePlayerScripted(direction, options) {
    return this.moveActorStep(this.player, direction, options);
  }

  scriptContext() {
    return {
      state: this.state,
      say: (textId, variables) => this.say(textId, variables),
      ask: (textId, variables) => this.ask(textId, variables),
      moveActor: async (id, path) => {
        const actor = this.findActor(id);
        for (const direction of path) await this.moveActorStep(actor, direction);
        if (actor === this.player) this.savePosition();
      },
      faceActor: (id, direction) => {
        const actor = this.findActor(id);
        if (direction !== 'player') {
          actor.facing = direction;
          return;
        }
        actor.facing = directionTo(actor.x, actor.y, this.player.x, this.player.y) ?? OPPOSITE[this.player.facing];
      },
      wait: (seconds) => this.scheduler.wait(seconds),
      battle: async (trainerId, onLose) => {
        const outcome = await this.battle(trainerId, onLose);
        if (outcome !== 'lose' || onLose !== 'blackout') hooks.playMusic(this.map.music);
        return outcome;
      },
      createCreature: (species, level) => createCreature(species, level, this.rng, { originalTrainer: this.state.player.name }),
      wildBattle: (creature, level) => this.wildBattle(creature, level),
      blackout: () => this.blackout(),
      warp: (mapId, x, y, facing) => this.doWarp(mapId, x, y, facing),
      setActorVisible: (id, visible) => {
        const actor = this.findActor(id);
        if (actor) actor.visible = visible;
      },
      playMusic: (track) => hooks.playMusic(track),
      playSfx: (sfx) => hooks.playSfx(sfx),
      fade: (direction, color) => (direction === 'out' ? this.manager.fadeOut({ color }) : this.manager.fadeIn()),
      shake: (seconds) => {
        this.shakeTime = seconds;
        return this.scheduler.wait(seconds);
      },
      openMenu: (menu, params) => hooks.openMenu(menu, params),
      getScript: (name) => this.getScript(name),
      setRespawn: () => {
        const { x, y } = this.player;
        this.state.lastHalte = { map: this.map.id, x, y, facing: 'down' };
      },
      trade: (wanted, offer) => runTrade(this.manager, this.state, wanted, offer, this.rng),
      setRivalName: async () => {
        const name = await hooks.nameRival();
        if (name) this.state.rival.name = name;
      },
      chooseStarter: () => hooks.chooseStarter(),
      healParty: () => hooks.healParty(),
      itemName: (id) => this.itemName(id),
      itemPocket: (id) => ITEMS_BY_ID[id]?.pocket,
      creatureName: (id) => this.creatureName(id),
    };
  }

  // ---- Start menu and map actions ------------------------------------------

  /** Maps that count as dungeons for the Fil d'Ariane. */
  isDungeon(map = this.map) {
    return map.tileset === 'cave' || map.tileset === 'special' || Boolean(map.dungeon);
  }

  /** Entering a dungeon from outside: the Fil d'Ariane will lead back to this warp. */
  rememberEscapePoint(warp) {
    const target = getMapDefinition(warp.to);
    const entering = !this.isDungeon() && (target.tileset === 'cave' || target.tileset === 'special' || target.dungeon);
    if (entering) this.state.escapePoint = { map: this.map.id, x: warp.x, y: warp.y, facing: OPPOSITE[this.player.facing] };
  }

  fieldActions() {
    return {
      save: () => hooks.saveGame(this.state),
      canFly: () => this.fieldStatus('fly') === 'ok' && !this.isDungeon() && this.state.visitedTowns.length > 0,
      fly: () => this.chooseFlyDestination(),
      canEscape: () => this.isDungeon() && Boolean(this.state.escapePoint),
      escape: async () => {
        const point = this.state.escapePoint;
        this.state.escapePoint = null;
        await this.doWarp(point.map, point.x, point.y, point.facing);
      },
    };
  }

  async openStartMenu() {
    const action = await openStartMenu(this.manager, this.state, this.fieldActions());
    if (action) await action();
  }

  async chooseFlyDestination() {
    const towns = this.state.visitedTowns.map((id) => getMapDefinition(id));
    if (towns.length === 0) {
      await say(this.manager, 'fly_none');
      return;
    }
    const index = await withMenuLayer(this.manager, (layer) =>
      layer.open(new ListMenu(towns.map((town) => ({ label: town.name })), { x: 0, y: 0, width: 160, rows: Math.min(6, towns.length) })));
    if (index === null) return;
    const town = towns[index];
    hooks.playSfx('fly');
    await this.doWarp(town.id, town.flyPoint.x, town.flyPoint.y, 'down');
  }

  // ---- Render ------------------------------------------------------------

  render(ctx) {
    const { px, py } = pixelPosition(this.player);
    renderWorld(ctx, {
      world: this.world,
      camera: computeCamera(this.map, px, py),
      player: this.player,
      actors: this.actors,
      objects: this.objects,
      animationStep: Math.floor(this.animationTime * ANIMATION_RATE),
      emote: this.emote,
      dark: Boolean(this.map.dark) && this.fieldStatus('flash') !== 'ok',
      shake: this.shakeTime > 0 ? (Math.floor(this.animationTime * 30) % 2 === 0 ? 2 : -2) : 0,
    });
  }
}
