import * as THREE from 'three';
import { VideoProps, VideoFigure, type VideoPoint as P } from './videoProps.ts';
import type { VoiceModel } from '../analysis.ts';
import type { TeleTrack } from '../../show/tele.ts';
import type { CameraView, CharacterId } from '../../scene/scene.ts';
import { bodyPoint } from './profile.ts';

export type WheneverId = 'whenever-megan';

const woodPanel = '#4a2b1c';
const wallCream = '#a89f91';
const glassTint = '#a4c4c9';
const aquariumBlue = '#0d4a59';
const kelpGreen = '#1b5e46';
const whiteVoid = '#eceef0';
const desertSky = '#c75924';
const desertSand = '#9e5324';
const cadillacRed = '#6e231c';
const chromeCol = '#d8dee6';
const poolGreen = '#14573d';
const skinTone = '#9c684a';
const copperHair = '#c94c24';
const blackHair = '#121317';
const blazerBlack = '#14151a';
const lapelWhite = '#f2f4f7';
const cowboyBrown = '#754e38';
const signYellow = '#e6b832';

/**
 * Procedural 3D stage for Megan Thee Stallion — "Whenever".
 * Recreates the surreal waiting room, glass reception booth with office phones,
 * giant glowing wall aquarium, fish-headed waiting room patients, stark monochrome
 * white-void studio, burnt-orange Western desert with vintage Cadillac & zig-zag sign,
 * checkered chessboard with giant white chess knight, glossy 8-ball on pool felt,
 * and crashed-Cadillac office rubble finale.
 */
export class WheneverStage {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(36, 16 / 9, 1, 18000);
  readonly props = new VideoProps();

  readonly waitingGroup = new THREE.Group();
  readonly boothGroup = new THREE.Group();
  readonly aquariumGroup = new THREE.Group();
  readonly monoGroup = new THREE.Group();
  readonly desertGroup = new THREE.Group();
  readonly chessGroup = new THREE.Group();
  readonly eightballGroup = new THREE.Group();
  readonly crashGroup = new THREE.Group();

  readonly megan: VideoFigure;
  readonly copperBob = new THREE.Group();
  readonly monoPonytail = new THREE.Group();
  readonly cowboyHat = new THREE.Group();
  readonly blazerLapels = new THREE.Group();
  readonly handPhones = new THREE.Group();

  readonly bubbles: THREE.Mesh[] = [];
  readonly tvScreen: THREE.Mesh;
  readonly eightBallSphere: THREE.Group;

  private width = 1280;
  private height = 720;
  private last: number | null = null;
  private epoch = -1;

  constructor(readonly meganModel: VoiceModel, readonly meganTrack: TeleTrack) {
    this.scene.background = new THREE.Color('#2e1c14');
    this.scene.add(
      this.waitingGroup,
      this.boothGroup,
      this.aquariumGroup,
      this.monoGroup,
      this.desertGroup,
      this.chessGroup,
      this.eightballGroup,
      this.crashGroup
    );

    this.tvScreen = this.buildWaitingRoom();
    this.buildReceptionBooth();
    this.buildAquarium();
    this.buildMonoStudio();
    this.buildDesert();
    this.buildChessboard();
    this.eightBallSphere = this.buildEightBall();
    this.buildCrashOffice();

    this.megan = new VideoFigure(meganModel, meganTrack, this.props, this.scene, blazerBlack, skinTone);
    this.megan.head.scene.scale.setScalar(2.08);
    this.styleMegan();

    this.resize(1280, 720);
    this.frame(0, false, 0, 'whenever-waiting', 0);
  }

