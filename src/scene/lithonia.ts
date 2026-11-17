import type {CameraView} from './scene.ts';

export type LithoniaPoint = [number, number, number];
export type LithoniaActor = 'lead' | 'keys' | 'drums' | 'guitar' | 'bass' | 'listener' | 'guest';
type Room = 'studio' | 'woods';
type Shot = {
  room: Room;
  focus: LithoniaPoint;
  halfHeight: number;
  halfWidth: number;
  direction: LithoniaPoint;
  cast: LithoniaActor[];
  roll?: number;
};

const studio = (
  focus: LithoniaPoint, halfHeight: number, halfWidth: number, direction: LithoniaPoint,
  cast: LithoniaActor[] = [], roll = 0,
): Shot => ({room: 'studio', focus, halfHeight, halfWidth, direction, cast, roll});
const woods = (
  focus: LithoniaPoint, halfHeight: number, halfWidth: number, direction: LithoniaPoint,
  cast: LithoniaActor[] = [], roll = 0,
): Shot => ({room: 'woods', focus, halfHeight, halfWidth, direction, cast, roll});

const band: LithoniaActor[] = ['lead', 'keys', 'drums', 'guitar', 'bass'];
const shots = {
  'lith-microphone': studio([33, 147, 55], 37, 57, [.52, .01, 1]),
  'lith-profile': studio([8, 172, 53], 51, 76, [.89, .025, 1], ['lead']),
  'lith-glasses': studio([4, 178, 55], 48, 73, [.65, .03, 1], ['lead']),
  'lith-reveal': studio([0, 103, 14], 141, 200, [.07, .07, 1], ['lead']),
  'lith-room-wide': studio([0, 136, -40], 171, 323, [-.04, .08, 1], [...band, 'listener', 'guest']),
  'lith-guest-face': studio([-142, 108, 121], 71, 109, [-.19, .06, 1], ['guest']),
  'lith-listener-face': studio([140, 108, 125], 68, 108, [.24, .085, 1], ['listener']),
  'lith-listener-eyes': studio([140, 122, 125], 57, 89, [-.15, .03, 1], ['listener']),
  'lith-band': studio([0, 130, -59], 159, 296, [.07, .08, 1], band),
  'lith-handheld': studio([1, 153, 38], 86, 130, [.37, .045, 1], ['lead'], -.055),
  'lith-lead-face': studio([0, 157, 49], 68, 108, [-.15, .055, 1], ['lead']),
  'lith-keys': studio([-147, 125, -74], 109, 171, [-.24, .14, 1], ['keys']),
  'lith-keys-face': studio([-148, 134, -83], 67, 100, [.17, .075, 1], ['keys']),
  'lith-drums': studio([15, 143, -166], 102, 154, [.35, .13, 1], ['drums']),
  'lith-drums-face': studio([15, 154, -166], 70, 99, [-.18, .07, 1], ['drums']),
  'lith-guitar': studio([164, 129, -81], 126, 194, [.31, .09, 1], ['guitar']),
  'lith-guitar-face': studio([164, 155, -81], 69, 102, [.27, .09, 1], ['guitar']),
  'lith-bass': studio([-175, 157, -142], 76, 120, [-.28, .06, 1], ['bass']),
  'lith-rise': studio([0, 144, -24], 142, 252, [.1, .04, 1], band, .04),
  'lith-rupture': studio([0, 160, 53], 74, 107, [-.05, .012, 1], ['lead'], -.055),
  'lith-reaction': studio([140, 106, 125], 73, 113, [.10, .09, 1], ['listener']),
  'lith-shock': studio([140, 120, 125], 62, 101, [-.23, .025, 1], ['listener'], -.09),
  'lith-stagger': studio([0, 142, 50], 91, 133, [.29, .13, 1], ['lead'], .10),
  'lith-run-side': woods([20, 120, 65], 124, 205, [.64, .03, 1], ['listener'], -.095),
  'lith-run-front': woods([10, 140, 58], 122, 208, [-.15, .04, 1], ['lead', 'listener'], .055),
  'lith-pursuit': woods([-80, 146, -20], 113, 179, [.50, .02, 1], ['lead'], .12),
  'lith-branches': woods([12, 155, -175], 153, 245, [-.12, .045, 1], [], -.11),
  'lith-title': woods([0, 155, -124], 139, 218, [0, .04, 1]),
} satisfies Record<string, Shot>;

