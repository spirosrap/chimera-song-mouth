import { useEffect, useRef, useState } from "react";
import { VoiceModel } from "./analysis.ts";
import { useStore } from "./store.ts";
import { engine } from "../audio/AudioEngine.ts";
import {acquireModel,getModel} from "./voiceModels.ts";
export {acquireModel,getModel} from "./voiceModels.ts";
import { bodyKey, type BodyMix } from "./body.ts";

/** Acquire in the effect, so discarded React renders and StrictMode do not leak engine models. */
export function useRetainedModel(body:BodyMix,sampleRate:number):VoiceModel|null{
  const key=`${bodyKey(body)}@${sampleRate}`;
  const [lease,setLease]=useState<{key:string;model:VoiceModel}|null>(null);
  useEffect(()=>{
    const held=acquireModel({female:body.female,child:body.child},sampleRate);
    setLease({key,model:held.model});
    return held.release;
  },[key,body.female,body.child,sampleRate]);
  return lease?.key===key?lease.model:null;
}

export function useModel(): React.MutableRefObject<VoiceModel | null> {
  const body = useStore((s) => s.body);
  const started = useStore((s) => s.started);
  const ref = useRef<VoiceModel | null>(null);
  ref.current = getModel(body, started ? engine.sampleRate : 48000);
  useEffect(() => {
    ref.current = getModel(body, started ? engine.sampleRate : 48000);
  }, [body, started]);
  return ref;
}
