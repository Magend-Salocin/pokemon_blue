# Avancement

Chaque session d'implémentation ajoute une entrée en bas de ce fichier : prompt exécuté, ce qui est fait, ce qui reste, décisions prises hors du game design, problèmes connus.

| Prompt | Statut |
|---|---|
| 01 Socle Electron et moteur | fait |
| 02 Graphismes et atlas | fait |
| 03 Données de jeu | fait |
| 04 Moteur de carte | fait |
| 05 Logique de combat | fait |
| 06 Interface de combat | fait |
| 07 Menus et systèmes | fait |
| 08 Audio | fait |
| 09 Monde, partie 1 (arènes 1 à 4) | fait |
| 10 Monde, partie 2 (arènes 5 à 8) | à faire |
| 11 Ligue, post-jeu, fin | à faire |
| 12 Sauvegarde, finition, packaging | à faire |
| 13 Recette complète | à faire |

## Journal

### 2026-11-12 : prompt 01, socle Electron, moteur et boîte de dialogue

Fait
- Projet : `package.json` (`type: module`), scripts `start`, `dev`, `test` ; `atlas`, `validate`, `dist` affichent « non implémenté » via `tools/not-implemented.js`. Electron 45, electron-builder 26, pngjs 7.
- Electron : fenêtre 640 × 576 redimensionnable, fond noir, sans menu hors dev, `contextIsolation`, `sandbox`, navigation et nouvelles fenêtres bloquées, CSP stricte. `F11` bascule le plein écran. Preload `window.bestiora` : `isDev`, `save`, `load` (canaux IPC `save:write` / `save:read` en stub), `toggleFullscreen`.
- Moteur (`src/engine/`) : constantes, boucle à pas fixe (5 mises à jour max par frame, pause sur perte de focus), rendu 160 × 144 à l'échelle entière mesurée en pixels physiques, entrées clavier + manette avec répétition (300 ms puis 80 ms), pile de scènes avec fondus, tween, timer, RNG mulberry32.
- Graphismes (`src/gfx/`) : 5 palettes, police 8 × 8 en sources texte (accents composés à partir des lettres de base), cache de glyphes par palette.
- UI (`src/ui/`) : `text-layout.js` (pur), cadre de fenêtre en tuiles 8 × 8, `DialogScene` avec `showDialog` et `askYesNo`.
- Démo (`src/demo/demo-scene.js`) : titre, échantillons de glyphes, palette active, dialogue de 3 pages avec question OUI/NON, réponse affichée. `Select` + `Start` change de palette.
- Tests : `rng`, `text-layout`, `font-glyphs`, `scene-manager` (30 tests).
- Vérifié en lançant Electron (normal et `--dev`) avec captures : rendu net à ×4 et après redimensionnement, accents, répétition auto dans OUI/NON, changement de palette, aucun message dans la console.

Reste
- Manette testée uniquement par le code (pas de manette physique pendant la session).
- Remappage des touches : API `setKeyBindings` prête, écran d'options au prompt 07.

