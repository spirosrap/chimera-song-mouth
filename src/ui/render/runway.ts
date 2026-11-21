import * as THREE from 'three';
import {VideoProps, VideoFigure, type VideoPoint as P} from './videoProps.ts';
import type {VoiceModel} from '../analysis.ts';
import type {TeleTrack} from '../../show/tele.ts';
import type {CameraView, CharacterId} from '../../scene/scene.ts';
import {bodyPoint} from './profile.ts';

export type RunwayId = 'runway-gaga' | 'runway-doechii';
type Person = {id: RunwayId; model: VoiceModel; track: TeleTrack};

const black = '#101014';
const white = '#f4f3ef';
const red = '#c8102e';
const darkRed = '#5a0614';
const gold = '#e2b853';
const silver = '#d4d8df';
const steel = '#3a404a';
const bluePorcelain = '#1e3c88';

export class RunwayStage {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(36, 16 / 9, 1, 12000);
  readonly props = new VideoProps();

  readonly ballroom = new THREE.Group();
  readonly redStudio = new THREE.Group();
  readonly crystalCatwalk = new THREE.Group();
  readonly twinGroup = new THREE.Group();
  readonly propsGroup = new THREE.Group();

  readonly gaga: VideoFigure;
  readonly doechii: VideoFigure;

  // Staging accessories
  readonly scoreCard: THREE.Group;
  readonly stiletto: THREE.Group;
  readonly featherRing: THREE.Group;
  readonly teapotRuff: THREE.Group;
  readonly crystalSpikesGaga: THREE.Group;
  readonly crystalSpikesDoechii: THREE.Group;

  private width = 1280;
  private height = 720;
  private last: number | null = null;
  private epoch = -1;

  constructor(
    readonly gagaModel: VoiceModel,
    readonly gagaTrack: TeleTrack,
    readonly doechiiModel: VoiceModel,
    readonly doechiiTrack: TeleTrack
  ) {
    this.scene.background = new THREE.Color(black);
    this.scene.add(this.ballroom, this.redStudio, this.crystalCatwalk, this.twinGroup, this.propsGroup);

    this.buildBallroom();
    this.buildRedStudio();
    this.buildCrystalCatwalk();
    this.buildTwinSuit();

    // 1. Lady Gaga Figure
    this.gaga = new VideoFigure(gagaModel, gagaTrack, this.props, this.scene, black, '#d8bba2');
    this.gaga.head.scene.scale.setScalar(2.05);
    this.styleGaga();

    // 2. Doechii Figure
    this.doechii = new VideoFigure(doechiiModel, doechiiTrack, this.props, this.scene, black, '#624233');
    this.doechii.head.scene.scale.setScalar(2.05);
    this.styleDoechii();

    // 3. Iconic Props
    this.scoreCard = this.buildScoreCard();
    this.stiletto = this.buildStiletto();
    this.featherRing = this.buildFeatherRing();
    this.teapotRuff = this.buildTeapotRuff();
    this.crystalSpikesGaga = this.buildSpikes(this.gaga.ornaments, silver);
    this.crystalSpikesDoechii = this.buildSpikes(this.doechii.ornaments, '#1c1b22');

    this.propsGroup.add(this.scoreCard, this.stiletto, this.featherRing, this.teapotRuff);

    this.resize(1280, 720);
    this.frame(0, false, 0, 'runway-ballroom', 0);
  }

  private buildBallroom() {
    const p = this.props;
    const g = this.ballroom;

    // Runway floor with alternating B&W stripes
    for (let i = -16; i <= 16; i++) {
      const c = (i + 100) % 2 === 0 ? black : white;
      p.box(g, 70, 4, 3000, c, [i * 70, -2, -500]);
    }

    // Striped perspective backdrop
    p.box(g, 2400, 1400, 6, black, [0, 690, -1800]);
    for (let i = -15; i <= 15; i++) {
      if (Math.abs(i) % 2 === 1) {
        p.box(g, 68, 1400, 8, white, [i * 75, 690, -1795]);
      }
    }

    // Flanking diagonal chevron walls
    for (const s of [-1, 1]) {
      const wall = new THREE.Group();
      g.add(wall);
      wall.position.set(s * 1050, 0, -500);
      wall.rotation.y = s * -0.42;
      for (let j = 0; j < 18; j++) {
        p.box(wall, 12, 1200, 110, j % 2 === 0 ? white : black, [0, 600, (j - 9) * 110]);
      }
    }
  }