  private buildWaitingRoom(): THREE.Mesh {
    const p = this.props;
    const g = this.waitingGroup;
    // Retro wood-paneled lower wall + cream upper wall + vertical blinds
    p.box(g, 1600, 10, 1200, '#2a1d17', [0, -5, -100]);
    p.box(g, 1600, 260, 14, woodPanel, [0, 130, -380]);
    p.box(g, 1600, 380, 14, wallCream, [0, 440, -380]);
    // Window blinds behind patients
    for (let i = -8; i <= 8; i++) {
      p.box(g, 16, 190, 8, '#c29978', [i * 22, 315, -366]);
    }
    // Red vinyl waiting room chairs
    for (const x of [-160, 0, 160]) {
      p.box(g, 110, 22, 95, '#8a3529', [x, 58, -280]);
      p.box(g, 110, 95, 20, '#9e3e30', [x, 112, -320]);
    }
    // Surreal fish-headed patients sitting on the waiting room chairs (0:54 frame!)
    for (const [x, col] of [[0, '#5a6e54'], [160, '#d48d46']] as const) {
      p.tube(g, [x, 65, -275], [x, 138, -275], 24, '#2d3a4a');
      p.oval(g, [x, 174, -268], [26, 30, 28], col);
      p.oval(g, [x - 12, 182, -244], [5, 5, 4], '#ffffff');
      p.oval(g, [x + 12, 182, -244], [5, 5, 4], '#ffffff');
      p.box(g, 42, 34, 4, '#d9d3c7', [x, 118, -238]);
    }
    // Vintage CRT TV mounted on shelf on left (0:04.5-0:09 frame!)
    p.box(g, 180, 14, 100, '#301b10', [-360, 240, -330]);
    p.box(g, 155, 130, 95, '#2b2421', [-360, 312, -330]);
    const screen = p.box(g, 125, 95, 6, '#d97834', [-360, 316, -280]);
    return screen;
  }

  private buildReceptionBooth() {
    const p = this.props;
    const g = this.boothGroup;
    p.box(g, 1600, 10, 1200, '#2a1d17', [0, -5, -100]);
    p.box(g, 1600, 620, 14, '#7d7a72', [0, 305, -400]);
    // Glass-walled reception cubicle frame (0:13.5-0:22.5, 1:39, 2:19.5!)
    p.box(g, 380, 100, 240, '#869c9e', [0, 50, -60]);
    p.box(g, 400, 12, 260, '#b7c7c9', [0, 102, -60]);
    for (const sx of [-185, 185]) {
      for (const sz of [-180, 60]) {
        p.tube(g, [sx, 102, sz], [sx, 360, sz], 4, '#596366');
      }
    }
    p.box(g, 380, 10, 250, '#596366', [0, 360, -60]);
    const glass = p.box(g, 370, 250, 4, glassTint, [0, 230, -180]);
    Object.assign(glass.material, { transparent: true, opacity: 0.25 });
    // Wall-mounted office telephones & desk phones
    for (let i = -1; i <= 1; i++) {
      p.box(g, 34, 48, 16, '#c2c8c9', [i * 95, 260, -172]);
      p.box(g, 44, 18, 34, '#24272b', [i * 115, 114, 15]);
    }
  }

  private buildAquarium() {
    const p = this.props;
    const g = this.aquariumGroup;
    p.box(g, 1800, 10, 1200, '#261812', [0, -5, -100]);
    p.box(g, 1800, 640, 14, '#8d8272', [0, 315, -420]);
    // Huge framed glowing wall fish tank (0:27-0:36!)
    p.box(g, 640, 320, 24, '#182429', [0, 205, -350]);
    p.box(g, 608, 288, 12, aquariumBlue, [0, 205, -336]);
    // Aquatic kelp stalks
    for (let i = 0; i < 14; i++) {
      const x = -270 + i * 42;
      p.tube(g, [x, 68, -322], [x + Math.sin(i) * 20, 280 + (i % 3) * 20, -322], 6, kelpGreen);
    }
    // Rising aquarium bubbles
    for (let i = 0; i < 18; i++) {
      const b = p.oval(g, [-240 + (i * 29) % 480, 80 + (i * 17) % 240, -312], [5, 5, 5], '#a8f0ff');
      Object.assign(b.material, { transparent: true, opacity: 0.65 });
      this.bubbles.push(b);
    }
  }

  private buildMonoStudio() {
    const p = this.props;
    const g = this.monoGroup;
    // Stark pure white cyclorama floor & backdrop (0:40.5-0:49.5, 1:57, 2:24!)
    p.box(g, 3200, 10, 3200, whiteVoid, [0, -5, -600]);
    p.box(g, 3200, 1600, 10, whiteVoid, [0, 780, -1100]);
  }

