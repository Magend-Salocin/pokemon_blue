// Simplified map of Brumeval for the Bestiaire (original layout, 20 × 14 cells of 8 px).
// LAND: rectangles of land on the sea. ZONES: map ids placed on the region; the Bestiaire
// highlights the zones whose map lists the species in its encounters. Content prompts
// (09 to 11) use these map ids.

export const REGION_SIZE = { columns: 20, rows: 14, cell: 8 };

export const LAND = [
  { x: 1, y: 1, w: 7, h: 12 }, // west coast and southern marshes
  { x: 8, y: 1, w: 7, h: 6 }, // centre
  { x: 15, y: 0, w: 4, h: 7 }, // northern mountains
  { x: 8, y: 9, w: 3, h: 3 }, // islets
  { x: 13, y: 9, w: 3, h: 4 }, // volcanic island
  { x: 16, y: 7, w: 3, h: 4 }, // windy cliffs
];

export const ZONES = [
  { map: 'hameau_de_lys', name: 'Hameau-de-Lys', x: 2, y: 12, w: 1, h: 1 },
  { map: 'route_1', name: 'Route 1', x: 3, y: 10, w: 1, h: 2 },
  { map: 'bourg_sablon', name: 'Bourg-Sablon', x: 4, y: 9, w: 1, h: 1 },
  { map: 'bois_murmurant', name: 'Bois Murmurant', x: 5, y: 7, w: 2, h: 2 },
  { map: 'grotte_des_cascades', name: 'Grotte des Cascades', x: 7, y: 5, w: 1, h: 2 },
  { map: 'port_ondine', name: 'Port-Ondine', x: 8, y: 6, w: 1, h: 1 },
  { map: 'vireval', name: 'Vireval', x: 11, y: 4, w: 1, h: 1 },
  { map: 'route_2', name: 'Route 2', x: 5, y: 9, w: 1, h: 1 },
  { map: 'route_3', name: 'Route 3', x: 7, y: 7, w: 1, h: 1 },
  { map: 'grotte_des_cascades_2', name: 'Grotte des Cascades', x: 7, y: 5, w: 1, h: 2 },
  { map: 'route_4', name: 'Route 4', x: 9, y: 6, w: 1, h: 1 },
  { map: 'route_5', name: 'Route 5', x: 10, y: 5, w: 1, h: 1 },
  { map: 'usine_opale_1', name: 'Usine Opale', x: 11, y: 4, w: 1, h: 1 },
  { map: 'usine_opale_2', name: 'Usine Opale', x: 11, y: 4, w: 1, h: 1 },
  { map: 'route_6', name: 'Route 6', x: 11, y: 3, w: 1, h: 1 },
  { map: 'tunnel_obscur', name: 'Tunnel Obscur', x: 12, y: 2, w: 1, h: 2 },
  { map: 'tour_memoire_2', name: 'Tour de la Mémoire', x: 14, y: 2, w: 1, h: 1 },
  { map: 'tour_memoire_3', name: 'Tour de la Mémoire', x: 14, y: 2, w: 1, h: 1 },
  { map: 'tour_memoire_4', name: 'Tour de la Mémoire', x: 14, y: 2, w: 1, h: 1 },
  { map: 'cendrelune', name: 'Cendrelune', x: 13, y: 2, w: 1, h: 1 },
  { map: 'haute_bise', name: 'Haute-Bise', x: 17, y: 8, w: 1, h: 1 },
  { map: 'marais_gris', name: 'Marais Gris', x: 2, y: 4, w: 2, h: 2 },
  { map: 'ombrecourt', name: 'Ombrecourt', x: 4, y: 2, w: 1, h: 1 },
  { map: 'forge_ardente', name: 'Forge-Ardente', x: 14, y: 10, w: 1, h: 1 },
  { map: 'givremont', name: 'Givremont', x: 16, y: 2, w: 1, h: 1 },
  { map: 'citadelle_azur', name: 'Citadelle d’Azur', x: 17, y: 0, w: 1, h: 1 },
];

/** Zones where a species appears, from the encounter tables of the given maps. */
export function zonesOfSpecies(species, maps) {
  return ZONES.filter((zone) => {
    const encounters = maps[zone.map]?.encounters;
    if (!encounters) return false;
    return Object.entries(encounters).some(([kind, table]) => kind !== 'rate' && table.some((entry) => entry.creature === species));
  });
}
