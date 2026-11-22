import * as THREE from 'three';
import { VideoProps, VideoFigure, type VideoPoint as P } from './videoProps.ts';
import type { VoiceModel } from '../analysis.ts';
import type { TeleTrack } from '../../show/tele.ts';
import type { CameraView, CharacterId } from '../../scene/scene.ts';

export type ElectricBlueId = 'eb-lead' | 'eb-agent';

const skinLead = '#d4a284';
const hairCurly = '#3a2418';
const electricBlue = '#36a8e8';
const burgundySuit = '#681c22';
const pastelPink = '#f2b8c4';
const cherryRed = '#b81d26';
const poolAqua = '#28b4cc';
const neonGreen = '#42ff7a';

function makePlantNeonTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 256;
  const ctx = c.getContext('2d');
  if (!ctx) return null;
  ctx.fillStyle = '#18100a';
  ctx.fillRect(0, 0, 512, 256);
  ctx.fillStyle = neonGreen;
  ctx.shadowColor = '#22e060';
  ctx.shadowBlur = 22;
  ctx.textAlign = 'center';
  ctx.font = 'bold 58px sans-serif';
  ctx.fillText('INDUSTRY', 256, 94);
  ctx.fillText('PLANT', 256, 158);
  ctx.font = 'italic 36px Georgia, serif';
  ctx.fillText('Records', 256, 212);
  return new THREE.CanvasTexture(c);
}

function makeJumpsuitSignTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 192;
  const ctx = c.getContext('2d');
  if (!ctx) return null;
  ctx.fillStyle = '#f2c836';
  ctx.fillRect(0, 0, 512, 192);
  ctx.strokeStyle = '#d46218';
  ctx.lineWidth = 14;
  ctx.strokeRect(10, 10, 492, 172);
  ctx.fillStyle = '#144c8c';
  ctx.textAlign = 'center';
  ctx.font = '900 44px sans-serif';
  ctx.fillText('DISCOUNT JUMPSUITS', 256, 112);
  return new THREE.CanvasTexture(c);
}

function makeIceCreamTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 256;
  const ctx = c.getContext('2d');
  if (!ctx) return null;
  ctx.fillStyle = pastelPink;
  ctx.fillRect(0, 0, 512, 256);
  ctx.fillStyle = '#2a9ac4';
  ctx.font = 'bold 34px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('THE VERY BEST', 256, 48);
  ctx.fillStyle = '#e04258';
  ctx.font = 'italic bold 54px Georgia, serif';
  ctx.fillText('Ice Cream', 256, 128);
  ctx.fillStyle = '#f4b434';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText('POPSICLES · CONES · SHAKES', 256, 214);
  return new THREE.CanvasTexture(c);
}

function makeDogProxy(color: string, scale = 1): THREE.Group {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.85 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(36 * scale, 22 * scale, 18 * scale), mat);
  body.position.y = 22 * scale;
  const head = new THREE.Mesh(new THREE.SphereGeometry(11 * scale, 10, 8), mat);
  head.position.set(20 * scale, 32 * scale, 0);
  g.add(body, head);
  for (const [lx, lz] of [[-12, -6], [-12, 6], [12, -6], [12, 6]]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(3 * scale, 3 * scale, 18 * scale, 6), mat);
    leg.position.set(lx * scale, 9 * scale, lz * scale);
    g.add(leg);
  }
  return g;
}

/**
 * Procedural 3D cinematic stage for Benson Boone — "Mr Electric Blue"
 * Recreates the moody 1970s "INDUSTRY PLANT Records" agent office with green CRT & globe lamps,
 * sunlit hillside lawn-mowing & dog-walking, electric-blue "DISCOUNT JUMPSUITS" sidewalk
 * sign-spinner, pastel pink ice-cream truck, foamy cherry-red muscle car wash, turquoise
 * backyard pool & diving board, and the "3 Years Earlier" backyard trampoline backflip.
 */
export class ElectricBlueStage {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(40, 16 / 9, 1, 20000);
  readonly props = new VideoProps();

  readonly officeGroup = new THREE.Group();
  readonly lawnGroup = new THREE.Group();
  readonly jumpsuitGroup = new THREE.Group();
  readonly truckGroup = new THREE.Group();
  readonly carwashGroup = new THREE.Group();
  readonly poolGroup = new THREE.Group();
  readonly trampolineGroup = new THREE.Group();

