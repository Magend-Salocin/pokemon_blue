# Carte du monde de Brumeval

Référence des cartes, de leurs liaisons et du verrouillage de la progression. Les prompts 10 et 11 étendent ce fichier. Les tailles sont en métatuiles (largeur × hauteur).

## Schéma de la région

Partie 1 (prompt 09) en traits pleins, partie 2 (prompt 10) en pointillés. Nord en haut.

```
                                   . . . . . . . . . . .  Givremont, Citadelle (nord-est)
                                   .
     Ombrecourt . . .            [Cendrelune]=[Tour de la Mémoire]
           .                         |   \
     Marais Gris . .            [Tunnel Obscur]  . . Route 7, Falaises de Bise . . Haute-Bise
                                     |
                                  Route 6 --g-- (Centrale abandonnée, fermée)
                                     |
            [Grotte des Cascades]  [Vireval]=[usine Opale]
               |        \            |
            Route 3  [Port-Ondine]==Route 4==Route 5
               |      (bateau-musée)  (pension)
         [Bois Murmurant]
               |
            Route 2
               |
         [Bourg-Sablon]
               |
            Route 1
               |
         [Hameau-de-Lys]
```

`|` et `==` : connexion sans transition ou entrée de bâtiment ; `--g--` : passage à Grappin.

## Cartes extérieures et liaisons (partie 1)

Les connexions exigent des bords de même taille (`docs/MAP_FORMAT.md`). Le passage d'une connexion est limité aux cases indiquées, le reste du bord est fermé par des arbres ou des falaises.

| Carte | Zone | Tileset | Taille | Liaisons |
|---|---|---|---|---|
| `hameau_de_lys` | debut | town | 20 × 18 | nord → `route_1` (colonnes 9-10) |
| `route_1` | debut | outdoor | 20 × 36 | sud → `hameau_de_lys`, nord → `bourg_sablon` (colonnes 9-10) |
| `bourg_sablon` | debut | town | 20 × 18 | sud → `route_1` (colonnes 9-10), est → `route_2` (lignes 8-9) |
| `route_2` | bois | outdoor | 32 × 18 | ouest → `bourg_sablon` (lignes 8-9) ; entrée du Bois par warp |
| `bois_murmurant` | bois | outdoor | libre | warps vers `route_2` et `route_3` |
| `route_3` | bois | outdoor | libre | warps vers `bois_murmurant` et `grotte_des_cascades` |
| `grotte_des_cascades` | bois | cave | libre | niveau 1, échelles vers `grotte_des_cascades_2` |
| `grotte_des_cascades_2` | bois | cave | libre | sortie en (22, 10) ↔ `port_ondine` (0, 8) |
| `port_ondine` | port | town | 24 × 18 | ouest : bouche de grotte en (0, 8) ; est → `route_4` (lignes 8-9) |
| `route_4` | port | outdoor | 32 × 18 | ouest → `port_ondine`, est → `route_5` (lignes 8-9) |
| `route_5` | port | outdoor | 32 × 18 | ouest → `route_4`, est → `vireval` (lignes 8-9) |
| `vireval` | port | town | 20 × 18 | ouest → `route_5` (lignes 8-9), nord → `route_6` (colonnes 9-10) |
| `route_6` | cendrelune | outdoor | 20 × libre | sud → `vireval` (colonnes 9-10) ; warp vers `tunnel_obscur` |
| `tunnel_obscur` | cendrelune | cave, sombre | libre | warps vers `route_6` et `cendrelune` |
| `cendrelune` | cendrelune | town | libre | warp vers `tunnel_obscur` ; bord est réservé à la Route 7 (prompt 10) |

Chaque zone a son dossier `src/data/maps/<zone>/`, ses dresseurs `src/data/trainers/<zone>.js` et ses textes `src/data/texts/<zone>.js`.

## Verrous de progression

| Verrou | Où | Condition | Effet sans la condition |
|---|---|---|---|
| Sortie nord du Hameau | `hameau_de_lys` | drapeau `got_starter` | La Pr Morvan arrête le joueur et l'emmène au labo |
| Sortie est de Bourg-Sablon | `bourg_sablon` | drapeau `has_bestiary` | Un PNJ barre la route vers la Route 2 |
| Entrée de la Grotte des Cascades | `route_3` | badge Roche | Un garde refuse le passage |
| Arbustes vers Vireval | `route_5` | Machette + badge Eau | Arbustes infranchissables |
| Arène Foudre | `vireval` | drapeau `usine_opale_cleared` | Porte de l'arène sans courant |
| Tunnel Obscur | `route_6` | Lanterne + badge Foudre | Le joueur recule devant l'obscurité |
| Tour de la Mémoire | `cendrelune` | badge Flore | Le gardien de la Tour refuse l'entrée |
| Centrale abandonnée | `route_6` | Grappin + badge Flore | Corniches `g` ; porte scellée jusqu'au prompt 10 |
| Route 7 | `cendrelune` | prompt 10 | Bord est fermé |

## Badges

| Badge | Champion | Arène | Effet |
|---|---|---|---|
| Roche | Garance | Bourg-Sablon, plaques qui écartent des rochers | Ouvre la Grotte des Cascades (garde de la Route 3) |
| Eau | Maël | Port-Ondine, dalles glissantes entre des bassins | Machette utilisable (couper) |
| Foudre | Sélène | Vireval, interrupteurs au sol qui coupent des barrières | Lanterne utilisable (éclairer) |
| Flore | Aubin | Cendrelune, labyrinthe de haies à couper | Grappin utilisable, entrée de la Tour de la Mémoire |

Les bestioles reçues par échange obéissent toujours (non géré, par simplicité).

## Objets de terrain (partie 1)

| Objet | Obtention | Badge requis |
|---|---|---|
| Machette | PNJ de la Route 5, après le badge Eau | Eau |
| Lanterne | Ingénieure de Vireval, après le badge Foudre | Foudre |
| Grappin | Sommet de la Tour de la Mémoire, après le lieutenant | Flore |

## Scénario (partie 1)

| Drapeau | Posé quand |
|---|---|
| `got_starter`, `starter_<espèce>` | Le joueur choisit sa bestiole au labo |
| `rival_1_done` | Après le 1er combat contre le rival (victoire ou défaite) |
| `parcel_received` | Le vendeur du Comptoir de Bourg-Sablon remet le Colis Morvan |
| `has_bestiary` | La Pr Morvan remet le Bestiaire et 5 capsules, le rival part devant |
| `bois_syndicat_vaincu` | Les sbires du Bois Murmurant sont battus |
| `usine_opale_cleared` | Le responsable de l'usine Opale de Vireval est battu |
| `tour_memoire_liberee` | Le lieutenant de la Tour est battu, Corvin apparaît puis part |