  private buildDesert() {
    const p = this.props;
    const g = this.desertGroup;
    // Burnt-orange Western desert floor & mesas (0:58.5-1:16.5, 1:52.5, 2:01.5!)
    p.box(g, 3800, 10, 3200, desertSand, [0, -5, -700]);
    p.oval(g, [-650, 95, -1350], [420, 130, 220], '#803718');
    p.oval(g, [680, 120, -1450], [480, 160, 250], '#733014');

    // Vintage red & chrome Cadillac parked on stage left
    const car = new THREE.Group();
    g.add(car);
    car.position.set(-240, 0, -190);
    car.rotation.y = 0.25;
    p.box(car, 210, 66, 420, cadillacRed, [0, 52, 0]);
    p.box(car, 186, 48, 190, '#4f1813', [0, 102, -30]);
    p.box(car, 216, 16, 18, chromeCol, [0, 36, 210]);
    p.box(car, 195, 22, 12, chromeCol, [0, 56, 210]);
    for (const sx of [-98, 98]) {
      for (const sz of [-135, 135]) {
        p.mesh(car, new THREE.CylinderGeometry(28, 28, 18, 16), [sx, 28, sz], '#18181b').rotation.z = Math.PI / 2;
      }
    }

    // Iconic zig-zag yellow diamond road sign ("WHENEVER", 1:52.5!)
    p.tube(g, [260, 0, -240], [240, 75, -240], 4, '#241a15');
    p.tube(g, [240, 75, -240], [280, 145, -240], 4, '#241a15');
    p.tube(g, [280, 145, -240], [255, 220, -240], 4, '#241a15');
    const diamond = p.box(g, 74, 74, 6, signYellow, [255, 245, -236]);
    diamond.rotation.z = Math.PI / 4;
  }

  private buildChessboard() {
    const p = this.props;
    const g = this.chessGroup;
    // Black-and-white checkered floor (1:21-1:30!)
    for (let x = -4; x <= 4; x++) {
      for (let z = -4; z <= 3; z++) {
        const col = (x + z) % 2 === 0 ? '#f0ede6' : '#111214';
        p.box(g, 96, 8, 96, col, [x * 96, -4, z * 96 - 60]);
      }
    }
    // Giant sculpted white chess knight centerpiece
    p.mesh(g, new THREE.CylinderGeometry(64, 78, 32, 20), [0, 16, -95], '#eef0f2');
    p.oval(g, [0, 92, -95], [54, 72, 62], '#f2f4f7');
    p.oval(g, [18, 165, -75], [38, 48, 56], '#ffffff');
    p.oval(g, [56, 170, -52], [32, 22, 24], '#f7f8fa');
  }

  private buildEightBall(): THREE.Group {
    const p = this.props;
    const g = this.eightballGroup;
    // Emerald green billiard felt table
    p.box(g, 2400, 10, 2400, poolGreen, [0, -5, -400]);
    // Giant glossy black 8-ball (1:48 frame!)
    const ball = new THREE.Group();
    g.add(ball);
    ball.position.set(0, 155, -180);
    p.mesh(ball, new THREE.SphereGeometry(148, 28, 20), [0, 0, 0], '#0c0e10');
    p.mesh(ball, new THREE.CircleGeometry(48, 24), [38, 82, 118], '#f5f5f5');
    // Stylized "8" rings on the white circle
    p.mesh(ball, new THREE.TorusGeometry(13, 4.5, 6, 16), [38, 94, 121], '#111214');
    p.mesh(ball, new THREE.TorusGeometry(15, 4.5, 6, 16), [38, 69, 121], '#111214');
    return ball;
  }

  private buildCrashOffice() {
    const p = this.props;
    const g = this.crashGroup;
    // Waiting room wall smashed open by the vintage Cadillac (2:42 finale!)
    p.box(g, 1800, 10, 1400, '#2a1d17', [0, -5, -100]);
    p.box(g, 620, 560, 22, wallCream, [-560, 280, -340]);
    p.box(g, 620, 560, 22, wallCream, [560, 280, -340]);
    p.box(g, 600, 200, 22, wallCream, [0, 480, -340]);
    // Glowing burnt-orange sky visible through the smashed brick breach!
    p.box(g, 640, 420, 8, desertSky, [0, 210, -560]);
    // Cadillac nose smashed right into the waiting room
    p.box(g, 230, 74, 340, cadillacRed, [0, 56, -240]);
    p.box(g, 236, 18, 20, chromeCol, [0, 38, -68]);
    // Scattered rubble bricks
    for (let i = 0; i < 16; i++) {
      p.box(g, 26 + (i % 3) * 14, 16 + (i % 2) * 10, 22, i % 2 ? '#8f4b32' : '#9c9284', [
        Math.sin(i * 2.4) * 240, 10, -80 + Math.cos(i * 1.9) * 140
      ]);
    }
  }

