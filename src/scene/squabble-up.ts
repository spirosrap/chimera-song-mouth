export const SQUABBLE_CAST = ['squabble-lead', 'squabble-hook', 'squabble-sample'] as const;
export type SquabbleId = typeof SQUABBLE_CAST[number];

export const SQUABBLE_CAMERAS = [
  'squabble-chandelier', 'squabble-nod', 'squabble-two-step', 'squabble-crew',
  'squabble-cross', 'squabble-bikes', 'squabble-reader', 'squabble-flags',
  'squabble-dancers', 'squabble-letters', 'squabble-portraits', 'squabble-placard',
  'squabble-party', 'squabble-crouch', 'squabble-trike', 'squabble-lowrider',
  'squabble-robed', 'squabble-parade', 'squabble-fade',
] as const;
export type SquabbleView = typeof SQUABBLE_CAMERAS[number];

export const SQUABBLE_SHOTS: ReadonlyArray<{ time: number; view: SquabbleView | 'wide' }> = [
  { time: 0, view: 'squabble-chandelier' }, { time: 6.715, view: 'wide' },
  { time: 14.598, view: 'squabble-nod' }, { time: 19.436, view: 'squabble-two-step' },
  { time: 24.525, view: 'squabble-nod' }, { time: 27.861, view: 'squabble-two-step' },
  { time: 32.991, view: 'squabble-crew' }, { time: 35.74, view: 'squabble-cross' },
  { time: 38.205, view: 'squabble-crew' }, { time: 40.499, view: 'squabble-cross' },
  { time: 46.838, view: 'squabble-crew' }, { time: 51.468, view: 'squabble-bikes' },
  { time: 52.844, view: 'squabble-flags' }, { time: 55.51, view: 'squabble-reader' },
  { time: 60.727, view: 'squabble-bikes' }, { time: 62.354, view: 'squabble-flags' },
  { time: 65.31, view: 'squabble-dancers' }, { time: 71.0, view: 'squabble-two-step' },
  { time: 74.14, view: 'squabble-dancers' }, { time: 78.31, view: 'squabble-two-step' },
  { time: 80.09, view: 'squabble-cross' }, { time: 83.39, view: 'squabble-dancers' },
  { time: 86.920, view: 'squabble-letters' }, { time: 89.05, view: 'squabble-portraits' },
  { time: 90.674, view: 'squabble-placard' }, { time: 100.56, view: 'squabble-letters' },
  { time: 103.0, view: 'squabble-placard' }, { time: 106.69, view: 'squabble-party' },
  { time: 110.56, view: 'squabble-nod' }, { time: 115.57, view: 'squabble-party' },
  { time: 118.45, view: 'squabble-crouch' }, { time: 121.52, view: 'squabble-trike' },
  { time: 124.31, view: 'squabble-cross' }, { time: 126.60, view: 'squabble-lowrider' },
  { time: 134.37, view: 'squabble-cross' }, { time: 136.93, view: 'squabble-lowrider' },
  { time: 144.02, view: 'squabble-robed' }, { time: 155.53, view: 'squabble-parade' },
  { time: 162.245, view: 'squabble-fade' },
];
