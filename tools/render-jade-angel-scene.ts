/** Render the full JADE scene’s physical voices, stereo mix and synchronized mouth telemetry. */
import { readFileSync, writeFileSync, mkdtempSync, rmSync, copyFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn, spawnSync } from 'node:child_process';
import { gzipSync } from 'node:zlib';
import { initEngine, wasmModule } from '../tests/harness.ts';
import type { Arrangement, BandPart } from '../src/band/types.ts';
import { validPerformance } from '../src/band/performance.ts';

const out = fileURLToPath(new URL('../public/scenes/jade-angel/', import.meta.url));
const arrangement: Arrangement = JSON.parse(readFileSync(join(out, 'performance.json'), 'utf8'));
const voices = arrangement.parts.filter(part => part.kind === 'voice');
const backing = arrangement.parts.find(part => part.kind === 'backing');
if (voices.length !== 4 || !backing || voices.some(part => !part.performance || !validPerformance(part.performance, arrangement.duration))) {
  throw new Error('The prepared JADE score is invalid.');
}
const rate = 48_000;
const total = Math.ceil(arrangement.duration * rate);
const frames = Math.floor(total / 2400) + 1;

function activeRanges(part: BandPart): [number, number][] {
  const spans: [number, number][] = [];
  for (const phrase of part.performance!.phrases) {
    const end = phrase.start + phrase.phones.reduce((sum, phone) => sum + phone.duration, 0);
    const last = spans.at(-1);
    if (last && phrase.start - last[1] < .94) last[1] = end;
    else spans.push([phrase.start, end]);
  }
  return spans.map(([start, end]) => [Math.max(0, Math.floor((start - .28) * 20) / 20), Math.ceil((end + .47) * 20) / 20]);
}

async function renderVoice(part: BandPart, scratch: string) {
  await initEngine();
  const { planPerformance } = await import('../src/band/performancePlan.ts');
  const { renderPart } = await import('../src/band/render.ts');
  const plan = planPerformance(part, part.performance!);
  const output = new Float32Array(total);
  let telemetry: ArrayBuffer | undefined;
  let stream: Float32Array | undefined;
  let width = 0;
  const windows = activeRanges(part);
  for (const [index, [start, end]] of windows.entries()) {
    const gestures = plan
      .filter(g => g.t1 >= start && g.t0 < end)
      .map(g => ({ ...g, t0: g.t0 - start, t1: g.t1 - start }));
    const rendered = renderPart(wasmModule, part, Math.round((end - start) * 1000) / 1000, gestures);
    const head = new DataView(rendered.tele);
    const segment = new Float32Array(rendered.tele, 48);
    if (!telemetry) {
      width = head.getUint32(20, true);
      telemetry = new ArrayBuffer(48 + frames * width * 4);
      new Uint8Array(telemetry, 0, 48).set(new Uint8Array(rendered.tele, 0, 48));
      new DataView(telemetry).setUint32(16, frames, true);
      stream = new Float32Array(telemetry, 48);
      const neutral = segment.slice(-width);
      neutral[6] = 0;
      neutral[7] = 0;
      for (let i = 0; i < frames; i++) stream.set(neutral, i * width);
    }
    const sampleOffset = Math.round(start * rate);
    const teleOffset = Math.round(start * 20) * width;
    output.set(rendered.samples.subarray(0, output.length - sampleOffset), sampleOffset);
    stream!.set(segment.subarray(0, stream!.length - teleOffset), teleOffset);
    console.log(`${part.id} ${index + 1}/${windows.length}`);
  }
  if (!telemetry || !stream || !output.some(sample => Math.abs(sample) > .008)) throw new Error(`The ${part.id} voice is silent.`);
  for (let i = 0; i < frames; i++) stream[i * width + 10] = i / 20;
  writeFileSync(join(scratch, part.id + '.f32'), Buffer.from(output.buffer));
  writeFileSync(join(scratch, part.id + '.tele.gz'), gzipSync(Buffer.from(telemetry), { level: 9 }));
}

function launchVoice(part: BandPart, scratch: string): Promise<void> {
  const child = spawn(process.execPath, [fileURLToPath(import.meta.url), part.id, scratch], { stdio: 'inherit' });
  return new Promise((resolve, reject) => {
    child.once('error', reject);
    child.once('exit', code => code === 0 ? resolve() : reject(new Error(`Rendering failed for ${part.id}.`)));
  });
}

async function makeMix(scratch: string) {
  // Wait for all subprocesses before deleting their shared scratch directory, even if a voice fails.
  const results = await Promise.allSettled(voices.map(part => launchVoice(part, scratch)));
  for (const result of results) if (result.status === 'rejected') throw result.reason;
  const inputs: string[] = [];
  const routes: string[] = [];
  const lanes: string[] = [];
  for (const [i, part] of voices.entries()) {
    inputs.push('-f', 'f32le', '-ar', String(rate), '-ac', '1', '-i', join(scratch, part.id + '.f32'));
    const theta = (part.pan + 1) * Math.PI / 4;
    const lane = `[voice${i}]`;
    const highpass = part.id === 'jade-sample' ? 140 : 88;
    const brighten = part.id === 'jade-lead' ? ',equalizer=f=2600:t=q:w=1.1:g=2.1' : '';
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
  if (ffmpeg.status !== 0) throw new Error('The JADE mix could not be encoded.');
  copyFileSync(mix, join(out, 'mix.mp3'));
  for (const part of voices) copyFileSync(join(scratch, part.id + '.tele.gz'), join(out, part.id + '.tele.gz'));
}

const [id, directory] = process.argv.slice(2);
if (id && directory) {
  const part = voices.find(candidate => candidate.id === id);
  if (!part) throw new Error('Unknown JADE voice: ' + id);
  await renderVoice(part, directory);
} else {
  const scratch = mkdtempSync(join(tmpdir(), 'chimera-jade-angel-'));
  try {
    await makeMix(scratch);
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}