  private styleMegan() {
    const p = this.props;
    const f = this.megan;
    const B = bodyPoint(f.model);
    const k = f.model.tract.scale;

    // 1. Copper-red bob hair (reception booth & aquarium!)
    f.root.add(this.copperBob);
    for (const sign of [-1, 1]) {
      p.oval(this.copperBob, [sign * 21, 14, -4], [11, 26, 15], copperHair);
    }
    p.oval(this.copperBob, [0, 36, -6], [23, 14, 20], copperHair);

    // 2. Sky-high black monochrome ponytail (white-void studio!)
    f.root.add(this.monoPonytail);
    p.oval(this.monoPonytail, [0, 38, -6], [20, 14, 18], blackHair);
    p.tube(this.monoPonytail, [0, 44, -10], [0, 98, -14], 7, blackHair);
    p.tube(this.monoPonytail, [0, 98, -14], [14, 142, -16], 3.5, blackHair);

    // 3. White blazer lapels (reception booth suit!)
    f.root.add(this.blazerLapels);
    p.box(this.blazerLapels, 10, 42, 18, lapelWhite, [-10, -24, 9]).rotation.z = 0.2;
    p.box(this.blazerLapels, 10, 42, 18, lapelWhite, [10, -24, 9]).rotation.z = -0.2;

    // 4. Giant cowboy hat with gold "M" emblem (Western desert!)
    f.root.add(this.cowboyHat);
    p.oval(this.cowboyHat, [0, 44, -2], [44, 5, 34], cowboyBrown);
    p.oval(this.cowboyHat, [0, 56, -2], [22, 16, 20], '#613f2d');
    p.box(this.cowboyHat, 14, 14, 4, '#f0c954', [0, 56, 18]);

    // 5. Dual landline handsets held up to ears (reception booth!)
    f.root.add(this.handPhones);
    for (const sign of [-1, 1]) {
      p.tube(this.handPhones, [sign * 24, 12, 16], [sign * 28, 32, 18], 4.5, '#191b1f');
    }

    // Subtle hairline base
    f.hair.begin();
    for (let row = -6; row <= 6; row++) {
      const z = row * 0.85 * k;
      const a = B(-6, 20);
      const b = B(6, 18);
      p.line(f.hair, [[a.x, a.y + 3 * k, z], [b.x, b.y, z]], '#1b1615', 2.4);
    }
    f.hair.end();
  }

  resize(w: number, h: number) {
    this.width = Math.max(1, w);
    this.height = Math.max(1, h);
    this.camera.aspect = this.width / this.height;
    this.props.resize(w, h);
    this.megan.head.resize(w, h);
  }

