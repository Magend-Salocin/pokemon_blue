// Items. `use.context`: where the item can be used ('field' | 'battle' | 'both' | 'none').
// `use.effect` belongs to the closed list ITEM_EFFECTS; `price: 0` = cannot be sold or bought.

export const POCKETS = ['items', 'capsules', 'key'];

export const ITEM_EFFECTS = {
  catch: 'Lance une capsule. params.bonus = multiplicateur de capture, params.guaranteed = capture assurée.',
  heal_hp: 'Rend params.amount PV (params.amount = "full" pour tous).',
  revive: 'Ranime une bestiole K.O. avec params.fraction de ses PV max.',
  cure_status: 'Soigne params.status (brl, psn, par, som, gel ou all).',
  restore_pp: 'Rend params.amount PP à une attaque, ou à toutes si params.allMoves.',
  level_up: 'Fait gagner un niveau.',
  evolve: 'Fait évoluer les bestioles compatibles (évolution par objet).',
  add_training: 'Ajoute params.points points d’entraînement à params.stat (plafond 100 par vitamine).',
  repel: 'Évite les rencontres sauvages de niveau inférieur pendant params.steps pas.',
  escape: 'Ramène à l’entrée de la grotte ou du bâtiment.',
  field_ability: 'Débloque une action de terrain : params.ability.',
  none: 'Objet de scénario sans usage direct.',
};

export const FIELD_ABILITIES = ['cut', 'flash', 'climb', 'surf', 'fly', 'strength'];

function item(id, name, pocket, price, description, use) {
  return { id, name, pocket, price, description, use };
}

const field = (ability) => ({ context: 'field', effect: 'field_ability', params: { ability } });
const story = { context: 'none', effect: 'none', params: null };
const training = (stat) => ({ context: 'field', effect: 'add_training', params: { stat, points: 10 } });
const stone = { context: 'field', effect: 'evolve', params: null };

