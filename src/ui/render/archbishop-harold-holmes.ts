import * as THREE from 'three';
import { ARCHBISHOP_SHOTS, type ArchbishopView } from '../../scene/archbishop-harold-holmes.ts';
import type { CameraView } from '../../scene/scene.ts';
import type { TeleTrack } from '../../show/tele.ts';
import type { VoiceModel } from '../analysis.ts';
import { VideoFigure, VideoProps, type VideoPoint as Point } from './videoProps.ts';

type Shot = { from: Point; to: Point; patient?: boolean; actorX?: number; roll?: number; cutaway?: boolean };
const SHOTS: Record<ArchbishopView, Shot> = {
  'holmes-organ': { from: [-146, 189, 137], to: [-157, 163, -26], cutaway: true },
  'holmes-pulpit': { from: [18, 173, 277], to: [0, 116, -5], actorX: 0 },
  'holmes-typewriter': { from: [85, 147, 116], to: [108, 96, 29], cutaway: true },
  'holmes-step': { from: [-37, 153, 289], to: [-27, 111, 9], actorX: -36 },
  'holmes-portrait': { from: [-52, 164, 139], to: [-23, 149, 7], actorX: -23, roll: .015 },
  'holmes-aisle': { from: [0, 185, 490], to: [0, 114, -21], actorX: 0 },
  'holmes-pews': { from: [53, 144, 342], to: [4, 113, -2], actorX: -4, roll: -.03 },
  'holmes-revival': { from: [-48, 152, 280], to: [-5, 122, 5], actorX: -9 },
  'holmes-charge': { from: [42, 168, 207], to: [0, 125, 10], actorX: 4, roll: .048 },
  'holmes-ward': { from: [51, 155, 355], to: [0, 101, 0], patient: true },
  'holmes-chair': { from: [-17, 141, 205], to: [0, 114, 12], patient: true },
  'holmes-doors': { from: [14, 131, 140], to: [0, 105, -158], patient: true, cutaway: true },
};

type Attendee = { root: THREE.Group; left: THREE.Mesh; right: THREE.Mesh; seated: boolean };
const SUITS = ['#314550', '#374d48', '#674850', '#585047', '#3a435a'];

export class ArchbishopStage {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(38, 16 / 9, .5, 1800);
  private readonly props = new VideoProps();
  private readonly chapel = new THREE.Group();
  private readonly ward = new THREE.Group();
  private readonly revival = new THREE.Group();
  private readonly actor: VideoFigure;
  private readonly patient: VideoFigure;
  private readonly audience: Attendee[] = [];
  private readonly sparklines = this.props.ink(this.revival);
  private readonly background = new THREE.Color();
  private lastTime = -1;
  private lastEpoch = -1;
  private lastShot?: ArchbishopView;

  constructor({ model, track }: { model: VoiceModel; track: TeleTrack }) {
    this.scene.background = this.background;
    this.scene.add(this.chapel, this.ward);
    this.chapel.add(this.revival);
    this.actor = new VideoFigure(model, track, this.props, this.chapel, '#315464', '#d6ad91');
    this.patient = new VideoFigure(model, track, this.props, this.ward, '#c2d3c7', '#d6ad91');
    this.costumes();
    this.buildChapel();
    this.buildWard();
  }

  private costumes() {
    const p = this.props;
    for (const subject of [this.actor, this.patient]) {
      for (let i = 0; i < 9; i++) {
        const strand = p.oval(subject.ornaments, [-7 + i * .32, 13 + Math.sin(i * .46) * 6, (i - 4) * 3.25],
          [9.5, 5.9 - i % 2 * 1.2, 2.7], i % 3 ? '#81716b' : '#ad8d77');
        strand.rotation.z = -.22;
      }
      for (const leg of subject.legs) (leg.material as THREE.MeshBasicMaterial).color.set(subject === this.actor ? '#253e50' : '#b1bec4');
    }
    for (const sleeve of this.actor.arms) (sleeve.material as THREE.MeshBasicMaterial).color.set('#dbcfc3');
    for (let i = -5; i <= 5; i++) p.box(this.actor.root, .43, 48, 1.15, '#667e8a', [i * 2.79, -42, 12.4]);
    for (const side of [-1, 1]) {
      p.box(this.actor.root, 6.1, 12.4, 1.7, '#ebe2d5', [side * 4, -15.5, 14.3]).rotation.z = side * .48;
    }
    p.box(this.actor.root, 4.24, 26, 2, '#222d43', [0, -28, 14.75]);
    for (let i = 0; i < 4; i++) p.oval(this.actor.root, [0, -43 - i * 6.3, 13], [1.3, 1.3, .7], '#c59d6a');
    for (let y = -66; y < -13; y += 7) {
      for (let x = -15; x <= 15; x += 6) p.box(this.patient.root, .9, 1.05, .8, '#8fa9ac', [x + (y % 2) * 2, y, 12.7]);
    }
  }

