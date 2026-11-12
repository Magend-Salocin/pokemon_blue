# Bestiora Azur : document de game design

Référence unique pour tout le contenu du jeu. Chaque prompt d'implémentation s'appuie sur ce document. En cas de doute, ce document fait foi ; s'il est muet, choisir l'option la plus simple et la noter dans `docs/PROGRESS.md`.

## 1. Règles d'originalité (non négociables)

Bestiora Azur est un RPG de capture de créatures original. Il partage le genre et des mécaniques génériques (combat au tour par tour, types, capture, arènes, rival), mais aucun contenu d'une franchise existante.

- Aucun nom, personnage, créature, lieu, objet, attaque, dialogue, carte, musique ou visuel repris d'un jeu existant (Pokémon, Digimon, Dragon Quest Monsters, Temtem, Cassette Beasts, etc.), même modifié.
- Avant de valider un nom de créature, d'attaque ou de personnage, vérifier qu'il ne ressemble pas à un nom connu de ces franchises. En cas de doute, en choisir un autre.
- Interdits explicites dans le code et le texte : « Pokémon », « Pokédex », « Poké Ball », « Centre Pokémon », « CS/CT », noms de régions, villes, personnages ou créatures de ces jeux.
- Les mélodies sont composées pour le jeu. Ne jamais transcrire une mélodie existante.
- Les cartes ne reproduisent pas la géographie d'une région existante.

## 2. Vue d'ensemble

| Élément | Valeur |
|---|---|
| Titre | Bestiora Azur |
| Plateforme | Electron (Windows, macOS, Linux) |
| Rendu | Pixel art 4 teintes, résolution interne 160 × 144, mise à l'échelle entière |
| Langue du jeu | Français |
| Durée visée | 15 à 25 heures |
| Créatures | 150 (dont 3 starters, 4 légendaires, 1 mythique) |
| Types | 15 |
| Attaques | environ 165 |
| Arènes | 8, puis Ligue (4 Gardiens + Maître) |

Contrôles par défaut : flèches pour se déplacer, `X` valider (A), `Z` annuler (B), `Entrée` menu (Start), `Shift droit` (Select). Remappables dans les options. Manette supportée via Gamepad API.

## 3. Univers

Région : **Brumeval**, une péninsule tempérée bordée d'une mer intérieure, avec des marais au sud, des falaises venteuses à l'est et un massif enneigé au nord.

Les créatures s'appellent des **bestioles** (singulier : une bestiole). On les capture avec des **capsules**. L'encyclopédie s'appelle le **Bestiaire**. Les centres de soin s'appellent des **Haltes**. Les boutiques s'appellent des **Comptoirs**.

### Personnages principaux

| Rôle | Nom | Notes |
|---|---|---|
| Joueur | choisi (défaut : « Elio ») | 11 ans, part de Hameau-de-Lys |
| Rival | choisi (défaut : « Nora ») | Petite-fille de la professeure, confiante, rivale amicale qui s'adoucit au fil de l'histoire |
| Professeure | Pr Ilse Morvan | Étudie les migrations de bestioles, confie le Bestiaire |
| Antagoniste | Corvin Halvard | Fondateur du Syndicat Opale, veut capter l'énergie des légendaires pour alimenter ses usines |
| Organisation | Syndicat Opale | Sbires en combinaison grise, logo en losange |
| Mère | Maman | Soigne l'équipe à la maison |

### Starters (choisis au labo)

| Lignée | Type | Concept |
|---|---|---|
| Fenouillot → Fenouvert → Sylvenard | Flore | Petit renard aux oreilles en feuilles |
| Braisille → Fournaise → Pyrogrue | Feu | Oisillon de forge, devient grue de flammes |
| Flaquin → Ondéclat → Marévor | Eau | Têtard cuirassé, devient tortue-dragon des marées |

Le rival prend le starter qui a l'avantage de type sur celui du joueur.

### Légendaires et mythique

| Nom | Type | Lieu | Condition |
|---|---|---|---|
| Azurel | Vent / Arcane | Sommet du Pic d'Azur | Après la Ligue, mascotte du titre |
| Glacerne | Givre / Roche | Grotte Boréale | Nécessite le Grappin |
| Volcarde | Feu / Terre | Cœur de la Forge | Nécessite la Bouée |
| Fulgorine | Foudre / Vent | Centrale abandonnée | Nécessite la Lanterne |
| Mirelle (mythique) | Arcane | Rencontre unique dans la Bibliothèque Engloutie | Bestiaire à 149 |

## 4. Carte du monde et progression

Ordre de progression. Niveaux indiqués = plage des dresseurs et rencontres sauvages ; « Plafond » = niveau max de l'équipe du champion.

