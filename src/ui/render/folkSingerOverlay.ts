import {lyricsToSyllables} from '../../wasm/engine.ts';
import type {BandPart} from '../../band/types.ts';
import {whistleNotes} from '../../band/whistle.ts';
import {mouthWords,type MouthWord} from '../mouthWords.ts';
import {V} from '../colors.ts';
import type {OverlayFn} from '../components/AnatomyView.tsx';

/** Preserve complete Greek words while their syllables share the recorded note clock. */
export function singerCues(part:BandPart){
  const syllables=lyricsToSyllables(part.melody?.lyrics??'');
  const words:MouthWord[]=[],pending:number[]=[];let text='',key=0;
  syllables.forEach((s,i)=>{
    pending.push(i);text+=s.text;
    if(s.wordEnd||i===syllables.length-1){
      const word={key:key++,text};for(const index of pending)words[index]=word;
      pending.length=0;text='';
    }
  });
  const notes=part.melody?.notes??[];
  const whistles=part.delivery==='whistle'||part.whistleMelody&&part.delivery!=='sing'?whistleNotes(part):[];
  return {
    word(time:number):MouthWord|null{
      if(!words.length||part.delivery==='whistle')return null;
      const i=notes.findIndex(n=>time>=n.start+.35&&time<n.start+.35+n.duration);
      if(i<0)return null;
      const lyric=notes[i].lyricIndex??i,word=words[lyric%words.length];
      return word?{key:`${Math.floor(lyric/words.length)}:${word.key}`,text:word.text}:null;
    },
    whistling:(time:number)=>whistles.some(n=>time>=n.start&&time<n.end),
  };
}

/** Tiny curls of air and musical notes, placed in the space in front of the lips. */
export function drawWhistle(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,time:number){
  const room=Math.max(20,w-x-14),spread=Math.min(105,room),size=Math.min(1,room/105);
  ctx.save();ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=V.green;ctx.lineWidth=1.4;
  for(let i=0;i<2;i++){
    ctx.globalAlpha=.65;ctx.beginPath();ctx.moveTo(x+5,y-4-i*7);
    ctx.quadraticCurveTo(x+spread*.16,y-10-i*7,x+spread*.28,y-5-i*7);ctx.stroke();
  }
  for(let i=0;i<3;i++){
    const phase=(time*.85+i/3)%1,nx=x+spread*(.28+.63*phase),ny=y-16-44*phase;
    const s=(.8+.2*Math.sin(time*5+i))*size;
    ctx.save();ctx.translate(nx,ny);ctx.scale(s,s);ctx.rotate(-.15+phase*.2);
    ctx.globalAlpha=Math.sin(Math.PI*phase)*.9;ctx.fillStyle=V.amber;ctx.strokeStyle=V.amber;ctx.lineWidth=1.6;
    ctx.beginPath();ctx.ellipse(0,0,4.5,3,-.35,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.moveTo(4,-1);ctx.lineTo(4,-18);ctx.quadraticCurveTo(15,-15,10,-7);ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

/** The same drifting-word overlay as the other mouths, reset on seeks and song changes. */
export function singerOverlay(part:BandPart){
  const cues=singerCues(part);let word:MouthWord|null=null,epoch=-1,lastTime:number|null=null;
  let words=mouthWords(()=>word,V.green);
  return (...args:[...Parameters<OverlayFn>,{time:number;epoch:number;audible:boolean}])=>{
    const [ctx,view,model,frame,artic,size,state]=args;
    const jump=epoch!==state.epoch||lastTime!==null&&Math.abs(state.time-lastTime)>.3;
    if(jump||!state.audible)words=mouthWords(()=>word,V.green);
    const dt=jump||lastTime===null?0:Math.max(0,state.time-lastTime);
    epoch=state.epoch;lastTime=state.time;
    const whistle=state.audible&&cues.whistling(state.time);
    word=state.audible&&!whistle?cues.word(state.time):null;
    words(ctx,view,model,frame,artic,{...size,dt});
    if(whistle){
      const lips=view.handles(model,frame,artic).find(h=>h.id==='lips');
      if(lips)drawWhistle(ctx,view.X(lips.pos),view.Y(lips.pos),size.w,state.time);
    }
  };
}
