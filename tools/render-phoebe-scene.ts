/** Rebuild the physical singer, original-music mix and mouth movement for Audrey Hobert · Phoebe. */
import { readFileSync, writeFileSync, mkdtempSync, rmSync, copyFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { gzipSync } from 'node:zlib';
import { initEngine, wasmModule } from '../tests/harness.ts';
import type { Arrangement } from '../src/band/types.ts';
import { validPerformance } from '../src/band/performance.ts';

await initEngine();
const { planPart } = await import('../src/band/planning.ts');
const { renderPart } = await import('../src/band/render.ts');

const root = new URL('../', import.meta.url).pathname;
const out = join(root, 'public/scenes/phoebe');
const a: Arrangement = JSON.parse(readFileSync(join(out, 'performance.json'), 'utf8'));
const voices = a.parts.filter(p => p.kind === 'voice');
const backing = a.parts.find(p => p.kind === 'backing')!;
if (voices.length !== 1 || !backing || !voices[0].performance || !validPerformance(voices[0].performance, a.duration)) {
  throw Error('The prepared Phoebe performance is invalid.');
}

const temp = mkdtempSync(join(tmpdir(), 'chimera-phoebe-'));
try {
  const part = voices[0];
  console.log(`Rendering ${part.id}...`);
  const rendered = renderPart(wasmModule, part, a.duration, planPart(part));
  const frames = rendered.samples.length;
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

  const theta = (part.pan + 1) * Math.PI / 4;
  const filter = [
    `[0:a]pan=stereo|c0=${Math.cos(theta) * part.volume}*c0|c1=${Math.sin(theta) * part.volume}*c0[v0]`,
    `[1:a]volume=${backing.volume}[b]`,
    `[v0][b]amix=inputs=2:normalize=0:duration=longest:dropout_transition=0,atrim=end_sample=${frames}[out]`
  ].join(';');

  const mix = join(temp, 'mix.mp3');
  console.log('Encoding mix.mp3 with ffmpeg...');
  const r = spawnSync('ffmpeg', [
    '-v', 'error', '-y', '-f', 'f32le', '-ar', '48000', '-ac', '1', '-i', raw,
    '-i', join(out, 'backing.mp3'), '-filter_complex', filter,
    '-map', '[out]', '-map_metadata', '-1', '-c:a', 'libmp3lame', '-b:a', '256k', mix
  ], { stdio: 'inherit' });
  if (r.status !== 0) throw Error('Phoebe mix encoding failed.');

  copyFileSync(mix, join(out, 'mix.mp3'));
  copyFileSync(join(temp, part.id + '.tele.gz'), join(out, part.id + '.tele.gz'));
} finally {
  rmSync(temp, { recursive: true, force: true });
}
console.log('Rebuilt Audrey physical singer, mix, and synchronized telemetry. Run bun run content:manifest next.');