export const ITEMS = [
  // Capsules
  item('capsule', 'Capsule', 'capsules', 200, 'Sert à capturer une bestiole sauvage.', { context: 'battle', effect: 'catch', params: { bonus: 1 } }),
  item('super_capsule', 'Super Capsule', 'capsules', 600, 'Une capsule plus efficace que la Capsule.', { context: 'battle', effect: 'catch', params: { bonus: 1.5 } }),
  item('hyper_capsule', 'Hyper Capsule', 'capsules', 1200, 'Une capsule très efficace.', { context: 'battle', effect: 'catch', params: { bonus: 2 } }),
  item('capsule_maitresse', 'Capsule Maîtresse', 'capsules', 0, 'Capture n’importe quelle bestiole à coup sûr.', { context: 'battle', effect: 'catch', params: { guaranteed: true } }),

  // Soins
  item('potion', 'Potion', 'items', 200, 'Rend 20 PV à une bestiole.', { context: 'both', effect: 'heal_hp', params: { amount: 20 } }),
  item('potion_forte', 'Potion Forte', 'items', 600, 'Rend 60 PV à une bestiole.', { context: 'both', effect: 'heal_hp', params: { amount: 60 } }),
  item('grande_potion', 'Grande Potion', 'items', 1200, 'Rend 120 PV à une bestiole.', { context: 'both', effect: 'heal_hp', params: { amount: 120 } }),
  item('potion_totale', 'Potion Totale', 'items', 2500, 'Rend tous ses PV à une bestiole.', { context: 'both', effect: 'heal_hp', params: { amount: 'full' } }),
  item('ranimant', 'Ranimant', 'items', 1500, 'Ranime une bestiole K.O. avec la moitié des PV.', { context: 'both', effect: 'revive', params: { fraction: 0.5 } }),
  item('ranimant_max', 'Ranimant Max', 'items', 4000, 'Ranime une bestiole K.O. avec tous ses PV.', { context: 'both', effect: 'revive', params: { fraction: 1 } }),
  item('antidote', 'Antidote', 'items', 100, 'Soigne le poison.', { context: 'both', effect: 'cure_status', params: { status: 'psn' } }),
  item('baume_froid', 'Baume Froid', 'items', 250, 'Soigne une brûlure.', { context: 'both', effect: 'cure_status', params: { status: 'brl' } }),
  item('degivrant', 'Dégivrant', 'items', 250, 'Dégèle une bestiole gelée.', { context: 'both', effect: 'cure_status', params: { status: 'gel' } }),
  item('sel_eveil', 'Sel d’Éveil', 'items', 250, 'Réveille une bestiole endormie.', { context: 'both', effect: 'cure_status', params: { status: 'som' } }),
  item('liniment', 'Liniment', 'items', 200, 'Soigne la paralysie.', { context: 'both', effect: 'cure_status', params: { status: 'par' } }),
  item('panacee', 'Panacée', 'items', 600, 'Soigne toutes les altérations de statut.', { context: 'both', effect: 'cure_status', params: { status: 'all' } }),
  item('infusion', 'Infusion', 'items', 1200, 'Rend 10 PP à une attaque.', { context: 'both', effect: 'restore_pp', params: { amount: 10, allMoves: false } }),
  item('grande_infusion', 'Grande Infusion', 'items', 3000, 'Rend 10 PP à toutes les attaques.', { context: 'both', effect: 'restore_pp', params: { amount: 10, allMoves: true } }),

  // Progression
  item('sucre_dorge', 'Sucre d’Orge', 'items', 4800, 'Fait monter une bestiole d’un niveau.', { context: 'field', effect: 'level_up', params: null }),
  item('pierre_solaire', 'Pierre Solaire', 'items', 2100, 'Pierre chaude. Fait évoluer des bestioles.', stone),
  item('pierre_marine', 'Pierre Marine', 'items', 2100, 'Pierre bleue. Fait évoluer des bestioles.', stone),
  item('pierre_orage', 'Pierre Orage', 'items', 2100, 'Pierre crépitante. Fait évoluer des bestioles.', stone),
  item('pierre_lunaire', 'Pierre Lunaire', 'items', 2100, 'Pierre pâle. Fait évoluer des bestioles.', stone),
  item('pierre_braise', 'Pierre Braise', 'items', 2100, 'Pierre brûlante. Fait évoluer des bestioles.', stone),
  item('seve_vitale', 'Sève Vitale', 'items', 9800, 'Augmente l’entraînement des PV.', training('hp')),
  item('poudre_force', 'Poudre Force', 'items', 9800, 'Augmente l’entraînement de l’Attaque.', training('atk')),
  item('ecorce_dure', 'Écorce Dure', 'items', 9800, 'Augmente l’entraînement de la Défense.', training('def')),
  item('encre_vive', 'Encre Vive', 'items', 9800, 'Augmente l’entraînement en Att. Spé.', training('spa')),
  item('cire_calme', 'Cire Calme', 'items', 9800, 'Augmente l’entraînement en Déf. Spé.', training('spd')),
  item('plume_vive', 'Plume Vive', 'items', 9800, 'Augmente l’entraînement de la Vitesse.', training('spe')),

  // Exploration
  item('repulsif', 'Répulsif', 'items', 350, 'Éloigne les bestioles faibles pendant 100 pas.', { context: 'field', effect: 'repel', params: { steps: 100 } }),
  item('repulsif_fort', 'Répulsif Fort', 'items', 500, 'Éloigne les bestioles faibles pendant 200 pas.', { context: 'field', effect: 'repel', params: { steps: 200 } }),
  item('repulsif_max', 'Répulsif Max', 'items', 700, 'Éloigne les bestioles faibles pendant 250 pas.', { context: 'field', effect: 'repel', params: { steps: 250 } }),
  item('fil_dariane', 'Fil d’Ariane', 'items', 550, 'Ramène à l’entrée d’une grotte ou d’un bâtiment.', { context: 'field', effect: 'escape', params: null }),

  // Objets de terrain
  item('machette', 'Machette', 'key', 0, 'Coupe les arbustes qui barrent le chemin.', field('cut')),
  item('lanterne', 'Lanterne', 'key', 0, 'Éclaire les grottes et les tunnels obscurs.', field('flash')),
  item('grappin', 'Grappin', 'key', 0, 'Permet de franchir les corniches marquées.', field('climb')),
  item('bouee', 'Bouée', 'key', 0, 'Permet de se déplacer sur l’eau.', field('surf')),
  item('cerf_volant', 'Cerf-Volant', 'key', 0, 'Emmène vers une ville déjà visitée.', field('fly')),
  item('gants_de_force', 'Gants de Force', 'key', 0, 'Permettent de pousser les gros rochers.', field('strength')),

  // Objets de scénario
  item('colis_morvan', 'Colis Morvan', 'key', 0, 'Un colis à remettre à la Pr Morvan.', story),
  item('carte_opale', 'Carte Opale', 'key', 0, 'Carte d’accès aux installations du Syndicat Opale.', story),
  item('ticket_bac', 'Ticket Bac', 'key', 0, 'Un ticket pour le bac de Port-Ondine.', story),
  item('cle_sous_sol', 'Clé Sous-Sol', 'key', 0, 'Ouvre la porte du sous-sol du casino d’Ombrecourt.', story),
];

export const ITEMS_BY_ID = Object.fromEntries(ITEMS.map((entry) => [entry.id, entry]));
