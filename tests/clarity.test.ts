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

test('the planner speaks vowels at clear-speech length, and the helper leaves them alone',()=>{
 const plain=g2p.toPhrases(text),clear=clearPhrases(plain,body),a=length(plain),b=length(clear);
 // No reduced vowel is left at the 55-70 ms of fluent speech that swallowed the words around it.
 const reduced=a.segments.filter(s=>s.kind==='vowel'&&!s.stress),full=a.segments.filter(s=>s.kind==='vowel'&&s.stress);
 expect(reduced.length).toBeGreaterThan(3);expect(full.length).toBeGreaterThan(3);
 expect(Math.min(...reduced.map(s=>s.t1-s.t0))).toBeGreaterThan(.09);expect(Math.min(...full.map(s=>s.t1-s.t0))).toBeGreaterThan(.08);
 expect(clear.map(p=>p.segments.map(s=>s.ipa))).toEqual(plain.map(p=>p.segments.map(s=>s.ipa)));
 for(const [i,s] of a.segments.entries()){
  const before=s.t1-s.t0,after=b.segments[i].t1-b.segments[i].t0;
  if(s.kind==='affricate')expect(after).toBeGreaterThanOrEqual(.089);else expect(after).toBeCloseTo(before,6);
 }
 expect(clear.flatMap(p=>p.segments).filter(s=>s.dur!==undefined).length).toBe(a.segments.filter(s=>s.kind==='affricate'&&s.t1-s.t0<.09).length);
});

test('hand-timed sounds keep their timing, the tight setting gives time back, and rate still applies',()=>{
 const plain=g2p.toPhrases(text),timed=plain.map(p=>({...p,segments:p.segments.map(s=>s.ipa==='u'?{...s,dur:.3}:s)}));
 const kept=clearPhrases(timed,body).flatMap(p=>p.segments).filter(s=>s.ipa==='u');
 expect(kept.length).toBeGreaterThan(0);expect(kept.every(s=>s.dur===.3)).toBe(true);
 const full=length(clearPhrases(plain,body,CLEAR_SPEECH)).end,tight=length(clearPhrases(plain,body,CLEAR_SPEECH_TIGHT)).end;
 expect(tight).toBeLessThan(full*.95);expect(tight).toBeGreaterThan(full*.75);
 expect(length(clearPhrases(plain,body),.8).end).toBeGreaterThan(full*1.15);
 // Applying it twice changes nothing more: the first pass made every changed duration explicit.
 const once=clearPhrases(plain,body,CLEAR_SPEECH_TIGHT);expect(length(clearPhrases(once,body,CLEAR_SPEECH_TIGHT)).end).toBeCloseTo(length(once).end,6);
 expect(clearPhrases([{segments:[]}],body)).toEqual([{segments:[]}]);
});
