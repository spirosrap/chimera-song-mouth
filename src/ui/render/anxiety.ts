import * as THREE from 'three';
import { VideoProps, VideoFigure, type VideoPoint as P } from './videoProps.ts';
import type { VoiceModel } from '../analysis.ts';
import type { TeleTrack } from '../../show/tele.ts';
import type { CameraView, CharacterId } from '../../scene/scene.ts';
import { bodyPoint } from './profile.ts';

export type AnxietyId = 'anx-lead' | 'anx-echo';

const skinDoechii = '#6c422c';
const hairDark = '#181312';
const braletteWhite = '#f4f0e8';
const skirtSage = '#6d776a';
const creamWall = '#ded4c2';
const warmWood = '#5c3c24';
const bougainvillea = '#d82274';
const ivyGreen = '#2e6a2e';
const twinBlue = '#92d6e6';
const flameOrange = '#ff7a18';
const flameYellow = '#ffd942';
const skyGold = '#e8c488';

function makeMandalaTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d');
  if (!ctx) return null;
  ctx.fillStyle = '#3a1b2e';
  ctx.fillRect(0, 0, 256, 256);
  const colors = ['#d94a64', '#e8a848', '#4498a8', '#f2d896', '#8a3468'];
  for (let r = 115; r >= 18; r -= 16) {
    ctx.beginPath();
    ctx.arc(128, 128, r, 0, Math.PI * 2);
    ctx.fillStyle = colors[(r / 16) % colors.length | 0];
    ctx.fill();
  }
  ctx.strokeStyle = '#fff2d8';
  ctx.lineWidth = 2;
  for (let a = 0; a < 16; a++) {
    const ang = (a / 16) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(128, 128);
    ctx.lineTo(128 + Math.cos(ang) * 114, 128 + Math.sin(ang) * 114);
    ctx.stroke();
  }
  return new THREE.CanvasTexture(c);
}

function makeGotyeWallTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 256;
  const ctx = c.getContext('2d');
  if (!ctx) return null;
  ctx.fillStyle = '#e8e0cf';
  ctx.fillRect(0, 0, 512, 256);
  const polys: [string, number[][]][] = [
    ['#68a862', [[0, 0], [160, 0], [90, 140]]],
    ['#d87c6a', [[160, 0], [310, 0], [230, 155]]],
    ['#7cb0c4', [[310, 0], [512, 0], [420, 140]]],
    ['#d4b85c', [[0, 140], [140, 256], [0, 256]]],
    ['#c86c7c', [[90, 140], [230, 155], [165, 256]]],
    ['#548e76', [[230, 155], [420, 140], [340, 256]]],
    ['#a688b8', [[420, 140], [512, 120], [512, 256], [340, 256]]],
  ];
  for (const [col, pts] of polys) {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath();
    ctx.fill();
  }
  return new THREE.CanvasTexture(c);
}

function buildDancerProxy(shirtHex: string, pantsHex: string, skinHex: string, hairHex: string): THREE.Group {
  const g = new THREE.Group();
  const torso = new THREE.Mesh(
    new THREE.CylinderGeometry(13, 11, 56, 10),
    new THREE.MeshStandardMaterial({ color: shirtHex, roughness: 0.7 }),
  );
  torso.position.y = 112;
  const legs = new THREE.Mesh(
    new THREE.CylinderGeometry(11, 12, 82, 10),
    new THREE.MeshStandardMaterial({ color: pantsHex, roughness: 0.8 }),
  );
  legs.position.y = 42;
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(12.5, 12, 10),
    new THREE.MeshStandardMaterial({ color: skinHex, roughness: 0.65 }),
  );
  head.position.y = 154;
  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(13.5, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.62),
    new THREE.MeshStandardMaterial({ color: hairHex, roughness: 0.85 }),
  );
  hair.position.set(0, 157, -1);
  g.add(torso, legs, head, hair);
  return g;
}

