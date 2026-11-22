import * as THREE from 'three';
import { VideoProps, VideoFigure, type VideoPoint as P } from './videoProps.ts';
import type { VoiceModel } from '../analysis.ts';
import type { TeleTrack } from '../../show/tele.ts';
import type { CameraView, CharacterId } from '../../scene/scene.ts';
import { bodyPoint } from './profile.ts';

export type StatesideId = 'state-pink' | 'state-zara';

const londonNight = '#0a1c28';
const crimsonRed = '#b8101c';
const hotPink = '#e82678';
const aquaCyan = '#44e6df';
const royalBlue = '#143878';
const skinPink = '#c68d68';
const skinZara = '#e4b798';
const hairPink = '#8c5a38';
const hairZara = '#f2da8c';

function makePlaidTexture(base: string, stripeA: string, stripeB: string): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext('2d');
  if (!ctx) return null;
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 512, 512);
  ctx.fillStyle = stripeA;
  for (let i = 0; i < 512; i += 64) {
    ctx.fillRect(i, 0, 12, 512);
    ctx.fillRect(0, i, 512, 12);
  }
  ctx.fillStyle = stripeB;
  for (let i = 28; i < 512; i += 64) {
    ctx.fillRect(i, 0, 4, 512);
    ctx.fillRect(0, i, 512, 4);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  return tex;
}

function makePolkaTexture(bg: string, dot: string): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext('2d');
  if (!ctx) return null;
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 512, 512);
  ctx.fillStyle = dot;
  for (let y = 32; y < 512; y += 64) {
    for (let x = 32; x < 512; x += 64) {
      ctx.beginPath();
      ctx.arc(x + ((y / 64) % 2) * 24, y, 18, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  return tex;
}

function makeTextBanner(text: string, sub: string, bg: string, fg: string): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 192;
  const ctx = c.getContext('2d');
  if (!ctx) return null;
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 512, 192);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 8;
  ctx.strokeRect(10, 10, 492, 172);
  ctx.fillStyle = fg;
  ctx.font = 'italic bold 72px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(text, 256, 106);
  if (sub) {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText(sub, 256, 158);
  }
  return new THREE.CanvasTexture(c);
}

/**
 * Procedural 3D Y2K pop-art stage for PinkPantheress + Zara Larsson — "Stateside".
 * Recreates the London night "FANCY that" red display window, crimson tartan boutique with gold
 * picture frames and pop-art red lips, overhead spinning floor, Zara's turquoise seashell window,
 * hot-pink & cyan tropical souvenir shop, royal-blue tartan Polaroid frame, floating AIR MAIL
 * postcards, Y2K polka-dot & hibiscus duet backdrops, and synchronized group dancers.
 */
export class StatesideStage {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(38, 16 / 9, 1, 20000);
  readonly props = new VideoProps();

  readonly londonWindowGroup = new THREE.Group();
  readonly redPlaidGroup = new THREE.Group();
  readonly aquaWindowGroup = new THREE.Group();
  readonly tropicalShopGroup = new THREE.Group();
  readonly polaroidGroup = new THREE.Group();
  readonly polkaGroup = new THREE.Group();
  readonly hibiscusGroup = new THREE.Group();

  readonly pink: VideoFigure;
  readonly zara: VideoFigure;
  readonly pinkHat: THREE.Mesh;
  readonly backupDancers: THREE.Group[] = [];
  readonly floatingCards: THREE.Mesh[] = [];
  readonly fillLight: THREE.PointLight;
  readonly rimLight: THREE.PointLight;

  private readonly redPlaidTex: THREE.CanvasTexture | null;
  private readonly bluePlaidTex: THREE.CanvasTexture | null;
  private readonly polkaTex: THREE.CanvasTexture | null;
  private readonly fancyTex: THREE.CanvasTexture | null;
  private readonly airmailTex: THREE.CanvasTexture | null;

  private width = 1280;
  private height = 720;
  private last: number | null = null;
  private epoch = -1;

