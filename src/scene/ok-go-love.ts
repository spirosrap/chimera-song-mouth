import type {CameraView} from './scene.ts';

export const LOVE_CAST=['love-damian','love-tim','love-crew'] as const;
export type LoveId=typeof LOVE_CAST[number];
export type LovePoint=[number,number,number];
export type LovePattern='none'|'ellipse'|'triangle'|'balloons'|'split'|'tunnel'|'prism'|'crystal';
type Passage={
  focus:LovePoint;
  eye:LovePoint;
  height:number;
  width:number;
  pattern:LovePattern;
  look:'crew'|'brown'|'reflective';
  lead:boolean;
  rig:'rings'|'prism'|'giants'|'off';
};

function mark(focus:LovePoint,eye:LovePoint,height:number,width:number,pattern:LovePattern,
  look:Passage['look'],lead:boolean,rig:Passage['rig']):Passage{
  return {focus,eye,height,width,pattern,look,lead,rig};
}
const passages={
  'love-count':mark([-38,144,83],[.16,.045,1],71,113,'none','crew',false,'rings'),
  'love-wake':mark([0,105,-12],[.09,.07,1],151,239,'none','brown',false,'rings'),
  'love-hall':mark([0,111,-92],[.082,.073,1],157,246,'none','brown',true,'rings'),
  'love-walk':mark([0,127,-15],[.10,.065,1],119,171,'none','brown',true,'rings'),
  'love-discs':mark([0,147,31],[-.085,.052,1],77,127,'none','brown',true,'rings'),
  'love-ellipses':mark([0,141,52],[.08,.042,1],87,127,'ellipse','brown',true,'rings'),
  'love-infinity':mark([0,139,64],[-.031,.035,1],101,146,'ellipse','brown',false,'off'),
  'love-triangle':mark([0,138,48],[.095,.047,1],110,171,'triangle','brown',true,'prism'),
  'love-triangle-fill':mark([0,146,66],[.032,.04,1],90,125,'triangle','brown',false,'off'),
  'love-panels':mark([0,129,33],[-.12,.06,1],137,191,'split','brown',true,'prism'),
  'love-balloon-rig':mark([0,129,27],[.31,.145,1],142,191,'balloons','crew',false,'prism'),
  'love-balloons':mark([0,125,72],[.033,.06,1],116,153,'balloons','crew',false,'off'),
  'love-balloon-spill':mark([0,103,64],[.21,.92,1],136,206,'balloons','brown',false,'prism'),
  'love-swap':mark([0,137,40],[.11,.053,1],115,170,'split','brown',true,'prism'),
  'love-swap-face':mark([0,153,52],[-.18,.035,1],74,122,'split','brown',true,'rings'),
  'love-corridor':mark([0,126,-39],[.11,.09,1],156,217,'tunnel','brown',true,'rings'),
  'love-lens':mark([0,132,64],[.02,.035,1],99,136,'tunnel','brown',false,'off'),
  'love-ribbon':mark([0,139,49],[-.26,.062,1],110,163,'prism','brown',true,'prism'),
  'love-prism':mark([0,144,53],[.06,.046,1],113,159,'prism','brown',false,'off'),
  'love-vest':mark([0,145,29],[-.12,.044,1],91,138,'crystal','reflective',true,'giants'),
  'love-crystal':mark([0,126,49],[.081,.071,1],141,204,'crystal','reflective',true,'giants'),
  'love-crystal-close':mark([0,152,47],[.04,.045,1],80,119,'crystal','reflective',true,'giants'),
  'love-giants':mark([0,116,-30],[.07,.115,1],197,325,'crystal','reflective',true,'giants'),
  'love-mirrors-open':mark([0,109,-65],[.08,.16,1],210,344,'none','reflective',true,'giants'),
  'love-bow':mark([0,96,-2],[.17,.16,1],177,261,'none','reflective',true,'giants'),
  'love-celebrate':mark([0,103,44],[-.21,.11,1],148,216,'none','crew',true,'giants'),
  'love-credits':mark([0,111,38],[.086,.105,1],173,265,'none','crew',false,'giants'),
} satisfies Record<string,Passage>;
export type LoveView=keyof typeof passages;

// These are camera waypoints. The auto camera glides between them.
export const LOVE_PASSAGES:[number,LoveView][]=[
  [0,'love-count'],[8.0,'love-wake'],[16,'love-hall'],[23.2,'love-walk'],[31.7,'love-discs'],
  [41.5,'love-ellipses'],[49.5,'love-infinity'],[58.1,'love-ellipses'],[62.1,'love-infinity'],
  [66.6,'love-triangle'],[71.9,'love-triangle-fill'],[77.85,'love-triangle'],[81.1,'love-panels'],
  [86.1,'love-balloon-rig'],[90.1,'love-balloons'],[105.1,'love-balloon-spill'],
  [110.3,'love-swap'],[116.4,'love-swap-face'],[123.1,'love-swap'],[129.5,'love-corridor'],
  [136.2,'love-lens'],[144.35,'love-corridor'],[150.1,'love-ribbon'],[154.15,'love-prism'],
  [166.3,'love-ribbon'],[173.0,'love-vest'],[180.2,'love-crystal'],[187.4,'love-crystal-close'],
  [205.1,'love-giants'],[212.9,'love-crystal'],[216.25,'love-giants'],[224.5,'love-mirrors-open'],
  [232.6,'love-bow'],[239.45,'love-celebrate'],[255.3,'love-credits'],
];
export const LOVE_CAMERAS:CameraView[]=['wide',...LOVE_CAST,...Object.keys(passages) as LoveView[]];

const lerp=(a:number,b:number,x:number)=>a+(b-a)*x;
const pair=(a:LovePoint,b:LovePoint,x:number):LovePoint=>[lerp(a[0],b[0],x),lerp(a[1],b[1],x),lerp(a[2],b[2],x)];

export function loveState(choice:CameraView,at:number) {
  const t=Number.isFinite(at)?Math.min(262.3872,Math.max(0,at)):0;
  let index=0;
  for(let i=1;i<LOVE_PASSAGES.length&&LOVE_PASSAGES[i][0]<=t;i++)index=i;
  const [cut,automatic]=LOVE_PASSAGES[index];
  const actor=choice==='love-damian'?'love-discs':choice==='love-tim'?'love-count':choice==='love-crew'?'love-celebrate':choice;
  const manual=Object.hasOwn(passages,actor),view=manual?actor as LoveView:automatic;
  const s=passages[view];
  const [fromTime,fromView]=LOVE_PASSAGES[Math.max(0,index-1)];
  const prior=passages[fromView];
  const u=Math.min(1,(t-cut)/Math.min(1.45,Math.max(.4,(cut-fromTime)*.34)));
  const mix=manual||index===0?1:u*u*(3-2*u);
  return {...s,view,t,cut,mix,local:t-cut,automatic,
    focus:pair(prior.focus,s.focus,mix),eye:pair(prior.eye,s.eye,mix),
    height:lerp(prior.height,s.height,mix),width:lerp(prior.width,s.width,mix),
    pulse:t*102/60,
  };
}

export function loveCamera(choice:CameraView,t:number,aspect:number){
  const s=loveState(choice,t);
  const fit=Math.max(.50,Math.min(1.78,aspect));
  const [x,y,z]=s.eye;
  const d=Math.max(s.height,s.width/fit)/(Math.tan(Math.PI/10)*Math.hypot(x,y,z));
  return {s,position:[s.focus[0]+x*d+2*Math.sin(t*.52),s.focus[1]+y*d,s.focus[2]+z*d] as LovePoint};
}
