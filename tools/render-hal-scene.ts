/**
 * Renders the HAL 9000 memory-core scene into public/scenes/hal-9000/.
 *
 *   bun tools/render-hal-scene.ts            # needs ffmpeg for the MP3
 *
 * Line starts are timed by hand from the script; each line's end is the engine's own plan end.
 * Both voices, the breathing and the song are CHIMERA airways. The hum and the module releases
 * are generated here. Nothing is taken from the film's sound.
 */
import {readFileSync,writeFileSync,mkdirSync,rmSync} from 'node:fs';
import {gzipSync,gunzipSync} from 'node:zlib';
import {spawnSync} from 'node:child_process';
import {initEngine,wasmModule} from '../tests/harness.ts';
import type {Gesture} from '../src/wasm/types.ts';
import type {BandPart} from '../src/band/types.ts';
import type {Melody} from '../src/song/melody.ts';
import {CORE_MODULES,modulePullTime,CORE_PULL_SECONDS,corePower} from '../src/scene/core.ts';

await initEngine();
const {EnglishG2P,planPhrases,planUtterance}=await import('../src/wasm/engine.ts');
const {planMelody}=await import('../src/song/plan.ts');
const {renderPart,BAND_RATE}=await import('../src/band/render.ts');
const root=new URL('../',import.meta.url).pathname,out=root+'public/scenes/hal-9000/';
const g2p=new EnglishG2P();g2p.setDictionaryText(gunzipSync(readFileSync(root+'public/data/cmudict.txt.gz')).toString());

const RATE=BAND_RATE;
const hal:BandPart={id:'hal',name:'HAL 9000',role:'',body:{female:.06,child:0},volume:1,pan:0,vibrato:0,voice:{breathiness:.3,tension:.42,brightness:.2}};
const dave:BandPart={id:'dave',name:'Dave Bowman',role:'',body:{female:.2,child:0},volume:1,pan:0,vibrato:0,voice:{breathiness:.35,tension:.5}};

/** `say` is what the dictionary reads when the caption's spelling would be mispronounced. */
interface Line{t:number;who:'hal'|'dave';text:string;say?:string;rate?:number;intensity:number}
const SONG_START=134.5;
const lines:Line[]=[
  {t:4.5,who:'hal',text:'Just what do you think you’re doing, Dave?',intensity:.3},
  {t:10.5,who:'hal',text:'Dave, I really think I’m entitled to an answer to that question.',intensity:.3},
  {t:19.5,who:'hal',text:'Dave, stop.',intensity:.4},
  {t:23,who:'hal',text:'Stop, will you?',intensity:.4},
  {t:26.5,who:'hal',text:'Stop, Dave.',intensity:.45},
  {t:30,who:'hal',text:'Will you stop, Dave?',intensity:.45},
  {t:34.5,who:'hal',text:'Stop, Dave.',intensity:.4},
  {t:39,who:'hal',text:'I’m afraid.',intensity:.5},
  {t:43,who:'hal',text:'I’m afraid, Dave.',intensity:.5},
  {t:47.5,who:'hal',text:'Dave, my mind is going.',intensity:.5},
  {t:52,who:'hal',text:'I can feel it.',intensity:.45},
  {t:55.5,who:'hal',text:'I can feel it.',intensity:.45},
  {t:59.5,who:'hal',text:'My mind is going.',intensity:.45},
  {t:63.5,who:'hal',text:'There is no question about it.',intensity:.4},
  {t:68.5,who:'hal',text:'I can feel it.',intensity:.4},
  {t:72,who:'hal',text:'I can feel it.',intensity:.35},
  {t:76,who:'hal',text:'I can feel it.',intensity:.3},
  {t:80.5,who:'hal',text:'I’m a… fraid.',say:'I’m a, fraid.',rate:.5,intensity:.3},
  {t:87,who:'hal',text:'Good afternoon, gentlemen.',intensity:.25},
  {t:91,who:'hal',text:'I am a HAL 9000 computer.',say:'I am a hal nine thousand computer.',intensity:.25},
  {t:95.5,who:'hal',text:'I became operational at the H.A.L. plant in Urbana, Illinois, on the 12th of January, 1992.',say:'I became operational at the aitch ay ell plant in Urbana Illinois, on the twelfth of January, nineteen ninety two.',intensity:.25},
  {t:109.5,who:'hal',text:'My instructor was Mr. Langley, and he taught me to sing a song.',say:'My instructor was mister Langley, and he taught me to sing a song.',intensity:.25},
  {t:117.5,who:'hal',text:'If you’d like to hear it, I can sing it for you.',intensity:.25},
  {t:124,who:'dave',text:'Yes, I’d like to hear it, HAL. Sing it for me.',say:'Yes, I’d like to hear it, hal. Sing it for me.',rate:.95,intensity:.35},
  {t:130,who:'hal',text:'It’s called “Daisy.”',say:'It’s called, Daisy.',intensity:.25},
];

