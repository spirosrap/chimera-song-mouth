import type {CameraView} from './scene.ts';

export type DemonsPoint = [number, number, number];
export type DemonsRoom = 'card' | 'outside' | 'bedroom' | 'bathroom' | 'attic' | 'kitchen';
export type DemonsLook = 'demon' | 'bath' | 'typist' | 'homeowner';

type Shot = {
  room: DemonsRoom;
  look?: DemonsLook;
  focus: DemonsPoint;
  height: number;
  width: number;
  direction?: DemonsPoint;
  roll?: number;
};

export const DEMONS_SHOTS: [number, CameraView][] = [
  [0, 'demons-title'], [5.8, 'demons-house'], [9.5, 'demons-sale'], [12.1, 'demons-house'],
  [14.2, 'demons-dark-room'], [16.2, 'demons-sleep'], [18.3, 'demons-attic-window'],
  [21.4, 'demons-bedroom'], [23.8, 'demons-wake'], [27.2, 'demons-ceiling-face'],
  [31.8, 'demons-bedroom'], [36.2, 'demons-ceiling'], [39.6, 'demons-ceiling-face'],
  [43.4, 'demons-wake'], [47.3, 'demons-ceiling'], [51.9, 'demons-sleep'],
  [54.8, 'demons-ceiling'], [55.8, 'demons-headboard'], [60.2, 'demons-bedroom'],
  [62.1, 'demons-wake'], [63.6, 'demons-headboard'], [66, 'demons-bed-detail'],
  [68.1, 'demons-bed-creep'], [74, 'demons-bed-face'], [76.2, 'demons-bed-side'],
  [79.6, 'demons-bed-face'], [81.8, 'demons-shower'], [84.3, 'demons-tub'],
  [94, 'demons-bath-face'], [96, 'demons-claw'], [98, 'demons-bath-face'],
  [101.7, 'demons-eye-mark'], [103.6, 'demons-bath-reach'], [107.4, 'demons-overhead'],
  [109.7, 'demons-attic-dark'], [112.1, 'demons-attic-pack'], [113.8, 'demons-attic-crouch'],
  [116.2, 'demons-attic-face'], [118.2, 'demons-attic-pack'], [120, 'demons-attic-dark'],
  [121.2, 'demons-attic-pack'], [123.5, 'demons-attic-face'], [126.2, 'demons-tape'],
  [129, 'demons-attic-face'], [133.2, 'demons-investigate'], [135.8, 'demons-attic-dark'],
  [137.4, 'demons-flashlight'], [139.8, 'demons-typewriter'], [141.5, 'demons-page'],
  [143.3, 'demons-typist-face'], [145.9, 'demons-goats'], [147.4, 'demons-typewriter'],
  [149.7, 'demons-tv-children'], [152, 'demons-static'], [153.4, 'demons-typist-face'],
  [156.1, 'demons-keys'], [158, 'demons-typist-face'], [161, 'demons-typewriter'],
  [165.6, 'demons-flashlight'], [167.5, 'demons-floor-empty'], [170, 'demons-floor-crawl'],
  [174.2, 'demons-floor-face'], [178.2, 'demons-floor-empty'], [179.6, 'demons-kitchen'],
  [182.1, 'demons-kitchen-face'], [183.7, 'demons-kitchen-shadow'],
  [185.6, 'demons-chair'], [188.1, 'demons-kitchen-witness'], [190.1, 'demons-kitchen-face'],
  [191.7, 'demons-tv-children'], [193.6, 'demons-kitchen-pack'], [195.6, 'demons-kitchen-crawl'],
  [197.8, 'demons-chair'], [199.6, 'demons-flames'], [201.7, 'demons-kitchen-pack'],
  [204.4, 'demons-chair'], [205.9, 'demons-escape'], [207.6, 'demons-mailbox'],
  [209.7, 'demons-escape'], [211.4, 'demons-driver'], [213.4, 'demons-car'],
  [220, 'demons-last-house'], [222.4, 'demons-end'],
];

