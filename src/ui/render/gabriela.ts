import * as THREE from 'three';
import { VideoProps, VideoFigure, type VideoPoint as P } from './videoProps.ts';
import type { VoiceModel } from '../analysis.ts';
import type { TeleTrack } from '../../show/tele.ts';
import type { CameraView, CharacterId } from '../../scene/scene.ts';
import { bodyPoint } from './profile.ts';

export type GabrielaId = 'gab-lead' | 'gab-daniela' | 'gab-boss';

const crimson = '#c81428';
const deepRed = '#7c0a18';
const woodDark = '#3e1e14';
const peachWall = '#e8ad86';
const midnightBlue = '#143060';
const neonCyan = '#22e2ff';
const neonMagenta = '#ff2aa8';
const neonGreen = '#38ff7a';
const skinA = '#d69d78';
const skinB = '#c48662';
const skinBoss = '#d9a482';
const hairDark = '#1b1312';
const hairCaramel = '#784828';
const blackGown = '#16141a';

function makeCanvasSign(text: string, sub: string, bg: string, fg: string): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 192;
  const ctx = c.getContext('2d');
  if (!ctx) return null;
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 512, 192);
  ctx.fillStyle = fg;
  ctx.font = 'italic bold 78px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(text, 256, 106);
  if (sub) {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText(sub, 256, 162);
  }
  return new THREE.CanvasTexture(c);
}

/**
 * Procedural 3D telenovela stage for KATSEYE — "Gabriela".
 * Recreates the 90s Gabriela corporate skyscraper, mahogany CEO boardroom with Jessica Alba portrait,
 * sunlit and midnight-blue Venetian office blinds, conference-table choreography in crimson dresses,
 * peach telenovela mansion with chandelier and magenta/cyan ballroom lights in black gowns,
 * rose-arch garden wedding crash, 90s "KATFIGHT" talk-show stage with rose petals, and CEO wine outro.
 */
export class GabrielaStage {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(38, 16 / 9, 1, 20000);
  readonly props = new VideoProps();

  readonly towerGroup = new THREE.Group();
  readonly boardroomGroup = new THREE.Group();
  readonly mansionGroup = new THREE.Group();
  readonly weddingGroup = new THREE.Group();
  readonly talkshowGroup = new THREE.Group();
  readonly outroSignGroup = new THREE.Group();
  readonly petalGroup = new THREE.Group();

  readonly blindsGlowMat: THREE.MeshStandardMaterial;
  readonly fillLight: THREE.PointLight;
  readonly rimLight: THREE.PointLight;

  readonly lead: VideoFigure;
  readonly daniela: VideoFigure;
  readonly boss: VideoFigure;
  readonly leadDressMat: THREE.MeshStandardMaterial;
  readonly danielaDressMat: THREE.MeshStandardMaterial;
  readonly backupDancers: THREE.Group[] = [];
  readonly backupDressMats: THREE.MeshStandardMaterial[] = [];

  private width = 1280;
  private height = 720;
  private last: number | null = null;
  private epoch = -1;

