/**
 * Renders the Wizard of Oz throne-room scene into public/scenes/wizard-of-oz/.
 *
 *   bun tools/render-oz-scene.ts            # needs ffmpeg for the MP3
 *   bun tools/render-oz-scene.ts --plan     # print the timeline only
 *
 * The words are L. Frank Baum's (The Wonderful Wizard of Oz, 1900, chapter XV; public domain), cut.
 * Every voice is a CHIMERA airway. The great Voice is the little man's own airway, enlarged: its
 * lines are rendered on a faster clock and played back slower, which lengthens every resonance and
 * lowers the pitch by the same factor, exactly as a proportionally larger throat would.
 */
import {readFileSync,writeFileSync,mkdirSync,rmSync} from 'node:fs';
import {gzipSync,gunzipSync} from 'node:zlib';
import {spawnSync} from 'node:child_process';
import {initEngine,wasmModule} from '../tests/harness.ts';
import type {Gesture} from '../src/wasm/types.ts';
import type {BandPart} from '../src/band/types.ts';
import {THRONE_ROAR,THRONE_CRASH,THRONE_AXE,THRONE_DEMO,thronePose,type ThroneSpeaker} from '../src/scene/throne.ts';

await initEngine();
const {EnglishG2P,planPhrases,planUtterance}=await import('../src/wasm/engine.ts');
const {renderPart,BAND_RATE,BAND_HOP}=await import('../src/band/render.ts');
const root=new URL('../',import.meta.url).pathname,out=root+'public/scenes/wizard-of-oz/';
const g2p=new EnglishG2P();g2p.setDictionaryText(gunzipSync(readFileSync(root+'public/data/cmudict.txt.gz')).toString());
const RATE=BAND_RATE,planOnly=process.argv.includes('--plan');

const part=(id:ThroneSpeaker,name:string,body:BandPart['body'],voice:BandPart['voice']):BandPart=>({id,name,role:'',body,volume:1,pan:0,vibrato:0,voice});
const parts:Record<ThroneSpeaker,BandPart>={
 oz:part('oz','Oz',{female:.3,child:.1},{breathiness:.38,tension:.5}),
 dorothy:part('dorothy','Dorothy',{female:.75,child:.55},{breathiness:.3,tension:.5}),
 scarecrow:part('scarecrow','The Scarecrow',{female:.2,child:0},{breathiness:.45,tension:.42}),
 'tin-woodman':part('tin-woodman','The Tin Woodman',{female:0,child:0},{breathiness:.12,tension:.72,brightness:.6}),
 lion:part('lion','The Cowardly Lion',{female:0,child:0},{breathiness:.36,tension:.46}),
};
const manner:Record<ThroneSpeaker,{f0:number;rate:number}>={oz:{f0:172,rate:1.02},dorothy:{f0:262,rate:.95},scarecrow:{f0:152,rate:.97},'tin-woodman':{f0:112,rate:.9},lion:{f0:94,rate:.84}};

/**
 * `size` is how many times larger than the man the Voice's throat is; `say` is what the dictionary
 * reads when the caption's spelling would be mispronounced; `gap` is the silence before the line.
 */
