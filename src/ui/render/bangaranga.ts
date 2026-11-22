import * as THREE from 'three';
import { VideoProps, VideoFigure, type VideoPoint as P } from './videoProps.ts';
import type { VoiceModel } from '../analysis.ts';
import type { TeleTrack } from '../../show/tele.ts';
import type { CameraView, CharacterId } from '../../scene/scene.ts';
import { bodyPoint } from './profile.ts';

export type BangarangaId = 'bg-lead' | 'bg-chant';

const skinLead = '#f2c6b6';
const skinChant = '#ebd0c0';
const halterPink = '#f5bad2';
const furDarkBrown = '#382016';
const suitBlack = '#1c1e24';
const detaineeBeige = '#b59d82';
const detaineeOlive = '#6e5228';
const detaineeBrown = '#4e3222';
const chairRed = '#d82232';

function makeClockTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d');
  if (!ctx) return null;
  ctx.fillStyle = '#f4f4f0';
  ctx.beginPath();
  ctx.arc(128, 128, 114, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#28282c';
  ctx.lineWidth = 10;
  ctx.stroke();
  ctx.fillStyle = '#18181c';
  ctx.font = 'bold 26px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let i = 1; i <= 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const x = 128 + Math.sin(a) * 86;
    const y = 128 - Math.cos(a) * 86;
    ctx.fillText(String(i), x, y);
  }
  return new THREE.CanvasTexture(c);
}

/**
 * Procedural 3D cinematic stage for DARA — "Bangaranga (LIVE Eurovision 2026)"
 * Faithfully follows the Eurovision 2026 Grand Final live staging:
 * 1. Eurovision Arena Laser Intro (0:00-0:15, bg-arena) — wide dark stadium with green neon header, curving green/white floor laser fans & red backlights.
 * 2. 180° Upside-Down Wood Waiting Room (0:16-0:27.8, bg-inverted) — camera inverted 180° on DARA seated on the middle red chair flanked by the detainees' white & brown trousers.
 * 3. Wood-Paneled Waiting Room & 5 Red Chairs (0:28-2:05, bg-room) — vertical brown wood-slat walls, ribbed teal-blue carpet, white analog wall clock (upper left-center), 3 glowing amber circular sconces, angled white frosted window on the right wall, and ALL 5 performers (DARA center in blush-pink high-neck halter, pink opera gloves with dark brown fur cuffs, dark sequined micro-shorts & knee-high brown boots + the 4 eccentric detainees) sitting with hands on knees, leaning in domino waves, slumping forward, and DARA standing on the middle red chair.
 * 4. Blue-Lit Waiting Room Chair Riot (2:06-2:23.4, bg-chairs) — the wood-paneled room floods with icy electric blue light & haze while the 4 detainees hoist the red chairs upside-down behind their shoulders (4 red chair legs pointing straight up like antlers behind DARA).
 * 5. Eurovision Main Arena Purple Laser & Smoke Cloud Finale (2:23.5-3:25, bg-stage) — open dark arena bathed in electric purple/violet light, grid of white stadium spotlights, giant floating purple smoke cloud in the upper-right sky, and all 5 performers dancing in formation into the blinding white/gold arena finale.
 */
export class BangarangaStage {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(40, 16 / 9, 1, 20000);
  readonly props = new VideoProps();

  readonly arenaGroup = new THREE.Group();
  readonly roomGroup = new THREE.Group();
  readonly stageGroup = new THREE.Group();
  readonly halo: THREE.Group = new THREE.Group();

  readonly lead: VideoFigure;
  readonly chant: VideoFigure;
  readonly detainees: VideoFigure[] = [];
  readonly roomChairs: THREE.Group[] = [];
  readonly sconceLights: THREE.Mesh[] = [];
  readonly woodWallMat: THREE.MeshStandardMaterial;
  readonly carpetMat: THREE.MeshStandardMaterial;
  readonly laserBeams: THREE.Mesh[] = [];
  readonly stageLasers: THREE.Mesh[] = [];
  readonly spotGrid: THREE.Group = new THREE.Group();
  readonly purpleCloud: THREE.Group = new THREE.Group();
  readonly clockHandMin: THREE.Mesh;
  readonly clockHandHr: THREE.Mesh;

  readonly keyLight: THREE.DirectionalLight;
  readonly fillLight: THREE.PointLight;
  readonly rimLight: THREE.PointLight;

  private readonly clockTex: THREE.CanvasTexture | null;
  private haloTex: THREE.CanvasTexture | null = null;
  private width = 1280;
  private height = 720;
  private last: number | null = null;
  private epoch = -1;

