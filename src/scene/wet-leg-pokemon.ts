export const POKEMON_CAST = ['pokemon-vocal'] as const;
export type PokemonId = typeof POKEMON_CAST[number];

export const POKEMON_CAMERAS = [
  'pokemon-chair', 'pokemon-breakfast', 'pokemon-window', 'pokemon-shell',
  'pokemon-day-drive', 'pokemon-goggles', 'pokemon-studio', 'pokemon-picnic',
  'pokemon-grill', 'pokemon-treadmill', 'pokemon-neighbours', 'pokemon-night-drive',
  'pokemon-crack', 'pokemon-lift', 'pokemon-road', 'pokemon-hatch',
  'pokemon-hatchling', 'pokemon-road-crew', 'pokemon-mirror', 'pokemon-hands',
] as const;
export type PokemonView = typeof POKEMON_CAMERAS[number];

export const POKEMON_SHOTS: ReadonlyArray<{ time: number; view: PokemonView }> = [
  { time: 0, view: 'pokemon-chair' },
  { time: 11.887, view: 'pokemon-window' },
  { time: 14.848, view: 'pokemon-chair' },
  { time: 17.768, view: 'pokemon-breakfast' },
  { time: 26.652, view: 'pokemon-window' },
  { time: 29.571, view: 'pokemon-breakfast' },
  { time: 33.992, view: 'pokemon-window' },
  { time: 35.452, view: 'pokemon-chair' },
  { time: 39.915, view: 'pokemon-shell' },
  { time: 43.200, view: 'pokemon-breakfast' },
  { time: 47.214, view: 'pokemon-day-drive' },
  { time: 55.347, view: 'pokemon-goggles' },
  { time: 61.936, view: 'pokemon-day-drive' },
  { time: 64.897, view: 'pokemon-studio' },
  { time: 72.698, view: 'pokemon-picnic' },
  { time: 79.079, view: 'pokemon-grill' },
  { time: 86.503, view: 'pokemon-picnic' },
  { time: 91.800, view: 'pokemon-treadmill' },
  { time: 98.682, view: 'pokemon-picnic' },
  { time: 101.643, view: 'pokemon-treadmill' },
  { time: 110.569, view: 'pokemon-neighbours' },
  { time: 117.951, view: 'pokemon-studio' },
  { time: 120.871, view: 'pokemon-night-drive' },
  { time: 126.752, view: 'pokemon-crack' },
  { time: 132.551, view: 'pokemon-night-drive' },
  { time: 136.054, view: 'pokemon-crack' },
  { time: 141.474, view: 'pokemon-night-drive' },
  { time: 144.019, view: 'pokemon-lift' },
  { time: 156.198, view: 'pokemon-lift' },
  { time: 160.619, view: 'pokemon-road' },
  { time: 166.708, view: 'pokemon-hatch' },
  { time: 170.170, view: 'pokemon-hatchling' },
  { time: 176.092, view: 'pokemon-road-crew' },
  { time: 182.683, view: 'pokemon-hatchling' },
  { time: 194.486, view: 'pokemon-road-crew' },
  { time: 195.987, view: 'pokemon-mirror' },
  { time: 198.156, view: 'pokemon-hands' },
];

export const EGG_CRACK_AT = 120.871;
export const EGG_HATCH_AT = 166.708;