interface Line{who:ThroneSpeaker;text:string;say?:string;size?:number;f0?:number;rate?:number;gap?:number;intensity:number;mark?:'axe'|'demo'}
const GREAT={size:1.38,f0:66,rate:.7,intensity:.9},SHAKEN={size:1.22,f0:86,rate:.8,intensity:.6};
const before:Line[]=[
 {who:'oz',text:'I am Oz, the Great and Terrible. Why do you seek me?',...GREAT,gap:3.2},
 {who:'dorothy',text:'Where are you?',gap:1.3,intensity:.4},
 {who:'oz',text:'I am everywhere, but to the eyes of common mortals I am invisible.',...GREAT,gap:1},
 {who:'oz',text:'I will now seat myself upon my throne, that you may converse with me.',...GREAT,gap:.7},
 {who:'dorothy',text:'We have come to claim our promise, O Oz.',say:'We have come to claim our promise, oh Oz.',gap:1.2,intensity:.5},
 {who:'oz',text:'What promise?',...GREAT,gap:.8},
 {who:'dorothy',text:'You promised to send me back to Kansas when the Wicked Witch was destroyed.',gap:.7,intensity:.5},
 {who:'scarecrow',text:'And you promised to give me brains.',intensity:.5},
 {who:'tin-woodman',text:'And you promised to give me a heart.',intensity:.5},
 {who:'lion',text:'And you promised to give me courage.',intensity:.5},
 {who:'oz',text:'Is the Wicked Witch really destroyed?',...SHAKEN,gap:1.4},
 {who:'dorothy',text:'Yes. I melted her with a bucket of water.',gap:.6,intensity:.5},
 {who:'oz',text:'Dear me, how sudden!',...SHAKEN,gap:.9},
 {who:'oz',text:'Well, come to me tomorrow, for I must have time to think it over.',...SHAKEN,gap:.5},
 {who:'tin-woodman',text:'You’ve had plenty of time already.',f0:124,gap:.35,intensity:.75},
 {who:'scarecrow',text:'We shan’t wait a day longer.',say:'We shant wait a day longer.',gap:.3,intensity:.7},
 {who:'dorothy',text:'You must keep your promises to us!',f0:285,gap:.3,intensity:.8},
];
const after:Line[]=[
 {who:'tin-woodman',text:'Who are you?',f0:128,intensity:.85,mark:'axe'},
 {who:'oz',text:'I am Oz, the Great and Terrible.',f0:186,rate:.92,gap:1.1,intensity:.3},
 {who:'oz',text:'But don’t strike me, please don’t, and I’ll do anything you want me to.',f0:192,rate:1.12,gap:.5,intensity:.35},
 {who:'dorothy',text:'I thought Oz was a great Head.',gap:1.3,intensity:.45},
 {who:'scarecrow',text:'And I thought Oz was a lovely Lady.',intensity:.45},
 {who:'tin-woodman',text:'And I thought Oz was a terrible Beast.',intensity:.45},
 {who:'lion',text:'And I thought Oz was a Ball of Fire.',intensity:.5},
 {who:'oz',text:'No, you are all wrong. I have been making believe.',gap:.7,intensity:.3},
 {who:'dorothy',text:'Making believe! Are you not a Great Wizard?',f0:280,intensity:.7},
 {who:'oz',text:'Hush, my dear. Don’t speak so loud, or you will be overheard, and I should be ruined.',f0:160,gap:.4,intensity:.25},
 {who:'oz',text:'I’m supposed to be a Great Wizard.',f0:160,gap:.5,intensity:.25},
 {who:'dorothy',text:'And aren’t you?',rate:.85,intensity:.5},
 {who:'oz',text:'Not a bit of it, my dear. I’m just a common man.',intensity:.3},
 {who:'scarecrow',text:'You’re more than that. You’re a humbug.',rate:.86,gap:.7,intensity:.55},
 {who:'oz',text:'Exactly so! I am a humbug.',rate:.92,intensity:.45},
 {who:'dorothy',text:'But I don’t understand. How was it that you appeared to me as a great Head?',gap:.9,intensity:.45},
 {who:'oz',text:'That was one of my tricks. This I hung from the ceiling by a wire.',gap:.6,intensity:.35},
 {who:'oz',text:'I stood behind the screen and pulled a thread, to make the eyes move and the mouth open.',gap:.45,intensity:.35,mark:'demo'},
 {who:'dorothy',text:'But how about the voice?',gap:.9,intensity:.45},
 {who:'oz',text:'Oh, I am a ventriloquist.',say:'Oh, I am a ven trill uh quist.',gap:.5,intensity:.4},
 {who:'oz',text:'I can throw the sound of my voice wherever I wish, so that you thought it was coming out of the Head.',gap:.4,intensity:.4},
 {who:'dorothy',text:'I think you are a very bad man.',gap:1.2,intensity:.6},
 {who:'oz',text:'Oh, no, my dear. I’m really a very good man, but I’m a very bad Wizard, I must admit.',f0:164,rate:.94,gap:.8,intensity:.3},
];

