import {Vector3} from 'three';
import {expect,test} from 'bun:test';
import {snapPose,synthesizeSnaps} from '../src/band/snaps.ts';
import {loadBandAssets} from '../src/band/assets.ts';
import {loadBandArrangement,DEFAULT_BAND} from '../src/band/library.ts';
import type {BandPart} from '../src/band/types.ts';
import {SnappingHand} from '../src/ui/render/snapHand.ts';
const events=[{time:.4,accent:1},{time:1.4,accent:.7}];
test('snaps sound on the original backing clock and leave the spaces silent',()=>{
 const a=synthesizeSnaps(events,2),b=synthesizeSnaps(events,2);
 expect(a).toEqual(b);expect(a.length).toBe(96000);expect(a.every(Number.isFinite)).toBe(true);
 expect(a.slice(0,19000).every(x=>x===0)).toBe(true);expect(a.slice(24000,67000).every(x=>x===0)).toBe(true);
 const rms=(start:number,end:number)=>Math.sqrt(a.slice(start*48000,end*48000).reduce((n,x)=>n+x*x,0)/((end-start)*48000));
 expect(rms(.4,.43)).toBeGreaterThan(.03);expect(rms(.75,.8)).toBe(0);expect(Math.max(...a)).toBeLessThan(1);
});
test('the thumb prepares before the sound, releases on it, and restores after backwards seeks',()=>{
 expect(snapPose(events,0).grip).toBe(0);expect(snapPose(events,.38).grip).toBeGreaterThan(.8);
 expect(snapPose(events,.4).flash).toBe(1);expect(snapPose(events,.44).strike).toBeGreaterThan(.9);
 expect(snapPose(events,.8).flash).toBe(0);expect(snapPose(events,.8).grip).toBe(0);
 expect(snapPose(events,.38)).toEqual(snapPose(events,.38));expect(snapPose(events,2).count).toBe(2);
});
test('the robotic hand contains five articulated digits and finite motion when paused or seeking',()=>{
 const hand=new SnappingHand();try{
 expect(hand.fingers.length).toBe(4);expect(hand.thumb.length).toBe(3);
 for(const t of [.38,.44,1.44,0,.38]){hand.resize(500,430);hand.frame(events,t,true);hand.scene.traverse(o=>expect(o.matrixWorld.elements.every(Number.isFinite)).toBe(true));}
 hand.frame(events,.399,true);const middle=hand.fingers[1][2].localToWorld(new Vector3(0,2.4,0)),thumb=hand.thumb[2].localToWorld(new Vector3(0,2,0));expect(middle.distanceTo(thumb)).toBeLessThan(1.2);
 hand.frame(events,.44,true);const pose=hand.fingers[1][0].rotation.x;hand.frame(events,.44,false);expect(hand.fingers[1][0].rotation.x).toBe(pose);
 }finally{hand.dispose();}
});
test('finger clicks are independently mixed audio and never request a vocal tract',async()=>{
 const part:BandPart={id:'snaps',kind:'hand',name:'Hand',role:'Clicks',body:{female:0,child:0},volume:.7,pan:0,snaps:events};
 const urls:string[]=[];const buffer={} as AudioBuffer;
 const loaded=await loadBandAssets('test',[part],async()=>buffer,async url=>{urls.push(url);return new Response(new Uint8Array([1,2]));});
 expect(urls).toEqual(['/band/test/snaps.mp3']);expect(loaded[0]).toEqual({buffer,track:null});
 const song={...DEFAULT_BAND,arrangementUrl:'/test.json'},score={...DEFAULT_BAND.arrangement,parts:[part]};
 expect((await loadBandArrangement(song,async()=>new Response(JSON.stringify(score)))).parts[0].kind).toBe('hand');
 for(const invalid of [[{time:-1,accent:1}],[{time:1,accent:2}],events.slice().reverse()]){
  await expect(loadBandArrangement(song,async()=>new Response(JSON.stringify({...score,parts:[{...part,snaps:invalid}]})))).rejects.toThrow('finger-click');
 }
});
