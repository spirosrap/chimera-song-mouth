import type {CameraView} from './scene.ts';

export const HOUSE_TOUR_CAST = ['tour-sabrina', 'tour-margaret', 'tour-madelyn'] as const;
export type TourId = typeof HOUSE_TOUR_CAST[number];
export type TourPoint = [number,number,number];
export type TourRoom = 'drive'|'passage'|'lounge'|'kitchen'|'stairs'|'bath'|'billiards'|
  'bedroom'|'wardrobe'|'pool'|'lookout'|'garage'|'monitor'|'ending'|'card';
export type TourPose = 'empty'|'solo'|'pair'|'trio'|'walk'|'dance'|'seat'|'recline';
type Shot = {
  room:TourRoom; focus:TourPoint; height:number; width:number; angle:TourPoint;
  pose:TourPose; lead:number; roll:number;
};
const shot = (room:TourRoom, focus:TourPoint, height:number, width:number, angle:TourPoint,
  pose:TourPose, lead=0, roll=0):Shot => ({room,focus,height,width,angle,pose,lead,roll});

const views = {
  'tour-van': shot('drive',[0,96,-22],118,225,[.48,.16,1],'empty'),
  'tour-heels': shot('drive',[73,32,83],50,92,[.13,.125,1],'empty',0,.08),
  'tour-approach': shot('drive',[10,105,-37],183,280,[.53,.60,1],'walk'),
  'tour-passage': shot('passage',[0,116,-55],145,213,[.06,.07,1],'walk'),
  'tour-door': shot('passage',[0,142,-43],119,159,[-.16,.06,1],'trio'),
  'tour-friends': shot('passage',[0,146,39],84,129,[.135,.045,1],'pair',1),
  'tour-beret': shot('passage',[0,153,55],70,107,[.24,.06,1],'solo'),
  'tour-living-room': shot('lounge',[0,131,-36],153,249,[.28,.15,1],'walk'),
  'tour-empty-lounge': shot('lounge',[0,131,-43],152,243,[.12,.1,1],'empty'),
  'tour-sunken-sofa': shot('lounge',[0,133,-13],151,240,[-.21,.095,1],'trio'),
  'tour-sofa-chat': shot('lounge',[0,115,44],107,143,[.22,.09,1],'seat',1),
  'tour-painting': shot('passage',[-26,152,-12],99,141,[.41,.07,1],'pair'),
  'tour-painting-pose': shot('kitchen',[0,154,46],68,104,[.07,.03,1],'solo',2),
  'tour-margaret-face': shot('lounge',[0,151,61],68,99,[.29,.065,1],'solo',1),
  'tour-fridge': shot('kitchen',[0,137,-22],120,193,[-.22,.125,1],'solo'),
  'tour-kitchen-face': shot('kitchen',[0,151,58],67,106,[-.18,.055,1],'solo'),
  'tour-snack': shot('kitchen',[-42,98,51],47,83,[.24,.61,1],'empty'),
  'tour-red-stairs': shot('stairs',[0,115,-64],151,225,[.14,.15,1],'walk'),
  'tour-stair-slide': shot('stairs',[0,113,-85],160,232,[-.18,.16,1],'trio',0,-.09),
  'tour-mirror': shot('stairs',[-46,140,20],97,132,[.34,.11,1],'solo',2,-.04),
  'tour-champagne': shot('lounge',[0,146,54],82,116,[.27,.10,1],'solo',1),
  'tour-lounge-dance': shot('lounge',[0,132,-9],155,227,[-.19,.10,1],'dance'),
  'tour-rug': shot('lounge',[0,111,42],144,206,[.28,1.5,1],'dance',2,-.13),
  'tour-jacket': shot('lounge',[0,149,51],77,107,[-.24,.07,1],'solo',0,.08),
  'tour-gold-floor': shot('lounge',[0,128,-11],151,227,[.09,.095,1],'dance'),
  'tour-bath': shot('bath',[0,117,34],82,129,[.21,.20,1],'recline'),
  'tour-book': shot('bath',[0,127,41],91,153,[.145,.14,1],'pair'),
  'tour-bubbles': shot('bath',[0,126,53],72,102,[-.14,.18,1],'recline'),
  'tour-billiards': shot('billiards',[0,137,17],123,202,[-.11,.10,1],'pair',1),
  'tour-billiards-low': shot('billiards',[0,139,38],119,193,[.265,.025,1],'pair',1,.08),
  'tour-puppy': shot('lounge',[43,39,88],53,91,[.17,.34,1],'empty'),
  'tour-candles': shot('lounge',[0,151,41],79,126,[.115,.045,1],'pair',1),
  'tour-dark': shot('lounge',[0,147,47],82,122,[-.19,.045,1],'solo',1),
  'tour-disco': shot('lounge',[0,142,-2],148,221,[.19,.11,1],'dance',0,-.07),
  'tour-stereo': shot('bedroom',[-73,100,46],58,97,[.23,.28,1],'empty'),
  'tour-bedroom': shot('bedroom',[0,122,0],138,210,[.25,.16,1],'seat'),
  'tour-bed-face': shot('bedroom',[0,130,61],76,110,[-.13,.11,1],'solo'),
  'tour-pink-bed': shot('bedroom',[0,106,26],121,158,[.32,1.8,1],'recline',0,.21),
  'tour-wardrobe': shot('wardrobe',[0,143,1],141,214,[.13,.09,1],'trio'),
  'tour-racks': shot('wardrobe',[0,142,12],138,209,[-.18,.085,1],'dance'),
  'tour-jewelry': shot('wardrobe',[0,153,57],70,103,[.23,.11,1],'solo',1),
  'tour-bag': shot('wardrobe',[85,98,60],60,87,[.08,.43,1],'empty'),
  'tour-drawer': shot('bedroom',[62,97,55],66,107,[.27,.46,1],'empty'),
  'tour-security': shot('monitor',[0,134,5],114,166,[.12,.075,1],'trio'),
  'tour-pool': shot('pool',[0,100,-12],128,210,[-.145,.18,1],'trio'),
  'tour-splash': shot('pool',[0,58,50],76,127,[.195,.29,1],'empty',0,-.08),
  'tour-pool-face': shot('pool',[0,104,61],67,107,[.115,.07,1],'solo'),
  'tour-costumes': shot('wardrobe',[0,135,25],132,213,[.24,.08,1],'dance',0,.08),
  'tour-mirror-trio': shot('wardrobe',[0,146,36],109,172,[.07,.10,1],'trio'),
  'tour-bedroom-window': shot('lookout',[0,142,-16],153,236,[.18,.16,1],'dance'),
  'tour-table-dance': shot('lookout',[0,134,42],130,216,[.12,.08,1],'dance'),
  'tour-desk-phone': shot('bedroom',[0,129,62],79,118,[.285,.08,1],'seat',2,.09),
  'tour-sweets': shot('kitchen',[0,150,56],67,104,[.12,.048,1],'solo',2),
  'tour-sweets-lead': shot('kitchen',[0,150,58],67,104,[-.16,.048,1],'solo'),
  'tour-palms': shot('lookout',[0,155,-88],156,227,[.22,.21,1],'empty'),
  'tour-spotlight': shot('passage',[0,148,42],86,121,[.135,.03,1],'solo'),
  'tour-sconces': shot('stairs',[0,142,-14],143,220,[-.23,.14,1],'trio'),
  'tour-garage': shot('garage',[0,122,-12],153,231,[.335,.13,1],'pair',2),
  'tour-sports-car': shot('garage',[0,111,15],122,210,[-.34,.09,1],'solo',2),
  'tour-living-window': shot('lookout',[0,137,-52],151,267,[.17,.115,1],'dance'),
  'tour-retreat': shot('drive',[0,126,12],153,243,[.23,.12,1],'walk'),
  'tour-van-door': shot('drive',[32,129,37],120,176,[.24,.075,1],'pair',1),
  'tour-van-interior': shot('ending',[0,129,30],117,178,[.10,.08,1],'trio'),
  'tour-van-portrait': shot('ending',[0,144,65],75,113,[-.17,.055,1],'solo'),
  'tour-van-pair': shot('ending',[0,139,42],96,149,[.18,.065,1],'pair'),
  'tour-note': shot('card',[0,47,53],62,106,[.24,1.51,1],'empty',0,-.18),
  'tour-night-road': shot('drive',[0,93,-70],169,241,[.27,.69,1],'empty'),
  'tour-fade': shot('drive',[0,102,-22],161,247,[.47,.16,1],'empty'),
} satisfies Record<string,Shot>;

