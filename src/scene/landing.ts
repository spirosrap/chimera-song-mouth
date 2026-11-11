import type {CameraView} from './scene.ts';
export type LandingSpeaker='armstrong'|'aldrin'|'capcom';
export type LandingPoint=[number,number,number];
export type LandingSet='moon'|'cabin'|'houston';
const FT=30.48;
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
const ease=(a:number,b:number,t:number)=>{const x=clamp((t-a)/(b-a));return x*x*(3-2*x);};

/**
 * The scene clock starts at 102:42:05 ground elapsed time, three seconds before "You're Go for
 * landing". `at(43,26)` is the scene time of 102:43:26.
 */
export const at=(minute:number,second:number)=>(minute-42)*60+second-5;
/** Aldrin's and Armstrong's own altitude calls (feet), at the mission times they made them. */
const ALTITUDE:[number,number][]=[[at(42,5),3700],[at(42,13),3000],[at(42,27),2000],[at(42,42),1000],[at(43,3),750],[at(43,7),700],[at(43,11),600],[at(43,17),540],[at(43,26),400],[at(43,33),350],[at(43,36),330],[at(43,46),300],[at(43,55),270],[at(44,7),250],[at(44,17),220],[at(44,24),200],[at(44,31),160],[at(44,40),120],[at(44,45),100],[at(44,55),75],[at(45,8),60],[at(45,17),40],[at(45,21),30],[at(45,28),20],[at(45,40),5],[at(45,42),0]];
/** Forward speed (feet per second): the calls from 58 down; the earlier values are estimates. */
const FORWARD:[number,number][]=[[at(42,5),230],[at(42,13),200],[at(42,27),150],[at(42,42),100],[at(43,3),75],[at(43,26),58],[at(43,46),47],[at(44,7),19],[at(44,17),13],[at(44,23),11],[at(44,34),9],[at(44,45),9],[at(44,55),6],[at(45,11),2],[at(45,25),4],[at(45,33),1.5],[at(45,40),0]];
/** The computer's 1201 and 1202 program alarms: the PROG light is lit. */
export const LANDING_ALARMS:[number,number][]=[[at(42,19),at(42,29)],[at(42,43),at(42,53)]];
export const LANDING_CONTACT=at(45,40);
export const LANDING_SHUTDOWN=at(45,43);
/** The Sun was 10.8 degrees up behind them, so the shadow runs far ahead. */
export const SUN_STRETCH=1/Math.tan(10.8*Math.PI/180);

const linear=(table:[number,number][],t:number)=>{
 if(t<=table[0][0])return table[0][1];
 for(let i=1;i<table.length;i++)if(t<=table[i][0]){const [a,va]=table[i-1],[b,vb]=table[i];return va+(vb-va)*(t-a)/(b-a);}
 return table.at(-1)![1];
};
// Distance still to fly: the forward speed integrated back from touchdown.
const RANGE:[number,number][]=(()=>{const out:[number,number][]=[[FORWARD.at(-1)![0],0]];for(let i=FORWARD.length-1;i>0;i--){const [a,va]=FORWARD[i-1],[b,vb]=FORWARD[i];out.unshift([a,out[0][1]+(va+vb)/2*(b-a)]);}return out;})();
const range=(t:number)=>{
 if(t<=RANGE[0][0])return RANGE[0][1]+(RANGE[0][0]-t)*FORWARD[0][1];
 for(let i=1;i<RANGE.length;i++)if(t<=RANGE[i][0]){const [a,ra]=RANGE[i-1],[b]=RANGE[i],va=FORWARD[i-1][1],vb=FORWARD[i][1],u=t-a,slope=(vb-va)/(b-a);return ra-(va*u+slope*u*u/2);}
 return 0;
};

/** Craters: x is the distance uprange of the landing point (the lander flies toward -x), in cm. */
export interface Crater{x:number;z:number;r:number;depth:number}
export const MOON_CRATERS:Crater[]=(()=>{
 // West crater, whose boulder field Armstrong flew past, and the small crater just short of the site.
 const out:Crater[]=[{x:45000,z:-3000,r:9000,depth:2400},{x:6500,z:1800,r:1500,depth:320}];
 let seed=1969;const next=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 while(out.length<74){
  const c={x:-52000+next()*430000,z:-56000+next()*112000,r:500+next()**3*6500,depth:0};c.depth=c.r*.2;
  if(Math.hypot(c.x,c.z)>c.r*1.6+2600&&out.every(o=>Math.hypot(o.x-c.x,o.z-c.z)>(o.r+c.r)*1.15))out.push(c);
 }
 return out;
})();
export const MOON_BOULDERS:{x:number;z:number;size:number}[]=(()=>{
 const out:{x:number;z:number;size:number}[]=[],west=MOON_CRATERS[0];
 let seed=720;const next=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 for(let i=0;i<150;i++){const a=next()*Math.PI*2,d=west.r*(.85+next()*1.9);out.push({x:west.x+Math.cos(a)*d,z:west.z+Math.sin(a)*d,size:60+next()**2*380});}
 for(let i=0;i<40;i++){const a=next()*Math.PI*2,d=1500+next()*9000;out.push({x:Math.cos(a)*d,z:Math.sin(a)*d,size:20+next()*70});}
 return out;
})();
/** Ground height (cm) above the landing point, which is level and at zero. */
export function moonHeight(x:number,z:number):number{
 let h=260*Math.sin(x/23000)*Math.cos(z/19000)+90*Math.sin(x/5200+1)*Math.sin(z/6100)*clamp(Math.hypot(x,z)/6000-.4);
 for(const c of MOON_CRATERS){const d=Math.hypot(x-c.x,z-c.z)/c.r;if(d<2.2)h+=(d<1?-c.depth*(1-d*d):0)+c.depth*.16*Math.exp(-(((d-1)/.2)**2));}
 return h;
}