const shots: Record<string, Shot> = {
  'demons-title': {room: 'card', focus: [0, 175, 0], height: 130, width: 224},
  'demons-end': {room: 'card', focus: [0, 175, 0], height: 130, width: 224},
  'demons-house': {room: 'outside', focus: [0, 200, -255], height: 290, width: 500, direction: [-.52, .08, 1]},
  'demons-last-house': {room: 'outside', focus: [0, 195, -260], height: 275, width: 510, direction: [.36, .08, 1]},
  'demons-sale': {room: 'outside', focus: [135, 70, 150], height: 110, width: 180, direction: [-.24, .13, 1]},
  'demons-escape': {room: 'outside', look: 'homeowner', focus: [0, 153, 70], height: 170, width: 340, direction: [.27, .03, 1]},
  'demons-mailbox': {room: 'outside', look: 'homeowner', focus: [25, 134, 72], height: 170, width: 317, direction: [-.25, .11, 1]},
  'demons-car': {room: 'outside', focus: [0, 152, -85], height: 200, width: 450, direction: [.16, .09, 1]},
  'demons-driver': {room: 'outside', look: 'homeowner', focus: [0, 128, 109], height: 78, width: 138, direction: [.62, .15, 1]},
  'demons-dark-room': {room: 'bedroom', focus: [0, 123, -64], height: 180, width: 320, direction: [-.24, .06, 1]},
  'demons-bedroom': {room: 'bedroom', focus: [0, 162, -86], height: 205, width: 362, direction: [.11, -.03, 1]},
  'demons-sleep': {room: 'bedroom', look: 'homeowner', focus: [-73, 93, 10], height: 110, width: 175, direction: [0, 1, .26]},
  'demons-wake': {room: 'bedroom', look: 'homeowner', focus: [-62, 133, -23], height: 92, width: 139, direction: [-.08, .27, 1]},
  'demons-ceiling': {room: 'bedroom', look: 'demon', focus: [0, 195, -61], height: 213, width: 334, direction: [.16, -.08, 1]},
  'demons-ceiling-face': {room: 'bedroom', look: 'demon', focus: [0, 272, 25], height: 91, width: 151, direction: [.26, -.23, 1], roll: -.09},
  'demons-headboard': {room: 'bedroom', look: 'demon', focus: [-38, 190, 2], height: 108, width: 177, direction: [-.37, -.04, 1]},
  'demons-bed-detail': {room: 'bedroom', focus: [-55, 85, 40], height: 87, width: 177, direction: [.54, .11, 1]},
  'demons-bed-creep': {room: 'bedroom', look: 'demon', focus: [0, 111, 15], height: 135, width: 241, direction: [.08, .09, 1]},
  'demons-bed-face': {room: 'bedroom', look: 'demon', focus: [16, 126, 57], height: 93, width: 153, direction: [-.18, .08, 1]},
  'demons-bed-side': {room: 'bedroom', look: 'demon', focus: [20, 119, 49], height: 120, width: 214, direction: [.61, .19, 1]},
  'demons-shower': {room: 'bathroom', focus: [0, 156, 5], height: 177, width: 296},
  'demons-tub': {room: 'bathroom', look: 'bath', focus: [0, 145, 2], height: 164, width: 282},
  'demons-bath-face': {room: 'bathroom', look: 'bath', focus: [4, 111, 5], height: 70, width: 115, direction: [.35, .15, 1]},
  'demons-claw': {room: 'bathroom', focus: [62, 81, 45], height: 50, width: 92, direction: [.18, .23, 1]},
  'demons-eye-mark': {room: 'bathroom', look: 'bath', focus: [4, 120, 4], height: 73, width: 119, direction: [-.3, .18, 1]},
  'demons-bath-reach': {room: 'bathroom', look: 'bath', focus: [0, 115, 14], height: 91, width: 153, direction: [.45, .12, 1]},
  'demons-overhead': {room: 'bathroom', look: 'bath', focus: [0, 83, 0], height: 126, width: 183, direction: [0, 1, .07]},
  'demons-attic-window': {room: 'attic', focus: [-105, 174, -205], height: 160, width: 250, direction: [-.26, .08, 1]},
  'demons-attic-dark': {room: 'attic', look: 'demon', focus: [0, 123, -10], height: 172, width: 287, direction: [-.24, .02, 1], roll: -.12},
  'demons-attic-pack': {room: 'attic', look: 'demon', focus: [0, 146, 24], height: 153, width: 280, direction: [.12, .06, 1], roll: .045},
  'demons-attic-crouch': {room: 'attic', look: 'demon', focus: [0, 111, 41], height: 121, width: 194, direction: [.29, -.04, 1]},
  'demons-attic-face': {room: 'attic', look: 'demon', focus: [0, 144, 76], height: 80, width: 132, direction: [-.25, .05, 1], roll: -.08},
  'demons-tape': {room: 'attic', focus: [170, 90, 105], height: 60, width: 114, direction: [.25, .53, 1]},
  'demons-investigate': {room: 'attic', look: 'homeowner', focus: [0, 136, 72], height: 111, width: 174, direction: [.22, .1, 1]},
  'demons-flashlight': {room: 'attic', look: 'homeowner', focus: [0, 152, 76], height: 80, width: 133, direction: [-.09, .04, 1]},
  'demons-typewriter': {room: 'attic', look: 'typist', focus: [0, 132, 37], height: 152, width: 276, direction: [.11, .08, 1]},
  'demons-typist-face': {room: 'attic', look: 'typist', focus: [0, 149, 36], height: 79, width: 130, direction: [-.42, .09, 1]},
  'demons-page': {room: 'attic', focus: [0, 109, 99], height: 45, width: 78, direction: [-.08, .21, 1]},
  'demons-keys': {room: 'attic', look: 'typist', focus: [0, 130, 76], height: 111, width: 163, direction: [.51, .34, 1]},
  'demons-goats': {room: 'attic', focus: [90, 62, 103], height: 78, width: 142, direction: [.16, .08, 1]},
  'demons-tv-children': {room: 'bedroom', focus: [54, 86, -41], height: 105, width: 187, direction: [-.25, .13, 1]},
  'demons-static': {room: 'bedroom', focus: [87, 109, -103], height: 51, width: 78, direction: [.03, .035, 1]},
  'demons-floor-empty': {room: 'attic', focus: [0, 76, 24], height: 100, width: 194, direction: [.22, -.06, 1]},
  'demons-floor-crawl': {room: 'attic', look: 'demon', focus: [0, 81, 66], height: 109, width: 172, direction: [.16, -.09, 1]},
  'demons-floor-face': {room: 'attic', look: 'demon', focus: [0, 91, 87], height: 67, width: 109, direction: [-.25, -.03, 1]},
  'demons-kitchen': {room: 'kitchen', focus: [0, 133, -64], height: 179, width: 309, direction: [.24, .1, 1]},
  'demons-kitchen-face': {room: 'kitchen', look: 'demon', focus: [0, 135, 50], height: 90, width: 133, direction: [-.26, .1, 1]},
  'demons-kitchen-shadow': {room: 'kitchen', focus: [188, 142, -156], height: 140, width: 230, direction: [.22, .01, 1]},
  'demons-chair': {room: 'kitchen', look: 'demon', focus: [-12, 151, 48], height: 145, width: 216, direction: [.54, -.11, 1], roll: .10},
  'demons-kitchen-witness': {room: 'kitchen', look: 'homeowner', focus: [0, 142, 52], height: 112, width: 176, direction: [-.1, .06, 1]},
  'demons-kitchen-pack': {room: 'kitchen', look: 'demon', focus: [0, 137, 26], height: 173, width: 305, direction: [.24, .13, 1]},
  'demons-kitchen-crawl': {room: 'kitchen', look: 'demon', focus: [0, 111, 55], height: 118, width: 175, direction: [-.25, .37, 1]},
  'demons-flames': {room: 'kitchen', focus: [168, 112, -86], height: 101, width: 163, direction: [-.18, .22, 1]},
};

