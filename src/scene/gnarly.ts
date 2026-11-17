import type {CameraView} from './scene.ts';

export const GNARLY_CAST = ['gnarly-spoken', 'gnarly-verse', 'gnarly-chorus'] as const;
export type GnarlyId = typeof GNARLY_CAST[number];
export type GnarlyPoint = [number, number, number];
export type GnarlyRoom = 'tray' | 'kitchen' | 'corridor' | 'booth' | 'club' | 'street' |
  'limo' | 'house' | 'hills' | 'carpet' | 'blade' | 'card';
type Formation = 'empty' | 'solo' | 'pair' | 'line' | 'crowd' | 'lift';
type Shot = {
  room: GnarlyRoom;
  center: GnarlyPoint;
  height: number;
  width: number;
  direction: GnarlyPoint;
  formation: Formation;
  focus: number;
  roll: number;
};

const shot = (room: GnarlyRoom, center: GnarlyPoint, height: number, width: number,
  direction: GnarlyPoint, formation: Formation, focus = 0, roll = 0): Shot =>
  ({room, center, height, width, direction, formation, focus, roll});

const shots = {
  'gnarly-tray': shot('tray',[0,170,28],59,94,[.02,.055,1],'solo'),
  'gnarly-wrapper': shot('tray',[0,169,25],65,112,[.15,.13,1],'solo',0,.08),
  'gnarly-kitchen': shot('kitchen',[0,143,4],144,223,[.15,.075,1],'line',1),
  'gnarly-prep': shot('kitchen',[0,91,94],57,102,[.24,1.08,1],'empty',0,-.12),
  'gnarly-ingredients': shot('kitchen',[-52,94,91],47,81,[-.08,1.24,1],'empty'),
  'gnarly-kitchen-pair': shot('kitchen',[0,149,46],91,120,[.11,.06,1],'pair'),
  'gnarly-bite': shot('kitchen',[0,153,63],66,96,[-.24,.11,1],'solo'),
  'gnarly-sandwich': shot('kitchen',[41,97,91],45,77,[.18,.61,1],'empty',0,-.06),
  'gnarly-kitchen-dance': shot('kitchen',[0,124,20],142,229,[-.15,.09,1],'line',1,.06),
  'gnarly-kitchen-face': shot('kitchen',[0,155,42],76,113,[.12,.065,1],'solo',1,-.05),
  'gnarly-kitchen-overhead': shot('kitchen',[0,121,22],149,236,[-.20,1.1,1],'line',1,-.12),
  'gnarly-eggs': shot('kitchen',[89,99,45],52,77,[0,1.18,1],'empty'),
  'gnarly-fridge': shot('kitchen',[-2,149,5],147,218,[.045,.065,1],'pair',1),
  'gnarly-corridor': shot('corridor',[0,139,-41],153,212,[.0,.06,1],'line',1),
  'gnarly-corridor-low': shot('corridor',[0,135,-24],143,228,[.14,-.10,1],'line',1,-.11),
  'gnarly-red-face': shot('corridor',[0,154,38],68,105,[-.20,.045,1],'solo',1,.12),
  'gnarly-red-side': shot('corridor',[0,135,18],143,231,[.44,.055,1],'line',2,.045),
  'gnarly-silhouettes': shot('corridor',[0,139,-42],134,217,[0,.065,1],'line',2),
  'gnarly-booth': shot('booth',[0,151,29],85,124,[-.04,.045,1],'pair',2),
  'gnarly-booth-close': shot('booth',[0,151,58],65,93,[.16,.015,1],'solo',2,-.08),
  'gnarly-counter-hands': shot('kitchen',[32,102,73],62,113,[.21,.95,1],'empty'),
  'gnarly-club': shot('club',[0,136,-20],164,256,[.11,.07,1],'crowd',2),
  'gnarly-green-face': shot('club',[0,153,57],70,107,[-.175,.055,1],'solo',2),
  'gnarly-green-row': shot('club',[0,123,-4],139,226,[-.13,.085,1],'line',2,-.05),
  'gnarly-club-above': shot('club',[0,107,-65],191,270,[.28,1.55,1],'crowd',2,.07),
  'gnarly-audience': shot('club',[0,113,162],147,233,[.16,.14,1],'empty',0,-.10),
  'gnarly-phone': shot('club',[64,148,155],70,124,[-.12,.14,1],'empty'),
  'gnarly-crowd-face': shot('club',[0,148,115],80,116,[.28,.06,1],'solo',0,.065),
  'gnarly-crowd-surf': shot('club',[0,154,56],110,159,[.12,.69,1],'lift',2,-.1),
  'gnarly-limo-door': shot('street',[0,104,-55],139,245,[.48,.095,1],'empty'),
  'gnarly-limo-wheel': shot('street',[-137,46,47],68,123,[.35,.16,1],'empty',0,.07),
  'gnarly-limo-road': shot('street',[0,100,-34],174,259,[-.54,.21,1],'empty',0,.05),
  'gnarly-neon-limo': shot('limo',[0,124,-25],127,207,[.07,.055,1],'line',1),
  'gnarly-limo-duo': shot('limo',[0,149,34],93,133,[.04,.05,1],'pair'),
  'gnarly-limo-face': shot('limo',[0,147,67],69,104,[-.28,.055,1],'solo',1,-.1),
  'gnarly-boba': shot('limo',[0,148,66],66,109,[.23,.085,1],'solo',0,-.08),
  'gnarly-limo-side': shot('limo',[0,141,46],88,134,[.58,.06,1],'pair',1,.04),
  'gnarly-laptop': shot('limo',[59,86,100],57,97,[.4,.87,1],'empty'),
  'gnarly-screen': shot('house',[-110,161,35],89,146,[.11,.045,1],'solo',0),
  'gnarly-crash': shot('house',[43,133,-34],161,258,[.25,.06,1],'pair',1),
  'gnarly-mansion': shot('house',[0,143,27],152,236,[-.24,.09,1],'line',1,-.06),
  'gnarly-mansion-face': shot('house',[0,157,43],70,108,[.23,.045,1],'solo',1),
  'gnarly-slime': shot('house',[98,117,60],83,126,[-.12,.21,1],'empty'),
  'gnarly-balcony': shot('house',[0,135,8],152,234,[.06,.13,1],'lift',1),
  'gnarly-hills': shot('hills',[0,118,-105],138,232,[.04,.22,1],'empty'),
  'gnarly-carpet-door': shot('street',[45,120,10],157,231,[.27,.15,1],'pair'),
  'gnarly-runway': shot('carpet',[0,141,-75],163,256,[.065,.11,1],'crowd',2),
  'gnarly-carpet-aerial': shot('carpet',[0,99,-54],188,289,[.05,1.81,1],'line',2),
  'gnarly-carpet-pair': shot('carpet',[0,153,60],88,141,[.28,.045,1],'pair',2,-.07),
  'gnarly-banquet': shot('carpet',[0,106,70],85,149,[-.36,.65,1],'empty'),
  'gnarly-slice': shot('carpet',[0,98,99],41,72,[.31,.48,1],'empty'),
  'gnarly-camera': shot('carpet',[142,145,143],86,126,[.15,.12,1],'empty',0,-.08),
  'gnarly-red-carpet-dance': shot('carpet',[0,139,8],149,237,[-.19,.09,1],'crowd',2,.07),
  'gnarly-carpet-face': shot('carpet',[0,155,55],71,110,[.14,.04,1],'solo',2,-.07),
  'gnarly-final-line': shot('carpet',[0,140,12],149,241,[.05,.065,1],'line',2),
  'gnarly-reflection': shot('blade',[0,158,48],76,127,[.045,.065,1],'solo',2,-.16),
  'gnarly-end-sandwich': shot('kitchen',[40,106,94],64,108,[.15,.51,1],'empty'),
  'gnarly-logo': shot('card',[0,162,0],121,212,[0,.02,1],'empty'),
} satisfies Record<string, Shot>;

