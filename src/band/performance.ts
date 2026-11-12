import type {VocalPerformance} from './types.ts';

// Ten minutes of a 150 BPM vocal loop needs up to 1,500 separate breath attacks.
export function validPerformance(p:VocalPerformance,duration:number):boolean{
  if(!Number.isFinite(duration)||duration<=0||!p||typeof p.lyrics!=='string'||!Array.isArray(p.phrases)||!p.phrases.length||p.phrases.length>1600||!Array.isArray(p.contour)||p.contour.length<2||p.contour.length>7000)return false;
  let end=0,count=0;
  for(const phrase of p.phrases){
    if(!phrase||!Number.isFinite(phrase.start)||phrase.start<end-1e-6||!Array.isArray(phrase.phones)||!phrase.phones.length)return false;
    end=phrase.start;
    for(const phone of phrase.phones){
      if(!phone||typeof phone.ipa!=='string'||phone.ipa.length<1||phone.ipa.length>12||!Number.isFinite(phone.duration)||phone.duration<.009||phone.duration>10||(['nasalized','palatalized'] as const).some(k=>phone[k]!==undefined&&typeof phone[k]!=='boolean'))return false;
      // Full rap verses exceed 1800 phones; keep a bounded input size.
      end+=phone.duration;if(++count>6000)return false;
    }
    if(end>duration)return false;
  }
  let time=-1;
  for(const c of p.contour){
    if(!c||!Number.isFinite(c.time)||c.time<=time||c.time<0||c.time>duration||!Number.isFinite(c.hz)||c.hz<40||c.hz>1200||!Number.isFinite(c.breath)||c.breath<0||c.breath>1.2)return false;
    time=c.time;
  }
  for(const phrase of p.phrases){
    const end=phrase.start+phrase.phones.reduce((s,p)=>s+p.duration,0);
    const points=p.contour.filter(c=>c.time>=phrase.start-1e-6&&c.time<end);
    if(!points.length||Math.abs(points[0].time-phrase.start)>1e-6||end-points.at(-1)!.time>.101)return false;
    if(points.some((c,i)=>i>0&&c.time-points[i-1].time>.101))return false;
  }
  return true;
}