export const DEMONS_CAMERAS = ['wide', 'demons-doja', 'demons-shadow', 'demons-homeowner', ...Object.keys(shots)] as CameraView[];

export function demonsView(time: number): CameraView {
  let view: CameraView = 'demons-title';
  for (const [at, next] of DEMONS_SHOTS) {
    if (at > time) break;
    view = next;
  }
  return view;
}

const clamp = (x: number) => Math.max(0, Math.min(1, x));
export function demonsState(view: CameraView, time: number) {
  const t = Math.max(0, Math.min(225.93, Number.isFinite(time) ? time : 0));
  const viewName = view === 'wide' ? demonsView(t) : view;
  const autoShot = shots[demonsView(t)];
  let shot = shots[viewName] ?? shots['demons-bedroom'];
  if (viewName === 'demons-doja') {
    if (autoShot.room === 'bathroom') shot = shots['demons-bath-face'];
    else if (t >= 139.8 && t < 166) shot = shots['demons-typist-face'];
    else shot = shots['demons-attic-face'];
  }
  if (viewName === 'demons-shadow') shot = shots['demons-attic-face'];
  if (viewName === 'demons-homeowner') shot = shots['demons-flashlight'];
  const ceiling = viewName.includes('ceiling');
  const crawl = /bed-|crawl|floor-face|crouch|headboard/.test(viewName) && shot.look === 'demon';
  const pulse = (t - 32.95) * 140 / 60 * Math.PI * 2;
  return {
    t, view: viewName, ...shot, ceiling, crawl, pulse,
    pack: viewName.includes('pack'),
    typing: shot.look === 'typist' || /page|goats/.test(viewName),
    cold: shot.room !== 'kitchen' && !(shot.room === 'attic' && t >= 126 && t < 167),
    car: clamp((t - 213.3) / 6),
    fade: clamp(t / .65) * clamp((225.91 - t) / 1.1),
  };
}

export function demonsCamera(view: CameraView, time: number, aspect: number) {
  const state = demonsState(view, time);
  const [x, y, z] = state.direction ?? [0, .03, 1];
  const fit = Math.max(.43, Math.min(1.6, aspect));
  const fov = 35;
  const distance = Math.max(state.height, state.width / fit) / Math.tan(fov * Math.PI / 360);
  const scale = distance / Math.hypot(x, y, z);
  const [fx, fy, fz] = state.focus;
  const drift = state.room === 'card' ? 0 : Math.sin(state.t * .43) * Math.min(9, state.width / 24);
  const position: DemonsPoint = [fx + x * scale + drift, fy + y * scale, fz + z * scale];
  const roll = state.roll ?? 0;
  const up: DemonsPoint = state.view === 'demons-sleep' || state.view === 'demons-overhead'
    ? [0, .19, -1] : [Math.sin(roll), Math.cos(roll), 0];
  return {position, up, target: state.focus, fov};
}
