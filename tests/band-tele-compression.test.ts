import {expect,test} from 'bun:test';
import {loadBandAssets} from '../src/band/assets.ts';
import {TeleTrack} from '../src/show/tele.ts';
import type {BandPart} from '../src/band/types.ts';

test('compressed prepared mouth movement restores identical samples and leaves audio unchanged',async()=>{
 const nArtic=17,nPh=3,nOr=2,nScope=32,len=11+nArtic+3*(nPh+nOr)+2*nScope,frames=3;
 const raw=new ArrayBuffer(48+frames*len*4),d=new DataView(raw);new Uint8Array(raw).set(new TextEncoder().encode('CHTL'));
 [1,48000,2400,frames,len,nArtic,nPh,nOr,nScope].forEach((v,i)=>d.setUint32(4+4*i,v,true));
 const values=new Float32Array(raw,48);for(let i=0;i<values.length;i++)values[i]=Math.sin(i)*.2;
 const part:BandPart={id:'voice',name:'Voice',role:'Choir',body:{female:0,child:0},volume:1,pan:0,telemetryEncoding:'gzip'};
 for(const alreadyDecoded of [false,true]){
 for(const assetVersion of [undefined,"performance-2"]){
 part.assetVersion=assetVersion;const suffix=assetVersion?"?v="+assetVersion:"";
 const requests:string[]=[];const audio=Uint8Array.of(1,2,3),buffer={} as AudioBuffer;
 const result=await loadBandAssets('test',[part],async bytes=>{expect(new Uint8Array(bytes)).toEqual(audio);return buffer;},async url=>{
  requests.push(url);return new Response(url.includes('.mp3')?audio:alreadyDecoded?new Uint8Array(raw):Bun.gzipSync(new Uint8Array(raw)));
 });
 expect(requests).toEqual(['/band/test/voice.mp3'+suffix,'/band/test/voice.tele.gz'+suffix]);expect(result[0].buffer).toBe(buffer);
 const reference=new TeleTrack(raw),track=result[0].track!;expect(track.duration).toBe(reference.duration);expect(track.frames).toBe(reference.frames);
 for(let i=0;i<frames;i++)expect(track.message(i).t).toEqual(reference.message(i).t);
 }
 }
});


test('all three bundled scores request compressed prepared movement without changing their notes',async()=>{
 const {BAND_SONGS}=await import('../src/band/library.ts');
 const {originalBand}=await import('../src/band/original.ts');
 const {risingSunBand}=await import('../src/band/risingSun.ts');
 const {neonCurrentBand}=await import('../src/band/neonCurrent.ts');
 for(const [i,score] of [risingSunBand(),originalBand(),neonCurrentBand()].entries()){
  expect(BAND_SONGS[i].arrangement.parts.every(p=>p.telemetryEncoding==='gzip')).toBe(true);
  expect(BAND_SONGS[i].arrangement.parts.map(({telemetryEncoding,...p})=>p)).toEqual(score.parts);
 }
});