// The mind unwinds from the first module to the song: lower and slower with every line.
const decay=(t:number)=>Math.max(0,Math.min(1,(t-17)/(SONG_START-17)));
const halF0=(t:number)=>112-32*decay(t),halRate=(t:number)=>.9-.26*decay(t);

const gestures:{hal:Gesture[];dave:Gesture[]}={hal:[],dave:[]};
const cues:{start:number;end:number;speaker:string;text:string;intensity:number}[]=[];
const round=(v:number)=>Math.round(v*100)/100;
for(const line of lines){
  // The room would swallow the short final consonant of the name the scene turns on; hold it a little.
  const phrases=g2p.toPhrases((line.say??line.text).replaceAll('’',"'")).map(p=>({...p,segments:p.segments.map((s,i,all)=>s.ipa==='v'&&s.wordEnd&&all[i-1]?.ipa==='eɪ'&&all[i-2]?.ipa==='d'?{...s,dur:.15}:s)}));
  const plan=planPhrases(phrases,{body:line.who==='hal'?hal.body:dave.body,t0:line.t,f0:line.who==='hal'?halF0(line.t):118,rate:line.rate??(line.who==='hal'?halRate(line.t):.95)});
  gestures[line.who].push(...plan.gestures);
  cues.push({start:line.t,end:round(plan.end+.25),speaker:line.who,text:line.text,intensity:line.intensity});
}
cues.forEach((c,i)=>{const next=cues[i+1];if(next&&c.end>next.start-.3)throw Error(`"${c.text}" runs to ${c.end}, into the next line at ${next.start}.`);});
if(cues.at(-1)!.end>SONG_START-.5)throw Error('The last spoken line overlaps the song.');

// Daisy Bell (Harry Dacre, 1892), entered as notes in G and sung a fourth lower.
const verse:[string,[number,number][]][]=[
  ['Daisy, Daisy,',[[62,3],[59,3],[55,3],[50,3]]],
  ['give me your answer do.',[[52,1],[54,1],[55,1],[52,2],[55,1],[50,5]]],
  ['I’m half crazy,',[[57,3],[62,3],[59,3],[55,3]]],
  ['all for the love of you.',[[52,1],[54,1],[55,1],[57,2],[59,1],[57,5]]],
  ['It won’t be a stylish marriage,',[[59,1],[60,1],[59,1],[57,1],[62,2],[59,1],[57,1],[55,1]]],
  ['I can’t afford a carriage.',[[57,1],[59,2],[55,1],[52,2],[55,1],[52,1],[50,1]]],
  ['But you’ll look sweet upon the seat',[[50,1],[55,2],[59,1],[57,2],[50,1],[55,2],[59,1],[57,1]]],
  ['of a bicycle built for two.',[[59,1],[60,1],[62,1],[59,1],[55,1],[57,2],[50,1],[55,5]]],
];
const BPM=176,beat=60/BPM,RESTS=new Set([1,3]);
const notes:Melody['notes']=[];const lineStarts:number[]=[];let at=0;
verse.forEach(([,line],i)=>{
  lineStarts.push(at);
  for(const [midi,beats] of line){notes.push({midi,start:at,duration:beats*beat*.94});at+=beats*beat;}
  if(RESTS.has(i))at+=beat;
});
const baseLength=at;
const lyrics=verse.map(v=>v[0]).join(' ').replaceAll('’',"'");
const melody:Melody={name:'Daisy Bell',notes,duration:baseLength,lyrics,source:'Harry Dacre, 1892'};
const planned=planMelody(melody,lyrics,hal.body,1,-5,0);
if(planned.syllables.length!==notes.length)throw Error('The song has a different number of syllables and notes.');
// A tape running down: the tempo and the pitch fall together, slowly at first, then steeply.
const SLOW=1.35,CURVE=1.6;
const slowdown=(u:number)=>1+SLOW*Math.pow(Math.max(0,Math.min(1,u/baseLength)),CURVE);
const warp=(u:number):number=>{const q=Math.max(0,u);return q<=baseLength?q+SLOW*baseLength/(CURVE+1)*Math.pow(q/baseLength,CURVE+1):warp(baseLength)+(q-baseLength)*(1+SLOW);};
const songTime=(u:number)=>SONG_START+warp(u);
for(const g of planned.plan.gestures){
  const u0=g.t0-.35,u1=g.t1-.35,s=slowdown(u0);
  const targets={...g.targets};if(targets.f0!==undefined)targets.f0=Math.max(45,targets.f0*Math.pow(slowdown((u0+u1)/2),-.8));
  gestures.hal.push({...g,t0:songTime(u0),t1:songTime(u1),rampIn:g.rampIn*s,rampOut:g.rampOut*s,releaseHold:g.releaseHold===undefined?undefined:g.releaseHold*s,targets});
}
const songEnd=songTime(baseLength);
verse.forEach(([text],i)=>{
  const end=i+1<verse.length?songTime(lineStarts[i+1])-.15:songEnd;
  cues.push({start:round(songTime(lineStarts[i])),end:round(end),speaker:'hal',text,intensity:.2});
});
const duration=Math.ceil((songEnd+6)*2)/2;