/** The lander at a scene time: everything from the clock, so pausing and seeking restore it exactly. */
export function landingState(time:number){
 const t=Math.max(0,Number.isFinite(time)?time:0),forward=linear(FORWARD,t),settle=ease(LANDING_CONTACT,LANDING_CONTACT+2,t);
 const alarm=LANDING_ALARMS.some(([a,b])=>t>=a&&t<b),low=1-clamp(linear(ALTITUDE,t)/45);
 return {t,
  /** centimetres above the landing point */
  altitude:linear(ALTITUDE,t)*FT,
  position:[range(t)*FT,linear(ALTITUDE,t)*FT,-260*ease(at(45,22),at(45,31),t)] as LandingPoint,
  forward,
  /** Tilted back to brake: the faster it flies, the further (radians). */
  pitch:Math.min(.9,forward*.0078)*(1-settle),
  throttle:t<LANDING_SHUTDOWN?1:0,
  /** Dust blown out from under the engine in the last forty feet, gone seconds after shutdown. */
  dust:low*(1-ease(LANDING_SHUTDOWN,LANDING_SHUTDOWN+3,t)),
  alarm,alarmLit:alarm&&Math.floor(t*3)%2===0,
  contact:t>=LANDING_CONTACT&&t<LANDING_SHUTDOWN+1.5,
  landed:t>=at(45,42),
  /** After "The Eagle has landed" the two men turn to each other. */
  relief:ease(at(46,7),at(46,10),t),
 };
}
export const LANDING_PEOPLE:Record<LandingSpeaker,{position:LandingPoint;set:LandingSet}>={
 armstrong:{position:[-36,165,0],set:'cabin'},aldrin:{position:[36,165,0],set:'cabin'},capcom:{position:[0,118,0],set:'houston'},
};
export const landingSet=(view:CameraView):LandingSet=>view==='capcom'?'houston':view==='armstrong'||view==='aldrin'||view==='landing-crew'?'cabin':'moon';
export function landingCamera(view:CameraView,aspect:number,time:number):{position:LandingPoint;target:LandingPoint;fov:number}{
 const s=landingState(time),[x,y,z]=s.position,narrow=aspect<1;
 if(view==='capcom'||view==='armstrong'||view==='aldrin'){
  const p=LANDING_PEOPLE[view].position,side=view==='armstrong'?.3:view==='aldrin'?-.3:.24,vertical=view==='capcom'?46:42,horizontal=52;
  const distance=Math.max(vertical,horizontal/Math.max(.4,aspect))/Math.tan(36*Math.PI/360)/2,dir:LandingPoint=[side,.04,1],norm=Math.hypot(...dir);
  const target:LandingPoint=[p[0],p[1]+3,p[2]];
  return {target,position:target.map((v,i)=>v+dir[i]*distance/norm) as LandingPoint,fov:36};
 }
 // From the back of the cabin, over both men's shoulders: the windows, the panel and its lights.
 if(view==='landing-crew')return {target:[0,150,96],position:[0,205,-64],fov:narrow?84:64};
 if(view==='landing-ground'){
  // A camera standing on the surface just past the landing point, watching it come in.
  const eye:LandingPoint=[-2300,170,2100],far=Math.hypot(x-eye[0],y-eye[1],z-eye[2]);
  return {position:eye,target:[x,y+320,z],fov:Math.max(narrow?16:9,Math.min(narrow?58:42,2*Math.atan(1500/far)*180/Math.PI))};
 }
 if(view==='landing-above'){
  // Over the lander's shoulder: the ground ahead, the craters, and the shadow running out in front.
  const ahead=900+s.altitude*1.2;
  return {position:[x+900+s.altitude*.3,y+1500+s.altitude*.35,z+250],target:[x-ahead,moonHeight(x-ahead,z),z],fov:narrow?56:44};
 }
 // Alongside and a little above, closing in as it comes down.
 const d=2600+s.altitude*.34,lift=.16+.3*clamp(s.altitude/9000);
 return {position:[x+d*.42,Math.max(y+d*lift,moonHeight(x+d*.42,z+d*.82)+250),z+d*.82],target:[x-d*.1,y+300-d*.06,z],fov:narrow?48:36};
}
