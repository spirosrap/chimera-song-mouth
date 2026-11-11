/** Rebuild both physical Contact voices and their synchronized beach-scene mix. */
import {readFileSync,writeFileSync,mkdtempSync,rmSync,copyFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {gzipSync} from 'node:zlib';
import {initEngine,wasmModule} from '../tests/harness.ts';
import type {ContactPerformance} from '../src/scene/contactSpeech.ts';
import type {ContactPerson} from '../src/scene/contact.ts';
await initEngine();
const {planContactPart}=await import('../src/scene/contactSpeech.ts');
const {renderContactVoice}=await import('./contact-render-voice.ts');
const out=new URL('../public/scenes/contact/',import.meta.url).pathname;
const score:ContactPerformance=JSON.parse(readFileSync(join(out,'performance.json'),'utf8'));
const temp=mkdtempSync(join(tmpdir(),'chimera-contact-'));
try{
 const inputs:string[]=[],filters:string[]=[],tracks:{id:string;tele:ArrayBuffer}[]=[];
 for(const [index,part] of score.parts.entries()){
  const rendered=renderContactVoice(wasmModule,part,score.duration,planContactPart(score,part.id as ContactPerson));
  if(!rendered.samples.every(x=>Number.isFinite(x)&&Math.abs(x)<1)||!rendered.samples.some(x=>Math.abs(x)>.01))throw Error('A physical Contact voice is silent or unstable.');
  const path=join(temp,part.id+'.f32');writeFileSync(path,Buffer.from(rendered.samples.buffer));
  inputs.push('-f','f32le','-ar','48000','-ac','1','-i',path);
  const angle=(part.pan+1)*Math.PI/4;
  filters.push(`[${index}:a]pan=stereo|c0=${Math.cos(angle)*part.volume}*c0|c1=${Math.sin(angle)*part.volume}*c0[v${index}]`);
  tracks.push({id:part.id,tele:rendered.tele});
 }
 inputs.push('-i',join(out,'backing.mp3'));
 filters.push(`[${score.parts.length}:a]volume=${score.backingVolume}[b]`);
 filters.push(`${score.parts.map((_,i)=>`[v${i}]`).join('')}[b]amix=inputs=${score.parts.length+1}:normalize=0:duration=longest:dropout_transition=0,atrim=end_sample=${Math.ceil(score.duration*48000)}[out]`);
 const mix=join(temp,'mix.mp3');
 const r=spawnSync('ffmpeg',['-v','error','-y',...inputs,'-filter_complex',filters.join(';'),'-map','[out]','-map_metadata','-1','-c:a','libmp3lame','-b:a','256k',mix],{stdio:'inherit'});
 if(r.status!==0)throw Error('Contact mix encoding failed.');
 copyFileSync(mix,join(out,'mix.mp3'));
 for(const track of tracks)writeFileSync(join(out,track.id+'.tele.gz'),gzipSync(Buffer.from(track.tele),{level:9}));
}finally{rmSync(temp,{recursive:true,force:true});}
console.log('Rebuilt both physical voices, original-background mix and synchronized movement. Check the audio, then run bun run content:manifest.');