const round=(v:number)=>Math.round(v*100)/100;
interface Placed extends Line{start:number;end:number}
/** Gestures per speaker on the scene clock; the Voice's are kept apart, on their own faster clocks. */
const gestures:Record<ThroneSpeaker,Gesture[]>={oz:[],dorothy:[],scarecrow:[],'tin-woodman':[],lion:[]};
const great=new Map<number,Gesture[]>(),placed:Placed[]=[];
function place(line:Line,at:number):Placed{
 const size=line.size??1,m=manner[line.who];
 const phrases=g2p.toPhrases((line.say??line.text).replaceAll('’',"'"));
 const plan=planPhrases(phrases,{body:parts[line.who].body,t0:at/size,f0:(line.f0??m.f0)*size,rate:(line.rate??m.rate)*size});
 if(size===1)gestures[line.who].push(...plan.gestures);else great.set(size,[...(great.get(size)??[]),...plan.gestures]);
 const p={...line,start:round(at),end:round(plan.end*size+.2)};placed.push(p);return p;
}
let at=0;
for(const line of before)at=place(line,at+(line.gap??.45)).end;
if(at>THRONE_ROAR-.35||at<THRONE_ROAR-1.6)throw Error(`The demands end at ${at}; THRONE_ROAR is ${THRONE_ROAR}. Set it to about ${round(at+.7)}.`);
// The Lion's roar is a voiced breath on his own airway; the growl is added in the mix.
const roar=planUtterance([{ipa:'ɹ',dur:.32},{ipa:'ɔ',dur:1.25},{ipa:'ɹ',dur:.3}],{body:parts.lion.body,t0:THRONE_ROAR,f0:118,rate:1,intonation:'statement'});
gestures.lion.push(...roar.gestures);
placed.push({who:'lion',text:'(The Lion gives a large, loud roar. Toto jumps, and tips over the screen in the corner.)',intensity:1,start:THRONE_ROAR,end:round(THRONE_CRASH+1.4)});
at=THRONE_AXE-.45;
for(const line of after){
 const p=place(line,at+(line.gap??.45));at=p.end;
 if(line.mark==='axe'&&Math.abs(p.start-THRONE_AXE)>.05)throw Error('The challenge has moved off THRONE_AXE.');
 if(line.mark==='demo'&&(Math.abs(p.start+1.6-THRONE_DEMO[0])>.4||Math.abs(p.end+1.2-THRONE_DEMO[1])>.4))throw Error(`The thread line runs ${p.start}–${p.end}; set THRONE_DEMO to [${round(p.start+1.6)},${round(p.end+1.2)}].`);
}
const duration=Math.ceil((at+4.5)*2)/2;
for(const g of Object.values(gestures))g.sort((a,b)=>a.t0-b.t0);
for(const p of placed)console.log(`${p.start.toFixed(2).padStart(7)} – ${p.end.toFixed(2).padStart(7)}  ${p.who.padEnd(11)} ${p.size?'×'+p.size:'     '}  ${p.text}`);
console.log(`duration ${duration}s · roar ${THRONE_ROAR} · crash ${THRONE_CRASH} · ${Object.entries(gestures).map(([k,g])=>`${k} ${g.length}`).join(' · ')}`);
if(planOnly)process.exit(0);

