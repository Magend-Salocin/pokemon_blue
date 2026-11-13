# Format des pistes audio

Toutes les mélodies sont composées pour Bestiora Azur (section 1 du game design). Une piste est un module de `src/audio/tracks/`, enregistré dans `src/audio/tracks/index.js`. Les effets sonores (`src/audio/sfx.js`) et les jingles utilisent le même format. `npm run validate` analyse toutes les pistes ; le menu F1 (mode dev) les fait écouter.

## Piste

```js
export default {
  id: 'route_1',      // id utilisé par les cartes (`music`) et src/data/music.js
  tempo: 124,         // noires par minute
  loop: true,         // false pour les jingles, victoires et effets
  channels: {
    1: 'P50 V12 S-3 C5 E5 G5 E5 C6:4 G5:4 | …',   // carré, glissando possible
    2: 'P25 V7 …',                                // carré
    3: 'W0 V12 …',                                // table d’onde
    4: 'N15 V9 S-2 X12:4 X3 X3 X5:4 X3:4 | …',    // bruit
  },
};
```

Toutes les voies d’une piste doivent avoir la même longueur et le même point de bouclage, sinon l’analyse échoue avec un message qui donne la longueur de chaque voie. Une piste peut construire ses chaînes en JavaScript (`src/audio/tracks/patterns.js` fournit basses, arpèges, batteries et accords nommés).

## Symboles

Les symboles sont séparés par des espaces. `// …` commente jusqu’à la fin de la ligne.

| Symbole | Effet |
|---|---|
| `C4`, `D#5`, `Eb3`, `A` | Note (lettre, `#` ou `b`, octave ; sans octave : octave courante). Voies 1 à 3. |
| `C4:8`, `G5:4.` | Note avec durée : `1` ronde, `2` blanche, `4` noire, `8` croche, `16`, `32` ; `.` pointée. |
| `R`, `R:2` | Silence (durée par défaut ou explicite). |
| `X0` à `X15`, `X3:16` | Bruit, du souffle aigu (`X0`) au grondement (`X15`). Voie 4. |
| `L8`, `L4.` | Durée par défaut (croche au départ). |
| `O4`, `>`, `<` | Octave courante, octave au-dessus, au-dessous. |
| `V0` à `V15` | Volume de départ des notes suivantes. |
| `S-3`, `S+1`, `S0` | Enveloppe : le volume baisse (`-`) ou monte (`+`) d’un cran tous les n/64 s ; `S0` la coupe. |
| `P12`, `P25`, `P50`, `P75` | Rapport cyclique du carré (voies 1 et 2). |
| `H-12`, `H7`, `H0` | Glissando vers n demi-tons pendant chaque note (voie 1), `H0` l’arrête. |
| `W0` à `W3` | Table d’onde de la voie 3 (`src/audio/waves.js` : 32 échantillons de 4 bits). |
| `N15`, `N7` | Bruit long (15 bits) ou métallique (7 bits). |
| `[ … ]x3`, `[ … ]` | Répétition (2 fois sans `x`), imbricable. |
| `@` | Point de bouclage : la piste repart d’ici (hors répétition, même temps sur toutes les voies). Sans `@`, elle repart du début. |
| `\|` | Barre de mesure (4/4) : erreur si la mesure n’est pas complète. |

Durées internes : 24 temps par noire, 96 par mesure.

## Exemple : jingle d’objet

```js
{
  id: 'jingle_item',
  tempo: 150,
  loop: false,
  channels: {
    1: 'P50 V12 C5:16 E5:16 G5:16 C6:16 E6:4 D6 E6 G6:4 | C6:2. R:4',
    2: 'P25 V8 E4:2 G4:2 | E4:2. R:4',
    3: 'W0 V10 C2:2 G2:2 | C2:2. R:4',
  },
}
```

## Lecture dans le jeu

- Musique : `hooks.playMusic(id)` (carte, combat, titre). Passer d’une piste de carte à une piste de combat (`battle_`, `victory_`, `encounter_`) mémorise la position ; la piste de carte reprend à cet endroit après le combat.
- Jingles (`jingle_…`) : `hooks.playSfx(id)` coupe la musique, joue le jingle, puis la musique reprend où elle était.
- Effets et cris (`cry_<espèce>`) : `hooks.playSfx(id)`. Un effet emprunte ses voies : la musique se tait sur ces voies seulement, le temps de l’effet.
- Volumes : options MUSIQUE et EFFETS (0 à 10) ; 0 coupe réellement le bus.
- Le son démarre à la première touche ou au premier clic (exigence des navigateurs) et se met en pause quand la fenêtre perd le focus.

## Pistes

Thèmes : `title`, `intro_professor`, `hometown`, `route_1`, `route_2`, `town_1`, `town_2`, `halte`, `cave`, `forest`, `memory_tower`, `opal_syndicate`, `battle_wild`, `battle_trainer`, `battle_leader`, `battle_rival`, `battle_final`, `victory_wild`, `victory_trainer`, `ending`.

Jingles : `jingle_item`, `jingle_key_item`, `jingle_badge`, `jingle_heal`, `jingle_capture`, `jingle_evolution`, `jingle_level_up`.

Repérage par un dresseur : `encounter_trainer`, `encounter_villain`, `encounter_rival` (choisis par `musicIntro` de la classe, voir `src/data/music.js`).

Le motif du jeu (montée d’une quinte, descente d’un ton, montée d’une tierce, descente d’un ton : ré, la, sol, si, la) ouvre `title`, revient plus lent dans `hometown` et ouvre puis conclut `ending`. Le validateur vérifie sa présence.