  private buildChapel() {
    const p = this.props, g = this.chapel;
    p.box(g, 704, 5, 703, '#5b4544', [0, -3, 91]);
    p.box(g, 90, 1, 520, '#753846', [0, .1, 107]);
    p.box(g, 450, 10, 248, '#64363f', [0, -1, -108]);
    for (let i = 0; i < 3; i++) p.box(g, 348 - i * 23, 5, 12, '#8a4956', [0, 1.45 + i * 2.6, 36 - i * 13]);
    p.box(g, 530, 329, 8, '#a68e75', [0, 167, -158]);
    p.box(g, 105, 286, 6, '#55413d', [0, 151, -151]);
    p.box(g, 92, 282, 3, '#354b4c', [0, 151, -146]);
    for (let x = -41; x <= 41; x += 7) p.box(g, .85, 265, 1.2, '#466267', [x, 149, -143.9]);
    p.box(g, 9.8, 107, 2, '#a46e3c', [0, 224, -142]);
    p.box(g, 61, 9.8, 2, '#a46e3c', [0, 239, -142]);
    p.box(g, 5.8, 104, 2, '#ffe4a1', [0, 224, -140.4]);
    p.box(g, 59, 5.6, 2, '#ffe4a1', [0, 239, -140.4]);
    for (const side of [-1, 1]) {
      const x = side * 86;
      p.box(g, 19, 286, 15, '#704e3f', [x, 141, -132]);
      p.box(g, 14, 278, 3, '#a47852', [x, 142, -122.5]);
      p.box(g, 26, 9, 23, '#543b36', [x, 6, -132]);
      p.box(g, 24, 8, 22, '#c09767', [x, 270, -132]);
      for (let pane = 0; pane < 4; pane++) {
        p.box(g, 18, 80, 1, ['#b8945d', '#6c9594', '#a06e67', '#d6ae70'][pane], [side * (120 + pane * 19), 198, -150]);
        p.box(g, 1, 81, 2, '#604d4a', [side * (111 + pane * 19), 198, -148]);
      }
      p.box(g, 83, 3, 2, '#604d4a', [side * 148, 198, -146]);
      p.tube(g, [side * 83, 73, -100], [side * 83, 106, -100], 2.05, '#dfc7a0');
      p.oval(g, [side * 83, 110, -100], [2.25, 4.7, 2.15], '#ffae61');
    }
    p.box(g, 146, 26, 29, '#735a4c', [0, 46, -103]);
    p.box(g, 153, 3.7, 35, '#b79b73', [0, 61, -103]);
    p.box(g, 41, 82, 21, '#6b4637', [0, 46, 40]);
    p.box(g, 54, 6, 33, '#a77a54', [0, 89, 40]).rotation.x = -.11;
    p.box(g, 33, 31, 2, '#3b6470', [0, 56, 51.1]);
    p.box(g, 4, 14, 2, '#c99c6b', [0, 56, 52.5]);
    p.box(g, 11, 3, 2, '#c99c6b', [0, 58, 52.5]);
    p.box(g, 71, 76, 42, '#655047', [-157, 44, -45]);
    p.box(g, 66, 4, 29, '#d5c5a3', [-157, 85, -25]);
    for (let i = 0; i < 11; i++) {
      const height = 47 + (10 - Math.abs(i - 5) * 1.7) * 8;
      p.tube(g, [-187 + 6 * i, 84, -53], [-187 + 6 * i, 84 + height, -53], 2.65, i % 2 ? '#98a3a2' : '#b0b3a7');
      p.box(g, 4.4, 1.7, .8, '#4c4645', [-187 + 6 * i, 99, -50]);
    }
    p.box(g, 58, 5, 45, '#89694f', [108, 78, 22]);
    for (const side of [-1, 1]) p.box(g, 5, 76, 5, '#75543e', [108 + 23 * side, 39, 24]);
    p.box(g, 34, 8, 24, '#2b5c65', [108, 86, 22]);
    p.box(g, 30, 8, 5, '#363643', [108, 94, 15]);
    p.box(g, 27, 19, .6, '#eddcc2', [108, 104, 14]).rotation.x = -.31;
    for (let i = 0; i < 8; i++) p.box(g, 2.4, 1.6, 3.3, '#dcc9a8', [95.5 + 3.5 * i, 91, 29]);
    for (const side of [-1, 1]) {
      for (let row = 0; row < 5; row++) {
        const z = 100 + row * 44;
        p.box(g, 102, 5, 22, '#996849', [side * 108, 25, z]);
        p.box(g, 102, 25, 3.7, '#785339', [side * 108, 47, z + 12]);
        for (const end of [57, 159]) p.box(g, 4.3, 54, 29, '#ad7952', [side * end, 26, z]);
        for (let seat = 0; seat < 3; seat++) this.addAttendee(g, [side * (71 + seat * 32), 0, z - 3], seat + row * 3 + (side + 1), true);
      }
    }
    for (let i = 0; i < 7; i++) this.addAttendee(this.revival, [(i - 3) * 38, 4, -35 + (i % 2) * 37], i + 2, false);
  }