  constructor(
    readonly leadModel: VoiceModel,
    readonly leadTrack: TeleTrack,
    readonly chantModel: VoiceModel,
    readonly chantTrack: TeleTrack,
  ) {
    this.scene.background = new THREE.Color('#090512');

    const amb = new THREE.AmbientLight('#f2e8ff', 0.88);
    this.keyLight = new THREE.DirectionalLight('#fff6f0', 1.48);
    this.keyLight.position.set(160, 420, 310);
    this.fillLight = new THREE.PointLight('#ffaa66', 1.45, 2400);
    this.fillLight.position.set(-210, 210, 190);
    this.rimLight = new THREE.PointLight('#58c8ff', 1.4, 2400);
    this.rimLight.position.set(220, 240, -210);
    this.scene.add(amb, this.keyLight, this.fillLight, this.rimLight);

    this.clockTex = makeClockTexture();

    // 1. Eurovision Arena Laser Intro (0:00-0:15, bg-arena)
    const arenaFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(2400, 1800),
      new THREE.MeshStandardMaterial({ color: '#060810', roughness: 0.35, metalness: 0.45 }),
    );
    arenaFloor.rotation.x = -Math.PI / 2;
    this.arenaGroup.add(arenaFloor);

    // Glowing green neon arena header bars & red stage backlights (0:06-0:09)
    const greenBarMat = new THREE.MeshBasicMaterial({ color: '#22c55e' });
    const redGlowMat = new THREE.MeshBasicMaterial({ color: '#ef4444' });
    const headerBar = new THREE.Mesh(new THREE.BoxGeometry(240, 18, 6), greenBarMat);
    headerBar.position.set(0, 265, -340);
    this.arenaGroup.add(headerBar);
    for (let i = -5; i <= 5; i++) {
      const redPod = new THREE.Mesh(new THREE.SphereGeometry(8, 12, 10), redGlowMat);
      redPod.position.set(i * 48, 225, -330);
      this.arenaGroup.add(redPod);
    }

    const laserColors = ['#22c55e', '#ffffff', '#22c55e', '#ffffff', '#ef4444'];
    for (let i = -7; i <= 7; i++) {
      const col = laserColors[(i + 7) % laserColors.length]!;
      const beam = new THREE.Mesh(
        new THREE.CylinderGeometry(1.8, 12, 680, 10, 1, true),
        new THREE.MeshBasicMaterial({
          color: col,
          transparent: true,
          opacity: 0.42,
          side: THREE.DoubleSide,
        }),
      );
      beam.position.set(i * 44, 140, -180);
      beam.rotation.x = 0.65;
      this.laserBeams.push(beam);
      this.arenaGroup.add(beam);
    }
    this.scene.add(this.arenaGroup);

    // 2, 3 & 4. Retro Wood-Paneled Waiting Room (bg-inverted, bg-room & bg-chairs)
    this.carpetMat = new THREE.MeshStandardMaterial({ color: '#1a5a6e', roughness: 0.85 });
    const tealCarpet = new THREE.Mesh(new THREE.PlaneGeometry(1800, 1200), this.carpetMat);
    tealCarpet.rotation.x = -Math.PI / 2;

    this.woodWallMat = new THREE.MeshStandardMaterial({ color: '#7a4422', roughness: 0.72 });
    const woodWall = new THREE.Mesh(new THREE.PlaneGeometry(1200, 520), this.woodWallMat);
    woodWall.position.set(0, 260, -165);

    // Side wood walls enclosing the room
    const leftWoodWall = new THREE.Mesh(new THREE.PlaneGeometry(600, 520), this.woodWallMat);
    leftWoodWall.position.set(-340, 260, 20);
    leftWoodWall.rotation.y = Math.PI / 2;
    const rightWoodWall = new THREE.Mesh(new THREE.PlaneGeometry(600, 520), this.woodWallMat);
    rightWoodWall.position.set(340, 260, 20);
    rightWoodWall.rotation.y = -Math.PI / 2;
    this.roomGroup.add(leftWoodWall, rightWoodWall);

    // Vertical dark wood-panel grooves
    const slatMat = new THREE.MeshStandardMaterial({ color: '#42220e', roughness: 0.8 });
    for (let x = -330; x <= 330; x += 34) {
      const slat = new THREE.Mesh(new THREE.BoxGeometry(3.5, 520, 5), slatMat);
      slat.position.set(x, 260, -162);
      this.roomGroup.add(slat);
    }

    // White round analog wall clock positioned between chair 2 and chair 3 (as seen at 0:42, 1:18, 1:27)
    const clockFace = new THREE.Mesh(
      new THREE.CircleGeometry(28, 28),
      this.clockTex
        ? new THREE.MeshBasicMaterial({ map: this.clockTex })
        : new THREE.MeshBasicMaterial({ color: '#f4f4f0' }),
    );
    clockFace.position.set(-58, 228, -158);
    const handMat = new THREE.MeshBasicMaterial({ color: '#181820' });
    this.clockHandMin = new THREE.Mesh(new THREE.BoxGeometry(2.5, 20, 2), handMat);
    this.clockHandMin.position.set(-58, 228, -156);
    this.clockHandHr = new THREE.Mesh(new THREE.BoxGeometry(3.2, 14, 2), handMat);
    this.clockHandHr.position.set(-58, 228, -156);

