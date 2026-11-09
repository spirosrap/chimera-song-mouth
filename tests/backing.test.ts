import {expect,test} from "bun:test";
import {loadBandAssets} from "../src/band/assets.ts";
import {mixWave} from "../src/band/mixer.ts";
import {BAND_SONGS,DEFAULT_BAND} from "../src/band/library.ts";
import type {BandPart} from "../src/band/types.ts";
const backing:BandPart={id:"backing",kind:"backing",name:"Original music",role:"Stereo instrumental",body:{female:0,child:0},pan:0,volume:1};
test("original stereo music loads as audio without requesting a fake mouth track",async()=>{
  const urls:string[]=[];const buffer={numberOfChannels:2,duration:2} as AudioBuffer;
  const r=await loadBandAssets("synnefoula",[backing],async()=>buffer,(async(url:RequestInfo|URL)=>{urls.push(String(url));return new Response(new Uint8Array([1,2]));}));
  expect(urls).toEqual(["/band/synnefoula/backing.mp3"]);expect(r[0]).toEqual({buffer,track:null});
  await expect(loadBandAssets("synnefoula",[backing],async()=>buffer,(async()=>new Response(null,{status:404})))).rejects.toThrow("404");
});
test("stereo WAV retains different left and right instruments and obeys music mute/solo",()=>{
  const voice={...backing,id:"lead",kind:"voice" as const};
  const stems=[Float32Array.of(.1,.1),[Float32Array.of(.2,0),Float32Array.of(0,.3)]];
  const wave=mixWave([voice,backing],stems,48000,[true,false],[false,false]),v=new DataView(wave.buffer);
  expect(v.getInt16(44,true)).toBeCloseTo(.2*.96*32767,0);expect(v.getInt16(46,true)).toBe(0);
  expect(v.getInt16(48,true)).toBe(0);expect(v.getInt16(50,true)).toBeCloseTo(.3*.96*32767,0);
  expect(mixWave([voice,backing],stems,48000,[false,false],[false,true])).toEqual(wave);
  const silent=mixWave([voice,backing],stems,48000,[true,true],[false,false]);expect([...silent.slice(44)].every(x=>x===0)).toBe(true);
});
test("Greek backed song is an addition and keeps all five previous songs",()=>{
  expect(BAND_SONGS.slice(0,6).map(s=>s.id)).toEqual(["house-of-the-rising-sun","all-made-of-air","neon-current","bicep-glue","night-train-quartet","synnefoula"]);
  expect(DEFAULT_BAND.id).toBe("house-of-the-rising-sun");expect(BAND_SONGS[5].arrangement.presentation).toBe("backed-solo");
});