export type TourView=keyof typeof views;
export const HOUSE_TOUR_SHOTS:[number,TourView][]=[
  [0,'tour-van'],[2.88,'tour-heels'],[5.86,'tour-heels'],[9.40,'tour-heels'],
  [13.56,'tour-approach'],[17.80,'tour-approach'],[20.44,'tour-passage'],[23.98,'tour-door'],
  [26.78,'tour-friends'],[27.80,'tour-beret'],[30.95,'tour-living-room'],[34.94,'tour-sunken-sofa'],
  [36.83,'tour-sunken-sofa'],[40.12,'tour-margaret-face'],[42.04,'tour-mirror'],[43.29,'tour-painting-pose'],
  [44.0,'tour-fridge'],[46.05,'tour-kitchen-face'],[47.09,'tour-red-stairs'],[48.12,'tour-snack'],
  [51.30,'tour-fridge'],[53.39,'tour-snack'],[54.55,'tour-champagne'],[56.01,'tour-painting'],
  [56.77,'tour-red-stairs'],[58.22,'tour-margaret-face'],[59.28,'tour-sofa-chat'],[60.77,'tour-jacket'],
  [62.30,'tour-sofa-chat'],[63.32,'tour-lounge-dance'],[65.13,'tour-rug'],[67.65,'tour-margaret-face'],
  [68.07,'tour-gold-floor'],[70.20,'tour-lounge-dance'],[71.36,'tour-painting'],[73.11,'tour-door'],
  [74.78,'tour-painting'],[75.92,'tour-stair-slide'],[77.95,'tour-bubbles'],[80.58,'tour-billiards'],
  [82.25,'tour-bath'],[83.86,'tour-book'],[84.42,'tour-puppy'],[85.21,'tour-living-room'],
  [86.25,'tour-dark'],[88.30,'tour-gold-floor'],[90.76,'tour-candles'],[92.59,'tour-disco'],
  [94.26,'tour-stereo'],[95.33,'tour-disco'],[96.51,'tour-bedroom'],[98.47,'tour-bed-face'],
  [99.43,'tour-painting-pose'],[100.52,'tour-pink-bed'],[102.44,'tour-wardrobe'],[102.89,'tour-mirror-trio'],
  [103.98,'tour-racks'],[105.36,'tour-jewelry'],[106.19,'tour-racks'],[106.98,'tour-jewelry'],
  [107.36,'tour-bag'],[108.27,'tour-pink-bed'],[110.15,'tour-drawer'],[111.69,'tour-security'],
  [112.40,'tour-splash'],[114.11,'tour-racks'],[115.70,'tour-pool-face'],[117.28,'tour-costumes'],
  [118.66,'tour-mirror-trio'],[119.70,'tour-splash'],[120.25,'tour-pool'],[120.91,'tour-costumes'],
  [122.00,'tour-jewelry'],[123.0,'tour-mirror-trio'],[125.12,'tour-billiards-low'],
  [126.38,'tour-living-window'],[128.96,'tour-racks'],[130.32,'tour-sweets-lead'],[131.21,'tour-sweets'],
  [132.47,'tour-margaret-face'],[134.80,'tour-bed-face'],[136.39,'tour-racks'],[136.80,'tour-jewelry'],
  [137.70,'tour-bedroom-window'],[139.01,'tour-mirror-trio'],[140.01,'tour-table-dance'],
  [142.85,'tour-desk-phone'],[144.23,'tour-bedroom-window'],[145.54,'tour-spotlight'],
  [146.78,'tour-margaret-face'],[148.32,'tour-bedroom-window'],[149.54,'tour-bed-face'],
  [150.86,'tour-palms'],[152.05,'tour-table-dance'],[153.04,'tour-spotlight'],
  [156.25,'tour-sconces'],[158.91,'tour-red-stairs'],[160.61,'tour-garage'],
  [162.75,'tour-sports-car'],[166.18,'tour-security'],[167.49,'tour-living-window'],
  [170.85,'tour-living-window'],[175.72,'tour-retreat'],[176.56,'tour-van-door'],
  [177.76,'tour-empty-lounge'],[180.85,'tour-van-door'],[184.06,'tour-van-portrait'],
  [187.69,'tour-van'],[189.48,'tour-approach'],[192.07,'tour-van-interior'],
  [194.61,'tour-night-road'],[196.39,'tour-van-pair'],[202.29,'tour-fade'],[204.29,'tour-note'],
];
export const HOUSE_TOUR_CAMERAS:CameraView[]=['wide',...HOUSE_TOUR_CAST,...Object.keys(views) as TourView[]];

