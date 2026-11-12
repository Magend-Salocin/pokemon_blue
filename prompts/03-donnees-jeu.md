# Prompt 03 : données de jeu (types, attaques, bestioles, objets)

## Contexte

Lis d'abord `docs/GAME_DESIGN.md` (sections 1, 3, 5 et 6), `docs/ARCHITECTURE.md` et `docs/PROGRESS.md`.

Toutes les données sont originales : noms, descriptions du Bestiaire, attaques. Avant de valider chaque nom, vérifie qu'il ne ressemble pas à un nom d'une franchise existante (section 1). Les 9 starters et les légendaires ont déjà leurs noms dans le game design.

## Objectif

Produire toutes les données statiques du jeu, cohérentes et équilibrées, avec un validateur automatique.

## À réaliser

1. **Types** (`src/data/types.js`)
   - Les 15 types, nom affiché, icône d'atlas.
   - Table d'efficacité respectant les contraintes de la section 5. Documente chaque relation par un commentaire court (« Eau éteint Feu »).
   - `getEffectiveness(attackType, defenderTypes)`.

2. **Attaques** (`src/data/moves.js`), environ 165
   - Champs : `id`, `name` (12 caractères max pour tenir dans le menu), `type`, `category` (`physical` | `special` | `status`), `power`, `accuracy` (ou `null` = ne rate jamais), `pp`, `priority`, `effect` (identifiant d'effet), `effectChance`, `effectParams`, `highCrit`, `description` (2 lignes de 18 caractères max).
   - Au moins 8 attaques par type, réparties en puissance (40 à 120) ; environ 35 attaques de statut (boost, baisse de stat, altérations, soin, protection, météo non gérée).
   - Liste fermée des effets dans `src/data/move-effects.js` avec une description de chaque effet ; le moteur de combat (prompt 05) les implémentera tous. Garde la liste raisonnable (environ 40 effets) : dégâts simples, altération à X %, baisse/hausse de stat à X %, multi-coups, recul, vampirisme, soin 50 %, sommeil-repos, protection, charge en 2 tours, recharge, priorité, dégâts fixes, dégâts = niveau, OHKO, confusion, peur, piège, auto-KO, etc.
   - 6 attaques uniques aux légendaires/mythique.

3. **Bestioles** (`src/data/creatures.js`), 150 espèces
   - Champs : `id`, `number` (1 à 150), `name` (10 caractères max), `types` (1 ou 2), `baseStats` `{ hp, atk, def, spa, spd, spe }`, `growth` (`fast` | `medium` | `slow`), `catchRate` (3 à 255), `baseExp`, `trainingYield` (stat + points), `evolution` (`{ to, method: 'level'|'item'|'friendship', value }` ou tableau), `learnset` (`[[niveau, moveId], ...]`), `teachable` (non utilisé, laisser vide), `category` (« Bestiole Renard »), `height`, `weight`, `description` (3 lignes de 18 caractères), `habitat`, `sprite` (`{ plan, seed, size, features, pattern }` ou `'handmade'`).
   - Numérotation : 1-9 starters, puis ordre approximatif de rencontre dans le monde (section 4), légendaires 146-149, mythique 150.
   - Répartition et totaux de stats selon les sections 5 et 6. Les formes finales tardives sont plus fortes que les formes de début de jeu.
   - Chaque bestiole connaît au moins 4 attaques au niveau où on peut la rencontrer, et apprend des attaques de son type à un rythme régulier jusqu'au niveau 60.
   - Les specs `sprite` exploitent la variété du générateur : plan de corps cohérent avec le concept, caractéristiques liées au type (flammes pour Feu, nageoires pour Eau, cristaux pour Roche…). Une lignée partage le même `seed`.

4. **Objets** (`src/data/items.js`), environ 45
   Champs : `id`, `name`, `pocket` (`items` | `capsules` | `key`), `price` (0 si non vendable), `description`, `use` (`{ context: 'field'|'battle'|'both'|'none', effect, params }`).
   Inclure : 4 capsules, potions (4 niveaux), Rappel, Rappel Max, soins de statut (5 + Total Soin), Élixirs de PP, Super Bonbon, 5 pierres d'évolution, 6 vitamines (+points d'entraînement), Répulsifs (3), Corde de Sortie, objets de terrain (Machette, Lanterne, Grappin, Bouée, Cerf-volant, Gants de force), objets clés de scénario (Colis de la professeure, Carte d'accès Opale, Ticket de bateau, etc.).

5. **Classes de dresseurs** (`src/data/trainer-classes.js`)
   Environ 30 classes : `id`, `name`, `portrait` (id d'atlas), `moneyBase`, `musicIntro` (`trainer` | `villain` | `rival` | `leader`).

6. **Utilitaires de calcul** (`src/data/formulas.js`)
   Fonctions pures pour les formules de stats, courbes d'expérience (`expForLevel(growth, level)`), `levelForExp`. Les formules sont celles de la section 5.

7. **Validateur** (`tools/validate-data.js`, `npm run validate`)
   Vérifie : unicité des `id` et `number`, références valides (types, attaques, évolutions, objets), longueurs maximales des noms et descriptions (en caractères affichables par la police), learnsets triés, totaux de stats dans les plages, chaque type a au moins 6 bestioles, chaque effet d'attaque est dans la liste fermée, aucune chaîne interdite de la section 1 (liste de mots dans `tools/forbidden-words.js`, comparaison insensible à la casse et aux accents). Le validateur sera étendu aux cartes et dresseurs plus tard : structure-le en vérificateurs indépendants.

8. **Atlas**
   Relance `npm run atlas` pour générer les 150 bestioles dans `creatures.png` et vérifie-les dans la visionneuse. Ajuste les specs des espèces dont le rendu est raté.

9. **Tests**
   Table de types (cas connus et contraintes d'équilibre de la section 5), formules de stats et d'XP (valeurs calculées à la main), cohérence des évolutions (pas de cycle, niveau d'évolution croissant dans la lignée).

10. **Document** `docs/BESTIAIRE.md`
    Tableau généré par un script (`tools/export-bestiary-md.js`) : numéro, nom, types, total de stats, évolution, habitat. Sert de référence pour les prompts de contenu suivants.

## Critères d'acceptation

- `npm run validate` et `npm test` passent.
- 150 bestioles, environ 165 attaques, environ 45 objets.
- `docs/BESTIAIRE.md` existe et est à jour.
- La planche de 150 sprites dans la visionneuse est variée et sans sprite vide ou cassé.

## Hors périmètre

Dresseurs individuels et tables de rencontres (prompts 09 à 11), logique de combat.

## Fin de session

Mets à jour `docs/PROGRESS.md`, puis commit `feat: données de types, attaques, bestioles et objets`.
