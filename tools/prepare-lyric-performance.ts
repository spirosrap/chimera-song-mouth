/** Explicit sung phones for an already-authored score. Does not estimate pitches.
 * bun tools/prepare-lyric-performance.ts input.json output.json lead,answer
 */
import {readFileSync,writeFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import type {BandPart,VocalPerformance,Arrangement} from '../src/band/types.ts';
import type {Syllable} from '../src/wasm/types.ts';

const glides:Record<string,string[]>={'aɪ':['a','ɪ'],'aʊ':['a','ʊ'],'eɪ':['e','ɪ'],'oʊ':['o','ʊ'],'ɔɪ':['ɔ','ɪ']};
const consonantDuration=(ipa:string)=>['p','t','k','b','d','g','c','ɟ'].includes(ipa)?.045:['tʃ','dʒ','ts','dz'].includes(ipa)?.065:['s','z','ʃ','ʒ','f','v','θ','ð'].includes(ipa)?.075:.06;
const round=(n:number)=>Math.round(n*1e6)/1e6;

export function prepareSungPerformance(part:BandPart,syllables:Syllable[]):VocalPerformance{
  const melody=part.melody!;
  const units:{start:number;end:number;syl:Syllable;notes:typeof melody.notes}[]=[];
  melody.notes.forEach((n,i)=>{
    const previous=units.at(-1),start=n.start+.35,end=start+n.duration;
    if(n.hold&&previous&&start-previous.end<.06){previous.end=end;previous.notes.push(n);}
    else units.push({start,end,syl:syllables[(n.lyricIndex??i)%syllables.length],notes:[n]});
  });
  const groups:typeof units[]=[];
  for(const u of units){
    const group=groups.at(-1),last=group?.at(-1);
    if(!last||u.start-last.end>.06)groups.push([u]);else group!.push(u);
  }
  const phrases:VocalPerformance['phrases']=[],contour:VocalPerformance['contour']=[];
  for(const group of groups){
    const events:{ipa:string;start:number;end:number}[]=[];
    const previousEnd=phrases.length?phrases.at(-1)!.start+phrases.at(-1)!.phones.reduce((s,p)=>s+p.duration,0):0;
    const onsets=group.map((u,i)=>{
      const phones=u.syl.onset.map(s=>({ipa:s.ipa,d:consonantDuration(s.ipa)}));
      const cap=Math.min(.16,i?(u.start-group[i-1].start)*.25:u.start-previousEnd);
      const sum=phones.reduce((s,c)=>s+c.d,0),scale=Math.min(1,cap/(sum||1));
      return {phones:phones.map(c=>({...c,d:c.d*scale})),start:u.start-sum*scale};
    });
    group.forEach((u,i)=>{
      const end=onsets[i+1]?.start??u.end;
      const onset=onsets[i].phones;
      const coda=u.syl.coda.map(s=>({ipa:s.ipa,d:consonantDuration(s.ipa)}));
      // Onsets anticipate the note. A following onset borrows a little of this
      // vowel, instead of inserting a release/re-attack between every word.
      let start=onsets[i].start;
      if(events.length)events.at(-1)!.end=start;
      for(const c of onset){events.push({ipa:c.ipa,start,end:start+c.d});start+=c.d;}
      const room=end-start;
      const codaSum=coda.reduce((s,c)=>s+c.d,0),codaScale=Math.min(1,Math.max(.020*coda.length,room*.28)/(codaSum||1));
      const vowelEnd=end-codaSum*codaScale;
      const ipa=u.syl.nucleus.ipa;
      if(glides[ipa]){
        const glide=Math.min(.11,(vowelEnd-start)*.20);
        events.push({ipa:glides[ipa][0],start,end:vowelEnd-glide},{ipa:glides[ipa][1],start:vowelEnd-glide,end:vowelEnd});
      }else events.push({ipa,start,end:vowelEnd});
      start=vowelEnd;
      for(const c of coda){events.push({ipa:c.ipa,start,end:start+c.d*codaScale});start+=c.d*codaScale;}
    });
    // Move the previous coda as a cluster when the next onset anticipates it;
    // retain every consonant and a positive vowel rather than crossing events.
    for(let i=events.length-2;i>=0;i--)events[i].end=Math.min(events[i].end,events[i+1].start);
    for(let i=events.length-1;i>0;i--)if(events[i].end-events[i].start<.012){events[i].start=events[i].end-.012;events[i-1].end=events[i].start;}
    if(events.some(e=>e.end-e.start<.009))throw Error(`Insufficient phone time in ${part.id} at ${group[0].start}`);
    const start=round(events[0].start),phones=events.map(e=>({ipa:e.ipa,duration:round(round(e.end)-round(e.start))}));
    phrases.push({start,phones});
    const end=start+phones.reduce((s,p)=>s+p.duration,0);
    const notes=group.flatMap(u=>u.notes);let ni=0;
    for(let t=start;t<end-1e-6;t+=.05){
      while(ni+1<notes.length&&t>=notes[ni+1].start+.35-.025)ni++;
      const n=notes[ni],age=Math.max(0,t-n.start-.35);
      const depth=18*Math.max(0,Math.min(1,(age-.22)/.28))*Math.max(0,Math.min(1,(end-t)/.10));
      const cents=depth*Math.sin(2*Math.PI*5.5*age);
      contour.push({time:round(t),hz:round(440*2**((n.midi-69+cents/100)/12)),breath:.94});
    }
  }
  return {lyrics:melody.lyrics,phrases,contour};
}

if(import.meta.main){
  const [input,output,ids]=process.argv.slice(2);if(!input||!output||!ids)throw Error('Supply input, output and comma-separated part IDs.');
  const {initEngine}=await import('../tests/harness.ts');await initEngine();
  const {EnglishG2P,lyricsToSyllables}=await import('../src/wasm/engine.ts');
  new EnglishG2P().setDictionaryText(gunzipSync(readFileSync(new URL('../public/data/cmudict.txt.gz',import.meta.url))).toString());
  const {validPerformance}=await import('../src/band/performance.ts');
  const score:Arrangement=JSON.parse(readFileSync(input,'utf8'));
  for(const part of score.parts.filter(p=>ids.split(',').includes(p.id))){
    part.performance=prepareSungPerformance(part,lyricsToSyllables(part.melody!.lyrics));
    part.vibrato=0;part.assetVersion='phrasing-20261110';
    if(!validPerformance(part.performance,score.duration))throw Error(`Invalid performance: ${part.id}`);
    console.log(part.id,part.performance.phrases.length,'phrases',part.performance.phrases.reduce((s,p)=>s+p.phones.length,0),'phones');
  }
  writeFileSync(output,JSON.stringify(score));
}
