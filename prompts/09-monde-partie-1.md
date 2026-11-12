# Prompt 09 : monde, partie 1 (introduction à l'arène 4)

## Contexte

Lis d'abord en entier `docs/GAME_DESIGN.md` (sections 3 et 4 surtout), `docs/ARCHITECTURE.md`, `docs/MAP_FORMAT.md`, `docs/BESTIAIRE.md` et `docs/PROGRESS.md`. Tous les systèmes sont en place (01 à 08). Cette étape est uniquement du contenu, écrit en données.

Tout le contenu est original : noms de PNJ, dialogues, agencement des cartes.

## Objectif

Rendre jouable le début du jeu, de l'écran titre jusqu'au badge de l'arène 4 (zones 1 à 12 du tableau de progression), avec une difficulté progressive et un scénario cohérent.

## À réaliser

1. **Introduction** (scène après NOUVELLE PARTIE)
   La Pr Morvan se présente avec une bestiole à l'écran, explique le monde en quelques pages, demande garçon/fille, le nom du joueur (saisie ou 3 propositions), le nom du rival (saisie ou 3 propositions), puis transition vers la chambre du joueur.

2. **Hameau-de-Lys**
   Maison du joueur (Maman, soin gratuit), maison du rival, labo. Scénario : le joueur tente de sortir vers la Route 1, la professeure l'arrête, le ramène au labo, choix parmi les 3 starters (présentation avec sprite et confirmation), le rival choisit le starter avantagé, premier combat rival (`onLose: 'continue'`, le jeu continue même en cas de défaite, avec un dialogue différent).
   La professeure demande d'aller chercher un colis au Comptoir de Bourg-Sablon ; au retour, elle remet le Bestiaire et 5 capsules, et le rival part devant.

3. **Cartes à produire**, avec intérieurs (Haltes, Comptoirs, maisons, arènes) :
   Hameau-de-Lys, Route 1, Bourg-Sablon, Route 2, Bois Murmurant, Route 3, Grotte des Cascades (2 niveaux), Port-Ondine (bateau-musée inclus), Route 4 (pension), Route 5, Vireval, usine Opale (petit donjon), Route 6, Tunnel Obscur, Cendrelune, Tour de la Mémoire (5 étages), et l'accès extérieur à la Centrale abandonnée (bloquée pour l'instant).
   Contraintes : chaque route a au moins un raccourci ou une zone secrète ; les objets de terrain bloquent proprement l'accès aux zones ultérieures ; les connexions sont cohérentes avec une carte de région globale dessinée dans `docs/WORLD_MAP.md` (schéma ASCII) que tu crées et que le prompt 10 étendra.

4. **Arènes 1 à 4**
   Chacune avec une énigme de déplacement originale et simple (rochers de Roche, plateformes d'eau, interrupteurs électriques, labyrinthe de haies coupables), 2 à 4 dresseurs, le champion (équipe de 3 à 4 bestioles du type, IA `smart`), badge, objet récompense (une attaque n'est pas enseignable : donner une pierre d'évolution ou un objet utile), dialogues avant, pendant (« dernière bestiole ») et après.
   Chaque badge débloque un effet documenté (objet de terrain utilisable, bestioles échangées obéissent jusqu'à un niveau donné : non géré, rester simple).

5. **Scénario du Syndicat Opale**
   Première apparition dans le Bois Murmurant (des sbires volent des œufs de bestioles, combat), sabotage de l'usine de Vireval, prise de la Tour de la Mémoire (combat contre un lieutenant, récompense Grappin). Introduis Corvin Halvard par mentions et une brève apparition au sommet de la Tour, sans combat.

6. **Rival** : combats 2 (sortie de la Grotte des Cascades) et 3 (rez-de-chaussée de la Tour). Son équipe évolue en cohérence avec son starter.

7. **Dresseurs** (`src/data/trainers.js`), environ 90 pour cette partie
   `{ id, class, name, party: [{ species, level, moves? }], ai, introText, defeatText, afterText, reward? }`. Niveaux dans les plages de la section 4. Variété des classes et des espèces, équipes thématiques par classe (les pêcheurs ont des bestioles Eau, etc.).

8. **Rencontres sauvages** : tables par zone (herbes, grotte, eau au besoin), en utilisant les espèces dont `habitat` correspond. Au moins 70 espèces différentes capturables dans cette partie. Mets à jour `habitat` dans `creatures.js` si nécessaire et régénère `docs/BESTIAIRE.md`.

9. **Économie et objets**
   Objets au sol et cachés (environ 60), inventaire des Comptoirs par ville, argent des dresseurs. Le joueur doit pouvoir acheter des capsules et potions régulièrement sans farmer.

10. **PNJ et textes**
    Chaque ville a 4 à 8 PNJ qui donnent des conseils, de l'humour ou du lore, et au moins un échange PNJ dans cette partie. Textes dans `src/data/text/fr/<zone>.js`.

11. **Équilibrage**
    Écris `tools/balance-check.js` : pour chaque champion et rival, simule 200 combats avec une équipe « joueur attendu » (starter + 2 captures de la zone, au niveau typique) et affiche le taux de victoire. Cible : 55 à 75 % pour les champions, 60 à 80 % pour les rivaux. Ajuste niveaux et attaques jusqu'à y être.

12. **Validation**
    `npm run validate` couvre toutes les nouvelles cartes et dresseurs ; aucun texte manquant, aucun warp cassé, aucun dresseur inaccessible. Exporte l'aperçu PNG de toutes les cartes (`tools/map-preview.js`) et inspecte-les.

## Critères d'acceptation

- Une partie neuve est jouable de l'intro jusqu'au 4e badge sans menu debug, sans blocage, sans séquence cassée.
- Les objets de terrain ne sont utilisables qu'au bon moment ; impossible d'atteindre une zone ultérieure en avance.
- `npm test`, `npm run validate` passent, `tools/balance-check.js` est dans les cibles.

## Reprise

Cette étape est longue. Si tu dois t'arrêter, laisse le jeu dans un état jouable, note dans `docs/PROGRESS.md` la dernière zone terminée et la suivante, et commite.

## Fin de session

Mets à jour `docs/PROGRESS.md`, puis commit `feat(monde): introduction à l'arène 4`.
