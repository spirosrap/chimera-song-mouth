/** Rebuild the physical performers, original-music mix and mouth movement. */
import {readFileSync,writeFileSync,mkdtempSync,rmSync,copyFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {gzipSync} from 'node:zlib';
import {initEngine,wasmModule} from '../tests/harness.ts';
import type {Arrangement} from '../src/band/types.ts';
import {validPerformance} from '../src/band/performance.ts';
await initEngine();
const {planPart}=await import('../src/band/planning.ts');
const {renderPart}=await import('../src/band/render.ts');
const root=new URL('../',import.meta.url).pathname,out=join(root,'public/scenes/sabrina-tears');
const a:Arrangement=JSON.parse(readFileSync(join(out,'performance.json'),'utf8'));
const voices=a.parts.filter(p=>p.kind==='voice'),backing=a.parts.find(p=>p.kind==='backing')!;
if(voices.length!==3||!backing||voices.some(p=>!p.performance||!validPerformance(p.performance,a.duration)))throw Error('The prepared Tears performance is invalid.');
const temp=mkdtempSync(join(tmpdir(),'chimera-sabrina-tears-'));
try{
 const inputs:string[]=[],filters:string[]=[],labels:string[]=[];let frames=0;
 for(const [i,part] of voices.entries()){
  const rate=48000,total=Math.ceil(a.duration*rate),globalCount=Math.floor(total/2400)+1,samples=new Float32Array(total),plan=planPart(part),ranges=({"lead": [[84.7, 86.7], [88.0, 90.8], [91.0, 93.3], [100.35, 104.5], [104.75, 108.55], [109.15, 145.95], [146.2, 149.55], [150.1, 174.1], [175.2, 178.6], [179.1, 199.85], [217.2, 224.55], [225.85, 234.15], [238.15, 239.2], [244.5, 245.55], [245.8, 246.95], [247.6, 249.8], [250.55, 255.9], [258.95, 261.2], [266.85, 269.65], [272.15, 274.7]], "responses": [[61.0, 62.95], [97.6, 99.9], [103.65, 105.05], [108.5, 109.8], [112.5, 114.05], [137.7, 138.85], [141.4, 143.45], [145.0, 146.55], [170.3, 171.85], [174.05, 175.75], [177.7, 179.25], [186.6, 188.15], [191.35, 192.9], [195.4, 196.95], [220.85, 222.4], [223.9, 226.0], [229.6, 230.95], [297.95, 300.0]], "boyfriend": [[241.2, 242.35], [243.2, 245.2], [246.1, 248.3], [249.15, 251.1], [255.1, 259.65]]} as Record<string,number[][]>)[part.id];let whole:ArrayBuffer|undefined,frameWidth=0,data:Float32Array|undefined;
  for(const[start,end]of ranges){const segment=renderPart(wasmModule,part,end-start,plan.filter(g=>g.t1>=start&&g.t0<end).map(g=>({...g,t0:g.t0-start,t1:g.t1-start}))),header=new DataView(segment.tele),rows=header.getUint32(16,true);if(!whole){frameWidth=header.getUint32(20,true);whole=new ArrayBuffer(48+globalCount*frameWidth*4);new Uint8Array(whole,0,48).set(new Uint8Array(segment.tele,0,48));new DataView(whole).setUint32(16,globalCount,true);data=new Float32Array(whole,48);const neutral=new Float32Array(segment.tele,48+(rows-1)*frameWidth*4,frameWidth);if(Math.abs(neutral[6])>1e-5)throw Error('A render join must be silent.');for(let j=0;j<globalCount;j++)data.set(neutral,j*frameWidth);}samples.set(segment.samples,Math.round(start*rate));data!.set(new Float32Array(segment.tele,48),Math.round(start*20)*frameWidth);}
  for(let j=0;j<globalCount;j++)data![j*frameWidth+10]=j/20;const rendered={samples,tele:whole!};frames=samples.length;
  if(!rendered.samples.every(x=>Number.isFinite(x)&&Math.abs(x)<1)||!rendered.samples.some(x=>Math.abs(x)>.01))throw Error(`The ${part.id} is silent or unstable.`);
  const raw=join(temp,part.id+'.f32');writeFileSync(raw,Buffer.from(rendered.samples.buffer));
  // Snapshots belong to their exact recorded sample times; solver telemetry can look ahead by a partial block.
  const header=new DataView(rendered.tele),width=header.getUint32(20,true),count=header.getUint32(16,true),tele=new Float32Array(rendered.tele,48);for(let f=0;f<count;f++)tele[f*width+10]=f*header.getUint32(12,true)/header.getUint32(8,true);
  writeFileSync(join(temp,part.id+'.tele.gz'),gzipSync(Buffer.from(rendered.tele),{level:9}));
  inputs.push('-f','f32le','-ar','48000','-ac','1','-i',raw);
  const theta=(part.pan+1)*Math.PI/4;
  filters.push(`[${i}:a]pan=stereo|c0=${Math.cos(theta)*part.volume}*c0|c1=${Math.sin(theta)*part.volume}*c0[v${i}]`);labels.push(`[v${i}]`);
 }
 filters.push(`[${voices.length}:a]volume=${backing.volume}[b]`);labels.push('[b]');
 filters.push(`${labels.join('')}amix=inputs=${labels.length}:normalize=0:duration=longest:dropout_transition=0,atrim=end_sample=${frames}[out]`);
 const mix=join(temp,'mix.mp3');
 const r=spawnSync('ffmpeg',['-v','error','-y',...inputs,'-i',join(out,'backing.mp3'),'-filter_complex',filters.join(';'),'-map','[out]','-map_metadata','-1','-c:a','libmp3lame','-b:a','256k',mix],{stdio:'inherit'});
 if(r.status!==0)throw Error('Tears mix encoding failed.');
 copyFileSync(mix,join(out,'mix.mp3'));
 for(const part of voices)copyFileSync(join(temp,part.id+'.tele.gz'),join(out,part.id+'.tele.gz'));
}finally{rmSync(temp,{recursive:true,force:true});}
console.log('Rebuilt the physical performers, original music mix and synchronized movement. Check the audio, then run bun run content:manifest.');
