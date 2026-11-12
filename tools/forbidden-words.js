// Words and phrases that must never appear in game texts (game design, section 1).
// Matching is case- and accent-insensitive, on whole words or whole phrases.

export const FORBIDDEN_WORDS = [
  // Franchises and companies
  'pokemon', 'pokedex', 'poke ball', 'pokeball', 'centre pokemon', 'pokeflute', 'digimon', 'temtem',
  'dragon quest', 'cassette beasts', 'nintendo', 'game freak', 'monster ball',
  // Systems specific to the franchise
  'cs', 'ct', 'capsule technique', 'master ball', 'hyper ball', 'super ball', 'safari ball',
  // Distinctive French item names
  'super bonbon', 'total soin', 'rappel max', 'corde sortie', 'corde de sortie', 'hyper potion',
  'potion max', 'super potion', 'repousse', 'super repousse', 'max repousse', 'anti brule', 'anti para',
  'huile max', 'pierre lune', 'pierre soleil', 'pierre eau', 'pierre foudre', 'pierre feu', 'pierre plante',
  // Distinctive French move names
  'lance flammes', 'hydrocanon', 'fatal foudre', 'ultralaser', 'psyko', 'seisme', 'vive attaque',
  'pistolet a o', 'tranch herbe', 'fouet lianes', 'lance soleil', 'poudre dodo', 'vampigraine',
  'groz yeux', 'rugissement', 'danse lames', 'mimi queue', 'damocles', 'ball ombre',
  'eboulement', 'flammeche', 'cru ailes', 'dard venin', 'choc mental',
  'onde folie', 'ombre portee', 'coup bas', 'vent arriere',
  'feu follet', 'crocs feu', 'crocs givre', 'poing eclair', 'poing feu', 'poing glace',
  // Regions, towns and characters
  'kanto', 'johto', 'hoenn', 'sinnoh', 'unys', 'kalos', 'alola', 'galar', 'paldea', 'bourg palette',
  'jadielle', 'argenta', 'azuria', 'carmin sur mer', 'lavanville', 'celadopole', 'safrania', 'parmanie',
  'cramois ile', 'sacha', 'regis', 'professeur chen', 'team rocket', 'giovanni',
  // First-generation species (French and English names)
  'bulbizarre', 'herbizarre', 'florizarre', 'salameche', 'reptincel', 'dracaufeu', 'carapuce', 'carabaffe',
  'tortank', 'chenipan', 'chrysacier', 'papilusion', 'aspicot', 'coconfort', 'dardargnan', 'roucool',
  'roucoups', 'roucarnage', 'rattata', 'rattatac', 'piafabec', 'rapasdepic', 'abo', 'arbok', 'pikachu',
  'raichu', 'sabelette', 'sablaireau', 'nidoran', 'nidorina', 'nidoqueen', 'nidorino', 'nidoking',
  'melofee', 'melodelfe', 'goupix', 'feunard', 'rondoudou', 'grodoudou', 'nosferapti', 'nosferalto',
  'mystherbe', 'ortide', 'rafflesia', 'paras', 'parasect', 'mimitoss', 'aeromite', 'taupiqueur',
  'triopikeur', 'miaouss', 'persian', 'psykokwak', 'akwakwak', 'ferosinge', 'colossinge', 'caninos',
  'arcanin', 'ptitard', 'tetarte', 'tartard', 'abra', 'kadabra', 'alakazam', 'machoc', 'machopeur',
  'mackogneur', 'chetiflor', 'boustiflor', 'empiflor', 'tentacool', 'tentacruel', 'racaillou', 'gravalanch',
  'grolem', 'ponyta', 'galopa', 'ramoloss', 'flagadoss', 'magneti', 'magneton', 'canarticho', 'doduo',
  'dodrio', 'otaria', 'lamantine', 'tadmorv', 'grotadmorv', 'kokiyas', 'crustabri', 'fantominus',
  'spectrum', 'ectoplasma', 'onix', 'soporifik', 'hypnomade', 'krabby', 'krabboss', 'voltorbe',
  'electrode', 'noeunoeuf', 'noadkoko', 'osselait', 'ossatueur', 'kicklee', 'tygnon', 'excelangue',
  'smogo', 'smogogo', 'rhinocorne', 'rhinoferos', 'leveinard', 'saquedeneu', 'kangourex', 'hypotrempe',
  'hypocean', 'poissirene', 'poissoroy', 'stari', 'staross', 'insecateur', 'lippoutou', 'elektek',
  'magmar', 'scarabrute', 'tauros', 'magicarpe', 'leviator', 'lokhlass', 'metamorph', 'evoli',
  'aquali', 'voltali', 'pyroli', 'porygon', 'amonita', 'amonistar', 'kabuto', 'kabutops', 'ptera',
  'ronflex', 'artikodin', 'electhor', 'sulfura', 'minidraco', 'draco', 'dracolosse', 'mewtwo', 'mew',
  'bulbasaur', 'charmander', 'squirtle', 'caterpie', 'pidgey', 'jigglypuff', 'meowth', 'psyduck',
  'growlithe', 'snorlax', 'magikarp', 'gyarados', 'eevee', 'articuno', 'zapdos', 'moltres', 'dratini',
  'dragonite', 'charizard', 'blastoise', 'venusaur', 'gengar', 'machamp', 'geodude', 'vulpix', 'zubat',
  // Later-generation species close to names used in this game
  'farfuret', 'feunnec', 'azurill', 'goupilou', 'germignon', 'hericendre', 'kaiminus', 'poussifeu',
  'tiplouf', 'ouisticram', 'tortipouss', 'gruikui', 'moustillon', 'vipelierre', 'marisson', 'grenousse',
  'lumivole', 'miasmax', 'chandelure', 'lugulabre', 'cabriolaine', 'larveyette', 'venipatte', 'chovsourir',
];
