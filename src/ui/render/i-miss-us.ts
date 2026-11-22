import * as THREE from 'three';
import { VideoProps, VideoFigure, type VideoPoint as P } from './videoProps.ts';
import type { VoiceModel } from '../analysis.ts';
import type { TeleTrack } from '../../show/tele.ts';
import type { CameraView, CharacterId } from '../../scene/scene.ts';
import { bodyPoint } from './profile.ts';

export type IMissUsId = 'miss-joost' | 'miss-tommy' | 'miss-kaarija';

const skinEuro = '#e6c2aa';
const hairPlatinum = '#e8dfc8';
const hairDark = '#1a1716';
const whiteSuit = '#f2f3f6';
const crimsonTile = '#9c1c2e';
const neonGreen = '#42d858';
const skyLake = '#7a8a94';

function makeRedGridTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 256;
  const ctx = c.getContext('2d');
  if (!ctx) return null;
  ctx.fillStyle = crimsonTile;
  ctx.fillRect(0, 0, 512, 256);
  ctx.strokeStyle = '#380912';
  ctx.lineWidth = 6;
  for (let x = 0; x <= 512; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 256);
    ctx.stroke();
  }
  for (let y = 0; y <= 256; y += 42) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }
  return new THREE.CanvasTexture(c);
}

function makeGraffitiTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 256;
  const ctx = c.getContext('2d');
  if (!ctx) return null;
  ctx.fillStyle = '#7e3a2c';
  ctx.fillRect(0, 0, 512, 256);
  ctx.strokeStyle = '#4c2018';
  ctx.lineWidth = 2;
  for (let y = 0; y < 256; y += 20) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }
  ctx.font = 'bold 78px sans-serif';
  ctx.textAlign = 'center';
  ctx.lineWidth = 10;
  ctx.strokeStyle = '#141418';
  ctx.strokeText('I MISS US', 256, 152);
  ctx.fillStyle = neonGreen;
  ctx.fillText('I MISS US', 256, 152);
  return new THREE.CanvasTexture(c);
}

function makePaperTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 256;
  const ctx = c.getContext('2d');
  if (!ctx) return null;
  ctx.fillStyle = '#e8e2d2';
  ctx.fillRect(0, 0, 512, 256);
  ctx.fillStyle = '#141416';
  ctx.font = 'bold 54px serif';
  ctx.textAlign = 'center';
  ctx.fillText('POP TIMES', 256, 72);
  ctx.fillRect(40, 88, 432, 4);
  ctx.font = 'bold 34px serif';
  ctx.fillText('Euroboys are back!', 256, 142);
  ctx.font = '20px sans-serif';
  ctx.fillText('JOOST · TOMMY CASH · KÄÄRIJÄ', 256, 192);
  return new THREE.CanvasTexture(c);
}

/**
 * Procedural 3D 90s Eurovision boyband stage for Joost, Tommy Cash & Käärijä — "I MISS US".
 * Recreates the chrome studio microphones & crimson bokeh, starry Basel night & rainy Malmö street,
 * Nordic lakeside beach, curved crimson grid boyband chamber, candlelit grand piano, pouring rain
 * with clear umbrellas, 90s graffiti brick alley & DJ turntables, folding-chair garage with vintage
 * teal muscle car, mountain highway motorcycle sidecar, airport tarmac jet, and POP Times finale.
 */
export class IMissUsStage {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(40, 16 / 9, 1, 20000);
  readonly props = new VideoProps();

  readonly micsGroup = new THREE.Group();
  readonly lakeGroup = new THREE.Group();
  readonly redGridGroup = new THREE.Group();
  readonly pianoGroup = new THREE.Group();
  readonly rainGroup = new THREE.Group();
  readonly graffitiGroup = new THREE.Group();
  readonly garageGroup = new THREE.Group();
  readonly sidecarGroup = new THREE.Group();
  readonly tarmacGroup = new THREE.Group();
  readonly paperGroup = new THREE.Group();

  readonly rainDrops: THREE.Mesh[] = [];
  readonly candleFlames: THREE.Mesh[] = [];

