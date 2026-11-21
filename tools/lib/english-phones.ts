/**
 * Shared CMUdict-backed English sung phonemizer for CHIMERA music scenes.
 * Always loads public/data/cmudict.txt.gz (never falls back silently to letter rules),
 * splits English diphthongs into timed monophthong pairs (matching runway/ratatata),
 * keeps consonants crisp, and weights vowel lengths by stress and syllable quality.
 */
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import type { VocalPerformance } from '../../src/band/types.ts';
import type { Syllable } from '../../src/wasm/types.ts';
import { EnglishG2P, lyricsToSyllables } from '../../src/wasm/engine.ts';

export type PhoneSpan = VocalPerformance['phrases'][number]['phones'][number];

const DIPHTHONG_GLIDES: Record<string, [string, string]> = {
  'aɪ': ['a', 'ɪ'],
  'aʊ': ['a', 'ʊ'],
  'eɪ': ['e', 'ɪ'],
  'oʊ': ['o', 'ʊ'],
  'ɔɪ': ['ɔ', 'ɪ'],
};

const STOPS = new Set(['p', 't', 'k', 'b', 'd', 'g', 'c', 'ɟ', 'ɾ']);
const AFFRICATES = new Set(['tʃ', 'dʒ', 'ts', 'dz']);
const FRICATIVES = new Set(['s', 'z', 'ʃ', 'ʒ', 'f', 'v', 'θ', 'ð']);

const REDUCED_VOWELS = new Set(['ə', 'ɚ']);
const LAX_VOWELS = new Set(['ɪ', 'ɛ', 'ʌ', 'ʊ']);

type SimpleSyl = { onset: string[]; nucleus: string; stress: number; coda: string[] };

const EXACT_WORD_OVERRIDES: Record<string, SimpleSyl[]> = {
  "'cause": [{ onset: ['k'], nucleus: 'ʌ', stress: 1, coda: ['z'] }],
  'cuz': [{ onset: ['k'], nucleus: 'ʌ', stress: 1, coda: ['z'] }],
  'ghosted': [
    { onset: ['g'], nucleus: 'oʊ', stress: 1, coda: ['s', 't'] },
    { onset: [], nucleus: 'ɪ', stress: 0, coda: ['d'] },
  ],
  'finna': [
    { onset: ['f'], nucleus: 'ɪ', stress: 1, coda: [] },
    { onset: ['n'], nucleus: 'ə', stress: 0, coda: [] },
  ],
  'nigga': [
    { onset: ['n'], nucleus: 'ɪ', stress: 1, coda: [] },
    { onset: ['g'], nucleus: 'ə', stress: 0, coda: [] },
  ],
  'niggas': [
    { onset: ['n'], nucleus: 'ɪ', stress: 1, coda: [] },
    { onset: ['g'], nucleus: 'ə', stress: 0, coda: ['z'] },
  ],
  'goin': [
    { onset: ['g'], nucleus: 'oʊ', stress: 1, coda: [] },
    { onset: [], nucleus: 'ɪ', stress: 0, coda: ['n'] },
  ],
  "goin'": [
    { onset: ['g'], nucleus: 'oʊ', stress: 1, coda: [] },
    { onset: [], nucleus: 'ɪ', stress: 0, coda: ['n'] },
  ],
  'gon': [{ onset: ['g'], nucleus: 'ɑ', stress: 1, coda: ['n'] }],
  "gon'": [{ onset: ['g'], nucleus: 'ɑ', stress: 1, coda: ['n'] }],
  'ooh': [{ onset: [], nucleus: 'u', stress: 1, coda: [] }],
  'whoa': [{ onset: ['w'], nucleus: 'oʊ', stress: 1, coda: [] }],
  'doo': [{ onset: ['d'], nucleus: 'u', stress: 1, coda: [] }],
  'ta': [{ onset: ['t'], nucleus: 'ɑ', stress: 1, coda: [] }],
};

