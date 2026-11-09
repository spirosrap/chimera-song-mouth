import type {Segment} from '../wasm/types.ts';
/** Timed transcript tokens include spaces and punctuation; the word dictionary expects a bare word. */
export function speechWord(g2p:{toPhrases:(text:string)=>{segments:Segment[]}[]},token:string):Segment[]{
  const clean=token.trim().replaceAll('’',"'").replace(/[^a-zA-Z'-]/g,'');
  return clean?g2p.toPhrases(clean).flatMap(p=>p.segments):[];
}