  private buildRedStudio() {
    const p = this.props;
    const g = this.redStudio;

    // Seamless crimson cyclorama
    p.box(g, 2800, 8, 2200, '#150205', [0, -4, -300]);
    p.box(g, 2800, 1400, 10, red, [0, 690, -1400]);

    // Red light columns
    for (const s of [-1, 1]) {
      for (let i = 0; i < 4; i++) {
        p.tube(g, [s * (480 + i * 160), 0, -1350], [s * (480 + i * 160), 1200, -1350], 4.5, darkRed);
      }
    }
  }

  private buildCrystalCatwalk() {
    const p = this.props;
    const g = this.crystalCatwalk;

    // Industrial dark scaffolding runway
    p.box(g, 380, 24, 2800, '#12141a', [0, 80, -400]);
    p.box(g, 340, 2, 2800, '#242a34', [0, 93, -400]);

    // Steel support pillars & spotlights
    for (let z = -1400; z <= 800; z += 350) {
      for (const s of [-1, 1]) {
        p.tube(g, [s * 180, 0, z], [s * 180, 80, z], 5, steel);
        p.tube(g, [s * 240, 80, z], [s * 240, 620, z], 3.5, '#4a5360');
        p.oval(g, [s * 240, 620, z], [14, 18, 14], silver);
      }
    }
  }

  private buildTwinSuit() {
    const p = this.props;
    const g = this.twinGroup;

    // Giant double-collar tailored red suit
    p.box(g, 280, 220, 28, red, [0, 60, 20]);
    p.box(g, 90, 80, 30, '#9c0a22', [0, 70, 22]); // center fold

    // Lapels & ties
    for (const x of [-64, 64]) {
      p.box(g, 42, 64, 32, black, [x, 142, 24]);
      p.tube(g, [x, 150, 34], [x, 82, 34], 4.2, black); // black tie
      p.box(g, 32, 16, 31, white, [x, 168, 23]); // white collar peek
    }

    // Black gloved arms
    p.tube(g, [-140, 140, 20], [-180, 40, 30], 14, red);
    p.tube(g, [-180, 40, 30], [-140, -20, 45], 11, black);
    p.tube(g, [140, 140, 20], [180, 40, 30], 14, red);
    p.tube(g, [180, 40, 30], [140, -20, 45], 11, black);

    // Draped white silk curtains in background
    for (let i = -3; i <= 3; i++) {
      const drape = p.box(g, 120, 900, 12, '#eae7e1', [i * 135, 420, -180]);
      drape.rotation.y = (i % 2 === 0 ? 0.15 : -0.15);
    }
  }

  private styleGaga() {
    const p = this.props;
    const f = this.gaga;
    const k = f.model.tract.scale;
    const B = bodyPoint(f.model);

    // Towering powdered Marie Antoinette wig
    f.hair.begin();
    for (let i = 0; i < 90; i++) {
      const q = i * 0.22;
      const h = 22 + (i % 25) * 1.6;
      const r = 7.5 + Math.sin(i * 0.4) * 3.5;
      p.line(
        f.hair,
        [
          [B(Math.cos(q) * r, h).x, B(Math.cos(q) * r, h).y, Math.sin(q) * r * k],
          [B(Math.cos(q) * (r + 1.8), h + 4).x, B(Math.cos(q) * (r + 1.8), h + 4).y, Math.sin(q) * (r + 1.8) * k],
        ],
        white,
        2.2
      );
    }
    f.hair.end();

    // Pearl collar
    const neck = B(3, 4);
    for (let a = 0; a < 8; a++) {
      p.oval(f.ornaments, [neck.x + Math.sin(a) * 3 * k, neck.y - a * 0.8 * k, (a - 4) * 1.8 * k], [1.5 * k, 1.5 * k, 1.5 * k], white);
    }
  }

  private styleDoechii() {
    const p = this.props;
    const f = this.doechii;
    const k = f.model.tract.scale;
    const B = bodyPoint(f.model);

    // Architectural high black afro
    f.hair.begin();
    for (let i = 0; i < 110; i++) {
      const q = i * 0.18;
      const h = 21 + (i % 30) * 1.4;
      const r = 8.5 + (i % 12) * 0.6;
      p.line(
        f.hair,
        [
          [B(Math.cos(q) * r, h).x, B(Math.cos(q) * r, h).y, Math.sin(q) * r * k],
          [B(Math.cos(q) * (r + 1.2), h + 3).x, B(Math.cos(q) * (r + 1.2), h + 3).y, Math.sin(q) * (r + 1.2) * k],
        ],
        '#121118',
        2.6
      );
    }
    f.hair.end();

    // Diamond choker
    const neck = B(3, 4);
    for (let a = -4; a <= 4; a++) {
      p.oval(f.ornaments, [neck.x + 1 * k, neck.y, a * 2.2 * k], [1.3 * k, 1.3 * k, 1.3 * k], silver);
    }
  }

