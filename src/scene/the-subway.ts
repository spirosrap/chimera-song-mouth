import type {CameraView} from './scene.ts';

export const SUBWAY_CAST = ['subway-chappell','subway-pa'] as const;
export type SubwayId = typeof SUBWAY_CAST[number];
export type SubwaySet = 'day'|'night'|'station'|'train'|'train-side'|'roof'|'fountain'|'hair'|'sky'|'black';
export type SubwayPoint = [number,number,number];
export type SubwayPose = 'empty'|'chase'|'portrait'|'follow'|'pole'|'dance'|'sill'|'drag'|'bike'|'float'|'rise'|'wind'|'climb';
type Shot = {
  set:SubwaySet;
  pose:SubwayPose;
  target:SubwayPoint;
  direction:SubwayPoint;
  height:number;
  width:number;
  extras:'none'|'commuters'|'club';
};
const shot = (
  set:SubwaySet,pose:SubwayPose,target:SubwayPoint,direction:SubwayPoint,
  height:number,width:number,extras:Shot['extras']='none',
):Shot => ({set,pose,target,direction,height,width,extras});

const views = {
  'subway-grate':shot('day','empty',[0,15,57],[.19,.5,1],45,83),
  'subway-crowd':shot('day','chase',[8,103,24],[.08,.12,1],139,221,'commuters'),
  'subway-red':shot('day','portrait',[0,155,53],[.18,.055,1],67,91,'commuters'),
  'subway-green':shot('day','follow',[0,114,24],[-.19,.09,1],135,179,'commuters'),
  'subway-crossing':shot('day','chase',[0,102,-2],[.55,.2,1],154,245,'commuters'),
  'subway-platform':shot('station','chase',[0,116,-17],[-.26,.09,1],143,223,'commuters'),
  'subway-exit':shot('station','follow',[2,122,20],[.43,.12,1],131,169),
  'subway-doors':shot('train','follow',[1,133,24],[-.09,.051,1],112,144),
  'subway-car':shot('train','pole',[0,115,31],[.2,.09,1],132,175,'commuters'),
  'subway-car-close':shot('train','pole',[0,151,48],[.36,.035,1],72,94,'commuters'),
  'subway-car-dark':shot('train','pole',[0,145,41],[-.23,.10,1],92,123,'commuters'),
  'subway-hair-floor':shot('hair','empty',[0,25,44],[.13,1.21,1],87,127),
  'subway-rats':shot('hair','drag',[0,42,60],[-.39,.79,1],98,159),
  'subway-fire-escape':shot('roof','sill',[-34,166,29],[.22,.11,1],126,180),
  'subway-roof':shot('roof','sill',[0,142,37],[-.36,.18,1],132,215),
  'subway-roof-close':shot('roof','sill',[0,186,49],[-.19,.058,1],80,122),
  'subway-sign':shot('train','empty',[0,199,-128],[.27,.15,1],46,167),
  'subway-cab':shot('day','drag',[0,45,66],[-.28,.65,1],73,146),
  'subway-drag-wide':shot('day','drag',[20,93,18],[.48,.15,1],132,265),
  'subway-club':shot('train','dance',[0,110,37],[.17,.09,1],142,212,'club'),
  'subway-club-close':shot('train','dance',[0,150,54],[.15,.04,1],72,100,'club'),
  'subway-car-outside':shot('train-side','dance',[0,115,2],[.25,.082,1],138,217,'club'),
  'subway-car-window':shot('train-side','dance',[0,145,5],[-.14,.045,1],78,136,'club'),
  'subway-bike':shot('night','bike',[0,102,33],[-.22,.09,1],129,236),
  'subway-bike-close':shot('night','bike',[0,142,42],[.27,.046,1],75,122),
  'subway-arch':shot('fountain','rise',[0,112,22],[.17,.043,1],132,187),
  'subway-float':shot('fountain','float',[0,36,60],[.15,.67,1],77,153),
  'subway-water-close':shot('fountain','rise',[0,96,50],[.085,.054,1],76,105),
  'subway-gale':shot('night','wind',[0,107,23],[-.23,.115,1],142,213),
  'subway-gale-close':shot('night','wind',[0,149,50],[.2,.04,1],71,104),
  'subway-hair-tower':shot('sky','climb',[0,137,7],[.30,.025,1],210,169),
  'subway-hair-tower-close':shot('sky','climb',[0,153,40],[.55,.05,1],93,125),
  'subway-bench':shot('fountain','rise',[14,96,39],[.30,.21,1],115,159),
  'subway-last-look':shot('train','pole',[0,153,54],[-.31,.07,1],66,92,'commuters'),
  'subway-last-train':shot('train-side','empty',[0,120,9],[.21,.059,1],143,233),
  'subway-black':shot('black','empty',[0,0,0],[0,0,1],110,145),
} satisfies Record<string,Shot>;
export type SubwayView = keyof typeof views;