    // Glowing amber circular wall sconces (seen at 0:42, 0:48, 1:27)
    for (const sx of [-195, -115, 135]) {
      const rim = new THREE.Mesh(
        new THREE.CylinderGeometry(13, 13, 4, 20),
        new THREE.MeshStandardMaterial({ color: '#3a2010', roughness: 0.5 }),
      );
      rim.rotation.x = Math.PI / 2;
      rim.position.set(sx, 220, -159);
      const sconce = new THREE.Mesh(
        new THREE.SphereGeometry(10, 16, 12),
        new THREE.MeshBasicMaterial({ color: '#ffcf68' }),
      );
      sconce.position.set(sx, 220, -156);
      this.sconceLights.push(sconce);
      this.roomGroup.add(rim, sconce);
    }

    // Glowing white frosted window on the right angled wall (seen at 0:48, 0:51, 1:00, 1:48)
    const winFrame = new THREE.Mesh(
      new THREE.BoxGeometry(10, 148, 136),
      new THREE.MeshStandardMaterial({ color: '#2b2018', roughness: 0.7 }),
    );
    winFrame.position.set(275, 195, -75);
    winFrame.rotation.y = -0.35;
    const frostedWin = new THREE.Mesh(
      new THREE.BoxGeometry(12, 134, 122),
      new THREE.MeshBasicMaterial({ color: '#eef6ff' }),
    );
    frostedWin.position.set(274, 195, -75);
    frostedWin.rotation.y = -0.35;

    // Row of 5 red waiting-room chairs (used both seated on the floor and hoisted upside-down in bg-chairs!)
    for (let i = 0; i < 5; i++) {
      const ch = this.makeRedChair();
      ch.position.set((i - 2) * 68, 0, -65);
      this.roomChairs.push(ch);
      this.roomGroup.add(ch);
    }

    this.roomGroup.add(
      tealCarpet,
      woodWall,
      clockFace,
      this.clockHandMin,
      this.clockHandHr,
      winFrame,
      frostedWin,
    );
    this.scene.add(this.roomGroup);