  private addAttendee(group: THREE.Group, at: Point, i: number, seated: boolean) {
    const p = this.props, root = new THREE.Group();
    root.position.set(...at);
    root.scale.setScalar(.84 + (i % 5) * .036);
    group.add(root);
    const suit = SUITS[i % SUITS.length];
    const y = seated ? 72 : 108;
    const skin = ['#c9a089', '#d6b49a', '#916a5c', '#ac7e65'][i % 4];
    p.oval(root, [0, y, 0], [10.8, 13, 9.8], skin);
    p.oval(root, [0, y + 7, -2], [11.2, 7, 10], ['#c6b9ac', '#352e34', '#b48a62'][i % 3]);
    p.oval(root, [0, y - 30, 0], [18, 24, 10.5], suit);
    const left = p.tube(root, [-13, y - 21, 0], [-21, y - 46, 4], 5, suit);
    const right = p.tube(root, [13, y - 21, 0], [20, y - 45, 4], 5, suit);
    this.audience.push({ root, left, right, seated });
  }

  private buildWard() {
    const p = this.props, g = this.ward;
    p.box(g, 650, 4, 590, '#a2aeaa', [0, -3, 24]);
    p.box(g, 650, 229, 8, '#d1dac7', [0, 113, -169]);
    p.box(g, 650, 27, 2, '#8ba8a2', [0, 14, -164]);
    for (const side of [-1, 1]) {
      const x = side * 36;
      p.box(g, 70, 154, 2, '#529696', [x, 77, -163]);
      p.box(g, 62, 13, 1, '#477e85', [x, 135, -161.7]);
      p.box(g, 55, 62, 1, '#c0d3b8', [x, 91, -161.4]);
      p.box(g, 1.4, 18, 3, '#d1d4c4', [side * 7, 76, -159]);
      p.box(g, 83, 65, 1, '#e6e5cb', [side * 163, 115, -163]);
      for (let row = 0; row < 7; row++) p.box(g, 79, 1.3, 2, '#b1c5b7', [side * 163, 86 + row * 9, -161]);
      p.box(g, 9, 27, 1, '#656c79', [side * 96, 88, -162]);
      p.box(g, 7, 8, 1, '#d6e0cb', [side * 96, 94, -161]);
    }
    p.box(g, 49, 5, 43, '#577187', [0, 49, -2]);
    p.box(g, 43, 47, 7, '#6b8b9a', [0, 74, -22]);
    for (const side of [-1, 1]) {
      p.tube(g, [side * 26, 4, 15], [side * 26, 54, 12], 1.55, '#718692');
      p.tube(g, [side * 25, 54, 12], [side * 25, 54, -21], 2.2, '#61767f');
      const rim = p.mesh(g, new THREE.TorusGeometry(16, 1.4, 7, 26), [side * 28, 17, -9], '#536e77');
      rim.rotation.y = Math.PI / 2;
      p.tube(g, [side * 28, 17, -25], [side * 28, 17, 7], 1.13, '#65818a');
    }
    p.box(g, 56, 4, 34, '#688b95', [103, 43, -2]);
    p.box(g, 55, 27, 5, '#688b95', [103, 59, -18]);
    p.box(g, 25, 1.5, 18, '#b2c4b4', [106, 47, 2]).rotation.y = -.29;
    for (const [i, x] of [-126, 117].entries()) {
      const staff = new THREE.Group();
      staff.position.set(x, 0, i * 19 - 57);
      staff.rotation.y = i ? -.35 : .27;
      g.add(staff);
      const uniform = i ? '#365571' : '#5c7878';
      p.oval(staff, [0, 130, 0], [12.6, 15.1, 11.8], i ? '#bb9d85' : '#8c6f62');
      p.oval(staff, [0, 138, -2], [12.6, 6.6, 11.6], '#40434c');
      p.oval(staff, [0, 83, 0], [23, 32, 12], uniform);
      p.tube(staff, [-12, 2, 0], [-11, 59, 0], 6.4, uniform);
      p.tube(staff, [12, 2, 0], [11, 59, 0], 6.4, uniform);
      p.tube(staff, [-18, 101, 0], [-16, 65, 9], 4.7, uniform);
      p.tube(staff, [18, 101, 0], [10, 76, 19], 4.7, uniform);
      p.box(staff, 16, 22, 1.2, '#d8d3b7', [6, 78, 22]).rotation.z = -.18;
    }
  }

