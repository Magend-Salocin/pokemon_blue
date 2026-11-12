# Prompt 11 : Col des Échos, Ligue, fin et post-jeu

## Contexte

Lis d'abord en entier `docs/GAME_DESIGN.md`, `docs/ARCHITECTURE.md`, `docs/MAP_FORMAT.md`, `docs/WORLD_MAP.md`, `docs/BESTIAIRE.md` et `docs/PROGRESS.md`. Le monde est jouable jusqu'au 8e badge.

## Objectif

Terminer le jeu : route de la victoire, Ligue, Maître, crédits de fin, puis contenu post-jeu.

## À réaliser

1. **Col des Échos**
   Contrôle des 8 badges par 8 gardes successifs (un par badge, dialogue si badge manquant), grotte finale qui combine les objets de terrain (Machette, Grappin, Gants, Bouée, Lanterne), dresseurs de haut niveau, combat rival 6 juste avant la Citadelle.

2. **Citadelle d'Azur**
   - Halte et Comptoir à l'entrée (le meilleur stock du jeu).
   - 4 Gardiens dans 4 salles successives (types au choix, différents des arènes autant que possible, équipes de 5 bestioles niveaux 52 à 58, IA `smart`). Pas de retour possible une fois entré (porte qui se ferme), pas de soin entre les combats, le joueur peut utiliser ses objets.
   - Le Maître est le rival (équipe de 6, niveaux 58 à 62, composée de son starter final et de bestioles variées couvrant ses faiblesses). Dialogue de confrontation, puis arrivée de la Pr Morvan.

3. **Salle d'honneur et fin**
   - Enregistrement de l'équipe du joueur (affichage des sprites et noms).
   - Crédits de fin : défilement des noms de tous les personnages clés du jeu et des créations (« Conception : … » laissé générique avec un placeholder `{CREDITS_AUTHOR}` défini dans `src/data/text/fr/credits.js`), sur la musique `ending`, avec des tableaux des lieux visités (cartes rendues en arrière-plan).
   - « FIN », sauvegarde automatique, retour à Hameau-de-Lys au réveil, avec un dialogue de Maman.

4. **Post-jeu**
   - Pic d'Azur : nouvelle zone de montagne débloquée après la Ligue, au sommet Azurel (niveau 70), petite séquence avant le combat.
   - Grotte Boréale : Glacerne (niveau 60), accessible avec le Grappin dans Givremont.
   - Volcarde réapparaît s'il avait été mis K.O.
   - Revanche des 8 champions dans leur arène une fois par jour réel (date système) avec des équipes de niveaux 60 à 66.
   - Ligue rejouable avec équipes renforcées (niveaux 65 à 72).
   - Diplôme de la Pr Morvan si le Bestiaire est complet (150 capturés) : écran spécial.

5. **Dresseurs et rencontres** de ces zones, environ 40 dresseurs ; les dernières espèces non encore capturables deviennent disponibles ici, de façon à ce que les 145 espèces non légendaires soient toutes obtenables dans une seule partie (par capture, évolution ou échange PNJ). Écris `tools/check-obtainability.js` qui le prouve à partir des données (tables de rencontres, évolutions, échanges, dons scriptés) et ajoute-le à `npm run validate`.

6. **Équilibrage** : Gardiens, Maître, revanches dans `tools/balance-check.js` (cible Ligue : 45 à 65 % pour une équipe attendue niveau 55).

## Critères d'acceptation

- Depuis le 8e badge, la Ligue est battable, les crédits défilent, le jeu reprend correctement après la fin.
- Les 4 légendaires et le mythique sont rencontrables dans les bonnes conditions.
- `tools/check-obtainability.js` confirme les 150 espèces obtenables (145 + 4 légendaires + le mythique sous condition).
- `npm test`, `npm run validate` passent.

## Fin de session

Mets à jour `docs/PROGRESS.md`, puis commit `feat(monde): ligue, fin et post-jeu`.