/**
 * Procedural 3D music-video stage for Doechii — "Anxiety".
 * Recreates the bougainvillea-framed bedroom window with mandala tapestry and pink drawers,
 * backlit mansion hallway, arched-window sunroom with chaise lounge, navy couch flanked by
 * powder-blue twin sisters, flaming kitchen stove, Gotye geometric pastel wall, hearth-lit
 * grand piano parlor, golden-hour suburban lawn with trimmed hedges and a giant walking elephant,
 * sunlit cul-de-sac street with vintage black Mercedes convertible, and overhead crowd finale.
 */
export class AnxietyStage {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(40, 16 / 9, 1, 20000);
  readonly props = new VideoProps();

  readonly windowGroup = new THREE.Group();
  readonly interiorGroup = new THREE.Group();
  readonly twinsGroup = new THREE.Group();
  readonly kitchenGroup = new THREE.Group();
  readonly gotyeGroup = new THREE.Group();
  readonly parlorGroup = new THREE.Group();
  readonly outdoorGroup = new THREE.Group();
  readonly elephantGroup = new THREE.Group();
  readonly streetGroup = new THREE.Group();
  readonly flames: THREE.Mesh[] = [];
  readonly crowd: THREE.Group[] = [];

  readonly lead: VideoFigure;
  readonly echo: VideoFigure;
  readonly keyLight: THREE.DirectionalLight;
  readonly warmFill: THREE.PointLight;
  readonly coolRim: THREE.PointLight;

  private readonly mandalaTex: THREE.CanvasTexture | null;
  private readonly gotyeTex: THREE.CanvasTexture | null;
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
    this.scene.background = new THREE.Color('#2a221c');

    const amb = new THREE.AmbientLight('#f6e8d8', 0.92);
    this.keyLight = new THREE.DirectionalLight('#fff2d6', 1.45);
    this.keyLight.position.set(220, 420, 320);
    this.warmFill = new THREE.PointLight('#ffaa58', 1.7, 2200);
    this.warmFill.position.set(-200, 220, 180);
    this.coolRim = new THREE.PointLight('#a6d8f0', 1.2, 2200);
    this.coolRim.position.set(220, 260, -240);
    this.scene.add(amb, this.keyLight, this.warmFill, this.coolRim);

    // 1. Bougainvillea window & mandala bedroom
    const bedWall = new THREE.Mesh(
      new THREE.BoxGeometry(720, 420, 24),
      new THREE.MeshStandardMaterial({ color: '#e8dec8', roughness: 0.85 }),
    );
    bedWall.position.set(0, 210, -180);
    this.windowGroup.add(bedWall);

    this.mandalaTex = makeMandalaTexture();
    const tapestry = new THREE.Mesh(
      new THREE.PlaneGeometry(210, 210),
      new THREE.MeshStandardMaterial({ map: this.mandalaTex, roughness: 0.9 }),
    );
    tapestry.position.set(0, 215, -166);
    this.windowGroup.add(tapestry);

    const pinkDrawers = new THREE.Mesh(
      new THREE.BoxGeometry(68, 130, 56),
      new THREE.MeshStandardMaterial({ color: '#e0287a', roughness: 0.45 }),
    );
    pinkDrawers.position.set(138, 65, -138);
    this.windowGroup.add(pinkDrawers);

