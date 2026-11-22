import * as THREE from 'three';
import { VideoProps, VideoFigure, type VideoPoint as P } from './videoProps.ts';
import type { VoiceModel } from '../analysis.ts';
import type { TeleTrack } from '../../show/tele.ts';
import type { CameraView, CharacterId } from '../../scene/scene.ts';
import { bodyPoint } from './profile.ts';

export type DojaGorgeousId = 'dg-lead' | 'dg-echo';

const skinWarm = '#c48668';
const skinCo = '#b47458';
const hotPink = '#d82268';
const champagneGold = '#d6b26a';
const crimsonGloss = '#a81020';
const sapphireBlue = '#1b58d8';
const plumVelvet = '#4a1242';
const noirSilver = '#c8ccd2';

function makeEditorialBackdropTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 256;
  const ctx = c.getContext('2d');
  if (!ctx) return null;
  ctx.fillStyle = '#e6e4de';
  ctx.fillRect(0, 0, 512, 256);
  ctx.fillStyle = '#5c5852';
  ctx.textAlign = 'center';
  ctx.font = '600 18px Georgia, serif';
  ctx.fillText('NEW YORK        LONDON        MILAN        PARIS', 256, 128);
  ctx.strokeStyle = '#c2bcb2';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(64, 146);
  ctx.lineTo(448, 146);
  ctx.stroke();
  ctx.font = 'italic 30px Georgia, serif';
  ctx.fillStyle = '#24201c';
  ctx.fillText('MAISON DE BEAUTÉ', 256, 186);
  return new THREE.CanvasTexture(c);
}

function makeGoldTubeTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d');
  if (!ctx) return null;
  const grad = ctx.createLinearGradient(0, 0, 256, 0);
  grad.addColorStop(0, '#8c6828');
  grad.addColorStop(0.3, '#f2d688');
  grad.addColorStop(0.5, '#c69842');
  grad.addColorStop(0.8, '#fae4a4');
  grad.addColorStop(1, '#7a5820');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);
  // Fluted Art Deco ribs
  ctx.fillStyle = 'rgba(72, 46, 12, 0.25)';
  for (let x = 8; x < 256; x += 16) {
    ctx.fillRect(x, 0, 5, 256);
  }
  ctx.fillStyle = '#3a2208';
  ctx.fillRect(0, 102, 256, 52);
  ctx.fillStyle = '#f8df94';
  ctx.textAlign = 'center';
  ctx.font = 'bold 26px Georgia, serif';
  ctx.fillText('HAUTE · PARIS', 128, 136);
  return new THREE.CanvasTexture(c);
}

function makeBeautyGridTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 384;
  const ctx = c.getContext('2d');
  if (!ctx) return null;
  const tiles = [
    '#52101a', '#dcd8d0', '#124a68',
    '#e4d8cc', '#82141c', '#d8d4ca',
    '#16325e', '#d66c8e', '#9e2612',
  ];
  const tw = 512 / 3;
  const th = 384 / 3;
  for (let i = 0; i < 9; i++) {
    const col = i % 3;
    const row = Math.floor(i / 3);
    ctx.fillStyle = tiles[i];
    ctx.fillRect(col * tw + 4, row * th + 4, tw - 8, th - 8);
    // Stylized silhouette portrait in each editorial square
    ctx.fillStyle = 'rgba(255, 240, 224, 0.22)';
    ctx.beginPath();
    ctx.arc(col * tw + tw / 2, row * th + th * 0.44, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(col * tw + tw * 0.26, row * th + th * 0.68, tw * 0.48, th * 0.26);
  }
  return new THREE.CanvasTexture(c);
}

function makeGiantLipstick(goldTex: THREE.CanvasTexture | null, scale = 1): THREE.Group {
  const g = new THREE.Group();
  const baseMat = goldTex
    ? new THREE.MeshStandardMaterial({ map: goldTex, metalness: 0.72, roughness: 0.24 })
    : new THREE.MeshStandardMaterial({ color: champagneGold, metalness: 0.75, roughness: 0.24 });
  const base = new THREE.Mesh(new THREE.BoxGeometry(34 * scale, 118 * scale, 34 * scale), baseMat);
  base.position.y = 59 * scale;
  const collar = new THREE.Mesh(
    new THREE.CylinderGeometry(13 * scale, 14 * scale, 34 * scale, 16),
    new THREE.MeshStandardMaterial({ color: '#e6c46e', metalness: 0.85, roughness: 0.18 }),
  );
  collar.position.y = 135 * scale;
  const bullet = new THREE.Mesh(
    new THREE.CylinderGeometry(10 * scale, 12 * scale, 48 * scale, 16),
    new THREE.MeshStandardMaterial({ color: crimsonGloss, roughness: 0.16, metalness: 0.25 }),
  );
  bullet.position.y = 172 * scale;
  g.add(base, collar, bullet);
  return g;
}

