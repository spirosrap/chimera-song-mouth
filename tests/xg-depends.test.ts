import { expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import * as THREE from 'three';
import type { Arrangement } from '../src/band/types.ts';
import { validPerformance } from '../src/band/performance.ts';
import { DEPENDS_CAST, DEPENDS_SHOTS } from '../src/scene/xg-depends.ts';
import { movieScene } from '../src/scene/library.ts';
import { sceneCamera, sceneCue, sceneViewChoices, validateScene } from '../src/scene/scene.ts';
import { TeleTrack } from '../src/show/tele.ts';
import { initEngine } from './harness.ts';

await initEngine();
const { VoiceModel } = await import('../src/ui/analysis.ts');
const { DependsStage } = await import('../src/ui/render/xg-depends.ts');
const read = (name: string) => readFileSync(new URL(`../public/scenes/xg-depends/${name}`, import.meta.url));
const scene = validateScene(JSON.parse(read('scene.json').toString()));
const score: Arrangement = JSON.parse(read('performance.json').toString());
const tracks = new Map(DEPENDS_CAST.map(id => [id, new TeleTrack(Uint8Array.from(gunzipSync(read(id + '.tele.gz'))).buffer)]));

test('DEPENDS keeps the seven physical vocal tracks on the complete reference clock', () => {
  const entry = movieScene('xg-depends');
  expect(entry && 'assetVersion' in entry && entry.assetVersion).toBe('xg-depends-20261126');
  expect(scene.duration).toBeCloseTo(213.391383, 5);
  expect(scene.characters.map(person => person.id)).toEqual([...DEPENDS_CAST]);
  expect(scene.shots).toEqual([...DEPENDS_SHOTS]);
  expect(sceneViewChoices(scene)).toContain('depends-pink-mantis');
  expect(sceneViewChoices(scene)).not.toContain('jessep');
  expect(score.parts.find(part => part.kind === 'backing')?.recordingType).toBe('instrumental');
  expect(score.parts.filter(part => part.kind === 'voice').map(part => part.id)).toEqual([...DEPENDS_CAST]);
  for (const part of score.parts.filter(part => part.kind === 'voice')) {
    expect(part.recordingType).toBeUndefined();
    expect(validPerformance(part.performance!, scene.duration)).toBe(true);
    expect(part.performance!.contour.every(point => point.breath >= .72)).toBe(true);
  }
  expect(read(scene.audio).length).toBeGreaterThan(6_000_000);
  expect(sceneCue(scene, 17)?.speaker).toBe('depends-yellow');
  expect(sceneCue(scene, 140)?.speaker).toBe('depends-red');
  expect(sceneCue(scene, 147.5)).toBeUndefined();
  expect(sceneCue(scene, 153)?.speaker).toBe('depends-silver');
  expect(sceneCue(scene, 205)).toBeUndefined();
  for (const [id, track] of tracks) {
    expect(track.rate).toBe(20);
    expect(track.duration).toBeCloseTo(scene.duration, 1);
    const cues = scene.cues.filter(cue => cue.speaker === id);
    expect(cues.length).toBeGreaterThan(1);
    for (const cue of cues) {
      let peak = 0;
      for (let f = track.indexAt(cue.start); f <= track.indexAt(cue.end); f++) {
        const { t } = track.message(f);
        expect(t.clock).toBeCloseTo(f / track.rate, 4);
        expect(Number.isFinite(t.outRms)).toBe(true);
        peak = Math.max(peak, t.outRms);
      }
      expect({ time: cue.start, audible: peak > .00015 }).toEqual({ time: cue.start, audible: true });
    }
  }
});

test('all seven creatures are paired, and no scenery blocks an active performer after a cut or seek', () => {
  const actors = [...tracks].map(([id, track]) => ({id, track, model: new VoiceModel(track.body, track.sampleRate)}));
  const stage = new DependsStage(actors);
  const meshes = new Set(stage.props.meshes);
  const times = [
    ...scene.cues.flatMap(cue => [cue.start + .045, (cue.start + cue.end) / 2, cue.end - .045]),
    ...DEPENDS_SHOTS.map(shot => shot.time + .05), 204, 163, 97, 55, 30, 16.7, 1,
  ];
  try {
    for (const [width, height] of [[1280, 720], [375, 430]]) {
      stage.resize(width, height);
      for (const [epoch, time] of times.entries()) {
        const cue = sceneCue(scene, time);
        const view = sceneCamera(scene, time, 'auto');
        stage.frame(time, true, epoch, view, cue?.intensity ?? 0, cue?.speaker);
        expect([...stage.sets.values()].filter(group => group.visible)).toHaveLength(1);
        if (!cue) continue;
        const performer = stage.figures.get(cue.speaker as typeof DEPENDS_CAST[number])!.figure;
        expect(performer.root.visible).toBe(true);
        const mouth = performer.head.scene.localToWorld(new THREE.Vector3(6.5, -1, 0));
        const screen = mouth.clone().project(stage.camera);
        expect({ width, time, view, visible: Math.abs(screen.x) < .94 && Math.abs(screen.y) < .89 && screen.z > -1 && screen.z < 1 })
          .toEqual({ width, time, view, visible: true });
        const opaque: THREE.Mesh[] = [];
        stage.scene.traverseVisible(node => {
          if (node instanceof THREE.Mesh && meshes.has(node) && !(node.material as THREE.Material).transparent) opaque.push(node);
        });
        stage.scene.updateMatrixWorld(true);
        const direction = mouth.clone().sub(stage.camera.position);
        const ray = new THREE.Raycaster(stage.camera.position, direction.clone().normalize(), 0, direction.length() - 3);
        const blockers = ray.intersectObjects(opaque).map(hit => hit.object.parent?.name ?? '');
        expect({ width, time, view, blockers }).toEqual({ width, time, view, blockers: [] });
      }
    }
    stage.frame(149, true, 0, 'depends-chase', .8, 'depends-purple');
    expect([...stage.figures.values()].filter(person => person.figure.root.visible)).toHaveLength(7);
    expect(stage.insects.filter(insect => insect.root.visible)).toHaveLength(7);
    const chaseY = stage.insects[0].root.position.y;
    stage.frame(149.14, true, 0, 'depends-chase', .8, 'depends-purple');
    expect(stage.insects[0].root.position.y).not.toBe(chaseY);
    stage.frame(149, false, 1, 'depends-chase', .8, 'depends-purple');
    expect(stage.insects[0].root.position.y).toBe(chaseY);
    for (const [i, id] of DEPENDS_CAST.entries()) {
      stage.frame(190, false, i + 2, id, 0);
      expect(stage.insects.filter(insect => insect.root.visible)).toEqual([stage.insects[i]]);
      expect(stage.insects[i].root.scale.x).toBeGreaterThan(2);
      expect(stage.figures.get(id)?.figure.root.visible).toBe(true);
    }
  } finally {
    stage.dispose();
    actors.forEach(actor => actor.model.dispose());
  }
}, 20000);
