# Prompt 02 : graphismes pixel art et atlas PNG

## Contexte

Lis d'abord `docs/GAME_DESIGN.md` (sections 1 et 7 en priorité), `docs/ARCHITECTURE.md` et `docs/PROGRESS.md`. Le socle Electron existe (prompt 01).

Tous les visuels sont originaux et créés en code. Ne reproduis aucun sprite, personnage ou tuile d'un jeu existant.

## Objectif

Créer toute la chaîne graphique : sources de sprites en texte, générateur procédural de bestioles, script qui produit des atlas PNG versionnés, et chargement de ces atlas au lancement du jeu. Les PNG produits doivent pouvoir être retouchés à la main ensuite sans casser le jeu.

## À réaliser

1. **Format source et utilitaires** (`src/gfx/sources/`, `src/gfx/sprite-utils.js`)
   - Format de `docs/ARCHITECTURE.md` (tableaux de chaînes, `'0'-'3'`, `'.'`).
   - Fonctions pures : `parseSprite`, `flipHorizontal`, `validateSprite` (dimensions, caractères).
   - Aucune dépendance au DOM : ces modules sont utilisés par Node et par le navigateur.

2. **Tuiles** (`src/gfx/sources/tiles/`)
   Tuiles 8 × 8 regroupées en métatuiles 16 × 16, organisées en tilesets :
   - `outdoor` : herbe, herbe haute (animée 2 frames), chemin, sable, fleurs (animées), arbres (4 métatuiles par arbre), arbustes coupables, rochers à pousser, corniches (sauter vers le bas), corniches à grappin, eau (animée), berges dans les 8 directions, ponts, clôtures, panneaux, boîtes aux lettres.
   - `town` : murs et toits de maisons (3 styles), portes, fenêtres, Halte (toit distinctif avec croix stylisée originale), Comptoir (toit distinctif avec sac), bâtiment d'arène, labo, phare, éoliennes, usine.
   - `indoor` : sol, tapis, murs, tables, chaises, lits, étagères, plantes, comptoirs, terminal de stockage, machine de soin, escaliers montants et descendants.
   - `cave` : sol, parois, échelles, eau souterraine, stalagmites, sol glacé.
   - `special` : sols de la Tour de la Mémoire, téléporteurs du QG Opale, sols de la Ligue, lave décorative.
   Chaque métatuile a un `id` et des métadonnées : `solid`, `grass`, `water`, `ledge: 'down'|...`, `cuttable`, `pushable`, `climbable`, `door`, `counter` (on parle par-dessus), `animated`.

3. **Personnages du monde** (`src/gfx/sources/characters/`)
   16 × 16, 4 directions × 2 frames de marche (droite = miroir de gauche autorisé) :
   joueur (garçon), joueuse (fille, sélectionnable), rival, professeure, maman, sbire Opale, Corvin Halvard, 8 champions, 4 Gardiens, 18 PNJ génériques (enfant, randonneur, pêcheur, scientifique, marin, vieil homme, vieille dame, infirmière de Halte, vendeur, nageur, motard, dresseuse, montagnard, etc.), joueur en mode bouée, bestiole qui suit (non nécessaire), objet au sol (capsule), rocher.

4. **Portraits de combat** (`src/gfx/sources/trainers/`)
   48 × 48 de face, pour chaque classe de dresseur du game design, plus le dos du joueur et de la joueuse (48 × 48) pour l'écran de combat.

5. **Générateur de bestioles** (`src/gfx/creature-generator.js`)
   Fonction pure `generateCreatureSprite(spec, view)` → `{ width: 48, height: 48, pixels: Int8Array }` où `view ∈ 'front' | 'back'`.
   - `spec = { plan, seed, size, features: [...], pattern }`
   - Plans de corps : `biped`, `quadruped`, `bird`, `serpent`, `fish`, `insect`, `blob`, `plant`, `golem`, `ghost`, `dragon`.
   - Caractéristiques combinables : cornes, oreilles longues, crête, ailes, queue (flamme, feuille, nageoire, épines), carapace, antennes, crocs, cristaux, nuage, ombre.
   - Motifs : uni, rayures, taches, ventre clair.
   - Silhouette symétrique (sauf plans `serpent` et `fish`), contour 1 px index 3, ombrage index 2 du côté opposé à la lumière (haut-gauche), reflets index 0.
   - Déterministe : même spec = mêmes pixels. Une évolution réutilise le `seed` de la forme précédente avec `size` plus grand et des caractéristiques ajoutées, pour que les lignées se ressemblent.
   - Vue `back` : même silhouette vue de dos, sans yeux, ombrée.

