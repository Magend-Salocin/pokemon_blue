// All moves. `power: 0` = damage computed by the effect (fixed, level, half HP, OHKO, counter).
// `accuracy: null` = never misses. `effectChance: null` = the effect always applies.
// `exclusiveTo` lists the only species allowed to learn the move (legendary signatures).

function move(id, name, type, category, power, accuracy, pp, description, options = {}) {
  return {
    id,
    name,
    type,
    category,
    power,
    accuracy,
    pp,
    priority: options.priority ?? 0,
    effect: options.effect ?? 'damage',
    effectChance: options.chance ?? null,
    effectParams: options.params ?? null,
    highCrit: options.highCrit ?? false,
    description,
    ...(options.exclusiveTo ? { exclusiveTo: options.exclusiveTo } : {}),
    ...(options.learnable === false ? { learnable: false } : {}),
  };
}

const P = 'physical';
const S = 'special';
const X = 'status';

const stats = (values) => ({ stats: values });

export const MOVES = [
  // Normal
  move('egratignure', 'Égratignure', 'normal', P, 40, 100, 35, 'Griffe la cible du bout des ongles.'),
  move('elan_vif', 'Élan Vif', 'normal', P, 40, 100, 30, 'Si vif qu’il frappe en premier.', { priority: 1 }),
  move('tambourin', 'Tambourin', 'normal', P, 15, 85, 20, 'Tape la cible 2 à 5 fois de suite.', { effect: 'multi_hit', params: { min: 2, max: 5 } }),
  move('frappe_nette', 'Frappe Nette', 'normal', P, 0, 90, 20, 'Inflige toujours 40 PV de dégâts.', { effect: 'fixed_damage', params: { amount: 40 } }),
  move('pietinement', 'Piétinement', 'normal', P, 70, 100, 20, 'Écrase la cible. Peut l’apeurer.', { effect: 'flinch', chance: 30 }),
  move('assaut', 'Assaut', 'normal', P, 80, 100, 15, 'Une charge de tout le corps.'),
  move('rongement', 'Rongement', 'normal', P, 0, 90, 10, 'Ronge la moitié des PV restants.', { effect: 'half_hp_damage' }),
  move('percee', 'Percée', 'normal', P, 90, 85, 15, 'Vise le point faible. Critique+.', { highCrit: true }),
  move('frenesie', 'Frénésie', 'normal', P, 120, 100, 10, 'Rage 2 ou 3 tours, puis confusion.', { effect: 'rampage', params: { turns: [2, 3] } }),
  move('onde_brute', 'Onde Brute', 'normal', S, 120, 90, 5, 'Onde terrible. Repos forcé après.', { effect: 'recharge' }),
  move('implosion', 'Implosion', 'normal', P, 200, 100, 5, 'Énorme coup, mais tombe K.O.', { effect: 'self_destruct' }),
  move('mine_severe', 'Mine Sévère', 'normal', X, 0, 100, 40, 'Une moue hostile. Baisse l’Attaque.', { effect: 'target_stat_down', params: stats({ atk: -1 }) }),
  move('regard_dur', 'Regard Dur', 'normal', X, 0, 100, 30, 'Un regard qui baisse la Défense.', { effect: 'target_stat_down', params: stats({ def: -1 }) }),
  move('bombe_torse', 'Bombe Torse', 'normal', X, 0, null, 20, 'Monte l’Attaque et la Défense.', { effect: 'self_stat_up', params: stats({ atk: 1, def: 1 }) }),
  move('point_focal', 'Point Focal', 'normal', X, 0, null, 30, 'Se concentre : plus de critiques.', { effect: 'crit_up' }),
  move('pansement', 'Pansement', 'normal', X, 0, null, 10, 'Soigne la moitié de ses PV max.', { effect: 'heal_half' }),
  move('sieste', 'Sieste', 'normal', X, 0, null, 10, 'Dort 2 tours et soigne ses PV.', { effect: 'rest' }),
  move('repli', 'Repli', 'normal', X, 0, null, 10, 'Se protège de tout ce tour-ci.', { effect: 'protect', priority: 4 }),
  move('baroud', 'Baroud', 'normal', P, 50, null, 1, 'Dernier recours. Blesse le lanceur.', { effect: 'struggle', learnable: false }),

  // Feu
  move('escarbille', 'Escarbille', 'feu', S, 40, 100, 25, 'Des escarbilles. Peut brûler.', { effect: 'burn', chance: 10 }),
  move('morsardente', 'Morsardente', 'feu', P, 60, 95, 20, 'Morsure brûlante. Peut brûler.', { effect: 'burn', chance: 10 }),
  move('torche', 'Torche', 'feu', P, 70, 100, 15, 'Frappe avec une torche en feu.'),
  move('cerceau_feu', 'Cerceau Feu', 'feu', S, 35, 85, 15, 'Piège la cible dans un feu.', { effect: 'trap', params: { turns: [4, 5] } }),
  move('boule_braise', 'Boule Braise', 'feu', S, 75, 100, 15, 'Boule de braise. Peut brûler.', { effect: 'burn', chance: 10 }),
  move('coulee_lave', 'Coulée Lave', 'feu', S, 95, 100, 10, 'Vague de lave. Peut brûler.', { effect: 'burn', chance: 10 }),
  move('pyroclaste', 'Pyroclaste', 'feu', S, 110, 85, 5, 'Roches en feu. Brûle souvent.', { effect: 'burn', chance: 30 }),
  move('ruee_brasier', 'Ruée Brasier', 'feu', P, 120, 100, 10, 'Fonce en flammes. Recul de 1/3.', { effect: 'recoil', params: { fraction: 1 / 3 } }),
  move('braise_lente', 'Braise Lente', 'feu', X, 0, 85, 15, 'Des braises qui brûlent la cible.', { effect: 'burn' }),
  move('ardeur', 'Ardeur', 'feu', X, 0, null, 20, 'Monte l’Att. Spé. et la Vitesse.', { effect: 'self_stat_up', params: stats({ spa: 1, spe: 1 }) }),

  // Eau
  move('giclee', 'Giclée', 'eau', S, 40, 100, 25, 'Asperge la cible d’un jet d’eau.'),
  move('nageoire', 'Nageoire', 'eau', P, 60, 100, 20, 'Gifle d’un coup de nageoire.'),
  move('remous', 'Remous', 'eau', S, 35, 85, 15, 'Piège la cible dans un remous.', { effect: 'trap', params: { turns: [4, 5] } }),
  move('embrun', 'Embrun', 'eau', S, 65, 100, 20, 'Embruns salés. Peut aveugler.', { effect: 'target_stat_down', chance: 30, params: stats({ acc: -1 }) }),
  move('abysse', 'Abysse', 'eau', P, 80, 100, 10, 'Plonge au tour 1, surgit au tour 2.', { effect: 'charge_turn', params: { semiInvulnerable: 'underwater' } }),
  move('deferlante', 'Déferlante', 'eau', P, 90, 100, 15, 'Se jette sur la cible en vague.'),
  move('lame_de_fond', 'Lame de Fond', 'eau', S, 90, 100, 10, 'Une lame venue du fond des mers.'),
  move('grand_ressac', 'Grand Ressac', 'eau', S, 120, 80, 5, 'Un ressac énorme qui emporte tout.'),
  move('voile_marin', 'Voile Marin', 'eau', X, 0, null, 20, 'Réduit les dégâts spéciaux 5 tours.', { effect: 'screen', params: { category: 'special', turns: 5 } }),
  move('source_vive', 'Source Vive', 'eau', X, 0, null, 10, 'Soigne la moitié de ses PV max.', { effect: 'heal_half' }),

  // Flore
  move('brindille', 'Brindille', 'flore', P, 45, 100, 25, 'Fouette avec une brindille.'),
  move('seve_volee', 'Sève Volée', 'flore', S, 40, 100, 20, 'Vole la sève de la cible : soigne.', { effect: 'drain', params: { fraction: 1 / 2 } }),
  move('fouet_ronce', 'Fouet Ronce', 'flore', P, 65, 100, 20, 'Frappe avec une ronce épineuse.'),
  move('averse_verte', 'Averse Verte', 'flore', S, 60, 100, 20, 'Averse de feuilles coupantes.'),
  move('pompe_seve', 'Pompe Sève', 'flore', S, 75, 100, 10, 'Pompe la vie de la cible : soigne.', { effect: 'drain', params: { fraction: 1 / 2 } }),
  move('rondin', 'Rondin', 'flore', P, 85, 95, 15, 'Coup de rondin. Peut apeurer.', { effect: 'flinch', chance: 10 }),
  move('fauchage', 'Fauchage', 'flore', P, 90, 100, 15, 'Fauche la cible. Critique fréquent.', { highCrit: true }),
  move('germination', 'Germination', 'flore', S, 120, 100, 10, 'Germe au tour 1, éclate au tour 2.', { effect: 'charge_turn', params: { semiInvulnerable: null } }),
  move('pollen_tiede', 'Pollen Tiède', 'flore', X, 0, 75, 15, 'Un pollen doux qui endort.', { effect: 'sleep' }),
  move('spore_raide', 'Spore Raide', 'flore', X, 0, 75, 30, 'Des spores qui paralysent.', { effect: 'paralyze' }),
  move('germe_voleur', 'Germe Voleur', 'flore', X, 0, 90, 10, 'Graine qui vole des PV par tour.', { effect: 'leech' }),

  // Foudre
  move('picotement', 'Picotement', 'foudre', S, 40, 100, 30, 'Petite décharge. Peut paralyser.', { effect: 'paralyze', chance: 10 }),
  move('arc_volt', 'Arc Volt', 'foudre', S, 60, 100, 20, 'Un arc électrique frappe la cible.'),
  move('crepitement', 'Crépitement', 'foudre', S, 20, 100, 20, 'Étincelles : touche 2 à 5 fois.', { effect: 'multi_hit', params: { min: 2, max: 5 } }),
  move('paume_volt', 'Paume Volt', 'foudre', P, 65, 100, 20, 'Paume chargée. Peut paralyser.', { effect: 'paralyze', chance: 20 }),
  move('court_jus', 'Court-Jus', 'foudre', P, 80, 100, 15, 'Un court-circuit au contact.'),
  move('foudroiement', 'Foudroiement', 'foudre', S, 90, 100, 15, 'Foudre puissante. Peut paralyser.', { effect: 'paralyze', chance: 10 }),
  move('orage_sec', 'Orage Sec', 'foudre', S, 110, 70, 5, 'Éclair sec. Paralyse souvent.', { effect: 'paralyze', chance: 30 }),
  move('ruee_ionique', 'Ruée Ionique', 'foudre', P, 120, 100, 10, 'Charge électrique. Recul de 1/3.', { effect: 'recoil', params: { fraction: 1 / 3 } }),
  move('engourdir', 'Engourdir', 'foudre', X, 0, 90, 20, 'Un courant faible qui paralyse.', { effect: 'paralyze' }),
  move('survolteur', 'Survolteur', 'foudre', X, 0, null, 30, 'Monte beaucoup la Vitesse.', { effect: 'self_stat_up', params: stats({ spe: 2 }) }),

  // Givre
  move('frisson', 'Frisson', 'givre', S, 40, 100, 30, 'Souffle froid. Peut ralentir.', { effect: 'target_stat_down', chance: 10, params: stats({ spe: -1 }) }),
  move('glissade', 'Glissade', 'givre', P, 40, 100, 30, 'Glisse et frappe en premier.', { priority: 1 }),
  move('gresil', 'Grésil', 'givre', S, 55, 100, 20, 'Grains de glace. Peut geler.', { effect: 'freeze', chance: 10 }),
  move('glacons', 'Glaçons', 'givre', P, 25, 100, 20, 'Lance 2 à 5 glaçons pointus.', { effect: 'multi_hit', params: { min: 2, max: 5 } }),
  move('bise_glacee', 'Bise Glacée', 'givre', S, 60, 95, 15, 'Bise mordante. Baisse la Vitesse.', { effect: 'target_stat_down', params: stats({ spe: -1 }) }),
  move('gelure', 'Gelure', 'givre', P, 65, 100, 20, 'Morsure glacée. Peut geler.', { effect: 'freeze', chance: 10 }),
  move('gel_profond', 'Gel Profond', 'givre', S, 90, 100, 10, 'Froid intense. Peut geler.', { effect: 'freeze', chance: 10 }),
  move('coulee_neige', 'Coulée Neige', 'givre', P, 90, 90, 10, 'Ensevelit la cible sous la neige.'),
  move('grand_froid', 'Grand Froid', 'givre', S, 115, 70, 5, 'Froid d’hiver. Gèle souvent.', { effect: 'freeze', chance: 30 }),
  move('mur_de_givre', 'Mur de Givre', 'givre', X, 0, null, 20, 'Réduit les dégâts physiques 5 tours.', { effect: 'screen', params: { category: 'physical', turns: 5 } }),

  // Combat
  move('taloche', 'Taloche', 'combat', P, 40, 100, 35, 'Une taloche du plat de la patte.'),
  move('double', 'Doublé', 'combat', P, 35, 90, 20, 'Deux coups de poing à la suite.', { effect: 'multi_hit', params: { min: 2, max: 2 } }),
  move('manchette', 'Manchette', 'combat', P, 60, 100, 20, 'Un revers sec. Peut apeurer.', { effect: 'flinch', chance: 20 }),
  move('contre_coup', 'Contre-Coup', 'combat', P, 0, 100, 20, 'Renvoie 2 fois les coups physiques.', { effect: 'counter', priority: -5 }),
  move('onde_vitale', 'Onde Vitale', 'combat', S, 80, 100, 15, 'Projette son énergie vitale.'),
  move('uppercut', 'Uppercut', 'combat', P, 85, 90, 15, 'Coup de bas en haut. Critique+.', { highCrit: true }),
  move('genouillade', 'Genouillade', 'combat', P, 90, 100, 10, 'Genou violent. Recul de 1/4.', { effect: 'recoil', params: { fraction: 1 / 4 } }),
  move('coup_decisif', 'Coup Décisif', 'combat', P, 120, 100, 5, 'Tout donner. Baisse sa défense.', { effect: 'self_stat_down', params: stats({ def: -1, spd: -1 }) }),
  move('prise_fatale', 'Prise Fatale', 'combat', P, 0, 30, 5, 'Prise imparable : K.O. direct.', { effect: 'ohko' }),
  move('gonflette', 'Gonflette', 'combat', X, 0, null, 20, 'Monte beaucoup l’Attaque.', { effect: 'self_stat_up', params: stats({ atk: 2 }) }),

  // Toxique
  move('aiguillon', 'Aiguillon', 'toxique', P, 40, 100, 35, 'Pique la cible. Peut empoisonner.', { effect: 'poison', chance: 30 }),
  move('crachat', 'Crachat', 'toxique', S, 45, 100, 25, 'Crache du venin. Peut empoisonner.', { effect: 'poison', chance: 10 }),
  move('pluie_dards', 'Pluie Dards', 'toxique', P, 25, 95, 20, 'Lance 2 à 5 dards venimeux.', { effect: 'multi_hit', params: { min: 2, max: 5 } }),
  move('morsure_fiel', 'Morsure Fiel', 'toxique', P, 65, 100, 20, 'Venin fort. Peut intoxiquer.', { effect: 'bad_poison', chance: 20 }),
  move('miasme', 'Miasme', 'toxique', S, 65, 100, 20, 'Nuage fétide. Peut empoisonner.', { effect: 'poison', chance: 30 }),
  move('epine_fiel', 'Épine Fiel', 'toxique', P, 80, 100, 15, 'Épine venimeuse. Peut empoisonner.', { effect: 'poison', chance: 30 }),
  move('vase_fetide', 'Vase Fétide', 'toxique', S, 90, 100, 10, 'Vase toxique. Peut empoisonner.', { effect: 'poison', chance: 30 }),
  move('maree_noire', 'Marée Noire', 'toxique', S, 120, 80, 5, 'Vague de poison. Peut empoisonner.', { effect: 'poison', chance: 30 }),
  move('toxine', 'Toxine', 'toxique', X, 0, 90, 10, 'Empoisonne la cible gravement.', { effect: 'bad_poison' }),
  move('poudre_fiel', 'Poudre Fiel', 'toxique', X, 0, 75, 35, 'Une poudre qui empoisonne.', { effect: 'poison' }),

  // Terre
  move('motte', 'Motte', 'terre', P, 40, 100, 30, 'Lance une motte de terre dure.'),
  move('gadoue', 'Gadoue', 'terre', S, 50, 100, 20, 'Boue aux yeux. Peut aveugler.', { effect: 'target_stat_down', chance: 30, params: stats({ acc: -1 }) }),
  move('pelletee', 'Pelletée', 'terre', P, 65, 100, 20, 'Une pelletée de terre en face.'),
  move('terrier', 'Terrier', 'terre', P, 80, 100, 10, 'Creuse au tour 1, surgit au tour 2.', { effect: 'charge_turn', params: { semiInvulnerable: 'underground' } }),
  move('gronde_sol', 'Grondesol', 'terre', S, 90, 100, 10, 'Le sol gronde. Baisse la D.Spé.', { effect: 'target_stat_down', chance: 10, params: stats({ spd: -1 }) }),
  move('sol_fendu', 'Sol Fendu', 'terre', P, 100, 100, 10, 'Fend le sol sous la cible.'),
  move('coulee_boue', 'Coulée Boue', 'terre', S, 120, 85, 5, 'Coulée de boue. Peut aveugler.', { effect: 'target_stat_down', chance: 30, params: stats({ acc: -1 }) }),
  move('faille', 'Faille', 'terre', P, 0, 30, 5, 'Ouvre une faille : K.O. direct.', { effect: 'ohko' }),
  move('poudroiement', 'Poudroiement', 'terre', X, 0, 100, 15, 'Poussière : baisse la Précision.', { effect: 'target_stat_down', params: stats({ acc: -1 }) }),
  move('terre_battue', 'Terre Battue', 'terre', X, 0, null, 20, 'Monte beaucoup la Défense.', { effect: 'self_stat_up', params: stats({ def: 2 }) }),

  // Vent
  move('souffle', 'Souffle', 'vent', S, 40, 100, 35, 'Un coup de vent sur la cible.'),
  move('battement', 'Battement', 'vent', P, 60, 100, 25, 'Frappe d’un battement d’ailes.'),
  move('tournevent', 'Tournevent', 'vent', S, 65, 100, 20, 'Vent tournant. Rend confus.', { effect: 'confuse', chance: 20 }),
  move('bec_taille', 'Bec Taillé', 'vent', P, 70, 100, 20, 'Bec affûté. Critique fréquent.', { highCrit: true }),
  move('cisaille', 'Cisaille', 'vent', S, 75, 95, 15, 'Vent tranchant. Critique fréquent.', { highCrit: true }),
  move('envolee', 'Envolée', 'vent', P, 90, 95, 15, 'S’envole, puis pique au tour 2.', { effect: 'charge_turn', params: { semiInvulnerable: 'air' } }),
  move('typhon', 'Typhon', 'vent', S, 110, 70, 5, 'Vent furieux. Peut rendre confus.', { effect: 'confuse', chance: 30 }),
  move('rase_mottes', 'Rase-Mottes', 'vent', P, 120, 100, 10, 'Pique au ras du sol. Recul 1/3.', { effect: 'recoil', params: { fraction: 1 / 3 } }),
  move('grand_air', 'Grand Air', 'vent', X, 0, null, 30, 'Annule tous les bonus et malus.', { effect: 'haze' }),
  move('portance', 'Portance', 'vent', X, 0, null, 30, 'Monte beaucoup la Vitesse.', { effect: 'self_stat_up', params: stats({ spe: 2 }) }),

  // Arcane
  move('lueur', 'Lueur', 'arcane', S, 40, 100, 30, 'Une lueur étrange frappe la cible.'),
  move('coup_runique', 'Coup Runique', 'arcane', P, 60, 100, 25, 'Frappe d’une patte runique.'),
  move('onde_mentale', 'Onde Mentale', 'arcane', S, 0, 100, 15, 'Inflige autant de PV que son niveau.', { effect: 'level_damage' }),
  move('eclat_astral', 'Éclat Astral', 'arcane', S, 70, null, 20, 'Éclats d’étoiles. Ne rate jamais.'),
  move('prisme', 'Prisme', 'arcane', S, 80, 100, 15, 'Rayon irisé. Peut baisser D.Spé.', { effect: 'target_stat_down', chance: 10, params: stats({ spd: -1 }) }),
  move('lame_astrale', 'Lame Astrale', 'arcane', P, 90, 100, 10, 'Lame de lumière. Critique fréquent.', { highCrit: true }),
  move('songe_avide', 'Songe Avide', 'arcane', S, 100, 100, 15, 'Dévore les rêves d’un dormeur.', { effect: 'dream_drain' }),
  move('arcanum', 'Arcanum', 'arcane', S, 120, 90, 5, 'Sort majeur. Baisse son A.Spé.', { effect: 'self_stat_down', params: stats({ spa: -2 }) }),
  move('songe_lourd', 'Songe Lourd', 'arcane', X, 0, 70, 15, 'Plonge la cible dans le sommeil.', { effect: 'sleep' }),
  move('clairvoyance', 'Clairvoyance', 'arcane', X, 0, null, 20, 'Monte l’Att. Spé. et la Déf. Spé.', { effect: 'self_stat_up', params: stats({ spa: 1, spd: 1 }) }),

  // Insecte
  move('mandibule', 'Mandibule', 'insecte', P, 40, 100, 35, 'Pince avec ses mandibules.'),
  move('piquant', 'Piquant', 'insecte', P, 25, 95, 20, 'Pique la cible 2 à 5 fois.', { effect: 'multi_hit', params: { min: 2, max: 5 } }),
  move('vrombir', 'Vrombir', 'insecte', S, 60, 100, 20, 'Vrombit fort. Baisse la D.Spé.', { effect: 'target_stat_down', chance: 10, params: stats({ spd: -1 }) }),
  move('butinage', 'Butinage', 'insecte', S, 60, 100, 15, 'Butine l’énergie et se soigne.', { effect: 'drain', params: { fraction: 1 / 2 } }),
  move('elytres', 'Élytres', 'insecte', P, 75, 100, 15, 'Frappe avec ses élytres durs.'),
  move('nuee_ailee', 'Nuée Ailée', 'insecte', S, 80, 100, 15, 'Un essaim fond sur la cible.'),
  move('pince_seche', 'Pince Sèche', 'insecte', P, 90, 95, 10, 'Pince qui claque. Critique fréquent.', { highCrit: true }),
  move('grouillement', 'Grouillement', 'insecte', P, 120, 85, 5, 'Tout un essaim charge la cible.'),
  move('fil_gluant', 'Fil Gluant', 'insecte', X, 0, 95, 40, 'Englue : Vitesse très baissée.', { effect: 'target_stat_down', params: stats({ spe: -2 }) }),
  move('chitine', 'Chitine', 'insecte', X, 0, null, 20, 'Monte beaucoup la Défense.', { effect: 'self_stat_up', params: stats({ def: 2 }) }),

  // Roche
  move('gravillons', 'Gravillons', 'roche', P, 40, 100, 30, 'Jette une poignée de gravillons.'),
  move('ricochet', 'Ricochet', 'roche', P, 25, 90, 15, 'Cailloux : touche 2 à 5 fois.', { effect: 'multi_hit', params: { min: 2, max: 5 } }),
  move('galet_lance', 'Galet Lancé', 'roche', P, 60, 95, 20, 'Lance un gros galet poli.'),
  move('gemme_vive', 'Gemme Vive', 'roche', S, 70, 100, 20, 'Une gemme lance un éclat de lumière.'),
  move('silex', 'Silex', 'roche', P, 75, 95, 15, 'Éclat de silex. Critique fréquent.', { highCrit: true }),
  move('chute_roc', 'Chute Roc', 'roche', P, 85, 90, 10, 'Des rocs tombent. Peut apeurer.', { effect: 'flinch', chance: 30 }),
  move('quartz_vif', 'Quartz Vif', 'roche', S, 90, 100, 10, 'Un rayon de quartz étincelant.'),
  move('front_de_roc', 'Front de Roc', 'roche', P, 120, 80, 5, 'Coup de tête de pierre. Recul 1/3.', { effect: 'recoil', params: { fraction: 1 / 3 } }),
  move('rempart', 'Rempart', 'roche', X, 0, null, 20, 'Monte la Défense et la Déf. Spé.', { effect: 'self_stat_up', params: stats({ def: 1, spd: 1 }) }),
  move('polissage', 'Polissage', 'roche', X, 0, null, 20, 'Monte beaucoup la Vitesse.', { effect: 'self_stat_up', params: stats({ spe: 2 }) }),

  // Ombre
  move('pas_furtif', 'Pas Furtif', 'ombre', P, 40, 100, 30, 'Surgit de l’ombre et frappe en 1er.', { priority: 1 }),
  move('hantise', 'Hantise', 'ombre', S, 60, 100, 20, 'Une apparition. Rend confus.', { effect: 'confuse', chance: 20 }),
  move('traitrise', 'Traîtrise', 'ombre', P, 70, 100, 15, 'Frappe dans le dos. Critique+.', { highCrit: true }),
  move('ponction', 'Ponction', 'ombre', S, 75, 100, 10, 'Ponctionne la vie de la cible.', { effect: 'drain', params: { fraction: 1 / 2 } }),
  move('gueule_noire', 'Gueule Noire', 'ombre', P, 80, 100, 15, 'Morsure sombre. Peut apeurer.', { effect: 'flinch', chance: 20 }),
  move('encre_nuit', 'Encre Nuit', 'ombre', S, 80, 100, 15, 'Encre noire. Peut baisser la Préc.', { effect: 'target_stat_down', chance: 20, params: stats({ acc: -1 }) }),
  move('revenance', 'Revenance', 'ombre', S, 90, 100, 10, 'Un esprit frappe. Baisse la D.Spé.', { effect: 'target_stat_down', chance: 20, params: stats({ spd: -1 }) }),
  move('neant', 'Néant', 'ombre', S, 120, 85, 5, 'Plonge la cible dans le néant.'),
  move('effroi', 'Effroi', 'ombre', X, 0, 100, 20, 'Terrifie : Attaque très baissée.', { effect: 'target_stat_down', params: stats({ atk: -2 }) }),
  move('penombre', 'Pénombre', 'ombre', X, 0, null, 20, 'Se cache : monte l’Esquive.', { effect: 'self_stat_up', params: stats({ eva: 1 }) }),

  // Métal
  move('pointe_fer', 'Pointe Fer', 'metal', P, 40, 100, 30, 'Pique avec une pointe de fer.'),
  move('rivetage', 'Rivetage', 'metal', P, 25, 90, 20, 'Plante 2 à 5 rivets.', { effect: 'multi_hit', params: { min: 2, max: 5 } }),
  move('gant_de_fer', 'Gant de Fer', 'metal', P, 60, 100, 20, 'Un coup de poing ganté de fer.'),
  move('gong', 'Gong', 'metal', S, 70, 100, 15, 'Son de gong. Peut rendre confus.', { effect: 'confuse', chance: 20 }),
  move('taillade', 'Taillade', 'metal', P, 75, 95, 15, 'Lame de métal. Critique fréquent.', { highCrit: true }),
  move('chrome_vif', 'Chrome Vif', 'metal', S, 90, 100, 10, 'Éclat de chrome. Baisse la D.Spé.', { effect: 'target_stat_down', chance: 10, params: stats({ spd: -1 }) }),
  move('enclume', 'Enclume', 'metal', P, 95, 90, 10, 'Tombe comme une enclume. Apeure.', { effect: 'flinch', chance: 20 }),
  move('pilon', 'Pilon', 'metal', P, 120, 85, 5, 'Écrase la cible. Baisse sa Vitesse.', { effect: 'self_stat_down', params: stats({ spe: -1 }) }),
  move('blindage', 'Blindage', 'metal', X, 0, null, 20, 'Monte beaucoup la Défense.', { effect: 'self_stat_up', params: stats({ def: 2 }) }),
  move('rouille', 'Rouille', 'metal', X, 0, 90, 20, 'Rouille : Défense très baissée.', { effect: 'target_stat_down', params: stats({ def: -2 }) }),

  // Signatures des légendaires et du mythique
  move('ciel_dazur', 'Ciel d’Azur', 'vent', S, 110, 100, 5, 'Le ciel souffle. Monte l’A.Spé.', { effect: 'self_stat_up', chance: 20, params: stats({ spa: 1 }), exclusiveTo: ['azurel'] }),
  move('aube_bleue', 'Aube Bleue', 'arcane', S, 100, 100, 5, 'L’aube draine la vie de la cible.', { effect: 'drain', params: { fraction: 1 / 2 }, exclusiveTo: ['azurel'] }),
  move('glacier_roc', 'Glacier Roc', 'givre', P, 110, 90, 5, 'Bloc de glacier. Peut geler.', { effect: 'freeze', chance: 20, exclusiveTo: ['glacerne'] }),
  move('coeur_ardent', 'Cœur Ardent', 'feu', S, 110, 90, 5, 'Feu du volcan. Brûle souvent.', { effect: 'burn', chance: 30, exclusiveTo: ['volcarde'] }),
  move('fulgurance', 'Fulgurance', 'foudre', S, 110, 95, 5, 'Éclair fulgurant. Peut paralyser.', { effect: 'paralyze', chance: 20, exclusiveTo: ['fulgorine'] }),
  move('mille_eclats', 'Mille Éclats', 'arcane', S, 100, null, 5, 'Brûle, gèle ou paralyse parfois.', { effect: 'tri_status', chance: 20, exclusiveTo: ['mirelle'] }),
];

export const MOVES_BY_ID = Object.fromEntries(MOVES.map((entry) => [entry.id, entry]));