    // White mullioned foreground window frame wrapped in green ivy & magenta bougainvillea
    const frameMat = new THREE.MeshStandardMaterial({ color: '#f6f2ea', roughness: 0.55 });
    for (const [fx, fy, fw, fh] of [
      [-150, 175, 16, 260], [150, 175, 16, 260], [0, 300, 316, 16], [0, 50, 316, 16],
      [0, 175, 8, 250], [-75, 175, 6, 250], [75, 175, 6, 250], [0, 175, 300, 6],
    ] as const) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(fw, fh, 14), frameMat);
      m.position.set(fx, fy, 115);
      this.windowGroup.add(m);
    }
    const ivyMat = new THREE.MeshStandardMaterial({ color: ivyGreen, roughness: 0.9 });
    const flowerMat = new THREE.MeshStandardMaterial({ color: bougainvillea, roughness: 0.7 });
    for (let i = 0; i < 26; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const y = 45 + (i * 11) % 270;
      const x = side * (162 + (i * 7) % 35);
      const bush = new THREE.Mesh(new THREE.SphereGeometry(20 + (i % 3) * 6, 8, 7), ivyMat);
      bush.position.set(x, y, 120);
      this.windowGroup.add(bush);
      if (i % 2 === 0) {
        const fl = new THREE.Mesh(new THREE.SphereGeometry(9, 7, 6), flowerMat);
        fl.position.set(x - side * 8, y + 6, 134);
        this.windowGroup.add(fl);
      }
    }

    // 2. Mansion interior (sunroom arched windows, hallway, chaise lounge)
    const woodFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(1600, 1400),
      new THREE.MeshStandardMaterial({ color: '#8e7a62', roughness: 0.72 }),
    );
    woodFloor.rotation.x = -Math.PI / 2;
    this.interiorGroup.add(woodFloor);

    const backWall = new THREE.Mesh(
      new THREE.BoxGeometry(1100, 440, 24),
      new THREE.MeshStandardMaterial({ color: creamWall, roughness: 0.85 }),
    );
    backWall.position.set(0, 220, -240);
    this.interiorGroup.add(backWall);

    // Three sunlit arched sunroom windows
    const glassMat = new THREE.MeshBasicMaterial({ color: '#fff4d6' });
    for (const wx of [-220, 0, 220]) {
      const pane = new THREE.Mesh(new THREE.PlaneGeometry(105, 195), glassMat);
      pane.position.set(wx, 195, -226);
      const arch = new THREE.Mesh(new THREE.CircleGeometry(52.5, 16, 0, Math.PI), glassMat);
      arch.position.set(wx, 292, -226);
      this.interiorGroup.add(pane, arch);
    }

    // Sculpted wooden chaise lounge
    const chaise = new THREE.Mesh(
      new THREE.BoxGeometry(185, 22, 66),
      new THREE.MeshStandardMaterial({ color: warmWood, roughness: 0.5 }),
    );
    chaise.position.set(0, 48, -60);
    this.interiorGroup.add(chaise);

    // 3. Navy couch & powder-blue twin sisters
    const sofa = new THREE.Mesh(
      new THREE.BoxGeometry(310, 68, 92),
      new THREE.MeshStandardMaterial({ color: '#243c54', roughness: 0.8 }),
    );
    sofa.position.set(0, 46, -42);
    const sofaBack = new THREE.Mesh(
      new THREE.BoxGeometry(310, 66, 22),
      new THREE.MeshStandardMaterial({ color: '#1d3246', roughness: 0.82 }),
    );
    sofaBack.position.set(0, 96, -80);
    this.twinsGroup.add(sofa, sofaBack);
    for (const tx of [-102, 102]) {
      const twin = buildDancerProxy(twinBlue, twinBlue, skinDoechii, hairDark);
      twin.position.set(tx, -28, -32);
      const bow = new THREE.Mesh(
        new THREE.BoxGeometry(16, 8, 8),
        new THREE.MeshStandardMaterial({ color: '#ffffff' }),
      );
      bow.position.set(0, 168, 0);
      twin.add(bow);
      this.twinsGroup.add(twin);
    }

    // 4. Flaming kitchen stove
    const counter = new THREE.Mesh(
      new THREE.BoxGeometry(380, 94, 72),
      new THREE.MeshStandardMaterial({ color: '#7a5234', roughness: 0.6 }),
    );
    counter.position.set(160, 47, -155);
    const stove = new THREE.Mesh(
      new THREE.BoxGeometry(92, 96, 76),
      new THREE.MeshStandardMaterial({ color: '#b8bec4', metalness: 0.55, roughness: 0.35 }),
    );
    stove.position.set(195, 48, -152);
    this.kitchenGroup.add(counter, stove);
    for (let f = 0; f < 6; f++) {
      const cone = new THREE.Mesh(
        new THREE.ConeGeometry(14 + (f % 3) * 4, 48 + (f % 2) * 26, 7),
        new THREE.MeshBasicMaterial({ color: f % 2 === 0 ? flameOrange : flameYellow }),
      );
      cone.position.set(170 + f * 10, 118, -152 + ((f % 2) - 0.5) * 14);
      this.flames.push(cone);
      this.kitchenGroup.add(cone);
    }

    // 5. Gotye geometric pastel wall
    this.gotyeTex = makeGotyeWallTexture();
    const gotyeWall = new THREE.Mesh(
      new THREE.PlaneGeometry(560, 320),
      new THREE.MeshStandardMaterial({ map: this.gotyeTex, roughness: 0.85 }),
    );
    gotyeWall.position.set(0, 180, -165);
    this.gotyeGroup.add(gotyeWall);

    // 6. Dim parlor with grand piano & fireplace hearth
    const pianoBody = new THREE.Mesh(
      new THREE.BoxGeometry(165, 58, 120),
      new THREE.MeshStandardMaterial({ color: '#141418', metalness: 0.35, roughness: 0.2 }),
    );
    pianoBody.position.set(-140, 88, -120);
    const hearth = new THREE.Mesh(
      new THREE.BoxGeometry(120, 110, 48),
      new THREE.MeshStandardMaterial({ color: '#46362c', roughness: 0.85 }),
    );
    hearth.position.set(185, 55, -180);
    const hearthFire = new THREE.Mesh(
      new THREE.ConeGeometry(28, 62, 8),
      new THREE.MeshBasicMaterial({ color: flameOrange }),
    );
    hearthFire.position.set(185, 45, -152);
    this.parlorGroup.add(pianoBody, hearth, hearthFire);

    // 7. Suburban lawn, trimmed hedges & GIANT ELEPHANT!
    const grass = new THREE.Mesh(
      new THREE.PlaneGeometry(2400, 1800),
      new THREE.MeshStandardMaterial({ color: '#4d7a36', roughness: 0.92 }),
    );
    grass.rotation.x = -Math.PI / 2;
    this.outdoorGroup.add(grass);

    const hedgeMat = new THREE.MeshStandardMaterial({ color: '#2b5e24', roughness: 0.92 });
    const hedge = new THREE.Mesh(new THREE.BoxGeometry(1100, 108, 64), hedgeMat);
    hedge.position.set(0, 54, -180);
    this.outdoorGroup.add(hedge);

    // Giant gray elephant walking behind the hedge ("Like an elephant is standing on me")
    const eleMat = new THREE.MeshStandardMaterial({ color: '#565a5e', roughness: 0.88 });
    const eleBody = new THREE.Mesh(new THREE.SphereGeometry(95, 14, 12), eleMat);
    eleBody.scale.set(1.35, 0.95, 0.82);
    eleBody.position.set(0, 175, 0);
    const eleHead = new THREE.Mesh(new THREE.SphereGeometry(62, 12, 10), eleMat);
    eleHead.position.set(112, 198, 0);
    const eleTrunk = new THREE.Mesh(new THREE.CylinderGeometry(16, 9, 105, 10), eleMat);
    eleTrunk.position.set(158, 138, 0);
    eleTrunk.rotation.z = 0.25;
    const eleEarL = new THREE.Mesh(new THREE.SphereGeometry(48, 10, 8), eleMat);
    eleEarL.scale.set(0.3, 1.0, 0.85);
    eleEarL.position.set(84, 205, 56);
    const eleEarR = eleEarL.clone();
    eleEarR.position.z = -56;
    for (const [lx, lz] of [[-58, 36], [-58, -36], [52, 36], [52, -36]] as const) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(20, 22, 120, 10), eleMat);
      leg.position.set(lx, 60, lz);
      this.elephantGroup.add(leg);
    }
    this.elephantGroup.add(eleBody, eleHead, eleTrunk, eleEarL, eleEarR);
    this.elephantGroup.position.set(-40, 0, -290);
    this.outdoorGroup.add(this.elephantGroup);

    // 8. Sunlit cul-de-sac asphalt street, vintage black Mercedes convertible & flash-mob crowd!
    const road = new THREE.Mesh(
      new THREE.PlaneGeometry(2400, 720),
      new THREE.MeshStandardMaterial({ color: '#4c4e52', roughness: 0.88 }),
    );
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 2, 10);
    this.streetGroup.add(road);

    // Black vintage convertible car
    const carMat = new THREE.MeshStandardMaterial({ color: '#14161a', metalness: 0.65, roughness: 0.24 });
    const carBody = new THREE.Mesh(new THREE.BoxGeometry(265, 52, 112), carMat);
    carBody.position.set(-195, 42, -95);
    const windshield = new THREE.Mesh(
      new THREE.PlaneGeometry(102, 34),
      new THREE.MeshStandardMaterial({ color: '#9cc2d8', metalness: 0.5, roughness: 0.15 }),
    );
    windshield.position.set(-148, 80, -95);
    windshield.rotation.y = Math.PI / 2;
    windshield.rotation.x = -0.35;
    this.streetGroup.add(carBody, windshield);

    // Flash-mob street crowd (16 stylized dancers arranged in a semi-circle around Doechii)
    const outfitPalette = ['#e85a36', '#3878c8', '#f0c438', '#4ea862', '#d8488c', '#f4f0e8', '#222228', '#8a58c8'];
    for (let i = 0; i < 16; i++) {
      const ang = (i / 16) * Math.PI * 2;
      const rad = 165 + (i % 3) * 58;
      const d = buildDancerProxy(
        outfitPalette[i % outfitPalette.length],
        i % 2 === 0 ? '#2b3a52' : '#1e1e24',
        i % 3 === 0 ? '#6c422c' : i % 3 === 1 ? '#b88464' : '#e2bea4',
        i % 4 === 0 ? '#a84428' : '#1b1716',
      );
      d.position.set(Math.cos(ang) * rad, 0, Math.sin(ang) * rad - 20);
      d.rotation.y = -ang + Math.PI / 2;
      this.crowd.push(d);
      this.streetGroup.add(d);
    }

    // Suburban trees in distance
    const trunkMat = new THREE.MeshStandardMaterial({ color: '#543c2a', roughness: 0.9 });
    const canopyMat = new THREE.MeshStandardMaterial({ color: '#467a34', roughness: 0.88 });
    for (const [tx, tz] of [[-460, -340], [-180, -390], [220, -380], [490, -330]] as const) {
      const tr = new THREE.Mesh(new THREE.CylinderGeometry(14, 18, 170, 8), trunkMat);
      tr.position.set(tx, 85, tz);
      const lf = new THREE.Mesh(new THREE.SphereGeometry(95, 10, 8), canopyMat);
      lf.position.set(tx, 210, tz);
      this.outdoorGroup.add(tr, lf);
    }

    this.scene.add(
      this.windowGroup,
      this.interiorGroup,
      this.twinsGroup,
      this.kitchenGroup,
      this.gotyeGroup,
      this.parlorGroup,
      this.outdoorGroup,
      this.streetGroup,
    );

    // Physical Mouth Figures
    // 1. Lead Doechii (white bralette, sage wrap skirt, sculpted high bun + braids)
    this.lead = new VideoFigure(leadModel, leadTrack, this.props, this.scene, braletteWhite, skinDoechii);
    this.lead.head.scene.scale.setScalar(2.05);
    this.props.box(this.lead.root, 32, 18, 20, braletteWhite, [0, -18, 2]);
    this.props.box(this.lead.root, 36, 42, 22, skirtSage, [0, -48, 2]);
    this.props.oval(this.lead.root, [0, 30, -4], [11, 10, 10], hairDark);
    this.styleHair(this.lead, hairDark, true);

    // 2. Inner Anxiety / Echo Double (powder-blue twin dress with white bow)
    this.echo = new VideoFigure(echoModel, echoTrack, this.props, this.scene, twinBlue, skinDoechii);
    this.echo.head.scene.scale.setScalar(2.0);
    this.props.box(this.echo.root, 36, 58, 22, twinBlue, [0, -34, 2]);
    this.props.box(this.echo.root, 18, 7, 7, '#ffffff', [0, 28, -2]);
    this.styleHair(this.echo, hairDark, false);

    this.resize(1280, 720);
    this.frame(0, false, 0, 'anx-window', 0);
  }

  private styleHair(f: VideoFigure, color: string, longBraids: boolean): void {
    const p = this.props;
    const B = bodyPoint(f.model);
    const k = f.model.tract.scale;
    f.hair.begin();
    for (let row = -8; row <= 8; row++) {
      const z = row * 0.85 * k;
      const a = B(-8, 22);
      const b = B(8, 17);
      p.line(f.hair, [[a.x, a.y + 4 * k, z], [a.x + 5 * k, a.y + 7 * k, z], [b.x, b.y - 2 * k, z]], color, 3.8);
      if (longBraids && Math.abs(row) >= 5) {
        p.line(f.hair, [[a.x, a.y, z], [a.x - 2 * k, a.y - 16 * k, z], [a.x - 1 * k, a.y - 30 * k, z]], color, 2.8);
      }
    }
    f.hair.end();
  }

  resize(width: number, height: number): void {
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
    this.camera.aspect = this.width / this.height;
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

    const beatPhase = t * (129 / 60) * Math.PI * 2;
    const bounce = Math.abs(Math.sin(beatPhase)) * 5.5;
    const sway = Math.sin(beatPhase * 0.5);

    const isWindow = view === 'anx-window';
    const isTwins = view === 'anx-twins';
    const isKitchen = view === 'anx-kitchen';
    const isGotye = view === 'anx-gotye';
    const isParlor = view === 'anx-parlor';
    const isLawn = view === 'anx-lawn';
    const isStreet = view === 'anx-street' || view === 'anx-overhead';
    const isOutdoor = isLawn || isStreet;

    this.windowGroup.visible = isWindow;
    this.interiorGroup.visible = !isOutdoor && !isWindow;
    this.twinsGroup.visible = isTwins;
    this.kitchenGroup.visible = isKitchen;
    this.gotyeGroup.visible = isGotye;
    this.parlorGroup.visible = isParlor;
    this.outdoorGroup.visible = isOutdoor;
    this.elephantGroup.visible = isLawn;
    this.streetGroup.visible = isStreet;

    // Flickering stove flames
    this.flames.forEach((f, idx) => {
      f.scale.y = 0.8 + Math.abs(Math.sin(t * 14 + idx * 1.7)) * 0.65;
    });

    // Walking giant elephant across the suburban lawn
    this.elephantGroup.position.x = -120 + ((t * 18) % 280);
    this.elephantGroup.position.y = Math.abs(Math.sin(t * 2.4)) * 4;

    // Flash-mob street dancers grooving in sync
    this.crowd.forEach((d, idx) => {
      d.position.y = Math.abs(Math.sin(beatPhase + idx * 0.45)) * 12;
      d.rotation.z = Math.sin(beatPhase * 0.5 + idx) * 0.08;
    });

    if (isOutdoor) {
      this.scene.background = new THREE.Color(skyGold);
      this.keyLight.intensity = 1.85;
      this.warmFill.intensity = 1.2;
    } else if (isParlor) {
      this.scene.background = new THREE.Color('#181312');
      this.keyLight.intensity = 0.72;
      this.warmFill.intensity = 2.1;
    } else if (isWindow) {
      this.scene.background = new THREE.Color('#466838');
      this.keyLight.intensity = 1.35;
      this.warmFill.intensity = 1.4;
    } else {
      this.scene.background = new THREE.Color('#342a22');
      this.keyLight.intensity = 1.45;
      this.warmFill.intensity = 1.65;
    }

    const jitter = intensity > 0.85 ? Math.sin(t * 19) * 1.8 : 0;
    this.lead.root.position.set(sway * 14 + jitter, 148 + bounce, isTwins ? -22 : 0);
    this.lead.root.rotation.set(0, sway * 0.16, sway * 0.04);

    this.echo.root.position.set(isTwins ? 92 : 108 - sway * 10, 146 + bounce * 0.8, isTwins ? -26 : -28);
    this.echo.root.rotation.set(0, -0.18 + sway * 0.12, -sway * 0.04);

    const arms = (phase: number, lift: number): [P, P, P, P] => [
      [-32, -8 + Math.sin(phase) * 16, 20],
      [-50, 14 + lift + Math.sin(phase) * 20, 26],
      [32, -8 - Math.sin(phase) * 16, 20],
      [50, 14 + lift - Math.sin(phase) * 20, 26],
    ];
    this.lead.pose(t, arms(beatPhase, speaker === 'anx-lead' ? 18 : 8));
    this.echo.pose(t, arms(beatPhase + 0.8, speaker === 'anx-echo' ? 18 : 6));

    const portrait = this.height > this.width;
    let pos: P = [Math.sin(t * 0.35) * 65, 174, 375];
    let target: P = [0, 152, -30];
    let fov = portrait ? 52 : 40;

    switch (view) {
      case 'anx-lead':
        pos = [this.lead.root.position.x + Math.sin(t * 0.7) * 10, 168, 110];
        target = [this.lead.root.position.x, 166, this.lead.root.position.z];
        fov = portrait ? 38 : 27;
        break;
      case 'anx-echo':
        pos = [this.echo.root.position.x + 8, 166, 98];
        target = [this.echo.root.position.x, 164, this.echo.root.position.z];
        fov = portrait ? 38 : 27;
        break;
      case 'anx-window':
        pos = [Math.sin(t * 0.25) * 18, 172, 340];
        target = [0, 165, -40];
        fov = portrait ? 50 : 38;
        break;
      case 'anx-hallway':
        pos = [0, 168, 300];
        target = [0, 156, -80];
        fov = portrait ? 48 : 36;
        break;
      case 'anx-sunroom':
        pos = [Math.sin(t * 0.45) * 90, 180, 390];
        target = [0, 154, -60];
        fov = portrait ? 54 : 42;
        break;
      case 'anx-twins':
        pos = [0, 164, 295];
        target = [0, 148, -32];
        fov = portrait ? 50 : 38;
        break;
      case 'anx-kitchen':
        pos = [-65, 172, 325];
        target = [70, 150, -90];
        fov = portrait ? 50 : 38;
        break;
      case 'anx-gotye':
        pos = [Math.sin(t * 0.5) * 38, 168, 250];
        target = [0, 160, -40];
        fov = portrait ? 46 : 34;
        break;
      case 'anx-parlor':
        pos = [55, 168, 320];
        target = [-20, 150, -80];
        fov = portrait ? 50 : 38;
        break;
      case 'anx-lawn':
        pos = [Math.sin(t * 0.35) * 85, 184, 415];
        target = [0, 156, -120];
        fov = portrait ? 54 : 42;
        break;
      case 'anx-street':
        pos = [Math.sin(t * 0.4) * 115, 195, 455];
        target = [0, 148, -20];
        fov = portrait ? 56 : 44;
        break;
      case 'anx-overhead':
        pos = [Math.sin(t * 0.6) * 45, 590, 95];
        target = [0, 120, -10];
        fov = portrait ? 62 : 52;
        break;
      case 'wide':
      default:
        pos = [Math.sin(t * 0.35) * 70, 176, 385];
        target = [0, 152, -30];
        fov = portrait ? 52 : 40;
        break;
    }

    this.camera.fov = fov;
    this.camera.position.set(pos[0], pos[1], pos[2]);
    this.camera.lookAt(target[0], target[1], target[2]);
    this.camera.updateProjectionMatrix();
    this.camera.updateMatrixWorld();

    this.scene.updateMatrixWorld(true);
    this.lead.update(t, playing, this.camera, dt, reset);
    this.echo.update(t, playing, this.camera, dt, reset);
  }

  dispose(): void {
    this.lead.dispose();
    this.echo.dispose();
    this.mandalaTex?.dispose();
    this.gotyeTex?.dispose();
    this.props.dispose();
  }
}