export const LITHONIA_SHOTS: [number, CameraView][] = [
  [0, 'lith-microphone'], [14.35, 'lith-profile'], [36.9, 'lith-glasses'],
  [41.45, 'lith-reveal'], [45, 'lith-room-wide'], [48.65, 'lith-guest-face'],
  [50.55, 'lith-listener-face'], [53.7, 'lith-band'], [55.85, 'lith-handheld'],
  [58.55, 'lith-lead-face'], [62, 'lith-room-wide'], [64.6, 'lith-handheld'],
  [68.1, 'lith-keys'], [71.2, 'lith-drums'], [73.6, 'lith-lead-face'],
  [76.45, 'lith-handheld'], [78.1, 'lith-listener-eyes'], [81.05, 'lith-lead-face'],
  [84.65, 'lith-band'], [88.6, 'lith-drums-face'], [92.1, 'lith-keys'],
  [93.5, 'lith-guitar'], [94.5, 'lith-keys-face'], [95.48, 'lith-drums'],
  [96.45, 'lith-bass'], [97.1, 'lith-guitar-face'], [98, 'lith-lead-face'],
  [99.4, 'lith-guitar-face'], [99.86, 'lith-bass'], [100.44, 'lith-keys-face'],
  [100.92, 'lith-drums-face'], [101.38, 'lith-rise'], [103.85, 'lith-lead-face'],
  [104.98, 'lith-rupture'], [105.44, 'lith-reaction'], [107.28, 'lith-shock'],
  [107.87, 'lith-stagger'], [109.37, 'lith-run-side'], [110.1, 'lith-run-front'],
  [111, 'lith-pursuit'], [111.72, 'lith-branches'], [112.34, 'lith-run-front'],
  [113.45, 'lith-branches'], [114.52, 'lith-title'],
];

export const LITHONIA_CAMERAS = ['wide', 'lith-gambino', 'lith-harmony', 'lith-witness', ...Object.keys(shots)] as CameraView[];

function currentCut(time: number): [number, CameraView] {
  for (let i = LITHONIA_SHOTS.length - 1; i >= 0; i--) {
    if (time >= LITHONIA_SHOTS[i][0]) return LITHONIA_SHOTS[i];
  }
  return LITHONIA_SHOTS[0];
}

const unit = (x: number) => Math.max(0, Math.min(1, x));
export const smoothStep = (low: number, high: number, x: number) => {
  const u = unit((x - low) / (high - low));
  return u * u * (3 - 2 * u);
};

export function lithoniaState(choice: CameraView, time: number) {
  const t = Math.max(0, Math.min(121.05, Number.isFinite(time) ? time : 0));
  const [start, cut] = currentCut(t);
  const manual = choice === 'lith-gambino' || choice === 'lith-harmony' || choice === 'lith-witness';
  const view = choice === 'wide' ? cut
    : choice === 'lith-gambino' ? 'lith-lead-face'
    : choice === 'lith-harmony' ? 'lith-keys-face'
    : choice === 'lith-witness' ? 'lith-listener-face' : choice;
  const shot: Shot = shots[view as keyof typeof shots] ?? shots['lith-band'];
  const rise = smoothStep(51, 99, t);
  return {
    ...shot, t, view, elapsed: t - start, manual, rise,
    intro: view === 'lith-microphone' || view === 'lith-profile' || view === 'lith-glasses',
    rupture: !manual && view === 'lith-rupture',
    chase: shot.room === 'woods' && t >= 109.37 && t < 114.52,
    fade: smoothStep(0, .9, t) * (1 - smoothStep(120.26, 121.04, t)),
  };
}

export function lithoniaCamera(choice: CameraView, time: number, aspect: number) {
  const state = lithoniaState(choice, time);
  const {t, focus, halfHeight, halfWidth, direction} = state;
  const [dx, dy, dz] = direction;
  const roomFit = Math.max(.48, Math.min(1.7, aspect));
  const fov = 34;
  const scale = Math.max(halfHeight, halfWidth / roomFit) / (Math.tan(fov * Math.PI / 360) * Math.hypot(dx, dy, dz));
  const motion = state.chase ? 9 : state.view === 'lith-handheld' || state.rupture ? 4.5 : 1.1;
  const x = Math.sin(t * (state.chase ? 8.2 : 2.1)) * motion;
  const y = Math.cos(t * (state.chase ? 9.1 : 1.3)) * motion * .36;
  const push = state.view === 'lith-profile' ? 1.12 - .16 * unit((t - 14.35) / 22.55) : 1;
  const position: LithoniaPoint = [focus[0] + dx * scale * push + x, focus[1] + dy * scale * push + y, focus[2] + dz * scale * push];
  const roll = (state.roll ?? 0) + (state.chase ? Math.sin(t * 11) * .045 : 0);
  const up: LithoniaPoint = [Math.sin(roll), Math.cos(roll), 0];
  return {position, target: focus, up, fov};
}
