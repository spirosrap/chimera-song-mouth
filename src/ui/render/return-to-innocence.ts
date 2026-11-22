import * as THREE from 'three';
import { VideoProps, VideoFigure, type VideoPoint as P } from './videoProps.ts';
import type { VoiceModel } from '../analysis.ts';
import type { TeleTrack } from '../../show/tele.ts';
import type { CameraView, CharacterId } from '../../scene/scene.ts';
import { bodyPoint } from './profile.ts';

export type EnigmaId = 'enigma-angel' | 'enigma-sandra' | 'enigma-chant';

const sepiaBg = '#2c251d';
const candleBg = '#140b06';
const seaBg = '#3e5266';
const mountainSky = '#5a7fb8';
const forestMist = '#7e8480';
const appleRed = '#c64632';
const goldFlame = '#ffb948';
const skinWarm = '#d6a888';
const skinElder = '#c49678';
const beretDark = '#1c1816';
const linenCream = '#e6dcc8';
const veilWhite = '#f6f4f0';
const hairDark = '#221814';
const hairSoft = '#523426';

/**
 * Procedural 3D reverse-time cinematic stage for Enigma — "Return to Innocence".
 * Recreates Julien Temple's sepia-to-color reverse-time journey across southern Spain:
 * gnarled orchard tree with crimson apples rising backwards off the grass, candlelit church altar,
 * misty blue ocean waves, sun-dappled grape vineyard, stone shepherd pasture with flock,
 * reverse wedding doorway, candlelit lovers, snow-capped mountain valley,
 * misty silver-birch forest with a luminous white unicorn/horse, sunlit cottage window,
 * vintage bicycle ride, and stone chapel baptism.
 */
export class ReturnToInnocenceStage {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(38, 16 / 9, 1, 20000);
  readonly props = new VideoProps();

  readonly orchardGroup = new THREE.Group();
  readonly churchGroup = new THREE.Group();
  readonly seaGroup = new THREE.Group();
  readonly mountainGroup = new THREE.Group();
  readonly forestGroup = new THREE.Group();
  readonly cottageGroup = new THREE.Group();

  readonly risingApples: THREE.Mesh[] = [];
  readonly candleFlames: THREE.Mesh[] = [];
  readonly waveMesh: THREE.Mesh;
  readonly unicornGroup = new THREE.Group();
  readonly bicycleGroup = new THREE.Group();
  readonly fillLight: THREE.PointLight;
  readonly rimLight: THREE.PointLight;

  readonly angel: VideoFigure;
  readonly sandra: VideoFigure;
  readonly elder: VideoFigure;

  private width = 1280;
  private height = 720;
  private last: number | null = null;
  private epoch = -1;

  constructor(
    readonly angelModel: VoiceModel,
    readonly angelTrack: TeleTrack,
    readonly sandraModel: VoiceModel,
    readonly sandraTrack: TeleTrack,
    readonly chantModel: VoiceModel,
    readonly chantTrack: TeleTrack,
  ) {
    this.scene.background = new THREE.Color(sepiaBg);

    const amb = new THREE.AmbientLight('#f2e4cc', 0.9);
    const key = new THREE.DirectionalLight('#fff2d8', 1.35);
    key.position.set(160, 420, 340);
    this.fillLight = new THREE.PointLight('#ffbe66', 1.8, 2200);
    this.fillLight.position.set(-200, 220, 220);
    this.rimLight = new THREE.PointLight('#9ec8ff', 1.5, 2200);
    this.rimLight.position.set(220, 280, -200);
    this.scene.add(amb, key, this.fillLight, this.rimLight);

    // 1. Sepia Orchard & Reverse-Rising Apples
    const grass = new THREE.Mesh(
      new THREE.PlaneGeometry(1800, 1400),
      new THREE.MeshStandardMaterial({ color: '#4a4332', roughness: 0.95 }),
    );
    grass.rotation.x = -Math.PI / 2;
    this.orchardGroup.add(grass);
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(20, 32, 260, 10),
      new THREE.MeshStandardMaterial({ color: '#403124', roughness: 0.95 }),
    );
    trunk.position.set(-140, 130, -170);
    trunk.rotation.z = -0.14;
    const canopy = new THREE.Mesh(
      new THREE.SphereGeometry(140, 14, 12),
      new THREE.MeshStandardMaterial({ color: '#4d523a', roughness: 0.9 }),
    );
    canopy.scale.set(1.4, 0.78, 1.1);
    canopy.position.set(-110, 275, -170);
    this.orchardGroup.add(trunk, canopy);

