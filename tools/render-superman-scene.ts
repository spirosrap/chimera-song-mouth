/** Rebuild the physical lead and repeated ha, original-band mix and mouth movement. */
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
const {renderTheatreVoice:renderPart}=await import('./render-theatre-voice.ts');
const {renderMouthLoop}=await import('./render-mouth-loop.ts');
const root=new URL('../',import.meta.url).pathname,out=join(root,'public/scenes/o-superman');
const a:Arrangement=JSON.parse(readFileSync(join(out,'performance.json'),'utf8'));
const voices=a.parts.filter(p=>p.kind==='voice'),backing=a.parts.find(p=>p.kind==='backing')!;
if(voices.length!==2||!backing||voices.some(p=>!p.performance||!validPerformance(p.performance,a.duration)))throw Error('The prepared O Superman performance is invalid.');
const temp=mkdtempSync(join(tmpdir(),'chimera-superman-'));
try{
 const inputs:string[]=[],filters:string[]=[],labels:string[]=[];let frames=0;
 for(const [i,part] of voices.entries()){
  const rendered=part.id==='superman-pulse'?renderMouthLoop(wasmModule,part,a.duration):renderPart(wasmModule,part,a.duration,planPart(part));frames=rendered.samples.length;
  if(!rendered.samples.every(x=>Number.isFinite(x)&&Math.abs(x)<1)||!rendered.samples.some(x=>Math.abs(x)>.01))throw Error(`The ${part.id} is silent or unstable.`);
  const raw=join(temp,part.id+'.f32');writeFileSync(raw,Buffer.from(rendered.samples.buffer));
  writeFileSync(join(temp,part.id+'.tele.gz'),gzipSync(Buffer.from(rendered.tele),{level:9}));
  inputs.push('-f','f32le','-ar','48000','-ac','1','-i',raw);
  const theta=(part.pan+1)*Math.PI/4;
  filters.push(`[${i}:a]pan=stereo|c0=${Math.cos(theta)*part.volume}*c0|c1=${Math.sin(theta)*part.volume}*c0[v${i}]`);labels.push(`[v${i}]`);
 }
 filters.push(`[${voices.length}:a]volume=${backing.volume}[b]`);labels.push('[b]');
 filters.push(`${labels.join('')}amix=inputs=${labels.length}:normalize=0:duration=longest:dropout_transition=0,atrim=end_sample=${frames}[out]`);
 const mix=join(temp,'mix.mp3');
 const r=spawnSync('ffmpeg',['-v','error','-y',...inputs,'-i',join(out,'backing.mp3'),'-filter_complex',filters.join(';'),'-map','[out]','-map_metadata','-1','-c:a','libmp3lame','-b:a','256k',mix],{stdio:'inherit'});
 if(r.status!==0)throw Error('O Superman mix encoding failed.');
 copyFileSync(mix,join(out,'mix.mp3'));
 for(const part of voices)copyFileSync(join(temp,part.id+'.tele.gz'),join(out,part.id+'.tele.gz'));
}finally{rmSync(temp,{recursive:true,force:true});}
console.log('Rebuilt the physical lead, repeated ha, original music mix and synchronized movement. Check the audio, then run bun run content:manifest.');