const WORD_REWRITES: Record<string, string> = {
  '24': 'twenty four',
  'aint': "ain't",
  'cosign': 'co sign',
  'tiktok': 'tick tock',
  'shoulda': 'should of',
  'woulda': 'would of',
  'coulda': 'could of',
  'mofine': 'more fine',
  'tatata': 'ta ta ta',
  'tatatata': 'ta ta ta ta',
  'movin': 'moving',
  'takin': 'taking',
  'hatin': 'hating',
  'cutin': 'cutting',
  'gettin': 'getting',
  'feelin': 'feeling',
  'runnin': 'running',
  'doggin': 'dogging',
  'comin': 'coming',
  'makin': 'making',
  'shakin': 'shaking',
  'dancin': 'dancing',
  'livin': 'living',
  'givin': 'giving',
  'lovin': 'loving',
  'nothin': 'nothing',
  'somethin': 'something',
  'lookin': 'looking',
  'talkin': 'talking',
  'walkin': 'walking',
  'tryin': 'trying',
  'cryin': 'crying',
  'playin': 'playing',
  'sayin': 'saying',
  'stayin': 'staying',
  'mr': 'mister',
  'mrs': 'missus',
  'ms': 'miz',
  'dr': 'doctor',
  'dj': 'dee jay',
};

let dictWords: Set<string> | null = null;

/** Load public/data/cmudict.txt.gz into the WASM engine and verify dictionary lookup works. */
export function ensureEnglishDict(rootDir: string): void {
  if (dictWords) return;
  const gz = readFileSync(`${rootDir}/public/data/cmudict.txt.gz`);
  const text = gunzipSync(gz).toString('utf8');
  new EnglishG2P().setDictionaryText(text);
  dictWords = new Set(text.split('\n').map(l => l.split('\t')[0]?.toLowerCase() ?? '').filter(Boolean));
  // Sanity check that CMUdict is genuinely active (not letter-to-sound fallback).
  const check = lyricsToSyllables('one two three four', 'en').map(s => s.nucleus.ipa);
  if (check[0] !== 'ʌ' || check[1] !== 'u' || check[2] !== 'i' || check[3] !== 'ɔ') {
    throw new Error(`CMUdict verification failed! Got nuclei: ${check.join(', ')}`);
  }
}

function toSimpleSyllables(syls: Syllable[]): SimpleSyl[] {
  return syls.map(s => ({
    onset: s.onset.map(p => p.ipa),
    nucleus: s.nucleus.ipa,
    stress: s.nucleus.stress ?? 0,
    coda: s.coda.map(p => p.ipa),
  }));
}

