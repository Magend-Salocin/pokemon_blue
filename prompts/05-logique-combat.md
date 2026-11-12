# Prompt 05 : moteur de combat (logique pure)

## Contexte

Lis d'abord `docs/GAME_DESIGN.md` (section 5), `docs/ARCHITECTURE.md` et `docs/PROGRESS.md`. Les données (03) existent.

## Objectif

Implémenter tout le moteur de combat sans aucun rendu, sous forme de fonctions pures pilotées par un RNG injecté, entièrement testé. L'interface (prompt 06) ne fera que consommer les événements produits.

## Conception

- `src/battle/logic/creature.js` : `createCreature(speciesId, level, rng, options)` → instance `{ uid, species, nickname, level, exp, genes, training, stats, hp, moves: [{ id, pp, maxPp }], status, friendship, originalTrainer, caughtIn }`. `recalculateStats`. Moves par défaut = 4 dernières du learnset au niveau donné.
- `src/battle/logic/battle-state.js` : état sérialisable `{ kind: 'wild'|'trainer', sides: [player, enemy], turn, ... }`, chaque côté avec équipe, actif, modificateurs de stats (−6 à +6), volatils.
- `src/battle/logic/engine.js` :
  - `createBattle(config, rng)`
  - `getAvailableActions(state, side)`
  - `resolveTurn(state, playerAction, enemyAction, rng)` → `{ state, events }`
  - Actions : `{ type: 'move', index }`, `{ type: 'switch', index }`, `{ type: 'item', itemId, target }`, `{ type: 'run' }`.
- **Événements** : liste ordonnée d'objets simples décrivant ce qui s'est passé, dans l'ordre d'affichage : `move_used`, `damage`, `effectiveness`, `critical`, `miss`, `status_applied`, `status_damage`, `stat_change`, `faint`, `switch_in`, `switch_out`, `item_used`, `capture_shake`, `capture_success`, `capture_fail`, `run_success`, `run_fail`, `exp_gain`, `level_up`, `learn_move_prompt`, `evolution_pending`, `money_gain`, `battle_end`, `message`. Chaque événement contient les données nécessaires à l'animation et au texte (pas de texte formaté dans la logique : seulement des clés et paramètres).

## À réaliser

1. Ordre d'action : changement et objets d'abord, puis priorité, puis vitesse (paralysie ÷ 4 sur la vitesse), égalité tirée au hasard.
2. Formules de dégâts, critique, STAB, efficacité, aléa, précision/esquive (section 5).
3. **Tous les effets** de `src/data/move-effects.js`, un module par famille dans `src/battle/logic/effects/`. Aucun effet ne doit rester non implémenté : le test de couverture échoue sinon.
4. Altérations majeures et volatiles avec leurs règles (dégâts de fin de tour 1/8 PV, poison grave croissant, sommeil 1-3 tours, gel 20 % de dégel, paralysie 25 % d'échec, confusion 1-4 tours et 33 % d'auto-dégâts puissance 40, peur, piège 2-5 tours).
5. Fin de tour : dégâts de statut, piège, vampirisme, dans un ordre fixe documenté.
6. KO, remplacement forcé (le joueur choisit : événement `need_switch`), fin de combat (tous KO d'un côté).
7. **Capture** (section 5) avec événements de secousses ; impossible contre un dresseur (message).
8. **Fuite** : réussite selon les vitesses et le nombre de tentatives ; impossible contre un dresseur.
9. **Expérience** : partagée entre les bestioles ayant participé et non KO ; ×1,5 contre un dresseur ; points d'entraînement ; montée de niveau avec recalcul des stats (PV courants augmentés de la différence) ; apprentissage de nouvelles attaques (si 4 attaques : événement `learn_move_prompt`, la décision revient via `answerLearnMove(state, choice)`) ; plusieurs niveaux d'un coup gérés.
10. **Évolution** : signalée en fin de combat (`evolution_pending`), appliquée par `evolveCreature(creature, targetId)` hors combat.
11. **Objets en combat** : potions, soins de statut, Rappel sur une bestiole de l'équipe, capsules.
12. **IA ennemie** (`src/battle/logic/ai.js`), 3 niveaux selon la classe de dresseur :
    - `wild` : attaque au hasard ;
    - `basic` : préfère les attaques super efficaces et évite les inefficaces, utilise une attaque de statut si utile ;
    - `smart` (champions, Ligue, rival tardif) : estime les dégâts, change de bestiole si gros désavantage, utilise des potions sous 25 % PV (2 par combat max).
13. **Lutte** quand plus aucun PP : attaque de secours de type Normal avec recul.
14. **Tests** (au moins 60) : dégâts sur cas calculés à la main, chaque effet d'attaque, ordre de tour, chaque altération, capture (probabilités à seed fixe), XP et montée de plusieurs niveaux, apprentissage, IA (choisit l'attaque super efficace), fin de combat, Lutte, test de couverture des effets.
15. **Simulateur** (`tools/simulate-battle.js`) : fait combattre deux équipes IA en console avec un journal lisible. Sert à l'équilibrage.

## Critères d'acceptation

- `npm test` passe avec tous les tests de combat.
- `node tools/simulate-battle.js --seed 42` produit un combat complet lisible et reproductible.
- Aucun import de DOM ou de module `gfx`/`ui` dans `src/battle/logic`.

## Hors périmètre

Interface, animations, textes formatés.

## Fin de session

Mets à jour `docs/PROGRESS.md` (liste des événements et leur contrat), puis commit `feat: moteur de combat pur et IA`.
