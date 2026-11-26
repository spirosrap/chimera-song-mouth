export const FUTURE_CAST = ['future-julian', 'future-broadcast'] as const;
export type FutureId = typeof FUTURE_CAST[number];

export const FUTURE_CAMERAS = [
  'future-band', 'future-singer', 'future-guitar', 'future-drums',
  'future-critic', 'future-news', 'future-control', 'future-cinema',
  'future-protest', 'future-bach', 'future-beach', 'future-sanctuary',
  'future-party', 'future-cell', 'future-orbit', 'future-credits', 'future-meditation',
] as const;
export type FutureView = typeof FUTURE_CAMERAS[number];

export const FUTURE_SHOTS: ReadonlyArray<{ time: number; view: FutureView }> = [
  { time: 0, view: 'future-band' }, { time: 3.462, view: 'future-control' },
  { time: 6.715, view: 'future-guitar' }, { time: 8.926, view: 'future-critic' },
  { time: 13.305, view: 'future-news' }, { time: 17.559, view: 'future-control' },
  { time: 19.520, view: 'future-cinema' }, { time: 24.316, view: 'future-news' },
  { time: 29.196, view: 'future-singer' }, { time: 32.783, view: 'future-drums' },
  { time: 34.076, view: 'future-singer' }, { time: 38.580, view: 'future-guitar' },
  { time: 43.544, view: 'future-band' }, { time: 46.630, view: 'future-guitar' },
  { time: 47.798, view: 'future-news' }, { time: 51.969, view: 'future-guitar' },
  { time: 53.136, view: 'future-control' }, { time: 57.808, view: 'future-news' },
  { time: 59.101, view: 'future-singer' }, { time: 69.111, view: 'future-protest' },
  { time: 74.616, view: 'future-control' }, { time: 77.202, view: 'future-singer' },
  { time: 79.496, view: 'future-protest' }, { time: 83.584, view: 'future-guitar' },
  { time: 86.837, view: 'future-bach' }, { time: 94.136, view: 'future-guitar' },
  { time: 95.679, view: 'future-singer' }, { time: 98.724, view: 'future-guitar' },
  { time: 102.603, view: 'future-singer' }, { time: 106.189, view: 'future-beach' },
  { time: 120.01, view: 'future-cinema' }, { time: 123.749, view: 'future-sanctuary' },
  { time: 129.671, view: 'future-critic' }, { time: 135.26, view: 'future-party' },
  { time: 139.64, view: 'future-critic' }, { time: 142.14, view: 'future-cinema' },
  { time: 144.76, view: 'future-critic' }, { time: 150.73, view: 'future-bach' },
  { time: 153.18, view: 'future-protest' }, { time: 158.28, view: 'future-singer' },
  { time: 162.04, view: 'future-guitar' }, { time: 168.42, view: 'future-party' },
  { time: 171.26, view: 'future-band' }, { time: 176.55, view: 'future-cell' },
  { time: 180.34, view: 'future-party' }, { time: 184.06, view: 'future-cell' },
  { time: 187.09, view: 'future-protest' }, { time: 190.38, view: 'future-control' },
  { time: 192.11, view: 'future-cinema' }, { time: 195.5, view: 'future-orbit' },
  { time: 201.75, view: 'future-credits' }, { time: 249.21, view: 'future-meditation' },
];