    const appleMat = new THREE.MeshStandardMaterial({ color: appleRed, roughness: 0.35 });
    for (let i = 0; i < 20; i++) {
      const a = new THREE.Mesh(new THREE.SphereGeometry(9, 10, 10), appleMat);
      a.position.set(-220 + (i % 6) * 68, 14, -220 + Math.floor(i / 6) * 58);
      this.risingApples.push(a);
      this.orchardGroup.add(a);
    }
    // Stone village wall
    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(900, 95, 36),
      new THREE.MeshStandardMaterial({ color: '#7a6c5a', roughness: 0.92 }),
    );
    wall.position.set(180, 48, -280);
    this.orchardGroup.add(wall);

    // 2. Candlelit Spanish Cathedral Altar & Baptism Arch
    const churchFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(1800, 1400),
      new THREE.MeshStandardMaterial({ color: '#261a14', roughness: 0.7 }),
    );
    churchFloor.rotation.x = -Math.PI / 2;
    this.churchGroup.add(churchFloor);
    const altar = new THREE.Mesh(
      new THREE.BoxGeometry(360, 340, 40),
      new THREE.MeshStandardMaterial({ color: '#4f3318', roughness: 0.5, metalness: 0.3 }),
    );
    altar.position.set(0, 170, -290);
    const goldArch = new THREE.Mesh(
      new THREE.TorusGeometry(120, 14, 10, 24, Math.PI),
      new THREE.MeshStandardMaterial({ color: '#d4a442', emissive: '#5e3d0a', emissiveIntensity: 0.4, metalness: 0.65 }),
    );
    goldArch.position.set(0, 180, -265);
    this.churchGroup.add(altar, goldArch);

    const waxMat = new THREE.MeshStandardMaterial({ color: '#f2e4c8', roughness: 0.5 });
    const flameMat = new THREE.MeshBasicMaterial({ color: goldFlame });
    for (let i = -5; i <= 5; i++) {
      const h = 38 + (Math.abs(i) % 3) * 18;
      const cx = i * 44;
      const cz = -150 + (Math.abs(i) % 2) * 40;
      const candle = new THREE.Mesh(new THREE.CylinderGeometry(5, 5.5, h, 8), waxMat);
      candle.position.set(cx, 72 + h / 2, cz);
      const flame = new THREE.Mesh(new THREE.ConeGeometry(5.5, 18, 8), flameMat);
      flame.position.set(cx, 72 + h + 11, cz);
      this.candleFlames.push(flame);
      this.churchGroup.add(candle, flame);
    }

    // 3. Misty Blue Ocean Waves
    const oceanMat = new THREE.MeshStandardMaterial({
      color: '#4c6d88',
      emissive: '#1e364c',
      emissiveIntensity: 0.35,
      roughness: 0.25,
      metalness: 0.2,
    });
    this.waveMesh = new THREE.Mesh(new THREE.PlaneGeometry(2000, 1600, 24, 24), oceanMat);
    this.waveMesh.rotation.x = -Math.PI / 2;
    this.seaGroup.add(this.waveMesh);
    const foam = new THREE.Mesh(
      new THREE.BoxGeometry(1600, 8, 55),
      new THREE.MeshStandardMaterial({ color: '#dce8f2', roughness: 0.9 }),
    );
    foam.position.set(0, 4, -80);
    this.seaGroup.add(foam);

    // 4. Snow-Capped Sierra Nevada Mountain Valley & Flock of Sheep
    const meadow = new THREE.Mesh(
      new THREE.PlaneGeometry(1800, 1400),
      new THREE.MeshStandardMaterial({ color: '#586246', roughness: 0.95 }),
    );
    meadow.rotation.x = -Math.PI / 2;
    this.mountainGroup.add(meadow);
    const peak = new THREE.Mesh(
      new THREE.ConeGeometry(420, 320, 6),
      new THREE.MeshStandardMaterial({ color: '#7a889c', roughness: 0.85 }),
    );
    peak.position.set(60, 160, -540);
    const snowCap = new THREE.Mesh(
      new THREE.ConeGeometry(210, 155, 6),
      new THREE.MeshStandardMaterial({ color: '#f2f6fc', roughness: 0.7 }),
    );
    snowCap.position.set(60, 245, -540);
    this.mountainGroup.add(peak, snowCap);
    const woolMat = new THREE.MeshStandardMaterial({ color: '#ede8dc', roughness: 0.95 });
    for (let i = 0; i < 12; i++) {
      const sheep = new THREE.Mesh(new THREE.SphereGeometry(14, 10, 10), woolMat);
      sheep.scale.set(1.4, 0.9, 0.9);
      sheep.position.set(-220 + i * 38, 16, -150 + (i % 3) * 26);
      this.mountainGroup.add(sheep);
    }

    // 5. Misty Silver-Birch Forest & Luminous White Unicorn/Horse
    const forestFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(1800, 1400),
      new THREE.MeshStandardMaterial({ color: '#4c463a', roughness: 0.95 }),
    );
    forestFloor.rotation.x = -Math.PI / 2;
    this.forestGroup.add(forestFloor);
    const birchMat = new THREE.MeshStandardMaterial({ color: '#b8b6ad', roughness: 0.85 });
    for (let i = 0; i < 24; i++) {
      const bx = ((i * 97) % 900) - 450;
      const bz = -120 - ((i * 53) % 360);
      if (Math.abs(bx) < 90 && bz > -200) continue;
      const tree = new THREE.Mesh(new THREE.CylinderGeometry(7, 10, 440, 8), birchMat);
      tree.position.set(bx, 220, bz);
      this.forestGroup.add(tree);
    }
    // Luminous White Unicorn / Horse
    const horseMat = new THREE.MeshStandardMaterial({
      color: '#f8f8fc',
      emissive: '#ccdcf0',
      emissiveIntensity: 0.35,
      roughness: 0.35,
    });
    const hBody = new THREE.Mesh(new THREE.CylinderGeometry(20, 22, 78, 12), horseMat);
    hBody.rotation.z = Math.PI / 2;
    hBody.position.set(0, 74, 0);
    const hNeck = new THREE.Mesh(new THREE.CylinderGeometry(11, 16, 46, 10), horseMat);
    hNeck.position.set(36, 104, 0);
    hNeck.rotation.z = -0.38;
    const hHead = new THREE.Mesh(new THREE.BoxGeometry(28, 16, 14), horseMat);
    hHead.position.set(52, 122, 0);
    const hHorn = new THREE.Mesh(
      new THREE.ConeGeometry(2.8, 28, 8),
      new THREE.MeshStandardMaterial({ color: '#fff8dc', emissive: '#ffdf88', emissiveIntensity: 0.8 }),
    );
    hHorn.position.set(62, 138, 0);
    hHorn.rotation.z = -0.55;
    this.unicornGroup.add(hBody, hNeck, hHead, hHorn);
    for (const [lx, lz] of [[-26, -10], [-26, 10], [26, -10], [26, 10]]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 3.8, 68, 8), horseMat);
      leg.position.set(lx, 34, lz);
      this.unicornGroup.add(leg);
    }
    this.unicornGroup.position.set(45, 0, -180);
    this.forestGroup.add(this.unicornGroup);

    // 6. Sunlit Rustic Cottage Window & Vintage Bicycle
    const cotFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(1800, 1400),
      new THREE.MeshStandardMaterial({ color: '#644a38', roughness: 0.9 }),
    );
    cotFloor.rotation.x = -Math.PI / 2;
    const cotWall = new THREE.Mesh(
      new THREE.BoxGeometry(1000, 440, 26),
      new THREE.MeshStandardMaterial({ color: '#826b5c', roughness: 0.9 }),
    );
    cotWall.position.set(0, 220, -290);
    const sunWindow = new THREE.Mesh(
      new THREE.PlaneGeometry(140, 165),
      new THREE.MeshBasicMaterial({ color: '#fff2d8' }),
    );
    sunWindow.position.set(-180, 200, -274);
    const sunDoor = new THREE.Mesh(
      new THREE.PlaneGeometry(145, 290),
      new THREE.MeshBasicMaterial({ color: '#ffe8c8' }),
    );
    sunDoor.position.set(190, 145, -274);
    this.cottageGroup.add(cotFloor, cotWall, sunWindow, sunDoor);

    // Vintage bicycle prop
    const wheelMat = new THREE.MeshStandardMaterial({ color: '#262422', metalness: 0.6 });
    const w1 = new THREE.Mesh(new THREE.TorusGeometry(26, 3, 8, 20), wheelMat);
    w1.position.set(-38, 28, -90);
    const w2 = w1.clone();
    w2.position.x = 38;
    const frameBar = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.5, 78, 8), wheelMat);
    frameBar.rotation.z = Math.PI / 2;
    frameBar.position.set(0, 42, -90);
    this.bicycleGroup.add(w1, w2, frameBar);
    this.cottageGroup.add(this.bicycleGroup);

    this.scene.add(
      this.orchardGroup,
      this.churchGroup,
      this.seaGroup,
      this.mountainGroup,
      this.forestGroup,
      this.cottageGroup,
    );

    // 1. Angel X — soaring male lead vocal
    this.angel = new VideoFigure(angelModel, angelTrack, this.props, this.scene, '#2d2926', skinWarm);
    this.angel.head.scene.scale.setScalar(2.04);
    this.props.box(this.angel.root, 36, 58, 22, linenCream, [0, -34, 3]);
    this.styleHair(this.angel, hairDark, false);

    // 2. Sandra — whispered female narrator / wedding bride figure
    this.sandra = new VideoFigure(sandraModel, sandraTrack, this.props, this.scene, veilWhite, skinWarm);
    this.sandra.head.scene.scale.setScalar(2.0);
    this.props.box(this.sandra.root, 34, 62, 22, veilWhite, [0, -34, 2]);
    this.styleHair(this.sandra, hairSoft, true);

    // 3. Amis Elder / Peasant Man in dark beret — soaring pentatonic chant
    this.elder = new VideoFigure(chantModel, chantTrack, this.props, this.scene, '#4a3d32', skinElder);
    this.elder.head.scene.scale.setScalar(2.06);
    // Iconic Spanish beret hat
    this.props.oval(this.elder.root, [0, 38, -2], [24, 8, 22], beretDark);
    this.styleHair(this.elder, '#8a867e', false);

    this.resize(1280, 720);
    this.frame(0, false, 0, 'enigma-orchard', 0);
  }

  private styleHair(f: VideoFigure, color: string, longFlow: boolean) {
    const p = this.props;
    const B = bodyPoint(f.model);
    const k = f.model.tract.scale;
    f.hair.begin();
    for (let row = -8; row <= 8; row++) {
      const z = row * 0.85 * k;
      const a = B(-8, 21);
      const b = B(8, longFlow ? 10 : 18);
      p.line(f.hair, [[a.x, a.y + 4 * k, z], [a.x + 5 * k, a.y + 6 * k, z], [b.x, b.y - (longFlow ? 12 : 2) * k, z]], color, 3.6);
    }
    f.hair.end();
  }

  resize(width: number, height: number): void {
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
    this.camera.aspect = this.width / this.height;
    this.props.resize(this.width, this.height);
    this.angel.head.resize(this.width, this.height);
    this.sandra.head.resize(this.width, this.height);
    this.elder.head.resize(this.width, this.height);
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

    const pulse = Math.sin(t * (88 / 60) * Math.PI * 2);
    const sway = Math.sin(t * 0.85);

    const isOrchard = view === 'enigma-orchard' || view === 'enigma-apples' || view === 'enigma-vineyard' || view === 'enigma-pasture';
    const isChurch = view === 'enigma-church' || view === 'enigma-candles' || view === 'enigma-lovers' || view === 'enigma-baptism';
    const isSea = view === 'enigma-sea';
    const isMountain = view === 'enigma-mountain';
    const isForest = view === 'enigma-unicorn' || view === 'enigma-ending';
    const isCottage = view === 'enigma-wedding' || view === 'enigma-cottage' || view === 'enigma-bicycle';

    this.orchardGroup.visible = isOrchard || view === 'wide' || view === 'enigma-angel' || view === 'enigma-chant';
    this.churchGroup.visible = isChurch || view === 'enigma-sandra';
    this.seaGroup.visible = isSea;
    this.mountainGroup.visible = isMountain;
    this.forestGroup.visible = isForest;
    this.cottageGroup.visible = isCottage;
    this.bicycleGroup.visible = view === 'enigma-bicycle';

    // Reverse-time apple levitation (apples float UP from grass to branches!)
    if (this.orchardGroup.visible) {
      const liftPhase = (t * 0.14) % 1;
      this.risingApples.forEach((a, idx) => {
        const localLift = (liftPhase + idx * 0.07) % 1;
        a.position.y = 14 + Math.pow(localLift, 1.4) * 235;
        a.rotation.y = t * 1.2 + idx;
      });
    }

    // Flickering altar candles
    if (this.churchGroup.visible) {
      this.candleFlames.forEach((fl, idx) => {
        fl.scale.y = 0.85 + Math.sin(t * 7 + idx * 1.7) * 0.22;
      });
    }

    // Drifting ocean waves
    if (this.seaGroup.visible) {
      this.waveMesh.position.y = Math.sin(t * 1.4) * 6;
    }

    // Mystical white unicorn gliding in reverse across the silver-birch forest
    if (this.forestGroup.visible) {
      this.unicornGroup.position.x = 60 - Math.sin(t * 0.35) * 95;
      this.unicornGroup.position.y = Math.abs(Math.sin(t * 2.6)) * 10;
    }

    // Sky / backdrop tint per poetic act
    if (isChurch || view === 'enigma-sandra') {
      this.scene.background = new THREE.Color(candleBg);
      this.fillLight.color.set(goldFlame);
      this.rimLight.color.set('#ff8844');
    } else if (isSea) {
      this.scene.background = new THREE.Color(seaBg);
      this.fillLight.color.set('#b4d8f8');
      this.rimLight.color.set('#7aa4cc');
    } else if (isMountain) {
      this.scene.background = new THREE.Color(mountainSky);
      this.fillLight.color.set('#fff4dc');
      this.rimLight.color.set('#cce0ff');
    } else if (isForest) {
      this.scene.background = new THREE.Color(forestMist);
      this.fillLight.color.set('#e8f2ff');
      this.rimLight.color.set('#ffffff');
    } else if (isCottage) {
      this.scene.background = new THREE.Color('#3c2d24');
      this.fillLight.color.set('#ffdfb0');
      this.rimLight.color.set('#e8c49a');
    } else {
      this.scene.background = new THREE.Color(sepiaBg);
      this.fillLight.color.set('#f5d6a4');
      this.rimLight.color.set('#c4a882');
    }

    // Performer visibility & serene timeless blocking
    this.angel.root.visible = view !== 'enigma-sandra' && view !== 'enigma-chant' && view !== 'enigma-ending';
    this.sandra.root.visible = view === 'enigma-sandra' || view === 'enigma-candles' || view === 'enigma-lovers' || view === 'enigma-wedding' || view === 'wide';
    this.elder.root.visible = view === 'enigma-chant' || view === 'enigma-orchard' || view === 'enigma-apples' || view === 'enigma-pasture' || view === 'enigma-mountain' || view === 'wide';

    const bob = Math.sin(t * 1.4) * 2.5;
    this.angel.root.position.set(0, 150 + bob, -15);
    this.angel.root.rotation.set(0, sway * 0.1, 0);

    this.sandra.root.position.set(-78, 146 + bob * 0.8, -32);
    this.sandra.root.rotation.set(0, 0.22 + sway * 0.08, 0);

    this.elder.root.position.set(82, 148 + bob * 0.7, -36);
    this.elder.root.rotation.set(0, -0.22 + sway * 0.08, 0);

    const openArm = 10 + intensity * 14;
    const sereneArms = (phase: number): [P, P, P, P] => [
      [-28, -36 + Math.sin(phase) * 4, 14],
      [-32, -46 + openArm * 0.4 + Math.sin(phase) * 6, 22],
      [28, -36 - Math.sin(phase) * 4, 14],
      [32, -46 + openArm * 0.4 - Math.sin(phase) * 6, 22],
    ];
    this.angel.pose(t, sereneArms(t * 1.1));
    this.sandra.pose(t, sereneArms(t * 0.9 + 1));
    this.elder.pose(t, sereneArms(t * 0.8 + 2));

    // Camera framing
    const portrait = this.height > this.width;
    let pos: P = [0, 174, 385];
    let target: P = [0, 156, -60];
    let fov = portrait ? 52 : 38;

    switch (view) {
      case 'enigma-angel':
        pos = [Math.sin(t * 0.4) * 14, 172, 112];
        target = [0, 170, -15];
        fov = portrait ? 40 : 28;
        break;
      case 'enigma-sandra':
        pos = [-68, 168, 96];
        target = [-78, 166, -32];
        fov = portrait ? 40 : 28;
        break;
      case 'enigma-chant':
        pos = [72, 170, 94];
        target = [82, 168, -36];
        fov = portrait ? 40 : 28;
        break;
      case 'enigma-orchard':
        pos = [65, 175, 290];
        target = [-40, 155, -140];
        fov = portrait ? 52 : 38;
        break;
      case 'enigma-apples':
        pos = [-40, 195, 145];
        target = [-110, 195, -170];
        fov = portrait ? 50 : 36;
        break;
      case 'enigma-church':
      case 'enigma-baptism':
        pos = [0, 175, 275];
        target = [0, 160, -180];
        fov = portrait ? 52 : 38;
        break;
      case 'enigma-candles':
      case 'enigma-lovers':
        pos = [-32, 164, 165];
        target = [-38, 160, -70];
        fov = portrait ? 44 : 32;
        break;
      case 'enigma-sea':
        pos = [Math.sin(t * 0.3) * 65, 190, 320];
        target = [0, 140, -110];
        fov = portrait ? 54 : 40;
        break;
      case 'enigma-vineyard':
      case 'enigma-pasture':
        pos = [-110, 175, 290];
        target = [20, 150, -120];
        fov = portrait ? 52 : 38;
        break;
      case 'enigma-wedding':
      case 'enigma-cottage':
      case 'enigma-bicycle':
        pos = [Math.sin(t * 0.35) * 45, 168, 285];
        target = [0, 156, -120];
        fov = portrait ? 50 : 38;
        break;
      case 'enigma-mountain':
        pos = [0, 185, 360];
        target = [20, 165, -260];
        fov = portrait ? 54 : 42;
        break;
      case 'enigma-unicorn':
      case 'enigma-ending':
        pos = [Math.sin(t * 0.3) * 50, 145, 215];
        target = [this.unicornGroup.position.x * 0.4, 118, -170];
        fov = portrait ? 50 : 38;
        break;
      case 'wide':
      default:
        pos = [Math.sin(t * 0.25) * 55, 178, 395];
        target = [0, 158, -60];
        fov = portrait ? 54 : 40;
        break;
    }

    // Subtle breath sway on active speaker
    if (speaker) pos[1] += pulse * 0.8;

    this.camera.fov = fov;
    this.camera.position.set(pos[0], pos[1], pos[2]);
    this.camera.lookAt(target[0], target[1], target[2]);
    this.camera.updateProjectionMatrix();
    this.camera.updateMatrixWorld();

    this.scene.updateMatrixWorld(true);
    if (this.angel.root.visible) this.angel.update(t, playing, this.camera, dt, reset);
    if (this.sandra.root.visible) this.sandra.update(t, playing, this.camera, dt, reset);
    if (this.elder.root.visible) this.elder.update(t, playing, this.camera, dt, reset);
  }

  dispose(): void {
    this.angel.dispose();
    this.sandra.dispose();
    this.elder.dispose();
    this.props.dispose();
  }
}
