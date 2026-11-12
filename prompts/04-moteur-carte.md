# Prompt 04 : moteur de carte et exploration

## Contexte

Lis d'abord `docs/GAME_DESIGN.md`, `docs/ARCHITECTURE.md` (formats Carte et Script d'événement) et `docs/PROGRESS.md`. Le socle (01) et les atlas (02) existent.

## Objectif

Rendre l'exploration complète et data-driven : cartes, déplacements case par case, collisions, PNJ, dresseurs, scripts d'événements, transitions. Tout le contenu futur des prompts 09 à 11 doit pouvoir s'écrire uniquement en données.

## À réaliser

1. **Format et chargement des cartes** (`src/data/maps/`, `src/overworld/map-loader.js`)
   - Format de `docs/ARCHITECTURE.md`. Index des cartes `src/data/maps/index.js`.
   - Les couches `ground` et `collision` peuvent être écrites en chaînes lisibles avec une légende de caractères propre à chaque carte (ex. `'T'` arbre, `'g'` herbe haute, `'~'` eau), convertie en id de métatuile au chargement. C'est le format que les prompts de contenu utiliseront ; documente-le dans `docs/MAP_FORMAT.md` avec un exemple complet.
   - Connexions entre cartes extérieures sans écran de transition (on voit la carte voisine en bordure ; défilement continu).

2. **Caméra et rendu**
   - Joueur centré (sauf bords de carte non connectés), défilement pixel par pixel.
   - Tuiles animées (eau, fleurs, herbe haute) synchronisées sur un timer global.
   - Herbe haute qui recouvre le bas du sprite du joueur.
   - Grottes sombres sans Lanterne : seul un cercle de 3 métatuiles autour du joueur est visible.

3. **Joueur** (`src/overworld/player.js`)
   - Déplacement case par case (16 px) en 16 frames, course possible avec B maintenu (×2) une fois les Chaussures obtenues (objet clé, ajouter à `items.js` si absent).
   - Pivoter sans bouger si on appuie brièvement dans une nouvelle direction.
   - Collision : tuiles `solid`, PNJ, bords de carte.
   - Corniches : saut vers le bas avec arc et ombre.
   - Surf (Bouée), coupe (Machette), poussée de rocher (Gants), escalade de corniche (Grappin) : interaction avec A face à la tuile, uniquement si l'objet et le badge requis sont possédés ; sinon message explicatif.
   - Sol glacé : glissade jusqu'à un obstacle.
   - Bruit de collision (« bump ») via un hook audio vide pour l'instant.

4. **Warps et transitions**
   - Portes et escaliers : fondu au noir, chargement, fondu retour ; le joueur ressort en marchant d'une case.
   - Tapis de sortie des intérieurs.

5. **PNJ** (`src/overworld/npc.js`)
   - Mouvements : `static`, `look` (tourne au hasard), `wander` (dans un rayon), `path` (boucle de déplacements).
   - A face à un PNJ : il se tourne vers le joueur et lance son script.
   - Panneaux et objets visibles au sol (ramassés une seule fois via drapeau) ; objets cachés (A sur une tuile précise).

6. **Dresseurs**
   - Ligne de vue droite jusqu'à `sight` cases, bloquée par les obstacles.
   - Quand le joueur entre dans la ligne : arrêt, « ! » au-dessus du dresseur, musique d'intro (hook), le dresseur marche jusqu'à être adjacent, dialogue d'avant-combat, puis appel `startBattle(...)`.
   - Une fois battu (drapeau `trainer_<id>`), il dit son texte d'après-combat et ne combat plus.
   - Pour cette étape, `startBattle` affiche un écran provisoire « Combat contre X » et renvoie une victoire.

7. **Moteur de scripts** (`src/overworld/script-runner.js`)
   Commandes au minimum : `say`, `ask` (Oui/Non avec branches), `move`, `face`, `wait`, `set_flag`, `clear_flag`, `if_flag`, `if_item`, `if_badge`, `give_item`, `take_item`, `give_creature`, `give_money`, `heal_party`, `battle` (avec `onLose: 'continue' | 'blackout'`), `wild_battle`, `warp`, `show_actor`, `hide_actor`, `play_music`, `play_sfx`, `fade`, `shake_screen`, `open_menu` (shop, storage, nickname…), `call` (sous-script nommé), `set_rival_name`, `choose_starter`. Les actions dépendant de systèmes non encore construits passent par des hooks que les prompts suivants brancheront.
   - Les PNJ et acteurs peuvent bouger en parallèle (`move` avec `async: true` + `wait_moves`).
   - Les drapeaux sont stockés dans `src/state/game-state.js` (créé ici si absent) : `flags`, `bag`, `party`, `money`, `badges`, `position`, `player`, `rival`.

8. **Rencontres sauvages**
   - Probabilité par pas dans les herbes, grottes et sur l'eau selon `encounters.rate` de la carte.
   - Table pondérée (`{ creature, minLevel, maxLevel, weight }`), Répulsif : pas de rencontre si niveau sauvage < niveau du 1er de l'équipe.
   - Transition d'entrée en combat (effet de volets ou de clignotement original), puis `startBattle` provisoire.

9. **Cartes de test** (dans `src/data/maps/test/`, exclues du jeu final)
   Une petite ville, une route avec herbes, corniches, eau, arbuste, rocher, un intérieur, une grotte sombre, un dresseur, un PNJ qui donne un objet. Le jeu démarre sur ces cartes en mode dev.

10. **Validateur**
    Étend `tools/validate-data.js` : dimensions des couches, caractères de légende définis, warps vers des cartes et positions existantes et non bloquantes, connexions réciproques avec bords de même taille, scripts dont les commandes et références existent, dresseurs référencés existants (s'ils ne sont pas encore définis, accepte les ids présents dans un stub `trainers.js`).

11. **Outil d'aperçu** (`tools/map-preview.js`)
    Exporte une carte en PNG (`out/maps/<id>.png`) avec les PNJ et warps marqués. Utile pour les prompts de contenu.

12. **Tests**
    Collisions, ligne de vue des dresseurs, conversion de légende, exécution de scripts simples (avec un faux contexte).

## Critères d'acceptation

- Dans les cartes de test : se déplacer, entrer/sortir d'un bâtiment, sauter une corniche, surfer, couper, pousser, parler, ramasser un objet, être repéré par un dresseur, déclencher une rencontre, explorer la grotte sombre.
- Défilement fluide, aucune case de décalage, aucune traversée de mur.
- `npm test`, `npm run validate` passent.

## Hors périmètre

Vrai combat, menus (équipe, sac…), musique.

## Fin de session

Mets à jour `docs/PROGRESS.md`, puis commit `feat: moteur de carte, PNJ, dresseurs et scripts`.
