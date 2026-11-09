import type {Arrangement} from "./types.ts";

/** Notes, word overlays and captions share the render's 350 ms breath lead-in. */
export function featuredVoice(song:Arrangement,time:number):string{
  const selected=song.spotlights?.filter(s=>s.time+.35<=time).at(-1)?.partId;
  return song.parts.find(p=>p.id===selected)?.id??song.parts.find(p=>p.id==="lead")?.id??song.parts[0]?.id??"";
}
export function songCaption(song:Arrangement,time:number):string{
  return song.captions?.find(c=>time>=c.time+.35&&time<c.end+.35)?.text??"";
}