    // 5. Eurovision Main Arena Stage & Purple Laser Riot (2:23.5-3:25, bg-stage)
    const mainStageFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(2600, 1800),
      new THREE.MeshStandardMaterial({ color: '#0c041a', roughness: 0.25, metalness: 0.55 }),
    );
    mainStageFloor.rotation.x = -Math.PI / 2;
    this.stageGroup.add(mainStageFloor);

    // Diagonal rows of magenta/violet LED floor strips (seen at 2:24, 2:30, 2:33)
    const ledDotMat = new THREE.MeshBasicMaterial({ color: '#e879f9' });
    for (const side of [-1, 1]) {
      for (let k = 0; k < 10; k++) {
        const dot = new THREE.Mesh(new THREE.BoxGeometry(14, 3, 8), ledDotMat);
        dot.position.set(side * (65 + k * 24), 1.5, -20 - k * 22);
        this.stageGroup.add(dot);
      }
    }

    // Matrix grid of bright white stadium spotlights on the back wall (seen at 2:39, 2:57, 3:09)
    const spotMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });
    for (let row = 0; row < 4; row++) {
      for (let col = -5; col <= 5; col++) {
        const bulb = new THREE.Mesh(new THREE.SphereGeometry(5.5, 10, 8), spotMat);
        bulb.position.set(col * 46, 175 + row * 36, -320);
        this.spotGrid.add(bulb);
      }
    }
    this.stageGroup.add(this.spotGrid);

    // Giant floating purple/violet smoke cloud in the upper-right sky (signature 2:42-2:45 visual)
    const cloudMat = new THREE.MeshStandardMaterial({
      color: '#a855f7',
      emissive: '#6b21a8',
      emissiveIntensity: 0.65,
      roughness: 0.6,
    });
    for (let i = 0; i < 9; i++) {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(34 + (i % 3) * 12, 16, 12), cloudMat);
      puff.position.set(
        (i - 4) * 28,
        Math.sin(i * 1.3) * 16,
        (i % 2) * -14,
      );
      this.purpleCloud.add(puff);
    }
    this.purpleCloud.position.set(115, 238, -195);
    this.stageGroup.add(this.purpleCloud);

    // Slanted violet, indigo & white arena laser beams
    const stageColors = ['#d946ef', '#818cf8', '#ffffff'];
    for (let i = -7; i <= 7; i++) {
      const beam = new THREE.Mesh(
        new THREE.CylinderGeometry(2.0, 14, 620, 10, 1, true),
        new THREE.MeshBasicMaterial({
          color: stageColors[(i + 7) % 3]!,
          transparent: true,
          opacity: 0.34,
          side: THREE.DoubleSide,
        }),
      );
      beam.position.set(i * 48, 225, -240);
      this.stageLasers.push(beam);
      this.stageGroup.add(beam);
    }
    this.scene.add(this.stageGroup);

    // Performer 2 (Center): DARA Lead Vocal — blush-pink high-neck halter, pink opera gloves with dark brown fur cuffs, dark sequined micro-shorts & knee-high brown boots
    this.lead = new VideoFigure(
      leadModel,
      leadTrack,
      this.props,
      this.scene,
      halterPink,
      skinLead,
    );
    this.lead.head.scene.scale.setScalar(2.14);
    this.decorateDara(this.lead);

    // Performer 3 (Right-Center): Blonde suit-and-striped-tie detainee (Riot Chants lead)
    this.chant = new VideoFigure(
      chantModel,
      chantTrack,
      this.props,
      this.scene,
      suitBlack,
      skinChant,
    );
    this.chant.head.scene.scale.setScalar(2.04);
    this.decorateBlondeDetainee(this.chant);

    // Performers 0, 1, 4: The other 3 waiting-room detainees so all 5 red chairs are occupied!
    const detConfigs: Array<{ coat: string; pants: string; tie?: string; topKnot?: boolean; moustache?: boolean }> = [
      { coat: detaineeBeige, pants: '#483628', topKnot: true }, // Slot 0 (far left): beige top, brown skirt, vertical top-knot
      { coat: detaineeOlive, pants: '#784820', tie: '#d9468f', moustache: true }, // Slot 1 (inner left): olive jacket, pink collar, moustache & red mouth smudge
      { coat: detaineeBrown, pants: '#2b221e', tie: '#d9468f' }, // Slot 4 (far right): dark brown shirt, pink necktie
    ];
    for (const cfg of detConfigs) {
      const d = new VideoFigure(chantModel, chantTrack, this.props, this.scene, cfg.coat, skinChant);
      d.head.scene.scale.setScalar(1.92);
      for (const leg of d.legs) (leg.material as THREE.MeshBasicMaterial).color.set(cfg.pants);
      if (cfg.tie) {
        this.props.box(d.root, 5, 36, 2, cfg.tie, [0, -34, 12.8]);
      }
      if (cfg.topKnot) {
        this.styleHair(d, '#24140e', true);
      } else {
        this.styleHair(d, '#221510', false);
      }
      this.detainees.push(d);
    }

    if (typeof document !== 'undefined') {
      const hc = document.createElement('canvas');
      hc.width = hc.height = 192;
      const hctx = hc.getContext('2d')!;
      const grad = hctx.createRadialGradient(96, 96, 10, 96, 96, 96);
      grad.addColorStop(0, 'rgba(10, 12, 20, 0.74)');
      grad.addColorStop(0.5, 'rgba(10, 12, 20, 0.40)');
      grad.addColorStop(1, 'rgba(10, 12, 20, 0)');
      hctx.fillStyle = grad;
      hctx.fillRect(0, 0, 192, 192);
      this.haloTex = new THREE.CanvasTexture(hc);
      const sp = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: this.haloTex, transparent: true, depthWrite: false }),
      );
      sp.scale.set(118, 118, 1);
      this.halo.add(sp);
    }
    this.scene.add(this.halo);

    this.resize(1280, 720);
  }

  private decorateDara(f: VideoFigure): void {
    // High-neck blush-pink halter collar + dark vertical corset seams
    this.props.box(f.root, 16, 10, 12, halterPink, [0, -8, 2]);
    this.props.box(f.root, 1.5, 52, 1.5, '#7a485c', [-8, -38, 12.2]);
    this.props.box(f.root, 1.5, 52, 1.5, '#7a485c', [8, -38, 12.2]);
    // Dark sequined micro-shorts (hip band) & knee-high brown boots on lower legs
    this.props.box(f.root, 38, 18, 24, '#1a1520', [0, -68, 0]);
    if (f.legs[0]) (f.legs[0].material as THREE.MeshBasicMaterial).color.set(skinLead);
    if (f.legs[2]) (f.legs[2].material as THREE.MeshBasicMaterial).color.set(skinLead);
    if (f.legs[1]) (f.legs[1].material as THREE.MeshBasicMaterial).color.set('#4a2818');
    if (f.legs[3]) (f.legs[3].material as THREE.MeshBasicMaterial).color.set('#4a2818');
    for (const ft of f.feet) (ft.material as THREE.MeshBasicMaterial).color.set('#381c10');
    // Pink opera gloves on forearms + dark brown fluffy fur trim bands on upper arms (seen clearly at 0:39, 1:12, 1:27)
    for (const arm of f.arms) (arm.material as THREE.MeshBasicMaterial).color.set(halterPink);
    for (const s of [-1, 1]) {
      this.props.oval(f.root, [s * 24, -24, 6], [8.5, 6.5, 8.5], furDarkBrown);
    }
    // Sleek dark wavy hair with signature blonde front money-piece highlights
    const p = this.props;
    const B = bodyPoint(f.model);
    const k = f.model.tract.scale;
    f.hair.begin();
    for (let row = -8; row <= 8; row++) {
      const z = row * 0.85 * k;
      const a = B(-8, 22);
      const b = B(8, 16);
      const isBlondeStreak = Math.abs(row) >= 6;
      p.line(
        f.hair,
        [
          [a.x, a.y + 4 * k, z],
          [a.x + 6 * k, a.y + 8 * k, z],
          [b.x + 6 * k, b.y - 8 * k, z],
        ],
        isBlondeStreak ? '#e8d090' : '#26140e',
        4.0,
      );
    }
    f.hair.end();
  }

  private decorateBlondeDetainee(f: VideoFigure): void {
    // White shirt front, black-and-white striped tie & white trousers (seen at 0:39, 0:48, 0:54)
    this.props.box(f.root, 14, 48, 2, '#f0eee8', [0, -36, 12.2]);
    this.props.box(f.root, 5.5, 38, 2.4, '#22242a', [2, -36, 13.0]);
    for (const leg of f.legs) (leg.material as THREE.MeshBasicMaterial).color.set('#e8e6df');
    this.styleHair(f, '#dec078', false);
  }

  private makeRedChair(): THREE.Group {
    const g = new THREE.Group();
    const cushionMat = new THREE.MeshStandardMaterial({ color: chairRed, roughness: 0.45 });
    const legMat = new THREE.MeshStandardMaterial({ color: '#e62e3d', metalness: 0.5, roughness: 0.35 });
    const seat = new THREE.Mesh(new THREE.BoxGeometry(42, 6, 38), cushionMat);
    seat.position.y = 38;
    const back = new THREE.Mesh(new THREE.BoxGeometry(40, 34, 6), cushionMat);
    back.position.set(0, 62, -16);
    g.add(seat, back);
    for (const lx of [-18, 18]) {
      for (const lz of [-15, 15]) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 40, 8), legMat);
        leg.position.set(lx, 19, lz);
        g.add(leg);
      }
    }
    return g;
  }

  private styleHair(f: VideoFigure, color: string, topKnot: boolean): void {
    const p = this.props;
    const B = bodyPoint(f.model);
    const k = f.model.tract.scale;
    f.hair.begin();
    for (let row = -7; row <= 7; row++) {
      const z = row * 0.82 * k;
      const a = B(-8, 22);
      const b = B(7, 17);
      p.line(
        f.hair,
        [
          [a.x, a.y + 3.5 * k, z],
          [a.x + 5 * k, a.y + (topKnot ? 13 : 7) * k, z],
          [b.x + 4 * k, b.y - 4 * k, z],
        ],
        color,
        3.8,
      );
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
    this.chant.head.resize(this.width, this.height);
    for (const d of this.detainees) d.head.resize(this.width, this.height);
  }

  /**
   * Natural human arm poses in VideoFigure local coordinates:
   * Shoulder attachment is [s * 21, -14, 0], mid-torso is y = -39, waist/hip is y = -70.
   * Hands stay at lap/hip/chest height (-62..-16), only rising to temple/shoulder level on specific choreography accents!
   */
  private daraArms(t: number, step: number, seated: boolean, isChairs: boolean, isStage: boolean): [P, P, P, P] {
    if (seated) {
      // 0:16-0:27 & 0:42-0:49: Seated on the middle red chair with hands resting on knees/lap
      if (t >= 38 && t < 41.8) {
        // 0:39 "Welcome to the riot" — signature bent-wrist cat-paw pose near cheekbones
        return [
          [-30, -24, 16],
          [-20, -8 + step * 3, 24],
          [30, -24, 16],
          [20, -8 - step * 3, 24],
        ];
      }
      return [
        [-26, -38, 16],
        [-22, -56 + step * 2, 36],
        [26, -38, 16],
        [22, -56 - step * 2, 36],
      ];
    }

    if (isChairs) {
      // 2:06-2:23 Blue-lit chair riot
      if (t >= 139.5 && t < 143.4) {
        // 2:21 "I'm 'bout to lose my mind — MIND!" — hands pressed to sides of head in shock
        return [
          [-32, -16, 16],
          [-19, -2, 16],
          [32, -16, 16],
          [19, -2, 16],
        ];
      }
      // 2:12-2:18 Hands poised on hips/ribs while upside-down red chairs frame her
      return [
        [-30, -34, 12],
        [-23, -50 + step * 4, 18],
        [30, -32, 14],
        [25, -36 - step * 5, 26],
      ];
    }

    if (!isStage) {
      // Wood room standing/close-up choreography
      if (t >= 28 && t < 32) {
        // 0:30 Blowing kiss / right palm forward at chin level, left hand low
        return [
          [-26, -40, 12],
          [-24, -56, 18],
          [28, -32, 16],
          [16, -16, 28],
        ];
      }
      if (t >= 85 && t < 90.5) {
        // 1:27 "Come alive" — wide horizontal open-arm embrace under the wall clock
        return [
          [-42, -20, 12],
          [-66, -18 + step * 3, 18],
          [42, -20, 12],
          [66, -18 - step * 3, 18],
        ];
      }
      if (t >= 91 && t < 99.5) {
        // 1:33-1:36 Intimate close-up — one hand touching cheek, other arm down at side
        return [
          [-28, -28, 16],
          [-17, -10, 20],
          [26, -40, 12],
          [24, -58, 16],
        ];
      }
      // Standing on the red chair (1:06, 1:45) or grooving in front of the chairs: hands on hips / chest groove
      return [
        [-30, -36, 12],
        [-23, -52 + step * 5, 18],
        [30, -34, 14],
        [24, -46 - step * 5, 22],
      ];
    }

    // 2:24-3:25 Eurovision Main Stage purple laser choreography
    if ((t >= 151 && t < 156) || (t >= 173 && t < 176)) {
      // 2:33 Camera point ("Blinding lights / I'm the bangaran") — one arm pointing forward at camera, other on hip
      return [
        [-22, -24, 24],
        [-10, -18, 44],
        [30, -36, 10],
        [22, -54, 14],
      ];
    }
    // Fierce stage strut with hands at waist/chest level (never flapping above the head!)
    return [
      [-29, -36 + step * 4, 14],
      [-34, -46 + step * 8, 24],
      [29, -36 - step * 4, 14],
      [34, -46 - step * 8, 24],
    ];
  }

  private detaineeArms(
    idx: number,
    t: number,
    step: number,
    seated: boolean,
    slumped: boolean,
    isChairs: boolean,
  ): [P, P, P, P] {
    if (isChairs) {
      // 2:06-2:23 Holding the upside-down red chair by its seat frame at shoulder height
      return [
        [-28, -24, 14],
        [-22, -10 + step * 3, 18],
        [28, -24, 14],
        [22, -10 - step * 3, 18],
      ];
    }
    if (slumped) {
      // 0:57 Slumped forward over knees in the red chairs
      return [
        [-24, -46, 24],
        [-20, -76, 40],
        [24, -46, 24],
        [20, -76, 40],
      ];
    }
    if (seated) {
      // 0:42-1:03 Seated on the 5 red chairs with hands resting on knees
      if (t >= 44.5 && t < 49.5) {
        // 0:45-0:48 Domino side-lean wave along the row of chairs
        return [
          [-28, -34, 16],
          [-36, -32 + step * 6, 26],
          [26, -38, 16],
          [22, -56, 36],
        ];
      }
      return [
        [-26, -38, 16],
        [-22, -56 + (idx % 2 === 0 ? step : -step) * 3, 36],
        [26, -38, 16],
        [22, -56 - (idx % 2 === 0 ? step : -step) * 3, 36],
      ];
    }
    // Standing / prowling dance groove with elbows below shoulders and hands at waist/chest level
    return [
      [-28, -36 + step * 4, 14],
      [-32, -48 + step * 8, 24],
      [28, -36 - step * 4, 14],
      [32, -48 - step * 8, 24],
    ];
  }

  frame(
    time: number,
    playing: boolean,
    epoch: number,
    view: CameraView = 'wide',
    intensity = 0,
    _speaker?: CharacterId,
  ): void {
    const t = Math.max(0, Number.isFinite(time) ? time : 0);
    const dt = this.last === null ? 0 : Math.max(0, Math.min(0.05, t - this.last));
    const reset = epoch !== this.epoch || (this.last !== null && Math.abs(t - this.last) > 0.25);
    this.last = t;
    this.epoch = epoch;

    const cycle = t * (134 / 60) * Math.PI * 2;
    const step = Math.sin(cycle * 0.5);
    const bounce = Math.abs(Math.sin(cycle));

    const isArena = view === 'bg-arena';
    const isInverted = view === 'bg-inverted';
    const isChairs = view === 'bg-chairs';
    const isStage = view === 'bg-stage' || (view === 'bg-lead' && t >= 143.4);
    // In the original video, bg-chairs (2:06-2:23) happens INSIDE the wood-paneled room flooded with electric blue light!
    const isRoom = !isArena && !isStage;

    this.arenaGroup.visible = isArena;
    this.roomGroup.visible = isRoom;
    this.stageGroup.visible = isStage;

    // Room lighting shift: warm amber waiting room (0:16-2:05) -> icy electric blue chair riot (2:06-2:23)
    if (isChairs) {
      this.woodWallMat.color.set('#1c3d5e');
      this.carpetMat.color.set('#0a2844');
      this.fillLight.color.set('#00b4ff');
      this.keyLight.color.set('#80d8ff');
      for (const s of this.sconceLights) (s.material as THREE.MeshBasicMaterial).color.set('#60d0ff');
    } else if (isRoom) {
      this.woodWallMat.color.set('#7a4422');
      this.carpetMat.color.set('#1a5a6e');
      this.fillLight.color.set('#ffaa55');
      this.keyLight.color.set('#fff2e0');
      for (const s of this.sconceLights) (s.material as THREE.MeshBasicMaterial).color.set('#ffcf68');
    } else if (isStage) {
      this.fillLight.color.set('#d946ef');
      this.keyLight.color.set(t >= 186 ? '#fff8dc' : '#f0abfc');
    } else {
      this.fillLight.color.set('#22c55e');
      this.keyLight.color.set('#ffffff');
    }

    // Background color per chapter
    if (isArena) {
      this.scene.background = new THREE.Color(t >= 12 && t < 16 ? '#020204' : '#050811');
    } else if (isChairs) {
      this.scene.background = new THREE.Color('#071d36');
    } else if (isRoom) {
      this.scene.background = new THREE.Color('#28150b');
    } else {
      this.scene.background = new THREE.Color(t >= 186 ? '#241838' : '#120424');
    }

    // Clock hands at ~10:10 ticking forward
    this.clockHandMin.rotation.z = -0.95 - t * 0.08;
    this.clockHandHr.rotation.z = 0.85 - t * 0.01;

    // Animate arena lasers & floating purple smoke cloud
    for (let i = 0; i < this.laserBeams.length; i++) {
      this.laserBeams[i]!.rotation.z = Math.sin(t * 1.6 + i * 0.35) * 0.38;
    }
    for (let i = 0; i < this.stageLasers.length; i++) {
      this.stageLasers[i]!.rotation.z = Math.cos(t * 1.9 + i * 0.32) * 0.42;
    }
    this.purpleCloud.position.x = 110 + Math.sin(t * 0.6) * 14;
    this.purpleCloud.position.y = 236 + Math.cos(t * 0.9) * 6;

    // 5 Red Chairs positioning:
    // - In bg-inverted / bg-room: standing in a neat row on the teal carpet floor (z = -65)
    // - In bg-chairs (2:06-2:23): hoisted upside-down (rotation.x = Math.PI) behind the performers so the 4 red legs stick straight up like red antlers (seen at 2:12, 2:15)!
    const chairSlotsX = [-136, -68, 0, 68, 136];
    for (let i = 0; i < 5; i++) {
      const ch = this.roomChairs[i]!;
      const cx = chairSlotsX[i]!;
      if (isChairs) {
        ch.position.set(cx * 0.78, 198 + Math.sin(t * 3.2 + i) * 6, -52);
        ch.rotation.set(
          Math.PI + Math.sin(t * 2.4 + i) * 0.14,
          (i - 2) * 0.15,
          (i - 2) * -0.18 + Math.cos(t * 2.1 + i) * 0.12,
        );
      } else {
        ch.position.set(cx, 0, -65);
        ch.rotation.set(0, 0, 0);
      }
    }

    // Determine cast state from the original video timeline:
    const allSeatedLineup = isRoom && !isChairs && ((t >= 16 && t < 28) || (t >= 41.8 && t < 65));
    const slumpedForward = allSeatedLineup && t >= 56 && t < 59.5;
    const dominoLean = allSeatedLineup && t >= 44.5 && t < 49.5;
    const daraOnChair = isRoom && !isChairs && ((t >= 65 && t < 71) || (t >= 100 && t < 107.5));

    // Position DARA (Lead, slot 2 center)
    const leadY = allSeatedLineup
      ? 142
      : daraOnChair
      ? 176 + bounce * 2
      : 150 + bounce * 2.5;
    const leadX = allSeatedLineup || daraOnChair ? 0 : step * 8;
    const leadZ = allSeatedLineup || daraOnChair ? -48 : -16;
    const leadLean = dominoLean ? 0.18 * Math.sin(t * 2.4) : step * 0.03;
    const leadBend = slumpedForward ? 0.42 : 0;

    this.lead.root.position.set(leadX, leadY, leadZ);
    this.lead.root.rotation.set(leadBend, step * 0.12, leadLean);
    this.lead.pose(t, this.daraArms(t, step, allSeatedLineup, isChairs, isStage), allSeatedLineup);

    this.halo.visible = true;
    this.halo.position.set(leadX, leadY + 6, leadZ - 28);

    // Position Blonde Suit Detainee (Chant, slot 3 right-center)
    const chantSeated = allSeatedLineup || (isRoom && !isChairs && t >= 100 && t < 118);
    const chantX = allSeatedLineup ? 68 : isChairs ? 56 : 64 - step * 6;
    const chantY = chantSeated ? 142 : 148 + bounce * 2;
    const chantZ = allSeatedLineup ? -48 : -44;
    const chantBend = slumpedForward ? 0.48 : 0;
    const chantLean = dominoLean ? 0.22 * Math.sin(t * 2.4 - 0.7) : -step * 0.04;

    this.chant.root.visible = !isArena || t > 6;
    this.chant.root.position.set(chantX, chantY, chantZ);
    this.chant.root.rotation.set(chantBend, -0.16 + step * 0.08, chantLean);
    this.chant.pose(
      t,
      this.detaineeArms(3, t, step, chantSeated, slumpedForward, isChairs),
      chantSeated,
    );

    // Position the other 3 detainees on chairs 0, 1, 4 ([-136, -68, +136])
    const extraSlotsX = [-136, -68, 136];
    for (let i = 0; i < this.detainees.length; i++) {
      const d = this.detainees[i]!;
      const sx = extraSlotsX[i]!;
      const detSeated = allSeatedLineup || (isRoom && !isChairs && t >= 95 && t < 115 && i !== 1);
      d.root.visible = !isArena;
      const dx = allSeatedLineup ? sx : isChairs ? sx * 0.78 : sx * 0.88;
      const dy = detSeated ? 142 : 148 + bounce * 2;
      const dz = allSeatedLineup ? -48 : -54 - (i % 2) * 8;
      const dBend = slumpedForward ? 0.5 : 0;
      const dLean = dominoLean ? 0.22 * Math.sin(t * 2.4 - i * 0.65) : (i - 1) * 0.04 * step;
      d.root.position.set(dx, dy, dz);
      d.root.rotation.set(dBend, (i === 2 ? -0.22 : 0.18) + step * 0.06, dLean);
      d.pose(t, this.detaineeArms(i, t, step, detSeated, slumpedForward, isChairs), detSeated);
    }

    // Deterministic hero cameras matching the Eurovision camera cuts while keeping Chimera heads framed
    const portrait = this.height > this.width;
    let pos: [number, number, number] = [Math.sin(t * 0.32) * 28, leadY + 6, 188];
    let target: [number, number, number] = [leadX, leadY, leadZ];
    let fov = portrait ? 52 : 38;
    let roll = 0;

    switch (view) {
      case 'bg-arena':
        pos = [Math.sin(t * 0.35) * 42, 162, 220];
        target = [0, 150, -35];
        fov = portrait ? 54 : 42;
        break;
      case 'bg-inverted':
        // True 180° upside-down camera roll (0:16-0:27.8)
        roll = Math.PI;
        if (t < 24.5) {
          // 0:18-0:24 Tight upside-down close-up on DARA flanked by detainees' legs
          pos = [Math.sin(t * 0.25) * 10, leadY + 2, 128];
          target = [leadX, leadY, leadZ];
          fov = portrait ? 44 : 32;
        } else {
          // 0:27 Upside-down medium-wide pull-back across the seated detainees
          pos = [Math.sin(t * 0.25) * 18, leadY + 4, 188];
          target = [0, leadY, -48];
          fov = portrait ? 52 : 38;
        }
        break;
      case 'bg-room':
      case 'wide':
        if (allSeatedLineup || daraOnChair) {
          // Symmetric wide front shot of all 5 performers on the 5 red chairs under the wall clock (0:42-1:06)
          pos = [Math.sin(t * 0.25) * 18, leadY + 8, portrait ? 245 : 225];
          target = [0, leadY, -48];
          fov = portrait ? 56 : 42;
        } else {
          pos = [Math.sin(t * 0.32) * 28, leadY + 6, 184];
          target = [leadX, leadY, leadZ];
          fov = portrait ? 50 : 37;
        }
        break;
      case 'bg-chairs':
        // 2:06-2:23 Blue-lit wood room with upside-down red chair legs sticking up behind DARA
        pos = [Math.sin(t * 0.34) * 24, leadY + 6, 178];
        target = [leadX, leadY + 2, leadZ];
        fov = portrait ? 50 : 36;
        break;
      case 'bg-stage':
        // 2:24-3:25 Eurovision Main Stage purple lasers & upper-right floating purple smoke cloud
        pos = [Math.sin(t * 0.34) * 32, leadY + 8, 205];
        target = [0, leadY + 2, -24];
        fov = portrait ? 54 : 40;
        break;
      case 'bg-chant':
        pos = [this.chant.root.position.x + Math.sin(t * 0.38) * 10, chantY + 4, 96];
        target = [this.chant.root.position.x, chantY, this.chant.root.position.z];
        fov = portrait ? 40 : 28;
        break;
      case 'bg-lead':
      default:
        pos = [leadX + Math.sin(t * 0.4) * 10, leadY + 4, 108];
        target = [leadX, leadY + 1, leadZ];
        fov = portrait ? 38 : 27;
        break;
    }

    if (intensity > 0.85) pos[1] += Math.sin(cycle) * 1.2;

    this.camera.fov = fov;
    this.camera.position.set(pos[0], pos[1], pos[2]);
    this.camera.up.set(Math.sin(roll), Math.cos(roll), 0);
    this.camera.lookAt(target[0], target[1], target[2]);
    this.camera.updateProjectionMatrix();
    this.camera.updateMatrixWorld();

    this.scene.updateMatrixWorld(true);
    this.lead.update(t, playing, this.camera, dt, reset);
    if (this.chant.root.visible) this.chant.update(t, playing, this.camera, dt, reset);
    for (const d of this.detainees) {
      if (d.root.visible) d.update(t, playing, this.camera, dt, reset);
    }
  }

  dispose(): void {
    this.lead.dispose();
    this.chant.dispose();
    for (const d of this.detainees) d.dispose();
    this.clockTex?.dispose();
    this.haloTex?.dispose();
    (this.halo.children[0] as THREE.Sprite | undefined)?.material.dispose();
    this.props.dispose();
  }
}
