import * as THREE from 'three';
import { VideoFigure, VideoProps, type VideoPoint as Point } from './videoProps.ts';
import type { VoiceModel } from '../analysis.ts';
import type { CameraView, CharacterId } from '../../scene/scene.ts';
import type { LavaId, LavaView } from '../../scene/lava-chicken.ts';
import type { TeleTrack } from '../../show/tele.ts';

type Actor = { model: VoiceModel; track: TeleTrack };
type Shot = { target: Point; offset: Point; span: number };
const STALL: Shot = { target: [-58, 153, 5], offset: [55, 37, 414], span: 324 };
const SHOTS: Record<LavaId | LavaView | 'wide', Shot> = {
  wide: { target: [2, 148, 0], offset: [60, 52, 620], span: 530 },
  'lava-stall': STALL,
  'lava-reaction': { target: [-32, 155, 1], offset: [-96, 31, 422], span: 300 },
  'lava-host': { target: [-105, 164, -46], offset: [24, 20, 294], span: 220 },
  'lava-guest': { target: [82, 151, 125], offset: [6, 9, 193], span: 165 },
  'lava-customer': { target: [187, 164, 96], offset: [-14, 12, 219], span: 187 },
  'lava-lever': { target: [-10, 158, -45], offset: [70, 32, 419], span: 340 },
  'lava-channel': { target: [43, 34, 4], offset: [140, 145, 198], span: 228 },
  'lava-channel-detail': { target: [108, 25, -52], offset: [-3, 73, 171], span: 138 },
  'lava-chicken': { target: [77, 56, 7], offset: [-42, 20, 173], span: 154 },
  'lava-solo': { target: [-104, 169, -44], offset: [32, 14, 276], span: 210 },
  'lava-ensemble': { target: [-12, 143, 14], offset: [78, 34, 464], span: 365 },
  'lava-belt': { target: [-104, 181, -46], offset: [-21, 5, 234], span: 187 },
  'lava-platter': { target: [-64, 101, 60], offset: [30, 86, 203], span: 180 },
};
const sand = ['#e3b675', '#d0a16a', '#be8d5b', '#f1c68a'];
const timber = '#805037';

export class LavaChickenStage {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(42, 16 / 9, 1, 5500);
  readonly props = new VideoProps();
  readonly host: VideoFigure;
  readonly guest: VideoFigure;
  readonly customer: VideoFigure;
  readonly chicken = new THREE.Group();
  readonly lever = new THREE.Group();
  readonly bell = new THREE.Group();
  readonly platter = new THREE.Group();

  private readonly chickenHead = new THREE.Group();
  private readonly chickenWings: THREE.Mesh[] = [];
  private readonly chickenFeet: THREE.Mesh[] = [];
  private readonly lava: { bed: THREE.Mesh; fleck: THREE.Mesh }[] = [];
  private readonly sparks: THREE.Mesh[] = [];
  private readonly vapor: THREE.Mesh[] = [];
  private previousTime: number | undefined;
  private epoch = -1;

  constructor(host: Actor, guest: Actor, customer: Actor) {
    const sky = '#acd2d2';
    this.scene.background = new THREE.Color(sky);
    this.scene.fog = new THREE.Fog(sky, 570, 1870);
    this.buildKitchen();
    this.buildChicken();

    this.host = this.figure(host, [-103, 178, -47], 1.28, '#218f92', '#0c565d', '#dfac7c');
    this.guest = this.figure(guest, [82, 150, 125], 1.03, '#bc4942', '#74343f', '#c08764');
    this.customer = this.figure(customer, [184, 181, 94], 1.25, '#a72d70', '#6f2050', '#d8a280');
    this.hair(this.host, '#4e493f', '#a09883', false);
    this.hair(this.guest, '#682931', '#e16255', false);
    this.hair(this.customer, '#422823', '#653b2b', true);
    this.box(this.host.root, [8, 23, 5], [-12, -26, 14], '#e0b785');
    this.box(this.guest.root, [8, 9, 5], [0, -19, 15], '#dcb764');
    for (const x of [-13, 13]) this.box(this.customer.root, [2.6, 55, 4], [x, -39, 13], '#e983ae');
    this.frame(0, false, 0, 'wide', 0);
  }

