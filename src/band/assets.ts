import {unpackTelemetry} from "../show/unpackTelemetry.ts";
import {TeleTrack} from "../show/tele.ts";
import {isVoicePart,type BandPart} from "./types.ts";

/** Recorded backing is an audio channel, never a mouth or an input to the voice renderer. */
export async function loadBandAssets(id:string,parts:BandPart[],decode:(data:ArrayBuffer)=>Promise<AudioBuffer>,request:(url:string)=>Promise<Response>=fetch){
  const read=async(url:string)=>{const r=await request(url);if(!r.ok)throw new Error(`A song file could not load (${r.status}). Reload and try again.`);return r.arrayBuffer();};
  return Promise.all(parts.map(async part=>{
    const base=`/band/${id}/${part.id}`;
    const [audio,tele]=await Promise.all([read(base+".mp3"),!isVoicePart(part)?Promise.resolve(null):read(base+(part.telemetryEncoding==="gzip"?".tele.gz":".tele"))]);
    const raw=tele?await unpackTelemetry(tele):null;
    return {buffer:await decode(audio),track:raw?new TeleTrack(raw):null};
  }));
}
