import {expect, spyOn, test} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as THREE from 'three';
import {initEngine} from './harness.ts';
import {validPerformance} from '../src/band/performance.ts';
import type {Arrangement} from '../src/band/types.ts';
import {DEMONS_SHOTS, demonsState} from '../src/scene/doja-demons.ts';
import {movieScene} from '../src/scene/library.ts';
import {sceneCamera, validateScene} from '../src/scene/scene.ts';
import {TeleTrack} from '../src/show/tele.ts';

await initEngine();
const {skippedIpa} = await import('../src/wasm/engine.ts');
const {VoiceModel} = await import('../src/ui/analysis.ts');
const {DemonsStage} = await import('../src/ui/render/doja-demons.ts');

const read = (name: string) => readFileSync(new URL('../public/scenes/doja-demons/' + name, import.meta.url));
const score: Arrangement = JSON.parse(read('performance.json').toString());
const scene = validateScene(JSON.parse(read('scene.json').toString()));
const ids = ['demons-doja', 'demons-shadow'] as const;
const tracks = ['lead', 'echo'].map(name => {
  const bytes = gunzipSync(read(name + '.tele.gz'));
  return new TeleTrack(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
});
const makePeople = () => tracks.map((track, i) => ({
  id: ids[i], track, model: new VoiceModel(track.body, track.sampleRate),
}));

test('Demons adds the complete film and its source-time cuts alongside Tears', () => {
  expect(movieScene('doja-demons')).toHaveProperty('assetVersion', 'doja-demons-20261117');
  expect(movieScene('sabrina-tears')).toBeDefined();
  expect(scene.duration).toBeCloseTo(225.923016, 5);
  expect(scene.characters.map(c => c.id)).toEqual([...ids]);
  expect(scene.shots).toEqual(DEMONS_SHOTS.map(([time, view]) => ({time, view})));
  for (const [time, view] of [
    [7, 'demons-house'], [40, 'demons-ceiling-face'], [98.5, 'demons-bath-face'],
    [119, 'demons-attic-pack'], [146, 'demons-goats'], [200, 'demons-flames'],
    [210, 'demons-escape'], [217, 'demons-car'], [224, 'demons-end'],
  ] as const) expect(sceneCamera(scene, time, 'auto')).toBe(view);
  expect(score.parts.map(p => p.kind)).toEqual(['voice', 'voice', 'backing']);
  expect(score.parts.at(-1)?.recordingType).toBe('instrumental');
  expect(() => validateScene({...scene, characters: scene.characters.slice(0, 1)})).toThrow();
});

test('both physical voices have complete phones, audible phrases and exact audio clocks', () => {
  for (const [i, part] of score.parts.slice(0, 2).entries()) {
    const performance = part.performance!;
    const track = tracks[i];
    expect(validPerformance(performance, score.duration)).toBe(true);
    expect(part.recordingType).toBeUndefined();
    expect(track.duration).toBeCloseTo(score.duration, 1);
    expect(performance.phrases[0].start).toBeGreaterThan(24);
    for (const ipa of new Set(performance.phrases.flatMap(p => p.phones.map(p => p.ipa)))) {
      expect(skippedIpa(ipa)).toEqual({unknown: [], noSound: [], ignoredMarks: []});
    }
    const indices = part.melody!.notes.map(n => n.lyricIndex).sort((a, b) => a! - b!);
    expect(indices).toEqual(Array.from({length: indices.length}, (_, j) => j));
    for (const phrase of performance.phrases) {
      const end = phrase.start + phrase.phones.reduce((sum, c) => sum + c.duration, 0);
      let rms = 0;
      for (let frame = track.indexAt(phrase.start); frame <= track.indexAt(end); frame++) {
        rms = Math.max(rms, track.message(frame).t.outRms);
      }
      expect(rms).toBeGreaterThan(.0001);
    }
    for (let frame = 0; frame < track.frames; frame++) {
      const sample = track.message(frame).t;
      expect(sample.clock).toBeCloseTo(frame / 20, 4);
      expect(sample.artic.every(Number.isFinite)).toBe(true);
      if (frame < 460 || frame > 4200) expect(sample.outRms).toBeLessThan(.00001);
    }
  }
});

test('the stage restores props and poses on seeks and preserves the retained airways', () => {
  const people = makePeople();
  const stage = new DemonsStage(people);
  const {sets} = stage;
  const snapshot = () => [
    ...Object.values(sets.rooms).map(g => g.visible),
    sets.bedroom.ceiling.visible, sets.bath.curtain.visible, sets.bath.claw.visible,
    sets.attic.typewriter.visible, sets.attic.goats.visible, sets.attic.torch.visible,
    sets.outside.car.visible, ...sets.outside.car.matrixWorld.elements,
    ...sets.kitchen.flames.flatMap(m => [m.visible, ...m.matrixWorld.elements]),
    ...stage.actors.flatMap(a => a.figure.root.visible
      ? [true, ...a.figure.root.matrixWorld.elements, ...a.figure.hands.flatMap(h => h.matrixWorld.elements)]
      : [false]),
    ...stage.camera.matrixWorld.elements,
  ];
  try {
    expect(demonsState('wide', NaN)).toEqual(demonsState('wide', 0));
    expect(stage.actors.length).toBe(6);
    expect(new Set(stage.actors.map(a => a.figure.model)).size).toBe(2);
    for (const [time, view] of DEMONS_SHOTS) {
      stage.frame(time + .1, true, 1, view, .8);
      const before = snapshot();
      stage.frame(31, true, 2, 'demons-ceiling', .8);
      stage.frame(time + .1, false, 3, view, .8);
      expect(snapshot().every(v => typeof v === 'boolean' || Number.isFinite(v))).toBe(true);
      expect(snapshot()).toEqual(before);
    }
    stage.frame(40, true, 4, 'demons-ceiling-face', .8);
    expect(stage.actors[0].figure.root.rotation.z).toBeGreaterThan(2.9);
    stage.frame(147.7, true, 4, 'demons-typewriter', .8);
    expect(sets.attic.goats.visible).toBe(true);
    stage.frame(201, true, 4, 'demons-flames', .8);
    expect(sets.kitchen.flames.every(f => f.visible)).toBe(true);
    for (const [t, view] of [[98, 'demons-doja'], [224, 'demons-doja'], [36, 'demons-shadow']] as const) {
      stage.frame(t, false, 5, view, 0);
      expect(stage.actors.filter(a => a.figure.root.visible)).toHaveLength(1);
    }
  } finally {
    const dispose = spyOn(VoiceModel.prototype, 'dispose');
    stage.dispose();
    expect(dispose).toHaveBeenCalledTimes(0);
    dispose.mockRestore();
    people.forEach(p => p.model.dispose());
  }
});

test('visible mouths stay framed and clear of opaque props in each desktop and phone cut', () => {
  const people = makePeople();
  const stage = new DemonsStage(people);
  const point = new THREE.Vector3();
  let checked = 0;
  try {
    for (const [width, height] of [[960, 720], [375, 430]]) {
      stage.resize(width, height);
      for (const [i, [start, view]] of DEMONS_SHOTS.entries()) {
        for (const fraction of [.01, .5, .99]) {
          const time = start + Math.max(.05, ((DEMONS_SHOTS[i + 1]?.[0] ?? score.duration) - start) * fraction);
          stage.frame(time, true, 1, view, .8);
          for (const actor of stage.actors.filter(a => a.figure.root.visible)) {
            const figure = actor.figure;
            let inside = true;
            let count = 0;
            figure.head.scene.traverseVisible(object => {
              if (figure.ornaments.getObjectById(object.id)) return;
              const mesh = object as THREE.Mesh<THREE.InstancedBufferGeometry>;
              const vertices = mesh.geometry?.getAttribute('instanceStart');
              if (!vertices) return;
              for (let p = 0; p < mesh.geometry.instanceCount; p++) {
                point.fromBufferAttribute(vertices, p).applyMatrix4(mesh.matrixWorld).project(stage.camera);
                inside &&= Math.max(Math.abs(point.x), Math.abs(point.y)) < .99 && Math.abs(point.z) < 1;
                count++;
              }
            });
            expect(count).toBeGreaterThan(1000);
            expect({view, width, look: actor.look, inside}).toEqual({view, width, look: actor.look, inside: true});
            const track = figure.track;
            const at = actor.look === 'homeowner' ? 0 : time;
            const artic = VoiceModel.articFromArray(track.message(track.indexAt(at)).t.artic);
            const shape = figure.model.frame(artic);
            const upper = shape.upperLip.reduce((a, b) => a.x > b.x ? a : b);
            const lower = shape.lowerLip.reduce((a, b) => a.x > b.x ? a : b);
            const mouth = new THREE.Vector3((upper.x + lower.x) / 2, (upper.y + lower.y) / 2, 0)
              .applyMatrix4(figure.head.scene.children[0].matrixWorld);
            const distance = stage.camera.position.distanceTo(mouth);
            const ray = new THREE.Raycaster(stage.camera.position, mouth.sub(stage.camera.position).normalize());
            const blockers: THREE.Object3D[] = [];
            stage.scene.traverseVisible(object => {
              const mesh = object as THREE.Mesh<THREE.BufferGeometry, THREE.Material>;
              if (!mesh.isMesh || mesh.renderOrder >= 1000 || (mesh as any).isLineSegments2 || mesh.material.opacity <= .9) return;
              if (figure.head.scene.getObjectById(object.id) && !figure.ornaments.getObjectById(object.id)) return;
              mesh.geometry.computeBoundingBox();
              blockers.push(mesh);
            });
            const hits = ray.intersectObjects(blockers, false).filter(h => h.distance < distance - .1);
            expect(hits.map(h => ({view, width, look: actor.look, prop: (h.object as THREE.Mesh).geometry.type}))).toEqual([]);
            checked++;
          }
        }
      }
    }
    expect(checked).toBe(402);
  } finally {
    stage.dispose();
    people.forEach(p => p.model.dispose());
  }
}, 120000);
