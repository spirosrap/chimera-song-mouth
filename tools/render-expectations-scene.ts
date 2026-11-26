/** Render the full expectations scene’s physical voices, stereo mix and synchronized mouth telemetry. */
import { readFileSync, writeFileSync, mkdtempSync, rmSync, copyFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn, spawnSync } from 'node:child_process';
import { gzipSync } from 'node:zlib';
import { initEngine, wasmModule } from '../tests/harness.ts';
import type { Arrangement, BandPart } from '../src/band/types.ts';
import type { Gesture } from '../src/wasm/types.ts';
import { validPerformance } from '../src/band/performance.ts';

const out = fileURLToPath(new URL('../public/scenes/expectations/', import.meta.url));
const arrangement: Arrangement = JSON.parse(readFileSync(join(out, 'performance.json'), 'utf8'));
const voices = arrangement.parts.filter(part => part.kind === 'voice');
const backing = arrangement.parts.find(part => part.kind === 'backing');
if (voices.length !== 4 || !backing || voices.some(part => !part.performance || !validPerformance(part.performance, arrangement.duration))) {
  throw new Error('The prepared expectations score is invalid.');
}
const rate = 48_000;
const total = Math.ceil(arrangement.duration * rate);
const frames = Math.floor(total / 2400) + 1;

type Window = { part: BandPart; first: number; last: number; renderFirst: number; renderLast: number; index: number };

function activeRanges(part: BandPart): Window[] {
  const result: Array<[number, number]> = [];
  let start = -1, end = -1;
  for (const phrase of part.performance!.phrases) {
    if (start < 0) start = Math.max(0, Math.floor((phrase.start - .27) * 20));
    else if (phrase.start - end > .84) {
      result.push([start, Math.ceil((end + .35) * 20)]);
      start = Math.floor((phrase.start - .27) * 20);
    } else if (phrase.start * 20 - start >= 218) {
      // Short runs keep the gesture queue small. Each runs the preceding half
      // second before its first published sample, so the seam falls on the
      // source clock with the airway already moving.
      const cut = Math.floor((end + phrase.start) * 10);
      result.push([start, cut]);
      start = cut;
    }
    end = phrase.start + phrase.phones.reduce((sum, phone) => sum + phone.duration, 0);
  }
  if (start >= 0) result.push([start, Math.min(frames - 1, Math.ceil((end + .35) * 20))]);
  return result.map(([first, last], index) => ({
    part, first, last, renderFirst: Math.max(0, first - 10), renderLast: Math.min(frames - 1, last + 2), index,
  }));
}

const prefix = (window: Window) => window.part.id + '-' + window.index;

async function planVoice(part: BandPart): Promise<Gesture[]> {
  const { planPerformance } = await import('../src/band/performancePlan.ts');
  const performance = part.performance!;
  const measured = planPerformance(part, performance);
  if (part.id === 'expect-olivia' || part.id === 'expect-chappell') return measured;

  // Keep the measured pitch and the original line slots, but give the quiz
  // dialogue the engine's spoken consonants, stress and airflow.
  const { planUtterance } = await import('../src/wasm/engine.ts');
  const { clearPhrases, CLEAR_SPEECH_TIGHT } = await import('../src/scene/clarity.ts');
  const spoken = performance.phrases.flatMap(phrase => {
    const [clear] = clearPhrases([{ segments: phrase.phones.map(phone => ({
      ipa: phone.ipa, dur: phone.duration,
    })) }], part.body, CLEAR_SPEECH_TIGHT);
    return planUtterance(clear.segments, { body: part.body, t0: phrase.start - .055,
      rate: 1, f0: 178, intonation: 'statement' }).gestures.map(gesture => {
      const { f0, vibrato, ...targets } = gesture.targets;
      return { ...gesture, targets };
    }).filter(gesture => Object.keys(gesture.targets).length > 0);
  });
  const melody = measured.filter(gesture => gesture.label === 'source performance').map(gesture => ({
    ...gesture, targets: { f0: gesture.targets.f0 },
  }));
  return [...spoken, ...melody];
}

async function renderWindow(window: Window, scratch: string) {
  await initEngine();
  const { renderPart } = await import('../src/band/render.ts');
  const start = window.renderFirst / 20;
  const end = window.renderLast / 20;
  const { part } = window;
  const gestures = (await planVoice(part))
    .filter(g => g.t1 >= start && g.t0 < end)
    .map(g => ({ ...g, t0: g.t0 - start, t1: g.t1 - start }));
  const rendered = renderPart(wasmModule, part, (window.renderLast - window.renderFirst) / 20, gestures);
  const stem = join(scratch, prefix(window));
  writeFileSync(stem + '.f32', Buffer.from(rendered.samples.buffer));
  writeFileSync(stem + '.tele', Buffer.from(rendered.tele));
  console.log(prefix(window), (window.last - window.first) / 20, 's');
}

function launchWindow(window: Window, scratch: string): Promise<void> {
  const child = spawn(process.execPath, [fileURLToPath(import.meta.url), window.part.id, scratch, String(window.index)], { stdio: 'inherit' });
  return new Promise((resolve, reject) => {
    child.once('error', reject);
    child.once('exit', code => code === 0 ? resolve() : reject(new Error(`Rendering failed for ${prefix(window)}.`)));
  });
}

