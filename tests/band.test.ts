import { expect,test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { initEngine,wasmModule } from './harness.ts';
import { originalBand } from '../src/band/original.ts';
import { risingSunBand } from '../src/band/risingSun.ts';
import { BAND_SONGS,DEFAULT_BAND } from '../src/band/library.ts';
import { midiBand } from '../src/band/midi.ts';
import { splitVoices } from '../src/song/midi.ts';
import { BandMixer,mixWave } from '../src/band/mixer.ts';
import { renderPart,BAND_RATE } from '../src/band/render.ts';
import { TeleTrack } from '../src/show/tele.ts';
await initEngine();
const {EnglishG2P,lyricsToSyllables,BEAT_SOUNDS}=await import('../src/wasm/engine.ts');
new EnglishG2P().setDictionaryText(gunzipSync(readFileSync(new URL('../public/data/cmudict.txt.gz',import.meta.url))).toString());
const {planPart}=await import('../src/band/planning.ts');
const {planMelody}=await import('../src/song/plan.ts');

test('long choir song preserves the first song and has distinct verses, refrains, bridge and coda',()=>{
 const a=risingSunBand();expect(a.duration).toBeGreaterThan(165);expect(a.duration).toBeLessThan(180);expect(a.parts).toHaveLength(7);
 expect(new Set(a.parts.map(p=>p.id)).size).toBe(7);
 expect(a.sections.map(s=>s.name)).toEqual(['Humming intro','Verse 1','Refrain','Wordless bridge','Verse 2','Final choir','Coda']);
 expect(BAND_SONGS.map(s=>s.id)).toContain('all-made-of-air');expect(DEFAULT_BAND.id).toBe('house-of-the-rising-sun');
 for(const part of a.parts)for(const n of part.melody?.notes??[]){expect(n.start).toBeGreaterThanOrEqual(0);expect(n.duration).toBeGreaterThan(0);expect(n.start+n.duration).toBeLessThan(a.duration-.35);}
});

test('every long-song syllable is mapped once, with held vowels retaining the same word',()=>{
 const a=risingSunBand(),part=a.parts[0],song=part.melody!,syllables=lyricsToSyllables(song.lyrics);
 expect(syllables).toHaveLength(112);
 expect(new Set(song.notes.map(n=>n.lyricIndex)).size).toBe(syllables.length);
 const planned=planMelody(song,song.lyrics,part.body,1,0,18);
 song.notes.forEach((n,i)=>{
  expect(planned.syllables[i].text).toBe(syllables[n.lyricIndex!].text);
  if(n.hold){expect(n.lyricIndex).toBe(song.notes[i-1].lyricIndex);expect(planned.syllables[i].melisma).toBe(true);}
 });
 expect(song.notes.at(-1)!.lyricIndex).toBe(111);
 expect(a.parts.every(p=>planPart(p).length<16000)).toBe(true);
});

test('original song has a verse, chorus, seven independent parts, and exact lead lyric alignment',()=>{
 const a=originalBand();expect(a.parts).toHaveLength(7);expect(a.sections.map(s=>s.name)).toEqual(['Intro','Verse','Chorus','Spoken outro']);
 const lead=a.parts[0].melody!;expect(lyricsToSyllables(lead.lyrics)).toHaveLength(lead.notes.length);
 expect(a.parts.filter(p=>p.melody?.notes.some(n=>n.start<15&&n.start+n.duration>14)).length).toBeGreaterThan(3);
 const ids=new Set(BEAT_SOUNDS.map(b=>b.id));expect(a.parts.flatMap(p=>p.beats??[]).every(b=>ids.has(b.id))).toBe(true);
 expect(a.parts.find(p=>p.id==='spoken')!.speech!.length).toBe(2);
});

test('polyphonic MIDI keeps every chord note and a separate percussion voice',()=>{
 const raw=[{midi:60,start:0,duration:1},{midi:64,start:0,duration:1},{midi:67,start:0,duration:1},{midi:62,start:1,duration:1}];
 const lanes=splitVoices(raw);expect(lanes).toHaveLength(3);expect(lanes.flat().length).toBe(4);
 const events=[0,144,60,90,0,144,64,90,0,144,67,90,0,153,36,100,0x83,0x60,128,60,0,0,128,64,0,0,128,67,0,0,255,47,0];
 const n=events.length;
 const midi=new Uint8Array([77,84,104,100,0,0,0,6,0,0,0,1,1,224,77,84,114,107,0,0,0,n,...events]);
 const a=midiBand(midi.buffer,'chord');expect(a.parts).toHaveLength(4);expect(a.parts.filter(p=>p.melody).map(p=>p.melody!.notes[0].midi).sort((a,b)=>a-b)).toEqual([60,64,67]);
 expect(a.parts.find(p=>p.beats)?.beats![0].id).toBe('B');
});

test('offline sound and mouth animation share the same timeline, including silence',()=>{
 const part={...originalBand().parts[0],melody:{name:'test',source:'test',lyrics:'ah',duration:1.4,notes:[{midi:64,start:.1,duration:.45}]}};
 const out=renderPart(wasmModule,part,1.4,planPart(part));const t=new TeleTrack(out.tele);
 expect(t.body.female).toBeCloseTo(part.body.female,5);expect(t.duration).toBeCloseTo(1.4,4);
 const rms=(start:number,end:number)=>{const s=out.samples.slice(start*BAND_RATE,end*BAND_RATE);return Math.sqrt(s.reduce((sum,x)=>sum+x*x,0)/s.length);};
 expect(rms(.02,.2)).toBeLessThan(.001);expect(rms(.6,.7)).toBeGreaterThan(.005);
 expect(t.message(t.indexAt(.65)).t.outRms).toBeGreaterThan(.005);
 expect(Array.from(out.samples).every(Number.isFinite)).toBe(true);
});

test('stereo WAV export obeys mute and solo and has a valid sample count',()=>{
 const p=originalBand().parts.slice(0,2),samples=[Float32Array.of(.2,.2),Float32Array.of(.6,.6)];
 const silent=mixWave(p,samples,24000,[true,true],[false,false]);const v=new DataView(silent.buffer);
 expect(new TextDecoder().decode(silent.slice(0,4))).toBe('RIFF');expect(v.getUint32(40,true)).toBe(8);expect(v.getInt16(44,true)).toBe(0);
 const one=mixWave(p,samples,24000,[false,false],[true,false]);const muted=mixWave(p,samples,24000,[false,true],[false,false]);expect(one).toEqual(muted);
});

function fakeContext(){
 const starts:{time:number;offset:number}[]=[];
 const param=()=>({value:0,setTargetAtTime(v:number){this.value=v;}});
 const node=()=>({connect(n:unknown){return n;},disconnect(){}});
 const ctx={currentTime:0,state:'running',baseLatency:0,outputLatency:0,onstatechange:null,resume:async()=>{},close:async()=>{},destination:{},
  createGain:()=>({...node(),gain:param()}),createStereoPanner:()=>({...node(),pan:param()}),
  createDynamicsCompressor:()=>({...node(),threshold:param(),knee:param(),ratio:param(),attack:param(),release:param()}),
  createBufferSource:()=>({...node(),buffer:null,start:(time:number,offset:number)=>starts.push({time,offset}),stop(){}})};
 return {ctx,starts};
}

test('all vocal stems start and seek together, with working mute and solo',()=>{
 const f=fakeContext(),m=new BandMixer(f.ctx as unknown as AudioContext);
 const parts=originalBand().parts.slice(0,3);m.load(parts,parts.map(()=>({duration:2} as AudioBuffer)));m.play();
 expect(f.starts).toHaveLength(3);expect(f.starts.every(s=>s.time===.04&&s.offset===0)).toBe(true);
 f.ctx.currentTime=.54;expect(m.time()).toBeCloseTo(.5,6);m.seek(1);
 expect(f.starts.slice(3).every(s=>Math.abs(s.time-.58)<1e-9&&s.offset===1)).toBe(true);
 m.setVoice(1,{solo:true});expect([0,1,2].map(i=>m.audible(i))).toEqual([false,true,false]);m.setVoice(1,{mute:true});expect(m.audible(1)).toBe(false);
 m.pause();const stopped=m.time();f.ctx.currentTime=1;expect(m.time()).toBe(stopped);m.dispose();
});
