import * as THREE from 'three';
import { VideoProps, VideoFigure, type VideoPoint as P } from './videoProps.ts';
import type { VoiceModel } from '../analysis.ts';
import type { TeleTrack } from '../../show/tele.ts';
import type { CameraView, CharacterId } from '../../scene/scene.ts';
import { bodyPoint } from './profile.ts';

export type ElevatorId = 'elev-nico' | 'elev-kevin' | 'elev-operator';

const alleyBg = '#0d1112';
const alleyBrick = '#2b241f';
const alleyAsphalt = '#15181a';
const amberLamp = '#e89d42';
const cabinBg = '#0b1318';
const steelDark = '#18242c';
const steelMid = '#283842';
const ledWhite = '#f0f7ff';
const ledCyan = '#64d8ff';
const raveBg = '#041226';
const raveBlue = '#10448a';
const raveLaser = '#48c6ff';
const raveCyan = '#8cf0ff';
const skinTone = '#dfc0a8';
const nicoCoat = '#b8ad96';
const kevinJacket = '#3a322c';
const kevinShirt = '#bf5628';
const operatorFur = '#edf2f7';
const operatorSilver = '#bac8d6';

/**
 * Procedural 3D stage for Electric Callboy — ELEVATOR OPERATOR.
 * Mirrors the music video progression:
 * night brick alley -> glowing elevator doors -> geometric white LED cabin ->
 * elevator shaft launch -> white floor & aquarium reveals -> blue rave club & metal band ->
 * backlit operator halo -> zero-gravity floating finale.
 */
export class ElevatorOperatorStage {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(36, 16 / 9, 1, 18000);
  readonly props = new VideoProps();

  readonly alleyGroup = new THREE.Group();
  readonly cabinGroup = new THREE.Group();
  readonly shaftGroup = new THREE.Group();
  readonly panelGroup = new THREE.Group();
  readonly whiteFloorGroup = new THREE.Group();
  readonly aquariumGroup = new THREE.Group();
  readonly raveGroup = new THREE.Group();

  readonly leftDoor: THREE.Mesh;
  readonly rightDoor: THREE.Mesh;
  readonly ledStrips: THREE.Mesh[] = [];
  readonly shaftStreaks: THREE.Mesh[] = [];
  readonly panelButtons: THREE.Mesh[] = [];
  readonly fishMeshes: THREE.Mesh[] = [];
  readonly raveLasers: THREE.Mesh[] = [];
  readonly crowdArms: THREE.Mesh[] = [];
  readonly bandStage = new THREE.Group();

  readonly nico: VideoFigure;
  readonly kevin: VideoFigure;
  readonly operator: VideoFigure;
  readonly kevinGlasses = new THREE.Group();
  readonly opGlasses = new THREE.Group();
  readonly furCollar = new THREE.Group();

  private width = 1280;
  private height = 720;
  private last: number | null = null;
  private epoch = -1;

  constructor(
    readonly people: { id: ElevatorId; model: VoiceModel; track: TeleTrack }[]
  ) {
    if (people.length !== 3) {
      throw Error('ELEVATOR OPERATOR needs three retained physical singers.');
    }
    const byId = (id: ElevatorId) => people.find(p => p.id === id) ?? people[0];
    const pNico = byId('elev-nico');
    const pKevin = byId('elev-kevin');
    const pOp = byId('elev-operator');

    this.scene.background = new THREE.Color(alleyBg);
    this.scene.add(
      this.alleyGroup,
      this.cabinGroup,
      this.shaftGroup,
      this.panelGroup,
      this.whiteFloorGroup,
      this.aquariumGroup,
      this.raveGroup
    );

    this.buildAlley();
    const doors = this.buildCabin();
    this.leftDoor = doors.left;
    this.rightDoor = doors.right;
    this.buildShaft();
    this.buildPanel();
    this.buildWhiteFloor();
    this.buildAquarium();
    this.buildRaveClub();

    // 1. Nico — beige trench coat, dark mullet & mustache
    this.nico = new VideoFigure(pNico.model, pNico.track, this.props, this.scene, nicoCoat, skinTone);
    this.nico.head.scene.scale.setScalar(2.05);
    this.styleNico();

    // 2. Kevin — dark jacket over orange-striped shirt, retro glasses, dark mullet & mustache
    this.kevin = new VideoFigure(pKevin.model, pKevin.track, this.props, this.scene, kevinJacket, skinTone);
    this.kevin.head.scene.scale.setScalar(2.05);
    this.styleKevin();

    // 3. Elevator Operator — fluffy white fur coat, silver disco shirt, blonde mullet & wire glasses
    this.operator = new VideoFigure(pOp.model, pOp.track, this.props, this.scene, operatorFur, skinTone);
    this.operator.head.scene.scale.setScalar(2.1);
    this.styleOperator();

    this.resize(1280, 720);
    this.frame(0, false, 0, 'elev-alley', 0);
  }

