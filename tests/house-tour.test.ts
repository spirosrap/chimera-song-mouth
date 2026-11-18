import {expect, spyOn, test} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as THREE from 'three';
import {initEngine} from './harness.ts';
import {validPerformance} from '../src/band/performance.ts';
import type {Arrangement} from '../src/band/types.ts';
import {HOUSE_TOUR_SHOTS, houseTourState} from '../src/scene/house-tour.ts';
import {movieScene} from '../src/scene/library.ts';
import {sceneCamera, validateScene} from '../src/scene/scene.ts';
import {TeleTrack} from '../src/show/tele.ts';

await initEngine();
const {skippedIpa} = await import('../src/wasm/engine.ts');
const {VoiceModel} = await import('../src/ui/analysis.ts');
const {HouseTourStage} = await import('../src/ui/render/house-tour.ts');

const read = (name: string) => readFileSync(new URL('../public/scenes/house-tour/' + name, import.meta.url));
const score: Arrangement = JSON.parse(read('performance.json').toString());
const scene = validateScene(JSON.parse(read('scene.json').toString()));
const ids = ['tour-sabrina','tour-margaret','tour-madelyn'] as const;
const tracks = ['lead','harmony','reply'].map(name => {
  const bytes = gunzipSync(read(name + '.tele.gz'));
  return new TeleTrack(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
});
const makePeople = () => tracks.map((track, i) => ({
  id: ids[i], track, model: new VoiceModel(track.body, track.sampleRate),
}));

test('House Tour appends the full van, mansion, getaway and note edit', () => {
  expect(movieScene('house-tour')).toHaveProperty('assetVersion', 'house-tour-20261118');
  expect(movieScene('gnarly')).toBeDefined();
  expect(scene.duration).toBeCloseTo(214.879161, 4);
  expect(scene.characters.map(c => c.id)).toEqual([...ids]);
  expect(scene.shots).toEqual(HOUSE_TOUR_SHOTS.map(([time, view]) => ({time, view})));
  for (const [time, view] of [
    [1,'tour-van'], [6.5,'tour-heels'], [23,'tour-passage'], [38,'tour-sunken-sofa'],
    [58,'tour-red-stairs'], [79,'tour-bubbles'], [93.1,'tour-disco'], [104.4,'tour-racks'],
    [112.6,'tour-splash'], [166.8,'tour-security'], [185.4,'tour-van-portrait'], [206,'tour-note'],
  ] as const) expect(sceneCamera(scene, time, 'auto')).toBe(view);
  expect(score.parts.map(p => p.kind)).toEqual(['voice', 'voice', 'voice', 'backing']);
  expect(score.parts.at(-1)?.recordingType).toBe('instrumental');
  expect(() => validateScene({...scene, characters: scene.characters.slice(0, 2)})).toThrow();
});

test('the three physical voices have complete phones, audible phrases and exact audio clocks', () => {
  expect(score.bpm).toBe(115);
  expect(scene.cues.some(c => c.start>178 && c.start<186.5 && c.speaker==='tour-sabrina')).toBe(true);
  for (const [i, part] of score.parts.slice(0, 3).entries()) {
    const performance = part.performance!;
    const track = tracks[i];
    expect(validPerformance(performance, score.duration)).toBe(true);
    expect(part.recordingType).toBeUndefined();
    expect(track.duration).toBeCloseTo(score.duration, 1);
    expect(performance.phrases[0].start).toBeGreaterThanOrEqual(0);
    expect(performance.phrases[0].start).toBeLessThan([50,67,93][i]);
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
      if (frame < 925 || frame > 3770) expect(sample.outRms).toBeLessThan(.00001);
    }
  }
});

test('the stage restores props and poses on seeks and preserves the retained airways', () => {
  const people = makePeople();
  const stage = new HouseTourStage(people);
  const {sets} = stage;
  const snapshot = () => [
    ...Object.values(sets.rooms).map(room=>room.visible),
    ...sets.drive.van.body.matrixWorld.elements, ...sets.passage.door.matrixWorld.elements,
    ...(sets.rooms.card.visible ? [
      ...sets.card.spider.matrixWorld.elements, ...sets.card.legs.flatMap(leg=>leg.matrixWorld.elements),
    ] : []),
    ...stage.camera.matrixWorld.elements,
    ...stage.actors.flatMap(a => a.figure.root.visible
      ? [true, ...a.figure.root.matrixWorld.elements, ...a.figure.hands.flatMap(h => h.matrixWorld.elements)]
      : [false]),
  ];
  try {
    expect(houseTourState('wide', NaN)).toEqual(houseTourState('wide', 0));
    expect(stage.actors.length).toBe(3);
    expect(new Set(stage.actors.map(a => a.figure.model)).size).toBe(3);
    for (const [t, view] of HOUSE_TOUR_SHOTS) {
      stage.frame(t + .1, true, 1, view, .8);
      const before = snapshot();
      stage.frame(209.4, true, 2, 'tour-note', .8);
      stage.frame(t + .1, false, 3, view, .8);
      expect(snapshot().every(v => typeof v === 'boolean' || Number.isFinite(v))).toBe(true);
      expect(snapshot()).toEqual(before);
    }
    stage.frame(79, true, 4, 'wide', .8);
    expect(sets.rooms.bath.visible).toBe(true);
    expect(stage.actors.filter(a=>a.figure.root.visible)).toHaveLength(1);
    stage.frame(119.8, true, 4, 'wide', .8);
    expect(sets.pool.drops.every(m=>m.visible)).toBe(true);
    stage.frame(211, true, 4, 'wide', .8);
    expect(sets.rooms.card.visible && !sets.rooms.drive.visible).toBe(true);
    for (const [t, view] of [[63.7,'tour-sabrina'],[80,'tour-margaret'],[99.8,'tour-madelyn']] as const) {
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
  const stage = new HouseTourStage(people);
  const point = new THREE.Vector3();
  let checked = 0;
  try {
    for (const [width, height] of [[960, 720], [375, 430]]) {
      stage.resize(width, height);
      for (const [i, [start, view]] of HOUSE_TOUR_SHOTS.entries()) {
        for (const fraction of [.01, .5, .99]) {
          const time = start + Math.max(.05, ((HOUSE_TOUR_SHOTS[i + 1]?.[0] ?? score.duration) - start) * fraction);
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
    expect(checked).toBe(1236);
  } finally {
    stage.dispose();
    people.forEach(p => p.model.dispose());
  }
}, 120000);
