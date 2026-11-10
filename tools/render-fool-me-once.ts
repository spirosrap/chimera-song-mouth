/** Rebuild the public-domain presidential speech excerpt using CHIMERA, without recorded speech. */
import {readFileSync,writeFileSync,mkdirSync,rmSync} from 'node:fs';
import {gzipSync,gunzipSync} from 'node:zlib';
import {spawnSync} from 'node:child_process';
import {initEngine,wasmModule} from '../tests/harness.ts';
import {renderPart,BAND_RATE} from '../src/band/render.ts';
import {validateScene,type SceneFile} from '../src/scene/scene.ts';
import type {BandPart} from '../src/band/types.ts';
import type {Gesture} from '../src/wasm/types.ts';

await initEngine();
const {EnglishG2P,planPhrases}=await import('../src/wasm/engine.ts');
const root=new URL('../',import.meta.url).pathname,out=root+'public/scenes/fool-me-once/';
const g2p=new EnglishG2P();g2p.setDictionaryText(gunzipSync(readFileSync(root+'public/data/cmudict.txt.gz')).toString());
// Official White House transcript, 17 September 2002. Timing is staged by hand.
// The long hesitations are intentional; captions end with each utterance.
const lines=[
  {start:.8,end:3.65,text:"There's an old saying in Tennessee.",pitch:120,intensity:.35},
  {start:3.95,end:5.85,text:"I know it's in Texas.",pitch:126,intensity:.5},
  {start:6.2,end:8.15,text:'Probably in Tennessee.',pitch:117,intensity:.3},
  {start:8.75,end:9.65,text:'That says:',pitch:119,intensity:.4},
  {start:10.2,end:11.75,text:'Fool me once,',pitch:124,intensity:.6},
  {start:12.4,end:13.45,text:'Shame on…',pitch:115,intensity:.35},
  {start:15.25,end:16.55,text:'Shame on you.',pitch:123,intensity:.7},
  {start:17.6,end:18.65,text:'Fool me…',pitch:112,intensity:.3},
  {start:20.55,end:23.05,text:"You can't get fooled again.",pitch:130,intensity:.85},
];
const duration=25.5;
const part:BandPart={id:'bush',name:'George W. Bush',role:'Robotic reconstruction',body:{female:0,child:0},volume:1,pan:0,vibrato:0,voice:{breathiness:.05,brightness:.65,tension:.54,drift:.002}};
const gestures:Gesture[]=[];
for(const line of lines){
  const text=line.text.replaceAll('…',',');
  const phrases=g2p.toPhrases(text).map(p=>{
    let word=0;
    const segments=p.segments.map(segment=>{
      const current=p.words[word]?.toLowerCase(),s={...segment};
      // The catchphrase needs a held OO and a brief lateral release; a long
      // dark-L overwhelmed the vowel. "On" is emphatic here, not a schwa.
      if(current==='fool'||current==='fooled'){
        if(s.ipa==='u')s.dur=.30;
        if(s.ipa==='ɫ'){s.ipa='l';s.dur=.05;}
        if(s.ipa==='f')s.dur=.13;
      }
      if(current==='on'&&s.ipa==='ə'){s.ipa='ɑ';s.stress=1;}
      if(segment.wordEnd)word++;
      return s;
    });
    return {...p,segments};
  });
  const plan=planPhrases(phrases,{body:part.body,t0:0,f0:line.pitch,rate:1,accent:.14});
  const stretch=(line.end-line.start)/plan.end;
  for(const g of plan.gestures)gestures.push({...g,t0:line.start+g.t0*stretch,t1:line.start+g.t1*stretch,rampIn:g.rampIn*stretch,rampOut:g.rampOut*stretch,releaseHold:g.releaseHold===undefined?undefined:g.releaseHold*stretch});
  console.log(line.start,line.end,'timing scale',stretch.toFixed(3));
}
let last=-1;
const rendered=renderPart(wasmModule,part,duration,gestures,p=>{const step=Math.floor(p*10);if(step!==last){last=step;console.log('Rendered',step*10+'%');}});
const samples=rendered.samples;let peak=0;
for(const x of samples){if(!Number.isFinite(x))throw Error('Non-finite speech');peak=Math.max(peak,Math.abs(x));}
if(peak<.01)throw Error('Silent speech');
const gain=.82/peak,pcm=new Int16Array(samples.length*2);
for(let i=0;i<samples.length;i++){
  // Subtle stereo room reflection; the mouth remains the only sound source.
  const echo=i>2400?samples[i-2400]*.025:0;
  pcm[i*2]=Math.round((samples[i]+echo)*gain*32767);
  pcm[i*2+1]=Math.round((samples[i]+(i>2736?samples[i-2736]*.025:0))*gain*32767);
}
mkdirSync(out,{recursive:true});
const header=Buffer.alloc(44);header.write('RIFF');header.writeUInt32LE(36+pcm.byteLength,4);header.write('WAVEfmt ',8);header.writeUInt32LE(16,16);header.writeUInt16LE(1,20);header.writeUInt16LE(2,22);header.writeUInt32LE(BAND_RATE,24);header.writeUInt32LE(BAND_RATE*4,28);header.writeUInt16LE(4,32);header.writeUInt16LE(16,34);header.write('data',36);header.writeUInt32LE(pcm.byteLength,40);
const wav=out+'mix.wav';writeFileSync(wav,Buffer.concat([header,Buffer.from(pcm.buffer)]));
const encoded=spawnSync('ffmpeg',['-v','error','-y','-i',wav,'-c:a','libmp3lame','-b:a','192k','-map_metadata','-1',out+'mix.mp3'],{stdio:'inherit'});
if(encoded.status!==0)throw Error('MP3 encoding failed');
if(!process.env.KEEP_WAV)rmSync(wav);
writeFileSync(out+'bush.tele.gz',gzipSync(new Uint8Array(rendered.tele),{level:9}));
const scene:SceneFile={setting:'press',title:'Fool me once · George W. Bush',description:'One robotic speaker, a familiar saying and two very long pauses.',duration,audio:'mix.mp3',characters:[{id:'bush',name:'George W. Bush',role:'The speaker · a staged robotic reconstruction',tele:'bush.tele',telemetryEncoding:'gzip'}],cues:lines.map(l=>({start:l.start,end:l.end,speaker:'bush',text:l.text,intensity:l.intensity})),shots:[{time:0,view:'wide'},{time:3.8,view:'bush'},{time:8.4,view:'wide'},{time:12,view:'bush'},{time:23.3,view:'wide'}]};
writeFileSync(out+'scene.json',JSON.stringify(validateScene(scene)));
writeFileSync(out+'credits.txt',[
  'George W. Bush, remarks at East Literature Magnet School, Nashville, Tennessee, 17 September 2002.',
  'Excerpt from an official U.S. presidential speech. Public-domain federal-government text.',
  'Transcript: https://georgewbush-whitehouse.archives.gov/news/releases/2002/09/20020917-7.html',
  'Government publication: https://www.govinfo.gov/content/pkg/PPP-2002-book2/pdf/PPP-2002-book2-doc-pg1607.pdf',
  'CHIMERA generates the entire speech through its physical airway. No original recorded speech or news footage is played or bundled.',
  'The voice is a robotic reconstruction, not a cloned voice. Timing, gestures, facial appearance and the press-conference set are stylized and approximate.',
  'Wireframe staging inspired by the user-supplied Jacob Matson press-conference demo; suit, red tie and flag reference the White House event photograph.',
  '',
].join('\n'));
console.log('COMPLETE',duration,'seconds; raw peak',peak,'gain',gain);
