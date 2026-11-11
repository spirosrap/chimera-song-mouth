import {test,expect} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {initEngine} from './harness.ts';
await initEngine();
const {EnglishG2P,planPhrases}=await import('../src/wasm/engine.ts');
const {clearPhrases,CLEAR_SPEECH,CLEAR_SPEECH_TIGHT}=await import('../src/scene/clarity.ts');
const g2p=new EnglishG2P();g2p.setDictionaryText(gunzipSync(readFileSync(new URL('../public/data/cmudict.txt.gz',import.meta.url))).toString());
const body={female:0,child:0},text='The juice of lemons makes fine punch. And aren\'t you?';
const length=(phrases:ReturnType<typeof g2p.toPhrases>,rate=1)=>{const p=planPhrases(phrases,{body,t0:0,rate});return {end:p.end,segments:p.segments};};

test('clear speech lengthens every vowel, reduced ones most, and leaves consonants and their order alone',()=>{
 const plain=g2p.toPhrases(text),clear=clearPhrases(plain,body),a=length(plain),b=length(clear);
 expect(clear.map(p=>p.segments.map(s=>s.ipa))).toEqual(plain.map(p=>p.segments.map(s=>s.ipa)));
 expect(b.segments.map(s=>s.ipa)).toEqual(a.segments.map(s=>s.ipa));
 let reduced=0,full=0;
 for(const [i,s] of a.segments.entries()){
  const before=s.t1-s.t0,after=b.segments[i].t1-b.segments[i].t0;
  if(s.kind==='vowel'){expect(after).toBeGreaterThan(before*1.25);if(s.stress)full++;else{reduced++;expect(after).toBeGreaterThan(before*1.5);}}
  else if(s.kind==='affricate')expect(after).toBeGreaterThanOrEqual(.089);
  else expect(after).toBeCloseTo(before,3);
 }
 expect(reduced).toBeGreaterThan(3);expect(full).toBeGreaterThan(3);
 // The planner's reduced vowels are the short ones this is for.
 expect(Math.min(...a.segments.filter(s=>s.kind==='vowel'&&!s.stress).map(s=>s.t1-s.t0))).toBeLessThan(.075);
 expect(b.end).toBeGreaterThan(a.end*1.12);expect(b.end).toBeLessThan(a.end*1.45);
});

test('hand-timed sounds keep their timing, the tight setting costs less, and rate still applies',()=>{
 const plain=g2p.toPhrases(text),timed=plain.map(p=>({...p,segments:p.segments.map(s=>s.ipa==='u'?{...s,dur:.3}:s)}));
 const kept=clearPhrases(timed,body).flatMap(p=>p.segments).filter(s=>s.ipa==='u');
 expect(kept.length).toBeGreaterThan(0);expect(kept.every(s=>s.dur===.3)).toBe(true);
 const full=length(clearPhrases(plain,body,CLEAR_SPEECH)).end,tight=length(clearPhrases(plain,body,CLEAR_SPEECH_TIGHT)).end,base=length(plain).end;
 expect(tight).toBeGreaterThan(base);expect(tight).toBeLessThan(full);expect(tight).toBeLessThan(base*1.15);
 expect(length(clearPhrases(plain,body),.8).end).toBeGreaterThan(full*1.15);
 // Applying it twice changes nothing more: the first pass made every changed duration explicit.
 const once=clearPhrases(plain,body);expect(length(clearPhrases(once,body)).end).toBeCloseTo(length(once).end,6);
 expect(clearPhrases([{segments:[]}],body)).toEqual([{segments:[]}]);
});