  private buildAlley() {
    const p = this.props;
    const g = this.alleyGroup;

    // Wet dark asphalt ground
    p.box(g, 3200, 8, 3200, alleyAsphalt, [0, -4, -600]);
    // Brick warehouse back wall & side walls
    p.box(g, 2800, 900, 16, alleyBrick, [0, 440, -520]);
    p.box(g, 16, 900, 1800, '#221c18', [-760, 440, -100]);
    p.box(g, 16, 900, 1800, '#221c18', [760, 440, -100]);

    // Glowing elevator doorway embedded into the brick warehouse wall
    p.box(g, 260, 380, 22, '#0f161b', [0, 190, -508]);
    p.box(g, 224, 348, 8, '#d4ecff', [0, 180, -496]);
    // Geometric white LED strip framing inside the glowing doorway
    p.tube(g, [-70, 20, -490], [-70, 240, -490], 3.5, ledWhite);
    p.tube(g, [70, 20, -490], [70, 240, -490], 3.5, ledWhite);
    p.tube(g, [-70, 240, -490], [-25, 310, -490], 3.5, ledWhite);
    p.tube(g, [70, 240, -490], [25, 310, -490], 3.5, ledWhite);

    // Warm amber overhead street lamps
    for (const x of [-420, 420]) {
      p.tube(g, [x, 560, -510], [x, 560, -420], 4, '#444b52');
      p.oval(g, [x, 550, -420], [18, 9, 18], amberLamp);
      const cone = p.mesh(g, new THREE.ConeGeometry(180, 520, 16, 1, true), [x, 290, -420], amberLamp);
      Object.assign(cone.material, { transparent: true, opacity: 0.08, depthWrite: false, side: THREE.DoubleSide });
    }
    // Alley crates / pallets on left
    p.box(g, 120, 85, 90, '#3a2b1c', [-420, 42, -390]);
    p.box(g, 90, 60, 80, '#4c3824', [-310, 30, -410]);
  }

  private buildCabin(): { left: THREE.Mesh; right: THREE.Mesh } {
    const p = this.props;
    const g = this.cabinGroup;

    // Dark brushed-steel elevator floor, ceiling & walls (spacious enough for cameras)
    p.box(g, 760, 10, 760, '#10181f', [0, -5, -80]);
    p.box(g, 760, 10, 760, '#0e161d', [0, 420, -80]);
    p.box(g, 760, 430, 12, steelDark, [0, 210, -340]);
    p.box(g, 12, 430, 760, steelMid, [-360, 210, -80]);
    p.box(g, 12, 430, 760, steelMid, [360, 210, -80]);

    // Iconic angular geometric white LED strips on back wall (chevron / circuit motif from video)
    const addLed = (a: P, b: P, r = 4) => {
      const m = p.tube(g, a, b, r, ledWhite);
      this.ledStrips.push(m);
    };
    // Center halo circuit behind performers
    addLed([-110, 20, -328], [-110, 210, -328], 4.5);
    addLed([-110, 210, -328], [-65, 265, -328], 4.5);
    addLed([-65, 265, -328], [-65, 390, -328], 4.5);
    addLed([110, 20, -328], [110, 210, -328], 4.5);
    addLed([110, 210, -328], [65, 265, -328], 4.5);
    addLed([65, 265, -328], [65, 390, -328], 4.5);

    // Outer back wall circuit lines
    addLed([-250, 30, -328], [-250, 175, -328], 3.5);
    addLed([-250, 175, -328], [-210, 220, -328], 3.5);
    addLed([-210, 220, -328], [-210, 395, -328], 3.5);
    addLed([250, 30, -328], [250, 175, -328], 3.5);
    addLed([250, 175, -328], [210, 220, -328], 3.5);
    addLed([210, 220, -328], [210, 395, -328], 3.5);

    // Side wall angular LED tubes (visible in fisheye & cabin shots)
    for (const sign of [-1, 1]) {
      const x = sign * 348;
      addLed([x, 30, -240], [x, 210, -240], 4);
      addLed([x, 210, -240], [x, 260, -170], 4);
      addLed([x, 260, -170], [x, 400, -170], 4);
      addLed([x, 25, -40], [x, 180, -40], 4);
      addLed([x, 180, -40], [x, 240, 20], 4);
      addLed([x, 240, 20], [x, 400, 20], 4);
    }

    // Ceiling diamond LED frame
    addLed([0, 412, -260], [-200, 412, -80], 4.5);
    addLed([-200, 412, -80], [0, 412, 100], 4.5);
    addLed([0, 412, 100], [200, 412, -80], 4.5);
    addLed([200, 412, -80], [0, 412, -260], 4.5);

    // Sliding steel elevator doors in front (animated open/closed)
    const left = p.box(g, 200, 410, 14, '#24313a', [-105, 205, 190]);
    const right = p.box(g, 200, 410, 14, '#24313a', [105, 205, 190]);
    return { left, right };
  }

