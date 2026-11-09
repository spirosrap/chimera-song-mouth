import {initChimera,chimeraModule} from "../wasm/chimera.ts";
import {renderPart} from "../band/render.ts";
import type {BodyMix,VoiceSource,HumanArtic,Plan} from "../wasm/types.ts";

export interface SoloRenderRequest {name:string;plan:Plan;body:BodyMix;source:VoiceSource;artic:HumanArtic;tipFree:boolean}
self.onmessage=async({data}:MessageEvent<SoloRenderRequest>)=>{
  try{
    await initChimera();
    const {plan}=data;
    const out=renderPart(chimeraModule(),{id:"solo",name:data.name,role:"Solo voice",body:data.body,volume:1,pan:0},plan.end+.5,plan.gestures,p=>self.postMessage({type:"progress",value:p}),data);
    self.postMessage({type:"done",...out},{transfer:[out.samples.buffer,out.tele]});
  }catch(e){self.postMessage({type:"error",message:e instanceof Error?e.message:String(e)});}
};