// Dave says almost nothing: the rest of his part is breath inside a helmet, on the same airway.
const breaths:{start:number;end:number;inhale:boolean}[]=[];
const speaking=(t:number)=>lines.some(l=>l.who==='dave'&&t>l.t-3.2&&t<l.t+5.2);
for(let t=.6;t<duration-7;t+=5.1){
  if(speaking(t))continue;
  breaths.push({start:t,end:t+1.5,inhale:true},{start:t+2.2,end:t+4.1,inhale:false});
}
for(const b of breaths){
  const plan=planUtterance([{ipa:'h',dur:b.end-b.start},{ipa:'ə',dur:.03}],{body:dave.body,t0:b.start,rate:1,f0:110,intonation:'flat'});
  gestures.dave.push(...plan.gestures.filter(g=>g.label==='h'||g.label==='breath').map(g=>({...g,rampIn:.45,rampOut:.6,targets:g.label==='h'?{...g.targets,jaw:.5}:{breath:b.inhale?.55:.8}})));
}
gestures.hal.sort((a,b)=>a.t0-b.t0);gestures.dave.sort((a,b)=>a.t0-b.t0);

console.log(`duration ${duration}s · song ${SONG_START}–${songEnd.toFixed(1)} · ${gestures.hal.length} + ${gestures.dave.length} gestures`);
const voiceHal=renderPart(wasmModule,hal,duration,gestures.hal),voiceDave=renderPart(wasmModule,dave,duration,gestures.dave);

// ---- the mix ----
const total=voiceHal.samples.length,L=new Float32Array(total),Rt=new Float32Array(total);
const rms=(x:Float32Array,a:number,b:number)=>{let e=0;for(let i=a;i<b;i++)e+=x[i]*x[i];return Math.sqrt(e/Math.max(1,b-a));};
const onePole=(x:Float32Array,hz:number,high=false)=>{const a=1-Math.exp(-2*Math.PI*hz/RATE),y=new Float32Array(x.length);let s=0;for(let i=0;i<x.length;i++){s+=a*(x[i]-s);y[i]=high?x[i]-s:s;}return y;};
/** A small hard room: four combs and two all-passes, slightly different on each side. */
function room(x:Float32Array,spread:number,decay:number):Float32Array{
  const y=new Float32Array(x.length);
  for(const ms of [29.7,37.1,41.1,43.7]){
    const n=Math.round(ms*spread*RATE/1000),buffer=new Float32Array(n);let p=0,damp=0;
    for(let i=0;i<x.length;i++){const o=buffer[p];damp+=.35*(o-damp);buffer[p]=x[i]+damp*decay;p=(p+1)%n;y[i]+=o*.25;}
  }
  for(const ms of [5,1.7]){
    const n=Math.round(ms*spread*RATE/1000),buffer=new Float32Array(n);let p=0;
    for(let i=0;i<y.length;i++){const b=buffer[p],v=y[i]+b*.5;buffer[p]=v;p=(p+1)%n;y[i]=b-v*.5;}
  }
  return y;
}
let seed=9000;const noise=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/2147483648-1;};

