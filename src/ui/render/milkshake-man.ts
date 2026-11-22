import * as THREE from 'three';
import { VideoProps, VideoFigure, type VideoPoint as P } from './videoProps.ts';
import type { VoiceModel } from '../analysis.ts';
import type { TeleTrack } from '../../show/tele.ts';
import type { CameraView, CharacterId } from '../../scene/scene.ts';
import { bodyPoint } from './profile.ts';

export type MilkshakeId = 'milk-gojo' | 'milk-dancer';

const bgDark = '#110a1a';
const skinGojo = '#d8a484';
const skinDancer = '#e2b296';
const hairBrown = '#382319';
const hairGinger = '#9e4422';
const scarfRed = '#e2262c';
const whiteSuit = '#f5f2eb';
const babyBlue = '#7bc8f2';
const dressRed = '#dc2838';
const pinkNeon = '#ff44bb';
const limeNeon = '#6dff3d';
const cyanNeon = '#2ee6ff';
const amberNeon = '#ff8c24';

function makeCheckerTexture(colorA: string, colorB: string, splashes = false): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext('2d');
  if (!ctx) return null;
  const n = 16;
  const s = 512 / n;
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      ctx.fillStyle = (x + y) % 2 === 0 ? colorA : colorB;
      ctx.fillRect(x * s, y * s, s, s);
    }
  }
  if (splashes) {
    ctx.fillStyle = '#ffffff';
    for (const [cx, cy, r] of [[120, 260, 52], [390, 220, 60], [260, 380, 44], [150, 210, 22], [430, 270, 26]]) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  return tex;
}

function makeSignTexture(topText: string, bottomText: string, bg: string, fg: string): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 256;
  const ctx = c.getContext('2d');
  if (!ctx) return null;
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 512, 256);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 10;
  ctx.strokeRect(12, 12, 488, 232);
  ctx.fillStyle = fg;
  ctx.font = 'bold 64px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(topText, 256, 110);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 76px sans-serif';
  ctx.fillText(bottomText, 256, 196);
  return new THREE.CanvasTexture(c);
}

/**
 * Procedural 3D Eurovision 2025 stage for Go-Jo — "Milkshake Man".
 * Recreates the retro woodgrain CRT TV frame, pink/green striped diner curtains,
 * optical checkerboard LED floor (B&W -> neon lime -> electric blue -> warm amber -> red milk-splash),
 * giant glowing center-stage milkshake blender tower, twin MILKSHAKE MAN signs,
 * pink smoke clouds, fruit/milk splash LED wall, Go-Jo's three live outfit reveals
 * (white milkman jumpsuit -> sparkly baby-blue sleeveless jumpsuit -> shirtless finale with red scarf),
 * and two retro red-and-white diner dancers.
 */
export class MilkshakeManStage {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(38, 16 / 9, 1, 20000);
  readonly props = new VideoProps();

  readonly arenaGroup = new THREE.Group();
  readonly dinerGroup = new THREE.Group();
  readonly tvFrameGroup = new THREE.Group();
  readonly smokeGroup = new THREE.Group();
  readonly starWallGroup = new THREE.Group();
  readonly fruitWallGroup = new THREE.Group();
  readonly laserGroup = new THREE.Group();
  readonly susanKerchief = new THREE.Group();

  readonly floorMesh: THREE.Mesh;
  readonly blenderGlowMat: THREE.MeshStandardMaterial;
  readonly milkCoreMesh: THREE.Mesh;
  readonly fillLight: THREE.PointLight;
  readonly rimLight: THREE.PointLight;

  readonly gojo: VideoFigure;
  readonly dancer: VideoFigure;
  readonly dancerProxy: THREE.Group;
  readonly gojoJacketMesh: THREE.Mesh;
  readonly gojoBlueTopMesh: THREE.Mesh;
  readonly gojoBareTorsoMesh: THREE.Mesh;
  readonly handBlender: THREE.Group;

