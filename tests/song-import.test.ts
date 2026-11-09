import { describe, expect, test } from "bun:test";
import { readMidi } from "../src/song/midi.ts";
import { monophonic, SONGS, type Melody } from "../src/song/melody.ts";
import { pitchOf, extractMelody } from "../src/song/pitch.ts";
import { initEngine, WasmVoice } from "./harness.ts";
await initEngine();
const { planMelody }=await import("../src/song/plan.ts");

const vlq=(n:number)=>{const a=[n&127];while(n>>=7)a.unshift((n&127)|128);return a;};
const u32=(n:number)=>[n>>>24,(n>>>16)&255,(n>>>8)&255,n&255];
const track=(a:number[])=>[77,84,114,107,...u32(a.length),...a];
function midi(tracks:number[][],format=1){return new Uint8Array([77,84,104,100,0,0,0,6,0,format,0,tracks.length,1,224,...tracks.flatMap(track)]).buffer;}
const end=[0,255,47,0];

describe("MIDI import",()=>{
  test("global tempo changes, rests and repeated notes survive conversion",()=>{
    const tempo=[0,255,81,3,7,161,32,...vlq(480),255,81,3,15,66,64,...end];
    const notes=[0,144,60,90,...vlq(480),60,0,...vlq(480),144,60,90,...vlq(480),128,60,0,...end];
    const result=readMidi(midi([tempo,notes]),"test")[0];
    expect(result.notes).toHaveLength(2);
    expect(result.notes[0].duration).toBeCloseTo(.5,6);
    expect(result.notes[1].start).toBeCloseTo(1.5,6);
    expect(result.notes[1].duration).toBeCloseTo(1,6);
  });
  test("drums are excluded and separate channels can be selected",()=>{
    const notes=[0,153,36,100,0,144,60,100,0,145,72,100,...vlq(480),137,36,0,0,128,60,0,0,129,72,0,...end];
    expect(readMidi(midi([notes],0),"parts").map(p=>p.notes[0].midi)).toEqual([60,72]);
  });
  test("chords become their highest line; repeated attacks stay separate",()=>{
    const result=monophonic([{midi:60,start:0,duration:1},{midi:67,start:0,duration:.5},{midi:67,start:.5,duration:.5}]);
    expect(result.map(n=>[n.midi,n.start,n.duration])).toEqual([[67,0,.5],[67,.5,.5]]);
  });
  test("malformed, drum-only and unsupported MIDI fail clearly",()=>{
    expect(()=>readMidi(new ArrayBuffer(2),"bad")).toThrow();
    expect(()=>readMidi(midi([[0,153,36,90,...vlq(480),137,36,0,...end]],0),"drums")).toThrow("No pitched notes");
    expect(()=>readMidi(midi([end],2),"type2")).toThrow("type 0 or 1");
  });
});

describe("audio melody estimation",()=>{
  const tone=(hz:number,seconds:number)=>Float32Array.from({length:Math.floor(8000*seconds)},(_,i)=>.3*Math.sin(2*Math.PI*hz*i/8000)+.07*Math.sin(4*Math.PI*hz*i/8000));
  test("detects notes across the human singing range",()=>{
    for(const hz of [82.4069,130.8128,220,440,880]){
      const pitch=pitchOf(tone(hz,.2),0);
      expect(pitch).not.toBeNull();
      expect(Math.abs(pitch!-(69+12*Math.log2(hz/440)))).toBeLessThan(.12);
    }
  });
  test("silence stays silent, two pitches retain the pause",()=>{
    expect(extractMelody(new Float32Array(8000))).toEqual([]);
    const clip=new Float32Array(24000);
    clip.set(tone(220,.7),800);clip.set(tone(329.6276,.7),12800);
    const result=extractMelody(clip);
    expect(result.map(n=>n.midi)).toEqual([57,64]);
    expect(result[1].start-result[0].start-result[0].duration).toBeGreaterThan(.5);
  });
});

describe("physical mouth song plans",()=>{
  const body={female:0,child:0};
  test("an imported rest is silent and the next note lands at its timestamp",()=>{
    const melody:Melody={name:"two notes",notes:[{midi:57,start:0,duration:.4},{midi:64,start:1.1,duration:.4}],duration:1.5,lyrics:"",source:"test"};
    const {plan,times}=planMelody(melody,"",body,1,0,0);
    expect(times).toEqual([[.35,.75],[1.4500000000000002,1.85]]);
    const voice=new WasmVoice();voice.schedule(plan.gestures,0,true);
    const out=voice.render(48000*2);
    const rms=(a:number,b:number)=>Math.sqrt(out.slice(a*48000,b*48000).reduce((s,x)=>s+x*x,0)/((b-a)*48000));
    expect(rms(.5,.65)).toBeGreaterThan(.005);
    expect(rms(1.1,1.25)).toBeLessThan(.001);
    expect(rms(1.6,1.75)).toBeGreaterThan(.005);
  });
  test("speed and transpose change notes without accumulated timing drift",()=>{
    const melody:Melody={name:"small gaps",notes:Array.from({length:40},(_,i)=>({midi:60,start:i*.51,duration:.5})),duration:20.39,lyrics:"",source:"test"};
    const {times,midi,plan}=planMelody(melody,"",body,1.5,-12,0);
    expect(midi.every(m=>m===48)).toBe(true);
    expect(times.at(-1)![0]).toBeCloseTo(.35+39*.51/1.5,8);
    expect(plan.segments.at(-1)!.t1).toBeGreaterThan(times.at(-1)![0]);
  });
  test("all bundled songs yield a nonempty playable plan",()=>{
    for(const song of SONGS){const {plan}=planMelody(song,song.lyrics,body,1,0,20);expect(plan.gestures.length).toBeGreaterThan(30);expect(plan.end).toBeGreaterThan(song.duration);}
  });
});
