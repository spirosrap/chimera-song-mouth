import type {CameraView} from './scene.ts';
export type TwoPoint = [number,number,number];
export type TwoLook = 'choir'|'pink'|'bare'|'suit'|'wire'|'cowboy'|'scout'|'blue'|'tee'|'football'|'floral'|'priest'|'polo'|'leather'|'yellow'|'clown';
export type TwoPlace = 'church'|'party'|'sauna'|'forest'|'excavator'|'dinner'|'stairs'|'anniversary'|'shore'|'dentist'|'workshop'|'shop'|'truck'|'football'|'tiles'|'street'|'restaurant'|'field'|'house'|'money'|'garden'|'bedroom'|'credits';
export const TWO_SHOTS:[number,CameraView][] = [
 [0,'two-choir'],[3.8,'two-pink-dance'],[7.65,'two-party-cards'],[8.65,'two-sauna'],[11.6,'two-prayer'],[12.8,'two-forest'],[15.25,'two-excavator'],[17.45,'two-dinner'],[19.15,'two-excavator-close'],[21.55,'two-stairs'],[23.45,'two-anniversary'],[25.45,'two-shore'],[27.25,'two-dentist'],[29.3,'two-fish'],[31.2,'two-boat'],[33.1,'two-wire'],[35.4,'two-night'],[36.65,'two-cowboy'],[40.7,'two-scouts'],[42.7,'two-scout-close'],[44.4,'two-truck'],[47,'two-wedding'],[49.2,'two-yellow-glasses'],[51.1,'two-bride'],[52.55,'two-bleachers'],[54.2,'two-football'],[56.6,'two-referee'],[58.5,'two-foul'],[60.4,'two-football-close'],[62.2,'two-grass'],[65.5,'two-grass-above'],[67.8,'two-tiles'],[70.2,'two-tin-teeth'],[72.7,'two-street'],[76.05,'two-restaurant'],[78.6,'two-priest'],[81.2,'two-cap'],[84.5,'two-band'],[86.5,'two-clones'],[88.25,'two-bread'],[90.4,'two-house'],[93.4,'two-sheep'],[95.2,'two-melon'],[97.4,'two-money'],[100.5,'two-dancers'],[103.1,'two-dance-wide'],[106.5,'two-leather'],[110.2,'two-studded-glasses'],[113.7,'two-dance-close'],[115.3,'two-lemons'],[117.4,'two-yellow-hair'],[119.5,'two-glass'],[121,'two-crown'],[123.3,'two-sauna-return'],[125.2,'two-excavator-return'],[127,'two-clown-boat'],[129,'two-flex'],[131,'two-credits']
];
const ease=(a:number,b:number,t:number)=>{const x=Math.max(0,Math.min(1,(t-a)/(b-a)));return x*x*(3-2*x);};
export function twoPose(time:number){const t=Math.max(0,Math.min(137.324,Number.isFinite(time)?time:0)),q=t*128/60*Math.PI;return {t,q,beat:Math.sin(q),sway:Math.sin(q*.5),fade:ease(0,.25,t)*(1-ease(136.4,137.32,t))};}
export function twoView(time:number):CameraView{return TWO_SHOTS.reduce((v,[at,next])=>time>=at?next:v,'two-choir' as CameraView);}
export function twoState(view:CameraView,time:number){const p=twoPose(time),solo=['two-lead','two-low','two-high','two-portrait'].includes(view),v=view==='wide'||solo?twoView(p.t):view;let place:TwoPlace='church',look:TwoLook='bare';
 if(v==='two-choir'){place='church';look='choir';}if(v==='two-pink-dance'||v==='two-crown'){place='church';look='pink';}
 if(v==='two-party-cards'){place='party';look='suit';}if(v==='two-sauna'||v==='two-sauna-return')place='sauna';if(v==='two-prayer')place='church';
 if(v==='two-forest'||v==='two-yellow-hair'){place='forest';look='yellow';}
 if(v.startsWith('two-excavator'))place='excavator';if(v==='two-dinner'){place='dinner';look='suit';}if(v==='two-stairs'){place='stairs';look='tee';}if(v==='two-anniversary'){place='anniversary';look='suit';}
 if(v==='two-shore'||v==='two-fish'||v==='two-boat')place='shore';if(v==='two-dentist')place='dentist';if(v==='two-wire'){place='workshop';look='wire';}if(v==='two-night'){place='party';look='blue';}if(v==='two-cowboy'){place='shop';look='cowboy';}
 if(v==='two-scouts'||v==='two-scout-close'){place='forest';look='scout';}if(v==='two-truck'){place='truck';look='blue';}if(['two-wedding','two-yellow-glasses','two-bride'].includes(v)){place='church';look='tee';}
 if(['two-bleachers','two-football','two-referee','two-foul','two-football-close','two-grass','two-grass-above','two-lemons'].includes(v)){place='football';look='football';}
 if(v==='two-tiles'||v==='two-tin-teeth')place='tiles';if(v==='two-street')place='street';if(v==='two-restaurant'||v==='two-priest'||v==='two-cap'){place='restaurant';look=v==='two-restaurant'?'floral':v==='two-priest'?'priest':'cowboy';}
 if(v==='two-band'||v==='two-clones'){place='field';look='pink';}if(v==='two-bread')place='shore';if(v==='two-house'){place='house';look='tee';}if(v==='two-sheep')place='field';if(v==='two-melon'){place='garden';look='polo';}if(v==='two-money'){place='money';look='priest';}
 if(['two-dancers','two-dance-wide','two-leather','two-studded-glasses','two-dance-close'].includes(v)){place='garden';look='leather';}if(v==='two-glass'){place='church';look='choir';}if(v==='two-clown-boat'){place='shore';look='clown';}if(v==='two-flex')place='bedroom';if(v==='two-credits'){place='credits';look='choir';}
 const scenic=!solo&&['two-party-cards','two-boat','two-bleachers','two-football','two-referee','two-foul','two-bride','two-glass','two-credits'].includes(v),seated=['sauna','dentist','restaurant','dinner','anniversary','garden'].includes(place)&&look!=='leather'||v==='two-shore',pos:TwoPoint=[0,seated?137:151,place==='church'?-50:70];
 return {...p,v,solo,place,look,scenic,seated,pos,choir:!solo&&place==='church'&&p.t<7.7,above:v==='two-grass-above'||v==='two-money',lying:v==='two-dentist'||v==='two-grass'||v==='two-grass-above',dance:look==='leather'||look==='pink',lemons:v==='two-lemons',bread:v==='two-bread',fish:v==='two-fish',milk:place==='tiles',crown:v==='two-crown',night:v==='two-night',clones:v==='two-clones'};
}
export function twoCamera(view:CameraView,aspect:number,time:number){const s=twoState(view,time);let target:TwoPoint=[0,153,-35],hh=185,hw=320,dir:TwoPoint=[.02,.035,1],up:TwoPoint=[0,1,0];
 if(s.solo||['two-excavator','two-excavator-close','two-excavator-return','two-tin-teeth','two-wire','two-football-close','two-scout-close','two-yellow-glasses','two-crown','two-yellow-hair','two-studded-glasses','two-dance-close'].includes(s.v)){target=[0,s.pos[1]+19,75];hh=s.look==='wire'?70:47;hw=s.look==='wire'?96:72;}
 if(s.place==='church'&&!s.solo){target=[0,183,-90];hh=250;hw=440;if(s.v==='two-glass'){target=[0,390,-490];hh=290;hw=310;}}
 if(s.place==='forest'&&!s.solo&&!s.v.includes('close')&&s.look!=='yellow'){target=[0,165,-40];hh=205;hw=380;}
 if(s.v==='two-forest'){target=[0,220,-50];hh=310;hw=600;}
 if(s.place==='sauna'&&!s.solo){target=[0,135,-50];hh=185;hw=330;}if(s.place==='dinner'&&!s.solo){target=[0,150,0];hh=170;hw=315;}
 if(s.place==='stairs'&&!s.solo){target=[0,205,-140];hh=270;hw=360;}if(s.place==='anniversary'&&!s.solo){target=[0,155,-15];hh=175;hw=330;}
 if(s.place==='shore'&&!s.solo){target=[0,s.v==='two-bread'?205:140,-30];hh=s.v==='two-bread'?260:210;hw=355;}if(s.v==='two-boat'){target=[0,150,-360];hh=260;hw=550;}
 if(s.place==='dentist'&&!s.solo){target=[0,133,15];hh=175;hw=320;dir=[.2,.6,1];}
 if(s.place==='truck'&&!s.solo){target=[0,200,-140];hh=280;hw=500;}if(s.place==='football'&&!s.solo&&!s.v.includes('close')){target=[0,151,-50];hh=230;hw=450;}
 if(s.v==='two-grass'&&!s.solo){target=[0,65,35];hh=145;hw=245;dir=[.12,.85,1];}
 if(s.v==='two-grass-above'&&!s.solo){target=[0,93,20];hh=185;hw=300;dir=[0,1,.001];up=[0,0,-1];}
 if(s.place==='street'&&!s.solo){target=[0,185,-250];hh=300;hw=550;}if(s.place==='field'&&!s.solo){target=[0,220,-150];hh=s.clones?390:245;hw=s.clones?760:520;}
 if(s.place==='house'&&!s.solo){target=[0,170,-110];hh=250;hw=440;}if(s.place==='garden'&&!s.solo&&s.v!=='two-studded-glasses'&&s.v!=='two-dance-close'){target=[0,172,-50];hh=s.look==='polo'?190:245;hw=s.look==='polo'?330:480;}
 if(s.place==='money'&&!s.solo){target=[0,140,0];hh=150;hw=230;dir=[0,1,.001];up=[0,0,-1];}if(s.place==='credits'){target=[0,180,0];hh=220;hw=420;}
 const a=Math.max(.42,Math.min(4/3,Number.isFinite(aspect)?aspect:4/3)),fov=35,d=Math.max(hh,hw/a)/Math.tan(fov*Math.PI/360),n=Math.hypot(...dir);return {...s,target,position:target.map((x,i)=>x+d*dir[i]/n)as TwoPoint,up,fov};
}