  private buildShaft() {
    const p = this.props;
    const g = this.shaftGroup;

    // Deep vertical elevator shaft framing & rushing light streaks
    for (let ring = 0; ring < 14; ring++) {
      const y = -600 + ring * 220;
      p.box(g, 620, 10, 10, '#1f2b33', [0, y, -310]);
      p.box(g, 620, 10, 10, '#1f2b33', [0, y, 310]);
      p.box(g, 10, 10, 620, '#1f2b33', [-310, y, 0]);
      p.box(g, 10, 10, 620, '#1f2b33', [310, y, 0]);
    }
    for (let i = 0; i < 32; i++) {
      const angle = (i / 32) * Math.PI * 2;
      const r = 250 + (i % 3) * 30;
      const col = i % 4 === 0 ? amberLamp : i % 2 === 0 ? ledWhite : ledCyan;
      const m = p.box(g, 8, 120 + (i % 5) * 45, 8, col, [Math.cos(angle) * r, (i - 16) * 140, Math.sin(angle) * r]);
      this.shaftStreaks.push(m);
    }
  }

  private buildPanel() {
    const p = this.props;
    const g = this.panelGroup;

    // Dark brushed metal wall panel
    p.box(g, 520, 600, 12, '#141e25', [0, 180, -80]);
    // Illuminated dark glass console box
    p.box(g, 160, 260, 16, '#080e14', [0, 185, -66]);
    p.box(g, 146, 246, 4, '#111d27', [0, 185, -56]);
    // Top backlit header ("ELEVATOR OPERATOR" plaque)
    p.box(g, 118, 42, 4, '#d9f0ff', [0, 266, -53]);
    p.box(g, 92, 6, 4, '#111d27', [0, 274, -50]);
    p.box(g, 92, 6, 4, '#111d27', [0, 258, -50]);

    // 3x3 circular glowing button grid
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const x = (col - 1) * 40;
        const y = 205 - row * 46;
        p.mesh(g, new THREE.TorusGeometry(13, 2.2, 8, 20), [x, y, -51], ledCyan);
        const btn = p.mesh(g, new THREE.CircleGeometry(10.5, 20), [x, y, -50], '#162836');
        this.panelButtons.push(btn);
      }
    }
  }

  private buildWhiteFloor() {
    const p = this.props;
    const g = this.whiteFloorGroup;
    // Blinding surreal pure-white room behind elevator opening
    p.box(g, 900, 520, 10, '#f5f8fc', [0, 230, -520]);
    p.box(g, 900, 10, 600, '#eef3f9', [0, -2, -260]);
    p.box(g, 10, 520, 600, '#e5ecf5', [-440, 230, -260]);
    p.box(g, 10, 520, 600, '#e5ecf5', [440, 230, -260]);
    // Tiny yellow toy figures scattered across the floor (0:50 frame!)
    for (let i = 0; i < 14; i++) {
      const x = ((i % 7) - 3) * 58 + (i % 2) * 14;
      const z = -220 - Math.floor(i / 7) * 90;
      p.oval(g, [x, 12, z], [9, 12, 9], '#f2c94c');
      p.oval(g, [x, 25, z], [6, 6, 6], '#f7d86c');
    }
  }

  private buildAquarium() {
    const p = this.props;
    const g = this.aquariumGroup;
    // Dark hall frame with glowing cyan-blue aquarium tank in center (1:25 frame!)
    p.box(g, 1100, 620, 14, '#131d24', [0, 240, -560]);
    p.box(g, 380, 250, 20, '#0a2536', [0, 195, -545]);
    p.box(g, 356, 224, 8, '#1782b8', [0, 195, -532]);
    // Aquarium plants & coral silhouettes
    for (let i = 0; i < 9; i++) {
      const x = -140 + i * 35;
      p.tube(g, [x, 86, -524], [x + (i % 2 ? 12 : -12), 145 + (i % 3) * 24, -524], 4, '#24a86e');
    }
    // Animated swimming fish
    for (let i = 0; i < 8; i++) {
      const col = i % 2 === 0 ? '#ff9f43' : '#ffd166';
      const fish = p.oval(g, [-100 + i * 28, 150 + (i % 3) * 32, -518], [13, 6, 4], col);
      this.fishMeshes.push(fish);
    }
  }

  private buildRaveClub() {
    const p = this.props;
    const g = this.raveGroup;

    // Electric blue rave dance floor & deep club backdrop
    p.box(g, 3400, 10, 3400, '#050f1e', [0, -5, -700]);
    p.box(g, 3400, 1400, 12, '#041226', [0, 680, -1700]);

    // Sweeping cyan/cobalt laser beams
    for (let i = 0; i < 18; i++) {
      const m = p.tube(g, [i % 2 ? -640 : 640, 460, -680], [0, 120, 180], i % 3 === 0 ? 3 : 1.6, i % 3 === 0 ? raveCyan : raveLaser);
      Object.assign(m.material, { transparent: true, opacity: 0.42, depthWrite: false });
      this.raveLasers.push(m);
    }

    // Elevated band stage with glowing blue truss, drum kit & guitarists
    g.add(this.bandStage);
    this.bandStage.position.set(0, 0, -520);
    p.box(this.bandStage, 980, 68, 360, '#091b33', [0, 34, 0]);
    p.box(this.bandStage, 980, 6, 10, raveCyan, [0, 68, 180]);

    // Speaker stacks
    for (const x of [-410, 410]) {
      p.box(this.bandStage, 100, 210, 75, '#0b1829', [x, 170, -60]);
      for (let j = 0; j < 3; j++) {
        p.mesh(this.bandStage, new THREE.CircleGeometry(22, 16), [x, 105 + j * 62, -21], '#143357');
      }
    }
    // Drum kit center
    p.mesh(this.bandStage, new THREE.CylinderGeometry(44, 44, 42, 24), [0, 112, -20], '#162d47').rotation.x = Math.PI / 2;
    p.mesh(this.bandStage, new THREE.CircleGeometry(38, 24), [0, 112, 2], '#9fdcff');
    for (const x of [-58, 58]) {
      p.tube(this.bandStage, [x, 68, -45], [x, 195, -45], 2.5, '#7da7c4');
      p.oval(this.bandStage, [x, 198, -45], [40, 2.5, 32], '#d6b45a');
    }
    // Band guitarist silhouettes
    for (const x of [-250, 250]) {
      const pl = new THREE.Group();
      this.bandStage.add(pl);
      pl.position.set(x, 68, 20);
      p.oval(pl, [0, 154, 0], [16, 21, 15], '#122944');
      p.tube(pl, [0, 76, 0], [0, 130, 0], 19, '#0a1728');
      for (const s of [-1, 1]) {
        p.tube(pl, [s * 11, 76, 0], [s * 20, 4, 6], 7, '#0a1728');
        p.tube(pl, [s * 21, 128, 0], [s * 30, 92, 22], 5, '#0a1728');
      }
      p.oval(pl, [0, 82, 26], [30, 38, 8], '#205285');
      p.tube(pl, [14, 92, 26], [62, 148, 26], 4, '#6cc8ff');
    }

    // Silhouetted rave crowd with raised arms bouncing to the 145 BPM kick
    for (let i = 0; i < 24; i++) {
      const row = Math.floor(i / 8);
      const col = i % 8;
      const x = (col - 3.5) * 145 + (row % 2 ? 42 : -42);
      const z = -220 + row * 115;
      p.oval(g, [x, 108, z], [16, 20, 16], '#09182b');
      p.tube(g, [x, 38, z], [x, 90, z], 20, '#071221');
      const arm = p.tube(g, [x + (i % 2 ? 18 : -18), 86, z], [x + (i % 2 ? 26 : -26), 156, z + 10], 5.5, i % 3 === 0 ? raveLaser : '#122d4f');
      this.crowdArms.push(arm);
    }
  }

  private styleNico() {
    const p = this.props;
    const f = this.nico;
    const B = bodyPoint(f.model);
    const k = f.model.tract.scale;

    // Retro striped inner shirt & beige trench lapels
    p.box(f.root, 20, 56, 18, '#665743', [0, -34, 6]);
    for (let i = 0; i < 4; i++) {
      p.box(f.root, 20, 4, 19, '#3e3326', [0, -16 - i * 12, 6.5]);
    }
    // Dark voluminous retro mullet hair
    f.hair.begin();
    for (let row = -8; row <= 8; row++) {
      const z = row * 0.85 * k;
      const a = B(-7, 21);
      const b = B(7, 18 + Math.abs(row) * 0.25);
      p.line(f.hair, [[a.x, a.y + 4 * k, z], [a.x + 5 * k, a.y + 7 * k, z], [b.x, b.y, z]], '#1b1614', 3.4);
    }
    // Mullet back tail
    for (let i = -3; i <= 3; i++) {
      p.line(f.hair, [[i * 4, 18, -12], [i * 5, 2, -16], [i * 5, -14, -18]], '#1b1614', 4.0);
    }
    // Mustache
    p.line(f.hair, [[-8, 12, 19], [0, 14, 21], [8, 12, 19]], '#211915', 3.2);
    f.hair.end();
  }

  private styleKevin() {
    const p = this.props;
    const f = this.kevin;
    const B = bodyPoint(f.model);
    const k = f.model.tract.scale;

    // Orange striped collared shirt under dark jacket
    p.box(f.root, 22, 58, 18, kevinShirt, [0, -34, 6]);
    for (let i = -1; i <= 1; i++) {
      p.box(f.root, 3, 56, 19, '#732e14', [i * 6, -34, 6.5]);
    }
    // Retro oversized dark-rimmed glasses
    f.root.add(this.kevinGlasses);
    for (const sign of [-1, 1]) {
      p.mesh(this.kevinGlasses, new THREE.TorusGeometry(8.5, 1.8, 6, 16), [sign * 10, 26, 20], '#161414');
      const lens = p.mesh(this.kevinGlasses, new THREE.CircleGeometry(7.2, 14), [sign * 10, 26, 19.5], '#2f3d47');
      Object.assign(lens.material, { transparent: true, opacity: 0.4 });
    }
    p.box(this.kevinGlasses, 6, 2, 2, '#161414', [0, 26, 20]);

    // Dark retro mullet & thick mustache
    f.hair.begin();
    for (let row = -8; row <= 8; row++) {
      const z = row * 0.85 * k;
      const a = B(-6, 20);
      const b = B(7, 17);
      p.line(f.hair, [[a.x, a.y + 3 * k, z], [a.x + 5 * k, a.y + 5 * k, z], [b.x, b.y, z]], '#1c1816', 3.3);
    }
    for (let i = -3; i <= 3; i++) {
      p.line(f.hair, [[i * 4, 16, -12], [i * 5, -4, -17], [i * 5, -18, -19]], '#1c1816', 3.8);
    }
    p.line(f.hair, [[-9, 12, 19], [0, 14.5, 21], [9, 12, 19]], '#1d1613', 3.6);
    f.hair.end();
  }

  private styleOperator() {
    const p = this.props;
    const f = this.operator;
    const B = bodyPoint(f.model);
    const k = f.model.tract.scale;

    // Shimmering silver disco shirt underneath
    p.box(f.root, 20, 62, 18, operatorSilver, [0, -35, 7]);
    // Fluffy oversized white fur coat collar & shoulders
    f.root.add(this.furCollar);
    for (let i = 0; i < 12; i++) {
      const angle = (i / 11) * Math.PI * 1.3 - Math.PI * 0.65;
      const x = Math.sin(angle) * 28;
      const z = Math.cos(angle) * 16 - 4;
      p.oval(this.furCollar, [x, -5 + Math.cos(angle) * 6, z], [12, 13, 12], i % 2 === 0 ? operatorFur : '#dce4ed');
    }
    for (const sign of [-1, 1]) {
      p.oval(this.furCollar, [sign * 22, -40, 4], [14, 34, 15], operatorFur);
    }

    // Retro thin gold/wire aviator glasses
    f.root.add(this.opGlasses);
    for (const sign of [-1, 1]) {
      p.mesh(this.opGlasses, new THREE.TorusGeometry(8.5, 1.1, 6, 16), [sign * 10, 26, 20], '#c9b37e');
      const lens = p.mesh(this.opGlasses, new THREE.CircleGeometry(7.5, 14), [sign * 10, 26, 19.5], '#9cd4f0');
      Object.assign(lens.material, { transparent: true, opacity: 0.25 });
    }
    p.box(this.opGlasses, 6, 1.4, 1.4, '#c9b37e', [0, 26, 20]);

    // Blonde feathered mullet & blonde mustache
    f.hair.begin();
    for (let row = -8; row <= 8; row++) {
      const z = row * 0.85 * k;
      const a = B(-6, 20);
      const b = B(7, 17);
      p.line(f.hair, [[a.x, a.y + 3 * k, z], [a.x + 5 * k, a.y + 5 * k, z], [b.x, b.y, z]], '#c9a66b', 3.2);
    }
    for (let i = -3; i <= 3; i++) {
      p.line(f.hair, [[i * 4, 16, -12], [i * 5, -2, -16], [i * 5, -18, -18]], '#b89256', 3.8);
    }
    p.line(f.hair, [[-8, 12, 19], [0, 14, 21], [8, 12, 19]], '#b38d52', 3.0);
    f.hair.end();
  }

  resize(w: number, h: number) {
    this.width = Math.max(1, w);
    this.height = Math.max(1, h);
    this.camera.aspect = this.width / this.height;
    this.props.resize(w, h);
    this.nico.head.resize(w, h);
    this.kevin.head.resize(w, h);
    this.operator.head.resize(w, h);
  }

  frame(time: number, playing: boolean, epoch: number, view: CameraView, intensity: number, speaker?: CharacterId) {
    const t = Math.max(0, Number.isFinite(time) ? time : 0);
    const dt = this.last === null ? 0 : Math.max(0, Math.min(0.05, t - this.last));
    const reset = epoch !== this.epoch || (this.last !== null && Math.abs(t - this.last) > 0.25);
    this.last = t;
    this.epoch = epoch;

    const aspect = this.width / this.height;
    const narrow = aspect < 1;
    const q = (t - 6.95) * (145 / 60) * Math.PI * 2; // 145 BPM beat phase
    const beat = Math.sin(q);
    const halfBeat = Math.sin(q * 0.5);

    const isAlley = view === 'elev-alley';
    const isDoors = view === 'elev-doors';
    const isShaft = view === 'elev-shaft';
    const isPanel = view === 'elev-panel';
    const isWhite = view === 'elev-white-floor';
    const isAquarium = view === 'elev-aquarium';
    const isRave = view === 'elev-rave' || view === 'elev-band';
    const isHalo = view === 'elev-halo';
    const isZeroG = view === 'elev-zerog';
    const isFisheye = view === 'elev-fisheye';
    const isCabin = !isAlley && !isShaft && !isPanel && !isRave;

    // Scene background colors per environment
    const bgHex = isAlley ? alleyBg
      : isRave ? raveBg
      : isShaft ? '#060a0e'
      : isWhite ? '#d7e2ec'
      : isHalo ? '#21313d'
      : cabinBg;
    this.scene.background = new THREE.Color(bgHex);

    // Group visibility
    this.alleyGroup.visible = isAlley;
    this.cabinGroup.visible = isCabin || isDoors || isHalo || isZeroG || isFisheye;
    this.shaftGroup.visible = isShaft;
    this.panelGroup.visible = isPanel;
    this.whiteFloorGroup.visible = isWhite;
    this.aquariumGroup.visible = isAquarium;
    this.raveGroup.visible = isRave;

    // Animate elevator doors (slide open during doors/white/aquarium, open out of way inside cabin)
    const doorOpen = isDoors
      ? Math.min(1, Math.max(0, (t % 8) / 1.8))
      : 1;
    const doorSlide = 105 + doorOpen * 185;
    this.leftDoor.position.x = -doorSlide;
    this.rightDoor.position.x = doorSlide;
    this.leftDoor.visible = isDoors;
    this.rightDoor.visible = isDoors;

    // Pulse LED cabin strips on the beat
    const ledColor = isHalo ? '#ffffff' : (beat > 0.5 && intensity > 0.85 ? ledCyan : ledWhite);
    for (const m of this.ledStrips) {
      (m.material as THREE.MeshBasicMaterial).color.set(ledColor);
    }

    // Animate high-speed elevator shaft streaks
    if (isShaft) {
      for (let i = 0; i < this.shaftStreaks.length; i++) {
        const m = this.shaftStreaks[i];
        const y = (((i * 140 - t * 1450) % 2800) + 2800) % 2800 - 1400;
        m.position.y = y;
      }
    }

    // Animate 3x3 button panel lights
    if (isPanel) {
      const litIdx = Math.floor(t * 2.4) % this.panelButtons.length;
      this.panelButtons.forEach((b, idx) => {
        (b.material as THREE.MeshBasicMaterial).color.set(idx === litIdx ? '#88e8ff' : '#162836');
      });
    }

    // Animate aquarium swimming fish
    if (isAquarium) {
      this.fishMeshes.forEach((f, idx) => {
        const speed = 28 + (idx % 3) * 14;
        const dir = idx % 2 === 0 ? 1 : -1;
        f.position.x = Math.sin(t * 0.5 + idx * 1.1) * 125 * dir;
        f.position.y = 145 + (idx % 3) * 32 + Math.sin(t * 1.8 + idx) * 8 + speed * 0;
      });
    }

    // Animate rave lasers & raised crowd arms
    if (isRave) {
      this.raveLasers.forEach((m, i) => {
        const from: P = [i % 2 ? -640 : 640, 460, -680];
        const to: P = [Math.sin(t * 1.4 + i * 0.42) * 520, 80 + Math.cos(t * 0.9 + i * 0.5) * 140, 220];
        this.props.segment(m, from, to, i % 3 === 0 ? 3 : 1.6);
        (m.material as THREE.MeshBasicMaterial).color.set(beat > 0.35 ? raveCyan : raveLaser);
      });
      this.crowdArms.forEach((arm, i) => {
        arm.position.y = Math.abs(Math.sin(q * 0.5 + i * 0.55)) * 18;
      });
    }

    // Performer visibility & positions per shot
    const showSoloNico = view === 'elev-nico';
    const showSoloKevin = view === 'elev-kevin';
    const showSoloOp = view === 'elev-operator' || isHalo;

    this.nico.root.visible = !isShaft && !isPanel && (showSoloNico || (!showSoloKevin && !showSoloOp));
    this.kevin.root.visible = !isShaft && !isPanel && (showSoloKevin || (!showSoloNico && !showSoloOp));
    this.operator.root.visible = !isShaft && !isPanel && !isAlley && (showSoloOp || (!showSoloNico && !showSoloKevin));

    const bounce = isZeroG ? 0 : Math.abs(beat) * (isRave ? 5.5 : 2.8);

    if (isAlley) {
      this.nico.root.position.set(-72, 146 + bounce * 0.5, -180);
      this.nico.root.rotation.set(0, 0.25, 0);
      this.kevin.root.position.set(72, 146 + bounce * 0.5, -180);
      this.kevin.root.rotation.set(0, -0.25, 0);
    } else if (isZeroG) {
      // Weightless floating choreography inside the LED cabin!
      this.nico.root.position.set(-105 + Math.sin(t * 0.7) * 18, 175 + Math.cos(t * 0.9) * 28, -45);
      this.nico.root.rotation.set(0.28 + Math.sin(t * 0.6) * 0.12, 0.15, 0.42 + Math.cos(t * 0.5) * 0.18);
      this.operator.root.position.set(5 + Math.cos(t * 0.6) * 20, 220 + Math.sin(t * 0.8) * 26, -75);
      this.operator.root.rotation.set(-0.22 + Math.cos(t * 0.5) * 0.1, 0, -0.34 + Math.sin(t * 0.6) * 0.16);
      this.kevin.root.position.set(112 + Math.sin(t * 0.8 + 1) * 16, 155 + Math.sin(t * 0.7 + 2) * 24, -40);
      this.kevin.root.rotation.set(0.18, -0.18, -0.52 + Math.cos(t * 0.7) * 0.15);
    } else if (isRave) {
      this.nico.root.position.set(-108, 148 + bounce, -30);
      this.nico.root.rotation.set(0, 0.12, halfBeat * 0.05);
      this.operator.root.position.set(0, 152 + bounce * 0.8, -85);
      this.operator.root.rotation.set(0, 0, -halfBeat * 0.04);
      this.kevin.root.position.set(108, 148 + bounce, -30);
      this.kevin.root.rotation.set(0, -0.12, halfBeat * 0.06);
    } else if (showSoloNico) {
      this.nico.root.position.set(0, 148 + bounce * 0.6, -40);
      this.nico.root.rotation.set(0, 0, halfBeat * 0.03);
    } else if (showSoloKevin) {
      this.kevin.root.position.set(0, 148 + bounce * 0.8, -40);
      this.kevin.root.rotation.set(0, 0, halfBeat * 0.04);
    } else if (showSoloOp) {
      this.operator.root.position.set(0, 150 + bounce * 0.4, -45);
      this.operator.root.rotation.set(0, 0, halfBeat * 0.02);
    } else {
      // Trio in the LED cabin / doors / aquarium / white floor
      this.nico.root.position.set(-96, 148 + bounce, -55);
      this.nico.root.rotation.set(0, 0.14, halfBeat * 0.03);
      this.operator.root.position.set(0, 152 + bounce * 0.7, -95);
      this.operator.root.rotation.set(0, 0, -halfBeat * 0.02);
      this.kevin.root.position.set(96, 148 + bounce, -55);
      this.kevin.root.rotation.set(0, -0.14, halfBeat * 0.04);
    }

    // Dynamic arm choreography
    const nicoActive = speaker === 'elev-nico';
    const kevinActive = speaker === 'elev-kevin';
    const opActive = speaker === 'elev-operator';

    const nicoArms: [P, P, P, P] = isZeroG
      ? [[-38, 10, 16], [-62, 34, 24], [38, 8, 16], [62, 30, 22]]
      : [
          [-30, -18 + (nicoActive ? Math.sin(q) * 14 : 0), 18],
          [-44, (nicoActive ? 10 + Math.sin(q) * 26 : -14), 30],
          [30, -18 - (nicoActive ? Math.sin(q) * 14 : 0), 18],
          [44, (nicoActive ? 10 - Math.sin(q) * 26 : -14), 30],
        ];
    const kevinArms: [P, P, P, P] = isZeroG
      ? [[-40, 12, 18], [-66, 28, 28], [40, 14, 18], [66, 32, 26]]
      : [
          [-34, -14 + (kevinActive ? Math.sin(q) * 18 : 0), 22],
          [-48, (kevinActive ? 16 + Math.sin(q) * 30 : -8), 34],
          [34, -14 - (kevinActive ? Math.sin(q) * 18 : 0), 22],
          [48, (kevinActive ? 16 - Math.sin(q) * 30 : -8), 34],
        ];
    const opArms: [P, P, P, P] = isZeroG
      ? [[-42, 16, 14], [-68, 38, 22], [42, 16, 14], [68, 38, 22]]
      : [
          [-32, -16, 18],
          [-44, opActive ? 18 + Math.sin(q * 0.5) * 18 : -10, 28],
          [32, -14, 18],
          [46, opActive ? 22 - Math.sin(q * 0.5) * 18 : 12, 32],
        ];

    this.nico.pose(t, nicoArms);
    this.kevin.pose(t, kevinArms);
    this.operator.pose(t, opArms);

    // Camera framing per shot (keeping singing heads unobstructed on desktop & phone)
    let camPos: P = [0, 175, 290];
    let camLook: P = [0, 155, -60];
    let fov = narrow ? 46 : 36;

    switch (view) {
      case 'elev-alley':
        camPos = [Math.sin(t * 0.25) * 35, 168, 240];
        camLook = [0, 158, -220];
        fov = narrow ? 48 : 38;
        break;
      case 'elev-doors':
        camPos = [0, 172, 340];
        camLook = [0, 164, -85];
        fov = narrow ? 48 : 38;
        break;
      case 'elev-fisheye':
        // High-angle wide lens inside the geometric LED elevator
        camPos = [Math.sin(t * 0.5) * 28, 305, 165];
        camLook = [0, 152, -70];
        fov = narrow ? 64 : 54;
        break;
      case 'elev-shaft':
        camPos = [Math.sin(t * 2.2) * 18, 260, Math.cos(t * 2.2) * 18];
        camLook = [0, -700, 0];
        fov = narrow ? 62 : 52;
        break;
      case 'elev-panel':
        camPos = [12, 198, 170];
        camLook = [0, 192, -55];
        fov = narrow ? 42 : 32;
        break;
      case 'elev-white-floor':
        camPos = [0, 170, 265];
        camLook = [0, 145, -240];
        fov = narrow ? 50 : 40;
        break;
      case 'elev-aquarium':
        camPos = [0, 180, 260];
        camLook = [0, 175, -480];
        fov = narrow ? 48 : 38;
        break;
      case 'elev-rave':
        camPos = [Math.sin(t * 0.6) * 65, 185, 310];
        camLook = [0, 160, -180];
        fov = narrow ? 52 : 42;
        break;
      case 'elev-band':
        camPos = [Math.sin(t * 0.45) * 90, 205, 160];
        camLook = [0, 168, -500];
        fov = narrow ? 50 : 40;
        break;
      case 'elev-halo':
        camPos = [0, 175, 155];
        camLook = [0, 172, -45];
        fov = narrow ? 38 : 28;
        break;
      case 'elev-zerog':
        camPos = [Math.sin(t * 0.35) * 40, 195, 250];
        camLook = [0, 185, -55];
        fov = narrow ? 56 : 46;
        break;
      case 'elev-nico':
      case 'elev-kevin':
      case 'elev-operator':
        camPos = [0, 176, 138];
        camLook = [0, 172, -40];
        fov = narrow ? 36 : 26;
        break;
      case 'elev-cabin':
      case 'wide':
      default:
        camPos = [0, 176, 260];
        camLook = [0, 162, -70];
        fov = narrow ? 50 : 40;
        break;
    }

    this.camera.fov = fov;
    this.camera.position.set(...camPos);
    this.camera.lookAt(...camLook);
    this.camera.updateProjectionMatrix();
    this.camera.updateMatrixWorld();

    this.scene.updateMatrixWorld(true);
    if (this.nico.root.visible) this.nico.update(t, playing, this.camera, dt, reset);
    if (this.kevin.root.visible) this.kevin.update(t, playing, this.camera, dt, reset);
    if (this.operator.root.visible) this.operator.update(t, playing, this.camera, dt, reset);
  }

  dispose() {
    this.nico.dispose();
    this.kevin.dispose();
    this.operator.dispose();
    this.props.dispose();
  }
}