// ---- the voices ----
const total=Math.ceil(duration*RATE),hop=BAND_HOP/RATE;
const voices=Object.fromEntries((Object.keys(parts) as ThroneSpeaker[]).map(id=>[id,renderPart(wasmModule,parts[id],duration,gestures[id])])) as unknown as Record<ThroneSpeaker,{samples:Float32Array;tele:ArrayBuffer}>;
// The Voice: rendered small and fast, then slowed by `size`. Its telemetry is read back on the scene clock.
const greatAudio=new Float32Array(total),ozTele=new DataView(voices.oz.tele),width=ozTele.getUint32(20,true),ozFrames=new Float32Array(voices.oz.tele,48);
for(const [size,list] of great){
 list.sort((a,b)=>a.t0-b.t0);
 const span=Math.max(...list.map(g=>g.t1))+1.5,r=renderPart(wasmModule,parts.oz,span,list),from=new Float32Array(r.tele,48),frames=new DataView(r.tele).getUint32(16,true);
 for(const line of placed.filter(p=>p.size===size)){
  for(let i=Math.max(0,Math.floor((line.start-.3)*RATE));i<Math.min(total,(line.end+.4)*RATE);i++){
   const x=i/size,k=Math.floor(x),f=x-k;if(k+1<r.samples.length)greatAudio[i]+=r.samples[k]*(1-f)+r.samples[k+1]*f;
  }
  for(let j=Math.max(0,Math.floor((line.start-.3)/hop));j<=Math.min(ozTele.getUint32(16,true)-1,(line.end+.4)/hop);j++){
   const k=Math.min(frames-1,Math.round(j/size));ozFrames.set(from.subarray(k*width,(k+1)*width),j*width);
   ozFrames[j*width+3]/=size;ozFrames[j*width+10]=j*hop;
  }
 }
}
for(const [id,v] of Object.entries(voices))if(!v.samples.every(Number.isFinite)||!v.samples.some(x=>Math.abs(x)>.01))throw Error(`${id} is silent or unstable.`);
if(!greatAudio.some(x=>Math.abs(x)>.01))throw Error('The great Voice is silent.');

// ---- the mix ----
const L=new Float32Array(total),Rt=new Float32Array(total);
const onePole=(x:Float32Array,hz:number,high=false)=>{const a=1-Math.exp(-2*Math.PI*hz/RATE),y=new Float32Array(x.length);let s=0;for(let i=0;i<x.length;i++){s+=a*(x[i]-s);y[i]=high?x[i]-s:s;}return y;};
/** A stone hall: four combs and two all-passes, slightly different on each side. */
function hall(x:Float32Array,spread:number,decay:number):Float32Array{
 const y=new Float32Array(x.length);
 for(const ms of [29.7,37.1,41.1,43.7]){
  const n=Math.round(ms*spread*RATE/1000),buffer=new Float32Array(n);let p=0,damp=0;
  for(let i=0;i<x.length;i++){const o=buffer[p];damp+=.3*(o-damp);buffer[p]=x[i]+damp*decay;p=(p+1)%n;y[i]+=o*.25;}
 }
 for(const ms of [5,1.7]){
  const n=Math.round(ms*spread*RATE/1000),buffer=new Float32Array(n);let p=0;
  for(let i=0;i<y.length;i++){const b=buffer[p],v=y[i]+b*.5;buffer[p]=v;p=(p+1)%n;y[i]=b-v*.5;}
 }
 return y;
}
/** Speech level: the loud tenth of 50 ms blocks, so pauses do not count. */
const level=(x:Float32Array)=>{const blocks:number[]=[];for(let i=0;i+BAND_HOP<=x.length;i+=BAND_HOP){let e=0;for(let j=i;j<i+BAND_HOP;j++)e+=x[j]*x[j];blocks.push(Math.sqrt(e/BAND_HOP));}blocks.sort((a,b)=>b-a);const top=blocks.slice(0,Math.max(1,Math.floor(blocks.filter(b=>b>1e-4).length/10)));return top.reduce((s,v)=>s+v,0)/top.length;};
const add=(x:Float32Array,gain:number,pan:number,wet:number,spread:number,decay:number)=>{
 const g=gain/Math.max(1e-6,level(x)),angle=(pan+1)*Math.PI/4,l=Math.cos(angle)*g,r=Math.sin(angle)*g,a=hall(x,spread,decay),b=hall(x,spread*1.07,decay);
 for(let i=0;i<total;i++){L[i]+=l*x[i]+g*wet*a[i];Rt[i]+=r*x[i]+g*wet*b[i];}
};
let seed=1900;const noise=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/2147483648-1;};

