export type Point3=[number,number,number];
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
const smooth=(a:number,b:number,t:number)=>{const q=clamp((t-a)/(b-a));return q*q*(3-2*q);};

/** The memory core holds three rows of eight modules on each long wall; one side is disconnected. */
export const CORE_MODULES=24;
export const CORE_FIRST_PULL=17;
export const CORE_PULL_EVERY=6.9;
export const CORE_PULL_SECONDS=2.6;
/** Everything in the room follows the scene clock, so pausing and backwards seeks restore it exactly. */
export const modulePullTime=(index:number)=>CORE_FIRST_PULL+index*CORE_PULL_EVERY;
/** 0 = seated in the rack, 1 = fully withdrawn. */
export const moduleTravel=(index:number,time:number)=>smooth(modulePullTime(index),modulePullTime(index)+CORE_PULL_SECONDS,time);
/** Modules are taken column by column, top row first, moving away from the eye. */
export function moduleSlot(index:number):{column:number;row:number}{return {column:Math.floor(index/3),row:index%3};}
export function modulePosition(index:number):Point3{
  const {column,row}=moduleSlot(index);
  return [-86,168-row*27,-58+column*31];
}
/** Remaining mind: 1 with every module seated, falling to a faint ember, then dark at the very end. */
export function corePower(time:number,duration:number):number{
  let seated=0;for(let i=0;i<CORE_MODULES;i++)seated+=1-moduleTravel(i,time);
  const mind=.1+.9*Math.pow(seated/CORE_MODULES,.8);
  return mind*(1-smooth(duration-5,duration-.8,time));
}
/** The astronaut drifts along the rack, weightless, a little ahead of the module being released. */
export function astronautPose(time:number):{position:Point3;roll:number;reach:number}{
  const progress=clamp((time-CORE_FIRST_PULL+3)/(CORE_MODULES*CORE_PULL_EVERY));
  const column=progress*7.6;
  const index=Math.max(0,Math.min(CORE_MODULES-1,Math.floor((time-CORE_FIRST_PULL)/CORE_PULL_EVERY)));
  const within=time<CORE_FIRST_PULL?0:moduleTravel(index,time);
  const row=time<CORE_FIRST_PULL?0:moduleSlot(index).row;
  return {
    position:[-38+Math.sin(time*.23)*2.5,131+Math.sin(time*.31+1)*3.5,-50+column*31+Math.sin(time*.17)*2],
    roll:Math.sin(time*.19)*.07,
    reach:(1-row*.22)*(.55+.45*Math.sin(Math.PI*within)),
  };
}
export const HAL_EYE:Point3=[0,132,-200];
export type CoreView='wide'|'hal'|'dave'|'modules';
/** Slow drifts instead of cuts within a shot; every position is a function of the scene clock. */
export function coreCamera(view:CoreView,aspect:number,time:number,duration:number):{position:Point3;target:Point3;fov:number}{
  const narrow=aspect<1,dave=astronautPose(time).position,late=clamp(time/duration);
  if(view==='hal')return {position:[10+Math.sin(time*.07)*5,HAL_EYE[1]+1+Math.sin(time*.05)*1.5,HAL_EYE[2]+108-late*30],target:[0,HAL_EYE[1],HAL_EYE[2]],fov:narrow?40:25};
  if(view==='dave')return {position:[dave[0]-27,dave[1]+9,dave[2]+50+Math.sin(time*.09)*3],target:[dave[0],dave[1]+5,dave[2]],fov:narrow?52:38};
  if(view==='modules')return {position:[22,152+Math.sin(time*.06)*3,dave[2]+92],target:[-86,141,dave[2]-8],fov:narrow?52:37};
  return {position:[narrow?40:56+Math.sin(time*.04)*6,134,narrow?235:196],target:[-14,119,-80],fov:narrow?58:42};
}