  frame(time: number, playing: boolean, epoch: number, view: CameraView, intensity: number, _speaker?: CharacterId) {
    const t = Math.max(0, Number.isFinite(time) ? time : 0);
    const dt = this.last === null ? 0 : Math.max(0, Math.min(0.05, t - this.last));
    const reset = epoch !== this.epoch || (this.last !== null && Math.abs(t - this.last) > 0.25);
    this.last = t;
    this.epoch = epoch;

    const aspect = this.width / this.height;
    const narrow = aspect < 1;
    const beat = Math.sin(t * (132 / 60) * Math.PI * 2);
    const sway = Math.sin(t * 3.1);

    const isWaiting = view === 'whenever-waiting' || view === 'whenever-tv';
    const isBooth = view === 'whenever-booth' || view === 'whenever-megan';
    const isAquarium = view === 'whenever-aquarium';
    const isMono = view === 'whenever-mono';
    const isDesert = view === 'whenever-desert' || view === 'whenever-cadillac';
    const isChess = view === 'whenever-chess';
    const isEightBall = view === 'whenever-eightball';
    const isCrash = view === 'whenever-crash';

    this.waitingGroup.visible = isWaiting;
    this.boothGroup.visible = isBooth;
    this.aquariumGroup.visible = isAquarium;
    this.monoGroup.visible = isMono;
    this.desertGroup.visible = isDesert;
    this.chessGroup.visible = isChess;
    this.eightballGroup.visible = isEightBall;
    this.crashGroup.visible = isCrash;

    const bg = isMono ? whiteVoid
      : isDesert ? desertSky
      : isEightBall ? poolGreen
      : isChess ? '#141517'
      : isAquarium ? '#1a2d33'
      : '#2c1b13';
    this.scene.background = new THREE.Color(bg);

    // Animate CRT TV flicker
    if (isWaiting) {
      (this.tvScreen.material as THREE.MeshBasicMaterial).color.set(beat > 0 ? '#e3843b' : '#c76926');
    }
    // Animate rising aquarium bubbles
    if (isAquarium) {
      this.bubbles.forEach((b, i) => {
        b.position.y = 72 + (((i * 21 + t * 55) % 250) + 250) % 250;
      });
    }
    // Gently rotate 8-ball
    if (isEightBall) {
      this.eightBallSphere.rotation.y = Math.sin(t * 0.7) * 0.25;
    }

    // Outfit & look per set
    this.copperBob.visible = isBooth || isAquarium || isCrash;
    this.blazerLapels.visible = isBooth || isCrash;
    this.handPhones.visible = isBooth;
    this.monoPonytail.visible = isMono;
    this.cowboyHat.visible = isDesert;

    const showMegan = !isWaiting && !isEightBall;
    this.megan.root.visible = showMegan;

    const bounce = Math.abs(beat) * (intensity > 0.8 ? 4.5 : 2.2);
    this.megan.root.rotation.set(0, 0, 0);
    if (isBooth) {
      this.megan.root.position.set(0, 178 + bounce * 0.6, -55);
      this.megan.root.rotation.set(0, sway * 0.08, beat * 0.03);
    } else if (isAquarium) {
      this.megan.root.position.set(10, 185 + Math.sin(t * 1.5) * 8, -280);
      this.megan.root.rotation.set(0, -0.1, 0.14);
    } else if (isChess) {
      this.megan.root.position.set(0, 175 + bounce * 0.5, -25);
      this.megan.root.rotation.set(0, sway * 0.1, 0);
    } else if (isDesert) {
      this.megan.root.position.set(20, 152 + bounce, -65);
      this.megan.root.rotation.set(0, sway * 0.12, beat * 0.04);
    } else {
      this.megan.root.position.set(0, 152 + bounce, -45);
      this.megan.root.rotation.set(0, sway * 0.08, beat * 0.03);
    }

    const arms: [P, P, P, P] = isBooth
      ? [[-26, -36, 16], [-22, -52, 34], [26, -36, 16], [22, -52, 34]]
      : [
          [-28, -36 + Math.sin(t * 4) * 5, 16],
          [-33, -46 + Math.sin(t * 4) * 8, 24],
          [28, -36 - Math.sin(t * 4) * 5, 16],
          [33, -46 - Math.sin(t * 4) * 8, 24],
        ];
    this.megan.pose(t, arms, isBooth);

    // Camera framing per shot
    let camPos: P = [0, 175, 230];
    let camLook: P = [0, 165, -55];
    let fov = narrow ? 46 : 36;

    switch (view) {
      case 'whenever-waiting':
        camPos = [0, 168, 230];
        camLook = [20, 148, -280];
        fov = narrow ? 50 : 40;
        break;
      case 'whenever-tv':
        camPos = [-280, 290, 60];
        camLook = [-360, 310, -300];
        fov = narrow ? 44 : 34;
        break;
      case 'whenever-booth':
        camPos = [0, 205, 225];
        camLook = [0, 185, -60];
        fov = narrow ? 48 : 38;
        break;
      case 'whenever-aquarium':
        camPos = [0, 205, 195];
        camLook = [0, 200, -320];
        fov = narrow ? 50 : 40;
        break;
      case 'whenever-mono':
        camPos = [0, 175, 185];
        camLook = [0, 168, -45];
        fov = narrow ? 42 : 32;
        break;
      case 'whenever-desert':
        camPos = [25, 172, 275];
        camLook = [0, 155, -140];
        fov = narrow ? 52 : 42;
        break;
      case 'whenever-cadillac':
        camPos = [-95, 162, 240];
        camLook = [-120, 130, -170];
        fov = narrow ? 50 : 40;
        break;
      case 'whenever-chess':
        camPos = [35, 195, 255];
        camLook = [0, 165, -55];
        fov = narrow ? 50 : 40;
        break;
      case 'whenever-eightball':
        camPos = [0, 180, 240];
        camLook = [0, 155, -180];
        fov = narrow ? 48 : 38;
        break;
      case 'whenever-crash':
        camPos = [0, 172, 295];
        camLook = [0, 138, -220];
        fov = narrow ? 52 : 42;
        break;
      case 'whenever-megan':
      case 'wide':
      default:
        camPos = [0, 205, 118];
        camLook = [0, 200, -55];
        fov = narrow ? 38 : 28;
        break;
    }

    this.camera.fov = fov;
    this.camera.position.set(...camPos);
    this.camera.lookAt(...camLook);
    this.camera.updateProjectionMatrix();
    this.camera.updateMatrixWorld();

    this.scene.updateMatrixWorld(true);
    if (this.megan.root.visible) {
      this.megan.update(t, playing, this.camera, dt, reset);
    }
  }

  dispose() {
    this.megan.dispose();
    this.props.dispose();
  }
}