  constructor(
    readonly pinkModel: VoiceModel,
    readonly pinkTrack: TeleTrack,
    readonly zaraModel: VoiceModel,
    readonly zaraTrack: TeleTrack,
  ) {
    this.scene.background = new THREE.Color(londonNight);

    const amb = new THREE.AmbientLight('#fff0f5', 0.95);
    const key = new THREE.DirectionalLight('#fff8f0', 1.35);
    key.position.set(160, 420, 360);
    this.fillLight = new THREE.PointLight('#ff3b5c', 2.0, 2200);
    this.fillLight.position.set(-220, 260, 240);
    this.rimLight = new THREE.PointLight(aquaCyan, 2.0, 2200);
    this.rimLight.position.set(220, 260, -180);
    this.scene.add(amb, key, this.fillLight, this.rimLight);

    this.redPlaidTex = makePlaidTexture('#a00e18', 'rgba(255,255,255,0.28)', 'rgba(20,5,10,0.4)');
    this.bluePlaidTex = makePlaidTexture(royalBlue, 'rgba(130,210,255,0.3)', 'rgba(10,15,40,0.45)');
    this.polkaTex = makePolkaTexture('#f7f5f2', crimsonRed);
    this.fancyTex = makeTextBanner('FANCY that', 'STATESIDE', '#141e28', '#ff5268');
    this.airmailTex = makeTextBanner('AIR MAIL', 'LONDON -> LA', '#6688dd', '#ffe868');

    // 1. London Night "FANCY that" Red Shopfront Window
    const facade = new THREE.Mesh(
      new THREE.BoxGeometry(1200, 520, 30),
      new THREE.MeshStandardMaterial({ color: '#0d2230', roughness: 0.6 }),
    );
    facade.position.set(0, 260, -280);
    const winBg = new THREE.Mesh(
      new THREE.PlaneGeometry(340, 340),
      new THREE.MeshStandardMaterial({ color: '#c41826', emissive: '#5a0810', emissiveIntensity: 0.45 }),
    );
    winBg.position.set(0, 185, -262);
    const fancySign = new THREE.Mesh(
      new THREE.PlaneGeometry(280, 96),
      new THREE.MeshBasicMaterial({ map: this.fancyTex }),
    );
    fancySign.position.set(0, 415, -260);
    const postbox = new THREE.Mesh(
      new THREE.CylinderGeometry(24, 24, 150, 14),
      new THREE.MeshStandardMaterial({ color: '#a8121c', roughness: 0.4 }),
    );
    postbox.position.set(275, 75, -180);
    this.londonWindowGroup.add(facade, winBg, fancySign, postbox);
    // Street lamps flanking window
    for (const lx of [-250, 250]) {
      const lamp = new THREE.Mesh(
        new THREE.ConeGeometry(24, 34, 8),
        new THREE.MeshBasicMaterial({ color: '#fff3c4' }),
      );
      lamp.position.set(lx, 365, -220);
      this.londonWindowGroup.add(lamp);
    }

    // 2. Crimson Tartan Boutique Room with Gold Frames & Pop-Art Lips
    const rpFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(1800, 1400),
      new THREE.MeshStandardMaterial({ color: crimsonRed, map: this.redPlaidTex, roughness: 0.45 }),
    );
    rpFloor.rotation.x = -Math.PI / 2;
    const rpWall = new THREE.Mesh(
      new THREE.BoxGeometry(1100, 460, 24),
      new THREE.MeshStandardMaterial({ color: crimsonRed, map: this.redPlaidTex, roughness: 0.5 }),
    );
    rpWall.position.set(0, 230, -300);
    this.redPlaidGroup.add(rpFloor, rpWall);
    const goldMat = new THREE.MeshStandardMaterial({ color: '#e6b84c', metalness: 0.65, roughness: 0.25 });
    for (const [fx, fy] of [[-240, 250], [0, 275], [240, 245]]) {
      const frame = new THREE.Mesh(new THREE.BoxGeometry(110, 130, 8), goldMat);
      frame.position.set(fx, fy, -284);
      const inner = new THREE.Mesh(new THREE.BoxGeometry(92, 112, 10), new THREE.MeshStandardMaterial({ color: crimsonRed }));
      inner.position.set(fx, fy, -283);
      this.redPlaidGroup.add(frame, inner);
    }
    const lipMat = new THREE.MeshStandardMaterial({ color: '#ff243c', emissive: '#580814', emissiveIntensity: 0.3 });
    for (const [lx, lz] of [[-150, -60], [150, -40], [0, 80]]) {
      const lip = new THREE.Mesh(new THREE.TorusGeometry(42, 12, 8, 18), lipMat);
      lip.rotation.x = Math.PI / 2;
      lip.scale.set(1.5, 0.7, 1);
      lip.position.set(lx, 6, lz);
      this.redPlaidGroup.add(lip);
    }