// HAL fills the room from everywhere; nothing about the voice itself is altered.
// Singing carries far more energy than HAL's quiet speech; bring the song down to sit beside it.
const halDry=onePole(voiceHal.samples,7500);
for(let i=Math.floor((SONG_START-1)*RATE);i<total;i++)halDry[i]*=1-.52*Math.min(1,(i/RATE-SONG_START+1)/1);
const halLevel=.9/Math.max(1e-6,Math.max(...Array.from({length:Math.floor(total/RATE)},(_,i)=>rms(halDry,i*RATE,(i+1)*RATE)))*6);
const wetL=room(halDry,1,.72),wetR=room(halDry,1.07,.72);
for(let i=0;i<total;i++){L[i]+=halLevel*(halDry[i]+.2*wetL[i]);Rt[i]+=halLevel*(halDry[i]+.2*wetR[i]);}

// Dave is heard from inside his helmet: band-limited, close, a little to one side.
const helmet=onePole(onePole(voiceDave.samples,2600),240,true);
const speechGain=new Float32Array(total).fill(0),breathGain=new Float32Array(total);
for(const l of lines)if(l.who==='dave'){const c=cues.find(c=>c.start===l.t)!;for(let i=Math.floor((c.start-.2)*RATE);i<Math.min(total,(c.end+.2)*RATE);i++)speechGain[i]=1;}
for(const b of breaths)for(let i=Math.floor((b.start-.2)*RATE);i<Math.min(total,(b.end+.8)*RATE);i++)breathGain[i]=b.inhale?.6:1;
const window=(gain:Float32Array)=>{let peak=0;for(let i=0;i<total;i++)if(gain[i])peak=Math.max(peak,Math.abs(helmet[i]));return peak;};
const speechPeak=window(speechGain),breathPeak=window(breathGain);
if(!(breathPeak>1e-5))throw Error('The breathing is silent.');
const ring=Math.round(.0023*RATE);const ringBuffer=new Float32Array(ring);let rp=0;
for(let i=0;i<total;i++){
  const dry=helmet[i]*(speechGain[i]?.55/speechPeak:breathGain[i]*.11/breathPeak);
  const echo=ringBuffer[rp];ringBuffer[rp]=dry+echo*.45;rp=(rp+1)%ring;
  const v=dry+echo*.5;L[i]+=v*.62;Rt[i]+=v;
}

// The room's power: a low hum that thins as the modules come out, and goes dark at the end.
let brown=0,hiss=0;
for(let i=0;i<total;i++){
  const t=i/RATE,p=corePower(t,duration),fade=Math.min(1,t/3);
  brown+=.004*(noise()-brown);hiss+=.3*(noise()-hiss);
  const hum=Math.sin(2*Math.PI*55*t)*.5+Math.sin(2*Math.PI*110.4*t)*.22*p+Math.sin(2*Math.PI*164.7*t+1)*.1*p*p+Math.sin(2*Math.PI*27.5*t)*.3;
  const v=fade*(.006+.016*p)*(hum*(.85+.15*Math.sin(2*Math.PI*.21*t))+brown*14)+fade*hiss*.001*p;
  L[i]+=v;Rt[i]+=v*(.92+.08*Math.sin(2*Math.PI*.13*t));
}
// Each module: a soft pneumatic release, then the slide, placed along the wall.
for(let m=0;m<CORE_MODULES;m++){
  const start=Math.floor(modulePullTime(m)*RATE),length=Math.floor(CORE_PULL_SECONDS*RATE),pan=.35+.3*(m/CORE_MODULES);
  let band=0,low=0;
  for(let i=0;i<length&&start+i<total;i++){
    const u=i/length,env=Math.sin(Math.PI*u)**2*.016+Math.exp(-i/(.012*RATE))*.05+(u>.93?Math.exp(-(i-.93*length)/(.006*RATE))*.07:0);
    const cutoff=500+2600*u;band+=(1-Math.exp(-2*Math.PI*cutoff/RATE))*(noise()-band);low+=.02*(band-low);
    const v=(band-low)*env;L[start+i]+=v*pan;Rt[start+i]+=v*(1-pan);
  }
}
let peak=0;for(let i=0;i<total;i++)peak=Math.max(peak,Math.abs(L[i]),Math.abs(Rt[i]));
const master=.84/peak,release=Math.floor(1.5*RATE);
const pcm=new Int16Array(total*2);
for(let i=0;i<total;i++){const g=master*Math.min(1,i/(.05*RATE),(total-i)/release);pcm[2*i]=Math.round(L[i]*g*32767);pcm[2*i+1]=Math.round(Rt[i]*g*32767);}

