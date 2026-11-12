# Format des cartes

Une carte est un module de `src/data/maps/` qui exporte un objet par défaut, enregistré dans `src/data/maps/index.js` (`MAPS` pour le jeu, `TEST_MAPS` pour les cartes de test chargées en mode dev). `npm run validate` vérifie toutes les cartes, `npm run map-preview -- <id>` exporte un aperçu dans `out/maps/<id>.png`.

Coordonnées en métatuiles 16 × 16, origine en haut à gauche. L'écran affiche 10 × 9 métatuiles.

## Exemple complet

```js
export default {
  id: 'bourg_sablon',            // snake_case, identique à la clé dans index.js
  name: 'Bourg-Sablon',
  tileset: 'town',               // outdoor | town | indoor | cave | special
  music: 'town_1',
  border: 'T',                   // optionnel : caractère dessiné hors carte (sinon noir)
  dark: false,                   // grotte sombre : cercle de 3 métatuiles sans la Lanterne
  legend: { '%': 'bridge_h' },   // optionnel : complète ou remplace la légende par défaut
  layers: {
    ground: [
      'TTTTTTTTTTTTTT',
      'TT__________TT',
      'TT__________TT',
      'TT__________TT',
      'TT___:::__S_TT',
      'TT,,,:::____TT',
      'TTTTT:::TTTTTT',
    ],
    collision: [                 // optionnel, mêmes dimensions que ground
      '..............',          // '.' = règle de la tuile, '#' = bloquant, '_' = praticable
    ],
  },
  structures: [{ type: 'halte', x: 3, y: 1, width: 4, door: 1 }],
  encounters: {
    rate: 8,                     // % de rencontre par pas sur une tuile concernée
    grass: [{ creature: 'pivelin', minLevel: 2, maxLevel: 4, weight: 60 }],
    water: [{ creature: 'goujonet', minLevel: 10, maxLevel: 12, weight: 1 }],
    cave: [],                    // toute tuile praticable de la carte (grottes)
  },
  warps: [{ x: 4, y: 3, to: 'halte_bourg_sablon', toX: 4, toY: 7 }],
  npcs: [
    { id: 'vieil_homme', sprite: 'vieil_homme', x: 9, y: 2, facing: 'down', movement: 'look', script: 'conseil' },
    { id: 'gamin', sprite: 'gamin', x: 6, y: 5, facing: 'down', movement: 'wander', radius: 2,
      script: [{ cmd: 'say', text: 'bourg_sablon_gamin' }], hideIf: 'gamin_parti' },
    { id: 'garde', sprite: 'ouvrier', x: 7, y: 6, facing: 'down', movement: 'path', path: ['left', 'right'],
      script: [{ cmd: 'say', text: 'bourg_sablon_garde' }] },
  ],
  trainers: [{ id: 'gamin_leo', sprite: 'gamin', x: 11, y: 5, facing: 'left', sight: 4, trainer: 'gamin_leo' }],
  signs: [{ x: 10, y: 4, text: 'sign_bourg_sablon' }],
  items: [{ x: 2, y: 5, item: 'potion', flag: 'item_bourg_sablon_1' }],
  hiddenItems: [{ x: 12, y: 1, item: 'antidote', flag: 'hidden_bourg_sablon_1' }],
  triggers: [{ x: 5, y: 6, w: 3, h: 1, once: true, flag: 'bourg_sablon_intro', script: 'intro' }],
  connections: { north: 'route_2', south: 'route_1', east: null, west: null },
  scripts: {
    conseil: [{ cmd: 'say', text: 'bourg_sablon_conseil' }],
    intro: [{ cmd: 'say', text: 'bourg_sablon_intro' }],
  },
};
```

## Couches et légende

`ground` est une liste de chaînes, une par ligne, toutes de même longueur. Chaque caractère est converti en id de métatuile par la légende : celle du tileset (ci-dessous), complétée par `legend`. Un caractère inconnu fait échouer le chargement et la validation.

Une entrée de légende peut être un motif `{ pattern: [['tree_tl', 'tree_tr'], ['tree_bl', 'tree_br']] }` : la case choisie dépend de la position dans la suite de caractères identiques, en partant de son coin haut-gauche. Écrire `TT` sur deux lignes donne un arbre complet ; une forêt de 4 × 4 `T` donne 4 arbres.

| Tileset | Caractères par défaut |
|---|---|
| outdoor | `.` herbe, `,` herbe haute, `:` chemin, `s` sable, `*` fleurs, `T` arbre 2 × 2, `b` arbuste (Machette), `o` rocher (Gants), `v` `<` `>` corniches (bas, gauche, droite), `#` falaise, `g` corniche à Grappin, `~` eau, `F` barrière, `S` panneau, `M` boîte aux lettres, `=` `\|` ponts |
| town | comme outdoor, plus `_` sol de ville |
| indoor | `.` parquet, `,` carrelage, `c` moquette, `r` tapis, `m` paillasson de sortie, `#` mur, `w` mur à fenêtre, `t` table 2 × 2, `h` chaise, `B` lit (2 de haut), `L` étagère (2 de haut), `P` plante, `[` `-` `]` comptoir, `K` terminal de stockage, `H` machine de soin, `U` `D` escaliers |
| cave | `.` sol, `#` paroi, `U` `D` échelles, `~` eau, `A` stalagmite, `i` glace |
| special | `.` `,` sols de la Tour, `l` sol de labo, `X` téléporteur, `f` sol de la Ligue, `c` tapis de la Ligue, `~` lave, `#` pilier de cristal |