/** Convert a single English word token into clean CMUdict syllables. */
export function wordToSyllables(rawToken: string): SimpleSyl[] {
  const normalized = rawToken
    .toLowerCase()
    .replace(/[’‘`]/g, "'")
    .replace(/^[^a-z0-9']+|[^a-z0-9']+$/g, '');
  if (!normalized) return [];

  // Exact override (including leading apostrophe like 'cause)
  if (EXACT_WORD_OVERRIDES[normalized]) return EXACT_WORD_OVERRIDES[normalized];
  const bare = normalized.replace(/^'+|'+$/g, '');
  if (!bare) return [];
  if (EXACT_WORD_OVERRIDES[bare]) return EXACT_WORD_OVERRIDES[bare];

  // Known rewrite (slang, contractions, abbreviations)
  const rewrite = WORD_REWRITES[bare];
  if (rewrite) {
    return rewrite.split(/\s+/).flatMap(w => wordToSyllables(w));
  }

  // Handle trailing -in' / -in slang if +g is in CMUdict
  if (dictWords && !dictWords.has(bare) && bare.endsWith('in') && bare.length > 3) {
    if (dictWords.has(bare + 'g')) {
      return toSimpleSyllables(lyricsToSyllables(bare + 'g', 'en'));
    }
  }

  return toSimpleSyllables(lyricsToSyllables(bare, 'en'));
}

/** Convert an English lyric line into clean CMUdict syllables. */
export function textToSyllables(text: string): SimpleSyl[] {
  const cleaned = text
    .replace(/[’‘`]/g, "'")
    .replace(/[—–\-/]/g, ' ')
    .replace(/[^A-Za-z0-9' ]+/g, ' ')
    .trim();
  if (!cleaned) return [];
  return cleaned.split(/\s+/).flatMap(tok => wordToSyllables(tok));
}

function consonantDur(ipa: string, isPhraseFinal: boolean): number {
  if (STOPS.has(ipa)) return isPhraseFinal ? 0.065 : 0.038;
  if (AFFRICATES.has(ipa)) return isPhraseFinal ? 0.085 : 0.068;
  if (FRICATIVES.has(ipa)) return isPhraseFinal ? 0.095 : 0.060;
  return isPhraseFinal ? 0.085 : 0.045;
}

function vowelWeight(nucleus: string, stress: number, isPhraseFinal: boolean, phraseDur: number, sylCount: number): number {
  let w = 1.15;
  if (DIPHTHONG_GLIDES[nucleus]) w = 1.38;
  else if (REDUCED_VOWELS.has(nucleus)) w = 0.62;
  else if (LAX_VOWELS.has(nucleus)) w = 0.95;
  if (stress === 1) w *= 1.25;
  if (isPhraseFinal && sylCount > 1 && phraseDur >= 0.75) w *= 1.38;
  return w;
}

const round6 = (n: number) => Math.round(n * 1e6) / 1e6;

/**
 * Lay out syllables cleanly inside `totalDuration` seconds with crisp consonants,
 * stress-weighted vowel lengths, and split diphthongs (80% nucleus + 20% offglide).
 */
export function buildTimedPhones(syllables: SimpleSyl[], totalDuration: number): PhoneSpan[] {
  if (!syllables.length) return [{ ipa: 'ɑ', duration: round6(Math.max(0.05, totalDuration)) }];

  type Item = { ipa: string; isVowel: boolean; baseDur: number; weight: number };
  const items: Item[] = [];
  const lastSylIdx = syllables.length - 1;

  for (let si = 0; si < syllables.length; si++) {
    const syl = syllables[si];
    const isLastSyl = si === lastSylIdx;
    for (const c of syl.onset) {
      items.push({ ipa: c, isVowel: false, baseDur: consonantDur(c, false), weight: 0 });
    }
    items.push({
      ipa: syl.nucleus,
      isVowel: true,
      baseDur: 0.055,
      weight: vowelWeight(syl.nucleus, syl.stress, isLastSyl, totalDuration, syllables.length),
    });
    for (let ci = 0; ci < syl.coda.length; ci++) {
      const c = syl.coda[ci];
      const isFinalCoda = isLastSyl && ci === syl.coda.length - 1;
      items.push({ ipa: c, isVowel: false, baseDur: consonantDur(c, isFinalCoda), weight: 0 });
    }
  }

  const vowelItems = items.filter(x => x.isVowel);
  const consItems = items.filter(x => !x.isVowel);
  const minVowelTotal = vowelItems.length * 0.045;
  const rawConsTotal = consItems.reduce((s, x) => s + x.baseDur, 0);

  let consScale = 1;
  if (rawConsTotal + minVowelTotal > totalDuration) {
    const availForCons = Math.max(consItems.length * 0.014, totalDuration * 0.45);
    consScale = Math.min(1, availForCons / Math.max(1e-6, rawConsTotal));
  }

  const consDurs = items.map(x => (x.isVowel ? 0 : Math.max(0.014, x.baseDur * consScale)));
  const actualConsTotal = consDurs.reduce((s, d) => s + d, 0);
  const vowelBudget = Math.max(vowelItems.length * 0.018, totalDuration - actualConsTotal);
  const weightSum = vowelItems.reduce((s, x) => s + x.weight, 0) || 1;

  const phones: PhoneSpan[] = [];
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    if (!it.isVowel) {
      phones.push({ ipa: it.ipa, duration: round6(consDurs[i]) });
    } else {
      const dur = Math.max(0.018, vowelBudget * (it.weight / weightSum));
      const glide = DIPHTHONG_GLIDES[it.ipa];
      if (glide && dur >= 0.052) {
        const off = Math.max(0.015, Math.min(0.11, dur * 0.21));
        const nuc = Math.max(0.025, dur - off);
        phones.push({ ipa: glide[0], duration: round6(nuc) });
        phones.push({ ipa: glide[1], duration: round6(off) });
      } else {
        phones.push({ ipa: it.ipa, duration: round6(dur) });
      }
    }
  }

  // Exact duration reconciliation (adjust longest phone so phrase ends on the microsecond).
  const currentSum = phones.reduce((s, p) => s + p.duration, 0);
  const diff = round6(totalDuration - currentSum);
  if (Math.abs(diff) > 1e-6) {
    let bestIdx = 0;
    for (let i = 1; i < phones.length; i++) {
      if (phones[i].duration > phones[bestIdx].duration) bestIdx = i;
    }
    if (phones[bestIdx].duration + diff >= 0.014) {
      phones[bestIdx].duration = round6(phones[bestIdx].duration + diff);
    } else {
      // Uniform rescale fallback for ultra-short phrases
      const scale = totalDuration / Math.max(1e-6, currentSum);
      for (const p of phones) p.duration = round6(Math.max(0.011, p.duration * scale));
    }
  }
  // Split any individual phone exceeding 9.5s (validPerformance enforces phone.duration <= 10s).
  const out: PhoneSpan[] = [];
  for (const p of phones) {
    if (p.duration <= 9.5) {
      out.push(p);
    } else {
      const parts = Math.ceil(p.duration / 8.0);
      let rem = p.duration;
      for (let k = 0; k < parts; k++) {
        const d = k === parts - 1 ? round6(rem) : round6(p.duration / parts);
        rem = round6(rem - d);
        out.push({ ipa: p.ipa, duration: d });
      }
    }
  }
  return out;
}

/**
 * Lay out English text inside a phrase duration using word-level timestamps when available.
 */
export function buildWordTimedPhones(
  words: { text: string; start: number; end: number }[],
  phraseStart: number,
  phraseEnd: number,
): PhoneSpan[] {
  const validWords = words
    .map(w => ({ syls: textToSyllables(w.text), start: w.start, end: w.end }))
    .filter(w => w.syls.length > 0);
  if (!validWords.length) {
    return buildTimedPhones(textToSyllables(words.map(w => w.text).join(' ')), phraseEnd - phraseStart);
  }
  // Allocate each word's proportional share of phraseEnd - phraseStart (eliminating inter-word gaps cleanly).
  const totalDur = phraseEnd - phraseStart;
  const spans = validWords.map((w, i) => {
    const s = i === 0 ? phraseStart : Math.max(phraseStart, (validWords[i - 1].end + w.start) / 2);
    const e = i === validWords.length - 1 ? phraseEnd : Math.min(phraseEnd, (w.end + validWords[i + 1].start) / 2);
    return Math.max(0.05 * w.syls.length, e - s);
  });
  const spanSum = spans.reduce((a, b) => a + b, 0) || totalDur;
  const phones: PhoneSpan[] = [];
  for (let i = 0; i < validWords.length; i++) {
    const wDur = totalDur * (spans[i] / spanSum);
    phones.push(...buildTimedPhones(validWords[i].syls, wDur));
  }
  // Reconcile rounding drift
  const sum = phones.reduce((s, p) => s + p.duration, 0);
  const diff = round6(totalDur - sum);
  if (Math.abs(diff) > 1e-6 && phones.length) {
    let bestIdx = 0;
    for (let i = 1; i < phones.length; i++) {
      if (phones[i].duration > phones[bestIdx].duration) bestIdx = i;
    }
    if (phones[bestIdx].duration + diff >= 0.012) {
      phones[bestIdx].duration = round6(phones[bestIdx].duration + diff);
    }
  }
  // Split any individual phone exceeding 9.5s (validPerformance enforces phone.duration <= 10s).
  const out: PhoneSpan[] = [];
  for (const p of phones) {
    if (p.duration <= 9.5) {
      out.push(p);
    } else {
      const parts = Math.ceil(p.duration / 8.0);
      let rem = p.duration;
      for (let k = 0; k < parts; k++) {
        const d = k === parts - 1 ? round6(rem) : round6(p.duration / parts);
        rem = round6(rem - d);
        out.push({ ipa: p.ipa, duration: d });
      }
    }
  }
  return out;
}

/**
 * Ensure contour breath never drops to 0.0 inside active sung phrases
 * (which starves initial/final consonants of airflow in CHIMERA's physical airway).
 */
export function normalizeContourBreath(perf: VocalPerformance, minBreath = 0.68): void {
  const ranges = perf.phrases.map(p => ({
    start: p.start,
    end: p.start + p.phones.reduce((s, ph) => s + ph.duration, 0),
  }));
  for (const pt of perf.contour) {
    const inPhrase = ranges.some(r => pt.time >= r.start - 1e-6 && pt.time <= r.end + 1e-6);
    if (inPhrase) {
      if (pt.breath < minBreath) pt.breath = round6(minBreath);
      else if (pt.breath > 1.02) pt.breath = 1.02;
    }
  }
}