// The Voice fills the dome: full and close, with the hall answering behind it.
const body=onePole(greatAudio,140),voice=new Float32Array(total);
for(let i=0;i<total;i++)voice[i]=greatAudio[i]+.5*body[i];
add(voice,.19,0,.3,2.9,.84);
// The Lion's roar: his own breath, driven hard and shaken.
const lion=voices.lion.samples.slice(),a0=Math.floor((THRONE_ROAR-.1)*RATE),a1=Math.floor((THRONE_ROAR+2.2)*RATE);
{const peak=Math.max(1e-6,...lion.subarray(a0,a1).map(Math.abs));const low=onePole(lion.subarray(a0,a1) as Float32Array,900);for(let i=a0;i<a1;i++){const t=(i-a0)/RATE;lion[i]=Math.tanh((lion[i]+low[i-a0])/peak*5*(.6+.4*Math.sin(2*Math.PI*31*t))+noise()*.05*Math.abs(lion[i])/peak)*peak*.55;}}
// The Tin Woodman rings a little: a short metal resonance on the voice itself.
const tin=voices['tin-woodman'].samples.slice();{const n=Math.round(.0021*RATE),buffer=new Float32Array(n);let p=0;for(let i=0;i<total;i++){const e=buffer[p];buffer[p]=tin[i]+e*.55;p=(p+1)%n;tin[i]+=e*.4;}}
add(voices.dorothy.samples,.15,-.2,.16,1.9,.8);
add(voices.scarecrow.samples,.15,-.5,.16,1.9,.8);
add(tin,.15,.15,.18,1.9,.8);
add(lion,.17,.42,.2,1.9,.8);
// The man himself: close, dry, off in the corner.
add(onePole(voices.oz.samples,60,true),.14,.6,.07,1.2,.7);

// The show's machinery: a low drone under the Voice that winds down when the screen lands.
let brown=0,phase=0;
for(let i=0;i<total;i++){
 const t=i/RATE,p=thronePose(t).power,fade=Math.min(1,t/2.5);
 phase+=2*Math.PI*(41.2*(.45+.55*p))/RATE;brown+=.003*(noise()-brown);
 const drone=(Math.sin(phase)*.6+Math.sin(phase*1.5+.4)*.28+Math.sin(phase*2.01)*.14)*(.8+.2*Math.sin(2*Math.PI*.17*t));
 const v=fade*(.014*p*p*drone+brown*.05);
 L[i]+=v;Rt[i]+=v*(.9+.1*Math.sin(2*Math.PI*.11*t));
}
// The screen: a wooden clatter in the right-hand corner, then two smaller bounces.
const crash=new Float32Array(total);
for(const [delay,size] of [[0,1],[.17,.45],[.31,.25],[.52,.12]] as const){
 const start=Math.floor((THRONE_CRASH+delay)*RATE);let band=0,low=0;
 for(let i=0;i<.5*RATE&&start+i<total;i++){
  const t=i/RATE;band+=.35*(noise()-band);low+=.02*(band-low);
  crash[start+i]+=size*((band-low)*Math.exp(-t/.05)*.9+Math.sin(2*Math.PI*(74-30*t)*t)*Math.exp(-t/.11)*.8+Math.sin(2*Math.PI*410*t)*Math.exp(-t/.03)*.25);
 }
}
{const a=hall(crash,2.6,.84),b=hall(crash,2.8,.84);for(let i=0;i<total;i++){L[i]+=.2*crash[i]+.2*a[i];Rt[i]+=.34*crash[i]+.2*b[i];}}

let peak=0;for(let i=0;i<total;i++)peak=Math.max(peak,Math.abs(L[i]),Math.abs(Rt[i]));
const master=.86/peak,release=Math.floor(1.5*RATE),pcm=new Int16Array(total*2);
for(let i=0;i<total;i++){const g=master*Math.min(1,i/(.05*RATE),(total-i)/release);pcm[2*i]=Math.round(L[i]*g*32767);pcm[2*i+1]=Math.round(Rt[i]*g*32767);}
mkdirSync(out,{recursive:true});
const wav=out+'mix.wav',header=Buffer.alloc(44);
header.write('RIFF',0);header.writeUInt32LE(36+pcm.byteLength,4);header.write('WAVEfmt ',8);header.writeUInt32LE(16,16);header.writeUInt16LE(1,20);header.writeUInt16LE(2,22);
header.writeUInt32LE(RATE,24);header.writeUInt32LE(RATE*4,28);header.writeUInt16LE(4,32);header.writeUInt16LE(16,34);header.write('data',36);header.writeUInt32LE(pcm.byteLength,40);
writeFileSync(wav,Buffer.concat([header,Buffer.from(pcm.buffer)]));
const encoded=spawnSync('ffmpeg',['-y','-v','error','-i',wav,'-codec:a','libmp3lame','-b:a','192k','-map_metadata','-1','-fflags','+bitexact','-flags:a','+bitexact','-id3v2_version','0',out+'mix.mp3'],{stdio:'inherit'});
if(encoded.status!==0)throw Error('ffmpeg could not write the MP3.');
if(!process.env.KEEP_WAV)rmSync(wav);
for(const [id,v] of Object.entries(voices))writeFileSync(`${out}${id}.tele.gz`,gzipSync(new Uint8Array(v.tele),{level:9}));

