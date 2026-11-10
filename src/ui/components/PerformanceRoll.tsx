import {useMemo} from 'react';
import type {BandPart} from '../../band/types.ts';
import type {BandMixer} from '../../band/mixer.ts';
import type {TeleTrack} from '../../show/tele.ts';
import {lyricsToSyllables} from '../../wasm/engine.ts';
import {noteAudioSpan,performanceRange,performanceWindow} from '../../band/roll.ts';
import {usePhosphor} from '../usePhosphor.ts';
import {beam,beamPts,label,seg,type Pt} from '../render/vector.ts';
import {TEXT,V} from '../colors.ts';
import {Screen} from './Screen.tsx';

/** Prepared sound and its recorded pitch share the playback clock, including seek and pause. */
export function PerformanceRoll({part,track,mixer,duration}:{part:BandPart;track:TeleTrack;mixer:BandMixer;duration:number}){
  const notes=part.melody?.notes??[];
  const syllables=useMemo(()=>lyricsToSyllables(part.melody?.lyrics??'').map(s=>s.text),[part.melody?.lyrics]);
  const range=useMemo(()=>performanceRange(notes),[notes]);
  const trace=useMemo(()=>Array.from({length:track.frames},(_,i)=>{
    const t=track.message(i).t;
    return {time:i/track.rate,midi:t.f0>20?69+12*Math.log2(t.f0/440):NaN,voiced:t.voicing>.3&&t.outRms>.001};
  }),[track]);
  const ref=usePhosphor(({ctx,w,h})=>{
    const clock=mixer.time(),left=36,right=w-10,top=25,bottom=h-38;
    if(right<=left||bottom<=top)return;
    const window=performanceWindow(clock,right-left,duration);
    const x=(t:number)=>left+(t-window.left)/window.span*(right-left);
    const y=(m:number)=>bottom-(m-range.low)/(range.high-range.low)*(bottom-top);
    const row=(bottom-top)/(range.high-range.low);
    for(let midi=Math.ceil(range.low);midi<=range.high;midi++){
      const cy=y(midi),c=((midi%12)+12)%12===0;
      seg(ctx,left,cy,right,cy,V.frame,1,{dash:c?[]:[1,5],alpha:c?.9:.45});
      if(c)label(ctx,`C${Math.floor(midi/12)-1}`,3,cy+3,{size:9,color:TEXT.secondary,ls:.1});
    }
    for(let t=Math.ceil(window.left);t<=Math.min(duration,window.right);t++){
      seg(ctx,x(t),top,x(t),bottom,V.frame,1,{alpha:.35});
      if(t%2===0)label(ctx,`${Math.floor(t/60)}:${String(t%60).padStart(2,'0')}`,x(t)+2,12,{size:9,color:TEXT.secondary,ls:.1});
    }
    ctx.save();ctx.beginPath();ctx.rect(left,top,right-left,bottom-top);ctx.clip();
    for(const [i,note] of notes.entries()){
      const n=noteAudioSpan(note);if(n.end<window.left||n.start>window.right)continue;
      const active=n.start<=clock&&clock<n.end,future=n.start>clock;
      const x0=x(n.start),x1=x(n.end),cy=y(note.midi),height=Math.max(5,row*.78);
      const box=new Path2D();box.rect(x0,cy-height/2,Math.max(2,x1-x0),height);
      if(active){ctx.fillStyle='rgba(86,238,151,.15)';ctx.fill(box);}
      beam(ctx,box,V.green,active?1.6:1.1,{alpha:active?1:future?.4:.65,hot:active});
      const word=syllables[(note.lyricIndex??i)%Math.max(1,syllables.length)];
      if(word&&!note.hold&&x1-x0>15)label(ctx,word.toUpperCase(),x0+2,cy-height/2-5,{size:10,color:active?V.white:TEXT.secondary,ls:.1,alpha:future?.55:1});
    }
    let run:Pt[]=[];
    const flush=()=>{if(run.length>1)beamPts(ctx,run,V.amber,1.6,{hot:true});run=[];};
    const first=Math.max(0,Math.floor(window.left*track.rate)),last=Math.min(trace.length-1,Math.floor(clock*track.rate));
    for(let i=first;i<=last;i++){
      const p=trace[i];if(!p.voiced||!Number.isFinite(p.midi)){flush();continue;}
      run.push([x(p.time),y(p.midi)]);
    }
    flush();
    seg(ctx,x(clock),top,x(clock),bottom,V.white,1,{dash:[3,4],alpha:.7});
    ctx.restore();
    seg(ctx,left,bottom+12,right,bottom+12,V.frame,1);
    const length=(right-left)*Math.min(1,clock/Math.max(1,duration));
    seg(ctx,left,bottom+12,left+length,bottom+12,V.blue,2,{alpha:.8});
    label(ctx,'GREEN · MELODY',left,h-6,{size:9,color:V.green,ls:.3});
    if(w>380)label(ctx,'YELLOW · SUNG PITCH',left+135,h-6,{size:9,color:V.amber,ls:.3});
  });
  return <Screen className="performance-roll" title="Sequencer" sub="Melody & sung pitch" label="Song melody and robotic vocal pitch"><canvas ref={ref} className="instrument-canvas" aria-label="Scrolling notes with lyric syllables and the robotic singer’s actual pitch"/></Screen>;
}
