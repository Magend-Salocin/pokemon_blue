# Avancement

Chaque session d'implémentation ajoute une entrée en bas de ce fichier : prompt exécuté, ce qui est fait, ce qui reste, décisions prises hors du game design, problèmes connus.

| Prompt | Statut |
|---|---|
| 01 Socle Electron et moteur | fait |
| 02 Graphismes et atlas | à faire |
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