export const SUBWAY_SHOTS:[number,SubwayView][] = [
  [0,'subway-grate'],[6.22,'subway-crowd'],[12.28,'subway-red'],[14.458,'subway-green'],
  [17.208,'subway-red'],[24.375,'subway-green'],[27.25,'subway-crossing'],
  [30.13,'subway-platform'],[32.917,'subway-exit'],[34.46,'subway-platform'],[36.167,'subway-doors'],
  [39.792,'subway-car'],[42.82,'subway-car-close'],[46.458,'subway-car'],[48.333,'subway-doors'],
  [52.26,'subway-hair-floor'],[56.17,'subway-car-dark'],[60.38,'subway-hair-floor'],
  [63.208,'subway-fire-escape'],[66.042,'subway-roof'],[70.12,'subway-roof-close'],
  [74.542,'subway-car-close'],[76.7,'subway-car'],[79.75,'subway-car-close'],[83.958,'subway-sign'],
  [85.417,'subway-fire-escape'],[88.73,'subway-roof-close'],[92.042,'subway-cab'],
  [92.917,'subway-car-dark'],[96.542,'subway-cab'],[97.958,'subway-rats'],
  [105.93,'subway-drag-wide'],[109.583,'subway-hair-floor'],[113.625,'subway-roof'],
  [115.875,'subway-car-dark'],[117.792,'subway-car'],[119.958,'subway-car-dark'],[122.48,'subway-club-close'],
  [126.04,'subway-club'],[129.74,'subway-club-close'],[132.39,'subway-car-outside'],
  [135.33,'subway-car-window'],[138.26,'subway-car-outside'],[142.63,'subway-club'],
  [145.43,'subway-club-close'],[148.67,'subway-car-outside'],[150.78,'subway-club'],
  [152.67,'subway-club-close'],[154.36,'subway-car-window'],[156.41,'subway-club'],
  [160.26,'subway-car-outside'],[162.53,'subway-bike'],[164.46,'subway-bike-close'],
  [166.32,'subway-bike'],[172.09,'subway-arch'],[174.05,'subway-float'],
  [178.38,'subway-gale-close'],[182.17,'subway-gale'],[185.35,'subway-gale-close'],[188.36,'subway-hair-tower'],
  [190.09,'subway-hair-tower-close'],[194.22,'subway-arch'],[198.12,'subway-water-close'],
  [201.92,'subway-gale'],[204.12,'subway-club-close'],[206.28,'subway-hair-tower-close'],
  [208.05,'subway-gale'],[212.48,'subway-gale-close'],[213.583,'subway-club'],
  [218.06,'subway-club-close'],[222.29,'subway-club'],[226.34,'subway-hair-tower-close'],
  [228.31,'subway-water-close'],[232.39,'subway-arch'],[235.67,'subway-gale'],[238.083,'subway-roof'],
  [240.458,'subway-float'],[242.15,'subway-gale-close'],[246.417,'subway-car-close'],
  [248.12,'subway-car-dark'],[250.625,'subway-hair-tower'],[259.542,'subway-bench'],
  [264.38,'subway-last-look'],[270.375,'subway-black'],
];

export const SUBWAY_CAMERAS:CameraView[]=['wide',...SUBWAY_CAST,...Object.keys(views) as SubwayView[]];

export function subwayState(choice:CameraView,at:number) {
  const t=Number.isFinite(at)?Math.max(0,Math.min(271.397,at)):0;
  let [cut,automatic]=SUBWAY_SHOTS[0];
  for(const [start,view] of SUBWAY_SHOTS){
    if(start>t)break;
    cut=start;
    automatic=view;
  }
  const requested=choice==='subway-chappell'?'subway-car-close':choice==='subway-pa'?'subway-last-look':choice;
  const view=Object.hasOwn(views,requested)?requested as SubwayView:automatic;
  return {...views[view],view,automatic,t,cut,beat:Math.max(0,t-17.85)*82.5/60};
}
