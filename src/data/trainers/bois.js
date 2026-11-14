// Trainers of the zone « bois » (prompt 09): Route 2, Bois Murmurant, Route 3, Grotte des Cascades.
import { trainer, rival } from './helpers.js';

export default [
  // Route 2 (3-7)
  trainer('gamin_bastien', 'gamin', 'Bastien', ['pivelin:4', 'musaraille:4']),
  trainer('fillette_lison', 'fillette', 'Lison', ['noisetin:5', 'pivelin:5']),
  trainer('campeur_hugo', 'campeur', 'Hugo', ['feuillarve:4', 'bousiot:5', 'feuillarve:5']),
  trainer('campeuse_ines', 'campeuse', 'Inès', ['morillon:6', 'feuillarve:7']),
  trainer('ecolier_timothee', 'ecolier', 'Timothée', ['musaraille:6', 'glandor:6']),

  // Bois Murmurant (5-10)
  trainer('campeur_jules', 'campeur', 'Jules', ['bousiot:6', 'feuillarve:6']),
  trainer('fillette_rose', 'fillette', 'Rose', ['glandor:7', 'faonille:7']),
  trainer('campeuse_margot', 'campeuse', 'Margot', ['morillon:7', 'feuillarve:7', 'nymphot:8']),
  trainer('campeur_basile', 'campeur', 'Basile', ['bousiot:8', 'nymphot:9']),
  trainer('campeuse_solene', 'campeuse', 'Solène', ['faonille:8', 'glandor:9']),
  trainer('fillette_capucine', 'fillette', 'Capucine', ['feuillarve:9', 'faonille:10']),
  // Syndicat Opale grunts, fought from the bois_murmurant script.
  trainer('sbire_bois_1', 'sbire_opale', 'Brice', ['venimot:8', 'musaraille:9']),
  trainer('sbire_bois_2', 'sbire_opale_f', 'Odile', ['noisetin:8', 'noctule:9', 'venimot:10']),

  // Route 3 (8-12)
  trainer('ecolier_anatole', 'ecolier', 'Anatole', ['venimot:11', 'lumignon:12']),
  trainer('randonneur_marcel', 'randonneur', 'Marcel', ['caillotin:11', 'pivelin:10']),
  trainer('pecheur_gilles', 'pecheur', 'Gilles', ['goujonet:10', 'goujonet:11']),
  trainer('pecheur_armand', 'pecheur', 'Armand', ['salamoue:11', 'goujonet:12']),
  trainer('randonneuse_alix', 'randonneuse', 'Alix', ['faonille:10', 'salamoue:11']),
  trainer('gamin_noe', 'gamin', 'Noé', ['pivelin:9', 'noisetin:9', 'nymphot:10']),

  // Grotte des Cascades (9-14)
  trainer('randonneur_yves', 'randonneur', 'Yves', ['caillotin:11', 'caillotin:12']),
  trainer('montagnard_gaston', 'montagnard', 'Gaston', ['fouisseron:12', 'caillotin:12']),
  trainer('randonneuse_leonie', 'randonneuse', 'Léonie', ['noctule:11', 'quartzelle:12']),
  trainer('montagnard_firmin', 'montagnard', 'Firmin', ['caillotin:11', 'salamoue:12', 'fouisseron:13']),
  trainer('montagnard_auguste', 'montagnard', 'Auguste', ['caillotin:13', 'grenaillon:13']),
  trainer('randonneuse_berenice', 'randonneuse', 'Bérénice', ['noctule:13', 'quartzelle:13']),
  trainer('randonneur_lucien', 'randonneur', 'Lucien', ['crabouille:12', 'fouisseron:13', 'caillotin:14']),

  // Rival 2, exit of the Grotte des Cascades. Key = the PLAYER's starter.
  rival('rival_2', {
    fenouillot: ['pivelin:12', 'lumignon:11', 'braisille:12'],
    braisille: ['pivelin:13', 'lumignon:12', 'flaquin:15'],
    flaquin: ['pivelin:13', 'lumignon:12', 'fenouillot:15'],
  }),
];