  private readonly texBW: THREE.CanvasTexture | null;
  private readonly texLime: THREE.CanvasTexture | null;
  private readonly texRedSplash: THREE.CanvasTexture | null;
  private readonly texAmber: THREE.CanvasTexture | null;
  private readonly texBlue: THREE.CanvasTexture | null;

  private width = 1280;
  private height = 720;
  private last: number | null = null;
  private epoch = -1;

  constructor(
    readonly gojoModel: VoiceModel,
    readonly gojoTrack: TeleTrack,
    readonly dancerModel: VoiceModel,
    readonly dancerTrack: TeleTrack,
  ) {
    this.scene.background = new THREE.Color(bgDark);

    const amb = new THREE.AmbientLight('#ffe8f5', 0.9);
    const keyLight = new THREE.DirectionalLight('#fff5ea', 1.4);
    keyLight.position.set(160, 420, 380);
    this.fillLight = new THREE.PointLight(pinkNeon, 2.2, 2200);
    this.fillLight.position.set(-220, 260, 260);
    this.rimLight = new THREE.PointLight(cyanNeon, 2.2, 2200);
    this.rimLight.position.set(220, 280, -180);
    this.scene.add(amb, keyLight, this.fillLight, this.rimLight);

    this.texBW = makeCheckerTexture('#f5f5f5', '#15151a');
    this.texLime = makeCheckerTexture('#6dff3d', '#111810');
    this.texRedSplash = makeCheckerTexture('#e62230', '#160910', true);
    this.texAmber = makeCheckerTexture('#ff9c2a', '#4a1208');
    this.texBlue = makeCheckerTexture('#2498ff', '#091438');

    const floorMat = new THREE.MeshStandardMaterial({
      color: '#ffffff',
      map: this.texBW,
      roughness: 0.35,
      metalness: 0.15,
    });
    this.floorMesh = new THREE.Mesh(new THREE.PlaneGeometry(1800, 1400), floorMat);
    this.floorMesh.rotation.x = -Math.PI / 2;
    this.floorMesh.position.set(0, 0, 80);
    this.arenaGroup.add(this.floorMesh);

    // Eurovision Basel stage arch frame
    const archMat = new THREE.MeshStandardMaterial({ color: '#eceef5', emissive: '#554477', emissiveIntensity: 0.35 });
    const archLeft = new THREE.Mesh(new THREE.BoxGeometry(36, 560, 42), archMat);
    archLeft.position.set(-560, 280, -340);
    const archRight = archLeft.clone();
    archRight.position.x = 560;
    const archTop = new THREE.Mesh(new THREE.BoxGeometry(1160, 36, 42), archMat);
    archTop.position.set(0, 560, -340);
    this.arenaGroup.add(archLeft, archRight, archTop);

    // Colossal glowing center-stage milkshake blender tower
    const blenderBase = new THREE.Mesh(
      new THREE.CylinderGeometry(86, 102, 52, 8),
      new THREE.MeshStandardMaterial({ color: '#f0f0f8', emissive: '#6633aa', emissiveIntensity: 0.4 }),
    );
    blenderBase.position.set(0, 26, -185);
    this.arenaGroup.add(blenderBase);

    this.blenderGlowMat = new THREE.MeshStandardMaterial({
      color: '#e8f6ff',
      emissive: '#9be4ff',
      emissiveIntensity: 0.65,
      transparent: true,
      opacity: 0.42,
      roughness: 0.12,
    });
    const blenderGlass = new THREE.Mesh(new THREE.CylinderGeometry(96, 80, 310, 24), this.blenderGlowMat);
    blenderGlass.position.set(0, 206, -185);
    this.arenaGroup.add(blenderGlass);

    this.milkCoreMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(74, 62, 240, 20),
      new THREE.MeshStandardMaterial({ color: '#fff8fa', emissive: '#ffcce8', emissiveIntensity: 0.45, roughness: 0.25 }),
    );
    this.milkCoreMesh.position.set(0, 175, -185);
    this.arenaGroup.add(this.milkCoreMesh);