  constructor(
    readonly leadModel: VoiceModel,
    readonly leadTrack: TeleTrack,
    readonly danielaModel: VoiceModel,
    readonly danielaTrack: TeleTrack,
    readonly bossModel: VoiceModel,
    readonly bossTrack: TeleTrack,
  ) {
    this.scene.background = new THREE.Color('#1c0c10');

    const amb = new THREE.AmbientLight('#ffe8e0', 0.95);
    const key = new THREE.DirectionalLight('#fff2e6', 1.35);
    key.position.set(160, 420, 360);
    this.fillLight = new THREE.PointLight('#ff4066', 2.0, 2200);
    this.fillLight.position.set(-220, 260, 220);
    this.rimLight = new THREE.PointLight(neonCyan, 1.8, 2200);
    this.rimLight.position.set(220, 260, -180);
    this.scene.add(amb, key, this.fillLight, this.rimLight);

    // 1. Corporate Skyscraper ("Gabriela Enterprises")
    const towerBody = new THREE.Mesh(
      new THREE.BoxGeometry(260, 520, 180),
      new THREE.MeshStandardMaterial({ color: '#ece9e4', roughness: 0.45 }),
    );
    towerBody.position.set(0, 260, -240);
    this.towerGroup.add(towerBody);
    const winMat = new THREE.MeshStandardMaterial({ color: '#2b3e52', metalness: 0.5, roughness: 0.25 });
    for (let r = 0; r < 10; r++) {
      const strip = new THREE.Mesh(new THREE.BoxGeometry(240, 18, 186), winMat);
      strip.position.set(0, 80 + r * 40, -240);
      this.towerGroup.add(strip);
    }
    const logoTex = makeCanvasSign('Gabriela', '', '#f4f0ea', crimson);
    const logoPlane = new THREE.Mesh(new THREE.PlaneGeometry(230, 86), new THREE.MeshBasicMaterial({ map: logoTex }));
    logoPlane.position.set(0, 476, -148);
    this.towerGroup.add(logoPlane);
    const cloudMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 1 });
    for (const [cx, cy, cz] of [[-280, 420, -420], [260, 380, -390], [-140, 520, -450], [340, 480, -460]]) {
      const cl = new THREE.Mesh(new THREE.SphereGeometry(62, 12, 10), cloudMat);
      cl.scale.set(1.8, 0.7, 0.9);
      cl.position.set(cx, cy, cz);
      this.towerGroup.add(cl);
    }

    // 2. Mahogany CEO Boardroom + Venetian Blinds
    const bFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(1800, 1400),
      new THREE.MeshStandardMaterial({ color: '#5c463c', roughness: 0.5 }),
    );
    bFloor.rotation.x = -Math.PI / 2;
    this.boardroomGroup.add(bFloor);

    const bWall = new THREE.Mesh(
      new THREE.BoxGeometry(1100, 480, 24),
      new THREE.MeshStandardMaterial({ color: woodDark, roughness: 0.45 }),
    );
    bWall.position.set(0, 240, -320);
    this.boardroomGroup.add(bWall);

    // Venetian blinds window (glow shifts white daylight -> midnight blue!)
    this.blindsGlowMat = new THREE.MeshStandardMaterial({
      color: '#e8f2ff',
      emissive: '#cce4ff',
      emissiveIntensity: 0.9,
    });
    const blindBack = new THREE.Mesh(new THREE.PlaneGeometry(520, 320), this.blindsGlowMat);
    blindBack.position.set(0, 230, -304);
    this.boardroomGroup.add(blindBack);
    const slatMat = new THREE.MeshStandardMaterial({ color: '#d8dee6', roughness: 0.4 });
    for (let s = 0; s < 16; s++) {
      const slat = new THREE.Mesh(new THREE.BoxGeometry(520, 5, 8), slatMat);
      slat.position.set(0, 90 + s * 18, -298);
      this.boardroomGroup.add(slat);
    }

    // Twin chrome CEO uplight pillars + mahogany conference table
    const pillarMat = new THREE.MeshStandardMaterial({ color: '#c4c8d0', metalness: 0.75, roughness: 0.2 });
    const lampMat = new THREE.MeshStandardMaterial({ color: '#fff5e0', emissive: '#ffdfaa', emissiveIntensity: 1.0 });
    for (const px of [-260, 260]) {
      const pil = new THREE.Mesh(new THREE.CylinderGeometry(10, 12, 260, 12), pillarMat);
      pil.position.set(px, 130, -260);
      const shade = new THREE.Mesh(new THREE.ConeGeometry(34, 24, 16), lampMat);
      shade.rotation.x = Math.PI;
      shade.position.set(px, 268, -260);
      this.boardroomGroup.add(pil, shade);
    }
    const tableTop = new THREE.Mesh(
      new THREE.BoxGeometry(520, 16, 170),
      new THREE.MeshStandardMaterial({ color: '#4c2418', roughness: 0.22, metalness: 0.15 }),
    );
    tableTop.position.set(0, 86, 20);
    this.boardroomGroup.add(tableTop);
    // 90s boxy CRT monitor + red wine glass on CEO desk
    const crt = new THREE.Mesh(new THREE.BoxGeometry(52, 46, 48), new THREE.MeshStandardMaterial({ color: '#383c3e' }));
    crt.position.set(-145, 117, 25);
    const wine = new THREE.Mesh(new THREE.CylinderGeometry(5, 3, 18, 10), new THREE.MeshStandardMaterial({ color: crimson }));
    wine.position.set(45, 104, 40);
    this.boardroomGroup.add(crt, wine);

    // 3. Peach Telenovela Mansion & Ballroom
    const mFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(1800, 1400),
      new THREE.MeshStandardMaterial({ color: '#a82252', roughness: 0.45 }),
    );
    mFloor.rotation.x = -Math.PI / 2;
    this.mansionGroup.add(mFloor);
    const mWall = new THREE.Mesh(
      new THREE.BoxGeometry(1100, 480, 24),
      new THREE.MeshStandardMaterial({ color: peachWall, roughness: 0.6 }),
    );
    mWall.position.set(0, 240, -320);
    this.mansionGroup.add(mWall);
    const winBlueMat = new THREE.MeshStandardMaterial({ color: '#6ecbff', emissive: '#3896ff', emissiveIntensity: 0.7 });
    for (const wx of [-260, 260]) {
      const win = new THREE.Mesh(new THREE.PlaneGeometry(140, 280), winBlueMat);
      win.position.set(wx, 230, -304);
      this.mansionGroup.add(win);
    }
    // Crystal chandelier
    const chandMat = new THREE.MeshStandardMaterial({ color: '#fff8d8', emissive: '#ffe499', emissiveIntensity: 0.9 });
    const chand = new THREE.Mesh(new THREE.TorusGeometry(62, 7, 10, 24), chandMat);
    chand.rotation.x = Math.PI / 2;
    chand.position.set(0, 385, -80);
    this.mansionGroup.add(chand);

    // 4. Sunlit Rose-Arch Garden Wedding
    const lawn = new THREE.Mesh(
      new THREE.PlaneGeometry(1800, 1400),
      new THREE.MeshStandardMaterial({ color: '#448238', roughness: 0.85 }),
    );
    lawn.rotation.x = -Math.PI / 2;
    this.weddingGroup.add(lawn);
    const hedge = new THREE.Mesh(
      new THREE.BoxGeometry(1100, 260, 40),
      new THREE.MeshStandardMaterial({ color: '#285e24', roughness: 0.9 }),
    );
    hedge.position.set(0, 130, -290);
    this.weddingGroup.add(hedge);
    const arch = new THREE.Mesh(
      new THREE.TorusGeometry(135, 22, 10, 24, Math.PI),
      new THREE.MeshStandardMaterial({ color: '#1e6e28', roughness: 0.8 }),
    );
    arch.position.set(0, 120, -180);
    this.weddingGroup.add(arch);
    const roseMat = new THREE.MeshStandardMaterial({ color: crimson, emissive: '#660814', emissiveIntensity: 0.3 });
    for (let i = 0; i <= 10; i++) {
      const ang = (i / 10) * Math.PI;
      const rose = new THREE.Mesh(new THREE.SphereGeometry(13, 10, 10), roseMat);
      rose.position.set(Math.cos(ang) * 135, 120 + Math.sin(ang) * 135, -162);
      this.weddingGroup.add(rose);
    }
    // White luxury SUV nose crashing into the wedding
    const suv = new THREE.Mesh(
      new THREE.BoxGeometry(150, 96, 220),
      new THREE.MeshStandardMaterial({ color: '#f6f6f8', roughness: 0.2, metalness: 0.25 }),
    );
    suv.position.set(-220, 56, -70);
    suv.rotation.y = 0.42;
    this.weddingGroup.add(suv);

    // 5. 90s "KATFIGHT" Talk-Show Stage
    const tFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(1800, 1400),
      new THREE.MeshStandardMaterial({ color: '#9c121e', roughness: 0.4 }),
    );
    tFloor.rotation.x = -Math.PI / 2;
    this.talkshowGroup.add(tFloor);
    const brickWall = new THREE.Mesh(
      new THREE.BoxGeometry(1100, 480, 24),
      new THREE.MeshStandardMaterial({ color: '#6b2824', roughness: 0.85 }),
    );
    brickWall.position.set(0, 240, -310);
    this.talkshowGroup.add(brickWall);
    const screenBack = new THREE.Mesh(
      new THREE.PlaneGeometry(420, 260),
      new THREE.MeshStandardMaterial({ color: '#b4f4ff', emissive: '#78d8ff', emissiveIntensity: 0.75 }),
    );
    screenBack.position.set(0, 220, -294);
    this.talkshowGroup.add(screenBack);
    const tubeMat = new THREE.MeshBasicMaterial({ color: neonGreen });
    for (const tx of [-280, 280]) {
      const tube = new THREE.Mesh(new THREE.CylinderGeometry(6, 6, 280, 10), tubeMat);
      tube.position.set(tx, 170, -240);
      this.talkshowGroup.add(tube);
    }
    const chyronTex = makeCanvasSign('KATFIGHT', 'SPAGHETTI AND TEARS!', '#9c1220', '#ffe45e');
    const chyron = new THREE.Mesh(new THREE.PlaneGeometry(320, 80), new THREE.MeshBasicMaterial({ map: chyronTex }));
    chyron.position.set(0, 52, -160);
    this.talkshowGroup.add(chyron);

    // Floating red rose petals (climax & crowd shower)
    for (let i = 0; i < 28; i++) {
      const petal = new THREE.Mesh(new THREE.CircleGeometry(7 + (i % 4) * 2, 7), roseMat);
      petal.position.set(((i * 73) % 520) - 260, 60 + ((i * 59) % 260), ((i * 41) % 300) - 150);
      this.petalGroup.add(petal);
    }

    // Neon red "Gabriela" outro title card
    const neonTex = makeCanvasSign('Gabriela', '', '#050204', '#ff2442');
    const neonCard = new THREE.Mesh(new THREE.PlaneGeometry(360, 140), new THREE.MeshBasicMaterial({ map: neonTex }));
    neonCard.position.set(0, 175, -180);
    this.outroSignGroup.add(neonCard);

    this.scene.add(
      this.towerGroup,
      this.boardroomGroup,
      this.mansionGroup,
      this.weddingGroup,
      this.talkshowGroup,
      this.petalGroup,
      this.outroSignGroup,
    );

    // Physical airway performers
    this.lead = new VideoFigure(leadModel, leadTrack, this.props, this.scene, crimson, skinA);
    this.lead.head.scene.scale.setScalar(2.02);
    this.leadDressMat = new THREE.MeshStandardMaterial({ color: crimson, roughness: 0.35 });
    const lDress = new THREE.Mesh(new THREE.CylinderGeometry(18, 22, 66, 14), this.leadDressMat);
    lDress.position.set(0, -34, 2);
    this.lead.root.add(lDress);
    this.styleHair(this.lead, hairDark);

    this.daniela = new VideoFigure(danielaModel, danielaTrack, this.props, this.scene, crimson, skinB);
    this.daniela.head.scene.scale.setScalar(2.0);
    this.danielaDressMat = new THREE.MeshStandardMaterial({ color: crimson, roughness: 0.35 });
    const dDress = new THREE.Mesh(new THREE.CylinderGeometry(18, 22, 66, 14), this.danielaDressMat);
    dDress.position.set(0, -34, 2);
    this.daniela.root.add(dDress);
    this.styleHair(this.daniela, hairCaramel);

    this.boss = new VideoFigure(bossModel, bossTrack, this.props, this.scene, crimson, skinBoss);
    this.boss.head.scene.scale.setScalar(2.05);
    this.props.box(this.boss.root, 40, 62, 24, crimson, [0, -34, 2]);
    this.props.oval(this.boss.root, [0, -14, 16], [10, 10, 5], deepRed); // signature red rose lapel
    this.styleHair(this.boss, hairCaramel);

    // 3 decorative KATSEYE proxy members (completing the 6-member formation alongside Lead & Daniela + Boss)
    for (let i = 0; i < 4; i++) {
      const grp = new THREE.Group();
      const dMat = new THREE.MeshStandardMaterial({ color: crimson, roughness: 0.4 });
      this.backupDressMats.push(dMat);
      const gown = new THREE.Mesh(new THREE.ConeGeometry(20, 92, 12), dMat);
      gown.position.y = 84;
      const head = new THREE.Mesh(new THREE.SphereGeometry(12, 12, 12), new THREE.MeshStandardMaterial({ color: i % 2 === 0 ? skinA : skinB }));
      head.position.y = 152;
      const hair = new THREE.Mesh(new THREE.SphereGeometry(14, 12, 12), new THREE.MeshStandardMaterial({ color: i === 2 ? '#b87654' : hairDark }));
      hair.position.set(0, 155, -3);
      grp.add(gown, head, hair);
      this.backupDancers.push(grp);
      this.scene.add(grp);
    }

    this.resize(1280, 720);
    this.frame(0, false, 0, 'gab-tower', 0);
  }

  private styleHair(f: VideoFigure, color: string) {
    const p = this.props;
    const B = bodyPoint(f.model);
    const k = f.model.tract.scale;
    f.hair.begin();
    for (let row = -8; row <= 8; row++) {
      const z = row * 0.88 * k;
      const a = B(-8, 22);
      const b = B(9, 10);
      p.line(f.hair, [[a.x, a.y + 5 * k, z], [a.x + 5 * k, a.y + 7 * k, z], [b.x, b.y - 12 * k, z]], color, 3.8);
    }
    f.hair.end();
  }

  resize(width: number, height: number): void {
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
    this.camera.aspect = this.width / this.height;
    this.props.resize(this.width, this.height);
    this.lead.head.resize(this.width, this.height);
    this.daniela.head.resize(this.width, this.height);
    this.boss.head.resize(this.width, this.height);
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

    const q = t * (122 / 60) * Math.PI * 2;
    const beat = Math.sin(q);
    const sway = Math.sin(q * 0.5);

    const isTower = view === 'gab-tower';
    const isBoardroom = view === 'gab-boardroom' || view === 'gab-boss' || view === 'gab-blinds' || view === 'gab-red-office' || view === 'gab-table-dance';
    const isMansion = view === 'gab-mansion' || view === 'gab-ballroom';
    const isWedding = view === 'gab-wedding';
    const isTalkshow = view === 'gab-talkshow' || view === 'gab-crowd';
    const isOutro = view === 'gab-outro';

    this.towerGroup.visible = isTower;
    this.boardroomGroup.visible = isBoardroom || view === 'wide' || view === 'gab-lead' || view === 'gab-daniela';
    this.mansionGroup.visible = isMansion;
    this.weddingGroup.visible = isWedding;
    this.talkshowGroup.visible = isTalkshow;
    this.outroSignGroup.visible = isOutro;
    this.petalGroup.visible = isTalkshow || isWedding;

    // Background & lighting mood
    if (isTower) {
      this.scene.background = new THREE.Color('#5a98d6');
      this.fillLight.color.set('#fff4d8');
      this.rimLight.color.set('#a8dcff');
    } else if (view === 'gab-red-office' || view === 'gab-table-dance') {
      this.scene.background = new THREE.Color('#0c1830');
      this.blindsGlowMat.color.set('#3c78d8');
      this.blindsGlowMat.emissive.set(midnightBlue);
      this.fillLight.color.set('#3876ff');
      this.rimLight.color.set(crimson);
    } else if (isMansion) {
      this.scene.background = new THREE.Color(view === 'gab-ballroom' ? '#240832' : '#4a261c');
      this.fillLight.color.set(view === 'gab-ballroom' ? neonMagenta : '#ffba84');
      this.rimLight.color.set(neonCyan);
    } else if (isWedding) {
      this.scene.background = new THREE.Color('#a6d8f8');
      this.fillLight.color.set('#fff5e0');
      this.rimLight.color.set('#ffd0d8');
    } else if (isTalkshow) {
      this.scene.background = new THREE.Color('#1c080c');
      this.fillLight.color.set(crimson);
      this.rimLight.color.set(neonGreen);
    } else if (isOutro) {
      this.scene.background = new THREE.Color('#060204');
      this.fillLight.color.set(crimson);
      this.rimLight.color.set('#ff6680');
    } else {
      this.scene.background = new THREE.Color('#281414');
      this.blindsGlowMat.color.set('#f2f8ff');
      this.blindsGlowMat.emissive.set('#dceeff');
      this.fillLight.color.set('#ffd4c4');
      this.rimLight.color.set('#ff6078');
    }

    // Costume switch: Crimson dresses (Acts 1-2) -> Black evening gowns (Mansion/Ballroom/Wedding/Talkshow)
    const dressCol = isMansion || isWedding || isTalkshow || t >= 138 ? blackGown : crimson;
    this.leadDressMat.color.set(dressCol);
    this.danielaDressMat.color.set(dressCol);
    this.backupDressMats.forEach(m => m.color.set(dressCol));

    // Floating rose petals animation
    if (this.petalGroup.visible) {
      this.petalGroup.children.forEach((pt, idx) => {
        pt.position.y = 320 - ((t * 48 + idx * 37) % 300);
        pt.rotation.z = t * 2 + idx;
      });
    }

    // Performer visibility & blocking
    const showGroup = !isTower && !isOutro;
    this.boss.root.visible = view === 'gab-boardroom' || view === 'gab-boss' || (view === 'wide' && t < 66);
    this.lead.root.visible = showGroup && view !== 'gab-boss';
    this.daniela.root.visible = showGroup && view !== 'gab-boss';
    this.backupDancers.forEach((d, idx) => {
      d.visible = showGroup && !this.boss.root.visible && view !== 'gab-lead' && view !== 'gab-daniela';
      const xPos = (idx < 2 ? -190 + idx * 75 : 115 + (idx - 2) * 75) + sway * 14;
      d.position.set(xPos, Math.abs(beat) * 4, -95 - (idx % 2) * 30);
    });

    const grooveY = Math.abs(beat) * (t >= 66 ? 5 : 1.5);
    const tableBoost = view === 'gab-table-dance' ? 56 : 0;

    this.lead.root.position.set(-42 + sway * 14, 150 + grooveY + tableBoost, -10);
    this.lead.root.rotation.set(0, sway * 0.14, sway * 0.05);

    this.daniela.root.position.set(52 + sway * 14, 148 + grooveY + tableBoost, -18);
    this.daniela.root.rotation.set(0, -0.14 + sway * 0.12, -sway * 0.05);

    this.boss.root.position.set(0, 154 + Math.sin(t * 1.4) * 1.5, -135);
    this.boss.root.rotation.set(0, Math.sin(t * 0.6) * 0.1, 0);

    const dramLift = intensity * 18;
    const leadArms: [P, P, P, P] = [
      [-28, -36 + Math.sin(q) * 5, 14],
      [-34, -46 + dramLift * 0.5 + Math.sin(q) * 7, 24],
      [28, -36 - Math.sin(q) * 5, 14],
      [34, -46 + dramLift * 0.5 - Math.sin(q) * 7, 24],
    ];
    const danielaArms: [P, P, P, P] = [
      [-28, -36 - beat * 4, 14],
      [-33, -46 + (speaker === 'gab-daniela' ? 12 : 4), 22],
      [28, -36 + beat * 4, 14],
      [33, -46 + (speaker === 'gab-daniela' ? 12 : 4), 22],
    ];
    const bossArms: [P, P, P, P] = [
      [-28, -36, 14],
      [-31, -46 + Math.sin(t * 2) * 5, 22],
      [28, -36, 14],
      [31, -44 + Math.cos(t * 2) * 5, 22],
    ];
    this.lead.pose(t, leadArms);
    this.daniela.pose(t, danielaArms);
    this.boss.pose(t, bossArms);

    // Camera framing
    const portrait = this.height > this.width;
    let pos: P = [0, 176, 390];
    let target: P = [0, 158, -60];
    let fov = portrait ? 52 : 38;

    switch (view) {
      case 'gab-tower':
        pos = [-120, 160, 320];
        target = [0, 310, -240];
        fov = portrait ? 56 : 42;
        break;
      case 'gab-boss':
        pos = [0, 174, 15];
        target = [0, 172, -135];
        fov = portrait ? 40 : 28;
        break;
      case 'gab-boardroom':
        pos = [Math.sin(t * 0.4) * 45, 172, 260];
        target = [0, 160, -100];
        fov = portrait ? 50 : 38;
        break;
      case 'gab-blinds':
        pos = [-65, 168, 155];
        target = [-10, 164, -40];
        fov = portrait ? 44 : 32;
        break;
      case 'gab-red-office':
        pos = [Math.sin(t * 0.5) * 60, 166, 265];
        target = [0, 160, -40];
        fov = portrait ? 50 : 38;
        break;
      case 'gab-table-dance':
        pos = [0, 215, 290];
        target = [0, 198, -20];
        fov = portrait ? 52 : 40;
        break;
      case 'gab-mansion':
        pos = [Math.sin(t * 0.4) * 55, 172, 340];
        target = [0, 162, -70];
        fov = portrait ? 52 : 40;
        break;
      case 'gab-ballroom':
        pos = [Math.sin(t * 0.7) * 85, 168, 310];
        target = [0, 160, -60];
        fov = portrait ? 54 : 42;
        break;
      case 'gab-wedding':
        pos = [45, 168, 330];
        target = [-20, 152, -90];
        fov = portrait ? 52 : 40;
        break;
      case 'gab-talkshow':
        pos = [Math.sin(t * 0.5) * 55, 168, 330];
        target = [0, 155, -70];
        fov = portrait ? 52 : 40;
        break;
      case 'gab-crowd':
        pos = [0, 130, 240];
        target = [0, 185, -80];
        fov = portrait ? 54 : 42;
        break;
      case 'gab-outro':
        pos = [0, 175, 155];
        target = [0, 175, -180];
        fov = portrait ? 48 : 36;
        break;
      case 'gab-lead':
        pos = [this.lead.root.position.x, 172 + tableBoost, this.lead.root.position.z + 125];
        target = [this.lead.root.position.x, 170 + tableBoost, this.lead.root.position.z];
        fov = portrait ? 40 : 28;
        break;
      case 'gab-daniela':
        pos = [this.daniela.root.position.x, 170 + tableBoost, this.daniela.root.position.z + 125];
        target = [this.daniela.root.position.x, 168 + tableBoost, this.daniela.root.position.z];
        fov = portrait ? 40 : 28;
        break;
      case 'wide':
      default:
        pos = [Math.sin(t * 0.3) * 65, 180, 410];
        target = [0, 160, -65];
        fov = portrait ? 54 : 40;
        break;
    }

    this.camera.fov = fov;
    this.camera.position.set(pos[0], pos[1], pos[2]);
    this.camera.lookAt(target[0], target[1], target[2]);
    this.camera.updateProjectionMatrix();
    this.camera.updateMatrixWorld();

    this.scene.updateMatrixWorld(true);
    if (this.lead.root.visible) this.lead.update(t, playing, this.camera, dt, reset);
    if (this.daniela.root.visible) this.daniela.update(t, playing, this.camera, dt, reset);
    if (this.boss.root.visible) this.boss.update(t, playing, this.camera, dt, reset);
  }

  dispose(): void {
    this.lead.dispose();
    this.daniela.dispose();
    this.boss.dispose();
    this.props.dispose();
  }
}