  /** Shade each face independently so the block geometry reads throughout the camera moves. */
  private box(parent: THREE.Object3D, size: Point, position: Point, color: string) {
    const mesh = this.props.box(parent, ...size, color, position);
    const faces = [0.77, 0.64, 1.14, 0.53, 1, 0.69];
    const values: number[] = [];
    for (const shade of faces) {
      const { r, g, b } = new THREE.Color(color).multiplyScalar(shade);
      for (let corner = 0; corner < 4; corner++) values.push(r, g, b);
    }
    mesh.geometry.setAttribute('color', new THREE.Float32BufferAttribute(values, 3));
    const material = mesh.material as THREE.MeshBasicMaterial;
    material.color.set('#ffffff');
    material.vertexColors = true;
    return mesh;
  }

  private buildKitchen() {
    const add = (size: Point, position: Point, color: string, group = this.scene as THREE.Object3D) =>
      this.box(group, size, position, color);

    add([2700, 18, 2400], [0, -17, -380], '#ae8d59');
    for (let row = 0; row < 10; row++) {
      for (let col = -9; col <= 9; col++) {
        const x = col * 58 + row % 2 * 29;
        const z = 323 - row * 53;
        if (x >= 6 && x < 200 && z < 65 && z > -160) continue;
        add([57, 8, 52], [x, -4, z], sand[Math.abs(row * 7 + col * 5) % sand.length]);
      }
    }
    for (let col = -5; col <= 5; col++) {
      const x = col * 166 + 36;
      if (Math.abs(x) < 230) continue;
      const z = -310 - (col % 3) ** 2 * 32;
      const h = 145 + Math.abs(col * 37 % 93);
      add([135, h, 134], [x, h / 2, z], sand[Math.abs(col) % sand.length]);
      for (let tier = 0; tier < 4; tier++) {
        add([153 - tier * 27, 13, 150 - tier * 19], [x, h + 7 + tier * 13, z], col % 2 ? '#944737' : '#686f4b');
      }
      add([46, 61, 3], [x + 14, h * .59, z + 68], '#553f31');
      add([51, 7, 12], [x + 14, h * .59 - 33, z + 71], '#b48356');
    }

    // Paneled rear wall and serving canopy.
    add([422, 255, 38], [0, 128, -194], '#c19b6f');
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 8; col++) {
        const x = -185 + col * 53 + (row % 2) * 12;
        add([51, 37, 11], [x, 20 + row * 40, -170], sand[(col * 3 + row) % sand.length]);
      }
    }
    add([404, 96, 5], [0, 206, -162], '#b68b61');
    add([162, 64, 6], [-113, 211, -157], '#675445');
    for (const x of [-184, -142, -100, -58]) add([23, 55, 10], [x, 212, -151], '#91bfb5');
    for (const x of [-209, 213]) {
      add([22, 280, 25], [x, 140, -116], timber);
      add([25, 18, 32], [x, 32, -116], '#aa7850');
      add([26, 17, 34], [x, 248, -116], '#aa7850');
    }
    add([463, 18, 26], [0, 271, -76], timber);
    for (let stripe = 0; stripe < 14; stripe++) {
      const x = -208 + stripe * 32;
      const color = stripe % 2 ? '#f8d8a6' : '#af4838';
      const tarp = add([32, 9, 198], [x, 290, -4], color);
      tarp.rotation.x = .16;
      add([32, 22, 8], [x, 262, 92], color);
    }

    // Serving counter and bell.
    add([164, 86, 71], [-99, 45, 61], '#8c5b3e');
    for (const x of [-162, -128, -94, -60, -26]) add([28, 66, 4], [x, 44, 98], '#a1714d');
    add([174, 12, 81], [-99, 91, 61], '#e1ab6f');
    add([169, 7, 75], [-99, 8, 62], '#563a2d');
    this.bell.position.set(-135, 101, 74);
    this.scene.add(this.bell);
    add([13, 3, 12], [0, 0, 0], '#7f4328', this.bell);
    add([9, 6, 9], [0, 4, 0], '#ecad44', this.bell);
    add([3, 5, 3], [0, 8, 0], '#ffe3a0', this.bell);

    // Sandstone oven, lever and stepped lava trough.
    add([144, 110, 54], [99, 55, -111], '#9d7454');
    add([101, 73, 6], [98, 52, -82], '#392a28');
    add([148, 18, 61], [99, 114, -108], '#d79456');
    add([129, 14, 52], [98, 129, -109], '#edb978');
    for (const x of [39, 159]) add([26, 87, 23], [x, 54, -78], '#dea86b');
    add([27, 118, 37], [-13, 59, -18], '#bc8c5b');
    add([30, 11, 43], [-13, 118, -18], '#efbf80');
    add([22, 18, 8], [-13, 126, 3], '#514841');
    this.lever.position.set(-13, 126, 9);
    this.scene.add(this.lever);
    add([7, 31, 7], [0, 12, 0], '#7e7466', this.lever);
    add([15, 14, 13], [0, 28, 0], '#b8513b', this.lever);

    for (const [i, [x, z]] of [[112, -66], [112, -43], [112, -20], [112, 3], [89, 3], [66, 3], [43, 3], [20, 3]].entries()) {
      const y = 25 - i * 1.25;
      add([24, 15, 23], [x, y - 10, z], '#493830');
      const bed = add([22, 2, 21], [x, y, z], '#de5524');
      const fleck = add([12, 1.6, 5], [x + 2, y + 1.6, z - 2], '#ffc24c');
      this.lava.push({ bed, fleck });
      if (i < 3) add([9, 14, 23], [x - 14, y + 2, z], '#a56c4c');
      if (i >= 3) add([23, 11, 7], [x, y + 1, z + 14], '#b57d53');
    }
    for (let n = 0; n < 6; n++) add([3, 4, 29], [52 + n * 9, 28, 3], '#5d4940');
    for (let n = 0; n < 13; n++) {
      this.sparks.push(this.props.box(this.scene, 3, 4, 3, n % 2 ? '#ffc25c' : '#fb742b', [0, 0, 0]));
      const puff = this.props.box(this.scene, 8, 8, 8, '#fff2c5', [0, 0, 0]);
      const material = puff.material as THREE.MeshBasicMaterial;
      material.transparent = true;
      material.depthWrite = false;
      this.vapor.push(puff);
    }

    this.platter.position.set(-64, 100, 75);
    this.scene.add(this.platter);
    add([41, 4, 29], [0, 0, 0], '#e8e3bc', this.platter);
    add([36, 3, 25], [0, 2, 0], '#fcf1cb', this.platter);
    add([24, 13, 16], [0, 9, 0], '#b76a39', this.platter);
    add([18, 6, 11], [0, 17, 0], '#d89753', this.platter);
    for (const side of [-1, 1]) add([13, 7, 5], [side * 13, 7, 8], '#a95f36', this.platter);
  }

  private buildChicken() {
    const white = '#f3e6c8';
    this.scene.add(this.chicken);
    this.chicken.add(this.chickenHead);
    this.chickenHead.position.set(0, 35, 12);
    this.box(this.chicken, [25, 22, 33], [0, 22, 0], white);
    this.box(this.chicken, [17, 17, 13], [0, 30, -17], '#e2cbae').rotation.x = -.48;
    this.box(this.chickenHead, [19, 19, 17], [0, 9, 0], white);
    this.box(this.chickenHead, [9, 6, 11], [0, 7, 12], '#e9aa3b');
    this.box(this.chickenHead, [5, 6, 4], [0, 1, 10], '#ba5336');
    for (const side of [-1, 1]) {
      this.box(this.chickenHead, [4, 4, 2], [side * 6, 12, 9], '#322c26');
      this.chickenWings.push(this.box(this.chicken, [5, 13, 19], [side * 14, 23, -2], '#e6d1b3'));
      this.chickenFeet.push(this.box(this.chicken, [4, 4, 13], [side * 7, 2, 4], '#d9a43f'));
      this.box(this.chicken, [4, 13, 4], [side * 7, 8, 0], '#c28a35');
    }
  }

  private figure(actor: Actor, position: Point, scale: number, coat: string, dark: string, skin: string) {
    const fig = new VideoFigure(actor.model, actor.track, this.props, this.scene, coat, skin);
    fig.root.position.set(...position);
    fig.root.scale.setScalar(scale);
    fig.head.scene.scale.setScalar(2.06);
    fig.torso.visible = false;
    this.box(fig.root, [40, 62, 25], [0, -40, 0], coat);
    this.box(fig.root, [41, 8, 26], [0, -68, 0], dark);
    return fig;
  }

  private hair(fig: VideoFigure, dark: string, light: string, long: boolean) {
    // Keep costume geometry behind the mouth, including in the angled coverage.
    this.box(fig.root, [31, long ? 33 : 25, 7], [0, 8, -14], dark);
    for (const [i, h] of [5, 7, 8, 6, 5].entries()) {
      this.box(fig.root, [7, h, 17 - i % 2 * 4], [(i - 2) * 6, 23 + h / 2, -7], i % 3 ? dark : light);
    }
    if (long) {
      for (const x of [-18, 17]) {
        this.box(fig.root, [7, 42, 9], [x, -7, -12], dark);
        this.box(fig.root, [9, 25, 7], [x * 1.1, -27, -8], light);
      }
    }
  }

  resize(w: number, h: number) {
    this.camera.aspect = w / Math.max(1, h);
    this.camera.updateProjectionMatrix();
    this.props.resize(w, h);
  }

  frame(time: number, playing: boolean, epoch: number, view: CameraView, intensity: number, speaker?: CharacterId) {
    const reset = this.epoch !== epoch || this.previousTime === undefined || Math.abs(time - this.previousTime) > .24;
    const dt = reset ? 1 / 30 : Math.max(1 / 120, time - (this.previousTime ?? time));
    this.epoch = epoch;
    this.previousTime = time;

    const pulled = THREE.MathUtils.smoothstep(time, 6.56, 7.54);
    const flare = THREE.MathUtils.smoothstep(time, 7.85, 10.8);
    const cooked = THREE.MathUtils.smoothstep(time, 40.94, 41.21);
    this.lever.rotation.x = -.46 + 1.5 * pulled;
    this.bell.rotation.z = time >= 4 ? .33 * Math.exp(-7 * (time - 4)) * Math.sin((time - 4) * 42) : 0;
    this.platter.visible = cooked > 0;
    this.platter.position.x = -98 + 34 * cooked;

    for (const [i, { bed, fleck }] of this.lava.entries()) {
      const heat = THREE.MathUtils.smoothstep(flare * 10 - i, 0, 1.25);
      const pulse = .9 + .1 * Math.sin(13 * time - i * 1.9);
      (bed.material as THREE.MeshBasicMaterial).color.setRGB(.1 + .9 * heat * pulse, .088 + .28 * heat * pulse, .08 + .1 * heat);
      fleck.visible = heat > .6;
      fleck.scale.x = .51 + .45 * pulse;
      fleck.position.x = bed.position.x + 5 * Math.sin(9 * time - i * .8);
    }

    const hop = Math.max(0, Math.sin((time - 13.1) * 12)) * 9;
    const birdStart = THREE.MathUtils.smoothstep(time, 12.99, 13.28);
    this.chicken.visible = birdStart > 0 && time < 41.1;
    this.chicken.position.set(76 + Math.sin(time * 1.9) * 5, 29 + hop * birdStart, 2);
    this.chicken.rotation.y = -.13 + .38 * Math.sin(3 * time);
    this.chickenHead.rotation.x = .25 * Math.sin(time * 18);
    for (const [i, wing] of this.chickenWings.entries()) {
      const direction = i === 0 ? -1 : 1;
      wing.rotation.z = direction * (.18 + hop * .071);
      this.chickenFeet[i].rotation.x = direction * hop * .05;
    }

    for (const [i, spark] of this.sparks.entries()) {
      const u = (time * 1.27 + i * .618) % 1;
      spark.visible = flare > .16 && time < 45.1;
      spark.position.set(111 - i * 6.8 + u * 10, 25 + u * (26 + i % 4 * 12), -27 + i % 5 * 9);
      spark.scale.setScalar(.35 + (1 - u) * .71);
      const puff = this.vapor[i];
      const v = (time * .63 + i * .428) % 1;
      puff.visible = time >= 12.85 && time <= 46.15;
      puff.position.set((cooked ? -63 : 71) + Math.sin(v * 3 + i) * 12 + v * 13, (cooked ? 125 : 57) + v * 52, cooked ? 76 : -3 + i % 4 * 3);
      puff.scale.setScalar(.28 + v * 1.2);
      (puff.material as THREE.MeshBasicMaterial).opacity = Math.sin(v * Math.PI) * .24;
    }

    const song = time >= 24.23 && time < 41.1;
    const active = speaker === 'lava-host' ? intensity : 0;
    const bounce = song ? Math.sin((time - 24.23) * Math.PI * 3.6) : Math.sin(time * 6) * .3;
    const gesture = song ? .37 + active * .53 : active * .62;
    const pullPose = Math.exp(-((time - 7.02) ** 2) / .32);
    this.host.pose(time, [
      [-29, -29, 13], [-27 - gesture * 12, -40 + gesture * (28 + 10 * bounce), 27 + active * 3],
      [29 + pullPose * 8, -22, 12], [32 + 38 * pullPose, -42 + 30 * gesture + 25 * pullPose, 31 + 30 * pullPose],
    ]);
    this.host.root.position.y = 178 + bounce * gesture * 4;
    this.host.head.scene.rotation.x = -.035 - .13 * active * Math.max(0, bounce);
    const reaction = Math.exp(-((time - 20.88) ** 2) / .35);
    this.guest.pose(time, [[-25, -32, 6], [-20, -57, 12], [23, -31, 11], [20, -58 + reaction * 19, 17]]);
    this.guest.head.scene.rotation.x = reaction * .15;
    const take = THREE.MathUtils.smoothstep(time, 44.3, 46.5);
    this.customer.pose(time, [[-25, -29, 8], [-25 - take * 9, -57 + take * 21, 16], [26, -31, 9], [24, -56, 15]]);
    this.customer.head.scene.rotation.x = take * .12 + (speaker === 'lava-customer' ? Math.sin(time * 9) * .045 : 0);

    let shot: Shot = Object.hasOwn(SHOTS, view) ? SHOTS[view as keyof typeof SHOTS] : STALL;
    const portrait = this.camera.aspect < 1.18;
    if (portrait && (view === 'wide' || view === 'lava-reaction' || view === 'lava-ensemble' || view === 'lava-lever')) {
      // Reframe in narrow players while retaining the active mouth.
      shot = speaker === 'lava-guest' ? SHOTS['lava-guest'] : SHOTS['lava-stall'];
    }
    const aim = new THREE.Vector3(...shot.target);
    aim.x += Math.sin(time * .83) * (song ? 4 : 1.8);
    const offset = new THREE.Vector3(...shot.offset);
    const horizontalHalfSpan = offset.length() * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2)) * this.camera.aspect;
    const zoomOut = Math.max(1, Math.min(1.68, shot.span * .39 / horizontalHalfSpan));
    this.camera.position.copy(aim).addScaledVector(offset, zoomOut);
    this.camera.lookAt(aim);
    this.camera.updateMatrixWorld();

    for (const fig of [this.host, this.guest, this.customer]) fig.update(time, playing, this.camera, dt, reset);
  }

  dispose() {
    this.host.dispose();
    this.guest.dispose();
    this.customer.dispose();
    this.props.dispose();
  }
}
