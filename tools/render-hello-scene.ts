/** Rebuild the four physical voices, original-music mix and mouth movement. */
import {readFileSync,writeFileSync,mkdtempSync,rmSync,copyFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {gzipSync} from 'node:zlib';
import {initEngine,wasmModule} from '../tests/harness.ts';
import type {Arrangement} from '../src/band/types.ts';
import {validPerformance} from '../src/band/performance.ts';
await initEngine();const {clearPhrases,CLEAR_SPEECH_TIGHT}=await import('../src/scene/clarity.ts');
const {planPart}=await import('../src/band/planning.ts');
const {renderPart}=await import('../src/band/render.ts');
const root=new URL('../',import.meta.url).pathname,out=join(root,'public/scenes/hello');
const a:Arrangement=JSON.parse(readFileSync(join(out,'performance.json'),'utf8'));
const voices=a.parts.filter(p=>p.kind==='voice'),backing=a.parts.find(p=>p.kind==='backing')!;
if(voices.length!==4||!backing||voices.some(p=>!p.performance||!validPerformance(p.performance,a.duration)))throw Error('The prepared Hello performance is invalid.');
// The words are already source-aligned. Keep their explicit durations when applying clear speech.
for(const voice of voices){for(const phrase of voice.performance?.phrases??[]){const [clear]=clearPhrases([{segments:phrase.phones.map(p=>({ipa:p.ipa,dur:p.duration}))}],voice.body,CLEAR_SPEECH_TIGHT);phrase.phones=phrase.phones.map((p,i)=>({...p,duration:clear.segments[i].dur!}));}}
const temp=mkdtempSync(join(tmpdir(),'chimera-hello-'));
try{
 const inputs:string[]=[],filters:string[]=[],labels:string[]=[];let frames=0;
 for(const [i,part] of voices.entries()){
  const rendered=renderPart(wasmModule,part,a.duration,planPart(part));frames=rendered.samples.length;
  if(!rendered.samples.every(x=>Number.isFinite(x)&&Math.abs(x)<1)||!rendered.samples.some(x=>Math.abs(x)>.01))throw Error(`The ${part.id} is silent or unstable.`);
  // Match the source mix: actors stay foregrounded over the quieter song.
  if(part.id==='lead'){
   const gain=new Float32Array(rendered.samples.length).fill(1);
   for(const actor of voices.filter(p=>p.id!=='lead'))for(const phrase of actor.performance!.phrases){
    const start=phrase.start,end=start+phrase.phones.reduce((a,c)=>a+c.duration,0),lo=Math.max(0,Math.floor((start-.04)*48000)),hi=Math.min(gain.length,Math.floor((end+.08)*48000));
    for(let i=lo;i<hi;i++){const t=i/48000,weight=Math.max(0,Math.min(1,(t-start+.04)/.08,(end+.08-t)/.08));gain[i]=Math.min(gain[i],1-.7*weight);}
   }
   for(let i=0;i<gain.length;i++)rendered.samples[i]*=gain[i];
  }
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
 if(r.status!==0)throw Error('Hello mix encoding failed.');
 copyFileSync(mix,join(out,'mix.mp3'));
 for(const part of voices)copyFileSync(join(temp,part.id+'.tele.gz'),join(out,part.id+'.tele.gz'));
}finally{rmSync(temp,{recursive:true,force:true});}
console.log('Rebuilt the four physical voices, original music mix and synchronized movement. Check the audio, then run bun run content:manifest.');
