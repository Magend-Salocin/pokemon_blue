# Prompt 07 : menus et systèmes hors combat

## Contexte

Lis d'abord `docs/GAME_DESIGN.md`, `docs/ARCHITECTURE.md` et `docs/PROGRESS.md`. Exploration (04) et combat (06) fonctionnent.

## Objectif

Implémenter tous les menus et systèmes de jeu hors combat, avec un composant de liste/menu réutilisable et une navigation cohérente partout (A valide, B revient, curseur ▶, répétition auto).

## À réaliser

1. **Composants UI** (`src/ui/components/`)
   Liste verticale avec défilement et flèches, menu en grille, fenêtre de confirmation, fenêtre de quantité (+/−, prix total), fenêtre d'argent. Tous basés sur `window-frame.js`.

2. **Menu Start** (fenêtre à droite)
   BESTIAIRE (après obtention), BESTIOLES, SAC, {PLAYER} (carte de dresseur), SAUVER, OPTIONS, FERMER. Les entrées non débloquées sont masquées.

3. **Équipe**
   - Liste des 6 avec icône animée, nom, Nv, barre de PV, PV chiffrés, statut.
   - Actions : RÉSUMÉ, ORDRE (échanger deux positions), OBJET DE TERRAIN (si applicable : Cerf-volant), ANNULER.
   - Écran de résumé sur 3 pages : (1) sprite, numéro, nom, types, dresseur d'origine, XP et XP restante ; (2) stats ; (3) attaques avec type, PP, puissance, précision et description. Gauche/Droite change de page, Haut/Bas change de bestiole.
   - Variante « choisir une bestiole » réutilisée par les objets, le combat et les scripts.

4. **Sac**
   Poches Objets / Capsules / Objets clés (gauche/droite). Actions UTILISER, JETER (sauf clés), ANNULER. Effets de terrain : soins, Rappels, pierres d'évolution (lance la scène d'évolution), Super Bonbon (monte d'un niveau avec gestion des attaques), vitamines, Répulsif (compteur de pas), Corde de Sortie (retour à l'entrée du donjon), Cerf-volant (liste des villes visitées).

5. **Bestiaire**
   - Liste numérotée : « ----- » si jamais vu, nom si vu, icône de capsule si capturé. Compteurs vus/capturés.
   - Fiche : sprite, catégorie, taille, poids, description (seulement si capturé), types.
   - Zones : carte de la région simplifiée (dessinée en tuiles, originale) avec les zones où l'espèce apparaît.

6. **Carte de dresseur**
   Nom, argent, temps de jeu, nombre au Bestiaire, 8 emplacements de badges.

7. **Halte** (script réutilisable `call: 'halte_heal'`)
   Dialogue de l'infirmière, animation de la machine de soin, soin complet, mise à jour du point de retour en cas de défaite.

8. **Comptoir**
   ACHETER / VENDRE / QUITTER, inventaire défini par carte et dépendant des badges, quantité, argent, vente à moitié prix.

9. **Stockage** (terminal des Haltes)
   12 boîtes de 30, nom de boîte modifiable, DÉPOSER (garder au moins 1 bestiole en forme dans l'équipe), RETIRER, DÉPLACER, RELÂCHER (avec confirmation), résumé.

10. **Pension** (Route 4)
    Dépôt d'une bestiole, gain d'1 XP par pas, apprentissage automatique des attaques, récupération payante (100 + 100 × niveaux gagnés).

11. **Options**
    Vitesse du texte, animations de combat ON/OFF, style de combat (Choix / Défini), volume musique et effets, palette (5 palettes), échelle de fenêtre / plein écran, remappage clavier. Persistées dans la sauvegarde et dans un fichier d'options séparé.

12. **Échanges PNJ** (commande de script `trade`)
    Le PNJ demande une espèce précise, propose la sienne avec un surnom et un dresseur d'origine fixés, animation d'échange simple.

13. **Écran titre et nouvelle partie**
    - Titre : logo, Azurel en silhouette animée, « APPUYEZ SUR START ».
    - Menu : CONTINUER (si sauvegarde), NOUVELLE PARTIE, OPTIONS.
    - L'introduction de la professeure est écrite au prompt 09 ; ici, NOUVELLE PARTIE lance la carte de départ de test.

14. **Tests**
    Logique pure de l'inventaire (ajout, retrait, limites 99), du stockage (dépôt, retrait, contraintes), des effets d'objets de terrain, du Comptoir (prix, argent insuffisant).

## Critères d'acceptation

- Tous les menus accessibles et navigables uniquement au clavier/manette, sans état bloqué, B ramène toujours en arrière.
- Soigner à une Halte, acheter et vendre, déposer et retirer au stockage, utiliser une pierre d'évolution, consulter le Bestiaire avec une capture.
- `npm test` et `npm run validate` passent.

## Hors périmètre

Sauvegarde sur disque réelle (12), contenu du monde.

## Fin de session

Mets à jour `docs/PROGRESS.md`, puis commit `feat: menus, sac, bestiaire, halte, comptoir et stockage`.
