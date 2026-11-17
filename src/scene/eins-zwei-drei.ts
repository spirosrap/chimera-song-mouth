import type {CameraView} from './scene.ts';

export type EinsPoint = [number, number, number];
export type EinsLook = 'clerk' | 'red' | 'yellow' | 'counter-left' | 'counter-right' | 'pizza' | 'pink';
export type EinsRoom = 'office' | 'stage' | 'garage' | 'coast' | 'card';
type Shot = {
  room: EinsRoom;
  center: EinsPoint;
  height: number;
  width: number;
  angle: EinsPoint;
  cast: EinsLook[];
  roll?: number;
};

const shot = (room: EinsRoom, center: EinsPoint, height: number, width: number,
  angle: EinsPoint, cast: EinsLook[] = [], roll = 0): Shot => ({room, center, height, width, angle, cast, roll});

const stageBand: EinsLook[] = ['red', 'counter-left', 'counter-right'];
const shots = {
  'eins-open': shot('card', [0, 176, 0], 121, 236, [0, .01, 1]),
  'eins-office': shot('office', [0, 151, -50], 166, 277, [0, .045, 1], ['clerk']),
  'eins-phone': shot('office', [2, 150, 2], 82, 136, [.32, .085, 1], ['clerk'], .06),
  'eins-paper': shot('office', [-32, 108, 39], 97, 125, [-.28, .65, 1], ['clerk']),
  'eins-mug': shot('office', [-77, 92, 75], 48, 101, [.16, .42, 1]),
  'eins-desk-close': shot('office', [0, 151, 8], 95, 143, [-.24, .07, 1], ['clerk']),
  'eins-office-turn': shot('office', [0, 147, -1], 115, 179, [.37, .105, 1], ['clerk']),
  'eins-pink': shot('office', [-88, 135, 36], 67, 111, [.11, .08, 1], ['pink']),
  'eins-reveal': shot('stage', [0, 156, -51], 186, 322, [0, .06, 1], stageBand),
  'eins-stage': shot('stage', [0, 152, -56], 185, 307, [.09, .05, 1], stageBand),
  'eins-red-face': shot('stage', [0, 162, 61], 72, 107, [-.23, .055, 1], ['red'], -.05),
  'eins-red-side': shot('stage', [29, 151, 42], 104, 166, [.67, .09, 1], ['red'], .105),
  'eins-patch': shot('stage', [45, 143, 44], 104, 174, [.48, .08, 1], ['red'], -.075),
  'eins-knob': shot('stage', [90, 122, -146], 59, 103, [-.35, .04, 1]),
  'eins-counter-face': shot('stage', [-178, 155, -10], 81, 129, [-.21, .065, 1], ['counter-left']),
  'eins-pizza-face': shot('stage', [82, 120, 72], 77, 137, [.12, .14, 1], ['pizza']),
  'eins-pizza-count': shot('stage', [66, 157, 22], 146, 230, [.065, .075, 1], ['red', 'pizza', 'counter-right']),
  'eins-car-front': shot('garage', [0, 145, -9], 154, 237, [.04, .05, 1], ['yellow']),
  'eins-car-detail': shot('garage', [90, 101, 63], 78, 142, [.56, .315, 1], ['yellow']),
  'eins-breakfast': shot('garage', [79, 98, 86], 39, 75, [.12, .61, 1]),
  'eins-car-map': shot('garage', [12, 145, 53], 91, 144, [-.3, .125, 1], ['yellow']),
  'eins-driver': shot('garage', [-17, 139, 82], 77, 135, [-.31, .055, 1], ['yellow'], .075),
  'eins-driver-side': shot('garage', [-17, 144, 80], 76, 125, [.46, .09, 1], ['yellow'], -.08),
  'eins-car-rush': shot('garage', [0, 146, -9], 157, 251, [.03, .055, 1]),
  'eins-desk-dance': shot('stage', [0, 183, -34], 196, 319, [.035, .06, 1], stageBand),
  'eins-desk-dancer': shot('stage', [0, 225, 19], 106, 173, [-.24, -.04, 1], ['red'], .065),
  'eins-coast': shot('coast', [0, 120, -60], 165, 285, [.54, .21, 1]),
  'eins-road-flag': shot('coast', [0, 95, -122], 180, 290, [0, .25, 1]),
  'eins-end': shot('card', [0, 176, 0], 121, 232, [0, .01, 1]),
} satisfies Record<string, Shot>;

