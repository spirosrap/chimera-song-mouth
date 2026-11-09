import { monophonic, type Melody } from "./melody.ts";

/** Read standard MIDI files (type 0/1, PPQ). Tempo changes apply across tracks. */
export function readMidi(buffer: ArrayBuffer, filename: string, preserveVoices=false): Melody[] {
  const data = new DataView(buffer);
  let p = 0;
  const need = (n: number) => { if (p+n > data.byteLength) throw new Error("This MIDI file is incomplete."); };
  const byte = () => { need(1); return data.getUint8(p++); };
  const u16 = () => byte()*256+byte();
  const u32 = () => (byte()*0x1000000 + byte()*65536 + byte()*256 + byte());
  const tag = () => String.fromCharCode(byte(),byte(),byte(),byte());
  const variable = () => {
    let v=0;
    for (let i=0;i<4;i++) { const b=byte(); v=v*128+(b&127); if (!(b&128)) return v; }
    throw new Error("Invalid MIDI event length.");
  };
  if (tag() !== "MThd") throw new Error("Choose a standard .mid or .midi file.");
  const header = u32();
  if (header < 6) throw new Error("Invalid MIDI header.");
  const format=u16(), tracks=u16(), division=u16();
  if (format > 1 || division & 0x8000 || division === 0) throw new Error("Use a type 0 or 1 MIDI file with musical beat timing.");
  need(header-6); p+=header-6;
  if (tracks > 256) throw new Error("This MIDI has too many tracks.");
  const tempos = [{ tick:0, us:500000 }];
  const parts: { name:string; channel:number; notes:{midi:number;start:number;end:number}[] }[] = [];
  let eventCount=0;
  for (let track=0;track<tracks;track++) {
    if (tag() !== "MTrk") throw new Error("Invalid MIDI track.");
    const length=u32(); need(length); const end=p+length;
    let tick=0, running=0, name=`Track ${track+1}`;
    const groups = new Map<number, typeof parts[number]>();
    const held = new Map<string,number[]>();
    while (p<end) {
      if (++eventCount > 200000) throw new Error("This MIDI file has too many events.");
      tick+=variable(); let status=byte();
      if (status<128) { p--; status=running; }
      if (status<128) throw new Error("Invalid MIDI running status.");
      if (status===0xff) {
        const type=byte(), len=variable(); need(len);
        if (p+len>end) throw new Error("Invalid MIDI meta event.");
        if (type===0x51 && len===3) {
          const us=data.getUint8(p)*65536+data.getUint8(p+1)*256+data.getUint8(p+2);
          if (us>0) tempos.push({tick,us});
        }
        if (type===3) name=new TextDecoder().decode(new Uint8Array(buffer,p,len)).trim() || name;
        p+=len;
        if (type===0x2f) break;
        continue;
      }
      if (status===0xf0 || status===0xf7) { running=0; const len=variable(); need(len); p+=len; continue; }
      if (status>=0xf0) throw new Error("Unsupported MIDI system event.");
      running=status;
      const kind=status>>4, channel=status&15, a=byte(), b=(kind===12||kind===13)?0:byte();
      if (a>127 || b>127) throw new Error("Invalid MIDI note data.");
      if (channel===9) {
        if(preserveVoices&&kind===9&&b>0){
          if(!groups.has(channel))groups.set(channel,{name,channel,notes:[]});
          groups.get(channel)!.notes.push({midi:a,start:tick,end:tick+division*.2});
        }
        continue;
      }
      const key=`${channel}:${a}`;
      if (kind===9 && b>0) {
        held.set(key,[...(held.get(key)??[]),tick]);
      } else if (kind===8 || (kind===9 && b===0)) {
        const queue=held.get(key); const start=queue?.shift();
        if (start!==undefined && tick>start) {
          if (!groups.has(channel)) groups.set(channel,{name,channel,notes:[]});
          groups.get(channel)!.notes.push({midi:a,start,end:tick});
        }
      }
      if (p>end) throw new Error("Invalid MIDI track length.");
    }
    for (const [key,starts] of held) {
      const [channel,midi]=key.split(":").map(Number);
      if (!groups.has(channel)) groups.set(channel,{name,channel,notes:[]});
      for (const start of starts) if(tick>start) groups.get(channel)!.notes.push({midi,start,end:tick});
    }
    for(const group of groups.values()) { group.name=name; parts.push(group); }
    p=end;
  }
  tempos.sort((a,b)=>a.tick-b.tick);
  const timeline:{tick:number;us:number;seconds:number}[]=[];
  let prev=0, seconds=0, us=500000;
  for (const change of tempos) {
    seconds+=(change.tick-prev)*us/1e6/division;
    timeline.push({...change,seconds}); prev=change.tick; us=change.us;
  }
  const at = (tick:number) => {
    let lo=0,hi=timeline.length;
    while(lo+1<hi){const m=(lo+hi)>>1;if(timeline[m].tick<=tick)lo=m;else hi=m;}
    const t=timeline[lo]; return t.seconds+(tick-t.tick)*t.us/1e6/division;
  };
  if(parts.some(p=>p.notes.length>(preserveVoices?16000:2000)))throw new Error("This MIDI part has too many notes. Choose a shorter excerpt.");
  const result=parts.filter(p=>p.notes.length).flatMap(part=>{
    const raw=part.notes.map(n=>({midi:n.midi,start:at(n.start),duration:at(n.end)-at(n.start)}));
    const lanes=preserveVoices?(part.channel===9?[raw]:splitVoices(raw)):[monophonic(raw)];
    return lanes.map((notes,i)=>({name:`${filename} · ${part.name} / Ch ${part.channel+1}${lanes.length>1?` / Voice ${i+1}`:""}`,notes,
      duration:notes.reduce((end,n)=>Math.max(end,n.start+n.duration),0),lyrics:"",
      percussion:part.channel===9,
      source:part.channel===9?"MIDI drums → mouth percussion":preserveVoices?"MIDI part · original overlapping notes retained":"MIDI melody · highest note when chords overlap"}));
  }).filter(s=>s.notes.length);
  if(!result.length)throw new Error("No pitched notes found. Drum-only MIDI cannot be sung.");
  if(result.length>64)throw new Error("This MIDI needs more than 64 separate voices. Choose a simpler arrangement.");
  if(result.some(s=>s.duration>(preserveVoices?300:180) || s.notes.length>2000))throw new Error(`Choose a MIDI excerpt under ${preserveVoices?5:3} minutes and 2,000 notes per voice.`);
  return result;
}

/** Assign every overlapping note its own mouth. Repeated attacks remain separate notes. */
export function splitVoices(notes:import("./melody.ts").MelodyNote[]):import("./melody.ts").MelodyNote[][]{
  const lanes:import("./melody.ts").MelodyNote[][]=[];
  for(const note of [...notes].sort((a,b)=>a.start-b.start||b.midi-a.midi)){
    const available=lanes.filter(l=>l.at(-1)!.start+l.at(-1)!.duration<=note.start+1e-6);
    available.sort((a,b)=>Math.abs(a.at(-1)!.midi-note.midi)-Math.abs(b.at(-1)!.midi-note.midi));
    if(available.length)available[0].push(note);else lanes.push([note]);
    if(lanes.length>64)throw new Error("This track needs more than 64 simultaneous voices.");
  }
  return lanes;
}