  readonly joost: VideoFigure;
  readonly tommy: VideoFigure;
  readonly kaarija: VideoFigure;
  readonly keyLight: THREE.DirectionalLight;
  readonly accentL: THREE.PointLight;
  readonly accentR: THREE.PointLight;

  private readonly redGridTex: THREE.CanvasTexture | null;
  private readonly graffitiTex: THREE.CanvasTexture | null;
  private readonly paperTex: THREE.CanvasTexture | null;
  private width = 1280;
  private height = 720;
  private last: number | null = null;
  private epoch = -1;

  constructor(
    readonly joostModel: VoiceModel,
    readonly joostTrack: TeleTrack,
    readonly tommyModel: VoiceModel,
    readonly tommyTrack: TeleTrack,
    readonly kaarijaModel: VoiceModel,
    readonly kaarijaTrack: TeleTrack,
  ) {
    this.scene.background = new THREE.Color('#220814');

    const amb = new THREE.AmbientLight('#f2e8f4', 0.96);
    this.keyLight = new THREE.DirectionalLight('#fff6ec', 1.4);
    this.keyLight.position.set(160, 420, 340);
    this.accentL = new THREE.PointLight('#ff3b6b', 2.0, 2200);
    this.accentL.position.set(-220, 240, 180);
    this.accentR = new THREE.PointLight('#4cc4ff', 1.8, 2200);
    this.accentR.position.set(220, 260, -160);
    this.scene.add(amb, this.keyLight, this.accentL, this.accentR);

    // 1. Vintage chrome microphones & dreamy bokeh orbs
    const chromeMat = new THREE.MeshStandardMaterial({ color: '#d8dee6', metalness: 0.85, roughness: 0.18 });
    for (const mx of [-95, 0, 95]) {
      const stand = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 2.2, 138, 8), chromeMat);
      stand.position.set(mx, 69, 44);
      const mic = new THREE.Mesh(new THREE.CapsuleGeometry(6.5, 11, 8, 12), chromeMat);
      mic.position.set(mx, 144, 44);
      this.micsGroup.add(stand, mic);
    }
    const bokehMat = new THREE.MeshBasicMaterial({ color: '#ff2b68', transparent: true, opacity: 0.35 });
    for (let i = 0; i < 14; i++) {
      const orb = new THREE.Mesh(new THREE.CircleGeometry(28 + (i % 4) * 14, 16), bokehMat);
      orb.position.set(((i * 97) % 720) - 360, 60 + ((i * 53) % 240), -260 - (i % 3) * 40);
      this.micsGroup.add(orb);
    }

    // 2. Cloudy Nordic lakeside beach
    const sand = new THREE.Mesh(
      new THREE.PlaneGeometry(2000, 900),
      new THREE.MeshStandardMaterial({ color: '#b6aa96', roughness: 0.92 }),
    );
    sand.rotation.x = -Math.PI / 2;
    sand.position.set(0, 0, 120);
    const lake = new THREE.Mesh(
      new THREE.PlaneGeometry(2200, 900),
      new THREE.MeshStandardMaterial({ color: '#465e66', metalness: 0.35, roughness: 0.25 }),
    );
    lake.rotation.x = -Math.PI / 2;
    lake.position.set(0, -1, -560);
    this.lakeGroup.add(sand, lake);

    // 3. Curved crimson grid boyband chamber
    this.redGridTex = makeRedGridTexture();
    const chamberWall = new THREE.Mesh(
      new THREE.CylinderGeometry(360, 360, 360, 24, 1, true, Math.PI * 0.7, Math.PI * 1.6),
      new THREE.MeshStandardMaterial({ map: this.redGridTex, side: THREE.BackSide, roughness: 0.5 }),
    );
    chamberWall.position.set(0, 180, -40);
    const chamberFloor = new THREE.Mesh(
      new THREE.CircleGeometry(380, 28),
      new THREE.MeshStandardMaterial({ color: '#5c0e1a', metalness: 0.35, roughness: 0.25 }),
    );
    chamberFloor.rotation.x = -Math.PI / 2;
    const ceilingGlow = new THREE.Mesh(
      new THREE.CircleGeometry(340, 24),
      new THREE.MeshBasicMaterial({ color: '#ffe4ea', side: THREE.DoubleSide }),
    );
    ceilingGlow.rotation.x = Math.PI / 2;
    ceilingGlow.position.set(0, 355, -40);
    this.redGridGroup.add(chamberWall, chamberFloor, ceilingGlow);

    // 4. Candlelit grand piano stage
    const pianoBody = new THREE.Mesh(
      new THREE.BoxGeometry(200, 56, 130),
      new THREE.MeshStandardMaterial({ color: '#141418', metalness: 0.4, roughness: 0.2 }),
    );
    pianoBody.position.set(0, 84, -75);
    const candleMat = new THREE.MeshStandardMaterial({ color: '#f6edd4', roughness: 0.6 });
    const flameMat = new THREE.MeshBasicMaterial({ color: '#ffc844' });
    for (let c = 0; c < 8; c++) {
      const cx = -70 + c * 20;
      const cz = -30 - (c % 3) * 24;
      const ch = 14 + (c % 3) * 8;
      const wax = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.2, ch, 8), candleMat);
      wax.position.set(cx, 112 + ch / 2, cz);
      const fl = new THREE.Mesh(new THREE.ConeGeometry(3.2, 10, 6), flameMat);
      fl.position.set(cx, 112 + ch + 5, cz);
      this.candleFlames.push(fl);
      this.pianoGroup.add(wax, fl);
    }
    this.pianoGroup.add(pianoBody);

    // 5. Pouring backlit silver rain & translucent umbrellas
    const rainMat = new THREE.MeshBasicMaterial({ color: '#c4deee', transparent: true, opacity: 0.55 });
    for (let i = 0; i < 42; i++) {
      const drop = new THREE.Mesh(new THREE.BoxGeometry(1.4, 28, 1.4), rainMat);
      drop.position.set(((i * 73) % 640) - 320, (i * 37) % 340, ((i * 59) % 240) - 100);
      this.rainDrops.push(drop);
      this.rainGroup.add(drop);
    }
    const umbMat = new THREE.MeshStandardMaterial({ color: '#dceeff', transparent: true, opacity: 0.42, roughness: 0.2 });
    for (const ux of [-96, 0, 96]) {
      const dome = new THREE.Mesh(new THREE.SphereGeometry(52, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.45), umbMat);
      dome.position.set(ux, 224, -18);
      this.rainGroup.add(dome);
    }

    // 6. 90s graffiti brick alley & red DJ turntables
    this.graffitiTex = makeGraffitiTexture();
    const brickWall = new THREE.Mesh(
      new THREE.PlaneGeometry(660, 340),
      new THREE.MeshStandardMaterial({ map: this.graffitiTex, roughness: 0.88 }),
    );
    brickWall.position.set(0, 175, -185);
    const djDesk = new THREE.Mesh(
      new THREE.BoxGeometry(190, 92, 62),
      new THREE.MeshStandardMaterial({ color: '#22242a', roughness: 0.6 }),
    );
    djDesk.position.set(0, 46, 52);
    const platterMat = new THREE.MeshStandardMaterial({ color: '#e03628', roughness: 0.3 });
    for (const px of [-48, 48]) {
      const pl = new THREE.Mesh(new THREE.CylinderGeometry(24, 24, 4, 16), platterMat);
      pl.position.set(px, 95, 52);
      this.graffitiGroup.add(pl);
    }
    this.graffitiGroup.add(brickWall, djDesk);

    // 7. Industrial garage with vintage teal muscle car & folding chairs
    const garFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(1400, 1000),
      new THREE.MeshStandardMaterial({ color: '#2e484a', metalness: 0.25, roughness: 0.45 }),
    );
    garFloor.rotation.x = -Math.PI / 2;
    const garDoor = new THREE.Mesh(
      new THREE.BoxGeometry(620, 320, 18),
      new THREE.MeshStandardMaterial({ color: '#285646', roughness: 0.72 }),
    );
    garDoor.position.set(0, 160, -240);
    const tealCar = new THREE.Mesh(
      new THREE.BoxGeometry(230, 56, 104),
      new THREE.MeshStandardMaterial({ color: '#2e7e98', metalness: 0.6, roughness: 0.28 }),
    );
    tealCar.position.set(220, 42, -110);
    const gasPump = new THREE.Mesh(
      new THREE.BoxGeometry(38, 128, 34),
      new THREE.MeshStandardMaterial({ color: '#c8a852', roughness: 0.55 }),
    );
    gasPump.position.set(-225, 64, -120);
    this.garageGroup.add(garFloor, garDoor, tealCar, gasPump);

    // 8. Mountain highway motorcycle & sidecar
    const bikeBody = new THREE.Mesh(
      new THREE.BoxGeometry(58, 52, 160),
      new THREE.MeshStandardMaterial({ color: '#6a1a1c', metalness: 0.65, roughness: 0.25 }),
    );
    bikeBody.position.set(0, 56, -10);
    const sidecar = new THREE.Mesh(
      new THREE.BoxGeometry(62, 42, 120),
      new THREE.MeshStandardMaterial({ color: '#7e1e20', metalness: 0.6, roughness: 0.3 }),
    );
    sidecar.position.set(-88, 48, 0);
    const headlight = new THREE.Mesh(
      new THREE.SphereGeometry(12, 10, 10),
      new THREE.MeshBasicMaterial({ color: '#fff4c8' }),
    );
    headlight.position.set(0, 82, 74);
    this.sidecarGroup.add(bikeBody, sidecar, headlight);

    // 9. Airport tarmac & jetliner
    const tarmac = new THREE.Mesh(
      new THREE.PlaneGeometry(2400, 1800),
      new THREE.MeshStandardMaterial({ color: '#586470', roughness: 0.9 }),
    );
    tarmac.rotation.x = -Math.PI / 2;
    const fuselage = new THREE.Mesh(
      new THREE.CylinderGeometry(34, 34, 480, 14),
      new THREE.MeshStandardMaterial({ color: '#e6ecf2', metalness: 0.3, roughness: 0.3 }),
    );
    fuselage.rotation.z = Math.PI / 2;
    fuselage.position.set(80, 145, -360);
    const tailFin = new THREE.Mesh(
      new THREE.BoxGeometry(58, 95, 10),
      new THREE.MeshStandardMaterial({ color: '#2d5898' }),
    );
    tailFin.position.set(-140, 205, -360);
    this.tarmacGroup.add(tarmac, fuselage, tailFin);

    // 10. POP Times "Euroboys are back!" backdrop
    this.paperTex = makePaperTexture();
    const paper = new THREE.Mesh(
      new THREE.PlaneGeometry(540, 280),
      new THREE.MeshStandardMaterial({ map: this.paperTex, roughness: 0.9 }),
    );
    paper.position.set(0, 175, -175);
    this.paperGroup.add(paper);

    this.scene.add(
      this.micsGroup,
      this.lakeGroup,
      this.redGridGroup,
      this.pianoGroup,
      this.rainGroup,
      this.graffitiGroup,
      this.garageGroup,
      this.sidecarGroup,
      this.tarmacGroup,
      this.paperGroup,
    );

    // 3 Physical Male Voices
    // 1. Joost Klein (white suit, white bucket hat, platinum mullet)
    this.joost = new VideoFigure(joostModel, joostTrack, this.props, this.scene, whiteSuit, skinEuro);
    this.joost.head.scene.scale.setScalar(2.04);
    this.props.box(this.joost.root, 36, 58, 22, whiteSuit, [0, -34, 2]);
    this.props.oval(this.joost.root, [0, 32, -2], [18, 8, 18], whiteSuit);
    this.styleHair(this.joost, hairPlatinum, false);

    // 2. Tommy Cash (white suit, long straight dark hair & mustache)
    this.tommy = new VideoFigure(tommyModel, tommyTrack, this.props, this.scene, whiteSuit, skinEuro);
    this.tommy.head.scene.scale.setScalar(2.02);
    this.props.box(this.tommy.root, 34, 58, 22, whiteSuit, [0, -34, 2]);
    this.styleHair(this.tommy, hairDark, true);

    // 3. Käärijä (white jacket / striped boyband pop accent, dark bowl-cut fade)
    this.kaarija = new VideoFigure(kaarijaModel, kaarijaTrack, this.props, this.scene, whiteSuit, skinEuro);
    this.kaarija.head.scene.scale.setScalar(2.04);
    this.props.box(this.kaarija.root, 36, 58, 22, whiteSuit, [0, -34, 2]);
    this.props.box(this.kaarija.root, 18, 46, 23, neonGreen, [0, -34, 3]);
    this.styleHair(this.kaarija, hairDark, false);

    this.resize(1280, 720);
    this.frame(0, false, 0, 'miss-mics', 0);
  }

  private styleHair(f: VideoFigure, color: string, longHair: boolean): void {
    const p = this.props;
    const B = bodyPoint(f.model);
    const k = f.model.tract.scale;
    f.hair.begin();
    for (let row = -8; row <= 8; row++) {
      const z = row * 0.85 * k;
      const a = B(-8, 22);
      const b = B(8, 17);
      p.line(f.hair, [[a.x, a.y + 4 * k, z], [a.x + 5 * k, a.y + 7 * k, z], [b.x, b.y - 2 * k, z]], color, 3.8);
      if (longHair && Math.abs(row) >= 4) {
        p.line(f.hair, [[a.x, a.y, z], [a.x - 1.5 * k, a.y - 20 * k, z], [a.x - 1 * k, a.y - 36 * k, z]], color, 3.2);
      }
    }
    f.hair.end();
  }

  resize(width: number, height: number): void {
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
    this.camera.aspect = this.width / this.height;
    this.props.resize(this.width, this.height);
    this.joost.head.resize(this.width, this.height);
    this.tommy.head.resize(this.width, this.height);
    this.kaarija.head.resize(this.width, this.height);
  }

  frame(
    time: number,
    playing: boolean,
    epoch: number,
    view: CameraView = 'wide',
    intensity = 0,
    speaker?: CharacterId,
  ): void {
    const t = Math.max(0, Number.isFinite(time) ? time : 0);
    const dt = this.last === null ? 0 : Math.max(0, Math.min(0.05, t - this.last));
    const reset = epoch !== this.epoch || (this.last !== null && Math.abs(t - this.last) > 0.25);
    this.last = t;
    this.epoch = epoch;

    const q = t * (104 / 60) * Math.PI * 2;
    const bounce = Math.abs(Math.sin(q)) * 5.0;
    const sway = Math.sin(q * 0.5);

    this.micsGroup.visible = view === 'miss-mics' || view === 'wide';
    this.lakeGroup.visible = view === 'miss-lake';
    this.redGridGroup.visible = view === 'miss-red-grid';
    this.pianoGroup.visible = view === 'miss-piano';
    this.rainGroup.visible = view === 'miss-rain';
    this.graffitiGroup.visible = view === 'miss-graffiti';
    this.garageGroup.visible = view === 'miss-garage';
    this.sidecarGroup.visible = view === 'miss-sidecar';
    this.tarmacGroup.visible = view === 'miss-tarmac';
    this.paperGroup.visible = view === 'miss-ending';

    // Animate rain streaks & piano candles
    this.rainDrops.forEach((d, idx) => {
      d.position.y = 350 - ((t * 360 + idx * 41) % 360);
    });
    this.candleFlames.forEach((fl, idx) => {
      fl.scale.y = 0.8 + Math.abs(Math.sin(t * 12 + idx)) * 0.5;
    });

    if (view === 'miss-lake' || view === 'miss-tarmac') {
      this.scene.background = new THREE.Color(skyLake);
    } else if (view === 'miss-red-grid') {
      this.scene.background = new THREE.Color('#3c0812');
    } else if (view === 'miss-night' || view === 'miss-rain' || view === 'miss-piano') {
      this.scene.background = new THREE.Color('#0c121e');
    } else if (view === 'miss-sidecar') {
      this.scene.background = new THREE.Color('#6a8298');
    } else if (view === 'miss-ending') {
      this.scene.background = new THREE.Color('#181a20');
    } else {
      this.scene.background = new THREE.Color('#240a16');
    }

    const stepX = sway * 16;
    this.joost.root.position.set(stepX, 150 + bounce, -12);
    this.joost.root.rotation.set(0, sway * 0.14, sway * 0.04);

    this.tommy.root.position.set(-96 + stepX * 0.9, 148 + bounce * 0.9, -24);
    this.tommy.root.rotation.set(0, 0.14 + sway * 0.12, sway * 0.04);

    this.kaarija.root.position.set(96 + stepX * 0.9, 148 + bounce * 0.9, -24);
    this.kaarija.root.rotation.set(0, -0.14 + sway * 0.12, -sway * 0.04);

    // Classic 90s boyband reaching-hand choreography!
    const boybandArms = (phase: number, reach: number): [P, P, P, P] => [
      [-32, -4 + Math.sin(phase) * 14, 24],
      [-46, 16 + reach + Math.sin(phase) * 18, 36],
      [32, -4 - Math.sin(phase) * 14, 24],
      [46, 16 + reach - Math.sin(phase) * 18, 36],
    ];
    this.joost.pose(t, boybandArms(q, speaker === 'miss-joost' ? 20 : 8));
    this.tommy.pose(t, boybandArms(q + 0.5, speaker === 'miss-tommy' ? 20 : 8));
    this.kaarija.pose(t, boybandArms(q + 1.0, speaker === 'miss-kaarija' ? 20 : 8));

    const portrait = this.height > this.width;
    let pos: P = [Math.sin(t * 0.35) * 60, 174, 380];
    let target: P = [0, 154, -20];
    let fov = portrait ? 52 : 40;

    switch (view) {
      case 'miss-joost':
        pos = [this.joost.root.position.x + Math.sin(t * 0.6) * 10, 172, 112];
        target = [this.joost.root.position.x, 170, -12];
        fov = portrait ? 38 : 28;
        break;
      case 'miss-tommy':
        pos = [this.tommy.root.position.x - 10, 170, 102];
        target = [this.tommy.root.position.x, 168, -24];
        fov = portrait ? 38 : 28;
        break;
      case 'miss-kaarija':
        pos = [this.kaarija.root.position.x + 10, 170, 102];
        target = [this.kaarija.root.position.x, 168, -24];
        fov = portrait ? 38 : 28;
        break;
      case 'miss-red-grid':
        pos = [Math.sin(t * 0.5) * 48, 166, 330];
        target = [0, 152, -20];
        fov = portrait ? 54 : 42;
        break;
      case 'miss-piano':
        pos = [Math.sin(t * 0.3) * 75, 186, 360];
        target = [0, 146, -55];
        fov = portrait ? 52 : 40;
        break;
      case 'miss-rain':
        pos = [Math.sin(t * 0.4) * 55, 178, 370];
        target = [0, 156, -20];
        fov = portrait ? 52 : 40;
        break;
      case 'miss-graffiti':
        pos = [Math.sin(t * 0.6) * 42, 166, 290];
        target = [0, 154, -40];
        fov = portrait ? 50 : 38;
        break;
      case 'miss-garage':
      case 'miss-sidecar':
      case 'miss-tarmac':
      case 'miss-lake':
      case 'miss-night':
      case 'miss-ending':
      case 'miss-mics':
      case 'wide':
      default:
        pos = [Math.sin(t * 0.35) * 65, 174, 385];
        target = [0, 154, -25];
        fov = portrait ? 52 : 40;
        break;
    }

    if (intensity > 0.85) pos[1] += Math.sin(q) * 1.5;

    this.camera.fov = fov;
    this.camera.position.set(pos[0], pos[1], pos[2]);
    this.camera.lookAt(target[0], target[1], target[2]);
    this.camera.updateProjectionMatrix();
    this.camera.updateMatrixWorld();

    this.scene.updateMatrixWorld(true);
    this.joost.update(t, playing, this.camera, dt, reset);
    this.tommy.update(t, playing, this.camera, dt, reset);
    this.kaarija.update(t, playing, this.camera, dt, reset);
  }

  dispose(): void {
    this.joost.dispose();
    this.tommy.dispose();
    this.kaarija.dispose();
    this.redGridTex?.dispose();
    this.graffitiTex?.dispose();
    this.paperTex?.dispose();
    this.props.dispose();
  }
}
