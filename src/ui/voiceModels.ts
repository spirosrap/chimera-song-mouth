import {VoiceModel} from "./analysis.ts";
import {bodyKey,type BodyMix} from "./body.ts";
import {createModelLeases} from "./modelLeases.ts";

/**
 * Shared main-thread acoustic models, most recent last (rebuilt on body / sample-rate change).
 * A body is continuous, so only the last few are kept; an evicted one is freed in the engine too
 * (live views read the current body on each render). Long-lived recorded feeds use leases
 * instead: their models must stay valid for as long as the heads are mounted.
 */
const cache = new Map<string, VoiceModel>();
const KEEP = 8;

export function getModel(body: BodyMix, sampleRate: number): VoiceModel {
  const key = `${bodyKey(body)}@${sampleRate}`;
  let m = cache.get(key);
  if (m) cache.delete(key);
  else m = new VoiceModel(body, sampleRate);
  cache.set(key, m);
  if (cache.size > KEEP) {
    const [oldest, old] = cache.entries().next().value!;
    cache.delete(oldest);
    old.dispose();
  }
  return m;
}

const retained=createModelLeases<string,VoiceModel>(key=>{
  const [body,rate]=key.split('@'),[female,child]=body.split(',').map(Number);
  return new VoiceModel({female,child},Number(rate));
});
export function acquireModel(body:BodyMix,sampleRate:number){
  return retained.acquire(`${bodyKey(body)}@${sampleRate}`);
}