Les drapeaux (bloquant, herbe, eau, corniche…) viennent des métatuiles (`assets/atlas/tiles.json`). `collision` ne sert qu'aux exceptions.

## Structures

`structures` pose des bâtiments par-dessus `ground`, sans les dessiner case par case.

| type | Taille | Options |
|---|---|---|
| `house_a`, `house_b`, `house_c` | `width` × 3 | `width` (défaut 4), `door` : colonne de la porte (défaut 1) |
| `halte`, `comptoir`, `arena`, `lab` | `width` × 3, emblème au centre du toit | idem |
| `factory` | `width` × 3, cheminée en 2e colonne | idem |
| `tree` | 2 × 2 | - |
| `lighthouse` | 1 × 3, porte en bas | - |
| `turbine` | 1 × 2 | - |

La porte d'une structure est praticable : on y place un warp.

## Entités

- `warps` : marcher sur `(x, y)` charge `to` en `(toX, toY)`. Le joueur garde son orientation et fait un pas s'il le peut : entrer en montant sur une porte fait arriver sur le paillasson, puis avancer d'une case vers le haut. Les cases de départ et d'arrivée doivent être praticables.
- `npcs` : `movement` vaut `static`, `look` (tourne au hasard), `wander` (dans `radius` cases autour de sa position) ou `path` (boucle sur `path`). `script` est un nom (dans `scripts` de la carte ou `src/data/scripts.js`) ou une liste de commandes. `showIf` / `hideIf` : affiché seulement si le drapeau est posé / absent.
- `trainers` : repère le joueur en ligne droite jusqu'à `sight` cases (1 à 5), bloquée par les obstacles. `trainer` référence `src/data/trainers.js`. Une fois battu, le drapeau `trainer_<id>` est posé et il dit son texte `after`.
- `signs` : A face au panneau affiche `text` (id de `src/data/texts/`).
- `items` : objet visible et bloquant, ramassé une fois (`flag`). `hiddenItems` : invisible, trouvé avec A face à la case.
- `triggers` : rectangle `x, y, w, h` déclenché en y entrant. `once: true` pose `flag` (ou `trigger_<carte>_<index>`) et ne se déclenche plus.

## Connexions

`connections` relie des cartes extérieures sans écran de transition : la carte voisine est visible en bordure et le défilement est continu. Une connexion doit être réciproque (`a.south = 'b'` impose `b.north = 'a'`), et les bords reliés doivent avoir la même taille (même largeur au nord et au sud, même hauteur à l'est et à l'ouest). Le passage se fait sur toute la longueur du bord : on le limite avec des arbres ou des falaises.

## Scripts

Liste de commandes `{ cmd, ... }` exécutée par `src/overworld/script-runner.js`. Les textes sont des ids de `src/data/texts/`, avec les variables `{PLAYER}`, `{RIVAL}`, `{CREATURE}`, `{ITEM}`, `{NUMBER}` et `\f` pour changer de page.

| Commande | Champs |
|---|---|
| `say` | `text` |
| `ask` | `text`, `yes`, `no` (listes) |
| `move` | `actor` (`player` ou id de PNJ), `path` (directions), `async` |
| `wait_moves` | attend les `move` asynchrones |
| `face` | `actor`, `direction` (`up`, `down`, `left`, `right`, `player`) |
| `wait` | `seconds` |
| `set_flag`, `clear_flag` | `flag` |
| `if_flag`, `if_item`, `if_badge` | `flag` / `item` (+ `count`) / `badge`, `then`, `else` |
| `give_item`, `take_item` | `item`, `count`, `silent` (pas de message) |
| `give_creature` | `creature`, `level` |
| `give_money`, `give_badge` | `amount` / `badge` |
| `heal_party` | - |
| `battle` | `trainer`, `onLose` : `blackout` (défaut) ou `continue` |
| `wild_battle` | `creature`, `level` |
| `warp` | `map`, `x`, `y`, `facing` |
| `show_actor`, `hide_actor` | `actor` |
| `play_music`, `play_sfx` | `track` / `sfx` |
| `fade` | `direction` (`out`, `in`), `color` |
| `shake_screen` | `seconds` |
| `open_menu` | `menu` (`shop`, `storage`, `nickname`, `party`, `bag`, `bestiary`, `heal`), `params` |
| `call` | `script` (nom) |
| `set_rival_name`, `choose_starter` | - |
| `end` | arrête le script |

Une défaite en `blackout` arrête le script, soigne l'équipe et ramène à la dernière Halte.

## Objets de terrain

Interaction avec A face à la tuile, seulement avec l'objet et le badge (`src/data/field-abilities.js`) ; sinon un message explique ce qui manque.

| Action | Tuile | Objet | Badge |
|---|---|---|---|
| Couper | `b` arbuste | Machette | Eau |
| Pousser | `o` rocher | Gants de Force | Vent |
| Escalader (franchit la corniche, dans les deux sens) | `g` | Grappin | Flore |
| Surfer | `~` eau | Bouée | Vent |
| Éclairer (automatique dans les cartes `dark`) | - | Lanterne | Foudre |

Un arbuste coupé ou un rocher poussé revient quand on recharge la carte. La tuile laissée est `clearTile` (défaut selon le tileset : herbe, sol de ville, parquet, sol de grotte).
