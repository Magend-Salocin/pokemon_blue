// Shared encounter tables of the Tour de la Mémoire (floors 2 to 4).
export const TOUR_ENCOUNTERS_LOW = {
  rate: 9,
  cave: [
    { creature: 'sombrelin', minLevel: 26, maxLevel: 28, weight: 25 },
    { creature: 'brumelin', minLevel: 26, maxLevel: 28, weight: 25 },
    { creature: 'cierget', minLevel: 26, maxLevel: 28, weight: 25 },
    { creature: 'glasnuit', minLevel: 27, maxLevel: 28, weight: 20 },
    { creature: 'fusiblet', minLevel: 30, maxLevel: 30, weight: 5 },
  ],
};

export const TOUR_ENCOUNTERS_HIGH = {
  rate: 9,
  cave: [
    { creature: 'brumelin', minLevel: 28, maxLevel: 30, weight: 22 },
    { creature: 'cierget', minLevel: 28, maxLevel: 30, weight: 22 },
    { creature: 'glasnuit', minLevel: 28, maxLevel: 30, weight: 20 },
    { creature: 'sombrelin', minLevel: 28, maxLevel: 29, weight: 14 },
    { creature: 'brumoire', minLevel: 30, maxLevel: 31, weight: 8 },
    { creature: 'sombrecor', minLevel: 30, maxLevel: 32, weight: 7 },
    { creature: 'fusiblet', minLevel: 30, maxLevel: 31, weight: 7 },
    { creature: 'quartzard', minLevel: 30, maxLevel: 31, weight: 4 },
  ],
};