    const blenderLid = new THREE.Mesh(
      new THREE.CylinderGeometry(102, 102, 24, 24),
      new THREE.MeshStandardMaterial({ color: '#e6e8f2', metalness: 0.7, roughness: 0.2 }),
    );
    blenderLid.position.set(0, 372, -185);
    this.arenaGroup.add(blenderLid);

    // Twin MILKSHAKE MAN neon billboard signs
    const signTex = makeSignTexture('MILKSHAKE', 'MAN', '#301458', '#ffe354');
    const signMat = new THREE.MeshBasicMaterial({ map: signTex, color: '#ffffff' });
    for (const sx of [-285, 285]) {
      const sign = new THREE.Mesh(new THREE.PlaneGeometry(210, 105), signMat);
      sign.position.set(sx, 290, -295);
      this.arenaGroup.add(sign);
    }

    // Retro pink & green diner curtains (intro / verse 1)
    for (let i = -5; i <= 5; i++) {
      const col = Math.abs(i) % 2 === 0 ? pinkNeon : (Math.abs(i) % 3 === 0 ? limeNeon : '#f4eef6');
      const panel = new THREE.Mesh(
        new THREE.CylinderGeometry(28, 28, 420, 10),
        new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.22, roughness: 0.5 }),
      );
      panel.position.set(i * 54, 210, -230);
      this.dinerGroup.add(panel);
    }
    this.arenaGroup.add(this.dinerGroup);

    // Arena laser fan beams
    for (let i = -6; i <= 6; i++) {
      const beam = new THREE.Mesh(
        new THREE.CylinderGeometry(3, 12, 820, 6),
        new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? cyanNeon : pinkNeon, transparent: true, opacity: 0.55 }),
      );
      beam.position.set(i * 65, 360, -280);
      beam.rotation.z = i * 0.11;
      this.laserGroup.add(beam);
    }
    this.arenaGroup.add(this.laserGroup);

    // Pink blender smoke puffs
    const smokeMat = new THREE.MeshStandardMaterial({
      color: '#ffd6ef',
      emissive: '#ff88cc',
      emissiveIntensity: 0.4,
      transparent: true,
      opacity: 0.55,
      roughness: 1,
    });
    for (let i = 0; i < 16; i++) {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(42 + (i % 4) * 18, 12, 12), smokeMat);
      puff.position.set(((i % 5) - 2) * 70, 80 + Math.floor(i / 5) * 68, -125 + (i % 3) * 35);
      this.smokeGroup.add(puff);
    }
    this.arenaGroup.add(this.smokeGroup);

    // Neon purple/cyan star wall
    const starMat = new THREE.MeshBasicMaterial({ color: pinkNeon, wireframe: true });
    for (let i = 0; i < 6; i++) {
      const ring = new THREE.Mesh(new THREE.RingGeometry(85 + i * 52, 95 + i * 52, 5), starMat);
      ring.position.set(0, 230, -310);
      ring.rotation.z = i * 0.18;
      this.starWallGroup.add(ring);
    }
    this.arenaGroup.add(this.starWallGroup);

    // Giant berry & milk-wave LED climax wall
    const berryMat = new THREE.MeshStandardMaterial({ color: '#e61c3d', emissive: '#b50c28', emissiveIntensity: 0.55 });
    const berry = new THREE.Mesh(new THREE.SphereGeometry(145, 18, 14), berryMat);
    berry.position.set(0, 250, -320);
    this.fruitWallGroup.add(berry);
    const splashMat = new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#d8f4ff', emissiveIntensity: 0.5 });
    for (let i = 0; i < 14; i++) {
      const ang = (i / 14) * Math.PI * 2;
      const drop = new THREE.Mesh(new THREE.SphereGeometry(28 + (i % 3) * 14, 12, 12), splashMat);
      drop.position.set(Math.cos(ang) * 260, 240 + Math.sin(ang) * 125, -305);
      this.fruitWallGroup.add(drop);
    }
    this.arenaGroup.add(this.fruitWallGroup);

    // Retro woodgrain CRT TV bezel (attached to camera during milk-tv cuts)
    const tvMat = new THREE.MeshStandardMaterial({ color: '#7a5a42', roughness: 0.6 });
    const bezelMat = new THREE.MeshStandardMaterial({ color: '#2b2826', roughness: 0.4 });
    const topBar = new THREE.Mesh(new THREE.BoxGeometry(240, 26, 12), tvMat);
    topBar.position.set(0, 82, -165);
    const botBar = topBar.clone();
    botBar.position.y = -82;
    const leftBar = new THREE.Mesh(new THREE.BoxGeometry(30, 190, 12), tvMat);
    leftBar.position.set(-112, 0, -165);
    const rightBar = new THREE.Mesh(new THREE.BoxGeometry(46, 190, 12), tvMat);
    rightBar.position.set(116, 0, -165);
    const innerRim = new THREE.Mesh(new THREE.BoxGeometry(210, 6, 14), bezelMat);
    innerRim.position.set(0, 68, -162);
    this.tvFrameGroup.add(topBar, botBar, leftBar, rightBar, innerRim);
    for (let k = 0; k < 3; k++) {
      const knob = new THREE.Mesh(new THREE.CylinderGeometry(6, 6, 6, 14), bezelMat);
      knob.rotation.x = Math.PI / 2;
      knob.position.set(116, 36 - k * 28, -157);
      this.tvFrameGroup.add(knob);
    }
    this.scene.add(this.arenaGroup);
    this.scene.add(this.camera);
    this.camera.add(this.tvFrameGroup);

    // 1. Go-Jo lead physical airway figure
    this.gojo = new VideoFigure(gojoModel, gojoTrack, this.props, this.scene, whiteSuit, skinGojo);
    this.gojo.head.scene.scale.setScalar(2.08);
    this.styleGojo();

    // Three live outfit torso layers for Go-Jo (local coords around root origin y=0 neck/chest)
    this.gojoJacketMesh = this.props.box(this.gojo.root, 38, 62, 24, whiteSuit, [0, -34, 2]);
    this.gojoBlueTopMesh = this.props.box(this.gojo.root, 36, 60, 22, babyBlue, [0, -34, 2]);
    this.gojoBareTorsoMesh = this.props.box(this.gojo.root, 35, 60, 21, skinGojo, [0, -34, 2]);

    // 2. Lead Diner Dancer physical airway figure
    this.dancer = new VideoFigure(dancerModel, dancerTrack, this.props, this.scene, dressRed, skinDancer);
    this.dancer.head.scene.scale.setScalar(2.0);
    this.styleDancer();

    // Handheld glass milkshake blender prop
    this.handBlender = new THREE.Group();
    const hbBase = new THREE.Mesh(new THREE.CylinderGeometry(6, 7, 7, 12), new THREE.MeshStandardMaterial({ color: '#e8e8f0' }));
    const hbCup = new THREE.Mesh(
      new THREE.CylinderGeometry(6.5, 5, 16, 12),
      new THREE.MeshStandardMaterial({ color: '#ffe4f2', transparent: true, opacity: 0.72 }),
    );
    hbCup.position.y = 11;
    this.handBlender.add(hbBase, hbCup);
    this.handBlender.position.set(-28, -24, 24);
    this.dancer.root.add(this.handBlender);

    // "Susan" headscarf gag prop
    const kerchief = new THREE.Mesh(
      new THREE.ConeGeometry(22, 28, 8),
      new THREE.MeshStandardMaterial({ color: '#d8c49a', roughness: 0.85 }),
    );
    kerchief.position.set(0, 40, -2);
    this.susanKerchief.add(kerchief);
    this.dancer.root.add(this.susanKerchief);

    // Second symmetrical diner dancer proxy on stage right
    this.dancerProxy = new THREE.Group();
    const pDress = new THREE.Mesh(
      new THREE.ConeGeometry(22, 82, 14),
      new THREE.MeshStandardMaterial({ color: '#e62a68', roughness: 0.45 }),
    );
    pDress.position.y = 82;
    const pHead = new THREE.Mesh(new THREE.SphereGeometry(12, 14, 14), new THREE.MeshStandardMaterial({ color: skinDancer }));
    pHead.position.y = 154;
    const pHair = new THREE.Mesh(new THREE.SphereGeometry(14.5, 14, 14), new THREE.MeshStandardMaterial({ color: hairGinger }));
    pHair.position.set(0, 158, -3);
    this.dancerProxy.add(pDress, pHead, pHair);
    this.dancerProxy.position.set(108, 0, -40);
    this.dancerProxy.rotation.y = -0.26;
    this.scene.add(this.dancerProxy);

    this.resize(1280, 720);
    this.frame(0, false, 0, 'milk-tv', 0);
  }

  private styleGojo() {
    const p = this.props;
    const B = bodyPoint(this.gojo.model);
    const k = this.gojo.model.tract.scale;

    // Bright red neck scarf + hanging scarf tail
    p.mesh(this.gojo.root, new THREE.TorusGeometry(13, 3.2, 8, 20), [0, -2, 2], scarfRed).rotation.x = Math.PI / 2;
    p.box(this.gojo.root, 7, 28, 3, scarfRed, [5, -20, 15]).rotation.z = -0.15;

    // Shaggy curly brown mullet & signature mustache
    this.gojo.hair.begin();
    for (let row = -9; row <= 9; row++) {
      const z = row * 0.9 * k;
      const a = B(-8, 21);
      const b = B(8, 17);
      p.line(this.gojo.hair, [[a.x, a.y + 5 * k, z], [a.x + 5 * k, a.y + 8 * k, z], [b.x, b.y - 4 * k, z]], hairBrown, 4.0);
    }
    p.line(this.gojo.hair, [[-8, 12, 19], [0, 14, 21], [8, 12, 19]], hairBrown, 3.4);
    this.gojo.hair.end();
  }

  private styleDancer() {
    const p = this.props;
    const B = bodyPoint(this.dancer.model);
    const k = this.dancer.model.tract.scale;

    // Red-and-white striped diner collar
    p.box(this.dancer.root, 32, 12, 22, '#ffffff', [0, -8, 4]);
    p.box(this.dancer.root, 34, 8, 24, dressRed, [0, -24, 3]);

    // Retro wavy ginger bouffant hair
    this.dancer.hair.begin();
    for (let row = -8; row <= 8; row++) {
      const z = row * 0.85 * k;
      const a = B(-8, 22);
      const b = B(9, 14);
      p.line(this.dancer.hair, [[a.x, a.y + 6 * k, z], [a.x + 6 * k, a.y + 8 * k, z], [b.x, b.y - 6 * k, z]], hairGinger, 3.8);
    }
    this.dancer.hair.end();
  }

  resize(width: number, height: number): void {
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
    this.camera.aspect = this.width / this.height;
    this.props.resize(this.width, this.height);
    this.gojo.head.resize(this.width, this.height);
    this.dancer.head.resize(this.width, this.height);
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

    const q = t * (124 / 60) * Math.PI * 2;
    const beat = Math.sin(q);
    const sway = Math.sin(q * 0.5);
    const pulse = 0.5 + 0.5 * beat;

    // Go-Jo live costume evolution matching Eurovision 2025 performance
    const isShirtless = t >= 150 || view === 'milk-shirtless' || view === 'milk-finale';
    const isBlueSuit = !isShirtless && (t >= 68 || view === 'milk-blue' || view === 'milk-susan' || view === 'milk-lime' || view === 'milk-amber' || view === 'milk-smoke' || view === 'milk-stars');
    this.gojoJacketMesh.visible = !isShirtless && !isBlueSuit;
    this.gojoBlueTopMesh.visible = isBlueSuit;
    this.gojoBareTorsoMesh.visible = isShirtless;

    // Act-based staging elements
    this.tvFrameGroup.visible = view === 'milk-tv';
    this.dinerGroup.visible = view === 'milk-tv' || view === 'milk-diner' || t < 40;
    this.laserGroup.visible = view === 'milk-blue' || view === 'milk-stars' || view === 'milk-finale';
    this.smokeGroup.visible = view === 'milk-smoke' || (t >= 109 && t <= 118);
    this.starWallGroup.visible = view === 'milk-stars' || (t >= 117 && t <= 140);
    this.fruitWallGroup.visible = view === 'milk-fruit' || view === 'milk-shirtless' || view === 'milk-finale' || t >= 147;
    this.susanKerchief.visible = view === 'milk-susan';
    this.handBlender.visible = view === 'milk-diner' || view === 'milk-tv' || t < 38;

    // Floor palette & lighting mood per Eurovision act
    const floorMat = this.floorMesh.material as THREE.MeshStandardMaterial;
    if (view === 'milk-lime' || view === 'milk-susan') {
      floorMat.map = this.texLime;
      this.fillLight.color.set(limeNeon);
      this.rimLight.color.set(pinkNeon);
      this.blenderGlowMat.emissive.set(limeNeon);
    } else if (view === 'milk-amber') {
      floorMat.map = this.texAmber;
      this.fillLight.color.set(amberNeon);
      this.rimLight.color.set('#ff3d1f');
      this.blenderGlowMat.emissive.set(amberNeon);
    } else if (view === 'milk-red-splash' || view === 'milk-fruit' || view === 'milk-shirtless') {
      floorMat.map = this.texRedSplash;
      this.fillLight.color.set('#ff2655');
      this.rimLight.color.set('#44e8ff');
      this.blenderGlowMat.emissive.set('#ff5599');
    } else if (view === 'milk-blue' || view === 'milk-stars') {
      floorMat.map = this.texBlue;
      this.fillLight.color.set(cyanNeon);
      this.rimLight.color.set('#b44dff');
      this.blenderGlowMat.emissive.set(cyanNeon);
    } else {
      floorMat.map = this.texBW;
      this.fillLight.color.set(pinkNeon);
      this.rimLight.color.set(cyanNeon);
      this.blenderGlowMat.emissive.set('#9be4ff');
    }
    floorMat.needsUpdate = true;

    this.milkCoreMesh.rotation.y = t * 1.4;
    this.milkCoreMesh.scale.y = 0.94 + pulse * 0.08 + intensity * 0.06;
    this.starWallGroup.rotation.z = t * 0.25;
    this.smokeGroup.position.y = Math.sin(t * 1.5) * 14;

    // Stage blocking & groove
    const grooveY = Math.abs(beat) * 4.5;
    const gojoX = view === 'milk-diner' || view === 'milk-tv' ? -28 : sway * 20;
    const gojoZ = view === 'milk-shirtless' ? 45 : -10;
    this.gojo.root.position.set(gojoX, 152 + grooveY, gojoZ);
    this.gojo.root.rotation.set(0, sway * 0.14, sway * 0.05);

    const dancerX = view === 'milk-diner' || view === 'milk-tv' ? 44 : -105 + Math.sin(t * 1.1) * 12;
    const dancerZ = view === 'milk-diner' || view === 'milk-tv' ? -8 : -40;
    this.dancer.root.position.set(dancerX, 146 + grooveY * 0.8, dancerZ);
    this.dancer.root.rotation.set(0, dancerX > 0 ? -0.22 : 0.26, sway * 0.04);

    const gojoLift = speaker === 'milk-gojo' ? 18 : 6;
    const gojoArms: [P, P, P, P] = [
      [-28, -36 + Math.sin(q) * 5, 16],
      [-34, -46 + gojoLift * 0.45 + Math.sin(q) * 7, 26],
      [28, -36 - Math.sin(q) * 5, 16],
      [34, -46 + gojoLift * 0.45 - Math.sin(q) * 7, 26],
    ];
    const dancerArms: [P, P, P, P] = [
      [-27, -36 + beat * 5, 14],
      [-32, -46 + beat * 7, 22],
      [27, -36 - beat * 5, 14],
      [32, -46 - beat * 7, 22],
    ];
    this.gojo.pose(t, gojoArms);
    this.dancer.pose(t, dancerArms);

    this.dancerProxy.position.y = grooveY;
    this.dancerProxy.rotation.z = Math.sin(t * 2.2) * 0.07;

    // Camera framing (portrait-responsive FOV)
    const portrait = this.height > this.width;
    let pos: P = [0, 175, 420];
    let target: P = [0, 150, -50];
    let fov = portrait ? 52 : 38;

    switch (view) {
      case 'milk-gojo':
        pos = [gojoX + Math.sin(t * 0.7) * 14, 174, gojoZ + 128];
        target = [gojoX, 172, gojoZ];
        fov = portrait ? 40 : 28;
        break;
      case 'milk-dancer':
        pos = [dancerX - 10, 168, dancerZ + 128];
        target = [dancerX, 166, dancerZ];
        fov = portrait ? 40 : 28;
        break;
      case 'milk-tv':
        pos = [8, 162, 225];
        target = [8, 160, -10];
        fov = portrait ? 48 : 36;
        break;
      case 'milk-diner':
        pos = [8, 164, 210];
        target = [8, 162, -10];
        fov = portrait ? 46 : 34;
        break;
      case 'milk-blender':
        pos = [Math.sin(t * 0.4) * 90, 185, 360];
        target = [0, 170, -140];
        fov = portrait ? 54 : 40;
        break;
      case 'milk-checker':
        pos = [0, 275, 450];
        target = [0, 125, -50];
        fov = portrait ? 56 : 42;
        break;
      case 'milk-blue':
        pos = [-150, 170, 365];
        target = [0, 155, -100];
        fov = portrait ? 54 : 40;
        break;
      case 'milk-susan':
        pos = [-42, 164, 175];
        target = [-55, 160, -25];
        fov = portrait ? 46 : 34;
        break;
      case 'milk-lime':
        pos = [0, 390, 315];
        target = [0, 85, -80];
        fov = portrait ? 58 : 44;
        break;
      case 'milk-amber':
        pos = [165, 170, 340];
        target = [0, 155, -90];
        fov = portrait ? 52 : 38;
        break;
      case 'milk-smoke':
        pos = [0, 162, 265];
        target = [0, 156, -45];
        fov = portrait ? 48 : 36;
        break;
      case 'milk-stars':
        pos = [Math.sin(t * 0.6) * 80, 168, 365];
        target = [0, 162, -120];
        fov = portrait ? 54 : 40;
        break;
      case 'milk-red-splash':
        pos = [0, 430, 265];
        target = [0, 75, -75];
        fov = portrait ? 58 : 46;
        break;
      case 'milk-fruit':
        pos = [Math.sin(t * 0.5) * 65, 168, 355];
        target = [0, 162, -110];
        fov = portrait ? 54 : 40;
        break;
      case 'milk-shirtless':
        pos = [gojoX + 18, 168, gojoZ + 145];
        target = [gojoX, 160, gojoZ];
        fov = portrait ? 44 : 32;
        break;
      case 'milk-finale':
        pos = [0, 215, 560];
        target = [0, 175, -140];
        fov = portrait ? 58 : 44;
        break;
      case 'wide':
      default:
        pos = [Math.sin(t * 0.35) * 85, 185, 435];
        target = [0, 150, -60];
        fov = portrait ? 54 : 40;
        break;
    }

    this.camera.fov = fov;
    this.camera.position.set(pos[0], pos[1], pos[2]);
    this.camera.lookAt(target[0], target[1], target[2]);
    this.camera.updateProjectionMatrix();
    this.camera.updateMatrixWorld();

    this.scene.updateMatrixWorld(true);
    this.gojo.update(t, playing, this.camera, dt, reset);
    this.dancer.update(t, playing, this.camera, dt, reset);
  }

  dispose(): void {
    this.gojo.dispose();
    this.dancer.dispose();
    this.texBW?.dispose();
    this.texLime?.dispose();
    this.texRedSplash?.dispose();
    this.texAmber?.dispose();
    this.texBlue?.dispose();
    this.props.dispose();
  }
}
