import type {CameraView} from './scene.ts';
export type OdysseySpeaker='lovell'|'swigert'|'haise'|'capcom'|'kranz';
export type OdysseyPoint=[number,number,number];
export type OdysseySet='space'|'cabin'|'houston';
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
const ease=(a:number,b:number,t:number)=>{const x=clamp((t-a)/(b-a));return x*x*(3-2*x);};

/**
 * The scene's fixed moments (scene seconds). tools/render-odyssey-scene.ts lays the dialogue out
 * around them and stops if a line would cross one. In the mission the bang came 101 s after
 * "Stand by" and the venting was seen ten minutes after the first reports; the scene shortens both.
 */
export const ODYSSEY_STIR=24;
export const ODYSSEY_BANG=30;
/** The cut to ten minutes later (056:08:57 ground elapsed time). */
export const ODYSSEY_LATER=145;
/** Service module bay 4, whose panel blew off: the angle around the stack's long axis. */
export const ODYSSEY_BAY=.62;
/** The stack turns slowly on its long axis (the "barbecue" roll that evens out the Sun's heat). */
const ROLL=.05;

/** Everything is a function of the scene clock, so pausing and seeking restore it exactly. */
export function odysseyState(time:number){
 const t=Math.max(0,Number.isFinite(time)?time:0),after=t-ODYSSEY_BANG,later=t>=ODYSSEY_LATER,shake=after>0?Math.exp(-after/14):0;
 return {t,after,later,
  roll:t*ROLL,
  /** The jolt: the stack rocks and settles. */
  pitch:.13*shake*Math.sin(after*1.9),yaw:.09*shake*Math.sin(after*1.3+1),
  flash:after>=0?Math.max(0,1-after/.45):0,
  /** Gas streaming from the bay: hard at first, then a steady leak. */
  vent:after<=0?0:.42+.58*Math.exp(-after/22),
  /** The cloud around the spacecraft, which the crew saw from the hatch window. */
  cloud:after<=0?0:later?1:clamp(after/110)*.75,
  alarm:after>=0&&after<8,alarmLit:after>=0&&after<8&&Math.floor(t*4)%2===0,
  mainB:after>=0,mainA:later||after>98,
  /** Oxygen tank 2's gauge: steady, then swinging between 20 and 60 %, then off the top, then empty. */
  tank2:after<0?.82:after<34?.4+.2*Math.sin(after*5.3):later?0:1,
  /** Tank 1, the good one, begins to fall as well. */
  tank1:later?Math.max(.3,.62-.004*(t-ODYSSEY_LATER)):after>0?.8:.82,
  stirred:t>=ODYSSEY_STIR&&after<0,
  /** The crew are weightless: a slow drift, jolted at the bang. */
  drift:Math.sin(t*.6)*1.4+6*shake*Math.sin(after*9),
  /** Houston leans in once the crew report venting. */
  lean:ease(ODYSSEY_LATER+14,ODYSSEY_LATER+17,t),
 };
}
/** Where the blown panel is, in the space set's frame: it leaves along the bay's direction, tumbling. */
export function odysseyPanel(time:number):{position:OdysseyPoint;spin:number;gone:boolean}{
 const after=time-ODYSSEY_BANG,a=ODYSSEY_BAY+ODYSSEY_BANG*ROLL,travel=Math.max(0,after)*85;
 return {position:[175+travel*.25,(205+travel)*Math.cos(a),(205+travel)*Math.sin(a)],spin:Math.max(0,after)*1.7,gone:after>0};
}
export const ODYSSEY_PEOPLE:Record<OdysseySpeaker,{position:OdysseyPoint;set:OdysseySet}>={
 swigert:{position:[-58,120,0],set:'cabin'},lovell:{position:[0,126,0],set:'cabin'},haise:{position:[58,120,0],set:'cabin'},
 capcom:{position:[0,118,0],set:'houston'},kranz:{position:[176,158,-96],set:'houston'},
};
export const odysseySet=(view:CameraView):OdysseySet=>view==='capcom'||view==='kranz'?'houston':view==='lovell'||view==='swigert'||view==='haise'||view==='odyssey-crew'?'cabin':'space';
export function odysseyCamera(view:CameraView,aspect:number,time:number):{position:OdysseyPoint;target:OdysseyPoint;fov:number}{
 const s=odysseyState(time),narrow=aspect<1;
 if(view==='capcom'||view==='kranz'||view==='lovell'||view==='swigert'||view==='haise'){
  const p=ODYSSEY_PEOPLE[view].position,side=view==='swigert'?.34:view==='haise'?-.34:view==='kranz'?-.3:.22,vertical=view==='kranz'||view==='capcom'?46:42;
  const distance=Math.max(vertical,52/Math.max(.4,aspect))/Math.tan(36*Math.PI/360)/2,dir:OdysseyPoint=[side,.04,1],norm=Math.hypot(...dir);
  const target:OdysseyPoint=[p[0],p[1]+3+(ODYSSEY_PEOPLE[view].set==='cabin'?s.drift*.5:0),p[2]];
  return {target,position:target.map((v,i)=>v+dir[i]*distance/norm) as OdysseyPoint,fov:36};
 }
 // From behind the three couches: the panel, its warning lights, the gauges and the hatch window.
 if(view==='odyssey-crew')return {target:[0,124,92],position:[0,202,-80],fov:narrow?88:66};
 // Close on the service module's open bay.
 if(view==='odyssey-vent')return {target:[200,90,120],position:[620+Math.sin(time*.05)*40,520,1050],fov:narrow?52:34};
 // The whole stack, with the camera drifting slowly round it.
 const a=.75+time*.004,r=narrow?4300:2900;
 return {target:[60,0,0],position:[60+Math.cos(a)*r*.55,r*.24,Math.sin(a)*r],fov:narrow?48:36};
}
