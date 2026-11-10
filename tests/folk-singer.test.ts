import {test,expect,spyOn} from 'bun:test';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as THREE from 'three';
import {TeleTrack} from '../src/show/tele.ts';
import {initEngine} from './harness.ts';
await initEngine();
const {FolkSinger}=await import('../src/ui/render/folkSinger.ts');
const {VoiceModel}=await import('../src/ui/analysis.ts');
const bytes=gunzipSync(readFileSync(new URL('../public/band/synnefoula/lead.tele.gz',import.meta.url)));
const track=new TeleTrack(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength));

function geometry(group:THREE.Object3D){
  const vertices:number[]=[];
  group.traverseVisible(object=>{
    const mesh=object as THREE.Mesh<THREE.InstancedBufferGeometry>;
    if(!mesh.geometry?.hasAttribute('instanceStart'))return;
    for(const name of ['instanceStart','instanceEnd']){
      const attr=mesh.geometry.getAttribute(name);
      for(let i=0;i<mesh.geometry.instanceCount;i++)vertices.push(attr.getX(i),attr.getY(i),attr.getZ(i));
    }
  });
  return vertices;
}

test('the full singer follows the real vocal and whistle track after pause, seek and restart',()=>{
  const model=new VoiceModel(track.body,track.sampleRate),singer=new FolkSinger(model,track,120),update=spyOn(singer.head,'update');
  try{
    for(const time of [8,25,track.duration,0]){
      singer.frame(time,true,1,true);
      const expected=VoiceModel.articFromArray(track.message(track.indexAt(time)).t.artic);
      const args=update.mock.calls.at(-1)!;
      expect(args[2]).toEqual(expected);expect(args[3]!.t.clock).toBeCloseTo(track.message(track.indexAt(time)).t.clock,6);
      if(time===8)expect(expected.lipProt).toBeGreaterThan(1);
      const hands=geometry(singer.hands.group),strings=geometry(singer.instrument.group);
      singer.frame(time,false,1,true);singer.frame(time,false,1,true);
      expect(geometry(singer.hands.group)).toEqual(hands);expect(geometry(singer.instrument.group)).toEqual(strings);
      expect(update.mock.calls.at(-1)![3]).toBeNull();
      singer.frame(50,true,2,true);singer.frame(time,true,3,true);
      expect(geometry(singer.hands.group)).toEqual(hands);
      expect(singer.actor.rotation.y).toBeFinite();
    }
    singer.frame(25,true,4,false);expect(update.mock.calls.at(-1)![3]).toBeNull();
  }finally{update.mockRestore();singer.dispose();model.dispose();}
});

test('hat, head and guitar neck stay framed on phone and desktop; attachments release their resources',()=>{
  const model=new VoiceModel(track.body,track.sampleRate),singer=new FolkSinger(model,track,120);
  const meshes:THREE.Mesh[]=[];singer.scene.traverse(o=>{if(o instanceof THREE.Mesh)meshes.push(o);});
  let released=0;for(const mesh of meshes)mesh.geometry.addEventListener('dispose',()=>released++);
  try{
    for(const [width,height] of [[900,760],[600,456],[350,430],[272,430]]){
      singer.resize(width,height);
      for(const time of [0,8,25,90,135]){
        singer.frame(time,true,1,true);
        let visibleVertices=0,allFramed=true;
        for(const object of [singer.head.scene,singer.instrument.group])object.traverseVisible(o=>{
          const mesh=o as THREE.Mesh<THREE.InstancedBufferGeometry>;
          if(!mesh.geometry?.hasAttribute('instanceStart'))return;
          const a=mesh.geometry.getAttribute('instanceStart');
          for(let i=0;i<mesh.geometry.instanceCount;i++){
            const world=new THREE.Vector3().fromBufferAttribute(a,i).applyMatrix4(mesh.matrixWorld);
            // The waist and lower guitar may leave the portrait, as in the reference.
            if(world.y< -48*model.tract.scale)continue;
            const p=world.project(singer.camera);
            visibleVertices++;allFramed &&= [p.x,p.y,p.z].every(Number.isFinite)&&Math.abs(p.x)<.98&&Math.abs(p.y)<.98&&p.z<1;
          }
        });
        expect(visibleVertices).toBeGreaterThan(2000);expect(allFramed).toBe(true);
      }
    }
  }finally{singer.dispose();model.dispose();}
  expect(singer.hat.group.parent).toBeNull();expect(released).toBe(meshes.length);
});
