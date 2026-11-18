import type {CameraView} from './scene.ts';

export const ZARA_ID='zara-moon' as const;
type Place='alley'|'lot'|'flight'|'shelter'|'surf'|'moon'|'tank'|'fence'|'title'|'black';
type Look='street'|'fairy'|'mermaid';
type Pose='walk'|'dance'|'floor'|'hover'|'swim'|'portrait'|'still';
const views={
  'zara-alley':['alley','street','walk'], 'zara-title':['title','street','still'],
  'zara-door':['alley','street','portrait'], 'zara-floor':['alley','street','floor'],
  'zara-lot':['lot','street','dance'], 'zara-lot-close':['lot','street','portrait'],
  'zara-fairy':['flight','fairy','hover'], 'zara-fairy-close':['flight','fairy','portrait'],
  'zara-shelter':['shelter','street','dance'], 'zara-surf':['surf','mermaid','swim'],
  'zara-surf-close':['surf','mermaid','portrait'], 'zara-moonlight':['moon','street','floor'],
  'zara-tank':['tank','mermaid','swim'], 'zara-glass':['tank','mermaid','portrait'],
  'zara-fence':['fence','street','still'], 'zara-black':['black','street','still'],
} as const satisfies Record<string,readonly [Place,Look,Pose]>;
export type ZaraView=keyof typeof views;
export const ZARA_CAMERAS:CameraView[]=['wide',ZARA_ID,...Object.keys(views) as ZaraView[]];
/** Camera edits on the supplied video clock, including its silent-picture tail. */
export const ZARA_SHOTS:[number,ZaraView][]=[
  [0,'zara-alley'],[16.7,'zara-title'],[18.7,'zara-alley'],[23.8,'zara-title'],
  [24.8,'zara-door'],[27,'zara-alley'],[29,'zara-door'],[31.5,'zara-floor'],
  [33,'zara-door'],[35,'zara-floor'],[43,'zara-alley'],[44,'zara-floor'],
  [48,'zara-alley'],[49,'zara-door'],[51,'zara-floor'],[56,'zara-door'],
  [58,'zara-floor'],[62,'zara-door'],[63.5,'zara-lot-close'],[67,'zara-lot'],
  [71,'zara-floor'],[74,'zara-lot'],[77.8,'zara-fairy'],[83.7,'zara-shelter'],
  [85.6,'zara-fairy-close'],[88,'zara-fairy'],[90,'zara-shelter'],[103,'zara-surf'],
  [104,'zara-surf-close'],[106,'zara-surf'],[109,'zara-surf-close'],[112,'zara-surf'],
  [117,'zara-lot'],[119,'zara-fairy-close'],[121,'zara-moonlight'],[122,'zara-floor'],
  [123,'zara-fairy'],[126,'zara-moonlight'],[129,'zara-fairy-close'],[130,'zara-surf'],
  [138,'zara-fairy'],[140,'zara-lot'],[141,'zara-surf-close'],[142,'zara-tank'],
  [144,'zara-fairy-close'],[146,'zara-glass'],[148,'zara-tank'],[149,'zara-glass'],
  [150,'zara-lot'],[153,'zara-tank'],[154,'zara-glass'],[155,'zara-tank'],
  [157,'zara-lot'],[163,'zara-glass'],[164,'zara-fairy'],[165,'zara-lot'],
  [167,'zara-tank'],[168,'zara-fairy-close'],[169,'zara-glass'],[170,'zara-lot'],
  [174,'zara-surf'],[175,'zara-shelter'],[176,'zara-glass'],[177,'zara-lot'],
  [182,'zara-fence'],[188.8,'zara-black'],
];
export function zaraState(choice:CameraView,time:number){
  const t=Number.isFinite(time)?Math.max(0,Math.min(194.003,time)):0;
  const [cut,automatic]=ZARA_SHOTS.reduce((prev,shot)=>t>=shot[0]?shot:prev,ZARA_SHOTS[0]);
  const v=choice===ZARA_ID?'zara-lot-close':Object.hasOwn(views,choice)?choice as ZaraView:automatic;
  const [place,look,pose]=views[v];return {t,cut,view:v,place,look,pose,local:t-cut};
}
