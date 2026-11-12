import type {LyricVideoSpec, TimedLyricWord} from './types.ts';

/** Times are absolute audio seconds, shared with the physical performance. */
export function validLyricVideo(spec:LyricVideoSpec|undefined,duration:number):boolean{
  if(!spec||typeof spec.background!=='string'||!/^[a-z0-9-]+\.(png|jpg|webp)$/.test(spec.background)||!Array.isArray(spec.words)||!spec.words.length||spec.words.length>2500)return false;
  let end=0,line=0;
  for(const w of spec.words){
    if(!w||typeof w.text!=='string'||!w.text.trim()||w.text.length>60||!Number.isFinite(w.start)||!Number.isFinite(w.end)||w.start<end-1e-5||w.end<=w.start||w.end>duration||!Number.isInteger(w.line)||w.line<line||w.line>line+1)return false;
    end=w.end;line=w.line;
  }
  return spec.words[0].line===0;
}
export interface LyricLine {start:number;end:number;words:TimedLyricWord[]}
export function lyricLines(words:TimedLyricWord[]):LyricLine[]{
  const lines:LyricLine[]=[];
  for(const w of words){
    const prev=lines.at(-1);
    if(!prev||prev.words[0].line!==w.line)lines.push({start:w.start,end:w.end,words:[w]});
    else{prev.words.push(w);prev.end=w.end;}
  }
  return lines;
}
/** Binary search makes rapid seeking independent of the previous animation frame. */
export function lyricAt(lines:LyricLine[],time:number):{line:LyricLine|null;active:number}{
  let lo=0,hi=lines.length;
  while(lo<hi){const mid=(lo+hi)>>>1;if(lines[mid].start-.12<=time)lo=mid+1;else hi=mid;}
  let line=lines[lo-1];
  if(line?.start>time&&lo>1&&lines[lo-2].end>time)line=lines[lo-2];
  if(!line||time>line.end+.35)return {line:null,active:-1};
  return {line,active:line.words.findIndex(w=>time>=w.start&&time<w.end)};
}
export interface LyricPlacement {text:string;index:number;x:number;y:number;width:number}
/** A two-line central band stays above the circular mouth, at every canvas size. */
export function lyricLayout(words:TimedLyricWord[],w:number,h:number,measure:(text:string,size:number)=>number){
  const margin=w*.055,maxWidth=w-margin*2;
  let font=Math.min(52,Math.max(15,w*.035)),rows:{text:string;index:number;width:number}[][]=[];
  for(;;){
    rows=[[]];let used=0;const gap=measure(' ',font);
    words.forEach((word,index)=>{const width=measure(word.text,font);if(used&&used+gap+width>maxWidth){rows.push([]);used=0;}rows.at(-1)!.push({text:word.text,index,width});used+=width+(used?gap:0);});
    if((rows.length<=2&&rows.every(r=>r.every(x=>x.width<=maxWidth)))||font<=8)break;
    font-=1;
  }
  const gap=measure(' ',font),height=font*1.4,placed:LyricPlacement[]=[];
  rows.forEach((row,r)=>{const width=row.reduce((n,x)=>n+x.width,0)+gap*(row.length-1);let x=(w-width)/2;
    for(const word of row){placed.push({...word,x,y:h*.40+(r-(rows.length-1)/2)*height});x+=word.width+gap;}
  });
  const diameter=Math.min(h*.37,w*.26);
  return {font,words:placed,mouth:{x:w*.025,y:h-diameter-h*.025,size:diameter}};
}
