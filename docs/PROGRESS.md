# Avancement

Chaque session d'implémentation ajoute une entrée en bas de ce fichier : prompt exécuté, ce qui est fait, ce qui reste, décisions prises hors du game design, problèmes connus.

| Prompt | Statut |
|---|---|
| 01 Socle Electron et moteur | fait |
| 02 Graphismes et atlas | fait |
| 03 Données de jeu | à faire |
| 04 Moteur de carte | à faire |
| 05 Logique de combat | à faire |
| 06 Interface de combat | à faire |
| 07 Menus et systèmes | à faire |
| 08 Audio | à faire |
| 09 Monde, partie 1 (arènes 1 à 4) | à faire |
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
