/** Render the full Ferto physical performance over an isolated instrumental. */
import {copyFileSync, mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {gzipSync} from 'node:zlib';
import {initEngine, wasmModule} from '../tests/harness.ts';
import type {Arrangement} from '../src/band/types.ts';
import {validPerformance} from '../src/band/performance.ts';
import {validateScene} from '../src/scene/scene.ts';

const out = new URL('../public/scenes/ferto/', import.meta.url).pathname;
const [backingArg, ...extra] = Bun.argv.slice(2);
if (!backingArg || extra.length) {
  throw Error('Usage: bun tools/render-ferto-scene.ts <isolated-instrumental.wav>');
}

const scene = validateScene(JSON.parse(readFileSync(join(out, 'scene.json'), 'utf8')));
const arrangement: Arrangement & {backingVolume: number} = JSON.parse(readFileSync(join(out, 'performance.json'), 'utf8'));
const [part] = arrangement.parts;
const [character] = scene.characters;
if (arrangement.parts.length !== 1 || scene.characters.length !== 1 ||
    part.id !== character.id || arrangement.duration !== scene.duration ||
    !Number.isFinite(arrangement.backingVolume) || arrangement.backingVolume < 0 || arrangement.backingVolume > 1 ||
    !part.performance || !validPerformance(part.performance, scene.duration)) {
  throw Error('The Ferto physical score and scene must agree.');
}

await initEngine();
const {planPerformance} = await import('../src/band/performancePlan.ts');
const {renderPart, BAND_RATE} = await import('../src/band/render.ts');
const temp = mkdtempSync(join(tmpdir(), 'chimera-ferto-'));

try {
  const gestures = planPerformance(part, part.performance);
  const {samples, tele} = renderPart(wasmModule, part, scene.duration, gestures);
  if (!samples.every(sample => Number.isFinite(sample)) ||
      !samples.some(sample => Math.abs(sample) > .01)) {
    throw Error('The Ferto airway render is silent or unstable.');
  }

  const raw = join(temp, 'engine.f32');
  writeFileSync(raw, Buffer.from(samples.buffer));
  const header = new DataView(tele);
  const count = header.getUint32(16, true);
  const width = header.getUint32(20, true);
  const frameSeconds = header.getUint32(12, true) / header.getUint32(8, true);
  const track = new Float32Array(tele, 48);
  for (let frame = 0; frame < count; frame++) {
    track[frame * width + 10] = frame * frameSeconds;
  }
  const telemetry = join(temp, character.tele + '.gz');
  writeFileSync(telemetry, gzipSync(Buffer.from(tele), {level: 9}));

  const filters = [
    `[0:a]aresample=${BAND_RATE},volume=${arrangement.backingVolume}[backing]`,
    `[1:a]highpass=f=100,acompressor=threshold=0.10:ratio=2:attack=8:release=85,pan=stereo|c0=1.25*c0|c1=1.25*c0[engine]`,
    `[backing][engine]amix=inputs=2:normalize=0:duration=longest,atrim=end_sample=${samples.length},alimiter=limit=0.95:latency=1[out]`,
  ];
  const mix = join(temp, scene.audio);
  const result = spawnSync('ffmpeg', [
    '-v', 'error', '-y', '-i', resolve(backingArg),
    '-f', 'f32le', '-ar', String(BAND_RATE), '-ac', '1', '-i', raw,
    '-filter_complex', filters.join(';'), '-map', '[out]', '-map_metadata', '-1',
    '-c:a', 'libmp3lame', '-b:a', '256k', mix,
  ], {stdio: 'inherit'});
  if (result.status !== 0) throw Error('Ferto instrumental and engine mix encoding failed.');

  copyFileSync(mix, join(out, scene.audio));
  copyFileSync(telemetry, join(out, character.tele + '.gz'));
  console.log(`Rendered ${part.performance.phrases.length} phrases and ${gestures.length} gestures with the CHIMERA airway.`);
} finally {
  rmSync(temp, {recursive: true, force: true});
}
