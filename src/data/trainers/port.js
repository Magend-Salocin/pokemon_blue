// Trainers of the zone « port » (prompt 09): Port-Ondine, Routes 4 and 5, Vireval, usine Opale.
import { trainer } from './helpers.js';

export default [
  // Port-Ondine and bateau-musée (13-18)
  trainer('pecheur_gaston', 'pecheur', 'Gaston', ['goujonet:14', 'goujonet:15', 'crabouille:16']),
  trainer('marin_yves', 'marin', 'Yves', ['crabouille:16', 'lapugil:16']),
  trainer('marin_hugo', 'marin', 'Hugo', ['anguilet:15', 'salamoue:16', 'goujonet:17']),

  // Arène Eau
  trainer('nageur_theo', 'nageur', 'Théo', ['goujonet:16', 'ombrelle:17']),
  trainer('pecheur_rene', 'pecheur', 'René', ['crabouille:17', 'goujarde:18']),
  trainer('mael', 'champion', 'Maël', ['goujonet:17', 'crabouille:18', 'ombrelle:18', 'goujarde:20'], {
    portrait: 'portrait/mael', ai: 'smart', last: true,
  }),

  // Route 4 (14-18)
  trainer('nageur_bastien', 'nageur', 'Bastien', ['goujonet:15', 'ombrelle:16']),
  trainer('nageuse_clara', 'nageuse', 'Clara', ['ombrelle:16', 'crabouille:17']),
  trainer('pecheur_marcel', 'pecheur', 'Marcel', ['goujonet:14', 'goujonet:15', 'goujarde:18']),
  trainer('pecheur_alain', 'pecheur', 'Alain', ['crabouille:16', 'anguilet:17']),
  trainer('dresseuse_ines', 'dresseuse', 'Inès', ['toisonnet:16', 'grivelin:17']),
  trainer('campeuse_julie', 'campeuse', 'Julie', ['nymphot:14', 'phalenoir:16']),
  trainer('randonneur_gilles', 'randonneur', 'Gilles', ['caillotin:15', 'salamoue:16', 'lapugil:16']),

  // Route 5 (15-20)
  trainer('campeur_noe', 'campeur', 'Noé', ['lampyrin:16', 'petalune:17']),
  trainer('campeuse_maya', 'campeuse', 'Maya', ['faonille:17', 'petalune:18']),
  trainer('randonneur_paul', 'randonneur', 'Paul', ['hurlegroin:18', 'bovaillon:18']),
  trainer('dresseuse_eva', 'dresseuse', 'Éva', ['cocolet:18', 'toisonnet:18', 'grivelin:19']),
  trainer('ecolier_lucas', 'ecolier', 'Lucas', ['lampyrin:16', 'cocolet:17']),
  trainer('motard_kevin', 'motard', 'Kévin', ['fumeron:18', 'musarogne:20']),
  trainer('gentleman_hippolyte', 'gentleman', 'Hippolyte', ['bovaillon:19', 'grivelin:20']),

  // Usine Opale (19-24)
  trainer('sbire_usine_1', 'sbire_opale', 'Sbire', ['crassou:20', 'noctule:19']),
  trainer('sbire_usine_2', 'sbire_opale_f', 'Sbire', ['sombrelin:20', 'venimot:20']),
  trainer('scientifique_ohmer', 'scientifique', 'Ohmer', ['boulonnet:21', 'piquevolt:21']),
  trainer('sbire_usine_3', 'sbire_opale', 'Sbire', ['crassou:21', 'venimorde:22', 'noctulard:22']),
  trainer('chercheuse_adele', 'chercheuse', 'Adèle', ['ampoulin:22', 'boulonnet:22']),
  trainer('sbire_usine_4', 'sbire_opale_f', 'Sbire', ['musarogne:22', 'sombrelin:23']),
  trainer('lieutenant_brisac', 'lieutenant_opale', 'Brisac', ['venimorde:22', 'noctulard:23', 'crassou:24']),

  // Arène Foudre (21-25)
  trainer('ouvrier_remi', 'ouvrier', 'Rémi', ['ampoulin:22', 'lampyrin:22', 'boulonnet:23']),
  trainer('scientifique_gaspard', 'scientifique', 'Gaspard', ['boulonnet:22', 'piquevolt:23']),
  trainer('chercheuse_lea', 'chercheuse', 'Léa', ['lampyrex:24', 'ampoulin:25']),
  trainer('selene', 'championne', 'Sélène', ['piquevolt:22', 'lampyrex:23', 'ampoulin:24', 'ampoulard:26'], {
    portrait: 'portrait/selene', ai: 'smart', last: true,
  }),
];
