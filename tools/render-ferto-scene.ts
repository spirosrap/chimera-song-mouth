import {readFileSync,writeFileSync,mkdtempSync,rmSync,copyFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {gzipSync} from 'node:zlib';
import {initEngine,wasmModule} from '../tests/harness.ts';
import type {Arrangement} from '../src/band/types.ts';
import {validPerformance} from '../src/band/performance.ts';

const root=new URL('../',import.meta.url).pathname,out=join(root,'public/scenes/ferto');
const [instrumentalArg,vocalsArg]=Bun.argv.slice(2);
if(!instrumentalArg||!vocalsArg)throw Error('Usage: bun tools/render-ferto-scene.ts <no-vocals.wav> <vocals.wav>');
const instrumental=resolve(instrumentalArg),vocals=resolve(vocalsArg);
const a:Arrangement=JSON.parse(readFileSync(join(out,'performance.json'),'utf8'));
const part=a.parts.find(p=>p.id==='ferto-announcer')!;
if(!part.performance||!validPerformance(part.performance,a.duration))throw Error('The Ferto physical score is invalid.');
await initEngine();
const {planPerformance}=await import('../src/band/performancePlan.ts');
const {renderPart,BAND_RATE,BAND_HOP}=await import('../src/band/render.ts');
const temp=mkdtempSync(join(tmpdir(),'chimera-ferto-'));
try{
  const rendered=renderPart(wasmModule,part,a.duration,planPerformance(part,part.performance));
  if(!rendered.samples.every(x=>Number.isFinite(x)&&Math.abs(x)<1)||!rendered.samples.some(x=>Math.abs(x)>.01))throw Error('The Ferto airway render is silent or unstable.');
  const raw=join(temp,'announcer.f32');writeFileSync(raw,Buffer.from(rendered.samples.buffer));
  const header=new DataView(rendered.tele),width=header.getUint32(20,true),count=header.getUint32(16,true),tele=new Float32Array(rendered.tele,48);
  for(let f=0;f<count;f++)tele[f*width+10]=f*header.getUint32(12,true)/header.getUint32(8,true);
  writeFileSync(join(out,'ferto-announcer.tele.gz'),gzipSync(Buffer.from(rendered.tele),{level:9}));
  const windows=(a as Arrangement&{sourceWindows?:{start:number;end:number}[]}).sourceWindows??[];
  let expr='1';
  for(const w of [...windows].reverse()){
    const start=w.start,end=w.end,fade=.14,level=.12;
    const local=`if(lt(t,${start+fade}),1-${1-level}*(t-${start})/${fade},if(gt(t,${end-fade}),1-${1-level}*(${end}-t)/${fade},${level}))`;
    expr=`if(between(t,${start},${end}),${local},${expr})`;
  }
  const filters=`[0:a]volume=0.84[inst];[1:a]volume='${expr}':eval=frame,volume=0.84[orig];[2:a]pan=stereo|c0=0.82*c0|c1=0.82*c0[ann];[inst][orig][ann]amix=inputs=3:normalize=0:duration=longest:dropout_transition=0,alimiter=limit=0.92[out]`;
  const mix=join(temp,'mix.mp3');
  const r=spawnSync('ffmpeg',['-v','error','-y','-i',instrumental,'-i',vocals,'-f','f32le','-ar',String(BAND_RATE),'-ac','1','-i',raw,'-filter_complex',filters,'-map','[out]','-map_metadata','-1','-c:a','libmp3lame','-b:a','256k',mix],{stdio:'inherit'});
  if(r.status!==0)throw Error('Ferto source/announcer mix encoding failed.');
  copyFileSync(mix,join(out,'mix.mp3'));
  console.log(`Rendered ${part.performance.phrases.length} timed Greek phrases (${part.performance.contour.length} pitch points), ${rendered.samples.length} airway samples at ${BAND_RATE} Hz.`);
}finally{rmSync(temp,{recursive:true,force:true});}