    // 3. Zara's Aqua Turquoise Seashell Window
    const aqWall = new THREE.Mesh(
      new THREE.BoxGeometry(1100, 480, 24),
      new THREE.MeshStandardMaterial({ color: '#1c8f9c', emissive: '#104e58', emissiveIntensity: 0.5 }),
    );
    aqWall.position.set(0, 240, -300);
    const aqFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(1800, 1400),
      new THREE.MeshStandardMaterial({ color: '#46c4cc', roughness: 0.4 }),
    );
    aqFloor.rotation.x = -Math.PI / 2;
    this.aquaWindowGroup.add(aqWall, aqFloor);
    const shellMat = new THREE.MeshStandardMaterial({ color: '#f5ece4', roughness: 0.4 });
    for (const sx of [-190, 190]) {
      const shell = new THREE.Mesh(new THREE.SphereGeometry(56, 12, 10), shellMat);
      shell.scale.set(1.2, 0.85, 0.6);
      shell.position.set(sx, 50, -140);
      this.aquaWindowGroup.add(shell);
    }

    // 4. Hot-Pink & Cyan Tropical Souvenir Boutique
    const trFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(1800, 1400),
      new THREE.MeshStandardMaterial({ color: hotPink, roughness: 0.45 }),
    );
    trFloor.rotation.x = -Math.PI / 2;
    const trWall = new THREE.Mesh(
      new THREE.BoxGeometry(1100, 480, 24),
      new THREE.MeshStandardMaterial({ color: '#e63284', emissive: '#6e0d3a', emissiveIntensity: 0.3 }),
    );
    trWall.position.set(0, 240, -300);
    const aquaCounter = new THREE.Mesh(
      new THREE.BoxGeometry(260, 110, 95),
      new THREE.MeshStandardMaterial({ color: '#24b8d8', roughness: 0.35 }),
    );
    aquaCounter.position.set(-195, 55, -140);
    const surfBoard = new THREE.Mesh(
      new THREE.CapsuleGeometry(22, 140, 8, 12),
      new THREE.MeshStandardMaterial({ color: '#ffd166', roughness: 0.3 }),
    );
    surfBoard.position.set(220, 125, -175);
    surfBoard.rotation.z = -0.22;
    this.tropicalShopGroup.add(trFloor, trWall, aquaCounter, surfBoard);

    // 5. Blue Tartan Polaroid Frame & Floating AIR MAIL Postcards
    const bpWall = new THREE.Mesh(
      new THREE.BoxGeometry(1200, 520, 24),
      new THREE.MeshStandardMaterial({ color: royalBlue, map: this.bluePlaidTex, roughness: 0.45 }),
    );
    bpWall.position.set(0, 240, -300);
    const polaroidBorder = new THREE.Mesh(
      new THREE.PlaneGeometry(460, 320),
      new THREE.MeshBasicMaterial({ color: '#f5f2ec', wireframe: true }),
    );
    polaroidBorder.position.set(0, 175, -135);
    this.polaroidGroup.add(bpWall, polaroidBorder);
    const cardMat = new THREE.MeshBasicMaterial({ map: this.airmailTex });
    for (let i = 0; i < 8; i++) {
      const card = new THREE.Mesh(new THREE.PlaneGeometry(92, 62), cardMat);
      card.position.set(((i % 4) - 1.5) * 145, 95 + Math.floor(i / 4) * 145, -180 + (i % 3) * 40);
      card.rotation.z = (i % 2 === 0 ? 1 : -1) * 0.22;
      this.floatingCards.push(card);
      this.polaroidGroup.add(card);
    }

    // 6. Pop-Art Polka-Dot Collage & Y2K Hibiscus Glow Backdrops
    const polkaWall = new THREE.Mesh(
      new THREE.BoxGeometry(1200, 520, 24),
      new THREE.MeshStandardMaterial({ color: '#ffffff', map: this.polkaTex, roughness: 0.5 }),
    );
    polkaWall.position.set(0, 240, -290);
    this.polkaGroup.add(polkaWall);

    const hibWall = new THREE.Mesh(
      new THREE.BoxGeometry(1200, 520, 24),
      new THREE.MeshStandardMaterial({ color: '#ff9638', emissive: '#ff427a', emissiveIntensity: 0.5 }),
    );
    hibWall.position.set(0, 240, -290);
    this.hibiscusGroup.add(hibWall);
    const petalCols = ['#ffe44d', '#44f0ff', '#ff52b8', '#a0ff52'];
    for (let i = 0; i < 12; i++) {
      const flower = new THREE.Mesh(
        new THREE.TorusGeometry(32 + (i % 3) * 10, 10, 6, 5),
        new THREE.MeshBasicMaterial({ color: petalCols[i % petalCols.length] }),
      );
      flower.position.set(((i % 4) - 1.5) * 175, 90 + Math.floor(i / 4) * 120, -265);
      this.hibiscusGroup.add(flower);
    }

    this.scene.add(
      this.londonWindowGroup,
      this.redPlaidGroup,
      this.aquaWindowGroup,
      this.tropicalShopGroup,
      this.polaroidGroup,
      this.polkaGroup,
      this.hibiscusGroup,
    );

    // 1. PinkPantheress physical airway figure
    this.pink = new VideoFigure(pinkModel, pinkTrack, this.props, this.scene, crimsonRed, skinPink);
    this.pink.head.scene.scale.setScalar(2.02);
    this.props.box(this.pink.root, 34, 56, 20, '#ffffff', [0, -34, 3]);
    // Signature tilted white patterned boutique hat!
    this.pinkHat = this.props.oval(this.pink.root, [4, 38, 2], [28, 7, 24], '#f6f4f0');
    this.pinkHat.rotation.z = -0.34;
    this.styleHair(this.pink, hairPink);

    // 2. Zara Larsson physical airway figure
    this.zara = new VideoFigure(zaraModel, zaraTrack, this.props, this.scene, '#64d8f5', skinZara);
    this.zara.head.scene.scale.setScalar(2.02);
    this.props.box(this.zara.root, 34, 56, 20, '#f5e8ff', [0, -34, 3]);
    // Pastel blue Y2K headband
    this.props.mesh(this.zara.root, new THREE.TorusGeometry(18, 3, 6, 18), [0, 34, -2], '#66d8ff').rotation.x = Math.PI / 2;
    this.styleHair(this.zara, hairZara);

    // 4 energetic pop dancers for chorus formations
    for (let i = 0; i < 4; i++) {
      const g = new THREE.Group();
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(14, 16, 86, 10),
        new THREE.MeshStandardMaterial({ color: i % 2 === 0 ? '#22242c' : '#e83e72', roughness: 0.5 }),
      );
      body.position.y = 82;
      const head = new THREE.Mesh(new THREE.SphereGeometry(12, 10, 10), new THREE.MeshStandardMaterial({ color: i % 2 === 0 ? skinPink : skinZara }));
      head.position.y = 148;
      g.add(body, head);
      this.backupDancers.push(g);
      this.scene.add(g);
    }

    this.resize(1280, 720);
    this.frame(0, false, 0, 'state-london', 0);
  }

  private styleHair(f: VideoFigure, color: string) {
    const p = this.props;
    const B = bodyPoint(f.model);
    const k = f.model.tract.scale;
    f.hair.begin();
    for (let row = -8; row <= 8; row++) {
      const z = row * 0.85 * k;
      const a = B(-8, 22);
      const b = B(9, 10);
      p.line(f.hair, [[a.x, a.y + 5 * k, z], [a.x + 5 * k, a.y + 7 * k, z], [b.x, b.y - 11 * k, z]], color, 3.8);
    }
    f.hair.end();
  }

  resize(width: number, height: number): void {
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
    this.camera.aspect = this.width / this.height;
    this.props.resize(this.width, this.height);
    this.pink.head.resize(this.width, this.height);
    this.zara.head.resize(this.width, this.height);
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

    const q = t * (128 / 60) * Math.PI * 2;
    const beat = Math.sin(q);
    const sway = Math.sin(q * 0.5);

    const isLondon = view === 'state-london';
    const isRedPlaid = view === 'state-plaid' || view === 'state-overhead' || view === 'state-pink';
    const isAqua = view === 'state-sweden' || view === 'state-zara';
    const isTropical = view === 'state-tropical' || view === 'state-duet' || view === 'wide';
    const isPolaroid = view === 'state-blue-tartan' || view === 'state-airmail';
    const isPolka = view === 'state-polka';
    const isHibiscus = view === 'state-hibiscus';

    this.londonWindowGroup.visible = isLondon;
    this.redPlaidGroup.visible = isRedPlaid;
    this.aquaWindowGroup.visible = isAqua;
    this.tropicalShopGroup.visible = isTropical;
    this.polaroidGroup.visible = isPolaroid;
    this.polkaGroup.visible = isPolka;
    this.hibiscusGroup.visible = isHibiscus;

    if (isPolaroid) {
      this.floatingCards.forEach((card, idx) => {
        card.position.y = 110 + Math.sin(t * 1.8 + idx) * 28;
        card.rotation.z = Math.sin(t * 1.2 + idx) * 0.3;
      });
    }

    // Scene mood lighting
    if (isLondon) {
      this.scene.background = new THREE.Color(londonNight);
      this.fillLight.color.set('#ff3850');
      this.rimLight.color.set('#ffe4a0');
    } else if (isAqua) {
      this.scene.background = new THREE.Color('#0c3844');
      this.fillLight.color.set(aquaCyan);
      this.rimLight.color.set('#ff72c4');
    } else if (isTropical) {
      this.scene.background = new THREE.Color('#6a1242');
      this.fillLight.color.set(hotPink);
      this.rimLight.color.set(aquaCyan);
    } else if (isPolaroid) {
      this.scene.background = new THREE.Color('#0e1e48');
      this.fillLight.color.set('#66b8ff');
      this.rimLight.color.set('#ff5588');
    } else if (isHibiscus) {
      this.scene.background = new THREE.Color('#ff7242');
      this.fillLight.color.set('#ffe055');
      this.rimLight.color.set(aquaCyan);
    } else {
      this.scene.background = new THREE.Color('#5a0810');
      this.fillLight.color.set('#ff4a5e');
      this.rimLight.color.set('#ffd088');
    }

    // Performer visibility & Y2K choreography
    const soloPink = view === 'state-pink' || view === 'state-london';
    const soloZara = view === 'state-zara' || view === 'state-sweden' || view === 'state-blue-tartan';
    this.pink.root.visible = !soloZara;
    this.zara.root.visible = !soloPink;
    this.pinkHat.visible = isLondon || view === 'state-pink';

    const grooveY = Math.abs(beat) * 5;
    const tightDuet = isPolka || isHibiscus || view === 'state-duet';
    const px = soloPink ? 0 : tightDuet ? -46 : -68 + sway * 16;
    const zx = soloZara ? 0 : tightDuet ? 46 : 68 + sway * 16;

    this.pink.root.position.set(px, 150 + grooveY, -12);
    this.pink.root.rotation.set(0, sway * 0.14, sway * 0.05);
    this.zara.root.position.set(zx, 150 + grooveY * 0.9, -12);
    this.zara.root.rotation.set(0, -sway * 0.14, -sway * 0.05);

    this.backupDancers.forEach((d, idx) => {
      d.visible = isRedPlaid || isTropical;
      const dx = (idx < 2 ? -200 + idx * 72 : 128 + (idx - 2) * 72) + sway * 18;
      d.position.set(dx, Math.abs(beat) * 6, -90 - (idx % 2) * 28);
    });

    const pLift = speaker === 'state-pink' ? 18 : 6;
    const zLift = speaker === 'state-zara' ? 18 : 6;
    this.pink.pose(t, [
      [-32, -8 + Math.sin(q) * 16, 20],
      [-52, 16 + pLift + Math.sin(q) * 18, 26],
      [32, -8 - Math.sin(q) * 16, 20],
      [52, 16 + pLift - Math.sin(q) * 18, 26],
    ]);
    this.zara.pose(t, [
      [-32, -8 - Math.sin(q) * 16, 20],
      [-52, 16 + zLift - Math.sin(q) * 18, 26],
      [32, -8 + Math.sin(q) * 16, 20],
      [52, 16 + zLift + Math.sin(q) * 18, 26],
    ]);

    // Camera framing
    const portrait = this.height > this.width;
    let pos: P = [0, 174, 385];
    let target: P = [0, 158, -50];
    let fov = portrait ? 52 : 38;

    switch (view) {
      case 'state-pink':
        pos = [px + Math.sin(t * 0.7) * 12, 172, 114];
        target = [px, 170, -12];
        fov = portrait ? 40 : 28;
        break;
      case 'state-zara':
        pos = [zx - Math.sin(t * 0.7) * 12, 172, 114];
        target = [zx, 170, -12];
        fov = portrait ? 40 : 28;
        break;
      case 'state-london':
      case 'state-sweden':
        pos = [Math.sin(t * 0.4) * 35, 176, 330];
        target = [0, 165, -120];
        fov = portrait ? 52 : 38;
        break;
      case 'state-overhead':
        pos = [0, 440, 180];
        target = [0, 75, -45];
        fov = portrait ? 58 : 44;
        break;
      case 'state-polka':
      case 'state-hibiscus':
      case 'state-duet':
        pos = [0, 172, 205];
        target = [0, 166, -12];
        fov = portrait ? 46 : 34;
        break;
      case 'state-blue-tartan':
      case 'state-airmail':
        pos = [Math.sin(t * 0.5) * 45, 172, 285];
        target = [0, 165, -90];
        fov = portrait ? 50 : 38;
        break;
      case 'state-plaid':
      case 'state-tropical':
      case 'wide':
      default:
        pos = [Math.sin(t * 0.35) * 65, 178, 395];
        target = [0, 156, -50];
        fov = portrait ? 54 : 40;
        break;
    }

    if (intensity > 0.7) pos[1] += beat * 1.5;

    this.camera.fov = fov;
    this.camera.position.set(pos[0], pos[1], pos[2]);
    this.camera.lookAt(target[0], target[1], target[2]);
    this.camera.updateProjectionMatrix();
    this.camera.updateMatrixWorld();

    this.scene.updateMatrixWorld(true);
    if (this.pink.root.visible) this.pink.update(t, playing, this.camera, dt, reset);
    if (this.zara.root.visible) this.zara.update(t, playing, this.camera, dt, reset);
  }

  dispose(): void {
    this.pink.dispose();
    this.zara.dispose();
    this.redPlaidTex?.dispose();
    this.bluePlaidTex?.dispose();
    this.polkaTex?.dispose();
    this.fancyTex?.dispose();
    this.airmailTex?.dispose();
    this.props.dispose();
  }
}
