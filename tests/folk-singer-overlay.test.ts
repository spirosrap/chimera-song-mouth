import {test,expect} from 'bun:test';
import {readFileSync} from 'node:fs';
import {initEngine} from './harness.ts';
import type {Arrangement} from '../src/band/types.ts';
import type {OverlayFn} from '../src/ui/components/AnatomyView.tsx';
await initEngine();
const {singerCues,singerOverlay}=await import('../src/ui/render/folkSingerOverlay.ts');
const song:Arrangement=JSON.parse(readFileSync(new URL('../public/band/synnefoula/arrangement.json',import.meta.url),'utf8'));
const part=song.parts[0],notes=part.melody!.notes;

test('Greek words appear from the first syllable through the last, on the audio clock',()=>{
  const cue=singerCues(part),at=(i:number)=>notes[i].start+.35+notes[i].duration/2;
  expect(cue.word(at(0))?.text).toBe('είχα');expect(cue.word(at(1))).toEqual(cue.word(at(0)));
  expect(cue.word(at(2))?.text).toBe('μια');expect(cue.word(at(3))?.text).toBe('αγάπη');
  for(const n of notes)expect(cue.word(n.start+.35+n.duration/2)?.text.length).toBeGreaterThan(0);
  expect(cue.word(0)).toBeNull();expect(cue.word(notes[0].start)).toBeNull();expect(cue.word(song.duration)).toBeNull();
});

test('the playful whistle marker follows all original whistle notes and stays out of vocal passages',()=>{
  const cue=singerCues(part);
  for(const n of part.whistleMelody!.notes){
    const t=n.start+.35+n.duration/2;expect(cue.whistling(t)).toBe(true);expect(cue.word(t)).toBeNull();
  }
  for(const n of notes)expect(cue.whistling(n.start+.35+n.duration/2)).toBe(false);
  expect(cue.whistling(0)).toBe(false);expect(cue.whistling(song.duration)).toBe(false);
});

test('mouth overlay draws Greek words, clears old words on seek, and draws notes only for whistles',()=>{
  const previous=Object.getOwnPropertyDescriptor(globalThis,'Path2D');
  Object.defineProperty(globalThis,'Path2D',{configurable:true,value:class {moveTo(){}lineTo(){}}});
  const text:string[]=[],positions:number[]=[];let musicalNotes=0;
  const ctx={save(){},restore(){},beginPath(){},moveTo(){},lineTo(){},stroke(){},fill(){},setLineDash(){},quadraticCurveTo(){},translate(){},scale(){},rotate(){},ellipse(){musicalNotes++;},measureText:(s:string)=>({width:s.length*15}),fillText:(s:string,x:number,y:number)=>{text.push(s);positions.push(x,y);}} as unknown as CanvasRenderingContext2D;
  const view={handles:()=>[{id:'lips',label:'Lips',pos:{x:0,y:0}}],X:()=>140,Y:()=>130,pxPerCm:3} as Parameters<OverlayFn>[1];
  const args=[ctx,view,{} as Parameters<OverlayFn>[2],{} as Parameters<OverlayFn>[3],{} as Parameters<OverlayFn>[4],{w:350,h:430,dt:0}] as const;
  const draw=singerOverlay(part);
  try{
    draw(...args,{time:notes[0].start+.4,epoch:0,audible:true});expect(text).toEqual(['ΕΊΧΑ']);expect(positions.every(Number.isFinite)).toBe(true);
    text.length=0;draw(...args,{time:8,epoch:1,audible:true});expect(text).toEqual([]);expect(musicalNotes).toBe(3);
    musicalNotes=0;draw(...args,{time:8,epoch:1,audible:false});expect(musicalNotes).toBe(0);
    draw(...args,{time:0,epoch:2,audible:true});expect(text).toEqual([]);expect(musicalNotes).toBe(0);
  }finally{if(previous)Object.defineProperty(globalThis,'Path2D',previous);else Reflect.deleteProperty(globalThis,'Path2D');}
});