  private buildScoreCard() {
    const p = this.props;
    const g = new THREE.Group();
    // Ballroom '10' paddle
    p.box(g, 62, 84, 3, white, [0, 140, 0]);
    p.tube(g, [0, 98, 0], [0, 42, 0], 2.5, '#222');
    // Number '10' in black
    p.box(g, 7, 48, 4, black, [-13, 140, 1]); // '1'
    p.box(g, 22, 48, 4, black, [13, 140, 1]);  // outer '0'
    p.box(g, 10, 32, 5, white, [13, 140, 1.5]); // inner '0' hole
    return g;
  }

  private buildStiletto() {
    const p = this.props;
    const g = new THREE.Group();
    // Giant sculptural red stiletto
    p.tube(g, [0, 0, 0], [0, 240, 0], 9, red); // heel spike
    p.oval(g, [0, 240, 20], [22, 10, 30], red); // sole platform
    p.oval(g, [0, 140, 120], [28, 14, 80], red); // toe box
    g.rotation.y = 0.5;
    return g;
  }

  private buildFeatherRing() {
    const p = this.props;
    const g = new THREE.Group();
    for (let i = 0; i < 28; i++) {
      const q = (i / 28) * Math.PI * 2;
      const r = 90;
      p.oval(g, [Math.cos(q) * r, Math.sin(q) * r + 130, 0], [24, 12, 6], black);
    }
    return g;
  }

  private buildTeapotRuff() {
    const p = this.props;
    const g = new THREE.Group();
    // Blue & white porcelain collar & spout
    p.oval(g, [0, 120, 0], [42, 14, 36], white);
    p.oval(g, [0, 120, 0], [40, 12, 34], bluePorcelain);
    p.tube(g, [24, 125, 0], [48, 145, 10], 5, white); // spout
    return g;
  }

  private buildSpikes(parent: THREE.Object3D, col: string) {
    const p = this.props;
    const g = new THREE.Group();
    parent.add(g);
    for (let i = 0; i < 24; i++) {
      const q = i * 0.45;
      const x = Math.cos(q) * 14;
      const y = 8 + (i % 6) * 3.5;
      p.tube(g, [x, y, Math.sin(q) * 14], [x * 1.4, y + 2, Math.sin(q) * 1.4], 2.2, col);
    }
    return g;
  }

  resize(w: number, h: number) {
    this.width = Math.max(1, w);
    this.height = Math.max(1, h);
    this.camera.aspect = this.width / this.height;
    this.props.resize(w, h);
    this.gaga.head.resize(w, h);
    this.doechii.head.resize(w, h);
  }