6. **Bestioles dessinées à la main** (`src/gfx/sources/creatures/`)
   Pour les 9 starters (3 lignées), les 4 légendaires et le mythique, dessine des sprites 48 × 48 face et dos à la main, plus soignés que le générateur, en suivant les concepts du game design. Ces fichiers remplacent le générateur pour ces espèces.

7. **Interface** (`src/gfx/sources/ui/`)
   Cadres de fenêtre, barre de PV (3 états), barre d'XP, icônes de statut (BRL, PSN, PAR, SOM, GEL), icônes de type (15), icône de capsule (pleine, vide, KO) pour l'équipe, 8 badges, icônes miniatures de bestioles 16 × 16 en 2 frames pour le menu d'équipe (une par plan de corps), logo du titre « BESTIORA AZUR » en grandes lettres, silhouette d'Azurel pour l'écran titre.

8. **Atlas** (`tools/build-atlas.js`, `npm run atlas`)
   - Assemble toutes les sources en atlas PNG indexés en niveaux 0-3 (les couleurs réelles sont appliquées au rendu) : `assets/atlas/tiles.png`, `characters.png`, `trainers.png`, `creatures.png`, `ui.png`, chacun avec un `.json` (`{ frames: { id: { x, y, w, h } }, meta }`).
   - Les PNG sont enregistrés avec les 4 gris de référence `#ffffff #aaaaaa #555555 #000000` et la transparence alpha.
   - Option `--keep-edited` : si un PNG existe et a été modifié après le dernier build (empreinte stockée dans le JSON), ne pas l'écraser et afficher un avertissement.
   - Les bestioles du générateur sont produites à partir de `src/data/creatures.js` si ce fichier existe ; sinon à partir d'une liste de 20 specs d'exemple dans `tools/sample-creatures.js` (les vraies données arrivent au prompt 03, qui relancera le build).

9. **Chargement runtime** (`src/gfx/atlas.js`, `src/gfx/draw.js`)
   - Charge les PNG et JSON au démarrage (écran de chargement simple), convertit chaque gris en index, prépare un cache par palette.
   - `drawSprite(ctx, atlas, frameId, x, y, { flipX })`, `drawMetatile(...)`. Changer de palette invalide le cache.

10. **Visionneuse** (scène debug, accessible depuis la démo par `Select`)
    Parcourt chaque atlas frame par frame avec son `id`, affiche les animations, et la planche des 20 bestioles d'exemple.

11. **Tests**
    - Validation de toutes les sources (dimensions, caractères).
    - Déterminisme du générateur (même spec, même hash de pixels ; seeds différents, sprites différents).
    - Le générateur produit des sprites non vides, avec contour, dans les 48 × 48, pour chaque plan de corps.

## Critères d'acceptation

- `npm run atlas` produit les 5 PNG et JSON ; les PNG s'ouvrent dans un éditeur d'images et sont lisibles.
- La visionneuse affiche tout correctement dans les 5 palettes.
- Modifier un pixel d'un PNG à la main puis relancer le jeu affiche la modification.
- Les sprites générés sont variés et lisibles ; les starters et légendaires sont nettement plus soignés.
- `npm test` passe.

## Hors périmètre

Cartes complètes, logique de déplacement, données des 150 bestioles.

## Fin de session

Mets à jour `docs/PROGRESS.md` (liste des `id` d'atlas créés, conventions de nommage), puis commit `feat: chaîne graphique, générateur de bestioles et atlas PNG`.
