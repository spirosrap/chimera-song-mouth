export const EMO_GIRL_CAST = ['emo-yuno', 'emo-fantano'] as const;
export type EmoGirlId = typeof EMO_GIRL_CAST[number];

export const EMO_GIRL_CAMERAS = [
  'emo-snow', 'emo-snow-portrait', 'emo-snow-profile', 'emo-rainbow', 'emo-brick-alley',
  'emo-fisheye', 'emo-crowd', 'emo-dance', 'emo-night', 'emo-storefront', 'emo-living-room',
  'emo-backyard', 'emo-outro',
] as const;
export type EmoGirlView = typeof EMO_GIRL_CAMERAS[number];

export const EMO_GIRL_SHOTS: ReadonlyArray<{ time: number; view: EmoGirlView }> = [
  { time: 0, view: 'emo-snow-portrait' },
  { time: 2.2, view: 'emo-snow' },
  { time: 6.44, view: 'emo-snow-portrait' },
  { time: 8.84, view: 'emo-snow-profile' },
  { time: 12.16, view: 'emo-snow-portrait' },
  { time: 14.16, view: 'emo-rainbow' },
  { time: 22.12, view: 'emo-brick-alley' },
  { time: 27.88, view: 'emo-fisheye' },
  { time: 31.2, view: 'emo-brick-alley' },
  { time: 33.2, view: 'emo-fisheye' },
  { time: 36.6, view: 'emo-snow-profile' },
  { time: 42.96, view: 'emo-snow-portrait' },
  { time: 46, view: 'emo-snow' },
  { time: 47.48, view: 'emo-snow-portrait' },
  { time: 51, view: 'emo-crowd' },
  { time: 57.76, view: 'emo-dance' },
  { time: 62.08, view: 'emo-crowd' },
  { time: 63.2, view: 'emo-dance' },
  { time: 66.56, view: 'emo-night' },
  { time: 69.2, view: 'emo-storefront' },
  { time: 74.36, view: 'emo-night' },
  { time: 79.84, view: 'emo-living-room' },
  { time: 85.16, view: 'emo-snow-portrait' },
  { time: 90.28, view: 'emo-snow' },
  { time: 93.72, view: 'emo-snow-profile' },
  { time: 97.48, view: 'emo-snow-portrait' },
  { time: 101.2, view: 'emo-night' },
  { time: 109.28, view: 'emo-crowd' },
  { time: 112.32, view: 'emo-dance' },
  { time: 118.08, view: 'emo-backyard' },
  { time: 124.12, view: 'emo-outro' },
];
