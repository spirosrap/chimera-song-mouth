import { initChimera, chimeraModule } from "../wasm/chimera.ts";
import { renderPart } from "./render.ts";
import type { Arrangement } from "./types.ts";

self.onmessage=async(event:MessageEvent<Arrangement>)=>{
  try{
    await initChimera();
    const { EnglishG2P }=await import("../wasm/engine.ts");
    await new EnglishG2P().load().catch(()=>{});
    const {planPart}=await import("./planning.ts");
    const arrangement=event.data;
    for(let i=0;i<arrangement.parts.length;i++){
      const part=arrangement.parts[i];
      const out=renderPart(chimeraModule(),part,arrangement.duration,planPart(part),p=>self.postMessage({type:"progress",part:part.name,value:(i+p)/arrangement.parts.length}));
      self.postMessage({type:"part",...out}, {transfer:[out.samples.buffer,out.tele]});
    }
    self.postMessage({type:"done"});
  }catch(e){self.postMessage({type:"error",message:e instanceof Error?e.message:String(e)});}
};
