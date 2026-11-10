import {test,expect} from 'bun:test';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {BAND_SONGS,loadBandArrangement} from '../src/band/library.ts';
import {validPerformance} from '../src/band/performance.ts';
import {risingSunBand} from '../src/band/risingSun.ts';
import {originalBand} from '../src/band/original.ts';
import {prepareSungPerformance} from '../tools/prepare-lyric-performance.ts';
import type {Arrangement,BandPart} from '../src/band/types.ts';
import {initEngine} from './harness.ts';

const ids=['house-of-the-rising-sun','all-made-of-air','night-train-quartet','synnefoula','ta-paidia-tou-peiraia','rodehihi-den-xanakano-fylaki'];
const score=(id:string):Arrangement=>JSON.parse(readFileSync(new URL(`../public/band/${id}/arrangement.json`,import.meta.url),'utf8'));
test('the six lyric songs load their prepared performances with fresh audio versions',async()=>{
  let voices=0;
  for(const id of ids){
    const song=BAND_SONGS.find(s=>s.id===id)!;expect(song.arrangementUrl).toContain('phrasing-20261110');
    const loaded=await loadBandArrangement(song,async()=>new Response(JSON.stringify(score(id))));
    for(const part of loaded.parts.filter(p=>p.performance)){
      voices++;expect(validPerformance(part.performance!,loaded.duration)).toBe(true);
      expect(part.performance!.lyrics).toBe(part.melody!.lyrics);expect(part.assetVersion).toBe('phrasing-20261110');
    }
  }
  expect(voices).toBe(11);
});
test('authored English melodies and the approved Rodehihi accent survive the phrasing pass',()=>{
  for(const [id,original] of [['house-of-the-rising-sun',risingSunBand()],['all-made-of-air',originalBand()]] as const){
    const next=score(id);
    expect(next.duration).toBe(original.duration);
    for(const p of original.parts)expect(next.parts.find(n=>n.id===p.id)!.melody).toEqual(p.melody);
  }
  const lead=score('rodehihi-den-xanakano-fylaki').parts[0];
  const phones=lead.performance!.phrases.flatMap(p=>p.phones.map(ph=>ph.ipa)).join(' ');
  expect(createHash('sha256').update(phones).digest('hex')).toBe('ae1e85679b3929d436e36aa1c50aae1b0f1c7d342565acebf767d46a6784b83f');
  expect(score('synnefoula').parts[0].whistleMelody!.notes).toHaveLength(93);
  expect(score('ta-paidia-tou-peiraia').parts.find(p=>p.kind==='hand')!.snaps!.length).toBeGreaterThan(20);
});
await initEngine();
const {EnglishG2P,lyricsToSyllables}=await import('../src/wasm/engine.ts');
new EnglishG2P().setDictionaryText(gunzipSync(readFileSync(new URL('../public/data/cmudict.txt.gz',import.meta.url))).toString());
const {planPart}=await import('../src/band/planning.ts');
test('a sustained English diphthong glides late and a held pitch change does not repeat its consonants',()=>{
  const part:BandPart={id:'lead',name:'test',role:'test',body:{female:.3,child:0},volume:1,pan:0,melody:{name:'test',source:'test',lyrics:'night',duration:3,notes:[{start:.2,duration:.5,midi:60,lyricIndex:0},{start:.7,duration:1.5,midi:64,lyricIndex:0,hold:true}]}};
  part.performance=prepareSungPerformance(part,lyricsToSyllables('night'));
  const phones=part.performance.phrases.flatMap(p=>p.phones);
  expect(phones.map(p=>p.ipa)).toEqual(['n','a','ɪ','t']);
  expect(phones[1].duration).toBeGreaterThan(1.7);expect(phones[2].duration).toBeLessThanOrEqual(.11);
  expect(part.performance.contour.find(c=>c.time>1.2)!.hz).toBeGreaterThan(320);
  expect(planPart(part).every(g=>Number.isFinite(g.t0)&&g.t1>=g.t0)).toBe(true);
});
test('all revised lyric plans contain finite ordered gestures within the full-song render limit',()=>{
  for(const id of ids)for(const part of score(id).parts.filter(p=>p.performance)){
    const gestures=planPart(part);expect(gestures.length).toBeLessThan(16000);
    expect(gestures.every(g=>Number.isFinite(g.t0)&&Number.isFinite(g.t1)&&g.t1>=g.t0)).toBe(true);
  }
});
