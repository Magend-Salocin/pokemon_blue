# Prompt 06 : interface et animations de combat

## Contexte

Lis d'abord `docs/GAME_DESIGN.md`, `docs/ARCHITECTURE.md` et `docs/PROGRESS.md` (notamment le contrat des événements de combat du prompt 05). Moteur (01), atlas (02), carte (04) et logique de combat (05) existent.

## Objectif

Brancher le vrai combat dans le jeu : scène de combat complète, lisible, animée, qui joue la liste d'événements de la logique, et retour propre sur la carte.

## À réaliser

1. **Scène** `src/battle/ui/battle-scene.js`, remplace le `startBattle` provisoire du prompt 04.
   - Entrée : `{ kind, enemyParty, trainer?, music?, canRun, onLose }` ; sortie : Promise `{ result: 'win'|'lose'|'run'|'caught', caughtCreature? }`.

2. **Mise en page 160 × 144**
   - Ennemi en haut à droite (sprite face 48 × 48), cadre nom + Nv + barre de PV en haut à gauche.
   - Joueur en bas à gauche (sprite dos), cadre nom + Nv + PV chiffrés + barre de PV + barre d'XP en bas à droite.
   - Boîte de texte en bas, réutilisant la boîte de dialogue du prompt 01.
   - Indicateur d'équipe (capsules pleines/KO) à l'entrée.

3. **Menus**
   - Menu principal 2 × 2 : ATTAQUE, SAC, ÉQUIPE, FUITE.
   - Menu d'attaque : 4 attaques, à côté type et PP restants de l'attaque sélectionnée.
   - Sac : sous-menu par poche (objets, capsules), filtrés aux objets utilisables en combat.
   - Équipe : réutilise l'écran d'équipe (version minimale ici si le prompt 07 n'est pas fait : liste, PV, statut, choix ; elle sera remplacée par le composant complet).

4. **Séquences d'entrée et de sortie**
   - Sauvage : glissement des deux côtés, cri, « Un {CREATURE} sauvage apparaît ! ».
   - Dresseur : portrait du dresseur, « {TRAINER} veut se battre ! », envoi de la bestiole (capsule qui s'ouvre), le portrait du joueur sort.
   - Victoire contre dresseur : retour du portrait, texte de défaite du dresseur, argent gagné.
   - Défaite : « {PLAYER} n'a plus de bestiole en forme… », écran noir, retour à la dernière Halte avec la moitié de l'argent (si `onLose: 'blackout'`).

5. **Lecteur d'événements** (`src/battle/ui/event-player.js`)
   Joue chaque événement de façon séquentielle et asynchrone : texte + animation + son. Tables de textes dans `src/data/text/battle-fr.js` (une clé par type d'événement, avec variables). Exemples : « {CREATURE} utilise {MOVE} ! », « C'est super efficace ! », « Ce n'est pas très efficace… », « Coup critique ! », « {CREATURE} est K.O. ! ».

6. **Animations**
   - Barre de PV qui descend progressivement, couleur selon le seuil (> 50 %, > 20 %, ≤ 20 %), PV chiffrés qui défilent.
   - Barre d'XP qui se remplit, plusieurs niveaux d'affilée.
   - Clignotement du défenseur touché, secousse de l'écran pour les coups puissants.
   - Animation d'attaque par type (15 animations courtes et originales en sprites simples : flammes, gouttes, feuilles, éclairs, cristaux de glace, poings, bulles toxiques, rochers, rafales, étoiles arcanes, dards, ombres, éclats métalliques, onde, impact neutre) + animations génériques pour boost et baisse de stat.
   - KO : le sprite glisse vers le bas et disparaît.
   - Capture : la capsule est lancée en arc, la bestiole est aspirée, 0 à 3 secousses, succès (étoiles) ou échec (la bestiole ressort).
   - Montée de niveau : fenêtre des stats avec les gains, puis les nouvelles valeurs.

7. **Choix interactifs pendant les événements**
   - `need_switch` : écran d'équipe obligatoire (pas d'annulation).
   - Contre un dresseur, quand son prochain envoi est annoncé : « Changer de bestiole ? » Oui/Non.
   - `learn_move_prompt` : « Oublier une attaque pour {MOVE} ? », sélection de l'attaque à oublier avec ses infos, confirmation.
   - Capture réussie : « Donner un surnom ? » (saisie de nom, voir 8), envoi au stockage si l'équipe est pleine, inscription au Bestiaire.

8. **Saisie de nom** (`src/ui/name-entry.js`)
   Grille de caractères (majuscules, minuscules, accents, ponctuation simple), 10 caractères max, fin, effacer. Utilisée aussi pour le joueur et le rival (prompt 09).

9. **Évolution** (`src/ui/evolution-scene.js`)
   Après le combat pour chaque `evolution_pending` : alternance de silhouettes qui accélère, B annule (sauf objet), texte final, apprentissage éventuel d'attaque au nouveau stade.

10. **Mise à jour de l'état**
    PV, PP, statut, XP, niveaux, argent, Bestiaire (vu à la rencontre, capturé à la capture) et drapeau du dresseur battu écrits dans `game-state` à la fin du combat.

11. **Mode debug**
    Depuis le menu F1 : lancer un combat contre n'importe quelle espèce et niveau, ou contre une équipe IA aléatoire.

## Critères d'acceptation

- Un combat sauvage complet sur les cartes de test : attaque, sac, équipe, fuite, capture avec surnom, montée de niveau avec nouvelle attaque, évolution.
- Un combat de dresseur avec 3 bestioles, changement forcé, victoire et argent ; une défaite avec retour à la Halte (ou au point de départ des cartes de test).
- Aucune animation ne bloque ; A accélère le texte ; tout est lisible à 160 × 144.
- `npm test` passe.

## Hors périmètre

Menus hors combat complets (07), musique (08, brancher seulement les hooks).

## Fin de session

Mets à jour `docs/PROGRESS.md`, puis commit `feat: interface et animations de combat`.