/**
 * Procedural 3D cinematic stage for Doja Cat — "Gorgeous"
 * Recreates the 1980s luxury cosmetics commercial aesthetic: stark white floating cyclorama,
 * gilded Art Deco lipstick showcase, sapphire-blue crystal perfume pool, liquid-gold & scarlet
 * gloss studio, dark magenta eyeshadow compact stage, silver-gelatin B&W vanity, and 9-panel
 * editorial beauty grid finale.
 */
export class DojaGorgeousStage {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(40, 16 / 9, 1, 20000);
  readonly props = new VideoProps();

  readonly cycloGroup = new THREE.Group();
  readonly goldGroup = new THREE.Group();
  readonly blueGroup = new THREE.Group();
  readonly amberGroup = new THREE.Group();
  readonly plumGroup = new THREE.Group();
  readonly noirGroup = new THREE.Group();
  readonly gridGroup = new THREE.Group();

  readonly lead: VideoFigure;
  readonly echo: VideoFigure;
  readonly halo: THREE.Group = new THREE.Group();
  readonly perfumeBottle: THREE.Group;
  readonly goldLipsticks: THREE.Group[] = [];
  readonly compactLid: THREE.Mesh;
  readonly noirBulbs: THREE.Mesh[] = [];
  readonly keyLight: THREE.DirectionalLight;
  readonly fillLight: THREE.PointLight;
  readonly rimLight: THREE.PointLight;

  private readonly editTex: THREE.CanvasTexture | null;
  private readonly goldTex: THREE.CanvasTexture | null;
  private readonly gridTex: THREE.CanvasTexture | null;
  private haloTex: THREE.CanvasTexture | null = null;
  private width = 1280;
  private height = 720;
  private last: number | null = null;
  private epoch = -1;

  constructor(
    readonly leadModel: VoiceModel,
    readonly leadTrack: TeleTrack,
    readonly echoModel: VoiceModel,
    readonly echoTrack: TeleTrack,
  ) {
    this.scene.background = new THREE.Color('#e4e2dc');

    const amb = new THREE.AmbientLight('#f2eee8', 0.92);
    this.keyLight = new THREE.DirectionalLight('#fffaf0', 1.45);
    this.keyLight.position.set(170, 420, 320);
    this.fillLight = new THREE.PointLight('#ffd8b4', 1.5, 2200);
    this.fillLight.position.set(-220, 220, 190);
    this.rimLight = new THREE.PointLight(champagneGold, 1.4, 2200);
    this.rimLight.position.set(220, 260, -200);
    this.scene.add(amb, this.keyLight, this.fillLight, this.rimLight);

    this.editTex = makeEditorialBackdropTexture();
    this.goldTex = makeGoldTubeTexture();
    this.gridTex = makeBeautyGridTexture();

    // 1. White Seamless Studio Cyclorama
    const cFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(2400, 1800),
      new THREE.MeshStandardMaterial({ color: '#e6e4de', roughness: 0.72 }),
    );
    cFloor.rotation.x = -Math.PI / 2;
    const cWall = new THREE.Mesh(
      new THREE.PlaneGeometry(1800, 620),
      this.editTex
        ? new THREE.MeshBasicMaterial({ map: this.editTex })
        : new THREE.MeshBasicMaterial({ color: '#e6e4de' }),
    );
    cWall.position.set(0, 260, -340);
    this.cycloGroup.add(cFloor, cWall);
    this.scene.add(this.cycloGroup);

