import { expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import * as THREE from 'three';
import type { Arrangement } from '../src/band/types.ts';
import { validPerformance } from '../src/band/performance.ts';
import { EGG_CRACK_AT, EGG_HATCH_AT, POKEMON_CAST, POKEMON_SHOTS } from '../src/scene/wet-leg-pokemon.ts';
import { movieScene } from '../src/scene/library.ts';
import { sceneCamera, sceneCue, sceneViewChoices, validateScene } from '../src/scene/scene.ts';
import { TeleTrack } from '../src/show/tele.ts';
import { initEngine } from './harness.ts';

await initEngine();
const { VoiceModel } = await import('../src/ui/analysis.ts');
const { PokemonStage } = await import('../src/ui/render/wet-leg-pokemon.ts');
const read = (name: string) => readFileSync(new URL(`../public/scenes/wet-leg-pokemon/${name}`, import.meta.url));
const scene = validateScene(JSON.parse(read('scene.json').toString()));
const score: Arrangement = JSON.parse(read('performance.json').toString());
const track = new TeleTrack(Uint8Array.from(gunzipSync(read('pokemon-vocal.tele.gz'))).buffer);

test('the full egg story includes the quiet opening, fast verse and physical closing refrain', () => {
  const entry = movieScene('wet-leg-pokemon');
  expect(entry && 'assetVersion' in entry && entry.assetVersion).toBe('wet-leg-pokemon-20261126');
  expect(scene.duration).toBeCloseTo(206.796916, 5);
  expect(scene.characters.map(actor => actor.id)).toEqual([...POKEMON_CAST]);
  expect(scene.shots).toEqual([...POKEMON_SHOTS]);
  expect(sceneViewChoices(scene)).toContain('pokemon-hatch');
  expect(sceneViewChoices(scene)).not.toContain('jessep');
  expect(sceneCamera(scene, 52, 'auto')).toBe('pokemon-day-drive');
  expect(sceneCamera(scene, 102, 'auto')).toBe('pokemon-treadmill');
  expect(sceneCamera(scene, 167.2, 'auto')).toBe('pokemon-hatch');
  expect(sceneCamera(scene, 200, 'auto')).toBe('pokemon-hands');
  expect(sceneCue(scene, 3.5)?.speaker).toBe('pokemon-vocal');
  expect(sceneCue(scene, 116)?.speaker).toBe('pokemon-vocal');
  expect(sceneCue(scene, 202)?.speaker).toBe('pokemon-vocal');
  expect(sceneCue(scene, 205)).toBeUndefined();
  const singer = score.parts.find(part => part.id === 'pokemon-vocal')!;
  expect(singer.recordingType).toBeUndefined();
  expect(validPerformance(singer.performance!, scene.duration)).toBe(true);
  expect(score.parts.find(part => part.kind === 'backing')?.recordingType).toBe('instrumental');
  expect(read(scene.audio).length).toBeGreaterThan(6_500_000);
  expect(track.rate).toBe(20);
  expect(track.duration).toBeCloseTo(scene.duration, 1);
  for (const cue of scene.cues) {
    let peak = 0;
    for (let f = track.indexAt(cue.start); f <= track.indexAt(cue.end); f++) {
      const { t } = track.message(f);
      expect(t.clock).toBeCloseTo(f / track.rate, 4);
      expect(Number.isFinite(t.outRms)).toBe(true);
      peak = Math.max(peak, t.outRms);
    }
    expect({ cue: cue.start, audible: peak > .00015 }).toEqual({ cue: cue.start, audible: true });
  }
});

test('the giant shell opens, resets after seeking and keeps the singing mouths clear', () => {
  const model = new VoiceModel(track.body, track.sampleRate);
  const stage = new PokemonStage({ model, track });
  const props = new Set(stage.props.meshes);
  const times = [
    ...scene.cues.flatMap(cue => [cue.start + .055, (cue.start + cue.end) * .5, cue.end - .055]),
    ...POKEMON_SHOTS.map(shot => shot.time + .055),
    202, 168.8, 151, 66, 98, 3.0,
  ];
  try {
    for (const [w, h] of [[1280, 720], [375, 430]]) {
      stage.resize(w, h);
      for (const [epoch, time] of times.entries()) {
        const cue = sceneCue(scene, time);
        const view = sceneCamera(scene, time, 'auto');
        stage.frame(time, true, epoch, view, cue?.intensity ?? 0, cue?.speaker);
        expect([...stage.sets.values()].filter(group => group.visible)).toHaveLength(1);
        if (!cue) continue;
        const figure = time >= EGG_HATCH_AT ? stage.hatchling : stage.lead;
        expect(figure.root.visible).toBe(true);
        const mouth = figure.head.scene.localToWorld(new THREE.Vector3(6.5, -1, 0));
        const screen = mouth.clone().project(stage.camera);
        expect({ view, time, inside: Math.abs(screen.x) < .95 && Math.abs(screen.y) < .88 && screen.z > -1 && screen.z < 1 })
          .toEqual({ view, time, inside: true });
        const opaque: THREE.Mesh[] = [];
        stage.scene.traverseVisible(node => {
          if (node instanceof THREE.Mesh && props.has(node) &&
            !(node.material as THREE.Material).transparent) opaque.push(node);
        });
        const direction = mouth.clone().sub(stage.camera.position);
        stage.scene.updateMatrixWorld(true);
        const ray = new THREE.Raycaster(stage.camera.position, direction.clone().normalize(), 0, direction.length() - 2.5);
        expect({ view, time, blockers: ray.intersectObjects(opaque).length }).toEqual({ view, time, blockers: 0 });
      }
    }
    stage.frame(EGG_CRACK_AT + 1, true, 0, 'pokemon-crack', .6, 'pokemon-vocal');
    expect(stage.crack.visible).toBe(true);
    expect(stage.upperShell.position.x).toBe(0);
    stage.frame(EGG_HATCH_AT + 2.5, true, 1, 'pokemon-hatchling', .7, 'pokemon-vocal');
    expect(stage.upperShell.position.x).toBeGreaterThan(40);
    expect(stage.lowerShell.position.x).toBeLessThan(-40);
    expect(stage.hatchling.root.visible).toBe(true);
    stage.frame(5.5, false, 2, 'pokemon-chair', 0);
    expect(stage.crack.visible).toBe(false);
    expect(stage.upperShell.position.x).toBe(0);
    expect(Math.abs(stage.lowerShell.position.x)).toBe(0);
    expect(stage.hatchling.root.visible).toBe(false);
  } finally {
    stage.dispose();
    model.dispose();
  }
}, 15000);
