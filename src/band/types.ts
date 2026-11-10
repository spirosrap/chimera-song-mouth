import type { Melody } from "../song/melody.ts";
import type { BodyMix } from "../wasm/types.ts";

export const MAX_BAND_VOICES = 24;

export interface BeatHit { time: number; id: string; accent?: number }
export interface SpokenLine { time: number; text: string }
/** Source-performance controls use absolute audio time, including consonant onsets. */
export interface VocalPerformance {
  lyrics: string;
  phrases: {start:number; phones:{ipa:string;duration:number}[]}[];
  contour: {time:number;hz:number;breath:number}[];
}
export interface VocalEffects {
  bpm: number;
  lowpassHz?: number;
  highpassHz?: number;
  delayBeats?: number;
  delayMix?: number;
  feedback?: number;
  pump?: number;
  drive?: number;
  automation?: { time: number; cutoffHz: number; level: number }[];
  fadeOut?: number;
}
export interface BandPart {
  id: string;
  kind?: "voice" | "backing" | "hand";
  snaps?: {time:number;accent:number}[];
  delivery?: "sing" | "whistle";
  telemetryEncoding?: "gzip";
  assetVersion?: string;
  name: string;
  role: string;
  body: BodyMix;
  volume: number;
  pan: number;
  melody?: Melody;
  performance?: VocalPerformance;
  /** Original recorded whistle passages, at their actual pitch and timestamps. */
  whistleMelody?: Melody;
  beats?: BeatHit[];
  speech?: SpokenLine[];
  vibrato?: number;
  voice?: { breathiness?: number; brightness?: number; tension?: number; voiced?: boolean; pressure?: number; drift?: number };
  effects?: VocalEffects;
}
export interface Arrangement {
  title: string;
  description: string;
  bpm: number;
  duration: number;
  parts: BandPart[];
  sections: {name: string; time: number}[];
  wordless?: boolean;
  /** Show scat syllables at the lips even when the song has no lyric text. */
  showSyllables?: boolean;
  presentation?: "quartet" | "backed-solo" | "ensemble" | "solo-roll";
  spotlights?: {time:number;partId:string}[];
  captions?: {time:number;end:number;text:string}[];
}
export interface RenderedPart { id: string; samples: Float32Array; tele: ArrayBuffer }

export const isVoicePart=(part:BandPart)=>part.kind===undefined||part.kind==="voice";