  resize(width: number, height: number) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.props.resize(width, height);
  }

  frame(time: number, playing: boolean, epoch: number, view: CameraView, intensity: number) {
    const automatic = ARCHBISHOP_SHOTS.filter(shot => shot.time <= time).at(-1)?.view ?? 'holmes-pulpit';
    const selected = view === 'holmes-preacher' ? 'holmes-portrait' : view === 'wide' ? automatic : view as ArchbishopView;
    const shot = SHOTS[selected] ?? SHOTS[automatic];
    const charge = time > 85.8 && time < 112.1 && !shot.cutaway;
    const beat = time * 10.69;
    this.chapel.visible = !shot.patient;
    this.ward.visible = Boolean(shot.patient);
    this.revival.visible = charge;
    this.actor.root.visible = !shot.cutaway;
    this.patient.root.visible = !shot.cutaway;
    this.background.set(shot.patient ? '#bdc9bb' : '#5d4945');
    const reset = this.lastEpoch !== epoch || this.lastShot !== selected || Math.abs(time - this.lastTime) > .18;
    const dt = reset ? 0 : Math.max(0, time - this.lastTime);
    const [x, y, z] = shot.from;
    this.camera.position.set(x + 3 * Math.sin(time * .94), y + 1.7 * Math.sin(time * 1.25), z);
    this.camera.up.set(Math.sin(shot.roll ?? 0), Math.cos(shot.roll ?? 0), 0);
    this.camera.lookAt(...shot.to);
    this.camera.fov = this.camera.aspect < 1 ? 51 : 37;
    this.camera.updateProjectionMatrix();
    this.camera.updateMatrixWorld();
    const figure = shot.patient ? this.patient : this.actor;
    if (!shot.cutaway) {
      const rise = charge ? 45 + 41 * Math.sin(beat * .43) ** 2 : 19 + intensity * 23;
      const pose: [Point, Point, Point, Point] = shot.patient
        ? [[-27, -35, 15], [-17, -25, 36], [25, -39, 15], [11, -27, 29]]
        : [[-29, -29, 8], [-27 - rise * .36, -47 + rise * Math.sin(beat * .53), 33],
          [30, -30, 9], [29 + rise * .27, -38 + rise * Math.cos(beat * .62), 34]];
      figure.root.position.set((shot.actorX ?? 0) + (shot.patient ? 0 : 5 * Math.sin(beat * .31)),
        shot.patient ? 116 : 153 + 2.2 * Math.sin(beat * .63), shot.patient ? 9 : 0);
      figure.pose(time, pose, Boolean(shot.patient));
      figure.head.scene.rotation.y += x * .0031;
      figure.head.scene.rotation.z = .045 * Math.sin(beat * .41);
      figure.update(time, playing, this.camera, dt, reset);
      if (charge) this.drawCharge(figure, beat);
    }
    if (!shot.patient) this.audience.forEach(({ root, left, right, seated }, i) => {
      const y = seated ? 72 : 108;
      const swing = Math.sin(beat * .38 + i * .87);
      root.rotation.z = (charge ? .13 : .034) * swing;
      const lifting = charge || (!seated && selected === 'holmes-pews');
      const lift = lifting ? 17 + 24 * Math.sin(beat * .32 + i * .77) ** 2 : 0;
      this.props.segment(left, [-13, y - 21, 0], [-22, y - 47 + lift, 8], 5);
      this.props.segment(right, [13, y - 21, 0], [22, y - 47 + lift * .84, 7], 5);
    });
    this.lastTime = time;
    this.lastEpoch = epoch;
    this.lastShot = selected;
  }

  private drawCharge(figure: VideoFigure, beat: number) {
    const p = this.props;
    this.sparklines.begin();
    for (const [i, hand] of figure.hands.entries()) {
      const x = figure.root.position.x + hand.position.x;
      const y = figure.root.position.y + hand.position.y;
      const z = figure.root.position.z + hand.position.z;
      const side = i === 0 ? -1 : 1;
      const arc: Point[] = [[x, y, z], [x + side * 18, y + 13, z - 3],
        [x + side * 12, y + 25 + 8 * Math.sin(beat * 1.4 + i), z - 7],
        [x + side * 36, y + 33, z - 18], [x + side * 51, y + 45, z - 34]];
      p.line(this.sparklines, arc, '#76a3d8', 2);
      p.line(this.sparklines, arc.slice(0, 3), '#d3e5e4', 1.4);
    }
    this.sparklines.end();
  }

  dispose() {
    this.actor.dispose();
    this.patient.dispose();
    this.props.dispose();
  }
}
