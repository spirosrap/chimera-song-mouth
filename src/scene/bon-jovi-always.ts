import type {CameraView} from './scene.ts';
export type BonJoviPoint=[number,number,number];
export type BonJoviPlace='city'|'road'|'apartment'|'party'|'microphone'|'bedroom'|'loft'|'fire'|'street'|'studio';
const ease=(a:number,b:number,t:number)=>{const x=Math.max(0,Math.min(1,(t-a)/(b-a)));return x*x*(3-2*x);};
const pulse=(a:number,b:number,t:number)=>ease(a,a+1,t)*(1-ease(b-1,b,t));
/** Start times inspected in the supplied full video; includes story inserts between vocal shots. */
export const BON_JOVI_SHOTS:[number,BonJoviPlace][]=[
 [0,'city'],[18,'apartment'],[28,'city'],[34,'road'],[38,'microphone'],[43,'road'],[48,'microphone'],[53,'apartment'],[78,'microphone'],[83,'party'],[94,'apartment'],[103,'bedroom'],[117,'microphone'],[123,'bedroom'],[132,'microphone'],[144,'apartment'],[148,'microphone'],[153,'bedroom'],[169,'city'],[178,'bedroom'],[188,'microphone'],[193,'loft'],[198,'microphone'],[204,'loft'],[218,'microphone'],[223,'loft'],[259,'microphone'],[264,'loft'],[273,'microphone'],[278,'loft'],[294,'microphone'],[303,'loft'],[313,'fire'],[319,'street'],[338,'studio']
];
/** The complete supplied video's locations and gestures, all on absolute source time. */
export function bonJoviPose(time:number){
 const t=Math.max(0,Math.min(365.85,Number.isFinite(time)?time:0)),shot=BON_JOVI_SHOTS.reduce((best,[start],i)=>t>=start?i:best,0),[start,place]=BON_JOVI_SHOTS[shot],progress=ease(start,BON_JOVI_SHOTS[shot+1]?.[0]??365.85,t);
 const open=Math.min(1,pulse(38,54,t)*.7+pulse(79,85,t)*.65+pulse(85,104,t)*.65+pulse(116,154,t)*.75+pulse(199,206,t)+pulse(259,276,t));
 const reach=Math.min(1,pulse(87,96,t)+pulse(135,143,t)+pulse(201,205,t)+pulse(264,274,t));
 return {t,place,shot,progress,band:t>=188&&t<193||t>=218&&t<223,open,reach,heart:pulse(121,131,t)+pulse(151,158,t),sway:Math.sin(t*.57)*.025,wind:.6+.4*Math.sin(t*.83),road:ease(35,49,t),dance:.5+.5*Math.sin(t*3.4),embrace:Math.min(1,pulse(176,185,t)+pulse(193,200,t)),argument:Math.min(1,pulse(205,219,t)+pulse(275,296,t)),phone:pulse(295,305,t),paint:ease(338,344,t),blast:ease(313,315.5,t)*(1-ease(318.5,320,t)),emergency:.5+.5*Math.sin(t*7),fade:ease(0,3,t)*(1-ease(363.8,365.6,t)),flash:pulse(314.3,316.1,t)};
}
export function bonJoviPlace(view:CameraView,time:number):BonJoviPlace{
 const manual:Partial<Record<CameraView,BonJoviPlace>>={jon:'microphone','bonjovi-city':'city','bonjovi-road':'road','bonjovi-apartment':'apartment','bonjovi-party':'party','bonjovi-bedroom':'bedroom','bonjovi-loft':'loft','bonjovi-fire':'fire','bonjovi-street':'street','bonjovi-studio':'studio'};
 return manual[view]??bonJoviPose(time).place;
}
export function bonJoviCamera(view:CameraView,aspect:number,time:number){
 const p=bonJoviPose(time),place=bonJoviPlace(view,time),band=place==='microphone'&&p.band&&view!=='jon',close=view==='jon'||place==='microphone'&&!band,phone=place==='loft'&&p.phone>.01,storyClose=(place==='city'&&time>=28&&time<34)||(place==='apartment'&&time<28)||(place==='studio'&&time>=338);
 const target:BonJoviPoint=close?[0,165,48]:band?[0,120,-45]:phone?[80,157,45]:place==='city'?(storyClose?[90,150,65]:[0,120,-90]):place==='road'?[0,82,-65]:place==='apartment'?(storyClose?[-85,118,15]:[0,114,-15]):place==='party'?[0,135,35]:place==='bedroom'?[0,115,15]:place==='fire'?[0,125,-55]:place==='street'?[50,125,0]:place==='studio'?[45,140,0]:[0,125,0];
 const hh=close?39:band?125:phone?66:storyClose?68:place==='bedroom'?77:place==='road'?115:place==='studio'?95:place==='party'?100:125,hw=close?49:band?240:phone?100:storyClose?125:place==='city'?390:place==='road'?340:place==='apartment'?240:place==='party'?205:place==='bedroom'?150:place==='street'?330:place==='loft'?280:place==='studio'?205:285,fov=38;
 // A deliberate, gentle move within each edit; the exact same pose returns after a seek.
 const drift=view==='wide'||view==='jon'?(p.progress-.5):0,zoom=close?1-.08*p.progress:1-.035*p.progress;
 const d=Math.max(hh,hw/Math.max(.4,aspect))/Math.tan(fov*Math.PI/360)*zoom,side=close?([.08,-.23,.32,-.12][p.shot%4]):place==='road'?.30:place==='city'?.23:.17;
 const direction:BonJoviPoint=[side+drift*.035,close?.025:.09,1],length=Math.hypot(...direction);
 return {target,position:target.map((x,i)=>x+d*direction[i]/length) as BonJoviPoint,fov};
}