export type GnarlyView = keyof typeof shots;

export const GNARLY_SHOTS: [number, GnarlyView][] = [
  [0,'gnarly-tray'], [3.43,'gnarly-wrapper'], [5.13,'gnarly-kitchen'], [5.76,'gnarly-prep'],
  [6.63,'gnarly-ingredients'], [7.30,'gnarly-kitchen-pair'], [8.43,'gnarly-ingredients'],
  [9.01,'gnarly-bite'], [9.88,'gnarly-sandwich'], [10.76,'gnarly-prep'], [11.85,'gnarly-counter-hands'],
  [12.63,'gnarly-kitchen-dance'], [14.18,'gnarly-kitchen-overhead'], [16.39,'gnarly-kitchen-face'],
  [18.64,'gnarly-kitchen-dance'], [19.98,'gnarly-kitchen-face'], [21.06,'gnarly-kitchen-overhead'],
  [23.19,'gnarly-kitchen-face'], [24.02,'gnarly-kitchen-dance'], [25.02,'gnarly-kitchen-pair'],
  [26.65,'gnarly-eggs'], [27.49,'gnarly-fridge'], [29.31,'gnarly-corridor'], [30.84,'gnarly-corridor-low'],
  [32.02,'gnarly-red-side'], [33.77,'gnarly-corridor-low'], [34.58,'gnarly-silhouettes'],
  [36.27,'gnarly-red-face'], [37.27,'gnarly-booth-close'], [37.83,'gnarly-booth'],
  [39.46,'gnarly-booth-close'], [40.13,'gnarly-red-face'], [41.42,'gnarly-kitchen'],
  [42.75,'gnarly-counter-hands'], [44.03,'gnarly-club'], [44.71,'gnarly-green-face'],
  [45.38,'gnarly-green-row'], [46.25,'gnarly-club'], [47.42,'gnarly-club-above'],
  [48.42,'gnarly-club'], [49.34,'gnarly-green-row'], [50.05,'gnarly-audience'],
  [50.97,'gnarly-club'], [52.51,'gnarly-audience'], [53.79,'gnarly-phone'], [54.47,'gnarly-crowd-face'],
  [55.31,'gnarly-green-face'], [56.39,'gnarly-club'], [57.56,'gnarly-crowd-face'],
  [58.10,'gnarly-club-above'], [58.73,'gnarly-green-row'], [59.98,'gnarly-crowd-surf'],
  [61.69,'gnarly-crowd-face'], [62.31,'gnarly-limo-wheel'], [63.52,'gnarly-limo-face'],
  [64.52,'gnarly-limo-door'], [65.0,'gnarly-boba'], [65.89,'gnarly-limo-road'],
  [66.80,'gnarly-neon-limo'], [67.61,'gnarly-limo-side'], [68.11,'gnarly-limo-face'],
  [69.78,'gnarly-neon-limo'], [70.40,'gnarly-boba'], [71.03,'gnarly-limo-duo'], [71.84,'gnarly-laptop'],
  [72.41,'gnarly-screen'], [73.32,'gnarly-screen'], [76.18,'gnarly-crash'],
  [78.79,'gnarly-mansion'], [79.87,'gnarly-crash'], [80.62,'gnarly-mansion-face'],
  [81.41,'gnarly-mansion'], [83.11,'gnarly-slime'], [84.08,'gnarly-mansion'],
  [86.63,'gnarly-balcony'], [89.10,'gnarly-hills'], [91.84,'gnarly-limo-road'],
  [92.63,'gnarly-limo-duo'], [94.76,'gnarly-neon-limo'], [95.6,'gnarly-limo-duo'],
  [96.3,'gnarly-limo-side'], [97.39,'gnarly-boba'], [98.08,'gnarly-limo-road'],
  [99.02,'gnarly-neon-limo'], [99.93,'gnarly-limo-face'], [100.56,'gnarly-limo-side'],
  [101.39,'gnarly-neon-limo'], [102.02,'gnarly-sandwich'], [103.35,'gnarly-prep'],
  [104.02,'gnarly-limo-face'], [105.40,'gnarly-limo-road'], [106.73,'gnarly-carpet-door'],
  [107.48,'gnarly-runway'], [109.29,'gnarly-carpet-aerial'], [110.21,'gnarly-carpet-pair'],
  [111.40,'gnarly-banquet'], [112.15,'gnarly-slice'], [113.07,'gnarly-carpet-face'],
  [114.08,'gnarly-runway'], [115.72,'gnarly-camera'], [116.36,'gnarly-red-carpet-dance'],
  [117.29,'gnarly-camera'], [118.05,'gnarly-carpet-pair'], [119.62,'gnarly-carpet-face'],
  [120.50,'gnarly-carpet-aerial'], [121.56,'gnarly-red-carpet-dance'], [123.09,'gnarly-carpet-face'],
  [124.50,'gnarly-red-carpet-dance'], [126.01,'gnarly-camera'], [126.78,'gnarly-carpet-aerial'],
  [127.69,'gnarly-carpet-pair'], [128.49,'gnarly-red-carpet-dance'], [129.09,'gnarly-final-line'],
  [131.17,'gnarly-final-line'], [132.02,'gnarly-runway'], [133.07,'gnarly-carpet-pair'],
  [134.09,'gnarly-reflection'], [135.72,'gnarly-end-sandwich'], [138.76,'gnarly-logo'],
];

