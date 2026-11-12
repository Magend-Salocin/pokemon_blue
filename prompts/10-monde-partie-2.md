# Prompt 10 : monde, partie 2 (arènes 5 à 8)

## Contexte

Lis d'abord en entier `docs/GAME_DESIGN.md`, `docs/ARCHITECTURE.md`, `docs/MAP_FORMAT.md`, `docs/WORLD_MAP.md`, `docs/BESTIAIRE.md` et `docs/PROGRESS.md`. La partie 1 du monde (prompt 09) est jouable jusqu'au 4e badge. Respecte le style, les conventions et le niveau de qualité de la partie 1 : relis 2 ou 3 cartes et fichiers de texte existants avant d'écrire.

## Objectif

Rendre jouable la suite, du 4e badge jusqu'au 8e badge (zones 13 à 21 du tableau de progression), avec la résolution du scénario du Syndicat Opale.

## À réaliser

1. **Cartes** (extérieurs et intérieurs) :
   Route 7, Falaises de Bise, Haute-Bise, Route 8, Marais Gris, Ombrecourt (casino et QG Opale à plusieurs niveaux avec téléporteurs), Routes maritimes 9 et 10, Îlots, Bibliothèque Engloutie, Forge-Ardente, Cœur de la Forge, Givremont, Centrale abandonnée (désormais accessible avec la Lanterne, optionnelle, contient Fulgorine).
   Étends `docs/WORLD_MAP.md`.

2. **Arènes 5 à 8** (Vent, Ombre, Feu, Arcane)
   Énigmes originales (courants d'air qui poussent le joueur, salle obscure avec torches, sol de lave à éviter, téléporteurs à symboles), 3 à 5 dresseurs chacune, champions avec 4 à 5 bestioles et IA `smart`.

3. **Objets de terrain** : Gants de force (Haute-Bise), Bouée (Marais Gris), Cerf-volant (QG Opale). Le Cerf-volant affiche la liste des villes visitées et y emmène le joueur devant la Halte.

4. **Scénario du Syndicat Opale**
   - Ombrecourt : découverte du QG sous le casino (indice donné par un PNJ, passage secret), donjon à téléporteurs, combat contre Corvin Halvard (1re fois), il s'enfuit vers Forge-Ardente.
   - Forge-Ardente : Corvin tente de contrôler Volcarde dans le Cœur de la Forge ; dernier combat contre lui (son équipe la plus forte), Volcarde reste ensuite capturable (combat légendaire niveau 50, une seule chance, réapparition après la Ligue si mis K.O.).
   - Après sa défaite, Corvin renonce et dissout le Syndicat (dialogue de clôture). Les sbires disparaissent des cartes via drapeaux.

5. **Rival** : combats 4 (Falaises de Bise) et 5 (QG Opale).

6. **Dresseurs** : environ 100 de plus. **Rencontres** : au moins 50 nouvelles espèces capturables, dont les formes rares (taux faible) ; pêche non gérée, l'eau utilise la table `water`.

7. **Légendaires de cette partie** : Fulgorine (Centrale, niveau 50), Volcarde (voir 4). Combat légendaire : musique `battle_final`, cri à l'apparition, non fuyable sauf avec Corde de Sortie hors combat.

8. **Mythique** : Mirelle dans la Bibliothèque Engloutie, visible uniquement si le Bestiaire compte 149 espèces capturées (drapeau calculé). Rencontre niveau 60.

9. **PNJ, textes, échanges** : même densité qu'en partie 1, au moins 2 échanges PNJ. Les PNJ des villes précédentes réagissent aux événements majeurs (dissolution du Syndicat) via drapeaux.

10. **Équilibrage** : `tools/balance-check.js` étendu aux nouveaux champions et rivaux, mêmes cibles qu'au prompt 09.

11. **Validation** : comme au prompt 09, toutes cartes, textes, warps, dresseurs ; aperçus PNG inspectés.

## Critères d'acceptation

- Une sauvegarde (ou un état debug) au 4e badge permet de jouer jusqu'au 8e badge sans blocage.
- Les 3 objets de terrain de cette partie et le Cerf-volant fonctionnent.
- Le scénario Opale se termine proprement ; les sbires ont disparu après.
- `npm test`, `npm run validate` passent, équilibrage dans les cibles.

## Reprise

Si tu dois t'arrêter, laisse le jeu jouable, note dans `docs/PROGRESS.md` la dernière zone terminée et la suivante, et commite.

## Fin de session

Mets à jour `docs/PROGRESS.md`, puis commit `feat(monde): arènes 5 à 8 et fin du Syndicat Opale`.
