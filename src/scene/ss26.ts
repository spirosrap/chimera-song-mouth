import type {CameraView} from './scene.ts';

export const SS26_CAST=['ss26-charli','ss26-guest'] as const;
export type SS26Id=typeof SS26_CAST[number];
export type RunwayRoom='runway'|'vanity'|'boards'|'wings'|'control'|'void'|'black';
export type RunwayLook='leather'|'ivory'|'fur'|'grey'|'guest'|'rehearsal';
export type RunwayPoint=[number,number,number];
type Shot={
  room:RunwayRoom;
  pose:'empty'|'walk'|'portrait'|'seated'|'makeup'|'floor'|'jump'|'finale';
  look:RunwayLook;
  focus:RunwayPoint;
  angle:RunwayPoint;
  height:number;
  width:number;
  light:'cold'|'dark'|'white'|'warm'|'ending';
};
function shot(room:RunwayRoom,pose:Shot['pose'],look:RunwayLook,focus:RunwayPoint,
  angle:RunwayPoint,height:number,width:number,light:Shot['light']='cold'):Shot {
  return {room,pose,look,focus,angle,height,width,light};
}
const views={
  'ss26-arrival':shot('runway','empty','guest',[-118,84,-40],[.24,.18,1],150,218,'dark'),
  'ss26-front-row':shot('runway','seated','guest',[-117,119,44],[.46,.08,1],94,153,'dark'),
  'ss26-guest-close':shot('runway','seated','guest',[-115,133,66],[.29,.07,1],64,90,'dark'),
  'ss26-lookbook':shot('boards','empty','guest',[0,124,-12],[.68,.09,1],146,209),
  'ss26-title':shot('runway','empty','guest',[0,140,73],[.11,.055,1],119,199,'dark'),
  'ss26-wing-portrait':shot('wings','portrait','leather',[0,154,44],[.19,.04,1],76,105,'dark'),
  'ss26-origin':shot('runway','walk','leather',[0,106,-122],[.065,.055,1],150,209,'white'),
  'ss26-first-walk':shot('runway','walk','leather',[0,109,37],[.11,.07,1],144,199),
  'ss26-first-close':shot('runway','portrait','leather',[0,151,46],[-.28,.035,1],72,99,'dark'),
  'ss26-side-walk':shot('runway','walk','leather',[0,104,24],[.88,.11,1],142,205,'dark'),
  'ss26-backlight':shot('runway','portrait','leather',[0,151,-21],[.20,.045,1],68,109),
  'ss26-crossing':shot('runway','walk','leather',[0,115,-34],[-.13,.105,1],151,209,'white'),
  'ss26-white-model':shot('runway','empty','ivory',[0,120,46],[.081,.055,1],143,172,'white'),
  'ss26-shoes':shot('runway','empty','leather',[0,21,46],[.37,.055,1],41,78,'white'),
  'ss26-makeup':shot('vanity','makeup','rehearsal',[0,116,63],[.15,.046,1],66,92),
  'ss26-lipstick':shot('vanity','makeup','rehearsal',[0,123,72],[-.095,.045,1],40,57),
  'ss26-fitting':shot('vanity','portrait','rehearsal',[0,110,31],[.42,.11,1],139,220),
  'ss26-ivory':shot('runway','walk','ivory',[0,111,34],[.10,.06,1],143,200),
  'ss26-ivory-close':shot('runway','portrait','ivory',[0,149,-16],[.16,.03,1],74,102),
  'ss26-mirror':shot('vanity','portrait','leather',[6,137,38],[-.47,.09,1],107,155),
  'ss26-fur':shot('runway','walk','fur',[0,115,4],[.10,.09,1],147,210,'white'),
  'ss26-fur-close':shot('runway','portrait','fur',[0,151,48],[.28,.06,1],77,117,'dark'),
  'ss26-overhead':shot('runway','walk','fur',[0,99,-103],[.47,2.18,1],205,285),
  'ss26-grey':shot('runway','walk','grey',[0,113,25],[.22,.11,1],145,203),
  'ss26-grey-close':shot('runway','portrait','grey',[0,151,42],[-.27,.048,1],73,99),
  'ss26-floor':shot('runway','floor','grey',[0,29,64],[-.09,.165,1],71,108),
  'ss26-runway-floor':shot('runway','floor','grey',[0,68,-5],[.26,.21,1],119,190),
  'ss26-drink':shot('vanity','portrait','leather',[0,143,54],[.17,.06,1],78,106,'white'),
  'ss26-sparks':shot('vanity','empty','guest',[0,114,42],[-.38,.084,1],110,164,'warm'),
  'ss26-dance':shot('runway','portrait','leather',[0,142,-87],[-.11,.09,1],103,139,'white'),
  'ss26-encore':shot('runway','walk','fur',[0,115,29],[.44,.095,1],159,216),
  'ss26-control':shot('control','empty','guest',[0,117,-15],[.27,.15,1],125,191,'dark'),
  'ss26-edge':shot('void','jump','leather',[0,103,-63],[.51,1.41,1],166,215,'dark'),
  'ss26-fall':shot('void','jump','leather',[0,107,26],[-.21,.26,1],137,189,'dark'),
  'ss26-final-portrait':shot('void','finale','fur',[0,155,60],[.13,.04,1],45,73,'ending'),
  'ss26-dissolve':shot('void','finale','fur',[0,147,52],[-.085,.025,1],85,141,'ending'),
  'ss26-whiteout':shot('black','empty','fur',[0,0,0],[0,0,1],100,170,'ending'),
} satisfies Record<string,Shot>;
export type SS26View=keyof typeof views;

