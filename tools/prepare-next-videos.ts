import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { initEngine } from '../tests/harness.ts';
import { NEXT_VIDEO_CAST, NEXT_VIDEO_ENTRIES, NEXT_VIDEO_INFO, NEXT_VIDEO_SETTINGS } from '../src/scene/next-videos.ts';
import { validateScene } from '../src/scene/scene.ts';
import { validPerformance } from '../src/band/performance.ts';
import type { Arrangement, BandPart, VocalPerformance } from '../src/band/types.ts';

type Word = { text: string; start: number; end: number; phones?: [string, number][] };
type Group = { caption?: boolean; start: number; end: number; role: number; words: Word[]; contour: [number, number, number][] };
type Prepared = { duration: number; language: 'en' | 'sv'; groups: Group[] };
type Phones = VocalPerformance['phrases'][number]['phones'];

const [id, input] = process.argv.slice(2);
const setting = NEXT_VIDEO_SETTINGS.find(key => NEXT_VIDEO_INFO[key].id === id);
if (!setting || !input) throw new Error('Pass a catalog scene ID and a prepared timing file.');
await initEngine();
const { ensureEnglishDict, buildWordTimedPhones } = await import('./lib/english-phones.ts');
ensureEnglishDict(process.cwd());
const { duration, language, groups } = JSON.parse(readFileSync(input, 'utf8')) as Prepared;
const { title, description, bpm, female, child, names, shots, source } = NEXT_VIDEO_INFO[setting];
const cast = NEXT_VIDEO_CAST[setting];
const assetVersion = NEXT_VIDEO_ENTRIES.find(entry => entry.id === id)!.assetVersion;
const round = (value: number) => Math.round(value * 1e6) / 1e6;

function swedishPhones(group: Group): Phones {
  return group.words.flatMap((word, index) => {
    const next = group.words[index + 1]?.start ?? group.end;
    const span = word.end - word.start;
    const gap = next - word.end;
    const phones = word.phones?.length ? word.phones : [['ə', 1] satisfies [string, number]];
    const weight = phones.reduce((sum, [, length]) => sum + length, 0);
    const gesture = phones.map(([ipa, length]) => ({ ipa, duration: length / weight * (span + (gap < .019 ? gap : 0)) }));
    if (gap >= .019) gesture.push({ ipa: '_', duration: gap });
    return gesture;
  });
}

function phrase(group: Group) {
  const span = group.end - group.start;
  const phones = language === 'en' ? buildWordTimedPhones(group.words, group.start, group.end) : swedishPhones(group);
  // A release shorter than nine milliseconds cannot be represented by a prepared score.
  const playable = phones.filter(phone => phone.duration >= .0105 && phone.ipa.length <= 12);
  if (!playable.length) playable.push({ ipa: 'ə', duration: span });
  const sum = playable.reduce((time, phone) => time + phone.duration, 0);
  const scaled = playable.map(phone => ({ ...phone, duration: round(phone.duration * span / sum) }));
  const longest = scaled.reduce((a, b) => a.duration > b.duration ? a : b);
  longest.duration = round(longest.duration + span - scaled.reduce((time, phone) => time + phone.duration, 0));
  const stable = scaled.filter(phone => phone.duration >= .009);
  const remainder = round(span - stable.reduce((time, phone) => time + phone.duration, 0));
  longest.duration = round(longest.duration + remainder);
  return { start: group.start, phones: stable };
}

const roles = groups.map(g => ({ ...g, phrase: phrase(g), text: g.words.map(w => w.text).join(' ') }));
const parts: BandPart[] = cast.map((id, i) => {
  const featured = roles.filter(row => row.role === i);
  const performance: VocalPerformance = {
    lyrics: featured.map(row => row.text).join(' '),
    phrases: featured.map(row => row.phrase),
    contour: featured.flatMap(row => row.contour.map(([time, hz, breath]) => ({ time, hz, breath }))),
  };
  if (!validPerformance(performance, duration)) throw new Error('Invalid physical score for ' + id);
  console.log(id, featured.length, 'phrases', performance.contour.length, 'contour points');
  return {
    id, name: names[i], role: 'CHIMERA vocals', kind: 'voice',
    body: { female: female[i], child: child[i] },
    voice: { pressure: 8.3 + i * .14, brightness: .5 + (i % 3) * .062, breathiness: .034,
      tension: .48 + (i % 4) * .027, drift: .0013 },
    vibrato: 0, pan: (i % 2 ? -.06 : .045) * i / cast.length, volume: cast.length > 1 ? 1.36 : 1.42,
    assetVersion, telemetryEncoding: 'gzip', performance,
    melody: { name: names[i], duration, notes: featured.map(row => ({
      start: row.start, duration: round(row.end - row.start),
      midi: Math.round(69 + 12 * Math.log2(row.contour[Math.floor(row.contour.length / 2)][1] / 440)),
    })), lyrics: performance.lyrics, source: 'Source vocal pitch contours' },
  };
});
parts.push({ id: 'backing', name: 'Original music', role: 'Separated original accompaniment',
  kind: 'backing', recordingType: 'instrumental', body: { female: 0, child: 0 }, volume: .81, pan: 0, assetVersion });

const scene = validateScene({
  setting, title, description, duration, audio: 'mix.mp3',
  characters: cast.map((id, i) => ({ id, name: names[i], role: parts[i].role, tele: id + '.tele', telemetryEncoding: 'gzip' })),
  cues: roles.filter(g => g.caption !== false).map(g => ({ start: g.start, end: g.end, text: g.text, speaker: cast[g.role], intensity: .85 })),
  shots: shots.map(([time, view]) => ({ time, view })),
});
const arrangement: Arrangement = { title, description, duration, bpm, parts, sections: shots.map(([time, view]) => ({
  time, name: view.split('-').slice(1).join(' ').replace(/^./, char => char.toUpperCase()),
})) };
const output = join(process.cwd(), 'public', 'scenes', id);
mkdirSync(output, { recursive: true });
for (const [path, object] of [['scene.json', scene], ['performance.json', arrangement]] as const) {
  writeFileSync(join(output, path), JSON.stringify(object, null, 2) + '\n');
}
const reference = source.startsWith('https://') ? source : 'https://www.youtube.com/watch?v=' + source;
writeFileSync(join(output, 'credits.txt'), `${title}\nReference: ${reference}\n`);
