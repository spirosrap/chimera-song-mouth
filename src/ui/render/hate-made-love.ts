import * as THREE from 'three';
import { VideoProps, VideoFigure, type VideoPoint as P } from './videoProps.ts';
import type { VoiceModel } from '../analysis.ts';
import type { TeleTrack } from '../../show/tele.ts';
import type { CameraView, CharacterId } from '../../scene/scene.ts';
import { bodyPoint } from './profile.ts';

export type HateMadeLoveId = 'ht-ariana' | 'ht-harmony';

const skinAriana = '#d4a68e';
const hairBrunette = '#2d1c16';
const yellowDress = '#eed24c';
const waitressCream = '#ede4c2';
const carDark = '#222a30';
const neonRed = '#ff364c';
const fireOrange = '#ff7b1c';
const fireGold = '#ffd85c';

function makeTitleCardTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 512;
  const ctx = c.getContext('2d');
  if (!ctx) return null;
  const g = ctx.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0, '#0a2b34');
  g.addColorStop(0.55, '#124652');
  g.addColorStop(1, '#081e24');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 1024, 512);
  ctx.save();
  ctx.translate(512, 240);
  ctx.rotate(-0.14);
  ctx.fillStyle = '#f2dd46';
  ctx.shadowColor = 'rgba(0,0,0,0.65)';
  ctx.shadowBlur = 18;
  ctx.textAlign = 'center';
  ctx.font = 'italic 900 88px Georgia, serif';
  ctx.fillText('“Midnight', 0, -48);
  ctx.fillText('Confession”', 0, 56);
  ctx.restore();
  ctx.fillStyle = '#e8cf46';
  ctx.textAlign = 'center';
  ctx.font = '700 18px sans-serif';
  ctx.fillText('CHIMERA PHYSICAL VOCAL CINEMA', 512, 466);
  return new THREE.CanvasTexture(c);
}

function makeDinerSignTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 256;
  const ctx = c.getContext('2d');
  if (!ctx) return null;
  ctx.fillStyle = '#1e1014';
  ctx.fillRect(0, 0, 512, 256);
  ctx.fillStyle = '#7cd4ff';
  ctx.shadowColor = '#46aaff';
  ctx.shadowBlur = 14;
  ctx.font = 'bold 34px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('DINER', 190, 68);
  ctx.fillStyle = '#ff4458';
  ctx.shadowColor = '#ff223a';
  ctx.shadowBlur = 24;
  ctx.font = 'italic bold 82px Georgia, serif';
  ctx.fillText('Bunny Hop', 256, 178);
  return new THREE.CanvasTexture(c);
}

function makeNotebookTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 160;
  const ctx = c.getContext('2d');
  if (!ctx) return null;
  ctx.fillStyle = '#141618';
  ctx.fillRect(0, 0, 128, 160);
  ctx.fillStyle = '#dfe2e4';
  for (let i = 0; i < 220; i++) {
    ctx.fillRect((i * 37) % 124, (i * 53) % 156, 4, 3);
  }
  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, 18, 160);
  ctx.fillStyle = '#eae8de';
  ctx.fillRect(34, 34, 68, 36);
  ctx.strokeStyle = '#222';
  ctx.lineWidth = 2;
  ctx.strokeRect(34, 34, 68, 36);
  return new THREE.CanvasTexture(c);
}

function makeFlameCluster(count: number, scale = 1): { group: THREE.Group; tongues: THREE.Mesh[] } {
  const group = new THREE.Group();
  const tongues: THREE.Mesh[] = [];
  for (let i = 0; i < count; i++) {
    const h = (48 + (i % 4) * 26) * scale;
    const r = (14 + (i % 3) * 8) * scale;
    const mat = new THREE.MeshBasicMaterial({
      color: i % 2 === 0 ? fireOrange : fireGold,
      transparent: true,
      opacity: 0.82,
    });
    const cone = new THREE.Mesh(new THREE.ConeGeometry(r, h, 7), mat);
    cone.position.set(
      (i - (count - 1) * 0.5) * 24 * scale,
      h * 0.5,
      Math.sin(i * 1.9) * 20 * scale,
    );
    group.add(cone);
    tongues.push(cone);
  }
  return { group, tongues };
}

