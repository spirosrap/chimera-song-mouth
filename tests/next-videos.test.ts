import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { expect, test } from 'bun:test';
import * as THREE from 'three';
import { initEngine } from './harness.ts';
import { NEXT_VIDEO_CAST, NEXT_VIDEO_INFO, NEXT_VIDEO_SETTINGS } from '../src/scene/next-videos.ts';
import { sceneCamera, sceneCue, sceneViewChoices, validateScene } from '../src/scene/scene.ts';
import { TeleTrack } from '../src/show/tele.ts';
import { validPerformance } from '../src/band/performance.ts';
import type { Arrangement } from '../src/band/types.ts';

await initEngine();
const [{ VoiceModel }, { NextVideoStage }] = await Promise.all([
  import('../src/ui/analysis.ts'), import('../src/ui/render/next-videos.ts'),
]);

for (const setting of NEXT_VIDEO_SETTINGS) {
  const { id, shots } = NEXT_VIDEO_INFO[setting];
  test(id + ' keeps vocals and cameras on the original clock', () => {
    const directory = new URL('../public/scenes/' + id + '/', import.meta.url);
    const scene = validateScene(JSON.parse(readFileSync(new URL('scene.json', directory), 'utf8')));
    const arrangement: Arrangement = JSON.parse(readFileSync(new URL('performance.json', directory), 'utf8'));
    expect(arrangement.duration).toBe(scene.duration);
    expect(scene.characters.map(member => member.id)).toEqual([...NEXT_VIDEO_CAST[setting]]);
    expect(scene.shots.map(shot => [shot.time, shot.view])).toEqual(shots);
    expect(arrangement.parts.some(part => part.kind === 'backing' && part.recordingType === 'instrumental')).toBe(true);
    const actors = scene.characters.map(character => {
      const performance = arrangement.parts.find(part => part.id === character.id)?.performance;
      expect(performance && validPerformance(performance, scene.duration)).toBe(true);
      expect(performance!.contour.every(point => point.breath >= .72)).toBe(true);
      expect(sceneViewChoices(scene).some(view => view === character.id)).toBe(true);
      const buffer = Uint8Array.from(gunzipSync(readFileSync(new URL(character.tele + '.gz', directory)))).buffer;
      const track = new TeleTrack(buffer);
      return { id: character.id, track, model: new VoiceModel(track.body, track.sampleRate) };
    });
    const stage = new NextVideoStage(setting, actors);
    try {
      for (const [width, height] of [[960, 540], [390, 430]]) {
        stage.resize(width, height);
        const distinct = scene.shots.filter((shot, index) => scene.shots.findIndex(candidate => candidate.view === shot.view) === index);
        for (const { time, view } of distinct) {
          const look = time + .1;
          const cue = sceneCue(scene, look);
          const singer = Math.max(0, actors.findIndex(actor => actor.id === cue?.speaker));
          expect(sceneCamera(scene, look, 'auto')).toBe(view);
          stage.frame(look, true, 1, view, cue?.intensity ?? .5, cue?.speaker);
          const figure = stage.figures[singer].figure;
          expect(figure.root.visible).toBe(true);
          const position = figure.head.scene.getWorldPosition(new THREE.Vector3());
          const location = position.clone().project(stage.camera);
          expect(Math.max(Math.abs(location.x), Math.abs(location.y))).toBeLessThan(.76);
          const cameraRay = new THREE.Raycaster(stage.camera.position, position.clone().sub(stage.camera.position).normalize());
          const distance = position.distanceTo(stage.camera.position);
          const scenery: THREE.Mesh[] = [];
          stage.scene.traverseVisible(object => {
            if (object instanceof THREE.Mesh && object.material instanceof THREE.MeshBasicMaterial
              && !object.material.transparent && !figure.root.getObjectById(object.id)) scenery.push(object);
          });
          stage.scene.updateMatrixWorld(true);
          expect(cameraRay.intersectObjects(scenery, false).some(hit => hit.distance < distance - 6)).toBe(false);
          if (time === 0) {
            stage.frame(scene.duration - .2, false, 2, scene.shots.at(-1)!.view, 0);
            stage.frame(look, false, 3, view, cue?.intensity ?? .5, cue?.speaker);
            expect(figure.head.scene.getWorldPosition(new THREE.Vector3()).toArray()).toEqual(position.toArray());
          }
        }
      }
    } finally {
      stage.dispose();
      actors.forEach(actor => actor.model.dispose());
    }
  });
}