export const GNARLY_CAMERAS: CameraView[] = ['wide', ...GNARLY_CAST,
  ...Object.keys(shots) as GnarlyView[]];

export function gnarlyState(choice: CameraView, at: number) {
  const t = Number.isFinite(at) ? Math.max(0,Math.min(at,142.224)) : 0;
  let [cut,automatic] = GNARLY_SHOTS[0];
  for (const [start,view] of GNARLY_SHOTS) {
    if (start > t) break;
    cut = start;
    automatic = view;
  }
  const manual = choice === 'gnarly-spoken' ? 'gnarly-tray' : choice === 'gnarly-verse' ? 'gnarly-limo-face'
    : choice === 'gnarly-chorus' ? 'gnarly-green-face' : choice;
  const view = choice === 'wide' ? automatic : (manual in shots ? manual as GnarlyView : automatic);
  const beat = (t - 5.13) * 135 / 60;
  return {
    ...shots[view], t, view, cut, beat, pulse: Math.sin(beat * Math.PI * 2),
    dark: view === 'gnarly-silhouettes',
    flash: view === 'gnarly-camera' || view === 'gnarly-carpet-face',
    fade: view === 'gnarly-logo' ? Math.min(1,(142.224 - t) * 1.4) : 1,
  };
}

export function gnarlyCamera(choice: CameraView, t: number, aspect: number) {
  const s = gnarlyState(choice, t);
  const angle = Math.max(.48, Math.min(1.78, aspect));
  const [x,y,z] = s.direction;
  const distance = Math.max(s.height,s.width/angle) / (Math.tan(35*Math.PI/360) * Math.hypot(x,y,z));
  const sway = s.formation === 'empty' ? 0 : Math.sin((t - s.cut) * 2) * (s.room === 'limo' ? 4 : 2);
  return {
    target:s.center,
    position:[s.center[0]+x*distance+sway,s.center[1]+y*distance,s.center[2]+z*distance] as GnarlyPoint,
    up:[Math.sin(s.roll),Math.cos(s.roll),0] as GnarlyPoint,
    fov:35,
  };
}
