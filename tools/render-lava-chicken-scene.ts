/** Rebuild three physical voices, original backing and telemetry for Steve’s Lava Chicken. */
import { readFileSync, writeFileSync, mkdtempSync, rmSync, copyFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { gzipSync } from 'node:zlib';
import { initEngine, wasmModule } from '../tests/harness.ts';
import type { Arrangement } from '../src/band/types.ts';
import { validPerformance } from '../src/band/performance.ts';

await initEngine();
const { planPerformance } = await import('../src/band/performancePlan.ts');
const { renderPart } = await import('../src/band/render.ts');

const root = new URL('../', import.meta.url).pathname;
const out = join(root, 'public/scenes/lava-chicken');
const a: Arrangement = JSON.parse(readFileSync(join(out, 'performance.json'), 'utf8'));
const voices = a.parts.filter(p => p.kind === 'voice');
const backing = a.parts.find(p => p.kind === 'backing')!;
if (voices.length !== 3 || !backing || voices.some(p => !p.performance || !validPerformance(p.performance, a.duration))) {
  throw Error('The prepared Lava Chicken performance is invalid.');
}

const temp = mkdtempSync(join(tmpdir(), 'chimera-lava-chicken-'));
try {
  const inputs: string[] = [];
  const filters: string[] = [];
  const labels: string[] = [];
  let frames = 0;

  for (const [i, part] of voices.entries()) {
    console.log(`Rendering ${part.id}...`);
    const rendered = renderPart(wasmModule, part, a.duration, planPerformance(part, part.performance!));
    frames = rendered.samples.length;
    if (!rendered.samples.every(x => Number.isFinite(x) && Math.abs(x) < 1) || !rendered.samples.some(x => Math.abs(x) > 0.01)) {
      throw Error(`The ${part.id} track is silent or unstable.`);
    }
    const raw = join(temp, part.id + '.f32');
    writeFileSync(raw, Buffer.from(rendered.samples.buffer));
    const header = new DataView(rendered.tele);
    const width = header.getUint32(20, true);
    const count = header.getUint32(16, true);
    const tele = new Float32Array(rendered.tele, 48);
    for (let f = 0; f < count; f++) {
      tele[f * width + 10] = f * header.getUint32(12, true) / header.getUint32(8, true);
    }
    writeFileSync(join(temp, part.id + '.tele.gz'), gzipSync(Buffer.from(rendered.tele), { level: 9 }));
    inputs.push('-f', 'f32le', '-ar', '48000', '-ac', '1', '-i', raw);
    const theta = (part.pan + 1) * Math.PI / 4;
    filters.push(`[${i}:a]highpass=f=85,acompressor=threshold=0.18:ratio=2:attack=3:release=60,pan=stereo|c0=${Math.cos(theta) * part.volume}*c0|c1=${Math.sin(theta) * part.volume}*c0[v${i}]`);
    labels.push(`[v${i}]`);
  }

  filters.push(`[${voices.length}:a]aresample=48000,volume=${backing.volume}[b]`);
  labels.push('[b]');
  filters.push(`${labels.join('')}amix=inputs=${labels.length}:normalize=0:duration=longest:dropout_transition=0,alimiter=limit=0.94:level=0:latency=1,atrim=end_sample=${frames}[out]`);

  const mix = join(temp, 'mix.mp3');
  console.log('Encoding mix.mp3 with ffmpeg...');
  const r = spawnSync('ffmpeg', [
    '-v', 'error', '-y', ...inputs, '-i', join(out, 'backing.mp3'),
    '-filter_complex', filters.join(';'), '-map', '[out]', '-map_metadata', '-1',
    '-c:a', 'libmp3lame', '-b:a', '256k', mix,
  ], { stdio: 'inherit' });
  if (r.status !== 0) throw Error('Lava Chicken mix encoding failed.');

  copyFileSync(mix, join(out, 'mix.mp3'));
  for (const part of voices) {
    copyFileSync(join(temp, part.id + '.tele.gz'), join(out, part.id + '.tele.gz'));
  }
} finally {
  rmSync(temp, { recursive: true, force: true });
}
console.log('Rebuilt Lava Chicken physical voices, mix, and telemetry. Run bun run content:manifest next.');