    // 2. Champagne Gold Art Deco Cosmetics Showcase
    const gFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(2000, 1400),
      new THREE.MeshStandardMaterial({ color: '#46321a', roughness: 0.35, metalness: 0.45 }),
    );
    gFloor.rotation.x = -Math.PI / 2;
    const gWall = new THREE.Mesh(
      new THREE.PlaneGeometry(1800, 560),
      new THREE.MeshStandardMaterial({ color: '#8a6638', roughness: 0.6 }),
    );
    gWall.position.set(0, 260, -320);
    for (const [lx, lz, sc] of [[-165, -135, 1.05], [165, -135, 1.05], [-92, -210, 0.85], [92, -210, 0.85]]) {
      const lip = makeGiantLipstick(this.goldTex, sc);
      lip.position.set(lx, 0, lz);
      this.goldGroup.add(lip);
      this.goldLipsticks.push(lip);
    }
    this.goldGroup.add(gFloor, gWall);
    this.scene.add(this.goldGroup);

    // 3. Sapphire Blue Reflective Crystal Perfume Pool
    const bPool = new THREE.Mesh(
      new THREE.PlaneGeometry(2200, 1600),
      new THREE.MeshStandardMaterial({ color: '#0c2468', roughness: 0.14, metalness: 0.55 }),
    );
    bPool.rotation.x = -Math.PI / 2;
    this.perfumeBottle = new THREE.Group();
    const glassMat = new THREE.MeshStandardMaterial({
      color: '#7cc4ff',
      transparent: true,
      opacity: 0.52,
      roughness: 0.1,
      metalness: 0.35,
    });
    const flacon = new THREE.Mesh(new THREE.BoxGeometry(118, 128, 72), glassMat);
    flacon.position.y = 74;
    const neck = new THREE.Mesh(
      new THREE.CylinderGeometry(18, 22, 26, 16),
      new THREE.MeshStandardMaterial({ color: '#d8e4f4', metalness: 0.85, roughness: 0.15 }),
    );
    neck.position.y = 150;
    const cap = new THREE.Mesh(new THREE.OctahedronGeometry(26, 0), glassMat);
    cap.position.y = 180;
    this.perfumeBottle.add(flacon, neck, cap);
    this.perfumeBottle.position.set(135, 0, -145);
    this.blueGroup.add(bPool, this.perfumeBottle);
    this.scene.add(this.blueGroup);

    // 4. Liquid-Gold & Scarlet Gloss Studio
    const aFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(2000, 1400),
      new THREE.MeshStandardMaterial({ color: '#580a0e', roughness: 0.22, metalness: 0.35 }),
    );
    aFloor.rotation.x = -Math.PI / 2;
    const aWall = new THREE.Mesh(
      new THREE.PlaneGeometry(1800, 560),
      new THREE.MeshStandardMaterial({ color: '#9c2414', roughness: 0.55 }),
    );
    aWall.position.set(0, 260, -310);
    const goldDisc = new THREE.Mesh(
      new THREE.TorusGeometry(135, 8, 12, 32),
      new THREE.MeshStandardMaterial({ color: '#f4c85c', metalness: 0.88, roughness: 0.18 }),
    );
    goldDisc.position.set(0, 155, -185);
    const glossPool = new THREE.Mesh(
      new THREE.CylinderGeometry(130, 130, 8, 28),
      new THREE.MeshStandardMaterial({ color: crimsonGloss, roughness: 0.1, metalness: 0.2 }),
    );
    glossPool.position.set(0, 4, -65);
    this.amberGroup.add(aFloor, aWall, goldDisc, glossPool);
    this.scene.add(this.amberGroup);

    // 5. Magenta-Plum Eyeshadow Compact Stage
    const pFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(2000, 1400),
      new THREE.MeshStandardMaterial({ color: '#1a061c', roughness: 0.3, metalness: 0.4 }),
    );
    pFloor.rotation.x = -Math.PI / 2;
    const pWall = new THREE.Mesh(
      new THREE.PlaneGeometry(1800, 560),
      new THREE.MeshStandardMaterial({ color: plumVelvet, roughness: 0.68 }),
    );
    pWall.position.set(0, 260, -310);
    // Oversized open quad eyeshadow compact prop
    const compBase = new THREE.Mesh(
      new THREE.BoxGeometry(175, 18, 155),
      new THREE.MeshStandardMaterial({ color: '#1b161c', roughness: 0.28, metalness: 0.65 }),
    );
    compBase.position.set(0, 9, -155);
    const panColors = ['#d84282', '#3298c4', '#e8c456', '#7238a8'];
    for (let i = 0; i < 4; i++) {
      const pan = new THREE.Mesh(
        new THREE.BoxGeometry(62, 6, 56),
        new THREE.MeshStandardMaterial({ color: panColors[i], roughness: 0.4 }),
      );
      pan.position.set(i % 2 === 0 ? -38 : 38, 20, i < 2 ? -190 : -122);
      this.plumGroup.add(pan);
    }
    this.compactLid = new THREE.Mesh(
      new THREE.BoxGeometry(175, 10, 155),
      new THREE.MeshStandardMaterial({ color: '#241c24', roughness: 0.25, metalness: 0.72 }),
    );
    this.compactLid.position.set(0, 86, -230);
    this.compactLid.rotation.x = 1.15;
    this.plumGroup.add(pFloor, pWall, compBase, this.compactLid);
    this.scene.add(this.plumGroup);

    // 6. Silver-Gelatin Monochrome Vanity & Backstage
    const nFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(1800, 1400),
      new THREE.MeshStandardMaterial({ color: '#18181a', roughness: 0.65 }),
    );
    nFloor.rotation.x = -Math.PI / 2;
    const nWall = new THREE.Mesh(
      new THREE.PlaneGeometry(1600, 520),
      new THREE.MeshStandardMaterial({ color: '#2a2a2e', roughness: 0.8 }),
    );
    nWall.position.set(0, 260, -290);
    const vanFrame = new THREE.Mesh(
      new THREE.BoxGeometry(240, 195, 12),
      new THREE.MeshStandardMaterial({ color: '#424248', roughness: 0.4, metalness: 0.6 }),
    );
    vanFrame.position.set(0, 165, -210);
    const bulbMat = new THREE.MeshBasicMaterial({ color: '#f4f6fa' });
    for (let i = 0; i < 8; i++) {
      const bx = i < 4 ? -112 : 112;
      const by = 92 + (i % 4) * 48;
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(8.5, 10, 8), bulbMat);
      bulb.position.set(bx, by, -200);
      this.noirGroup.add(bulb);
      this.noirBulbs.push(bulb);
    }
    this.noirGroup.add(nFloor, nWall, vanFrame);
    this.scene.add(this.noirGroup);

    // 7. 9-Panel Editorial Beauty Grid Showcase
    const grFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(2000, 1400),
      new THREE.MeshStandardMaterial({ color: '#222024', roughness: 0.45 }),
    );
    grFloor.rotation.x = -Math.PI / 2;
    const gridWall = new THREE.Mesh(
      new THREE.PlaneGeometry(540, 380),
      this.gridTex
        ? new THREE.MeshBasicMaterial({ map: this.gridTex })
        : new THREE.MeshBasicMaterial({ color: '#82141c' }),
    );
    gridWall.position.set(0, 195, -260);
    this.gridGroup.add(grFloor, gridWall);
    this.scene.add(this.gridGroup);

    // Two physical female voices: Lead Vocal & Editorial Co-Star / Ad-libs
    this.lead = new VideoFigure(
      leadModel,
      leadTrack,
      this.props,
      this.scene,
      hotPink,
      skinWarm,
    );
    this.lead.head.scene.scale.setScalar(2.12);
    this.echo = new VideoFigure(
      echoModel,
      echoTrack,
      this.props,
      this.scene,
      '#1e4838',
      skinCo,
    );
    this.echo.head.scene.scale.setScalar(2.02);

    this.styleHair(this.lead, '#5c1816');
    this.styleHair(this.echo, '#1c1818');

    // Soft dark studio halo behind the wireframe face so it stays razor-sharp against bright white cyclorama
    if (typeof document !== 'undefined') {
      const hc = document.createElement('canvas');
      hc.width = hc.height = 192;
      const hctx = hc.getContext('2d')!;
      const grad = hctx.createRadialGradient(96, 96, 10, 96, 96, 96);
      grad.addColorStop(0, 'rgba(10, 8, 16, 0.72)');
      grad.addColorStop(0.5, 'rgba(10, 8, 16, 0.42)');
      grad.addColorStop(1, 'rgba(10, 8, 16, 0)');
      hctx.fillStyle = grad;
      hctx.fillRect(0, 0, 192, 192);
      this.haloTex = new THREE.CanvasTexture(hc);
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.haloTex, transparent: true, depthWrite: false }));
      sp.scale.set(118, 118, 1);
      this.halo.add(sp);
    }
    this.scene.add(this.halo);

    this.resize(1280, 720);
  }

  private styleHair(f: VideoFigure, color: string): void {
    const p = this.props;
    const B = bodyPoint(f.model);
    const k = f.model.tract.scale;
    f.hair.begin();
    for (let row = -8; row <= 8; row++) {
      const z = row * 0.85 * k;
      const a = B(-8, 22);
      const b = B(8, 17);
      p.line(f.hair, [[a.x, a.y + 4 * k, z], [a.x + 6 * k, a.y + 8 * k, z], [b.x, b.y - 4 * k, z]], color, 4.0);
    }
    f.hair.end();
  }

  resize(width: number, height: number): void {
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.props.resize(this.width, this.height);
    this.lead.head.resize(this.width, this.height);
    this.echo.head.resize(this.width, this.height);
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

    // 80s synth-pop midtempo groove (~104 BPM)
    const beat = t * (104 / 60) * Math.PI * 2;
    const sway = Math.sin(beat * 0.5);
    const bounce = Math.abs(Math.sin(beat));

    const isCyclo = view === 'dg-cyclo' || view === 'wide';
    const isGold = view === 'dg-gold' || view === 'dg-lead';
    const isBlue = view === 'dg-blue';
    const isAmber = view === 'dg-amber';
    const isPlum = view === 'dg-plum';
    const isNoir = view === 'dg-noir';
    const isGrid = view === 'dg-grid' || view === 'dg-echo';

    this.cycloGroup.visible = isCyclo;
    this.goldGroup.visible = isGold;
    this.blueGroup.visible = isBlue;
    this.amberGroup.visible = isAmber;
    this.plumGroup.visible = isPlum;
    this.noirGroup.visible = isNoir;
    this.gridGroup.visible = isGrid;

    // Animated cosmetics props
    this.perfumeBottle.rotation.y = t * 0.45;
    for (let i = 0; i < this.goldLipsticks.length; i++) {
      this.goldLipsticks[i].rotation.y = t * 0.35 + i * 0.7;
    }
    this.compactLid.rotation.x = 1.1 + Math.sin(t * 0.8) * 0.08;

    // Lighting & palette per set
    if (isCyclo) {
      this.scene.background = new THREE.Color('#e6e4de');
      this.keyLight.color.set('#ffffff');
      this.fillLight.color.set('#fff4ea');
      this.rimLight.color.set('#e8d4dc');
    } else if (isGold) {
      this.scene.background = new THREE.Color('#4c361c');
      this.keyLight.color.set('#ffebc0');
      this.fillLight.color.set(champagneGold);
      this.rimLight.color.set('#fff2cc');
    } else if (isBlue) {
      this.scene.background = new THREE.Color('#081e58');
      this.keyLight.color.set('#a8d6ff');
      this.fillLight.color.set(sapphireBlue);
      this.rimLight.color.set('#ffffff');
    } else if (isAmber) {
      this.scene.background = new THREE.Color('#5c0e0c');
      this.keyLight.color.set('#ffbc78');
      this.fillLight.color.set('#e83820');
      this.rimLight.color.set('#ffe28a');
    } else if (isPlum) {
      this.scene.background = new THREE.Color('#280826');
      this.keyLight.color.set('#f4c4ec');
      this.fillLight.color.set('#962484');
      this.rimLight.color.set('#ffd2f4');
    } else if (isNoir) {
      this.scene.background = new THREE.Color('#141416');
      this.keyLight.color.set('#f2f4f8');
      this.fillLight.color.set(noirSilver);
      this.rimLight.color.set('#ffffff');
    } else {
      this.scene.background = new THREE.Color('#1e1c20');
      this.keyLight.color.set('#fff6ec');
      this.fillLight.color.set('#e8b8c4');
      this.rimLight.color.set(champagneGold);
    }

    // Floating zero-G pose on the opening white cyclorama (<16s); VideoFigure head sits at root.y!
    const floating = isCyclo && t < 16.5;
    const floatY = floating ? 18 + Math.sin(t * 1.4) * 10 : bounce * 3.5;
    const leadSpot: P = isGrid
      ? [-24 + sway * 8, 150 + bounce * 3, -18]
      : [sway * 14, 150 + floatY, -14];
    this.lead.root.position.set(leadSpot[0], leadSpot[1], leadSpot[2]);
    this.lead.root.rotation.z = floating ? Math.sin(t * 0.7) * 0.35 : 0;
    this.lead.root.rotation.y = sway * 0.14;
    this.halo.visible = isCyclo;
    this.halo.position.set(leadSpot[0], leadSpot[1] + 6, leadSpot[2] - 28);

    this.echo.root.visible = isGrid || (isCyclo && t > 20) || isGold;
    if (isGrid) {
      this.echo.root.position.set(38, 148 + bounce * 2.5, -34);
      this.echo.root.rotation.y = -0.22;
    } else {
      this.echo.root.position.set(92, 148 + bounce * 2, -60);
      this.echo.root.rotation.y = -0.28;
    }

    const arms = (phase: number, lift: number): [P, P, P, P] => [
      [-32, -2 + Math.sin(phase) * 14, 24],
      [-48, 22 + lift + Math.sin(phase) * 18, 30],
      [32, -2 - Math.sin(phase) * 14, 24],
      [48, 22 + lift - Math.sin(phase) * 18, 30],
    ];
    this.lead.pose(t, arms(beat, speaker === 'dg-lead' || !speaker ? 22 + bounce * 8 : 10));
    this.echo.pose(t, arms(beat + 0.6, speaker === 'dg-echo' ? 20 : 8));

    // Deterministic hero cameras centered cleanly on the Chimera head (y ≈ 155)
    const portrait = this.height > this.width;
    let pos: [number, number, number] = [Math.sin(t * 0.3) * 42, 162, 185];
    let target: [number, number, number] = [leadSpot[0], leadSpot[1] + 2, leadSpot[2]];
    let fov = portrait ? 50 : 36;

    switch (view) {
      case 'dg-cyclo':
      case 'wide':
        pos = [leadSpot[0] + Math.sin(t * 0.25) * 38, leadSpot[1] + 6, 178];
        target = [leadSpot[0], leadSpot[1] - 4, leadSpot[2]];
        fov = portrait ? 52 : 38;
        break;
      case 'dg-gold':
        pos = [Math.sin(t * 0.3) * 44, 160, 185];
        target = [leadSpot[0], 150, -30];
        fov = portrait ? 50 : 36;
        break;
      case 'dg-blue':
        pos = [Math.sin(t * 0.28) * 46, 158, 185];
        target = [12, 148, -32];
        fov = portrait ? 52 : 38;
        break;
      case 'dg-amber':
        pos = [Math.sin(t * 0.34) * 38, 158, 162];
        target = [leadSpot[0], 152, -20];
        fov = portrait ? 48 : 34;
        break;
      case 'dg-plum':
        pos = [Math.sin(t * 0.26) * 46, 162, 188];
        target = [leadSpot[0], 148, -36];
        fov = portrait ? 52 : 38;
        break;
      case 'dg-noir':
        pos = [leadSpot[0] + Math.sin(t * 0.3) * 22, 160, 118];
        target = [leadSpot[0], 154, leadSpot[2]];
        fov = portrait ? 42 : 30;
        break;
      case 'dg-grid':
        pos = [Math.sin(t * 0.24) * 28, 160, portrait ? 240 : 195];
        target = [0, 150, -30];
        fov = portrait ? 54 : 38;
        break;
      case 'dg-echo':
        pos = [this.echo.root.position.x + Math.sin(t * 0.35) * 10, 158, 92];
        target = [this.echo.root.position.x, 154, this.echo.root.position.z];
        fov = portrait ? 40 : 28;
        break;
      case 'dg-lead':
      default:
        pos = [leadSpot[0] + Math.sin(t * 0.4) * 12, leadSpot[1] + 4, 102];
        target = [leadSpot[0], leadSpot[1] + 2, leadSpot[2]];
        fov = portrait ? 38 : 27;
        break;
    }

    if (intensity > 0.85) pos[1] += Math.sin(beat) * 1.2;

    this.camera.fov = fov;
    this.camera.position.set(pos[0], pos[1], pos[2]);
    this.camera.lookAt(target[0], target[1], target[2]);
    this.camera.updateProjectionMatrix();
    this.camera.updateMatrixWorld();

    this.scene.updateMatrixWorld(true);
    this.lead.update(t, playing, this.camera, dt, reset);
    if (this.echo.root.visible) this.echo.update(t, playing, this.camera, dt, reset);
  }

  dispose(): void {
    this.lead.dispose();
    this.echo.dispose();
    this.editTex?.dispose();
    this.goldTex?.dispose();
    this.gridTex?.dispose();
    this.haloTex?.dispose();
    (this.halo.children[0] as THREE.Sprite | undefined)?.material.dispose();
    this.props.dispose();
  }
}