export function houseTourState(choice:CameraView, at:number) {
  const t=Number.isFinite(at)?Math.min(214.88,Math.max(0,at)):0;
  let [cut,automatic]=HOUSE_TOUR_SHOTS[0];
  for(const [start,view] of HOUSE_TOUR_SHOTS){
    if(start>t)break;
    cut=start;
    automatic=view;
  }
  const manual=choice==='tour-sabrina'?'tour-kitchen-face':choice==='tour-margaret'?'tour-margaret-face'
    :choice==='tour-madelyn'?'tour-painting-pose':choice;
  const view=manual in views?manual as TourView:automatic;
  const beat=(t-23.79)*115/60;
  return {
    ...views[view],t,cut,automatic,view,beat,
    dark:view==='tour-dark'||view==='tour-candles',
    disco:view==='tour-disco'||view==='tour-gold-floor',
    fade:view==='tour-note'?Math.min(1,(214.88-t)*2):1,
  };
}

export function houseTourCamera(choice:CameraView, at:number, aspect:number) {
  const s=houseTourState(choice,at);
  const fit=Math.max(.48,Math.min(1.78,aspect));
  const [x,y,z]=s.angle;
  const distance=Math.max(s.height,s.width/fit)/(Math.tan(35*Math.PI/360)*Math.hypot(x,y,z));
  const drift=s.pose==='empty'?0:Math.sin(s.t*1.69)*2.4;
  return {
    target:s.focus,
    position:[s.focus[0]+x*distance+drift,s.focus[1]+y*distance,s.focus[2]+z*distance] as TourPoint,
    up:[Math.sin(s.roll),Math.cos(s.roll),0] as TourPoint,
  };
}
