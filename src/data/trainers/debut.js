// Trainers of the zone « debut » (prompt 09).
import { trainer, rival } from './helpers.js';

export default [
  // Lab, Hameau-de-Lys. Keys = the PLAYER's starter.
  rival('rival_1', {
    // Fresh starter: only basic moves, so the first battle is not decided by the type advantage.
    fenouillot: [{ creature: 'braisille', level: 6, moves: ['egratignure', 'ardeur'] }],
    braisille: [{ creature: 'flaquin', level: 3, moves: ['elan_vif'] }],
    flaquin: [{ creature: 'fenouillot', level: 6, moves: ['egratignure', 'spore_raide'] }],
  }),

  // Route 1
  trainer('route_1_gamin_theo', 'gamin', 'Théo', ['pivelin:3']),
  trainer('route_1_fillette_lise', 'fillette', 'Lise', ['musaraille:3', 'feuillarve:3']),
  trainer('route_1_ecolier_marius', 'ecolier', 'Marius', ['noisetin:5']),

  // Roche arena, Bourg-Sablon
  trainer('arene_roche_randonneur_basile', 'randonneur', 'Basile', ['caillotin:8', 'bousiot:9']),
  trainer('arene_roche_montagnard_gaspard', 'montagnard', 'Gaspard', ['fouisseron:10']),
  trainer('arene_roche_randonneuse_ines', 'randonneuse', 'Inès', ['caillotin:10', 'quartzelle:11']),
  trainer('garance', 'championne', 'Garance', ['caillotin:10', 'bousiot:10', 'quartzelle:10', 'caillotin:12'], {
    ai: 'smart', last: true, portrait: 'portrait/garance',
  }),
];
