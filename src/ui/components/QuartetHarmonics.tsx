import {useEffect,useRef} from 'react';
import type {BandPart} from '../../band/types.ts';
import type {BandMixer} from '../../band/mixer.ts';
import {PreparedSpectrum} from '../../band/spectrum.ts';
import {V} from '../colors.ts';

export function QuartetHarmonics({parts,buffers,mixer}:{parts:BandPart[];buffers:AudioBuffer[];mixer:BandMixer}){
  const canvas=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const el=canvas.current,ctx=el?.getContext('2d');if(!el||!ctx)return;
    const colors=[V.amber,V.blue,'#c2a4d8',V.green],fft=parts.map(()=>new PreparedSpectrum());
    const samples=buffers.map(b=>b.getChannelData(0));let raf=0,last=-Infinity,w=0;
    const height=parts.length*36+42;
    const resize=()=>{w=el.clientWidth;const dpr=Math.min(2,window.devicePixelRatio||1);el.width=Math.round(w*dpr);el.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);};
    const observer=new ResizeObserver(resize);observer.observe(el);resize();
    const draw=(now:number)=>{
      raf=requestAnimationFrame(draw);if(now-last<50||w<10)return;last=now;
      ctx.clearRect(0,0,w,height);const left=w<500?60:92,right=w-12,time=mixer.time();
      ctx.font='9px monospace';ctx.fillStyle=V.blue;ctx.fillText('HARMONICS',8,13);
      for(const hz of [500,1000,2000,3000,4000]){
        const x=left+hz/4000*(right-left);ctx.strokeStyle=V.frame;ctx.beginPath();ctx.moveTo(x,22);ctx.lineTo(x,height-20);ctx.stroke();
        ctx.fillStyle=V.blueMid;ctx.textAlign='center';ctx.fillText(hz>=1000?`${hz/1000}k`:String(hz),x,height-6);
      }
      parts.forEach((part,i)=>{
        const y=24+i*36,bins=fft[i].at(samples[i],buffers[i].sampleRate,time,mixer.audible(i)?part.volume:0);
        ctx.textAlign='left';ctx.fillStyle=colors[i%4];ctx.fillText(part.name.toUpperCase(),8,y+20);
        ctx.strokeStyle=colors[i%4];ctx.lineWidth=1.2;ctx.beginPath();
        for(let x=left;x<=right;x+=1.5){
          const hz=(x-left)/(right-left)*4000,k=Math.min(bins.length-1,Math.round(hz*fft[i].size/buffers[i].sampleRate));
          const level=Math.max(0,Math.min(1,(20*Math.log10(Math.max(1e-6,bins[k]))+66)/66));
          const py=y+28-level*26;if(x===left)ctx.moveTo(x,py);else ctx.lineTo(x,py);
        }ctx.stroke();
      });
    };raf=requestAnimationFrame(draw);
    return()=>{cancelAnimationFrame(raf);observer.disconnect();};
  },[parts,buffers,mixer]);
  return <div className="quartet-harmonics">
    <svg className="quartet-microphone" viewBox="0 0 70 145" aria-hidden="true" fill="none" stroke="currentColor">
      <rect x="19" y="5" width="32" height="64" rx="15" strokeWidth="1.6"/>
      {Array.from({length:10},(_,i)=><path key={i} d={`M25 ${15+i*4.5}H45`} opacity=".6"/>)}
      <path d="M12 42V57Q12 80 35 80Q58 80 58 57V42M35 80V131M30 80V131" strokeWidth="1.4"/>
      <ellipse cx="35" cy="134" rx="26" ry="6"/><path d="M29 129Q35 125 41 129"/>
    </svg>
    <canvas ref={canvas} role="img" aria-label={`Vocal spectra following the song: ${parts.map(p=>p.name).join(", ")}`} style={{height:parts.length*36+42}}/>
  </div>;
}
