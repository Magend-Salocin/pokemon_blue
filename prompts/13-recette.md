# Prompt 13 : recette complète et corrections

## Contexte

Lis d'abord `docs/GAME_DESIGN.md`, `docs/ARCHITECTURE.md` et `docs/PROGRESS.md` en entier, y compris les problèmes connus notés par les sessions précédentes. Le jeu est complet et packagé.

## Objectif

Trouver et corriger les bugs bloquants et les incohérences avant la version 1.0, de façon systématique et vérifiable.

## À réaliser

1. **Partie automatisée** (`tools/autoplay/`)
   Écris un pilote qui joue le jeu en mode headless (logique sans rendu, ou Electron avec rendu caché) en suivant un fichier de route (`tools/autoplay/route.js` : suite d'objectifs « aller à », « parler à », « combattre », « utiliser objet »). Le pilote utilise un pathfinding sur la grille de collision et une IA de combat simple. Objectif : aller de NOUVELLE PARTIE jusqu'aux crédits sans intervention. Chaque blocage (chemin impossible, script qui ne termine pas, exception) est reporté avec la carte, la position et l'étape.

2. **Audit des données**
   - Tous les drapeaux posés sont lus quelque part et inversement (rapport des drapeaux orphelins).
   - Chaque dresseur est atteignable ; chaque objet au sol est atteignable.
   - Chaque carte est atteignable depuis Hameau-de-Lys en respectant la progression des objets de terrain (graphe de progression).
   - Aucune séquence cassée : vérifier qu'on ne peut pas atteindre une zone sans le badge et l'objet requis.
   - Recherche des mots interdits (section 1) sur tout le dépôt, code compris.

3. **Recette manuelle guidée**
   Rédige `docs/RECETTE.md` : une checklist par zone (entrée, PNJ, dresseurs, objets, scénario, sortie) et par système (combat, menus, sauvegarde, audio, options). Coche ce que les outils automatiques ont validé ; laisse le reste pour un testeur humain avec des instructions précises.

4. **Corrections**
   Corrige tous les problèmes trouvés par 1 et 2, en ajoutant un test de non-régression quand c'est un bug de logique. Pour chaque correction : une ligne dans `docs/PROGRESS.md`.

5. **Équilibrage final**
   Relance `tools/balance-check.js` sur tous les combats importants, et le pilote automatique avec une équipe sans farm : il doit terminer le jeu avec des niveaux cohérents (≈ 55 à la Ligue). Ajuste si besoin.

6. **Version**
   Met à jour `README.md`, passe la version à 1.0.0, régénère `npm run atlas` et `npm run dist`.

## Critères d'acceptation

- Le pilote automatique termine le jeu jusqu'aux crédits.
- Aucun rapport d'audit en erreur.
- `npm test`, `npm run validate` passent ; `docs/RECETTE.md` est prêt pour un testeur humain.

## Fin de session

Mets à jour `docs/PROGRESS.md` (statut final, problèmes connus restants), puis commit `chore: recette 1.0 et corrections`.