Décisions
- `dt` est en secondes partout dans le moteur.
- `blocksInput: false` signifie que la scène du dessous est aussi mise à jour avec les entrées ; une scène bloquante gèle celles du dessous. Pendant un fondu, les scènes reçoivent `IDLE_INPUT`.
- Les fondus décalent les index de palette en 3 paliers (vers noir ou blanc) au lieu d'un fondu alpha, pour rester en 4 teintes. Les caches de bitmaps sont indexés par `getPaletteKey()`, qui inclut le niveau de fondu.
- Police monospace 8 px. Glyphes `PV` et `Nv` sur les caractères privés `GLYPH_HP` (``) et `GLYPH_LEVEL` (``). Majuscules accentuées sur un corps de 5 lignes pour garder l'accent lisible.
- Typographie française : l'espace avant `! ? : ; »` et après `«` devient insécable au découpage, la ponctuation ne commence jamais une ligne.
- Variables de texte inconnues laissées visibles (`{PLAYER}`) pour repérer les oublis.
- Touche B liée à `KeyZ` et `KeyW` (codes physiques) : `Z` annule en QWERTY comme en AZERTY.
- Question OUI/NON : le curseur boucle, ce qui rend la répétition auto visible ; `B` répond NON.
- Electron : `electron/package.json` force CommonJS pour le processus principal et le preload sandboxé, le reste du dépôt est en modules ES. Le script d'installation d'electron est approuvé dans `allowScripts` (npm 11+ le bloque sinon et le binaire n'est pas téléchargé).
- DevTools ouvertes sans activation en dev, sinon le jeu se met en pause au démarrage.

Problèmes connus
- Si la variable d'environnement `ELECTRON_RUN_AS_NODE` est définie (cas de certains terminaux intégrés à VS Code), `npm start` démarre Electron en mode Node et échoue. La supprimer avant de lancer.

### 2026-11-12 : prompt 02, graphismes, générateur de bestioles et atlas PNG

Fait
- Modules purs (Node et navigateur) : `src/gfx/sprite-utils.js` (`parseSprite`, `flipHorizontal`, `validateSprite`, `hashSprite`), `src/gfx/shape-renderer.js` (formes vectorielles → sprite 4 teintes avec contour, contours internes, ombrage bas-droite, reflets), `src/gfx/creature-generator.js`.
- Générateur : 11 plans, 14 caractéristiques, 4 motifs, vues `front` / `back`, déterministe. Une silhouette qui sort du cadre est réduite jusqu'à tenir dans 48 × 48.
- Sources : tuiles (5 tilesets, 160 métatuiles), 39 personnages + `capsule` et `rocher`, 39 portraits + 2 dos, 14 bestioles dessinées, interface.
- `npm run atlas` (`tools/build-atlas.js`) : 5 PNG en gris de référence + JSON, build déterministe, `--keep-edited`. Bestioles depuis `src/data/creatures.js` si présent, sinon `tools/sample-creatures.js` (20 exemples dont 2 lignées).
- Runtime : `src/gfx/atlas.js` (chargement, gris → index, cache par palette limité à 8 entrées par atlas), `src/gfx/draw.js` (`drawSprite`, `drawMetatile`, `getMetatile`), écran de chargement, visionneuse (`Select` depuis la démo).
- Tests : sources, générateur (déterminisme, contour fermé, cadre, symétrie), empaquetage, conversion des gris. 59 tests.
- Vérifié dans Electron : visionneuse sur les 5 atlas et la planche, changement de palette, retouche d'un PNG à la main visible au relancement, `--keep-edited` conserve le PNG retouché, rebuild sans option identique octet par octet à l'original.

Identifiants d'atlas (frame `id` dans les JSON)
- `tiles` : `<tileset>/<metatile>`, animées `<tileset>/<metatile>/<n>`. Tilesets `outdoor`, `town` (hérite de `outdoor`), `indoor`, `cave`, `special`. Bâtiments : `<prefix>_roof_top_l|m|r`, `<prefix>_roof_l|m|r`, `<prefix>_roof_emblem`, `<prefix>_wall_l|wall|wall_r`, `<prefix>_window`, `<prefix>_door` avec `prefix` ∈ `house_a`, `house_b`, `house_c`, `halte`, `comptoir`, `arena`, `lab`. Grands objets en 4 métatuiles `_tl/_tr/_bl/_br` (arbre, table). Liste complète et drapeaux dans `assets/atlas/tiles.json` (`meta.tilesets`).
- `characters` : `<id>/<down|up|left>/<0|1>` (0 = debout, 1 = pas ; droite = gauche en miroir, `flipX`) ; objets `capsule`, `rocher`. Ids : `joueur`, `joueuse`, `rival`, `professeure`, `maman`, `sbire_opale`, `corvin`, les 8 champions (`garance`, `mael`, `selene`, `aubin`, `ysolde`, `lazare`, `brune`, `oswin`), `gardien_1` à `gardien_4`, 18 PNJ (`gamin`, `fillette`, `randonneur`, `pecheur`, `scientifique`, `marin`, `vieil_homme`, `vieille_dame`, `infirmiere`, `vendeur`, `nageur`, `motard`, `dresseuse`, `montagnard`, `ouvrier`, `gentleman`, `campeuse`, `mystique`), `joueur_bouee`, `joueuse_bouee`.
- `trainers` : `portrait/<classe>` et `back/joueur`, `back/joueuse`. Classes : `gamin`, `fillette`, `ecolier`, `randonneur`, `randonneuse`, `campeur`, `campeuse`, `pecheur`, `marin`, `nageur`, `nageuse`, `motard`, `ouvrier`, `scientifique`, `chercheuse`, `dresseur`, `dresseuse`, `montagnard`, `gentleman`, `dame`, `mystique`, `danseuse`, `sbire_opale`, `sbire_opale_f`, plus `rival`, `professeure`, `corvin`, les 8 champions et les 4 gardiens.
- `creatures` : `<espèce>/front`, `<espèce>/back`. `meta.generated` liste les espèces générées, `meta.handDrawn` les 14 dessinées (`fenouillot`, `fenouvert`, `sylvenard`, `braisille`, `fournaise`, `pyrogrue`, `flaquin`, `ondeclat`, `marevor`, `azurel`, `glacerne`, `volcarde`, `fulgorine`, `mirelle`).
- `ui` : `frame/<partie>`, `hp/frame`, `hp/high|mid|low`, `xp/frame`, `xp/fill`, `status/brl|psn|par|som|gel`, `type/<type>` (15, ids sans accent : `metal`), `capsule/full|empty|ko`, `badge/roche|eau|foudre|flore|vent|ombre|feu|arcane`, `icon/<plan>/<0|1>`, `logo/bestiora`, `logo/azur`, `title/azurel`.

Reste
- Prompt 03 : `src/data/creatures.js` doit exporter un tableau (`CREATURES` ou `default`) d'objets `{ id, sprite: { plan, seed, size, features, pattern } }`, puis relancer `npm run atlas`. Les 14 espèces dessinées n'ont pas besoin de `sprite`. `src/data/trainer-classes.js` doit réutiliser les ids de portraits ci-dessus.
- Les noms des 4 Gardiens restent à choisir (prompt 11) ; leurs sprites sont `gardien_1` à `gardien_4`.

Décisions
- Les atlas stockent des métatuiles 16 × 16. Les sources sont écrites en tuiles 8 × 8 répétées (`quad`, `tileRows`), en lignes 16 × 16 ou en formes vectorielles, sans table de tuiles 8 × 8 séparée.
- `town` hérite de `outdoor` (`extends`) : une carte de ville utilise herbe, arbres, eau sans dupliquer les tuiles. `drawMetatile` et `getMetatile` suivent l'héritage.
- Les drapeaux des métatuiles sont copiés dans `tiles.json` : le jeu ne réexécute pas le code des sources au lancement. Drapeau ajouté : `slippery` (sol glacé).
- Les 14 bestioles « à la main » ont été composées forme par forme, retouchées après aperçu, puis figées en lignes de texte dans `src/gfx/sources/creatures/*.js`. Ce texte est la source de référence et se retouche pixel par pixel.
- Personnages : gabarit commun + coiffures (`short`, `spiky`, `long`, `ponytail`, `cap`, `hat`, `bald`, `helmet`, `hood`, `bandana`), tenues (`dress`, `coat`, `shorts`, `swimsuit`), accessoires (`beard`, `backpack`, `glasses`), dans `src/gfx/sources/characters/character-parts.js`.
- Les silhouettes de tous les plans symétriques sont réellement symétriques : les queues des plans symétriques apparaissent derrière le corps (flamme, feuilles, nageoires, piques), pas sur un côté.
- `size` des specs : 1 à 3 (stade d'évolution), échelle 0,62 à 0,98.
- Le cadre de fenêtre est lu depuis `src/gfx/sources/ui/frame.js` par `window-frame.js` (disponible avant le chargement des atlas) et copié dans l'atlas `ui`.
- Glyphe `_` ajouté à la police (les ids de la visionneuse en contiennent).
- Le JSON est lu par `fetch` et le PNG rechargé avec un paramètre anti-cache, ce qui suffit en `file://` (vérifié dans Electron).

Problèmes connus
- Certaines combinaisons générateur peu probables masquent la caractéristique (coquille derrière un fantôme, nageoires derrière les bras d'un golem). À éviter dans les specs du prompt 03.

### 2026-11-12 : prompt 03, données de types, attaques, bestioles et objets

Fait
- `src/data/types.js` : 15 types, icônes `type/<id>`, table commentée relation par relation, `getTypeMultiplier`, `getEffectiveness`. 4 immunités (Normal → Ombre, Foudre → Terre, Toxique → Métal, Terre → Vent), soldes entre −2 et +3.
- `src/data/move-effects.js` : 36 effets fermés, tous utilisés. `src/data/moves.js` : 166 attaques (160 apprenables, 34 de statut, 8 offensives ou plus par type, 6 signatures `exclusiveTo` pour les légendaires et le mythique, `baroud` en `learnable: false` pour le moteur).
- `src/data/creatures.js` : 150 bestioles, `HABITATS`, `CREATURES_BY_ID`. 18 lignées à 3 stades (dont les starters), 34 à 2 stades, 1 lignée à embranchement (Cocolet → Cocomarin / Cocorage par pierre), 20 bestioles sans évolution, 4 légendaires et 1 mythique. Les 5 pierres et 1 évolution par amitié (Toisonnet) sont utilisées.
- `src/data/items.js` (44 objets, effets fermés `ITEM_EFFECTS`), `src/data/trainer-classes.js` (30 classes), `src/data/formulas.js` (stats, `expForLevel`, `levelForExp`).
- `npm run validate` (`tools/validate-data.js`) : vérificateurs indépendants dans `tools/validators/` (ids, types, attaques, bestioles, évolutions, objets, classes, textes), enregistrés dans `tools/validators/index.js`. `tools/forbidden-words.js` : comparaison sans casse ni accents, par mot ou expression entière.
- `npm run bestiary` (`tools/export-bestiary-md.js`) génère `docs/BESTIAIRE.md`.
- Atlas régénéré depuis `src/data/creatures.js` : 136 bestioles générées, 14 dessinées. Planche relue face et dos dans l'ordre des numéros : aucun sprite vide ni cassé. Graines de Cristelan et Névéon changées (corps trop sombre pour des bestioles de neige).
- Tests : types (relations connues, contraintes de la section 5), formules de stats et d'XP calculées à la main, évolutions (cycle, niveau décroissant), validateur complet. 77 tests.

Reste
- Les learnsets ont été générés une fois (même logique pour toutes les espèces : attaques du type réparties du niveau 1 aux 50, attaques Normal selon la puissance, 3 attaques de statut), puis figés dans `creatures.js`. À retoucher à la main si l'équilibrage du prompt 05 le demande.
- La planche a été vérifiée sur le PNG de l'atlas, pas dans la visionneuse Electron.

Décisions
- Seul `GAME_DESIGN.md` fait foi pour les bestioles : `docs/Pokedex/` (bestiaire folklorique) est ignoré à la demande de l'utilisateur.
- Répartition : « 15 / 30 / 15 lignées » donne 120 bestioles, pas 150. Retenu : 18 lignées à 3 stades, 34 à 2 stades, 1 embranchement, 20 isolées, 5 légendaires et mythique (78 lignées).
- Champ ajouté `minLevel` sur chaque bestiole : plus bas niveau de rencontre (sauvage ou par évolution). Le validateur s'en sert pour « 4 attaques au niveau de rencontre » ; les tables de rencontres (prompts 09 à 11) doivent le respecter.
- Formules d'XP dans `src/data/formulas.js` (le prompt) au lieu de `src/battle/logic/experience.js` (game design) : rapide `4n³/5`, moyenne `n³`, lente `5n³/4`.
- `power: 0` pour les attaques à dégâts calculés (fixes, niveau, moitié des PV, K.O. direct, riposte). `accuracy: null` = ne rate jamais, `effectChance: null` = effet systématique.
- Légendaires et mythique : numéros 146 à 150, `catchRate` 3, totaux 590 à 680.
- Noms d'objets : les noms français trop marqués d'une franchise existante cités dans le prompt sont remplacés et ajoutés aux mots interdits : Potion Forte, Grande Potion, Potion Totale, Ranimant, Ranimant Max, Panacée, Infusion, Grande Infusion, Sucre d'Orge, Fil d'Ariane, Baume Froid, Dégivrant, Sel d'Éveil, Liniment. Capsule, Potion, Antidote, Répulsif et les pierres du game design sont gardés.
- Noms de bestioles écartés car trop proches d'espèces existantes : Coconet, Larvelle, Lumivelle, Miasmet, Chandelor, Cabrisson (remplacés par Nymphot, Feuillarve, Lumidanse, Pestelet, Lustrombre, Bouquetor).
- Limites d'affichage : nom d'attaque 12, nom de bestiole 10, catégorie 18, nom d'objet 17 (« Capsule Maîtresse »), nom de classe 12 ; descriptions d'attaque 2 lignes, de bestiole et d'objet 3 lignes de 18. Les caractères doivent exister dans la police : pas de majuscules Â, Ê, Î, Ô (attaques « Âcre » renommées « Fiel »).
- Classes de dresseurs : `portrait: null` pour champion·ne et gardien·ne (portrait propre à chaque dresseur), `name: ''` pour le rival. Corvin a la classe `fondateur_opale`.

Problèmes connus
- Aucun.

### 2026-11-12 : prompt 04, moteur de carte, PNJ, dresseurs et scripts

Fait
- Format de carte documenté dans `docs/MAP_FORMAT.md` : couches en chaînes avec légende par tileset (complétée par carte), motifs 2 × 2 (arbres, tables), `structures` pour les bâtiments, couche `collision` optionnelle (`.` `#` `_`), entités, connexions, rencontres, scripts.
- Modules purs (`src/overworld/`) : `map-loader.js` (légende → métatuiles, drapeaux résolus depuis `tiles.json`), `collision.js` (pas, corniches, eau, bords, ligne de vue), `world.js` (cartes connectées, caméra), `encounters.js`, `actor.js`, `npc.js`, `script-runner.js` (31 commandes, dont `give_badge` en plus de la liste du prompt). `src/state/game-state.js` : drapeaux, sac, équipe, argent, badges, position, Répulsif.
- Scène `OverworldScene` : déplacement case par case (16 frames, course ×2 avec B et les Chaussures), pivot sur appui bref, glace, corniches avec arc et ombre, herbe haute sur les pieds, tuiles animées, grottes sombres, connexions sans transition, warps avec fondu et pas de sortie, PNJ (4 mouvements), panneaux, objets visibles et cachés, déclencheurs, objets de terrain (coupe, poussée, Grappin, surf), dresseurs (« ! », approche, dialogue, combat, drapeau `trainer_<id>`), rencontres sauvages avec Répulsif, transition de combat (3 flashs puis bandes alternées), écran de combat provisoire qui renvoie une victoire.
- Hooks (`src/overworld/hooks.js`) pour l'audio, les combats, les menus, le nom du rival et le choix du starter.
- Données : `src/data/texts/` (table de textes), `src/data/trainers.js` (stub, 1 dresseur de test), `src/data/scripts.js` (scripts globaux), `src/data/field-abilities.js` (objet et badge requis), objet clé `chaussures`.
- 4 cartes de test (`src/data/maps/test/`) : bourg, route, maison, grotte sombre. Le jeu démarre dessus avec `npm run dev` ; un PNJ « testeur » donne les objets de terrain, des badges et un Fenouillot.
- Validateur : cartes (couches, légende, métatuiles, warps, connexions réciproques et bords de même taille, entités, rencontres au-dessus du `minLevel` des espèces), scripts (commandes, champs, références), dresseurs, textes de dialogue. `npm run map-preview` (`tools/map-preview.js`) exporte les cartes en PNG dans `out/maps/`.
- Tests : collisions, corniches, eau, ligne de vue, légende et structures, connexions, caméra, rencontres, script runner avec faux contexte, cas d'erreur du validateur. 95 tests.
- Vérifié dans Electron en pilotant le jeu (Playwright, hors dépôt) : déplacement, entrée et sortie de la maison, déclencheur unique, passage bourg → route sans transition, saut de corniche, coupe, poussée, Grappin dans les deux sens, surf et descente de la Bouée, ramassage d'objets visibles et cachés, dresseur qui repère et combat, rencontre sauvage, grotte sombre et éclairée, glissade sur la glace, échelle de sortie. Aucune erreur dans la console.

Reste
- Course avec B, PNJ en mode `path` et effet de transition vérifiés seulement par le code et des captures ponctuelles, pas par un test automatisé.
- `startBattle` et `startWildBattle` restent provisoires jusqu'aux prompts 05 et 06. Le texte de défaite du dresseur sera affiché par le vrai combat.
- Menu Start, menu debug F1 : prompt 07.

Décisions
- `encounters.rate` est un pourcentage par pas (8 ≈ game design). Table `cave` : toute tuile praticable de la carte.
- Warp : déclenché à l'arrivée sur la case, jamais en y apparaissant. Le pas de sortie suit l'orientation du joueur à l'entrée, ce qui fonctionne pour les portes, paillassons et escaliers sans champ supplémentaire.
- Les PNJ de la carte voisine n'apparaissent qu'une fois la connexion franchie.
- Arbustes coupés et rochers poussés reviennent au rechargement de la carte (pas de persistance).
- Badges requis : Machette → Eau, Lanterne → Foudre, Grappin → Flore, Bouée et Gants de Force → Vent, Cerf-volant → Ombre (dates d'obtention de la section 4).
- Personnages dessinés 4 px au-dessus de leur case ; l'herbe haute recouvre leurs 6 derniers pixels.
- `window.debugGame` exposé en mode dev uniquement (scènes, overworld, état) pour le débogage et les tests pilotés.
- Les cartes hors écran à l'intérieur (plus petites que l'écran) sont centrées sur fond noir ; `border` sert aux cartes extérieures.

Problèmes connus
- Aucun.

### 2026-11-12 : prompt 05, moteur de combat pur et IA

Fait
- `src/battle/logic/` (aucun import de `gfx`, `ui`, `overworld` ni du DOM, vérifié par un test) :
  - `creature.js` : `createCreature(speciesId, level, rng, options)`, `recalculateStats`, `defaultMoves` (4 dernières attaques du learnset), `evolveCreature`.
  - `battle-state.js` : état sérialisable `{ kind, trainer, turn, sides: [joueur, ennemi], runAttempts, outcome, pending, participants, leveledUp }` ; chaque côté `{ party, active, stages (−6 à +6), volatile, screens, potionsUsed }`.
  - `damage.js` (formule de la section 5, STAB, critique, aléa, paliers de précision et d'esquive), `status.js` (altérations et fin de tour), `effects/` (un module par famille : `damage`, `status`, `stats`, `support` ; les 36 effets), `capture.js`, `experience.js`, `items.js`, `ai.js`, `engine.js`.
- API du moteur : `createBattle(config)`, `battleStartEvents(state)`, `getAvailableActions(state, side)`, `resolveTurn(state, playerAction, enemyAction, rng)` → `{ state, events }`, `answerLearnMove(state, slot | null)`, `chooseSwitch(state, index)`, `currentPending(state)`. L'état reçu n'est jamais modifié (copie par `structuredClone`).
- IA : `chooseAction(state, side, rng, level?)`, `chooseReplacement`, `aiLevel(state)` : `wild`, `basic`, ou `smart` pour champions, Gardiens et Corvin (surchargeable par `trainer.ai`).
- `npm run simulate -- --seed 42` (`tools/simulate-battle.js`) : deux équipes IA, journal lisible, reproductible. Options `--player` et `--enemy` (`espece:niveau,…`), `--ai`, `--player-ai`, `--kind`.
- Tests : 81 tests de combat (dégâts calculés à la main, chaque effet, chaque altération, ordre du tour, capture à seed fixe, fuite, XP sur plusieurs niveaux, apprentissage, fin de combat, objets, IA, Lutte, couverture des effets, pureté des imports). 176 tests au total.

Contrat des événements
Chaque événement est un objet `{ type, ... }`, dans l'ordre d'affichage. `side` vaut 0 (joueur) ou 1 (ennemi) ; `index` est un indice dans l'équipe de ce côté. Aucun texte formaté : seulement des ids (`move`, `species`, `item`, `status`) et des nombres.

| type | Champs | Sens |
|---|---|---|
| `switch_in` | side, index, species, level, hp, maxHp | Une bestiole entre (début, changement, remplacement) |
| `switch_out` | side, index | Une bestiole encore debout revient |
| `move_used` | side, move | Annonce de l'attaque |
| `move_failed` | side, move, reason | `no_effect`, `hp_full`, `target_awake`, `level_too_low`, `nothing_to_counter`, `no_target` |
| `charging` | side, move, semiInvulnerable | 1er tour d'une attaque en 2 tours |
| `miss` | side, move | L'attaque rate |
| `protected` | side | La cible se protège |
| `damage` | side, amount, hp, maxHp, source, move? | `source` : `move`, `recoil`, `struggle`, `self_destruct`, `confusion`, `trap`, `leech` |
| `critical` | side | Coup critique sur ce côté (après le `damage`) |
| `effectiveness` | side, value | 0, 0,25, 0,5, 2 ou 4 (absent si ×1) |
| `hits` | count | Nombre de coups d'une attaque multiple |
| `ohko` | side | K.O. en un coup |
| `heal` | side, amount, hp, maxHp, source, index? | `move`, `drain`, `leech`, `item` |
| `status_applied` | side, status, badly, rest? | `brl`, `psn` (`badly` = grave), `par`, `som`, `gel` |
| `status_cured` | side, status, reason, index? | `wake`, `thaw`, `rest`, `item` |
| `status_prevented` | side, reason | `asleep`, `frozen`, `paralyzed`, `flinch`, `recharging` |
| `status_damage` | side, status, amount, hp, maxHp | Brûlure ou poison en fin de tour |
| `confused` | side | Annonce de la confusion avant d'agir |
| `confusion_hit` | side | Se blesse dans sa confusion (suivi d'un `damage`) |
| `volatile_applied`, `volatile_ended` | side, volatile, move? | `confusion`, `leech`, `trap`, `focus`, `protect` |
| `stat_change` | side, stat, delta, stage, blocked | `blocked: true` quand le palier est déjà à ±6 |
| `stats_reset` | - | Grand Air |
| `screen_up`, `screen_down` | side, category | `physical` ou `special` |
| `faint` | side, index, species | K.O. |
| `need_switch` | side | Le joueur doit choisir une bestiole (`chooseSwitch`) |
| `item_used` | side, item, target | Objet consommé (l'appelant le retire du sac) |
| `item_failed` | side, item, target?, reason | Objet non consommé : `hp_full`, `no_status`, `wrong_status`, `not_fainted`, `fainted`, `pp_full`, `no_target`, `unusable` |
| `revive`, `pp_restored` | side, index, … | Effets d'objets |
| `capture_blocked` | item | Capsule contre un dresseur (non consommée) |
| `capture_shake` | count | Secousse 1 à 3 |
| `capture_success`, `capture_fail` | species, index / shakes | Résultat de la capture |
| `run_success`, `run_fail`, `run_blocked` | reason? | Fuite (`trainer`, `trapped`) |
| `exp_gain` | side, index, amount | XP gagnée |
| `level_up` | side, index, level, stats, previousStats | Montée de niveau |
| `move_learned` | side, index, move | Appris directement (moins de 4 attaques) |
| `learn_move_prompt` | side, index, move | Choix du joueur : l'UI met la lecture en pause et appelle `answerLearnMove` |
| `move_forgotten`, `move_not_learned` | side, index, move, oldMove? | Réponse à `answerLearnMove` |
| `evolution_pending` | side, index, species, target | À appliquer après le combat avec `evolveCreature` |
| `money_gain` | amount | Victoire contre un dresseur : niveau max × `moneyBase` |
| `battle_end` | outcome | `win`, `lose`, `caught`, `fled` |

Décisions
- Ordre du tour : fuite, puis changements et objets (joueur d'abord), puis priorité, puis vitesse (paralysie ÷ 4), égalité au hasard.
- Fin de tour, ordre fixe : côté joueur puis côté ennemi ; pour chaque côté brûlure ou poison, piège, vampirisme. Ensuite peur et protection sont effacées et les écrans décomptés.
- Sommeil 1 à 3 tours (Sieste : 2) ; au réveil, la bestiole agit. Gel : 20 % de dégel avant d'agir, ou dégel si touchée par une attaque Feu. Paralysie : 25 % d'échec. Confusion 1 à 4 tours, 1/3 de chances de se frapper (puissance 40, sans type). Poison grave : n/16 croissant, remis à 1 au changement. Piège 2 à 5 tours, 1/8 par tour (Cerceau Feu et Remous passent de [4, 5] à [2, 5]).
- Immunités de statut : Feu (brûlure), Givre (gel), Toxique et Métal (poison), Foudre (paralysie) ; Flore insensible à Germe Voleur.
- Ajouts au game design : brûlure = dégâts physiques ÷ 2 ; écrans = dégâts ÷ 2 sauf critique ; un critique ignore les baisses de l'attaquant et les hausses du défenseur.
- XP : floor(baseExp × niveau / 7), ×1,5 contre un dresseur, partagée entre les participants encore debout. Points d'entraînement de l'espèce battue à chaque participant (plafond 255). +3 d'amitié par niveau gagné.
- Fuite : floor(vitesse × 128 / vitesse sauvage) + 30 × tentatives précédentes, sur 256.
- Lutte : Baroud (Normal, puissance 50), recul de 1/4 des PV max du lanceur.
- IA `smart` : Grande Potion sous 25 % de PV (2 par combat et par côté) ; change de bestiole si elle est menacée à ×2 et ne peut pas infliger 30 % des PV adverses, vers un remplaçant qui ne craint pas les types adverses.

Reste
- L'équipe du joueur dans `game-state.js` (`{ creature, level }` créé par `give_creature`) n'utilise pas encore `createCreature` : à brancher avec l'interface de combat (prompt 06).
- Équilibrage fin (puissances, learnsets) à faire avec le simulateur.

Problèmes connus
- Aucun.

### 2026-11-12 : prompt 06, interface et animations de combat

Fait
- `src/battle/ui/` :
  - `battle-scene.js` : scène de combat (intro sauvage ou dresseur, menus ATTAQUE / SAC / ÉQUIPE / FUITE, menu d'attaque avec type et PP, lecture des événements, choix forcés, sortie, écriture dans `game-state`).
  - `event-player.js` : un gestionnaire par type d'événement du prompt 05 (texte, animation, son).
  - `battle-hud.js` (mise en page 160 × 144), `move-animations.js` (15 animations par type, hausse et baisse de stat, étoiles de capture), `bag-screen.js` (poches objets et capsules, objets de combat seulement), `battle-setup.js` (hooks `startBattle` et `startWildBattle` : transition, combat, évolutions).
- `src/ui/` : `party-screen.js` (écran d'équipe minimal, remplacé au prompt 07), `move-list-screen.js` (liste d'attaques avec détails), `name-entry.js` (grille de caractères, 10 max), `evolution-scene.js` (silhouettes qui alternent de plus en plus vite, B annule), `learn-move.js` (dialogue « oublier une attaque », partagé entre combat et évolution), `creature-widgets.js` (barres PV et XP, statut), `menu-cursor.js` (curseur et `PromiseScene`).
- Textes de combat : `src/data/texts/battle-fr.js` (une clé par événement ou variante), vérifiés par le validateur. Variables ajoutées : `{MOVE}`, `{TARGET}`, `{TRAINER}`, `{STAT}`.
- `game-state.js` : l'équipe contient de vraies instances de bestioles (`addCreature` vers l'équipe ou le stockage), `storage`, `bestiary` (`seen`, `caught`), `healParty`. `give_creature` crée l'instance avec `createCreature`.
- Menu debug F1 (mode dev, sur la carte) : combat contre n'importe quelle espèce et niveau, dresseur IA aléatoire (3 bestioles), équipe de test, soin.
- Le dresseur de test a 3 bestioles.
- Tests : helpers purs de l'interface (curseur, barres, saisie de nom, sac de combat, évolution, état du jeu). 184 tests.
- Vérifié dans Electron en pilotant le jeu : combat sauvage complet (intro, menus, attaque, barres de PV et d'XP), montée de niveau avec fenêtre de stats et évolution Pivelin → Grivelin, apprentissage d'une 5e attaque (Tambourin remplace Égratignure), capture avec la Capsule Maîtresse et surnom, Bestiaire mis à jour, combat de dresseur avec K.O. et changement forcé puis victoire et argent (+90), défaite avec message, argent divisé par deux et retour au point de départ des cartes de test.

Reste
- La question « Changer de bestiole ? » avant l'envoi suivant du dresseur, la fuite et les objets de soin en combat sont écrits mais n'ont pas été joués de bout en bout dans Electron.
- Musique et cris : seulement les hooks (`playMusic`, `playSfx('cry_<espèce>')`, `hit`, `faint`, `capsule_*`, `exp`, `level_up`, `evolution`), branchés au prompt 08.
- Écran d'équipe complet, sac hors combat : prompt 07.

Décisions
- Les textes de combat sont dans `src/data/texts/battle-fr.js` (dossier `texts/` existant) au lieu de `src/data/text/`.
- Boîte de texte de combat : messages d'action enchaînés automatiquement (0,6 s, A accélère), messages importants (super efficace, K.O., XP…) attendent A. Vitesse = vitesse de texte × 1,5.
- Menu principal en grille 2 × 2 sur toute la largeur de la boîte du bas ; le menu d'attaque masque le cadre du joueur et affiche type et PP au-dessus.
- L'animation de type d'une attaque n'est jouée que si elle touche (lecture anticipée des événements suivants).
- Défaite : le message et la perte de la moitié de l'argent sont dans la scène de combat (`onLose: 'blackout'`) ; l'overworld soigne et ramène à la dernière Halte. `onLose: 'continue'` : ni perte d'argent ni retour.
- Changement libre quand le dresseur annonce sa bestiole suivante : nouvelle fonction moteur `freeSwitch(state, index)`.
- Les évolutions sont jouées après la sortie du combat, avant le retour sur la carte. Les évolutions par pierre (`canCancel: false`) seront déclenchées depuis le sac (prompt 07).
- Pas de combat sans bestiole en forme : aucune rencontre ni dresseur, et un dresseur à qui l'on parle répond `no_healthy_creature`.
- `window.debugGame.hooks` exposé en mode dev pour les tests pilotés.

Problèmes connus
- Aucun.

### 2026-11-12 : prompt 07, menus, sac, Bestiaire, Halte, Comptoir et stockage

Fait
- Composants (`src/ui/components/`) : `MenuLayer` (pile de fenêtres au-dessus de la scène, `open`, `show` pour les fenêtres passives, `openAndKeep` pour garder un menu parent visible), `ListMenu` (défilement, flèches haut et bas), `GridMenu`, `ConfirmWindow`, `QuantityWindow` (±1, ±10, total), `MoneyWindow`.
- Logique pure (`src/state/`) : sac plafonné à 99 (`addItem` renvoie la quantité ajoutée), `storage.js` (12 boîtes de 30, dépôt avec au moins une bestiole en forme dans l'équipe, retrait, déplacement, libération, renommage), `field-items.js` (soins, Ranimant, pierres, Sucre d'Orge, vitamines plafonnées à 100, Répulsif), `shop.js`, `daycare.js`, `trade.js`, `options.js`. Nouveaux champs d'état : `storage`, `daycare`, `visitedTowns`, `escapePoint`, `playTime`.
- Écrans : menu Start (`start-menu.js`, entrées masquées tant que non débloquées : BESTIAIRE avec le drapeau `has_bestiary`, BESTIOLES avec une équipe), équipe avec icônes animées et actions RÉSUMÉ / ORDRE / CERF-VOLANT (`party-menu.js`), résumé sur 3 pages (`summary-screen.js`), sac à 3 poches avec UTILISER / JETER (`bag-menu.js`), Bestiaire avec fiche et carte des zones (`bestiary-screen.js`, `src/data/region.js`), carte de dresseur (`trainer-card.js`), Comptoir (`shop-menu.js`), stockage (`storage-menu.js`), Pension et échanges (`services.js`), options (`options-screen.js`), écran titre (`title-scene.js`).
- Overworld : START ouvre le menu, A face au terminal ouvre le stockage, 1 XP par pas à la Pension, Fil d'Ariane (point de sortie mémorisé en entrant dans une grotte ou un lieu `special`), Cerf-volant (villes avec `flyPoint` visitées), temps de jeu.
- Scripts : `call: 'halte_heal'` (infirmière, flash blanc, soin, point de retour), nouvelles commandes `set_respawn` et `trade` (`{ wanted, offer: { creature, level, nickname, originalTrainer }, flag }`), `open_menu` branché sur `shop` (avec `params.stock`, entrées conditionnées par badge), `storage`, `daycare`, `party`, `bag`, `bestiary`.
- Options appliquées en direct (vitesse du texte, animations et style de combat, palette, taille de fenêtre, plein écran, touches) et écrites dans `userData/options.json` par le processus principal (écriture via fichier temporaire puis renommage). Volumes stockés pour le prompt 08.
- Hors mode dev, le jeu démarre sur l'écran titre ; NOUVELLE PARTIE lance la carte de départ de test. En mode dev, le jeu démarre toujours sur la carte et le menu F1 gagne une entrée « Atlas » (la scène de démo du prompt 01 est supprimée).
- Cartes de test : Halte dans le bourg (infirmière, vendeur, terminal), pension sur la route, échangeur dans le bourg, point de vol du bourg. Le kit de test donne aussi Cerf-volant, potions, Pierre Lunaire, Sucre d'Orge, Fil d'Ariane, capsules, le badge Ombre et une Lumidanse.
- Tests : inventaire, stockage, objets de terrain, Comptoir, Pension, échange (12 nouveaux tests, 196 au total).
- Vérifié dans Electron en pilotant le jeu : menu Start, sac et Pierre Lunaire (Lumidanse évolue en Lumirande), Bestiaire (liste, fiche, zones), carte de dresseur, options, soin à la Halte avec point de retour, achat et vente au Comptoir, dépôt et retrait au stockage, ordre et résumé de l'équipe, Cerf-volant, Fil d'Ariane, dépôt et retrait à la Pension (300 pièces pour 2 niveaux), échange contre « Pipistrou », écran titre puis nouvelle partie.

Reste
- SAUVER écrit pour l'instant l'état dans le stockage du navigateur (hook `saveGame`) et CONTINUER le relit ; la vraie sauvegarde atomique sur disque arrive au prompt 12.
- Remappage des touches et options de fenêtre testés seulement par le code.

Décisions
- Libellés sans majuscules Î, Â, Ê, Ô (absentes de la police) : boîtes « Boîte 1 », LIBÉRER au lieu de RELÂCHER, CHANGER pour la boîte courante, TAILLE pour l'échelle de fenêtre.
- Le Super Bonbon et la Corde de Sortie du prompt sont le Sucre d'Orge et le Fil d'Ariane (noms choisis au prompt 03).
- Fil d'Ariane : utilisable dans les cartes `cave`, `special` ou marquées `dungeon: true` ; il ramène devant l'entrée par laquelle on est entré depuis l'extérieur.
- Cerf-volant : villes = cartes ayant un `flyPoint`, inscrites à la première visite ; requiert l'objet et le badge Ombre, impossible dans un donjon.
- Vitamines plafonnées à 100 points d'entraînement par stat (le combat peut aller jusqu'à 255).
- Une évolution inscrit la nouvelle espèce comme capturée au Bestiaire.
- La carte des zones du Bestiaire (`src/data/region.js`) liste déjà les ids de carte prévus pour les prompts 09 à 11.

Problèmes connus
- Aucun.

### 2026-11-13 : prompt 08, synthé chiptune, pistes originales et effets

Fait
- `src/audio/` : `synth.js` (Web Audio : 2 carrés à 12,5 / 25 / 50 / 75 %, table d’onde 32 × 4 bits, bruit LFSR 15 et 7 bits, enveloppes, glissando sur la voie 1, bus musique et effets, emprunt de voie par les effets), `sequencer.js` (ordonnancement 100 ms en avance sur l’horloge audio, bouclage, fondu, position pour reprendre), `track-parser.js` (format texte pur et testé, erreurs avec le symbole fautif, barres de mesure vérifiées), `cries.js` (cris procéduraux), `sfx.js` (28 effets), `audio-system.js` (musique, reprise de la piste de carte après un combat, jingles qui interrompent puis rendent la musique, volumes, démarrage au premier input, pause hors focus).
- 30 pistes originales dans `src/audio/tracks/` : 20 thèmes (pistes de carte de 31 à 46 s, combats de 48 à 51 s, `ending` de 50 s), 7 jingles (objet, objet clé, badge, Halte, capture, évolution, niveau), 3 boucles de repérage par un dresseur. Le motif du jeu (ré, la, sol, si, la) ouvre `title`, revient plus lent dans `hometown` et encadre `ending`.
- Format documenté dans `docs/AUDIO_FORMAT.md`.
- Branchements : musique par carte, repérage (« ! » puis boucle selon `musicIntro`), thème de combat selon la classe (ou `trainer.music`), fanfare de victoire, sons de menus (curseur, validation, annulation), portes, escaliers, téléporteurs, herbe, saut, surf, coupe, rocher, achat, sauvegarde, coups (normal, super efficace, peu efficace), boost, baisse, K.O., capsule, fuite, XP, cris en combat et dans le Bestiaire, jingles d’objet, de badge, de soin, de capture, d’évolution et de niveau. Volumes des options appliqués aux bus.
- `src/data/music.js` : musiques de repérage, de combat et de victoire.
- Menu F1 : jukebox (pistes, effets, cri de l’espèce choisie).
- Validateur : toutes les pistes et tous les effets s’analysent, durées minimales, présence du motif, pistes référencées par les cartes, classes et dresseurs existantes.
- Tests : parser (notes, durées, réglages, répétitions imbriquées, bouclage, erreurs), minutage, enveloppe, LFSR, cris (déterminisme, durée, 150 cris distincts, évolution plus grave). 206 tests.
- Vérifié dans Electron : aucune erreur console, passage route_1 → battle_wild → cave.

Reste
- L’écoute (absence de craquement, stabilité du tempo sur 5 minutes, effet sans coupure audible) n’a pas pu être jugée à l’oreille pendant la session : à valider en jouant. La conception vise ces critères (rampes d’attaque et de relâche de 2 à 4 ms, ordonnancement sur l’horloge audio, emprunt limité aux voies de l’effet).
- `intro_professor` et `ending` seront appelées par les scripts des prompts 09 et 11.

Décisions
- Commandes du format choisies pour ne pas se confondre avec les notes : `P` rapport cyclique, `S` enveloppe, `H` glissando (`D`, `E`, `G` sont des noms de notes).
- 30 pistes au lieu de 18 : les 7 jingles et 3 boucles de repérage sont des pistes à part. La musique de la carte maison passe de `house` (inexistante) à `hometown`.
- La piste de carte reprend là où elle s’était arrêtée après un combat ; elle repart du début en changeant de carte.
- Pas de musique propre à la scène d’évolution : la musique en cours continue, puis le jingle d’évolution.
- `window.debugGame.audio` exposé en mode dev pour les vérifications automatiques.

Problèmes connus
- Aucun.

### 2026-11-14 : prompt 09, monde de l'introduction à l'arène 4

Fait
- Moteur :
  - scène d'introduction (`src/ui/intro-scene.js` : Pr Morvan, bestiole de présentation, garçon ou fille, nom du joueur et de la rivale saisis ou choisis parmi 3 propositions) ; NOUVELLE PARTIE démarre dans la chambre (`GAME_START`), réapparition devant Maman avant toute Halte (`HOME_RESPAWN`) ;
  - choix du starter (`src/ui/starter-choice.js`, sprite et confirmation) : `choose_starter` donne la bestiole niveau 5 et pose `starter_<espèce>` ;
  - commande `battle` avec branches `won` / `lost` ; la musique de la carte reprend après un combat scripté ;
  - dresseurs : `lastText` (réplique avant la dernière bestiole), `partyByStarter` (équipe de la rivale selon le starter du joueur), nom de la rivale dans le combat, variable `{TYPE}` ;
  - sprite d'objet `barriere` ; les objets (`rocher`, `barriere`) peuvent servir de PNJ immobiles (obstacles d'énigme) ;
  - menu F1 : téléportation vers n'importe quelle carte, badge suivant avec son objet de terrain ; `npm run dev -- --newgame` démarre sur l'écran titre.
- Données par zone : `src/data/maps/<zone>/`, `src/data/trainers/<zone>.js`, `src/data/texts/<zone>.js` (zones `debut`, `bois`, `port`, `cendrelune`), gabarits `halte`, `comptoir`, `house` (`src/data/maps/interiors.js`), aides `trainer` et `rival` (`src/data/trainers/helpers.js`).
- Contenu : 50 cartes (Hameau-de-Lys à la Tour de la Mémoire, intérieurs, 4 arènes, usine Opale, 5 étages de la Tour, cour de la Centrale fermée), 92 dresseurs, 63 objets au sol (dont 23 cachés), 71 espèces capturables, 2 échanges PNJ, pension. Scénario complet : professeure, starter, rivale 1, colis, Bestiaire, Syndicat dans le Bois, rivale 2, usine Opale, Lanterne, rivale 3, lieutenant Gerfaut, apparition de Corvin Halvard, Grappin. Détails, verrous et drapeaux dans `docs/WORLD_MAP.md`.
- Énigmes d'arène : plaques qui écartent des rochers (Roche), dalles glissantes entre des bassins (Eau), interrupteurs qui coupent des barrières (Foudre), labyrinthe de haies à couper (Flore).
- Validateur : drapeaux lus mais jamais posés (`tools/validators/flags.js`), dresseurs utilisés par aucune carte ni aucun script, équipes par starter, attaques imposées, texte `lastText`.
- `npm run balance` (`tools/balance-check.js`) : 200 combats par starter et par champion ou rival, équipe « joueur attendu » = starter + 2 captures des zones traversées. Résultats (moyenne, puis Fenouillot / Braisille / Flaquin) : rivale 1 69 % (72/66/69), Garance 73 % (77/45/98), rivale 2 75 % (39/97/90), Maël 72 % (91/25/99), Sélène 73 % (62/73/83), Aubin 68 % (71/100/33), rivale 3 78 % (63/72/100).
- Région du Bestiaire : zones des nouvelles routes, du Tunnel, de l'usine et de la Tour ; zones de test retirées.
- Tests : `tests/world.test.js`, branches de combat et starter dans `tests/script-runner.test.js` (212 tests).
- Vérifié dans Electron en pilotant le jeu : intro complète jusqu'à la chambre ; sortie du Hameau arrêtée par la professeure, labo, choix du starter, combat contre la rivale ; colis au Comptoir, Bestiaire et 5 capsules ; les 4 champions (badge et pierre), Machette, usine Opale, Lanterne, rivale 3, sommet de la Tour (Corvin, Grappin) ; verrous de Bourg-Sablon, de la grotte, du tunnel et de la Tour sans la condition. Aucune erreur console. Énigme de glace de l'arène Eau vérifiée par parcours exhaustif (soluble, aucune position sans retour).

Reste
- Le parcours complet à la main, de bout en bout avec une équipe réaliste, n'a pas été fait : les étapes ont été jouées par téléportation avec une équipe de test, chaque carte relue sur son aperçu (`npm run map-preview`).
- L'équilibrage reste sensible au starter (Braisille face à la Roche et à l'Eau, Flaquin face à la Flore), comme attendu avec la table des types ; la moyenne est dans la cible.

Décisions
- Production des 4 zones en parallèle, à partir d'un contrat commun (`docs/WORLD_MAP.md` : tailles, passages des connexions, coordonnées des liaisons entre zones).
- Textes dans `src/data/texts/<zone>.js` (dossier existant) au lieu de `src/data/text/fr/`. Format des dresseurs existant gardé (`creature`, `intro`, `defeat`, `after`), produit par `trainer()`.
- Les routes avec bâtiment utilisent le tileset `town` (`clearTile: 'grass'`), `outdoor` n'ayant pas les tuiles de bâtiments. L'arène Eau utilise le tileset `cave` (eau et glace), l'arène Flore `outdoor`.
- La Tour n'a pas d'escalier : dalles `X` entre les étages.
- Badges : Roche ouvre la Grotte des Cascades (garde de la Route 3), Eau la Machette, Foudre la Lanterne, Flore le Grappin et la Tour. Les bestioles échangées obéissent toujours. L'arène Foudre est fermée tant que l'usine Opale n'est pas libérée.
- Récompenses des champions : Pierre Lunaire, Pierre Marine, Pierre Orage, Pierre Solaire.
- Rivale 1 : son starter ne connaît que des attaques de base (sinon l'avantage de type décide seul du combat) et son niveau varie selon le starter du joueur. Le simulateur joue le joueur sans objet pour ce combat, avec l'IA `smart` (2 soins) ensuite.
- Classe ajoutée : `lieutenant_opale` (Brisac à l'usine, Gerfaut à la Tour).
- Les PNJ de cinématique sont affichés par un drapeau `*_visible` posé juste avant `show_actor`, et cachés ensuite par le drapeau de fin d'événement.

Problèmes connus
- Pour le prompt 10 : ouvrir la Route 7 (ouvrier du bord est de Cendrelune, à cacher par un drapeau) et la Centrale (porte scellée de la cour de la Route 6, à remplacer par un warp).

