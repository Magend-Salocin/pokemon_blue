# Prompt 08 : audio chiptune

## Contexte

Lis d'abord `docs/GAME_DESIGN.md` (section 1 : musiques originales uniquement), `docs/ARCHITECTURE.md` et `docs/PROGRESS.md`.

Toutes les mélodies sont composées pour Bestiora Azur. Ne transcris, n'imite et ne paraphrase aucune mélodie existante, de jeu vidéo ou autre.

## Objectif

Un synthétiseur 4 voies dans l'esprit des consoles portables 8 bits, un séquenceur, 18 pistes originales et environ 30 effets sonores, branchés sur les hooks existants.

## À réaliser

1. **Synthé** (`src/audio/synth.js`), Web Audio API
   - Voie 1 et 2 : onde carrée à rapport cyclique 12,5 / 25 / 50 / 75 %, enveloppe de volume, glissando optionnel (voie 1).
   - Voie 3 : onde personnalisée 32 échantillons 4 bits (table modifiable).
   - Voie 4 : bruit (LFSR 15 bits et 7 bits) pour percussions et effets.
   - Bus musique et bus effets avec volumes séparés ; un effet sonore emprunte temporairement une voie (comme sur le matériel d'origine), la musique reprend ensuite.
   - Démarrage de l'`AudioContext` au premier input utilisateur.

2. **Format de piste** (`src/audio/tracks/*.js`)
   Format texte compact par voie, documenté dans `docs/AUDIO_FORMAT.md` : tempo, notes (`C4`, `D#5`), durées, silences, octave, volume, enveloppe, rapport cyclique, boucles (`[ ... ]x2`), point de bouclage de la piste. Parser pur testé.

3. **Séquenceur** (`src/audio/sequencer.js`)
   Ordonnancement en avance (lookahead 100 ms) pour un tempo stable, bouclage, fondu de sortie, changement de piste avec ou sans fondu, reprise de la piste de carte après un combat.

4. **Pistes originales** (18)
   `title`, `intro_professor`, `hometown`, `route_1` (enjouée), `route_2` (plus aventureuse), `town_1` (calme), `town_2` (portuaire), `halte`, `cave`, `forest`, `memory_tower` (inquiétante), `opal_syndicate`, `battle_wild`, `battle_trainer`, `battle_leader`, `battle_rival`, `battle_final` (Ligue et légendaires), `victory_wild` / `victory_trainer` (courtes, sans boucle), `ending` (thème de fin).
   Chaque piste de carte dure au moins 30 secondes avant de boucler ; les thèmes de combat au moins 45 secondes. Donne une identité commune : un motif de 4 à 6 notes propre au jeu, repris et varié dans `title`, `hometown` et `ending`.
   Jingles courts : badge obtenu, objet obtenu, objet clé obtenu, soin à la Halte, capture réussie, évolution réussie, montée de niveau.

5. **Effets sonores** (`src/audio/sfx.js`)
   Curseur, validation, annulation, collision, porte, escalier, saut de corniche, herbe, sortie de capsule, coup normal, super efficace, peu efficace, KO, boost, baisse de stat, secousse de capsule, capture, fuite, montée d'XP, « ! » de dresseur, achat, sauvegarde, surf, coupe, rocher, téléporteur, Cerf-volant, cris des bestioles.

6. **Cris procéduraux**
   `generateCry(species)` déterministe à partir du `seed` de sprite et des stats : 0,3 à 0,8 s, mélange carré + bruit, hauteur liée au poids. Chaque espèce a un cri distinct, les évolutions un cri proche mais plus grave.

7. **Branchement**
   Relie les hooks existants : musique par carte (`map.music`), intros de dresseurs, transitions de combat, sons des menus, cris en combat et dans le Bestiaire. Respecte les volumes des options.

8. **Jukebox debug**
   Dans le menu F1 : écouter chaque piste, chaque effet, le cri de chaque espèce.

9. **Tests**
   Parser de pistes (notes, boucles, erreurs explicites), déterminisme des cris, validation que toutes les pistes référencées par les cartes et classes de dresseurs existent (ajout au validateur).

## Critères d'acceptation

- Les 18 pistes et jingles se jouent sans craquement ni dérive de tempo pendant 5 minutes.
- Un effet sonore pendant la musique ne coupe pas la musique de façon audible au-delà de sa voie.
- Le volume 0 coupe réellement le son.
- `npm test` et `npm run validate` passent.

## Fin de session

Mets à jour `docs/PROGRESS.md`, puis commit `feat: synthé chiptune, pistes originales et effets`.
