# Prompts d'implémentation de Bestiora Azur

13 prompts à exécuter dans l'ordre, un par session Claude Code avec le modèle Opus. Chaque prompt part du dépôt dans l'état laissé par le précédent.

## Utilisation

```powershell
cd d:\VisualCode_Perso\pokemon_blue
claude --model opus
```

Puis, dans la session :

```
Exécute le prompt prompts/01-socle-electron.md
```

Ouvrir une nouvelle session pour chaque prompt : le contexte reste court et chaque étape s'appuie sur les fichiers `docs/` plutôt que sur l'historique de conversation.

## Ordre et dépendances

| # | Fichier | Dépend de | Taille |
|---|---|---|---|
| 01 | `01-socle-electron.md` | rien | M |
| 02 | `02-graphismes-atlas.md` | 01 | L |
| 03 | `03-donnees-jeu.md` | 01 | XL |
| 04 | `04-moteur-carte.md` | 01, 02 | L |
| 05 | `05-logique-combat.md` | 03 | L |
| 06 | `06-interface-combat.md` | 02, 04, 05 | L |
| 07 | `07-menus-systemes.md` | 04, 06 | L |
| 08 | `08-audio.md` | 01 | M |
| 09 | `09-monde-partie-1.md` | 04 à 08 | XL |
| 10 | `10-monde-partie-2.md` | 09 | XL |
| 11 | `11-ligue-post-jeu.md` | 10 | L |
| 12 | `12-sauvegarde-finition.md` | 11 | M |
| 13 | `13-recette.md` | 12 | L |

02, 03 et 08 sont indépendants entre eux et peuvent tourner en parallèle dans des worktrees séparés si besoin.

Les prompts marqués XL peuvent dépasser une session. Dans ce cas, relancer avec : `Reprends le prompt prompts/09-monde-partie-1.md là où docs/PROGRESS.md indique que tu t'es arrêté.`

## Vérifier entre deux étapes

Après chaque prompt :

1. `npm test` et `npm run validate` passent.
2. `npm run dev` lance le jeu et la fonctionnalité de l'étape est visible.
3. `docs/PROGRESS.md` contient l'entrée de la session.
4. Un commit a été créé.

Si une étape est ratée, `git reset --hard HEAD~1` puis relancer le même prompt.

## Règles communes (rappelées dans chaque prompt)

- Lire `docs/GAME_DESIGN.md`, `docs/ARCHITECTURE.md` et `docs/PROGRESS.md` avant toute chose.
- Respecter les règles d'originalité (section 1 du game design).
- Ne pas réécrire ce qui existe sans raison ; étendre.
- Tests verts, données valides, jeu lançable en fin de session.
- Mettre à jour `docs/PROGRESS.md` et créer un commit.
