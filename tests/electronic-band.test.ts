import {test,expect} from 'bun:test';
import {neonCurrentBand} from '../src/band/neonCurrent.ts';
import {BAND_SONGS,DEFAULT_BAND} from '../src/band/library.ts';
import {processVocalEffects} from '../src/band/effects.ts';

test('electronic track is an additional song and retains the existing default and songs',()=>{
 expect(BAND_SONGS.slice(0,3).map(s=>s.id)).toEqual(['house-of-the-rising-sun','all-made-of-air','neon-current']);
 expect(DEFAULT_BAND.id).toBe('house-of-the-rising-sun');
 const song=neonCurrentBand();expect(song.wordless).toBe(true);expect(song.duration).toBe(183);expect(song.parts).toHaveLength(8);
 expect(song.sections.map(s=>s.name)).toEqual(['Air intro','Rolling groove','First lift','Drop','Breakdown','Build','Final drop','Afterglow']);
 expect(song.parts.every(p=>!p.speech?.length)).toBe(true);
 expect(song.parts.filter(p=>p.melody).every(p=>['ah','ooh','oh'].includes(p.melody!.lyrics))).toBe(true);
 for(const part of song.parts)for(const n of part.melody?.notes??[]){expect(n.start).toBeGreaterThanOrEqual(0);expect(n.duration).toBeGreaterThan(0);expect(n.start+n.duration).toBeLessThan(180);}
});

const rms=(xs:Float32Array)=>Math.sqrt(xs.reduce((e,x)=>e+x*x,0)/xs.length);
test('vocal echo lands at its musical delay and has no spurious early echo',()=>{
 const rate=8000,delay=Math.round(.75*60/128*rate),x=new Float32Array(delay*3);x[0]=.3;
 processVocalEffects(x,rate,{bpm:128,lowpassHz:3500,delayBeats:.75,delayMix:.4,feedback:.25,drive:1,fadeOut:0});
 expect(Math.max(...x.slice(delay,delay+10))).toBeGreaterThan(.015);
 expect(Math.max(...x.slice(delay-100,delay-10))).toBeLessThan(.000001);
 expect(Math.max(...x.slice(2*delay,2*delay+10))).toBeLessThan(Math.max(...x.slice(delay,delay+10)));
});

test('filtering removes high-frequency energy while beat pumping ducks at each downbeat',()=>{
 const rate=8000,bright=Float32Array.from({length:8000},(_,i)=>.2*Math.sin(2*Math.PI*2500*i/rate)),dark=bright.slice();
 processVocalEffects(bright,rate,{bpm:128,lowpassHz:3500,drive:1,fadeOut:0});processVocalEffects(dark,rate,{bpm:128,lowpassHz:250,drive:1,fadeOut:0});
 expect(rms(dark)).toBeLessThan(rms(bright)*.2);
 const x=new Float32Array(16000).fill(.1);processVocalEffects(x,rate,{bpm:120,pump:.8,lowpassHz:3500,drive:1,fadeOut:0});
 const at=(t:number)=>x[Math.round((.35+t)*rate)];expect(at(.005)).toBeLessThan(at(.4)*.4);expect(at(.505)).toBeLessThan(at(.9)*.4);
});

test('vocal automation changes level across sections and finishes cleanly',()=>{
 const x=new Float32Array(16000).fill(.2),rate=8000;
 processVocalEffects(x,rate,{bpm:128,drive:1,automation:[{time:0,cutoffHz:1000,level:.1},{time:.5,cutoffHz:3000,level:1},{time:1,cutoffHz:500,level:.2}],fadeOut:.5});
 expect(x[Math.round(.85*rate)]).toBeGreaterThan(x[Math.round(.36*rate)]*3);
 expect(x.at(-1)).toBe(0);expect(Array.from(x).every(Number.isFinite)).toBe(true);expect(Math.max(...x)).toBeLessThan(1);
});