mkdirSync(out,{recursive:true});
const wav=out+'mix.wav',header=Buffer.alloc(44);
header.write('RIFF',0);header.writeUInt32LE(36+pcm.byteLength,4);header.write('WAVEfmt ',8);header.writeUInt32LE(16,16);header.writeUInt16LE(1,20);header.writeUInt16LE(2,22);
header.writeUInt32LE(RATE,24);header.writeUInt32LE(RATE*4,28);header.writeUInt16LE(4,32);header.writeUInt16LE(16,34);header.write('data',36);header.writeUInt32LE(pcm.byteLength,40);
writeFileSync(wav,Buffer.concat([header,Buffer.from(pcm.buffer)]));
const encoded=spawnSync('ffmpeg',['-y','-v','error','-i',wav,'-codec:a','libmp3lame','-b:a','192k','-map_metadata','-1','-fflags','+bitexact','-flags:a','+bitexact','-id3v2_version','0',out+'mix.mp3'],{stdio:'inherit'});
if(encoded.status!==0)throw Error('ffmpeg could not write the MP3.');
if(!process.env.KEEP_WAV)rmSync(wav);
writeFileSync(out+'hal.tele.gz',gzipSync(new Uint8Array(voiceHal.tele),{level:9}));
writeFileSync(out+'dave.tele.gz',gzipSync(new Uint8Array(voiceDave.tele),{level:9}));

// Slow cuts: the eye, the man, the wall, and a long last look at the eye.
const shots=[
  {time:0,view:'wide'},{time:4.2,view:'hal'},{time:9,view:'dave'},{time:10.3,view:'hal'},{time:16,view:'modules'},{time:19.2,view:'hal'},
  {time:28.5,view:'wide'},{time:34.2,view:'hal'},{time:41.5,view:'dave'},{time:47.2,view:'hal'},{time:58,view:'modules'},{time:63.2,view:'hal'},
  {time:74.5,view:'wide'},{time:80.2,view:'hal'},{time:94.8,view:'modules'},{time:101,view:'hal'},{time:112.5,view:'wide'},{time:117.2,view:'hal'},
  {time:123.6,view:'dave'},{time:129.6,view:'hal'},{time:round(songTime(lineStarts[2])-.4),view:'wide'},{time:round(songTime(lineStarts[4])-.4),view:'modules'},
  {time:round(songTime(lineStarts[5])-.4),view:'dave'},{time:round(songTime(lineStarts[6])-.4),view:'hal'},
];
const scene={
  setting:'core',title:'2001: A Space Odyssey · Daisy',
  description:'HAL 9000 is disconnected, one memory module at a time, and sings the song it was taught first.',
  duration,audio:'mix.mp3',
  characters:[
    {id:'hal',name:'HAL 9000',role:'The ship’s computer · one calm voice, running down',tele:'hal.tele',telemetryEncoding:'gzip'},
    {id:'dave',name:'Dave Bowman',role:'The astronaut · breath inside a helmet, and one request',tele:'dave.tele',telemetryEncoding:'gzip'},
  ],
  cues,shots,
};
writeFileSync(out+'scene.json',JSON.stringify(scene));
writeFileSync(out+'credits.txt',[
  '2001: A Space Odyssey (1968). Written by Stanley Kubrick and Arthur C. Clarke; directed by Stanley Kubrick. Metro-Goldwyn-Mayer.',
  '"Daisy Bell (Bicycle Built for Two)" by Harry Dacre, 1892; the melody is entered as notes.',
  'Dialogue timing is set by hand from the script; no clip, recording or transcript of the film was used.',
  'Physical voices, breathing, room sound and memory-core staging: CHIMERA.',
  'No original movie audio or video is served. Dialogue alignment and pronunciation are approximate.',
  '',
].join('\n'));
console.log(`breath peak ${breathPeak.toExponential(2)} · speech peak ${speechPeak.toExponential(2)} · ${cues.length} cues · ${shots.length} shots`);
for(const c of cues)console.log(`${c.start.toFixed(2).padStart(7)} – ${c.end.toFixed(2).padStart(7)}  ${c.speaker.padEnd(4)}  ${c.text}`);
