import type {CameraView} from './scene.ts';
export type CosmosPoint=[number,number,number];
export const COSMOS_DURATION=443.572494;
const ease=(a:number,b:number,t:number)=>{const x=Math.max(0,Math.min(1,(t-a)/(b-a)));return x*x*(3-2*x);};
const pulse=(a:number,b:number,t:number)=>ease(a,a+.6,t)*(1-ease(b-.6,b,t));
/** Demonstrations use absolute scene time, including after a backwards seek. */
export function cosmosPose(time:number){
 const t=Math.max(0,Math.min(COSMOS_DURATION,Number.isFinite(time)?time:0));
 return {t,lean:pulse(38,78,t)*.7+pulse(126,164,t)*.4+pulse(282,298,t)*.7,
  explain:.5+.5*Math.sin(t*.73),point:pulse(41,52,t)+pulse(67,78,t)+pulse(280,298,t),
  apple:pulse(87,202,t),appleContact:pulse(155,172,t),appleSlice:pulse(176,200,t),
  lift:pulse(210,264,t),cube:pulse(301,399,t),tesseract:pulse(400,442,t),reunion:pulse(255,295,t),
  squareMove:pulse(41,51,t)*Math.sin((t-41)*.5)*20,squareOutside:ease(77,80,t)*(1-ease(95,100,t)),
  cubeTurn:ease(309,338,t)*.75+t*.012,tesseractTurn:(t-400)*.025};
}
export function cosmosCamera(view:CameraView,aspect:number){
 const table=view==='flatland',close=view==='sagan',model=view==='dimension-model';
 const target:CosmosPoint=table?[-8,59,68]:model?[0,82,30]:close?[0,96,-18]:[0,69,36];
 const vertical=table?63:model?46:close?43:92,horizontal=table?104:model?60:close?67:172,fov=36;
 const distance=Math.max(vertical,horizontal/Math.max(.4,aspect))/Math.tan(fov*Math.PI/360);
 const dir:CosmosPoint=table?[0,1,.025]:model?[.2,.3,1]:close?[.38,.10,1]:[.38,.37,1],norm=Math.hypot(...dir);
 return {target,position:target.map((v,i)=>v+dir[i]*distance/norm) as CosmosPoint,fov};
}
/** Project a rotating 4D cube into three dimensions: sixteen vertices and thirty-two edges. */
export function tesseractGeometry(angle:number){
 const c=Math.cos(angle),s=Math.sin(angle);
 const vertices:CosmosPoint[]=Array.from({length:16},(_,i)=>{
  const x=i&1?1:-1,y=i&2?1:-1,z=i&4?1:-1,w=i&8?1:-1;
  const xx=x*c-w*s,ww=x*s+w*c,f=2.8/(2.8-ww);
  return [xx*f,y*f,z*f];
 });
 const edges:[number,number][]=[];for(let i=0;i<16;i++)for(const bit of [1,2,4,8])if(!(i&bit))edges.push([i,i|bit]);
 return {vertices,edges};
}