export const SS26_SHOTS:[number,SS26View][]=[
  [0,'ss26-arrival'],[2.63,'ss26-front-row'],[3.72,'ss26-guest-close'],[5.0,'ss26-lookbook'],
  [6.15,'ss26-arrival'],[8.94,'ss26-title'],[12.1,'ss26-wing-portrait'],[13.63,'ss26-origin'],
  [15.28,'ss26-first-close'],[16.62,'ss26-side-walk'],[18.05,'ss26-first-walk'],[19.5,'ss26-first-close'],
  [22.1,'ss26-side-walk'],[24.2,'ss26-front-row'],[25.32,'ss26-first-close'],[27.45,'ss26-backlight'],
  [30.18,'ss26-first-close'],[31.35,'ss26-shoes'],[32.81,'ss26-backlight'],[36.08,'ss26-crossing'],
  [37.46,'ss26-first-walk'],[39.05,'ss26-white-model'],[40.43,'ss26-backlight'],[42.09,'ss26-makeup'],
  [44.38,'ss26-lipstick'],[47.58,'ss26-fitting'],[49.18,'ss26-makeup'],[52.35,'ss26-lipstick'],
  [54.02,'ss26-fitting'],[56.15,'ss26-wing-portrait'],[57.22,'ss26-ivory'],[58.3,'ss26-ivory-close'],
  [61.2,'ss26-ivory'],[64.5,'ss26-mirror'],[68.75,'ss26-ivory'],[72.02,'ss26-fur-close'],
  [73.3,'ss26-fur'],[75.0,'ss26-overhead'],[76.85,'ss26-fur-close'],[79.05,'ss26-encore'],
  [82.51,'ss26-fur'],[84.2,'ss26-lookbook'],[85.83,'ss26-fitting'],[87.2,'ss26-grey-close'],
  [88.6,'ss26-origin'],[90.2,'ss26-makeup'],[91.7,'ss26-origin'],[93.01,'ss26-fitting'],
  [95.21,'ss26-grey'],[96.28,'ss26-front-row'],[97.8,'ss26-shoes'],[98.99,'ss26-floor'],
  [100.6,'ss26-front-row'],[102.08,'ss26-floor'],[105.12,'ss26-guest-close'],[106.72,'ss26-front-row'],
  [109.71,'ss26-runway-floor'],[111.32,'ss26-shoes'],[112.31,'ss26-front-row'],[114.01,'ss26-drink'],
  [115.48,'ss26-fitting'],[117.29,'ss26-runway-floor'],[118.67,'ss26-side-walk'],[120.1,'ss26-sparks'],
  [121.7,'ss26-fitting'],[123.21,'ss26-sparks'],[125.79,'ss26-dance'],[129.17,'ss26-encore'],
  [130.79,'ss26-wing-portrait'],[132.13,'ss26-fitting'],[133.9,'ss26-overhead'],[136.53,'ss26-mirror'],
  [138.13,'ss26-fitting'],[139.81,'ss26-front-row'],[141.27,'ss26-overhead'],[142.82,'ss26-guest-close'],
  [144.23,'ss26-encore'],[145.73,'ss26-control'],[147.08,'ss26-encore'],[149.73,'ss26-fur-close'],
  [151.79,'ss26-edge'],[153.14,'ss26-fall'],[154.6,'ss26-final-portrait'],[160.0,'ss26-dissolve'],
  [169.15,'ss26-whiteout'],
];
export const SS26_CAMERAS:CameraView[]=['wide',...SS26_CAST,...Object.keys(views) as SS26View[]];

export function ss26State(choice:CameraView,at:number) {
  const t=Number.isFinite(at)?Math.max(0,Math.min(172.8975,at)):0;
  let [cut,automatic]=SS26_SHOTS[0];
  for(const [start,view] of SS26_SHOTS){
    if(start>t)break;
    cut=start;
    automatic=view;
  }
  const requested=choice==='ss26-charli'?'ss26-first-close':choice==='ss26-guest'?'ss26-guest-close':choice;
  const view=Object.hasOwn(views,requested)?requested as SS26View:automatic;
  return {...views[view],view,cut,automatic,t,local:t-cut,beat:Math.max(0,t-10.0)*133.3/60};
}