function makeProxyPerson(outfitColor: string, hairColor: string, skin = '#c2987e', hasGlasses = false): THREE.Group {
  const g = new THREE.Group();
  const torso = new THREE.Mesh(
    new THREE.CylinderGeometry(16, 20, 62, 10),
    new THREE.MeshStandardMaterial({ color: outfitColor, roughness: 0.72 }),
  );
  torso.position.y = 92;
  const skirtOrLegs = new THREE.Mesh(
    new THREE.CylinderGeometry(18, 22, 62, 10),
    new THREE.MeshStandardMaterial({ color: outfitColor, roughness: 0.78 }),
  );
  skirtOrLegs.position.y = 32;
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(14, 12, 10),
    new THREE.MeshStandardMaterial({ color: skin, roughness: 0.6 }),
  );
  head.position.y = 138;
  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(15.2, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.65),
    new THREE.MeshStandardMaterial({ color: hairColor, roughness: 0.7 }),
  );
  hair.position.set(0, 140, -1);
  g.add(torso, skirtOrLegs, head, hair);
  if (hasGlasses) {
    const gMat = new THREE.MeshStandardMaterial({ color: '#1b1412', roughness: 0.3 });
    for (const sx of [-5.5, 5.5]) {
      const rim = new THREE.Mesh(new THREE.TorusGeometry(4.2, 0.9, 6, 12), gMat);
      rim.position.set(sx, 139, 13);
      g.add(rim);
    }
  }
  return g;
}

/**
 * Procedural 3D cinematic stage for Ariana Grande — "hate that i made you love me"
 * Recreates the Hitchcockian yellow title card, moonlit desert grave & gnarled tree with
 * tail-lit vintage sedan, green-lit fluorescent underground bunker, rainy night road &
 * flipped flaming car crash, scattered composition notebooks, mid-century living room
 * fireplace inferno, neon "DINER Bunny Hop" exterior & retro waitress counter with spinning
 * ceiling fan, and amber dawn grave reversal with Ariana holding the shovel at the rim.
 */
export class HateMadeLoveStage {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(40, 16 / 9, 1, 20000);
  readonly props = new VideoProps();

  readonly titleGroup = new THREE.Group();
  readonly graveGroup = new THREE.Group();
  readonly bunkerGroup = new THREE.Group();
  readonly carGroup = new THREE.Group();
  readonly crashGroup = new THREE.Group();
  readonly livingGroup = new THREE.Group();
  readonly dinerGroup = new THREE.Group();
  readonly counterGroup = new THREE.Group();
  readonly dawnGroup = new THREE.Group();

  readonly ariana: VideoFigure;
  readonly harmony: VideoFigure;
  readonly justinProxy: THREE.Group;
  readonly shovelMesh: THREE.Group;
  readonly ceilingFan: THREE.Group;
  readonly crashFlames: THREE.Mesh[];
  readonly livingFlames: THREE.Mesh[];
  readonly neonGlowLight: THREE.PointLight;
  readonly keyLight: THREE.DirectionalLight;
  readonly fillLight: THREE.PointLight;
  readonly rimLight: THREE.PointLight;

  private readonly titleTex: THREE.CanvasTexture | null;
  private readonly dinerTex: THREE.CanvasTexture | null;
  private readonly nbTex: THREE.CanvasTexture | null;
  private width = 1280;
  private height = 720;
  private last: number | null = null;
  private epoch = -1;