  readonly lead: VideoFigure;
  readonly agent: VideoFigure;
  readonly signMesh: THREE.Mesh;
  readonly mowerGroup: THREE.Group;
  readonly dogs: THREE.Group[] = [];
  readonly foamBalls: THREE.Mesh[] = [];
  readonly keyLight: THREE.DirectionalLight;
  readonly fillLight: THREE.PointLight;
  readonly rimLight: THREE.PointLight;

  private readonly plantTex: THREE.CanvasTexture | null;
  private readonly signTex: THREE.CanvasTexture | null;
  private readonly truckTex: THREE.CanvasTexture | null;
  private width = 1280;
  private height = 720;
  private last: number | null = null;
  private epoch = -1;

  constructor(
    readonly leadModel: VoiceModel,
    readonly leadTrack: TeleTrack,
    readonly agentModel: VoiceModel,
    readonly agentTrack: TeleTrack,
  ) {
    this.scene.background = new THREE.Color('#1c1208');

    const amb = new THREE.AmbientLight('#e8e2d6', 0.88);
    this.keyLight = new THREE.DirectionalLight('#fff4de', 1.45);
    this.keyLight.position.set(180, 440, 320);
    this.fillLight = new THREE.PointLight('#ffaa48', 1.5, 2200);
    this.fillLight.position.set(-220, 220, 180);
    this.rimLight = new THREE.PointLight(neonGreen, 1.4, 2200);
    this.rimLight.position.set(220, 260, -200);
    this.scene.add(amb, this.keyLight, this.fillLight, this.rimLight);

    // 1. 1970s "INDUSTRY PLANT Records" Agent Office
    const offFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(1600, 1200),
      new THREE.MeshStandardMaterial({ color: '#382214', roughness: 0.78 }),
    );
    offFloor.rotation.x = -Math.PI / 2;
    const offWall = new THREE.Mesh(
      new THREE.PlaneGeometry(1600, 520),
      new THREE.MeshStandardMaterial({ color: '#2b1a0e', roughness: 0.82 }),
    );
    offWall.position.set(0, 260, -340);
    this.plantTex = makePlantNeonTexture();
    const plantSign = new THREE.Mesh(
      new THREE.PlaneGeometry(250, 125),
      this.plantTex
        ? new THREE.MeshBasicMaterial({ map: this.plantTex })
        : new THREE.MeshBasicMaterial({ color: neonGreen }),
    );
    plantSign.position.set(125, 250, -330);
    const desk = new THREE.Mesh(
      new THREE.BoxGeometry(240, 74, 96),
      new THREE.MeshStandardMaterial({ color: '#522e18', roughness: 0.52 }),
    );
    desk.position.set(125, 37, -140);
    const crt = new THREE.Mesh(
      new THREE.BoxGeometry(52, 46, 46),
      new THREE.MeshStandardMaterial({ color: '#cfc8b6', roughness: 0.55 }),
    );
    crt.position.set(42, 98, -135);
    const crtScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(38, 30),
      new THREE.MeshBasicMaterial({ color: '#38ff72' }),
    );
    crtScreen.position.set(42, 98, -111);
    const globeLamp = new THREE.Mesh(
      new THREE.SphereGeometry(24, 14, 12),
      new THREE.MeshBasicMaterial({ color: '#ffdf88' }),
    );
    globeLamp.position.set(-150, 148, -220);
    const cashBowl = new THREE.Mesh(
      new THREE.SphereGeometry(22, 14, 12),
      new THREE.MeshStandardMaterial({ color: '#a8e2c4', transparent: true, opacity: 0.45, roughness: 0.15 }),
    );
    cashBowl.position.set(190, 96, -125);
    this.officeGroup.add(offFloor, offWall, plantSign, desk, crt, crtScreen, globeLamp, cashBowl);
    this.scene.add(this.officeGroup);

    // 2. Sunlit rolling hillside lawn & dogs
    const hill = new THREE.Mesh(
      new THREE.PlaneGeometry(2400, 1800),
      new THREE.MeshStandardMaterial({ color: '#4f8832', roughness: 0.92 }),
    );
    hill.rotation.x = -Math.PI / 2;
    this.mowerGroup = new THREE.Group();
    const mDeck = new THREE.Mesh(
      new THREE.BoxGeometry(52, 18, 66),
      new THREE.MeshStandardMaterial({ color: '#c42424', roughness: 0.42 }),
    );
    mDeck.position.y = 14;
    const mHandle = new THREE.Mesh(
      new THREE.CylinderGeometry(2.5, 2.5, 96, 6),
      new THREE.MeshStandardMaterial({ color: '#282c30', roughness: 0.6 }),
    );
    mHandle.position.set(0, 56, 42);
    mHandle.rotation.x = 0.65;
    this.mowerGroup.add(mDeck, mHandle);
    this.mowerGroup.position.set(78, 0, -45);
    const dogColors = ['#e8e0d2', '#9c6c3c', '#3c2e26', '#d4b488'];
    for (let i = 0; i < dogColors.length; i++) {
      const dog = makeDogProxy(dogColors[i], 0.95 + (i % 2) * 0.2);
      dog.position.set(-165 + i * 52, 0, -105 + (i % 2) * 34);
      this.lawnGroup.add(dog);
      this.dogs.push(dog);
    }
    this.lawnGroup.add(hill, this.mowerGroup);
    this.scene.add(this.lawnGroup);

    // 3. "DISCOUNT JUMPSUITS" garage & racks
    const asphalt = new THREE.Mesh(
      new THREE.PlaneGeometry(2000, 1400),
      new THREE.MeshStandardMaterial({ color: '#2b3036', roughness: 0.88 }),
    );
    asphalt.rotation.x = -Math.PI / 2;
    const garage = new THREE.Mesh(
      new THREE.BoxGeometry(520, 260, 220),
      new THREE.MeshStandardMaterial({ color: '#1f3652', roughness: 0.72 }),
    );
    garage.position.set(0, 130, -290);
    const gDoor = new THREE.Mesh(
      new THREE.PlaneGeometry(240, 175),
      new THREE.MeshStandardMaterial({ color: '#eceae2', roughness: 0.7 }),
    );
    gDoor.position.set(0, 88, -178);
    // Colorful jumpsuit rack
    const rackColors = [electricBlue, '#e63646', '#f2cc36', '#42d492', '#b842e6'];
    for (let i = 0; i < rackColors.length; i++) {
      const suit = new THREE.Mesh(
        new THREE.BoxGeometry(20, 115, 16),
        new THREE.MeshStandardMaterial({ color: rackColors[i], roughness: 0.35, metalness: 0.35 }),
      );
      suit.position.set(-220 + i * 26, 82, -135);
      this.jumpsuitGroup.add(suit);
    }
    this.signTex = makeJumpsuitSignTexture();
    this.signMesh = new THREE.Mesh(
      new THREE.BoxGeometry(195, 74, 8),
      this.signTex
        ? new THREE.MeshBasicMaterial({ map: this.signTex })
        : new THREE.MeshBasicMaterial({ color: '#f2c836' }),
    );
    this.signMesh.position.set(82, 118, 12);
    this.jumpsuitGroup.add(asphalt, garage, gDoor, this.signMesh);
    this.scene.add(this.jumpsuitGroup);

    // 4. Pastel Pink Ice Cream Truck
    const lot = new THREE.Mesh(
      new THREE.PlaneGeometry(2000, 1400),
      new THREE.MeshStandardMaterial({ color: '#383a3e', roughness: 0.85 }),
    );
    lot.rotation.x = -Math.PI / 2;
    const truckBody = new THREE.Mesh(
      new THREE.BoxGeometry(440, 210, 170),
      new THREE.MeshStandardMaterial({ color: pastelPink, roughness: 0.45 }),
    );
    truckBody.position.set(0, 125, -195);
    this.truckTex = makeIceCreamTexture();
    const truckSide = new THREE.Mesh(
      new THREE.PlaneGeometry(420, 195),
      this.truckTex
        ? new THREE.MeshBasicMaterial({ map: this.truckTex })
        : new THREE.MeshBasicMaterial({ color: pastelPink }),
    );
    truckSide.position.set(0, 125, -109);
    const serveWin = new THREE.Mesh(
      new THREE.PlaneGeometry(115, 86),
      new THREE.MeshBasicMaterial({ color: '#1c2428' }),
    );
    serveWin.position.set(12, 134, -108);
    this.truckGroup.add(lot, truckBody, truckSide, serveWin);
    this.scene.add(this.truckGroup);

    // 5. Foamy Cherry-Red Muscle Car Wash
    const washGround = new THREE.Mesh(
      new THREE.PlaneGeometry(2000, 1400),
      new THREE.MeshStandardMaterial({ color: '#4c4640', roughness: 0.55 }),
    );
    washGround.rotation.x = -Math.PI / 2;
    const muscleCar = new THREE.Mesh(
      new THREE.BoxGeometry(310, 74, 135),
      new THREE.MeshStandardMaterial({ color: cherryRed, roughness: 0.22, metalness: 0.65 }),
    );
    muscleCar.position.set(0, 48, -120);
    const muscleCab = new THREE.Mesh(
      new THREE.BoxGeometry(155, 48, 112),
      new THREE.MeshStandardMaterial({ color: '#8a161c', roughness: 0.25, metalness: 0.6 }),
    );
    muscleCab.position.set(-16, 102, -120);
    const foamMat = new THREE.MeshStandardMaterial({ color: '#f8fbff', roughness: 0.85 });
    for (let i = 0; i < 16; i++) {
      const f = new THREE.Mesh(new THREE.SphereGeometry(18 + (i % 3) * 8, 10, 8), foamMat);
      f.position.set(-120 + i * 16, 86 + (i % 2) * 16, -90 + Math.sin(i) * 35);
      this.carwashGroup.add(f);
      this.foamBalls.push(f);
    }
    this.carwashGroup.add(washGround, muscleCar, muscleCab);
    this.scene.add(this.carwashGroup);

    // 6. Turquoise Backyard Pool & Diving Board
    const deck = new THREE.Mesh(
      new THREE.PlaneGeometry(2200, 1600),
      new THREE.MeshStandardMaterial({ color: '#d8d2c6', roughness: 0.8 }),
    );
    deck.rotation.x = -Math.PI / 2;
    const water = new THREE.Mesh(
      new THREE.PlaneGeometry(760, 460),
      new THREE.MeshStandardMaterial({ color: poolAqua, roughness: 0.18, metalness: 0.25 }),
    );
    water.rotation.x = -Math.PI / 2;
    water.position.set(0, 2, -140);
    const board = new THREE.Mesh(
      new THREE.BoxGeometry(140, 8, 44),
      new THREE.MeshStandardMaterial({ color: '#f2f4f6', roughness: 0.45 }),
    );
    board.position.set(-190, 62, -130);
    const floatRing = new THREE.Mesh(
      new THREE.TorusGeometry(32, 11, 10, 20),
      new THREE.MeshStandardMaterial({ color: '#3a90e8', roughness: 0.35 }),
    );
    floatRing.rotation.x = Math.PI / 2;
    floatRing.position.set(110, 10, -150);
    this.poolGroup.add(deck, water, board, floatRing);
    this.scene.add(this.poolGroup);

    // 7. "3 Years Earlier" Backyard Trampoline & Wooden Fence
    const yard = new THREE.Mesh(
      new THREE.PlaneGeometry(2200, 1600),
      new THREE.MeshStandardMaterial({ color: '#3f762b', roughness: 0.92 }),
    );
    yard.rotation.x = -Math.PI / 2;
    const fence = new THREE.Mesh(
      new THREE.BoxGeometry(1100, 185, 18),
      new THREE.MeshStandardMaterial({ color: '#2d241c', roughness: 0.9 }),
    );
    fence.position.set(0, 92, -260);
    const trampFrame = new THREE.Mesh(
      new THREE.TorusGeometry(130, 8, 10, 28),
      new THREE.MeshStandardMaterial({ color: '#26282c', roughness: 0.5, metalness: 0.5 }),
    );
    trampFrame.rotation.x = Math.PI / 2;
    trampFrame.position.set(0, 56, -40);
    const trampMat = new THREE.Mesh(
      new THREE.CylinderGeometry(124, 124, 6, 28),
      new THREE.MeshStandardMaterial({ color: '#181a1d', roughness: 0.85 }),
    );
    trampMat.position.set(0, 54, -40);
    this.trampolineGroup.add(yard, fence, trampFrame, trampMat);
    this.scene.add(this.trampolineGroup);

    // Two physical male voices: Lead Vocal (electric blue jumpsuit) & Sleazy Agent (burgundy 70s suit)
    this.lead = new VideoFigure(
      leadModel,
      leadTrack,
      this.props,
      this.scene,
      electricBlue,
      skinLead,
    );
    this.agent = new VideoFigure(
      agentModel,
      agentTrack,
      this.props,
      this.scene,
      burgundySuit,
      '#c89678',
    );

    const curlyMat = new THREE.MeshStandardMaterial({ color: hairCurly, roughness: 0.8 });
    const leadHair = new THREE.Mesh(new THREE.SphereGeometry(19, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.58), curlyMat);
    leadHair.position.set(0, 154, -2);
    this.lead.root.add(leadHair);

    const agentHair = new THREE.Mesh(
      new THREE.CylinderGeometry(18, 22, 42, 12),
      new THREE.MeshStandardMaterial({ color: '#261812', roughness: 0.78 }),
    );
    agentHair.position.set(0, 142, -6);
    this.agent.root.add(agentHair);

    this.resize(1280, 720);
  }

  resize(width: number, height: number): void {
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.lead.head.resize(this.width, this.height);
    this.agent.head.resize(this.width, this.height);
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

    const beat = t * (126 / 60) * Math.PI * 2;
    const sway = Math.sin(beat * 0.5);
    const bounce = Math.abs(Math.sin(beat));

    const isOffice = view === 'eb-office' || view === 'eb-agent';
    const isLawn = view === 'eb-lawn';
    const isJumpsuits = view === 'eb-jumpsuits' || view === 'eb-lead' || view === 'wide';
    const isTruck = view === 'eb-truck';
    const isCarwash = view === 'eb-carwash';
    const isPool = view === 'eb-pool';
    const isTrampoline = view === 'eb-trampoline';

    this.officeGroup.visible = isOffice;
    this.lawnGroup.visible = isLawn;
    this.jumpsuitGroup.visible = isJumpsuits;
    this.truckGroup.visible = isTruck;
    this.carwashGroup.visible = isCarwash;
    this.poolGroup.visible = isPool;
    this.trampolineGroup.visible = isTrampoline;

    // Spin the DISCOUNT JUMPSUITS arrow sign & animate dogs/foam/trampoline bounce
    this.signMesh.rotation.z = Math.sin(beat * 0.5) * 0.45;
    for (let i = 0; i < this.dogs.length; i++) {
      this.dogs[i].position.y = Math.abs(Math.sin(beat + i * 0.8)) * 8;
    }
    for (let i = 0; i < this.foamBalls.length; i++) {
      this.foamBalls[i].scale.setScalar(0.9 + Math.sin(t * 4 + i) * 0.14);
    }

    // Lighting per set
    if (isOffice) {
      this.scene.background = new THREE.Color('#140d07');
      this.keyLight.color.set('#ffc97a');
      this.fillLight.color.set('#d87828');
      this.rimLight.color.set(neonGreen);
    } else if (isPool) {
      this.scene.background = new THREE.Color('#42a6dc');
      this.keyLight.color.set('#fffbe8');
      this.fillLight.color.set('#58d8f0');
      this.rimLight.color.set('#ffe498');
    } else if (isTruck) {
      this.scene.background = new THREE.Color('#70b8de');
      this.keyLight.color.set('#fff6e4');
      this.fillLight.color.set(pastelPink);
      this.rimLight.color.set('#ffe09c');
    } else if (isCarwash) {
      this.scene.background = new THREE.Color('#96c2d8');
      this.keyLight.color.set('#fff2cc');
      this.fillLight.color.set('#ff8866');
      this.rimLight.color.set('#ffffff');
    } else {
      this.scene.background = new THREE.Color('#4f9ad0');
      this.keyLight.color.set('#fff8e4');
      this.fillLight.color.set('#78c8f2');
      this.rimLight.color.set('#ffe29c');
    }

    // Position lead & agent
    const jumpY = isTrampoline ? 58 + Math.abs(Math.sin(t * 3.8)) * 75 : isPool ? 64 : 0;
    const leadSpot: P = isOffice
      ? [-115, 0, -90]
      : isTrampoline
      ? [0, jumpY, -40]
      : isPool
      ? [-140, jumpY, -130]
      : isTruck
      ? [12, 0, -70]
      : [sway * 18, bounce * 4, -25];
    this.lead.root.position.set(leadSpot[0], leadSpot[1], leadSpot[2]);
    this.lead.root.rotation.y = isOffice ? 0.55 : sway * 0.18;
    this.lead.root.rotation.x = isTrampoline && Math.sin(t * 3.8) > 0.7 ? (t * 8) % (Math.PI * 2) : 0;

    this.agent.root.visible = isOffice || isTrampoline;
    if (isOffice) {
      this.agent.root.position.set(125, 0, -175);
      this.agent.root.rotation.y = -0.35;
    } else if (isTrampoline) {
      this.agent.root.position.set(95, 42, -280);
      this.agent.root.rotation.y = 0;
    }

    const arms = (phase: number, lift: number): [P, P, P, P] => [
      [-34, -4 + Math.sin(phase) * 14, 22],
      [-52, 18 + lift + Math.sin(phase) * 20, 28],
      [34, -4 - Math.sin(phase) * 14, 22],
      [52, 18 + lift - Math.sin(phase) * 20, 28],
    ];
    this.lead.pose(t, arms(beat, speaker === 'eb-lead' || !speaker ? 22 + bounce * 10 : 8));
    this.agent.pose(t, arms(beat + 0.6, speaker === 'eb-agent' ? 18 : 6));

    // Deterministic cameras
    const portrait = this.height > this.width;
    let pos: [number, number, number] = [Math.sin(t * 0.35) * 55, 152, 240];
    let target: [number, number, number] = [0, 128, -35];
    let fov = portrait ? 54 : 40;

    switch (view) {
      case 'eb-office':
        pos = [Math.sin(t * 0.25) * 45, 148, 175];
        target = [15, 122, -145];
        fov = portrait ? 54 : 42;
        break;
      case 'eb-agent':
        pos = [138 + Math.sin(t * 0.3) * 12, 148, -15];
        target = [125, 142, -175];
        fov = portrait ? 42 : 30;
        break;
      case 'eb-lawn':
        pos = [Math.sin(t * 0.3) * 70, 145, 240];
        target = [-10, 102, -65];
        fov = portrait ? 56 : 42;
        break;
      case 'eb-truck':
        pos = [Math.sin(t * 0.28) * 55, 148, 225];
        target = [0, 128, -150];
        fov = portrait ? 54 : 42;
        break;
      case 'eb-carwash':
        pos = [Math.sin(t * 0.32) * 65, 138, 200];
        target = [0, 112, -95];
        fov = portrait ? 52 : 40;
        break;
      case 'eb-pool':
        pos = [Math.sin(t * 0.28) * 70, 178, 255];
        target = [-20, 115, -135];
        fov = portrait ? 56 : 44;
        break;
      case 'eb-trampoline':
        pos = [Math.sin(t * 0.3) * 60, 165, 250];
        target = [0, 155, -80];
        fov = portrait ? 56 : 42;
        break;
      case 'eb-lead':
        pos = [leadSpot[0] + Math.sin(t * 0.45) * 14, 150 + jumpY * 0.4, 96];
        target = [leadSpot[0], 144 + jumpY * 0.4, leadSpot[2]];
        fov = portrait ? 40 : 28;
        break;
      case 'eb-jumpsuits':
      case 'wide':
      default:
        pos = [Math.sin(t * 0.35) * 62, 152, 245];
        target = [0, 128, -65];
        fov = portrait ? 54 : 40;
        break;
    }

    if (intensity > 0.85) pos[1] += Math.sin(beat) * 1.4;

    this.camera.fov = fov;
    this.camera.position.set(pos[0], pos[1], pos[2]);
    this.camera.lookAt(target[0], target[1], target[2]);
    this.camera.updateProjectionMatrix();
    this.camera.updateMatrixWorld();

    this.scene.updateMatrixWorld(true);
    this.lead.update(t, playing, this.camera, dt, reset);
    if (this.agent.root.visible) this.agent.update(t, playing, this.camera, dt, reset);
  }

  dispose(): void {
    this.lead.dispose();
    this.agent.dispose();
    this.plantTex?.dispose();
    this.signTex?.dispose();
    this.truckTex?.dispose();
    this.props.dispose();
  }
}
