# Prompt 01 : socle Electron et moteur de jeu

## Contexte

Tu construis Bestiora Azur, un RPG original de capture de créatures en pixel art 4 teintes, sous Electron. Le dépôt ne contient que la documentation.

Lis d'abord en entier `docs/GAME_DESIGN.md`, `docs/ARCHITECTURE.md` et `docs/PROGRESS.md`. Ils font foi. Respecte la section 1 du game design (originalité).

## Objectif

Poser le socle technique sur lequel toutes les étapes suivantes s'appuieront : application Electron, boucle de jeu, rendu à l'échelle, entrées, pile de scènes, police pixel et boîte de dialogue.

## À réaliser

1. **Projet**
   - `package.json` avec les scripts de `docs/ARCHITECTURE.md` (`start`, `dev`, `test`, `atlas`, `validate`, `dist` ; ceux sans contenu affichent un message « non implémenté » pour l'instant).
   - `.gitignore` (node_modules, dist, out).
   - Dépendances de dev : `electron`, `electron-builder`, `pngjs`.

2. **Electron** (`electron/main.js`, `electron/preload.js`)
   - Fenêtre 640 × 576 (échelle ×4) redimensionnable, fond noir, sans menu en production.
   - `contextIsolation: true`, `nodeIntegration: false`, CSP stricte dans `index.html`.
   - Preload exposant `window.bestiora` avec `isDev`, `save(json)`, `load()`, `toggleFullscreen()`. `save`/`load` peuvent être des stubs IPC à ce stade (implémentés au prompt 12), mais le canal IPC doit exister.
   - `F11` bascule en plein écran.

3. **Moteur** (`src/engine/`)
   - `constants.js` : `SCREEN_WIDTH = 160`, `SCREEN_HEIGHT = 144`, `TILE = 8`, `METATILE = 16`, `FPS = 60`.
   - `loop.js` : pas fixe à 60 Hz avec accumulateur, protection contre la spirale de mort (max 5 mises à jour par frame), pause quand la fenêtre perd le focus.
   - `renderer.js` : canvas interne 160 × 144, recopié sur le canvas visible avec le plus grand facteur entier possible, centré, bandes noires ; `imageSmoothingEnabled = false`.
   - `input.js` : boutons logiques `up, down, left, right, a, b, start, select` ; états `isDown`, `justPressed`, `justReleased` ; répétition automatique pour les menus (délai 300 ms, puis toutes les 80 ms) ; clavier configurable ; manette via Gamepad API.
   - `scene-manager.js` : pile `push`, `pop`, `replace` ; propriétés de scène `transparent` et `blocksInput` ; transitions de fondu (vers noir ou blanc, durée paramétrable) qui renvoient une Promise.
   - `tween.js` et `timer.js` : utilitaires simples, pilotés par `update(dt)`.
   - `rng.js` : `createRng(seed)` (mulberry32) avec `next()`, `int(min, max)`, `chance(p)`, `pick(array)`, `weighted(entries)`.

4. **Palette et police** (`src/gfx/`)
   - `palette.js` : les 4 couleurs du game design + les 4 palettes alternatives (Azur, Sépia, Gris, Nuit), palette active modifiable.
   - `font.js` : police 8 × 8 dessinée en sources texte (même format que les sprites : `'0'-'3'` et `'.'`). Glyphes : A-Z, a-z, 0-9, ponctuation courante, accents français (é è ê ë à â ç î ï ô ù û œ É È À Ç), « », …, symboles ♂ ♀, flèche de curseur ▶, flèche de défilement ▼, symboles PV et Nv. Rendu en dessinant les glyphes dans un canvas cache à la palette active.
   - `drawText(ctx, text, x, y, colorIndex)` et `measureText(text)`.

5. **Boîte de dialogue** (`src/ui/dialog-box.js`)
   - Cadre de 160 × 48 en bas d'écran, 2 lignes de 18 caractères.
   - Affichage lettre par lettre (vitesse réglable : lent, moyen, rapide), A accélère ou passe à la suite, ▼ clignotant quand une page attend.
   - Découpage automatique des mots en lignes et pages ; `\n` force une nouvelle ligne, `\f` une nouvelle page.
   - Variables de texte : `{PLAYER}`, `{RIVAL}`, `{CREATURE}`, `{ITEM}`, `{NUMBER}`, remplacées depuis un contexte.
   - Variante question Oui/Non qui renvoie une Promise.
   - Cadre de fenêtre réutilisable (`src/ui/window-frame.js`) avec coins et bords en tuiles 8 × 8, utilisé par tous les menus futurs.

6. **Écran de démonstration**
   - `src/main.js` lance une scène de test : fond à la palette, texte « BESTIORA AZUR », puis une boîte de dialogue de 3 pages avec une question Oui/Non, et l'affichage de la réponse.
   - `Select` + `Start` change de palette (vérification visuelle).

7. **Tests** (`tests/`)
   - `rng.test.js` : reproductibilité, bornes.
   - `text-layout.test.js` : découpage en lignes/pages, variables, accents.
   - La logique de découpage de texte doit donc être dans un module pur (`src/ui/text-layout.js`).

## Critères d'acceptation

- `npm install`, `npm start` ouvrent la fenêtre et affichent la démo nette, sans flou, à l'échelle entière, quel que soit le redimensionnement.
- Les accents s'affichent correctement dans la boîte de dialogue.
- Clavier et manette fonctionnent ; la répétition auto fonctionne dans la question Oui/Non.
- `npm test` passe.
- Aucune erreur dans la console DevTools (`npm run dev`).

## Hors périmètre

Sprites, cartes, combat, audio, sauvegarde réelle.

## Fin de session

Mets à jour `docs/PROGRESS.md` (statut + entrée de journal : fait, reste, décisions), puis crée un commit `feat: socle Electron, moteur et boîte de dialogue`.
