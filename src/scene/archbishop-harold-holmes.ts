export const ARCHBISHOP_CAST = ['holmes-preacher'] as const;
export type ArchbishopId = typeof ARCHBISHOP_CAST[number];

export const ARCHBISHOP_CAMERAS = [
  'holmes-organ', 'holmes-pulpit', 'holmes-typewriter', 'holmes-step', 'holmes-portrait',
  'holmes-aisle', 'holmes-pews', 'holmes-revival', 'holmes-charge', 'holmes-ward',
  'holmes-chair', 'holmes-doors',
] as const;
export type ArchbishopView = typeof ARCHBISHOP_CAMERAS[number];

export const ARCHBISHOP_SHOTS: ReadonlyArray<{ time: number; view: ArchbishopView }> = [
  { time: 0, view: 'holmes-organ' },
  { time: 2.586, view: 'holmes-pulpit' },
  { time: 7.549, view: 'holmes-typewriter' },
  { time: 9.218, view: 'holmes-pulpit' },
  { time: 11.094, view: 'holmes-step' },
  { time: 28.987, view: 'holmes-portrait' },
  { time: 31.573, view: 'holmes-aisle' },
  { time: 33.909, view: 'holmes-step' },
  { time: 36.495, view: 'holmes-portrait' },
  { time: 39.456, view: 'holmes-pulpit' },
  { time: 42.834, view: 'holmes-aisle' },
  { time: 55.973, view: 'holmes-step' },
  { time: 60.269, view: 'holmes-portrait' },
  { time: 62.479, view: 'holmes-aisle' },
  { time: 67.734, view: 'holmes-pews' },
  { time: 71.738, view: 'holmes-typewriter' },
  { time: 73.240, view: 'holmes-pulpit' },
  { time: 75.075, view: 'holmes-portrait' },
  { time: 82.583, view: 'holmes-step' },
  { time: 86.400, view: 'holmes-revival' },
  { time: 94.136, view: 'holmes-charge' },
  { time: 101.184, view: 'holmes-revival' },
  { time: 106.500, view: 'holmes-charge' },
  { time: 112.112, view: 'holmes-step' },
  { time: 116.617, view: 'holmes-aisle' },
  { time: 121.079, view: 'holmes-portrait' },
  { time: 125.584, view: 'holmes-step' },
  { time: 128.795, view: 'holmes-pulpit' },
  { time: 133.925, view: 'holmes-pews' },
  { time: 136.011, view: 'holmes-revival' },
  { time: 141.099, view: 'holmes-pews' },
  { time: 145.520, view: 'holmes-step' },
  { time: 151.234, view: 'holmes-ward' },
  { time: 158.575, view: 'holmes-chair' },
  { time: 164.150, view: 'holmes-doors' },
];