export const EINS_SHOTS: [number, CameraView][] = [
  [0, 'eins-open'], [4.6, 'eins-office'], [10.9, 'eins-phone'], [13.6, 'eins-office'],
  [16.8, 'eins-paper'], [20, 'eins-office'], [23.15, 'eins-mug'], [25.7, 'eins-desk-close'],
  [29.3, 'eins-office'], [34.2, 'eins-office-turn'], [37.8, 'eins-office'],
  [40.85, 'eins-reveal'], [45.55, 'eins-stage'], [46.98, 'eins-pink'],
  [50.65, 'eins-red-face'], [53.25, 'eins-stage'], [55.4, 'eins-red-side'],
  [58.8, 'eins-patch'], [62.3, 'eins-red-face'], [65.75, 'eins-patch'], [69.25, 'eins-red-side'],
  [72.65, 'eins-red-face'], [75.45, 'eins-counter-face'], [78.8, 'eins-car-front'],
  [80.58, 'eins-breakfast'], [81.42, 'eins-red-face'], [82.09, 'eins-car-detail'], [84.0, 'eins-car-front'], [85.35, 'eins-breakfast'], [87.57, 'eins-red-face'],
  [90.9, 'eins-car-front'], [94, 'eins-car-map'], [98.4, 'eins-red-face'],
  [103.4, 'eins-car-rush'], [108.0, 'eins-patch'], [113.3, 'eins-driver'],
  [117.15, 'eins-driver-side'], [120.9, 'eins-stage'], [124.5, 'eins-knob'],
  [127.3, 'eins-driver-side'], [130.4, 'eins-red-side'], [135.3, 'eins-driver'],
  [139.23, 'eins-car-rush'], [140.62, 'eins-pizza-face'], [141.4, 'eins-knob'],
  [143.81, 'eins-pizza-face'], [144.56, 'eins-knob'], [146.3, 'eins-pizza-face'],
  [147.12, 'eins-knob'], [147.8, 'eins-counter-face'], [149.2, 'eins-knob'],
  [151.8, 'eins-car-rush'], [155.0, 'eins-knob'], [155.77, 'eins-driver'], [157.47, 'eins-desk-dance'],
  [160.9, 'eins-desk-dancer'], [164.75, 'eins-desk-dance'], [168.27, 'eins-desk-dance'], [170.3, 'eins-phone'],
  [172.15, 'eins-desk-dance'], [175.6, 'eins-car-rush'], [178.55, 'eins-red-face'],
  [181.15, 'eins-driver-side'], [184.0, 'eins-paper'], [186.6, 'eins-patch'],
  [188.65, 'eins-desk-dancer'], [191.3, 'eins-driver'], [194.15, 'eins-coast'],
  [197.1, 'eins-road-flag'], [201.65, 'eins-end'],
];
export const EINS_CAMERAS = ['wide', 'eins-sam', 'eins-counter', ...Object.keys(shots)] as CameraView[];

export function einsState(choice: CameraView, time: number) {
  const t = Number.isFinite(time) ? Math.max(0, Math.min(time, 209.68)) : 0;
  let automatic = EINS_SHOTS[0][1];
  let cut = 0;
  for (const [at, view] of EINS_SHOTS) {
    if (at > t) break;
    automatic = view;
    cut = at;
  }
  const view = choice === 'wide' ? automatic : choice === 'eins-sam' ? 'eins-red-face'
    : choice === 'eins-counter' ? 'eins-pizza-face' : choice;
  const spec: Shot = shots[view as keyof typeof shots] ?? shots['eins-stage'];
  const cycle = (t - 49.7) * 127 / 60 * Math.PI * 2;
  return {
    ...spec, t, view, age: t - cut, cycle,
    desk: /reveal|desk-dance/.test(view), driving: /driver|car-rush/.test(view),
    dim: view === 'eins-open' ? Math.min(1, t * 2) : view === 'eins-end' ? Math.min(1, (209.68 - t) * .95) : 1,
  };
}

export function einsCamera(view: CameraView, time: number, aspect: number) {
  const s = einsState(view, time);
  const [x, y, z] = s.angle;
  const fov = 35;
  const fit = Math.max(.48, Math.min(1.72, aspect));
  const scale = Math.max(s.height, s.width / fit) / (Math.tan(fov * Math.PI / 360) * Math.hypot(x, y, z));
  const drift = s.room === 'card' ? 0 : Math.sin(s.t * 1.23) * (s.driving ? 4 : 1.9);
  const roll = (s.roll ?? 0) + (s.driving ? .018 * Math.sin(s.t * 4) : 0);
  const position: EinsPoint = [s.center[0] + x * scale + drift, s.center[1] + y * scale, s.center[2] + z * scale];
  const up: EinsPoint = [Math.sin(roll), Math.cos(roll), 0];
  return {position, target: s.center, up, fov};
}