function assembleVoice(part: BandPart, windows: Window[], scratch: string) {
  const output = new Float32Array(total);
  let telemetry: ArrayBuffer | undefined;
  let stream: Float32Array | undefined;
  let width = 0;
  let priorEnd = -1;
  const fadeSamples = 960;
  for (const window of windows) {
    const stem = join(scratch, prefix(window));
    const audio = Uint8Array.from(readFileSync(stem + '.f32')).buffer;
    const samples = new Float32Array(audio);
    const raw = Uint8Array.from(readFileSync(stem + '.tele')).buffer;
    const segment = new Float32Array(raw, 48);
    if (!telemetry) {
      width = new DataView(raw).getUint32(20, true);
      telemetry = new ArrayBuffer(48 + frames * width * 4);
      new Uint8Array(telemetry, 0, 48).set(new Uint8Array(raw, 0, 48));
      new DataView(telemetry).setUint32(16, frames, true);
      stream = new Float32Array(telemetry, 48);
      const neutral = new Float32Array(
        Uint8Array.from(readFileSync(join(scratch, prefix(windows.at(-1)!) + '.tele'))).buffer, 48,
      ).slice(-width);
      neutral[6] = 0;
      neutral[7] = 0;
      for (let i = 0; i < frames; i++) stream.set(neutral, i * width);
    }
    const offset = window.first * 2400;
    const readFrom = (window.first - window.renderFirst) * 2400;
    const nextSharesBoundary = windows[window.index + 1]?.first === window.last;
    const readTo = (window.last - window.renderFirst) * 2400 + (nextSharesBoundary ? fadeSamples : 0);
    const blend = priorEnd === window.first ? fadeSamples : 0;
    for (let i = 0; i < blend; i++) {
      const gain = i / blend;
      output[offset + i] = gain * samples[readFrom + i] + (1 - gain) * output[offset + i];
    }
    output.set(samples.subarray(readFrom + blend, readTo), offset + blend);
    stream!.set(segment.subarray((window.first - window.renderFirst) * width, (window.last - window.renderFirst) * width), window.first * width);
    priorEnd = window.last;
  }
  if (!telemetry || !stream || !output.some(sample => Math.abs(sample) > .008)) throw new Error(`The ${part.id} voice is silent.`);
  for (let i = 0; i < frames; i++) stream[i * width + 10] = i / 20;
  writeFileSync(join(scratch, part.id + '.f32'), Buffer.from(output.buffer));
  writeFileSync(join(scratch, part.id + '.tele.gz'), gzipSync(Buffer.from(telemetry), { level: 9 }));
}

async function makeMix(scratch: string) {
  const byVoice = voices.map(activeRanges);
  const queue = byVoice.flat().sort((a, b) => (b.last - b.first) - (a.last - a.first));
  const tasks = Array.from({ length: Math.min(7, queue.length) }, async () => {
    while (queue.length) await launchWindow(queue.shift()!, scratch);
  });
  const results = await Promise.allSettled(tasks);
  for (const result of results) if (result.status === 'rejected') throw result.reason;
  voices.forEach((part, i) => assembleVoice(part, byVoice[i], scratch));
  const inputs: string[] = [];
  const routes: string[] = [];
  const lanes: string[] = [];
  for (const [i, part] of voices.entries()) {
    inputs.push('-f', 'f32le', '-ar', String(rate), '-ac', '1', '-i', join(scratch, part.id + '.f32'));
    const theta = (part.pan + 1) * Math.PI / 4;
    const lane = `[voice${i}]`;
    const singing = part.id === 'expect-olivia' || part.id === 'expect-chappell';
    const highpass = singing ? 97 : 110;
    const brighten = singing ? ',equalizer=f=2550:t=q:w=1.05:g=2.6' : ',equalizer=f=1950:t=q:w=.9:g=1.6';
    routes.push(`[${i}:a]highpass=f=${highpass}${brighten},acompressor=threshold=.15:ratio=2.1:attack=5:release=65,pan=stereo|c0=${Math.cos(theta) * part.volume}*c0|c1=${Math.sin(theta) * part.volume}*c0${lane}`);
    lanes.push(lane);
  }
  routes.push(`[${voices.length}:a]aresample=${rate},volume=${backing!.volume}[music]`);
  lanes.push('[music]');
  routes.push(`${lanes.join('')}amix=inputs=${lanes.length}:normalize=0:duration=longest:dropout_transition=0,alimiter=limit=.94:level=0:latency=1,atrim=end_sample=${total}[out]`);
  const mix = join(scratch, 'mix.mp3');
  const ffmpeg = spawnSync('ffmpeg', [
    '-v', 'error', '-nostdin', '-y', ...inputs, '-i', join(out, 'backing.mp3'),
    '-filter_complex', routes.join(';'), '-map', '[out]', '-map_metadata', '-1',
    '-c:a', 'libmp3lame', '-b:a', '256k', mix,
  ], { stdio: 'inherit' });
  if (ffmpeg.status !== 0) throw new Error('The expectations mix could not be encoded.');
  copyFileSync(mix, join(out, 'mix.mp3'));
  for (const part of voices) copyFileSync(join(scratch, part.id + '.tele.gz'), join(out, part.id + '.tele.gz'));
}

const [id, directory, task] = process.argv.slice(2);
if (id && directory) {
  const part = voices.find(candidate => candidate.id === id);
  if (!part) throw new Error('Unknown expectations voice: ' + id);
  const window = activeRanges(part)[Number(task)];
  if (!window) throw new Error('Unknown render window.');
  await renderWindow(window, directory);
} else {
  const scratch = mkdtempSync(join(tmpdir(), 'chimera-expectations-'));
  try {
    await makeMix(scratch);
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}
