import {expect, spyOn, test} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as THREE from 'three';
import {initEngine} from './harness.ts';
import {validPerformance} from '../src/band/performance.ts';
import type {Arrangement} from '../src/band/types.ts';
import {GNARLY_SHOTS, gnarlyState} from '../src/scene/gnarly.ts';
import {movieScene} from '../src/scene/library.ts';
import {sceneCamera, validateScene} from '../src/scene/scene.ts';
import {TeleTrack} from '../src/show/tele.ts';

await initEngine();
const {skippedIpa} = await import('../src/wasm/engine.ts');
const {VoiceModel} = await import('../src/ui/analysis.ts');
const {GnarlyStage} = await import('../src/ui/render/gnarly.ts');

const read = (name: string) => readFileSync(new URL('../public/scenes/gnarly/' + name, import.meta.url));
const score: Arrangement = JSON.parse(read('performance.json').toString());
const scene = validateScene(JSON.parse(read('scene.json').toString()));
const ids = ['gnarly-spoken','gnarly-verse','gnarly-chorus'] as const;
const tracks = ['spoken','verse','chorus'].map(name => {
  const bytes = gunzipSync(read(name + '.tele.gz'));
  return new TeleTrack(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
});
const makePeople = () => tracks.map((track, i) => ({
  id: ids[i], track, model: new VoiceModel(track.body, track.sampleRate),
}));

test('Gnarly appends the full tray to red-carpet edit', () => {
  expect(movieScene('gnarly')).toHaveProperty('assetVersion', 'gnarly-20261117');
  expect(movieScene('eins-zwei-drei')).toBeDefined();
  expect(scene.duration).toBeCloseTo(142.223923, 4);
  expect(scene.characters.map(c => c.id)).toEqual([...ids]);
  expect(scene.shots).toEqual(GNARLY_SHOTS.map(([time, view]) => ({time, view})));
  for (const [time, view] of [
    [1, 'gnarly-tray'], [15, 'gnarly-kitchen-overhead'], [30, 'gnarly-corridor'],
    [47.5, 'gnarly-club-above'], [60.4, 'gnarly-crowd-surf'], [71.1, 'gnarly-limo-duo'],
    [76.7, 'gnarly-crash'], [90, 'gnarly-hills'], [109.5, 'gnarly-carpet-aerial'],
    [134.6, 'gnarly-reflection'], [136, 'gnarly-end-sandwich'], [139.5, 'gnarly-logo'],
  ] as const) expect(sceneCamera(scene, time, 'auto')).toBe(view);
  expect(score.parts.map(p => p.kind)).toEqual(['voice', 'voice', 'voice', 'backing']);
  expect(score.parts.at(-1)?.recordingType).toBe('instrumental');
  expect(() => validateScene({...scene, characters: scene.characters.slice(0, 2)})).toThrow();
});

test('the three physical voices have complete phones, audible phrases and exact audio clocks', () => {
  expect(score.bpm).toBe(135);
  const chant = score.parts[2].melody!;
  expect(chant.lyrics?.match(/Na na na na na gnarly/gi)?.length).toBeGreaterThanOrEqual(12);
  for (const [i, part] of score.parts.slice(0, 3).entries()) {
    const performance = part.performance!;
    const track = tracks[i];
    expect(validPerformance(performance, score.duration)).toBe(true);
    expect(part.recordingType).toBeUndefined();
    expect(track.duration).toBeCloseTo(score.duration, 1);
    expect(performance.phrases[0].start).toBeGreaterThanOrEqual(0);
    expect(performance.phrases[0].start).toBeLessThan([1,47,8][i]);
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
      if (frame > 2740) expect(sample.outRms).toBeLessThan(.00001);
    }
  }
});

test('the stage restores props and poses on seeks and preserves the retained airways', () => {
  const people = makePeople();
  const stage = new GnarlyStage(people);
  const {sets} = stage;
  const snapshot = () => [
    ...Object.values(sets.rooms).map(room => room.visible),
    ...sets.tray.film.matrixWorld.elements, ...sets.kitchen.door.matrixWorld.elements,
    ...sets.street.car.matrixWorld.elements, ...sets.carpet.utensil.matrixWorld.elements,
    ...stage.camera.matrixWorld.elements,
    ...stage.actors.flatMap(a => a.figure.root.visible
      ? [true, ...a.figure.root.matrixWorld.elements, ...a.figure.hands.flatMap(h => h.matrixWorld.elements)]
      : [false]),
  ];
  try {
    expect(gnarlyState('wide', NaN)).toEqual(gnarlyState('wide', 0));
    expect(stage.actors.length).toBe(6);
    expect(new Set(stage.actors.map(a => a.figure.model)).size).toBe(3);
    for (const [t, view] of GNARLY_SHOTS) {
      stage.frame(t + .1, true, 1, view, .8);
      const before = snapshot();
      stage.frame(112.5, true, 2, 'gnarly-slice', .8);
      stage.frame(t + .1, false, 3, view, .8);
      expect(snapshot().every(v => typeof v === 'boolean' || Number.isFinite(v))).toBe(true);
      expect(snapshot()).toEqual(before);
    }
    stage.frame(47.5, true, 4, 'wide', .8);
    expect(stage.actors.filter(a => a.figure.root.visible)).toHaveLength(6);
    expect(sets.rooms.club.visible && !sets.club.ceiling.visible).toBe(true);
    stage.frame(60.4, true, 4, 'wide', .8);
    expect(sets.club.lift.visible).toBe(true);
    stage.frame(139.5, true, 4, 'wide', .8);
    expect(sets.rooms.card.visible && !sets.rooms.club.visible).toBe(true);
    for (const [t, view] of [[1,'gnarly-spoken'],[78,'gnarly-verse'],[106,'gnarly-chorus']] as const) {
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
  const stage = new GnarlyStage(people);
  const point = new THREE.Vector3();
  let checked = 0;
  try {
    for (const [width, height] of [[960, 720], [375, 430]]) {
      stage.resize(width, height);
      for (const [i, [start, view]] of GNARLY_SHOTS.entries()) {
        for (const fraction of [.01, .5, .99]) {
          const time = start + Math.max(.05, ((GNARLY_SHOTS[i + 1]?.[0] ?? score.duration) - start) * fraction);
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
            expect({view, width, look: actor.index, inside}).toEqual({view, width, look: actor.index, inside: true});
            const track = figure.track;
              const artic = VoiceModel.articFromArray(track.message(track.indexAt(time)).t.artic);
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
            expect(hits.map(h => ({view, width, look: actor.index, prop: (h.object as THREE.Mesh).geometry.type}))).toEqual([]);
            checked++;
          }
        }
      }
    }
    expect(checked).toBe(1902);
  } finally {
    stage.dispose();
    people.forEach(p => p.model.dispose());
  }
}, 120000);
