import { extractMelody } from "./pitch.ts";

self.onmessage=(event:MessageEvent<Float32Array>)=>{
  try{
    const notes=extractMelody(event.data,p=>self.postMessage({type:"progress",value:p}));
    self.postMessage({type:"done",notes});
  }catch(error){self.postMessage({type:"error",message:error instanceof Error?error.message:String(error)});}
};
