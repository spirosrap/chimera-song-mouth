/** A single voice, with rests represented by gaps between notes (seconds). */
export interface MelodyNote { midi: number; start: number; duration: number; lyricIndex?: number; hold?: boolean }
export interface Melody {
  name: string;
  notes: MelodyNote[];
  duration: number;
  lyrics: string;
  source: string;
  percussion?: boolean;
}

function tune(name: string, pitches: number[], beats: number[], bpm: number, lyrics: string): Melody {
  let time = 0;
  const notes = pitches.map((midi, i) => {
    const duration = beats[i % beats.length] * 60 / bpm;
    const note = { midi, start: time, duration };
    time += duration;
    return note;
  });
  return { name, notes, duration: time, lyrics, source: "Traditional melody · arranged for one voice" };
}

// Public-domain melodies, entered as notes; no commercial recordings are bundled.
export const SONGS: Melody[] = [
  tune("Ode to Joy", [64,64,65,67,67,65,64,62,60,60,62,64,64,62,62, 64,64,65,67,67,65,64,62,60,60,62,64,62,60,60],
    [1,1,1,1,1,1,1,1,1,1,1,1,1.5,.5,2], 112, ""),
  tune("Twinkle, Twinkle, Little Star", [60,60,67,67,69,69,67,65,65,64,64,62,62,60,67,67,65,65,64,64,62,67,67,65,65,64,64,62,60,60,67,67,69,69,67,65,65,64,64,62,62,60],
    [1,1,1,1,1,1,2], 108, "Twinkle twinkle little star, how I wonder what you are. Up above the world so high, like a diamond in the sky. Twinkle twinkle little star, how I wonder what you are."),
  tune("Frère Jacques", [60,62,64,60,60,62,64,60,64,65,67,64,65,67,67,69,67,65,64,60,67,69,67,65,64,60,60,55,60,60,55,60],
    [1], 120, "Are you sleeping, are you sleeping, brother John, brother John? Morning bells are ringing, morning bells are ringing. Ding ding dong, ding ding dong."),
];

/** Flatten a polyphonic part into its highest sounding line, preserving gaps. */
export function monophonic(notes: MelodyNote[]): MelodyNote[] {
  const valid = notes.filter(n => Number.isFinite(n.midi) && Number.isFinite(n.start) && Number.isFinite(n.duration)
    && n.midi >= 0 && n.midi <= 127 && n.start >= 0 && n.duration > 0);
  const points = [...new Set(valid.flatMap(n => [n.start, n.start + n.duration]))].sort((a,b) => a-b);
  const result: MelodyNote[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i], b = points[i+1];
    const active = valid.filter(n => n.start <= a + 1e-7 && n.start + n.duration > a + 1e-7);
    if (!active.length) continue;
    const midi = Math.max(...active.map(n => n.midi));
    const last = result.at(-1);
    // Merge only when the same source note crosses this boundary, retaining repeated attacks.
    if (last && last.midi === midi && Math.abs(last.start + last.duration - a) < 1e-6
        && active.some(n => n.midi === midi && n.start < a - 1e-7)) last.duration = b - last.start;
    else result.push({ midi, start: a, duration: b-a });
  }
  return result.filter(n => n.duration >= .055);
}

export function formatTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;
}