  constructor(
    readonly arianaModel: VoiceModel,
    readonly arianaTrack: TeleTrack,
    readonly harmonyModel: VoiceModel,
    readonly harmonyTrack: TeleTrack,
  ) {
    this.scene.background = new THREE.Color('#091b22');

    const amb = new THREE.AmbientLight('#c8d4d8', 0.85);
    this.keyLight = new THREE.DirectionalLight('#fff2da', 1.4);
    this.keyLight.position.set(160, 420, 320);
    this.fillLight = new THREE.PointLight('#2ae0c0', 1.5, 2200);
    this.fillLight.position.set(-220, 220, 180);
    this.rimLight = new THREE.PointLight('#ff8438', 1.5, 2200);
    this.rimLight.position.set(220, 240, -180);
    this.neonGlowLight = new THREE.PointLight(neonRed, 2.2, 1600);
    this.neonGlowLight.position.set(0, 260, -120);
    this.scene.add(amb, this.keyLight, this.fillLight, this.rimLight, this.neonGlowLight);

    // 1. Hitchcockian yellow title card
    this.titleTex = makeTitleCardTexture();
    const titlePlane = new THREE.Mesh(
      new THREE.PlaneGeometry(760, 380),
      this.titleTex
        ? new THREE.MeshBasicMaterial({ map: this.titleTex })
        : new THREE.MeshBasicMaterial({ color: '#0d3640' }),
    );
    titlePlane.position.set(0, 170, -240);
    this.titleGroup.add(titlePlane);
    this.scene.add(this.titleGroup);

    // 2. Moonlit desert grave, dead gnarled tree & tail-lit vintage sedan
    const desertFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(2400, 1800),
      new THREE.MeshStandardMaterial({ color: '#1b272c', roughness: 0.95 }),
    );
    desertFloor.rotation.x = -Math.PI / 2;
    this.graveGroup.add(desertFloor);
    const gravePit = new THREE.Mesh(
      new THREE.BoxGeometry(170, 6, 95),
      new THREE.MeshStandardMaterial({ color: '#060a0c', roughness: 1 }),
    );
    gravePit.position.set(0, 2, -20);
    const dirtMound = new THREE.Mesh(
      new THREE.SphereGeometry(62, 12, 8),
      new THREE.MeshStandardMaterial({ color: '#242c2a', roughness: 0.96 }),
    );
    dirtMound.scale.set(1.6, 0.45, 0.95);
    dirtMound.position.set(105, 16, -35);
    const treeMat = new THREE.MeshStandardMaterial({ color: '#11191d', roughness: 0.95 });
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(10, 20, 240, 8), treeMat);
    trunk.position.set(240, 115, -240);
    trunk.rotation.z = 0.08;
    for (let b = 0; b < 4; b++) {
      const br = new THREE.Mesh(new THREE.CylinderGeometry(3, 8, 120, 6), treeMat);
      br.position.set(240 + (b % 2 === 0 ? -42 : 46), 195 + b * 14, -240 + (b - 1.5) * 14);
      br.rotation.z = b % 2 === 0 ? 0.72 : -0.68;
      this.graveGroup.add(br);
    }
    const sedan = new THREE.Group();
    const sedanBody = new THREE.Mesh(
      new THREE.BoxGeometry(220, 56, 98),
      new THREE.MeshStandardMaterial({ color: carDark, roughness: 0.38, metalness: 0.55 }),
    );
    sedanBody.position.y = 40;
    const sedanCab = new THREE.Mesh(
      new THREE.BoxGeometry(118, 40, 84),
      new THREE.MeshStandardMaterial({ color: '#1b2329', roughness: 0.35, metalness: 0.5 }),
    );
    sedanCab.position.set(-10, 82, 0);
    const tailMat = new THREE.MeshBasicMaterial({ color: '#ff2828' });
    for (const sz of [-34, 34]) {
      const tl = new THREE.Mesh(new THREE.BoxGeometry(8, 12, 18), tailMat);
      tl.position.set(110, 44, sz);
      sedan.add(tl);
    }
    sedan.add(sedanBody, sedanCab);
    sedan.position.set(-220, 0, -210);
    sedan.rotation.y = 0.28;
    this.graveGroup.add(gravePit, dirtMound, trunk, sedan);
    this.scene.add(this.graveGroup);

    // 3. Green-lit underground concrete bunker with fluorescent tubes & composition notebooks
    const bunkerFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(1400, 1100),
      new THREE.MeshStandardMaterial({ color: '#1d3632', roughness: 0.85 }),
    );
    bunkerFloor.rotation.x = -Math.PI / 2;
    const bunkerBack = new THREE.Mesh(
      new THREE.PlaneGeometry(1400, 540),
      new THREE.MeshStandardMaterial({ color: '#24453f', roughness: 0.88 }),
    );
    bunkerBack.position.set(0, 260, -340);
    const tubeMat = new THREE.MeshBasicMaterial({ color: '#a8fff0' });
    for (const tx of [-170, 170]) {
      const tube = new THREE.Mesh(new THREE.BoxGeometry(210, 8, 10), tubeMat);
      tube.position.set(tx, 345, -180);
      this.bunkerGroup.add(tube);
    }
    const boxMat = new THREE.MeshStandardMaterial({ color: '#4c4436', roughness: 0.92 });
    for (let i = 0; i < 10; i++) {
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(52 + (i % 3) * 18, 42 + (i % 2) * 22, 48),
        boxMat,
      );
      box.position.set(-320 + (i % 5) * 145, 22 + Math.floor(i / 5) * 44, -260 + (i % 2) * 45);
      box.rotation.y = (i * 0.37) % 0.7 - 0.35;
      this.bunkerGroup.add(box);
    }
    this.nbTex = makeNotebookTexture();
    const nbMat = this.nbTex
      ? new THREE.MeshStandardMaterial({ map: this.nbTex, roughness: 0.8 })
      : new THREE.MeshStandardMaterial({ color: '#33383b', roughness: 0.85 });
    for (let i = 0; i < 24; i++) {
      const ang = (i / 24) * Math.PI * 2;
      const rad = 75 + (i % 4) * 38;
      const nb = new THREE.Mesh(new THREE.BoxGeometry(24, 3, 30), nbMat);
      nb.position.set(Math.cos(ang) * rad, 2 + (i % 3) * 3, Math.sin(ang) * rad - 40);
      nb.rotation.y = ang * 1.4;
      this.bunkerGroup.add(nb);
    }
    this.bunkerGroup.add(bunkerFloor, bunkerBack);
    this.scene.add(this.bunkerGroup);

    // 4. Rainy night forest road & piercing headlights
    const roadMat = new THREE.MeshStandardMaterial({ color: '#141c20', roughness: 0.35, metalness: 0.2 });
    const road = new THREE.Mesh(new THREE.PlaneGeometry(520, 2200), roadMat);
    road.rotation.x = -Math.PI / 2;
    const stripeMat = new THREE.MeshBasicMaterial({ color: '#9ca4a8' });
    for (let z = -900; z <= 300; z += 130) {
      const stripe = new THREE.Mesh(new THREE.PlaneGeometry(10, 56), stripeMat);
      stripe.rotation.x = -Math.PI / 2;
      stripe.position.set(0, 1.5, z);
      this.carGroup.add(stripe);
    }
    const pineMat = new THREE.MeshStandardMaterial({ color: '#0c1816', roughness: 0.94 });
    for (let i = 0; i < 12; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const pine = new THREE.Mesh(new THREE.ConeGeometry(54, 290, 7), pineMat);
      pine.position.set(side * (260 + (i % 3) * 55), 145, -780 + Math.floor(i / 2) * 185);
      this.carGroup.add(pine);
    }
    const beamMat = new THREE.MeshBasicMaterial({ color: '#d8f4ff', transparent: true, opacity: 0.16 });
    for (const bx of [-58, 58]) {
      const beam = new THREE.Mesh(new THREE.ConeGeometry(75, 420, 10, 1, true), beamMat);
      beam.rotation.x = Math.PI / 2;
      beam.position.set(bx, 55, -240);
      this.carGroup.add(beam);
    }
    this.carGroup.add(road);
    this.scene.add(this.carGroup);

    // 5. Upside-down flaming vintage car crash on midnight road
    const crashRoad = new THREE.Mesh(new THREE.PlaneGeometry(1800, 1800), roadMat);
    crashRoad.rotation.x = -Math.PI / 2;
    const flippedCar = new THREE.Group();
    const fcBody = new THREE.Mesh(
      new THREE.BoxGeometry(260, 58, 114),
      new THREE.MeshStandardMaterial({ color: '#272d32', roughness: 0.45, metalness: 0.6 }),
    );
    fcBody.position.y = 66;
    const fcCab = new THREE.Mesh(
      new THREE.BoxGeometry(132, 38, 96),
      new THREE.MeshStandardMaterial({ color: '#1b2024', roughness: 0.5, metalness: 0.5 }),
    );
    fcCab.position.set(-8, 22, 0);
    const wheelMat = new THREE.MeshStandardMaterial({ color: '#141416', roughness: 0.8 });
    for (const [wx, wz] of [[-86, -54], [-86, 54], [86, -54], [86, 54]]) {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(24, 24, 16, 12), wheelMat);
      w.rotation.x = Math.PI / 2;
      w.position.set(wx, 94, wz);
      flippedCar.add(w);
    }
    flippedCar.add(fcBody, fcCab);
    flippedCar.position.set(80, 4, -220);
    flippedCar.rotation.set(0.08, -0.34, 0.16);
    const cf = makeFlameCluster(10, 1.35);
    cf.group.position.set(70, 62, -210);
    this.crashFlames = cf.tongues;
    this.crashGroup.add(crashRoad, flippedCar, cf.group);
    this.scene.add(this.crashGroup);

    // 6. Mid-century living room with olive-green tiled fireplace & burning sofa
    const woodFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(1400, 1000),
      new THREE.MeshStandardMaterial({ color: '#5a321e', roughness: 0.72 }),
    );
    woodFloor.rotation.x = -Math.PI / 2;
    const rug = new THREE.Mesh(
      new THREE.PlaneGeometry(580, 360),
      new THREE.MeshStandardMaterial({ color: '#782228', roughness: 0.92 }),
    );
    rug.rotation.x = -Math.PI / 2;
    rug.position.set(0, 1.5, -80);
    const woodWall = new THREE.Mesh(
      new THREE.PlaneGeometry(1400, 520),
      new THREE.MeshStandardMaterial({ color: '#5c3c22', roughness: 0.78 }),
    );
    woodWall.position.set(0, 260, -340);
    const fireplace = new THREE.Mesh(
      new THREE.BoxGeometry(220, 260, 68),
      new THREE.MeshStandardMaterial({ color: '#395c38', roughness: 0.55 }),
    );
    fireplace.position.set(-230, 130, -305);
    const hearthHole = new THREE.Mesh(
      new THREE.BoxGeometry(120, 82, 16),
      new THREE.MeshBasicMaterial({ color: '#1a0a04' }),
    );
    hearthHole.position.set(-230, 54, -270);
    const sofaMat = new THREE.MeshStandardMaterial({ color: '#9c7e2c', roughness: 0.85 });
    const sofaSeat = new THREE.Mesh(new THREE.BoxGeometry(220, 42, 86), sofaMat);
    sofaSeat.position.set(145, 36, -190);
    const sofaBack = new THREE.Mesh(new THREE.BoxGeometry(220, 58, 24), sofaMat);
    sofaBack.position.set(145, 76, -222);
    const lampShade = new THREE.Mesh(
      new THREE.CylinderGeometry(24, 28, 72, 12),
      new THREE.MeshBasicMaterial({ color: '#fff0be' }),
    );
    lampShade.position.set(295, 165, -180);
    const lf = makeFlameCluster(8, 1.1);
    lf.group.position.set(130, 56, -180);
    this.livingFlames = lf.tongues;
    this.livingGroup.add(woodFloor, rug, woodWall, fireplace, hearthHole, sofaSeat, sofaBack, lampShade, lf.group);
    this.scene.add(this.livingGroup);

    // 7. Retro crimson neon "DINER Bunny Hop" exterior at dusk
    const duskLot = new THREE.Mesh(
      new THREE.PlaneGeometry(1800, 1400),
      new THREE.MeshStandardMaterial({ color: '#2a2224', roughness: 0.88 }),
    );
    duskLot.rotation.x = -Math.PI / 2;
    const dinerBox = new THREE.Mesh(
      new THREE.BoxGeometry(520, 165, 220),
      new THREE.MeshStandardMaterial({ color: '#d8d4ce', roughness: 0.35, metalness: 0.55 }),
    );
    dinerBox.position.set(0, 84, -290);
    const redStripe = new THREE.Mesh(
      new THREE.BoxGeometry(530, 26, 228),
      new THREE.MeshStandardMaterial({ color: '#9c1e24', roughness: 0.45 }),
    );
    redStripe.position.set(0, 152, -290);
    const winGlow = new THREE.Mesh(
      new THREE.PlaneGeometry(460, 74),
      new THREE.MeshBasicMaterial({ color: '#ffe8b4' }),
    );
    winGlow.position.set(0, 88, -178);
    this.dinerTex = makeDinerSignTexture();
    const neonBoard = new THREE.Mesh(
      new THREE.PlaneGeometry(390, 175),
      this.dinerTex
        ? new THREE.MeshBasicMaterial({ map: this.dinerTex })
        : new THREE.MeshBasicMaterial({ color: neonRed }),
    );
    neonBoard.position.set(0, 258, -240);
    this.dinerGroup.add(duskLot, dinerBox, redStripe, winGlow, neonBoard);
    this.scene.add(this.dinerGroup);

    // 8. Inside Bunny Hop diner: retro counter, red stools, booths & spinning wood ceiling fan
    const dinerFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(1400, 1000),
      new THREE.MeshStandardMaterial({ color: '#7a684a', roughness: 0.65 }),
    );
    dinerFloor.rotation.x = -Math.PI / 2;
    const dinerWall = new THREE.Mesh(
      new THREE.PlaneGeometry(1400, 520),
      new THREE.MeshStandardMaterial({ color: '#8eb2a8', roughness: 0.55 }),
    );
    dinerWall.position.set(0, 260, -340);
    const counterTop = new THREE.Mesh(
      new THREE.BoxGeometry(640, 16, 95),
      new THREE.MeshStandardMaterial({ color: '#e6e2d4', roughness: 0.35, metalness: 0.25 }),
    );
    counterTop.position.set(0, 96, -150);
    const counterBase = new THREE.Mesh(
      new THREE.BoxGeometry(620, 92, 82),
      new THREE.MeshStandardMaterial({ color: '#583d2a', roughness: 0.72 }),
    );
    counterBase.position.set(0, 46, -150);
    const stoolTopMat = new THREE.MeshStandardMaterial({ color: '#9c2026', roughness: 0.45 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: '#d0d6da', roughness: 0.22, metalness: 0.85 });
    for (let s = -2; s <= 2; s++) {
      const seat = new THREE.Mesh(new THREE.CylinderGeometry(20, 20, 10, 14), stoolTopMat);
      seat.position.set(s * 96, 68, -76);
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(4, 6, 68, 8), chromeMat);
      leg.position.set(s * 96, 34, -76);
      this.counterGroup.add(seat, leg);
    }
    // Diner Ariana-clone patrons in booths
    for (const px of [-260, -170, 220]) {
      const patron = makeProxyPerson('#6d5c48', hairBrunette, skinAriana, true);
      patron.position.set(px, 0, -230);
      this.counterGroup.add(patron);
    }
    this.ceilingFan = new THREE.Group();
    const fanHub = new THREE.Mesh(new THREE.CylinderGeometry(16, 16, 18, 10), chromeMat);
    this.ceilingFan.add(fanHub);
    const bladeMat = new THREE.MeshStandardMaterial({ color: '#6b4222', roughness: 0.6 });
    for (let b = 0; b < 4; b++) {
      const blade = new THREE.Mesh(new THREE.BoxGeometry(118, 4, 24), bladeMat);
      blade.position.x = 64;
      const pivot = new THREE.Group();
      pivot.rotation.y = (b * Math.PI) / 2;
      pivot.add(blade);
      this.ceilingFan.add(pivot);
    }
    this.ceilingFan.position.set(0, 330, -110);
    this.counterGroup.add(dinerFloor, dinerWall, counterTop, counterBase, this.ceilingFan);
    this.scene.add(this.counterGroup);

    // 9. Amber desert dawn grave reversal
    const dawnGround = new THREE.Mesh(
      new THREE.PlaneGeometry(2200, 1600),
      new THREE.MeshStandardMaterial({ color: '#4d2b16', roughness: 0.94 }),
    );
    dawnGround.rotation.x = -Math.PI / 2;
    const cliffMat = new THREE.MeshStandardMaterial({ color: '#1b100a', roughness: 0.98 });
    for (const sx of [-230, 230]) {
      const cliff = new THREE.Mesh(new THREE.BoxGeometry(220, 340, 220), cliffMat);
      cliff.position.set(sx, 140, 40);
      cliff.rotation.z = sx < 0 ? -0.14 : 0.14;
      this.dawnGroup.add(cliff);
    }
    this.shovelMesh = new THREE.Group();
    const handle = new THREE.Mesh(
      new THREE.CylinderGeometry(3.2, 3.2, 160, 8),
      new THREE.MeshStandardMaterial({ color: '#7a5232', roughness: 0.8 }),
    );
    handle.position.y = 80;
    const spade = new THREE.Mesh(
      new THREE.BoxGeometry(26, 32, 4),
      new THREE.MeshStandardMaterial({ color: '#586066', roughness: 0.45, metalness: 0.7 }),
    );
    spade.position.y = 14;
    this.shovelMesh.add(handle, spade);
    this.shovelMesh.position.set(58, 0, -25);
    this.dawnGroup.add(dawnGround, this.shovelMesh);
    this.scene.add(this.dawnGroup);

    // Justin Long decorative proxy (grey sweater / charred diner look)
    this.justinProxy = makeProxyPerson('#485258', '#221c18', '#b88c72', false);
    this.justinProxy.position.set(-130, 0, -90);
    this.scene.add(this.justinProxy);

    // Two physical female voices (Ariana lead in buttercup yellow dress + layered harmony in retro waitress cream)
    this.ariana = new VideoFigure(
      arianaModel,
      arianaTrack,
      this.props,
      this.scene,
      yellowDress,
      skinAriana,
    );
    this.ariana.head.scene.scale.setScalar(2.12);
    this.harmony = new VideoFigure(
      harmonyModel,
      harmonyTrack,
      this.props,
      this.scene,
      waitressCream,
      skinAriana,
    );
    this.harmony.head.scene.scale.setScalar(2.02);

    this.styleHair(this.ariana, hairBrunette);
    this.styleHair(this.harmony, hairBrunette);

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
    this.ariana.head.resize(this.width, this.height);
    this.harmony.head.resize(this.width, this.height);
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

    const beat = t * (94 / 60) * Math.PI * 2;
    const sway = Math.sin(beat * 0.25);
    const pulse = Math.abs(Math.sin(beat * 0.5));

    const isTitle = view === 'ht-title';
    const isGrave = view === 'ht-grave';
    const isBunker = view === 'ht-bunker' || view === 'ht-notebooks';
    const isCar = view === 'ht-car';
    const isCrash = view === 'ht-crash' || view === 'wide';
    const isLiving = view === 'ht-living';
    const isDiner = view === 'ht-diner';
    const isCounter = view === 'ht-counter' || view === 'ht-harmony';
    const isDawn = view === 'ht-dawn';

    this.titleGroup.visible = isTitle;
    this.graveGroup.visible = isGrave;
    this.bunkerGroup.visible = isBunker;
    this.carGroup.visible = isCar;
    this.crashGroup.visible = isCrash || view === 'ht-ariana';
    this.livingGroup.visible = isLiving;
    this.dinerGroup.visible = isDiner;
    this.counterGroup.visible = isCounter;
    this.dawnGroup.visible = isDawn;

    // Animate flames & ceiling fan
    for (let i = 0; i < this.crashFlames.length; i++) {
      this.crashFlames[i].scale.y = 0.8 + Math.sin(t * 9.5 + i * 1.3) * 0.32;
    }
    for (let i = 0; i < this.livingFlames.length; i++) {
      this.livingFlames[i].scale.y = 0.78 + Math.cos(t * 8.4 + i * 1.1) * 0.35;
    }
    this.ceilingFan.rotation.y = t * 2.1;

    // Scene lighting palette
    if (isTitle || isGrave) {
      this.scene.background = new THREE.Color('#09202a');
      this.keyLight.color.set('#78b4cc');
      this.fillLight.color.set('#1f5668');
      this.rimLight.color.set('#ff3636');
      this.neonGlowLight.intensity = 0.4;
    } else if (isBunker) {
      this.scene.background = new THREE.Color('#0e2420');
      this.keyLight.color.set('#a8f4e2');
      this.fillLight.color.set('#28b498');
      this.rimLight.color.set('#f2dc64');
      this.neonGlowLight.intensity = 0.2;
    } else if (isCrash || isLiving) {
      this.scene.background = new THREE.Color(isLiving ? '#26140c' : '#101418');
      this.keyLight.color.set('#ffcf8c');
      this.fillLight.color.set('#ff6c1e');
      this.rimLight.color.set('#ffe27a');
      this.neonGlowLight.intensity = 0.9;
    } else if (isDiner || isCounter) {
      this.scene.background = new THREE.Color(isDiner ? '#2e161a' : '#242b28');
      this.keyLight.color.set('#fff2d6');
      this.fillLight.color.set('#7cd2c4');
      this.rimLight.color.set(neonRed);
      this.neonGlowLight.intensity = isDiner ? 2.8 : 1.0;
    } else if (isDawn) {
      this.scene.background = new THREE.Color('#7a4118');
      this.keyLight.color.set('#ffbe66');
      this.fillLight.color.set('#d45a1e');
      this.rimLight.color.set('#ffe094');
      this.neonGlowLight.intensity = 0.3;
    } else {
      this.scene.background = new THREE.Color('#0b181f');
      this.keyLight.color.set('#d8f0ff');
      this.fillLight.color.set('#2a6c82');
      this.rimLight.color.set('#f2dc64');
      this.neonGlowLight.intensity = 0.2;
    }

    // Place Justin proxy according to set
    this.justinProxy.visible = isGrave || isCrash || isLiving || isCounter;
    if (isGrave) {
      this.justinProxy.position.set(10 + Math.sin(t * 2.2) * 16, 0, -45);
      this.justinProxy.rotation.y = Math.sin(t * 1.4) * 0.4;
    } else if (isCrash) {
      this.justinProxy.position.set(-165, 0, -140);
      this.justinProxy.rotation.y = 0.6;
    } else if (isLiving) {
      this.justinProxy.position.set(110, 0, -150);
      this.justinProxy.rotation.y = -0.3 + Math.sin(t * 4) * 0.2;
    } else if (isCounter) {
      this.justinProxy.position.set(115, 0, -52);
      this.justinProxy.rotation.y = -2.4;
    }

    // Place Ariana (lead) and Harmony figure (VideoFigure head sits at root.y = 150!)
    const ariVisible = !isTitle && !isGrave;
    this.ariana.root.visible = ariVisible;
    const ariSpot: P = isDawn
      ? [0, 158, -28]
      : isCounter
      ? [-20, 150, -92]
      : [0, 150, -14];
    this.ariana.root.position.set(ariSpot[0], ariSpot[1], ariSpot[2]);
    this.ariana.root.rotation.y = sway * 0.14;

    const harmVisible = isCounter || isBunker || isCrash || isLiving;
    this.harmony.root.visible = harmVisible;
    const harmSpot: P = isCounter ? [86, 148, -110] : [-98, 148, -68];
    this.harmony.root.position.set(harmSpot[0], harmSpot[1], harmSpot[2]);
    this.harmony.root.rotation.y = -sway * 0.12;

    const arms = (phase: number, lift: number): [P, P, P, P] => [
      [-32, -6 + Math.sin(phase) * 12, 20],
      [-50, 14 + lift + Math.sin(phase) * 18, 26],
      [32, -6 - Math.sin(phase) * 12, 20],
      [50, 14 + lift - Math.sin(phase) * 18, 26],
    ];
    this.ariana.pose(t, arms(beat, speaker === 'ht-ariana' || !speaker ? 18 + pulse * 6 : 6));
    this.harmony.pose(t, arms(beat + 0.8, speaker === 'ht-harmony' ? 16 + pulse * 4 : 5));

    // Deterministic hero cameras centered cleanly on the Chimera head
    const portrait = this.height > this.width;
    let pos: [number, number, number] = [0, 158, 185];
    let target: [number, number, number] = [0, 150, -14];
    let fov = portrait ? 50 : 36;

    switch (view) {
      case 'ht-title':
        pos = [0, 170, 310];
        target = [0, 170, -240];
        fov = portrait ? 60 : 44;
        break;
      case 'ht-grave':
        pos = [Math.sin(t * 0.25) * 45, 138, 230];
        target = [-20, 95, -120];
        fov = portrait ? 56 : 44;
        break;
      case 'ht-bunker':
        pos = [Math.sin(t * 0.35) * 44, 162, 195];
        target = [0, 150, -30];
        fov = portrait ? 52 : 38;
        break;
      case 'ht-notebooks':
        pos = [Math.sin(t * 0.4) * 32, 215, 165];
        target = [0, 136, -24];
        fov = portrait ? 54 : 40;
        break;
      case 'ht-car':
        pos = [Math.sin(t * 0.3) * 28, 158, 175];
        target = [0, 150, -24];
        fov = portrait ? 50 : 36;
        break;
      case 'ht-living':
        pos = [-48 + Math.sin(t * 0.3) * 28, 160, 190];
        target = [8, 148, -42];
        fov = portrait ? 52 : 38;
        break;
      case 'ht-diner':
        pos = [Math.sin(t * 0.22) * 45, 160, 210];
        target = [0, 150, -45];
        fov = portrait ? 54 : 40;
        break;
      case 'ht-counter':
        pos = [Math.sin(t * 0.32) * 40, 160, 118];
        target = [10, 150, -96];
        fov = portrait ? 52 : 38;
        break;
      case 'ht-harmony':
        pos = [98, 156, 22];
        target = [86, 150, -110];
        fov = portrait ? 40 : 28;
        break;
      case 'ht-dawn':
        pos = [Math.sin(t * 0.28) * 28, 136, 152];
        target = [0, 156, -28];
        fov = portrait ? 50 : 36;
        break;
      case 'ht-ariana':
        pos = [Math.sin(t * 0.4) * 14, 156, 102];
        target = [0, 152, -14];
        fov = portrait ? 38 : 27;
        break;
      case 'ht-crash':
      case 'wide':
      default:
        pos = [Math.sin(t * 0.3) * 42, 160, 192];
        target = [6, 150, -32];
        fov = portrait ? 52 : 38;
        break;
    }

    if (intensity > 0.85) pos[1] += Math.sin(beat) * 1.2;

    this.camera.fov = fov;
    this.camera.position.set(pos[0], pos[1], pos[2]);
    this.camera.lookAt(target[0], target[1], target[2]);
    this.camera.updateProjectionMatrix();
    this.camera.updateMatrixWorld();

    this.scene.updateMatrixWorld(true);
    if (this.ariana.root.visible) this.ariana.update(t, playing, this.camera, dt, reset);
    if (this.harmony.root.visible) this.harmony.update(t, playing, this.camera, dt, reset);
  }

  dispose(): void {
    this.ariana.dispose();
    this.harmony.dispose();
    this.titleTex?.dispose();
    this.dinerTex?.dispose();
    this.nbTex?.dispose();
    this.props.dispose();
  }
}
