# Prompt 12 : sauvegarde, finition et packaging

## Contexte

Lis d'abord `docs/GAME_DESIGN.md`, `docs/ARCHITECTURE.md` (section Sauvegarde) et `docs/PROGRESS.md`. Le jeu est complet en contenu.

## Objectif

Rendre le jeu fiable et distribuable : sauvegarde robuste, finitions visuelles et sonores, performances, accessibilité de base et installeurs.

## À réaliser

1. **Sauvegarde** (`src/save/`, `electron/main.js`)
   - Format versionné décrit dans `docs/ARCHITECTURE.md`, sérialisation et désérialisation pures et testées (aller-retour identique sur un état complet).
   - Écriture atomique dans `userData` (fichier temporaire + renommage), copie de secours `save.bak.json`, chargement de la copie si le principal est corrompu, message clair si les deux le sont.
   - Migration : table de fonctions `migrations[version]`, test avec une sauvegarde v1 fictive.
   - SAUVER dans le menu : résumé (nom, badges, Bestiaire, temps de jeu), confirmation, « Sauvegarde en cours… ne pas éteindre », son.
   - Pas de sauvegarde possible pendant un script ou dans la Ligue après l'entrée.
   - Temps de jeu compté uniquement fenêtre active.

2. **Finitions visuelles**
   - Toutes les transitions (portes, combats, Cerf-volant, évolution) sont fluides et de durée cohérente.
   - Vérifie que chaque texte du jeu tient dans sa fenêtre (script `tools/check-text-fit.js` qui mesure avec la police et échoue en cas de dépassement ; ajouté à `npm run validate`).
   - Écran titre final soigné, animation d'Azurel, défilement de bestioles aléatoires sur l'écran titre.
   - Icône d'application originale (Azurel stylisé) en `.png`, `.ico`, `.icns` générée depuis les sources pixel.

3. **Performances**
   Profile une carte dense et un combat avec animations : 60 images/s stables, aucune allocation par frame évitable dans les boucles de rendu, chargement initial < 2 s sur une machine moyenne.

4. **Robustesse**
   - Gestionnaire d'erreurs global : en cas d'exception, écran d'erreur en pixel art avec le message, proposition de recharger la dernière sauvegarde ; journal dans `userData/logs/`.
   - Perte de focus : pause du jeu et de l'audio.
   - Le menu debug F1 est totalement absent en production (`app.isPackaged`).

5. **Accessibilité et confort**
   Remappage complet clavier et manette (déjà dans les options, vérifier), texte instantané en option, palette à fort contraste (« Nuit » en contraste maximal), réduction des flashs (option qui remplace les clignotements de combat par un léger décalage).

6. **Packaging** (`electron-builder`)
   - Cibles : Windows (NSIS + portable), macOS (dmg), Linux (AppImage).
   - `npm run dist` construit au minimum la cible de la plateforme courante.
   - Nom du produit : « Bestiora Azur », `appId: fr.bestiora.azur`, version 1.0.0.
   - `README.md` à la racine : présentation, captures (générées via un script qui capture le canvas), commandes, contrôles, emplacement des sauvegardes, comment retoucher les atlas PNG, licence du code.

## Critères d'acceptation

- Sauvegarder, quitter brutalement (kill du processus pendant l'écriture simulée), relancer : la sauvegarde ou sa copie se charge.
- `npm run dist` produit un installeur fonctionnel sur Windows ; le jeu installé démarre sans DevTools ni menu debug.
- `npm test`, `npm run validate` passent.

## Fin de session

Mets à jour `docs/PROGRESS.md`, puis commit `feat: sauvegarde robuste, finitions et packaging`.