  frame(time: number, playing: boolean, epoch: number, view: CameraView, _intensity: number, _speaker?: CharacterId) {
    const reset = epoch !== this.epoch || this.last !== null && Math.abs(time - this.last) > .25;
    const dt = this.last === null ? 0 : Math.max(0, Math.min(.05, time - this.last));
    this.last = time;
    this.epoch = epoch;

    const t = time;
    const beat = Math.sin(t * (118 / 60) * Math.PI * 2);
    const strut = Math.sin(t * (118 / 60) * Math.PI);

    // Staging mode visibility
    const isTwin = view === 'runway-twin';
    const isRed = ['runway-red-studio', 'runway-heels'].includes(view);
    const isCrystal = view === 'runway-crystal';
    const isBallroom = !isTwin && !isRed && !isCrystal;

    this.ballroom.visible = isBallroom;
    this.redStudio.visible = isRed;
    this.crystalCatwalk.visible = isCrystal;
    this.twinGroup.visible = isTwin;

    // Prop visibilities
    this.scoreCard.visible = view === 'runway-red-studio';
    this.scoreCard.position.set(-80, 20 + Math.abs(beat) * 4, -40);

    this.stiletto.visible = view === 'runway-heels';
    this.stiletto.position.set(0, -10, -60);

    this.featherRing.visible = view === 'runway-feather';
    this.featherRing.position.set(0, 0, 40);

    this.teapotRuff.visible = view === 'runway-teapot';
    this.teapotRuff.position.set(-45, 0, 0);

    this.crystalSpikesGaga.visible = isCrystal;
    this.crystalSpikesDoechii.visible = isCrystal;

    // Background color
    this.scene.background = new THREE.Color(isRed ? '#220308' : isCrystal ? '#0d1015' : black);

    // Camera positioning according to view
    let camPos: P = [0, 145, 340];
    let camLook: P = [0, 135, 0];
    let fov = 34;

    switch (view) {
      case 'runway-twin':
        camPos = [0, 140, 220];
        camLook = [0, 135, 0];
        fov = 30;
        break;
      case 'runway-closeup-gaga':
        camPos = [-35, 146, 110];
        camLook = [-35, 144, 0];
        fov = 24;
        break;
      case 'runway-closeup-doechii':
        camPos = [35, 142, 110];
        camLook = [35, 140, 0];
        fov = 24;
        break;
      case 'runway-teapot':
        camPos = [-45, 135, 140];
        camLook = [-45, 130, 0];
        fov = 28;
        break;
      case 'runway-heels':
        camPos = [60, 100, 210];
        camLook = [0, 80, -20];
        fov = 32;
        break;
      case 'runway-feather':
        camPos = [0, 135, 190];
        camLook = [0, 130, 0];
        fov = 28;
        break;
      case 'runway-crystal':
        camPos = [0, 155, 320];
        camLook = [0, 145, 0];
        fov = 32;
        break;
      case 'runway-red-studio':
        camPos = [0, 138, 280];
        camLook = [0, 130, 0];
        fov = 34;
        break;
      case 'runway-duet':
        camPos = [0, 142, 260];
        camLook = [0, 135, 0];
        fov = 32;
        break;
      case 'runway-ballroom':
      default:
        camPos = [0, 150, 380];
        camLook = [0, 130, -50];
        fov = 36;
        break;
    }

    this.camera.position.set(...camPos);
    this.camera.lookAt(...camLook);
    this.camera.fov = fov;
    this.camera.updateProjectionMatrix();

    // Position Performers
    if (isTwin) {
      // Twin suit mode: both heads emerge side-by-side in the red suit
      this.gaga.root.position.set(-64, 142, 20);
      this.doechii.root.position.set(64, 142, 20);
      this.gaga.root.rotation.set(0, 0.05, 0);
      this.doechii.root.rotation.set(0, -0.05, 0);

      this.gaga.torso.visible = false;
      this.doechii.torso.visible = false;
      for (const m of [...this.gaga.arms, ...this.gaga.legs, ...this.gaga.feet]) m.visible = false;
      for (const m of [...this.doechii.arms, ...this.doechii.legs, ...this.doechii.feet]) m.visible = false;
    } else {
      // Free catwalk strut
      this.gaga.torso.visible = true;
      this.doechii.torso.visible = true;
      for (const m of [...this.gaga.arms, ...this.gaga.legs, ...this.gaga.feet]) m.visible = true;
      for (const m of [...this.doechii.arms, ...this.doechii.legs, ...this.doechii.feet]) m.visible = true;

      const gagaX = (view === 'runway-closeup-gaga' || view === 'runway-teapot') ? -35 : (view === 'runway-duet' ? -42 : -52);
      const doechiiX = (view === 'runway-closeup-doechii' || view === 'runway-feather') ? 35 : (view === 'runway-duet' ? 42 : 52);
      const yBase = isCrystal ? 95 : 0;

      this.gaga.root.position.set(gagaX, yBase + 138 + Math.abs(beat) * 2, -20 + strut * 12);
      this.doechii.root.position.set(doechiiX, yBase + 138 + Math.abs(beat) * 2, -20 - strut * 12);

      this.gaga.root.rotation.set(0, -0.08 + Math.sin(t * 1.5) * 0.04, strut * 0.03);
      this.doechii.root.rotation.set(0, 0.08 - Math.sin(t * 1.5) * 0.04, -strut * 0.03);

      // Posing arms
      const gle: P = [-28, -14 + strut * 14, 18];
      const glh: P = [-40, -18 + strut * 18, 28];
      const gre: P = [28, -14 - strut * 14, 18];
      const grh: P = [40, -18 - strut * 18, 28];
      this.gaga.pose(t, [gle, glh, gre, grh]);

      const dle: P = [-28, -14 - strut * 14, 18];
      const dlh: P = [-40, -18 - strut * 18, 28];
      const dre: P = [28, -14 + strut * 14, 18];
      const drh: P = [40, -18 + strut * 18, 28];
      this.doechii.pose(t, [dle, dlh, dre, drh]);
    }

    if (reset) {
      this.gaga.head.resetMotion();
      this.doechii.head.resetMotion();
    }

    this.scene.updateMatrixWorld(true);
    this.gaga.update(t, playing, this.camera, dt, reset);
    this.doechii.update(t, playing, this.camera, dt, reset);
  }

  dispose() {
    this.gaga.dispose();
    this.doechii.dispose();
    this.props.dispose();
  }
}