| # | Zone | Contenu | Niveaux |
|---|---|---|---|
| 1 | Hameau-de-Lys | Maison, labo de la Pr Morvan, choix du starter, 1er combat rival | 5 |
| 2 | Route 1 | Herbes hautes, premier PNJ qui explique la capture | 2-4 |
| 3 | Bourg-Sablon | Halte, Comptoir. **Arène 1 Roche**, championne Garance | Plafond 12 |
| 4 | Route 2, Bois Murmurant | Bois type labyrinthe, insectes, 1re apparition du Syndicat | 4-9 |
| 5 | Route 3, Grotte des Cascades | Grotte à 2 niveaux, rival 2 à la sortie | 8-14 |
| 6 | Port-Ondine | Ville portuaire, bateau-musée. **Arène 2 Eau**, champion Maël | Plafond 20 |
| 7 | Route 4, Route 5 | Pension, échangeur de PNJ, objet Machette (couper) | 14-20 |
| 8 | Vireval | Ville industrielle, usine Opale. **Arène 3 Foudre**, championne Sélène | Plafond 26 |
| 9 | Centrale abandonnée (optionnelle) | Accessible plus tard avec la Lanterne | 30-36 |
| 10 | Route 6, Tunnel Obscur | Nécessite la Lanterne (obtenue à Vireval après l'arène) | 20-26 |
| 11 | Cendrelune | Ville des serres, tour de la Mémoire (spectres). **Arène 4 Flore**, champion Aubin | Plafond 31 |
| 12 | Tour de la Mémoire | 5 étages, Syndicat au sommet, récompense : Grappin (escalader) | 26-32 |
| 13 | Route 7, Falaises de Bise | Rival 3, passages à Grappin | 28-34 |
| 14 | Haute-Bise | Village perché, éoliennes. **Arène 5 Vent**, championne Ysolde | Plafond 36 |
| 15 | Route 8, Marais Gris | Bouée (surfer) obtenue auprès d'un pêcheur | 32-38 |
| 16 | Ombrecourt | Ville nocturne, QG secret du Syndicat sous le casino. **Arène 6 Ombre**, champion Lazare | Plafond 40 |
| 17 | QG Opale | Donjon à téléporteurs, combat contre Corvin Halvard (1re fois), récompense : Cerf-volant (voler) | 36-42 |
| 18 | Routes maritimes 9-10, Îlots | Surf, Bibliothèque Engloutie | 38-44 |
| 19 | Forge-Ardente | Île volcanique. **Arène 7 Feu**, championne Brune | Plafond 45 |
| 20 | Cœur de la Forge | Corvin tente de capturer Volcarde, combat final contre le Syndicat | 42-46 |
| 21 | Givremont | Ville de montagne. **Arène 8 Arcane**, champion Oswin | Plafond 50 |
| 22 | Col des Échos | Route de la victoire, contrôle des 8 badges, rival 6 | 46-52 |
| 23 | Citadelle d'Azur (Ligue) | 4 Gardiens puis le Maître (le rival) sans soin entre les combats | 52-62 |
| 24 | Post-jeu | Pic d'Azur (Azurel), Grotte Boréale (Glacerne), dresseurs revanche niveau 60+ | 55-70 |

Combats contre le rival : Hameau-de-Lys, sortie Grotte des Cascades, Tour de la Mémoire (bas), Falaises de Bise, QG Opale, Col des Échos, Ligue (Maître). Son équipe grandit à chaque fois (de 1 à 6 bestioles).

### Objets de terrain (remplacent toute capacité hors combat)

| Objet | Effet | Obtention |
|---|---|---|
| Machette | Couper les arbustes | Route 5, après l'arène 2 |
| Lanterne | Éclairer grottes et tunnels | Vireval, après l'arène 3 |
| Grappin | Franchir les corniches marquées | Tour de la Mémoire |
| Bouée | Se déplacer sur l'eau | Marais Gris |
| Cerf-volant | Voyage rapide vers une ville déjà visitée | QG Opale |
| Gants de force | Pousser les rochers | Haute-Bise, après l'arène 5 |

Chaque objet de terrain est aussi conditionné à un badge (badge 2 pour la Machette, etc.) pour éviter les séquences cassées.

## 5. Mécaniques

### Types (15)

Normal, Feu, Eau, Flore, Foudre, Givre, Combat, Toxique, Terre, Vent, Arcane, Insecte, Roche, Ombre, Métal.

La table d'efficacité (×2, ×0,5, ×0) est définie dans `src/data/types.js` selon ces contraintes :
- chaque type a au moins 2 forces offensives et au moins 2 faiblesses défensives ;
- au plus 4 immunités au total dans la table ;
- relations intuitives (Eau > Feu, Feu > Flore, Flore > Eau, Foudre > Eau, Terre > Foudre, Givre > Vent, etc.) ;
- un test vérifie qu'aucun type n'a un solde (forces − faiblesses) supérieur à +3 ou inférieur à −3.

### Statistiques

PV, Attaque, Défense, Attaque Spéciale, Défense Spéciale, Vitesse. Chaque bestiole a des stats de base (total 250 à 600, légendaires 580 à 680), des **gènes** individuels (0 à 15 par stat, tirés à la capture) et de l'**entraînement** (points gagnés en battant des bestioles, plafonnés à 255 par stat).

```
PV   = floor((2 × base + gène + floor(entr / 4)) × niveau / 100) + niveau + 10
Stat = floor((2 × base + gène + floor(entr / 4)) × niveau / 100) + 5
```

Niveau max : 100. Courbes d'expérience : rapide, moyenne, lente (formules dans `src/battle/logic/experience.js`).

### Dégâts

```
base   = floor(floor(floor(2 × niveau / 5 + 2) × puissance × Att / Déf) / 50) + 2
dégâts = floor(base × STAB × efficacité × critique × aléa)
STAB = 1,5 si le type de l'attaque est celui de la bestiole ; critique = 1,5 ; aléa ∈ [0,85 ; 1]
```

Catégorie physique ou spéciale définie par attaque (pas par type). Taux de critique : 1/16, 1/8 pour les attaques à haut taux critique. Précision et esquive par paliers −6 à +6.

### Altérations

Majeures (une seule à la fois) : Brûlure, Poison, Poison grave, Paralysie, Sommeil (1 à 3 tours), Gel (20 % de dégel par tour). Volatiles : Confusion, Peur, Vampirisme, Piège. Les règles exactes sont dans le code et testées.

### Capture

```
a = ((3 × PVmax − 2 × PV) × tauxEspèce × bonusCapsule) / (3 × PVmax) × bonusStatut
bonusStatut = 2 (sommeil, gel), 1,5 (paralysie, poison, brûlure), 1 sinon
```
4 tirages de secousse, probabilité de réussite par secousse `b = 65536 / (255 / a)^0,1875`. Si `a ≥ 255`, capture garantie.

Capsules : Capsule (×1), Super Capsule (×1,5), Hyper Capsule (×2), Capsule Maîtresse (capture garantie, 1 seul exemplaire dans le jeu).

### Équipe et stockage

Équipe de 6. Stockage illimité organisé en 12 boîtes de 30 accessibles depuis les terminaux des Haltes. Si l'équipe est pleine, la capture part dans le stockage.

### Évolution

Par niveau, par objet (Pierre Solaire, Pierre Marine, Pierre Orage, Pierre Lunaire, Pierre Braise) ou par amitié (valeur 0-255, augmentée en marchant et en combattant). Annulable avec Z sauf pour les objets.

### Divers

- Rencontres sauvages : chaque tuile d'herbe ou de grotte a une probabilité de rencontre par pas définie par zone (≈ 8 %). Table de rencontres pondérée par zone, jour et nuit non gérés.
- Dresseurs : champ de vision en ligne droite (1 à 5 cases), « ! » au-dessus de la tête, le dresseur s'approche, dialogue, combat. Une fois battu, il ne combat plus.
- Argent : gagné contre les dresseurs (récompense = niveau max × base de la classe), perdu de moitié en cas de défaite, retour à la dernière Halte.
- Répulsif, Corde de sortie, potions, soins de statut, objets tenus non gérés (simplicité).
- Pension : une bestiole gagne de l'XP pendant que le joueur marche. Pas de reproduction.
- Échanges : uniquement avec des PNJ (échanges scriptés).

## 6. Contenu à produire

| Contenu | Quantité | Fichier |
|---|---|---|
| Bestioles | 150 | `src/data/creatures.js` |
| Attaques | ≈ 165 | `src/data/moves.js` |
| Objets | ≈ 45 | `src/data/items.js` |
| Classes de dresseurs | ≈ 30 (Gamin, Randonneuse, Pêcheur, Scientifique, Sbire Opale…) | `src/data/trainer-classes.js` |
| Dresseurs | ≈ 230 | `src/data/trainers.js` |
| Cartes | ≈ 90 (extérieurs et intérieurs) | `src/data/maps/` |
| Pistes musicales | 18 | `src/audio/tracks/` |
| Effets sonores | ≈ 30 | `src/audio/sfx.js` |

Répartition des 150 bestioles : environ 60 lignées (dont 15 à 3 stades, 30 à 2 stades, 15 sans évolution), au moins 6 bestioles par type principal, distribution des stats équilibrée par plage de jeu. Les légendaires et le mythique ne sont pas dans les tables de rencontres.

## 7. Direction artistique

Palette de base (4 teintes, de la plus claire à la plus foncée) :

| Index | Couleur | Usage |
|---|---|---|
| 0 | `#e8f0d8` | Fond, blanc |
| 1 | `#a8c090` | Teinte claire |
| 2 | `#587860` | Teinte foncée |
| 3 | `#203028` | Contours, noir |

Index `-1` (ou `.` dans les sources texte) = transparent. Une option « Palette » dans les options propose 4 palettes alternatives (Azur, Sépia, Gris, Nuit), appliquées en recolorant les 4 index au rendu.

- Tuiles : 8 × 8, assemblées en métatuiles 16 × 16 pour les cartes.
- Personnages du monde : 16 × 16, 4 directions × 2 frames de marche.
- Bestioles : face 48 × 48, dos 48 × 48.
- Portraits de dresseurs en combat : 48 × 48.
- Police : 8 × 8 pixels, accents français inclus.

Style : contours sombres à 1 pixel, ombrage en 2 teintes, silhouettes lisibles. Inspiration générale : jeux portables monochromes des années 90, sans reprendre de sprite existant.
