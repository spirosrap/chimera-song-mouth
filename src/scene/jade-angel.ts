export const JADE_CAST = ['jade-lead', 'jade-harmony', 'jade-sample', 'jade-dialogue'] as const;
export type JadeId = typeof JADE_CAST[number];

export const JADE_CAMERAS = [
  'jade-street', 'jade-medallion', 'jade-candles', 'jade-childhood', 'jade-audition',
  'jade-busker', 'jade-suv', 'jade-paparazzi', 'jade-press-close', 'jade-gadget',
  'jade-limo', 'jade-contract', 'jade-phone', 'jade-suite', 'jade-arrival', 'jade-angels',
  'jade-shoot', 'jade-rehearsal', 'jade-red-hair', 'jade-spotlight', 'jade-finale',
  'jade-news', 'jade-fade',
] as const;
export type JadeView = typeof JADE_CAMERAS[number];

export const JADE_SHOTS: ReadonlyArray<{ time: number; view: JadeView }> = [
  { time: 0, view: 'jade-street' }, { time: 8.1, view: 'jade-medallion' },
  { time: 13.25, view: 'jade-candles' }, { time: 16.9, view: 'jade-childhood' },
  { time: 22.3, view: 'jade-candles' }, { time: 24.65, view: 'jade-audition' },
  { time: 28.85, view: 'jade-busker' }, { time: 38.95, view: 'jade-suv' },
  { time: 43.15, view: 'jade-limo' }, { time: 46.55, view: 'jade-paparazzi' },
  { time: 55.6, view: 'jade-press-close' }, { time: 60.75, view: 'jade-paparazzi' },
  { time: 67.05, view: 'jade-press-close' }, { time: 76.8, view: 'jade-gadget' },
  { time: 79.65, view: 'jade-paparazzi' }, { time: 82.65, view: 'jade-busker' },
  { time: 91.2, view: 'jade-limo' }, { time: 94.7, view: 'jade-press-close' },
  { time: 99.6, view: 'jade-suv' }, { time: 102.1, view: 'jade-busker' },
  { time: 105.0, view: 'jade-paparazzi' }, { time: 108.25, view: 'jade-limo' },
  { time: 112.65, view: 'jade-contract' }, { time: 117.35, view: 'jade-limo' },
  { time: 119.25, view: 'jade-phone' }, { time: 127.8, view: 'jade-suite' },
  { time: 133.3, view: 'jade-arrival' }, { time: 136.9, view: 'jade-angels' },
  { time: 143.15, view: 'jade-shoot' }, { time: 146.4, view: 'jade-rehearsal' },
  { time: 151.4, view: 'jade-red-hair' }, { time: 155.35, view: 'jade-rehearsal' },
  { time: 159.85, view: 'jade-spotlight' }, { time: 164.0, view: 'jade-red-hair' },
  { time: 168.9, view: 'jade-rehearsal' }, { time: 174.4, view: 'jade-spotlight' },
  { time: 176.2, view: 'jade-red-hair' }, { time: 179.0, view: 'jade-rehearsal' },
  { time: 182.2, view: 'jade-spotlight' }, { time: 186.15, view: 'jade-finale' },
  { time: 194.0, view: 'jade-audition' }, { time: 197.1, view: 'jade-busker' },
  { time: 200.0, view: 'jade-press-close' }, { time: 202.7, view: 'jade-red-hair' },
  { time: 205.3, view: 'jade-limo' }, { time: 208.25, view: 'jade-paparazzi' },
  { time: 214.6, view: 'jade-news' }, { time: 222.3, view: 'jade-street' },
  { time: 224.85, view: 'jade-fade' },
];
