// Trainers of the zone « cendrelune » (prompt 09).
import { trainer, rival } from './helpers.js';

export default [
  // Route 6 (20-24)
  trainer('randonneur_gaspard', 'randonneur', 'Gaspard', ['toisonnet:21', 'caillotin:21', 'musarogne:22']),
  trainer('campeuse_ninon', 'campeuse', 'Ninon', ['phalenoir:21', 'glandor:21', 'cerfeuil:22']),
  trainer('motard_tristan', 'motard', 'Tristan', ['crassou:22', 'fumelard:23']),
  trainer('scientifique_basile', 'scientifique', 'Basile', ['piquevolt:22', 'ampoulin:22', 'boulonnet:23']),
  trainer('dresseuse_margaux', 'dresseuse', 'Margaux', ['grivelin:22', 'lumidanse:22', 'hurlegroin:23']),
  trainer('campeur_eloi', 'campeur', 'Éloi', ['lampyrin:22', 'morillon:22', 'bousigor:23']),
  trainer('randonneuse_capucine', 'randonneuse', 'Capucine', ['fouisseron:22', 'salamoue:23', 'lombrin:24']),

  // Tunnel Obscur (22-26)
  trainer('montagnard_gilles', 'montagnard', 'Gilles', ['caillotin:23', 'bloquetin:25']),
  trainer('ouvrier_firmin', 'ouvrier', 'Firmin', ['grenaillon:24', 'boulonnet:24', 'crassou:25']),
  trainer('mystique_ophelie', 'mystique', 'Ophélie', ['sombrelin:24', 'phalenoir:24', 'lumidanse:26']),
  trainer('montagnard_hector', 'montagnard', 'Hector', ['lombrin:24', 'stalactor:24', 'caillotin:25']),
  trainer('ouvrier_lucien', 'ouvrier', 'Lucien', ['fouisseron:25', 'lombrin:26']),

  // Arène Flore (26-31)
  trainer('dame_hortense', 'dame', 'Hortense', ['petalune:27', 'glandor:27', 'dionelle:28']),
  trainer('gentleman_achille', 'gentleman', 'Achille', ['cerfeuil:28', 'morillard:28']),
  trainer('campeuse_lison', 'campeuse', 'Lison', ['butinet:27', 'morillard:27', 'glandor:28']),
  trainer('aubin', 'champion', 'Aubin', ['dionelle:28', 'cerfeuil:29', 'morillard:29', 'ronceroc:30'], {
    portrait: 'portrait/aubin', ai: 'smart', last: true,
  }),

  // Tour de la Mémoire (26-32)
  rival('rival_3', {
    fenouillot: ['grivelin:27', 'goujarde:26', 'lumidanse:26', 'fournaise:29'],
    braisille: ['grivelin:27', 'lumignon:26', 'faonille:26', 'ondeclat:27'],
    flaquin: ['grivelin:27', 'goujarde:26', 'lumidanse:27', 'fenouvert:31'],
  }),
  trainer('mystique_amandine', 'mystique', 'Amandine', ['brumelin:27', 'sombrelin:27']),
  trainer('sbire_tour_rufin', 'sbire_opale', 'Rufin', ['crassou:27', 'noctulard:28']),
  trainer('mystique_sidonie', 'mystique', 'Sidonie', ['cierget:28', 'glasnuit:28']),
  trainer('sbire_tour_josette', 'sbire_opale_f', 'Josette', ['venimorde:28', 'sombrelin:28', 'musarogne:28']),
  trainer('mystique_ernest', 'mystique', 'Ernest', ['lumidanse:28', 'brumelin:29']),
  trainer('mystique_berenice', 'mystique', 'Bérénice', ['lumidanse:29', 'brumelin:29', 'glasnuit:30']),
  trainer('sbire_tour_anatole', 'sbire_opale', 'Anatole', ['venimorde:30', 'noctulard:30']),
  trainer('mystique_honore', 'mystique', 'Honoré', ['sombrelin:29', 'phalenoir:29', 'cierget:30']),
  trainer('lieutenant_gerfaut', 'lieutenant_opale', 'Gerfaut', ['noctulard:29', 'venimorde:30', 'filandrix:31', 'sombrecor:32']),
];