// ---- captions and cameras ----
const cues=placed.map(p=>({start:p.start,end:p.end,speaker:p.who,text:p.text,intensity:p.intensity}));
cues.forEach((c,i)=>{const next=cues[i+1];if(next&&c.end>next.start)throw Error(`"${c.text}" runs to ${c.end}, into the next line at ${next.start}.`);});
// Each line is watched on its speaker; the Voice is watched on the Head, and the room is shown between.
const shots:{time:number;view:string}[]=[{time:0,view:'wide'}];
const cut=(time:number,view:string)=>{const last=shots.at(-1)!;if(last.view===view)return;if(time-last.time<.8)shots.pop();if(shots.at(-1)?.view!==view)shots.push({time:round(Math.max(0,time)),view});};
for(const [i,p] of placed.entries()){
 if(p.start===THRONE_ROAR){cut(THRONE_ROAR-.2,'lion');cut(THRONE_ROAR+1.3,'oz');continue;}
 if(i===3||p.mark==='axe'||i===placed.length-1)cut(p.start-.3,i===3?'wide':p.mark==='axe'?'tin-woodman':'oz');
 else if(p.mark==='demo'){cut(p.start-.3,'oz');cut(THRONE_DEMO[0]-.3,'throne-head');}
 else if(i>=14&&i<=16)cut(p.start-.3,'throne-row');
 else cut(p.start-.3,p.size?'throne-head':p.who);
}
cut(placed.at(-1)!.end+.6,'wide');
const scene={
 setting:'throne',title:'The Wonderful Wizard of Oz · The Discovery of Oz, the Terrible',
 description:'A great Voice fills the throne room, until a little dog tips over a screen.',
 duration,audio:'mix.mp3',
 characters:[
  {id:'oz',name:'Oz, the Great and Terrible',role:'A great Voice from the dome · then a little old man, in the same throat',tele:'oz.tele',telemetryEncoding:'gzip'},
  {id:'dorothy',name:'Dorothy',role:'A little girl from Kansas · the one who asks',tele:'dorothy.tele',telemetryEncoding:'gzip'},
  {id:'scarecrow',name:'The Scarecrow',role:'Stuffed with straw · a light, dry voice',tele:'scarecrow.tele',telemetryEncoding:'gzip'},
  {id:'tin-woodman',name:'The Tin Woodman',role:'Made of tin · a hard, ringing voice',tele:'tin-woodman.tele',telemetryEncoding:'gzip'},
  {id:'lion',name:'The Cowardly Lion',role:'A very large Lion · a low voice, and one roar',tele:'lion.tele',telemetryEncoding:'gzip'},
 ],
 cues,shots,
};
writeFileSync(out+'scene.json',JSON.stringify(scene));
writeFileSync(out+'credits.txt',[
 'The Wonderful Wizard of Oz by L. Frank Baum, 1900 (public domain). Chapter XV, "The Discovery of Oz, the Terrible", cut for length.',
 'The words are Baum\'s; the text is Project Gutenberg\'s edition (ebook 55). No film, recording or later adaptation was used.',
 'One liberty: the great Head from Dorothy\'s first visit hangs over the throne while the Voice speaks.',
 'Physical voices, the roar, the hall, the drone and the falling screen: CHIMERA. The great Voice is the little man\'s airway, enlarged.',
 'Timing and pronunciation are approximate.',
 '',
].join('\n'));
console.log(`${cues.length} cues · ${shots.length} shots · wrote ${out}`);
