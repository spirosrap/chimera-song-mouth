import * as THREE from 'three';
import { VideoFigure, VideoProps, type VideoPoint as Point } from './videoProps.ts';
import type { VoiceModel } from '../analysis.ts';
import type { TeleTrack } from '../../show/tele.ts';
import type { CameraView, CharacterId } from '../../scene/scene.ts';
import type { StoneId, StoneView } from '../../scene/stone-rolls.ts';

type Actor = { model: VoiceModel; track: TeleTrack };
type SetName = 'table' | 'grid12' | 'droste' | 'wall35' | 'wall64' | 'studio' | 'black';
type Wardrobe = 'brown' | 'pink' | 'yellow' | 'green' | 'split' | 'dan-yellow' | 'dan-green' | 'dan-pink';
type Shot = {
  set: SetName;
  look: Wardrobe;
  aim: Point;
  offset: Point;
  leadAt: Point;
  harmAt?: Point;
  wide?: boolean;
  hideCast?: boolean;
};

function shot(
  set: SetName,
  look: Wardrobe,
  aim: Point,
  offset: Point,
  leadAt: Point,
  harmAt?: Point,
  wide = false,
  hideCast = false,
): Shot {
  return { set, look, aim, offset, leadAt, harmAt, wide, hideCast };
}

const ONE: Shot = shot('table', 'brown', [0, 146, 0], [0, 8, 305], [0, 152, 8]);
const CAMERA: Record<StoneView | 'wide', Shot> = {
  wide: shot('wall35', 'brown', [0, 148, 0], [0, 10, 390], [0, 154, 14], [108, 150, 8], true),
  'stone-slab': shot('table', 'brown', [0, 145, 0], [0, 12, 340], [0, 152, 8], undefined, true, true),
  'stone-one': ONE,
  'stone-two': shot('table', 'pink', [-26, 146, 0], [0, 10, 325], [-46, 152, 8], [46, 152, 8]),
  'stone-four': shot('table', 'green', [0, 148, 0], [0, 12, 370], [72, 152, 10], [-72, 150, 8], true),
  'stone-split': shot('table', 'split', [28, 154, 8], [0, 8, 255], [40, 158, 14], [-86, 150, 2]),
  'stone-hats-four': shot('table', 'dan-pink', [0, 150, 8], [0, 10, 345], [52, 154, 12], [-52, 154, 12], true),
  'stone-grid12': shot('grid12', 'split', [18, 150, 6], [0, 10, 355], [42, 156, 14], [-68, 150, 8], true),
  'stone-arms12': shot('grid12', 'yellow', [0, 148, 6], [0, 10, 365], [0, 154, 14], [96, 148, 8], true),
  'stone-chevrons': shot('grid12', 'split', [0, 154, 10], [0, 8, 275], [0, 158, 16], [106, 150, 8]),
  'stone-andy12': shot('grid12', 'green', [12, 154, 10], [8, 8, 280], [18, 158, 16], [-86, 152, 10]),
  'stone-hats12': shot('grid12', 'dan-yellow', [0, 152, 10], [0, 10, 345], [34, 156, 14], [-58, 154, 14], true),
  'stone-tiles12': shot('grid12', 'brown', [0, 154, 10], [0, 8, 285], [0, 158, 16], [96, 150, 8]),
  'stone-droste': shot('droste', 'pink', [14, 154, 12], [0, 6, 260], [32, 158, 18], [-74, 154, 16]),
  'stone-tunnel': shot('droste', 'yellow', [0, 154, 12], [0, 4, 270], [0, 158, 18], [94, 152, 10]),
  'stone-burst': shot('wall35', 'brown', [0, 152, 10], [0, 8, 365], [0, 156, 16], [108, 150, 8], true),
  'stone-weave': shot('wall35', 'pink', [0, 152, 10], [0, 8, 355], [0, 156, 16], [-104, 150, 8], true),
  'stone-matrix': shot('wall35', 'green', [0, 152, 10], [0, 8, 355], [0, 156, 16], [106, 150, 8], true),
  'stone-trio': shot('wall35', 'brown', [0, 154, 10], [0, 6, 330], [0, 158, 18], [92, 156, 16], true),
  'stone-mosaic': shot('wall35', 'brown', [0, 154, 10], [0, 6, 315], [0, 158, 18], [104, 152, 12]),
  'stone-climax': shot('wall35', 'pink', [0, 154, 10], [0, 6, 310], [0, 158, 18], [98, 154, 14]),
  'stone-wall64': shot('wall64', 'brown', [0, 150, 0], [0, 10, 415], [0, 154, 16], [116, 150, 10], true),
  'stone-studio': shot('studio', 'brown', [0, 154, 8], [0, 6, 235], [0, 156, 14]),
  'stone-outro': shot('black', 'brown', [0, 150, 0], [0, 0, 290], [0, 152, 0], undefined, false, true),
};

const PALETTE = {
  concrete: '#6c7175',
  concreteDark: '#555a5e',
  caseYellow: '#ebc424',
  caseGreen: '#20b64e',
  casePink: '#f18cb0',
  caseWhite: '#ebeef0',
  caseBrown: '#6d3e2c',
  bezel: '#15161c',
  studioWhite: '#edf0ee',
  woodFloor: '#4e3f38',
  pink: '#f39bb9',
  brown: '#5b3326',
  yellow: '#f4c714',
  green: '#1cb44a',
  brick: '#a84836',
  cable: '#e2e6e8',
} as const;

const WARDROBE: Record<Wardrobe, { top: string; leftTop?: string; pants: string; hair: string; hat?: string; beard?: boolean }> = {
  brown: { top: PALETTE.brown, pants: '#1f2026', hair: '#2e221d' },
  pink: { top: PALETTE.pink, pants: '#e381a3', hair: '#2e221d' },
  yellow: { top: PALETTE.yellow, pants: '#dca810', hair: '#2e221d' },
  green: { top: PALETTE.green, pants: '#157238', hair: '#2e221d' },
  split: { top: PALETTE.green, leftTop: PALETTE.yellow, pants: '#1f2026', hair: '#2e221d' },
  'dan-yellow': { top: PALETTE.yellow, pants: '#cf9e10', hair: '#261e1a', hat: PALETTE.yellow, beard: true },
  'dan-green': { top: PALETTE.green, pants: '#167538', hair: '#261e1a', hat: PALETTE.green, beard: true },
  'dan-pink': { top: PALETTE.pink, pants: '#d97b9d', hair: '#261e1a', hat: PALETTE.pink, beard: true },
};

type CostumeParts = {
  hairBlobs: THREE.Mesh[];
  splitVest: THREE.Mesh;
  hatGroup: THREE.Group;
  hatCrown: THREE.Mesh;
  hatBrim: THREE.Mesh;
  glasses: THREE.Group;
  beard: THREE.Mesh;
  collar: THREE.Mesh;
};

type MiniProxy = {
  root: THREE.Group;
  arms: THREE.Mesh[];
  base: Point;
  phase: number;
};

export class StoneRollsStage {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(40, 16 / 9, 1, 3600);
  readonly props = new VideoProps();
  readonly sets: Record<SetName, THREE.Group> = {
    table: new THREE.Group(),
    grid12: new THREE.Group(),
    droste: new THREE.Group(),
    wall35: new THREE.Group(),
    wall64: new THREE.Group(),
    studio: new THREE.Group(),
    black: new THREE.Group(),
  };
  readonly figures: Record<StoneId, VideoFigure>;
  private readonly costumes = new Map<VideoFigure, CostumeParts>();
  private readonly textures: THREE.Texture[] = [];

  // Table phones (1 -> 2 -> 4) & opening concrete card
  private readonly titleCard = new THREE.Group();
  private readonly tablePhones: THREE.Group[] = [];
  private readonly tableArmChain = new THREE.Group();
  private readonly tableProxies: MiniProxy[] = [];

  // 12-phone grid dynamic screen panels & arm-lattice overlay
  private readonly grid12Screens: THREE.Mesh[] = [];
  private readonly grid12Chevrons: THREE.Group[] = [];
  private readonly grid12Arms = new THREE.Group();

  // Droste nested horizontal phone tunnel
  private readonly drosteWallMat: THREE.MeshBasicMaterial;
  private readonly drosteFrames: THREE.Group[] = [];

  // 35-phone wall (5x7) & 64-phone wall (8x8)
  private readonly wall35Screens: THREE.Mesh[] = [];
  private readonly wall35Starburst = new THREE.Group();
  private readonly wall35Weave = new THREE.Group();
  private readonly andyProxy: MiniProxy;

  private readonly wall64Screens: THREE.Mesh[] = [];

  private time = -1;
  private epoch = -1;

  constructor(lead: Actor, harmony: Actor) {
    this.scene.background = new THREE.Color(PALETTE.concrete);
    this.scene.fog = new THREE.Fog(PALETTE.concrete, 720, 2200);
    this.scene.add(...Object.values(this.sets));

    this.drosteWallMat = new THREE.MeshBasicMaterial({ color: PALETTE.green });

    this.buildTableSet();
    this.buildGrid12Set();
    this.buildDrosteSet();
    this.buildWall35Set();
    this.buildWall64Set();
    this.buildStudioSet();

    this.andyProxy = this.makeBandProxy(this.sets.wall35, [-96, 10, 14], 1.15, PALETTE.green, '#8c694a', 1);

    this.figures = {
      'stone-lead': this.makeFigure(lead, '#dfb29a'),
      'stone-harmony': this.makeFigure(harmony, '#d3a288'),
    };
    this.frame(0, false, 0, 'stone-slab', 0);
  }

  /** 6-face vertex-shaded slab matching Codex's crisp architectural Three.js look. */
  private slab(g: THREE.Object3D, at: Point, size: Point, color: string): THREE.Mesh {
    const mesh = this.props.box(g, ...size, color, at);
    const colors: number[] = [];
    for (const shade of [0.76, 0.65, 1.14, 0.56, 1.0, 0.72]) {
      const { r, g: green, b } = new THREE.Color(color).multiplyScalar(shade);
      for (let v = 0; v < 4; v++) colors.push(r, green, b);
    }
    mesh.geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    const mat = mesh.material as THREE.MeshBasicMaterial;
    mat.color.set('#ffffff');
    mat.vertexColors = true;
    return mesh;
  }

  private textPlane(g: THREE.Object3D, text: string, at: Point, w: number, h: number, color: string): THREE.Mesh | null {
    if (typeof document === 'undefined') return null;
    const c = document.createElement('canvas');
    c.width = 1024;
    c.height = 192;
    const ctx = c.getContext('2d');
    if (!ctx) return null;
    ctx.font = '600 76px Archivo, Arial, sans-serif';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 512, 96, 980);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    this.textures.push(tex);
    const plane = this.props.mesh(g, new THREE.PlaneGeometry(w, h), at, '#ffffff');
    const mat = plane.material as THREE.MeshBasicMaterial;
    mat.map = tex;
    mat.transparent = true;
    mat.depthWrite = false;
    return plane;
  }

  /** Builds a realistic 3D yellow-bumper smartphone shell with black bezel, Dynamic Island pill, and flat screen. */
  private makePhone(
    parent: THREE.Object3D,
    at: Point,
    w: number,
    h: number,
    caseColor: string,
    screenColor: string,
    horizontal = false,
  ): { group: THREE.Group; screen: THREE.Mesh } {
    const g = new THREE.Group();
    g.position.set(...at);
    parent.add(g);

    // Strictly non-overlapping Z layers: yellow case (-10..-2) -> black bezel (-2..+0.6) -> flat screen (+1.8) -> pill (+2.4)
    this.slab(g, [0, 0, -6], [w, h, 8], caseColor);
    this.slab(g, [0, 0, -0.7], [w - 8, h - 8, 2.6], PALETTE.bezel);

    // Flat crisp screen plane (zero z-fighting or diagonal face clipping)
    const screen = this.props.mesh(g, new THREE.PlaneGeometry(w - 14, h - 14), [0, 0, 1.8], screenColor);

    // Dynamic Island pill (top center on vertical phone, left center on horizontal phone)
    if (horizontal) {
      this.props.mesh(
        g,
        new THREE.PlaneGeometry(4.2, Math.min(22, h * 0.36)),
        [-(w - 22) * 0.5 + 5, 0, 2.4],
        '#07080c',
      );
    } else {
      this.props.mesh(
        g,
        new THREE.PlaneGeometry(Math.min(24, w * 0.34), 4.2),
        [0, (h - 22) * 0.5 - 5, 2.4],
        '#07080c',
      );
    }
    return { group: g, screen };
  }

  /** Concrete tabletop backdrop with subtle stone slabs & joints. */
  private addConcreteBackdrop(parent: THREE.Group, z: number): void {
    this.slab(parent, [0, 150, z], [1400, 920, 18], PALETTE.concrete);
    for (let i = -4; i <= 4; i++) {
      this.slab(parent, [i * 155, 150, z + 10], [3, 900, 2], PALETTE.concreteDark);
    }
    for (let j = -2; j <= 3; j++) {
      this.slab(parent, [0, j * 145, z + 10], [1380, 3, 2], PALETTE.concreteDark);
    }
  }

  private buildTableSet(): void {
    const s = this.sets.table;
    this.addConcreteBackdrop(s, -95);

    // Opening title card: "64 Videos on 64 Phones" (spoiler-free!)
    this.textPlane(this.titleCard, '64 Videos on 64 Phones', [0, 152, -74], 260, 48, '#f6f8fa');
    s.add(this.titleCard);

    // 4 upright yellow-case phones on the concrete table (width 106, height 218)
    for (let i = 0; i < 4; i++) {
      const { group } = this.makePhone(s, [0, 144, -68], 106, 218, PALETTE.caseYellow, PALETTE.studioWhite, false);
      // Dark studio wood plank floor inside the bottom third of each phone (flat planes, zero z-fight)
      this.props.mesh(group, new THREE.PlaneGeometry(92, 46), [0, -79, 2.2], PALETTE.woodFloor);
      this.props.mesh(group, new THREE.PlaneGeometry(92, 3.5), [0, -55, 2.3], '#cfd4d2');
      this.tablePhones.push(group);
    }

    // 4-color horizontal arm chain reaching across all 4 phones at torso level (0:24-0:26!)
    const segColors = [PALETTE.pink, PALETTE.brown, PALETTE.yellow, PALETTE.green];
    for (let i = 0; i < 4; i++) {
      const x = (i - 1.5) * 112;
      this.slab(this.tableArmChain, [x, 114, -56], [96, 14, 5], segColors[i]!);
      if (i < 3) {
        this.props.oval(this.tableArmChain, [x + 56, 114, -52], [8, 6, 4], '#dfb29a');
      }
    }
    // Red apple/stone held across Phone 1 at 0:24
    this.props.oval(this.tableArmChain, [-168, 122, -50], [7.5, 7.5, 6], '#d93832');
    s.add(this.tableArmChain);

    // Stylized band proxies behind Damian in 0:28-0:36 (Tim in pink/black, Dan in brown/yellow/green)
    this.tableProxies.push(
      this.makeBandProxy(s, [-140, 26, -42], 0.86, PALETTE.pink, '#5a3d2e', 0),
      this.makeBandProxy(s, [-62, 26, -42], 0.86, PALETTE.brown, '#4e3326', 2),
    );
  }

  private buildGrid12Set(): void {
    const s = this.sets.grid12;
    this.addConcreteBackdrop(s, -98);

    // 2 rows x 6 columns = 12 upright yellow-case phones on the concrete slab
    const cols = 6;
    const rows = 2;
    const pw = 68;
    const ph = 128;
    const gx = 73;
    const gy = 134;
    const paletteCols = [PALETTE.green, PALETTE.yellow, PALETTE.brown, PALETTE.pink, PALETTE.yellow, PALETTE.green];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = (c - (cols - 1) / 2) * gx;
        const y = 84 + (1 - r) * gy;
        const { group, screen } = this.makePhone(s, [x, y, -66], pw, ph, PALETTE.caseYellow, PALETTE.studioWhite, false);
        this.grid12Screens.push(screen);

        // Bold chevron stripes inside each phone (flat planes at z = 2.5, shown during stone-chevrons & stone-andy12!)
        const chev = new THREE.Group();
        const col = paletteCols[c]!;
        for (let k = -3; k <= 3; k++) {
          const barL = this.props.mesh(chev, new THREE.PlaneGeometry(24, 5.2), [-10.5, k * 15, 2.5], col);
          barL.rotation.z = 0.55;
          const barR = this.props.mesh(chev, new THREE.PlaneGeometry(24, 5.2), [10.5, k * 15, 2.5], col);
          barR.rotation.z = -0.55;
        }
        group.add(chev);
        this.grid12Chevrons.push(chev);
      }
    }

    // Diagonal bare-arm lattice & color-sleeve framing bands (0:44-0:54)
    for (let c = 0; c < 6; c++) {
      for (let r = 0; r < 2; r++) {
        const x = (c - 2.5) * gx;
        const y = 84 + (1 - r) * gy;
        const arm = this.slab(this.grid12Arms, [x, y, -54], [62, 11, 5], r === 0 ? '#dfb29a' : '#d5a48b');
        arm.rotation.z = 0.68;
      }
    }
    // Horizontal green/yellow/brown/pink border frame bands
    this.slab(this.grid12Arms, [0, 212, -52], [410, 14, 5], PALETTE.green);
    this.slab(this.grid12Arms, [0, 88, -52], [410, 14, 5], PALETTE.yellow);
    s.add(this.grid12Arms);
  }

  private buildDrosteSet(): void {
    const s = this.sets.droste;

    // Luminous full-studio ceramic tiled backdrop (cycles green / yellow / brick in frame())
    const wall = this.props.mesh(s, new THREE.PlaneGeometry(1100, 680), [0, 152, -135], PALETTE.green);
    wall.material = this.drosteWallMat;
    // Crisp white grout tile grid lines
    for (let x = -480; x <= 480; x += 48) {
      this.slab(s, [x, 152, -131], [3, 660, 2], '#e8f0ec');
    }
    for (let y = -120; y <= 440; y += 48) {
      this.slab(s, [0, y, -131], [980, 3, 2], '#e8f0ec');
    }

    // 5 crisp hollow nested horizontal phone-inside-phone Droste frames (strictly behind singers, zero haze!)
    const frameSpecs: Array<{ w: number; h: number; z: number; col: string }> = [
      { w: 356, h: 184, z: -112, col: PALETTE.caseWhite },
      { w: 282, h: 146, z: -96, col: PALETTE.caseGreen },
      { w: 214, h: 112, z: -80, col: PALETTE.casePink },
      { w: 154, h: 82, z: -66, col: PALETTE.caseYellow },
      { w: 102, h: 56, z: -54, col: PALETTE.caseBrown },
    ];
    for (const sp of frameSpecs) {
      const g = new THREE.Group();
      g.position.set(0, 152, sp.z);
      // Hollow phone bumper border + crisp dark inner bezel
      const bw = 10;
      this.slab(g, [0, sp.h / 2 - bw / 2, 0], [sp.w, bw, 6], sp.col);
      this.slab(g, [0, -sp.h / 2 + bw / 2, 0], [sp.w, bw, 6], sp.col);
      this.slab(g, [-sp.w / 2 + bw / 2, 0, 0], [bw, sp.h, 6], sp.col);
      this.slab(g, [sp.w / 2 - bw / 2, 0, 0], [bw, sp.h, 6], sp.col);
      // Thin inner black bezel rim
      const ib = 3;
      this.slab(g, [0, sp.h / 2 - bw - ib / 2, 2], [sp.w - bw * 2, ib, 3], PALETTE.bezel);
      this.slab(g, [0, -sp.h / 2 + bw + ib / 2, 2], [sp.w - bw * 2, ib, 3], PALETTE.bezel);
      this.slab(g, [-sp.w / 2 + bw + ib / 2, 0, 2], [ib, sp.h - bw * 2, 3], PALETTE.bezel);
      this.slab(g, [sp.w / 2 - bw - ib / 2, 0, 2], [ib, sp.h - bw * 2, 3], PALETTE.bezel);
      // Dynamic Island pill on the left inner edge
      this.slab(g, [-sp.w / 2 + bw + 7, 0, 3], [4, Math.min(22, sp.h * 0.34), 2], '#07080c');
      this.drosteFrames.push(g);
      s.add(g);
    }

    // Stylized fingers gripping the outer horizontal phone frame from top & bottom (1:28-1:52)
    for (const fx of [-44, -15, 15, 44]) {
      this.props.oval(s, [fx, 246, -104], [10, 16, 8], '#dfb29a');
      this.props.oval(s, [fx, 56, -104], [10, 16, 8], '#d5a389');
    }
  }

  /** White power strips + tangled white USB charging cables flanking the 35-phone and 64-phone walls! */
  private addChargingRig(parent: THREE.Group, edgeX: number, z: number): void {
    for (const side of [-1, 1]) {
      // Two white power strips per side
      for (const py of [82, 206]) {
        const strip = this.slab(parent, [side * (edgeX + 54), py, z + 6], [28, 72, 10], '#eef0f2');
        strip.rotation.z = side * 0.24;
        for (let plug = -2; plug <= 2; plug++) {
          this.slab(parent, [side * (edgeX + 46), py + plug * 13, z + 12], [12, 8, 6], '#d2d7db');
        }
      }
      // Tangled white USB cables running from every row of phones out to the power strips
      for (let row = 0; row < 7; row++) {
        const py = 54 + row * 33;
        const targetY = row < 3 ? 82 : 206;
        const midX = side * (edgeX + 24 + (row % 3) * 8);
        const midY = (py + targetY) * 0.5 + ((row % 2) * 14 - 7);
        this.props.tube(parent, [side * edgeX, py, z + 4], [midX, midY, z + 8], 1.7, PALETTE.cable);
        this.props.tube(parent, [midX, midY, z + 8], [side * (edgeX + 48), targetY + (row % 3 - 1) * 12, z + 10], 1.7, PALETTE.cable);
      }
    }
  }

  private buildWall35Set(): void {
    const s = this.sets.wall35;
    this.addConcreteBackdrop(s, -96);

    // 5 columns x 7 rows = 35 horizontal yellow-case phones!
    const cols = 5;
    const rows = 7;
    const pw = 86;
    const ph = 42;
    const gx = 91;
    const gy = 46;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = (c - (cols - 1) / 2) * gx;
        const y = 20 + (rows - 1 - r) * gy;
        const { screen } = this.makePhone(s, [x, y, -64], pw, ph, PALETTE.caseYellow, PALETTE.studioWhite, true);
        this.wall35Screens.push(screen);
      }
    }
    this.addChargingRig(s, 232, -68);

    // Radial starburst of 20 OK Go color-sleeved arms + bare hands radiating out from center (1:56-2:04!)
    const rayCols = [PALETTE.brown, PALETTE.pink, PALETTE.yellow, PALETTE.green];
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * Math.PI * 2;
      const start: Point = [Math.cos(a) * 30, 158 + Math.sin(a) * 20, -52];
      const mid: Point = [Math.cos(a) * 145, 158 + Math.sin(a) * 100, -52];
      const end: Point = [Math.cos(a) * 212, 158 + Math.sin(a) * 146, -52];
      this.props.tube(this.wall35Starburst, start, mid, 6.2, rayCols[i % 4]!);
      this.props.tube(this.wall35Starburst, mid, end, 5.4, i % 2 ? '#e3b89e' : '#d5a489');
      this.props.oval(this.wall35Starburst, end, [7.5, 5.8, 4], '#e8bfa7');
    }
    s.add(this.wall35Starburst);

    // Woven tartan plaid of yellow, green, and pink full-body sleeve bands (2:06-2:08!)
    this.slab(this.wall35Weave, [-91, 158, -52], [32, 310, 5], PALETTE.yellow);
    this.slab(this.wall35Weave, [91, 158, -52], [32, 310, 5], PALETTE.green);
    this.slab(this.wall35Weave, [0, 204, -50], [430, 26, 5], PALETTE.green);
    this.slab(this.wall35Weave, [0, 112, -50], [430, 26, 5], PALETTE.pink);
    this.slab(this.wall35Weave, [0, 66, -50], [430, 24, 5], PALETTE.yellow);
    s.add(this.wall35Weave);
  }

  private buildWall64Set(): void {
    const s = this.sets.wall64;
    this.addConcreteBackdrop(s, -98);

    // Grand 8x8 = 64-phone colorful mosaic reveal (3:12-3:15!)
    const cols = 8;
    const rows = 8;
    const pw = 54;
    const ph = 32;
    const gx = 58;
    const gy = 36;
    const mosaicPalette = [PALETTE.pink, PALETTE.yellow, PALETTE.green, PALETTE.brown, PALETTE.studioWhite];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = (c - (cols - 1) / 2) * gx;
        const y = 26 + (rows - 1 - r) * gy;
        const col = mosaicPalette[(r * 3 + c * 2) % mosaicPalette.length]!;
        const { screen } = this.makePhone(s, [x, y, -66], pw, ph, PALETTE.caseYellow, col, true);
        this.wall64Screens.push(screen);
      }
    }
    this.addChargingRig(s, 236, -70);
  }

  private buildStudioSet(): void {
    const s = this.sets.studio;
    // Quiet real-life white studio room at 3:16-3:18 after pulling out of the 64-phone mosaic!
    this.slab(s, [0, -6, -20], [1100, 14, 700], PALETTE.woodFloor);
    this.slab(s, [0, 158, -145], [1100, 340, 18], '#d8dcda');
    // Recessed paneled white studio double door on the left (matching 3:16)
    this.slab(s, [-145, 138, -133], [116, 250, 8], '#c4cac7');
    this.slab(s, [-145, 138, -128], [94, 224, 4], '#e4e8e6');
    this.slab(s, [-145, 138, -125], [3, 224, 3], '#9ba3a0');
    // Subtle baseboard molding
    this.slab(s, [0, 12, -134], [1100, 22, 6], '#bfc5c2');
  }

  private makeBandProxy(
    parent: THREE.Group,
    at: Point,
    scale: number,
    shirt: string,
    hairColor: string,
    phase: number,
  ): MiniProxy {
    const root = new THREE.Group();
    root.position.set(...at);
    root.scale.setScalar(scale);
    parent.add(root);
    this.props.oval(root, [0, 128, 0], [12, 16, 10], '#dfb29a');
    this.props.oval(root, [0, 136, -2], [12.5, 10, 9.5], hairColor);
    const body = this.props.mesh(root, new THREE.CylinderGeometry(19, 15, 56, 14), [0, 86, 0], shirt);
    body.scale.z = 0.58;
    for (const sx of [-9, 9]) {
      this.props.tube(root, [sx * 0.85, 62, 0], [sx, 6, 0], 5.6, '#23252c');
      this.props.oval(root, [sx, 4, 5], [5, 3.5, 8], '#f2f4f6');
    }
    const arms = [-1, 1].map(side => this.props.tube(root, [side * 17, 108, 0], [side * 28, 72, 8], 4.4, shirt));
    return { root, arms, base: at, phase };
  }

  private makeFigure(actor: Actor, skin: string): VideoFigure {
    const f = new VideoFigure(actor.model, actor.track, this.props, this.scene, PALETTE.brown, skin);
    // Hero-scaled Chimera head (2.12x) matching Codex's jade-angel standard
    f.head.scene.scale.setScalar(2.12);

    // Tightly cropped short male haircut strictly on the crown (z <= -17) — never droopy side ears, never occludes mouth!
    const hairBlobs: THREE.Mesh[] = [];
    for (let i = -2; i <= 2; i++) {
      hairBlobs.push(this.props.oval(f.root, [i * 5.8, 27.5 - Math.abs(i) * 1.1, -17], [6.6, 6.8, 7.5], '#2e221d'));
    }
    hairBlobs.push(this.props.oval(f.root, [0, 30, -18], [13.5, 5.5, 7.5], '#2e221d'));
    for (const side of [-1, 1]) {
      hairBlobs.push(this.props.oval(f.root, [side * 14.2, 21.5, -18], [3.6, 5.2, 5.5], '#2e221d'));
    }

    // Half-shirt overlay for Damian's iconic yellow/green split collar (0:28-0:38 & 0:58-1:02!)
    const splitVest = this.props.box(f.root, 22, 62, 16, PALETTE.yellow, [-10.5, -39, 3]);
    splitVest.visible = false;

    // Button-up shirt collar accent
    const collar = this.props.box(f.root, 20, 6, 6, '#ffffff', [0, -10, 11]);

    // Dan Konopka's signature bucket hat + round glasses + beard (0:36, 1:12-1:14, 1:32, 2:32, 2:54!)
    const hatGroup = new THREE.Group();
    hatGroup.position.set(0, 32, -2);
    f.root.add(hatGroup);
    const hatCrown = this.props.mesh(hatGroup, new THREE.CylinderGeometry(16, 19, 16, 20), [0, 8, 0], PALETTE.yellow);
    const hatBrim = this.props.mesh(hatGroup, new THREE.CylinderGeometry(20, 29, 7, 24), [0, -1, 0], PALETTE.yellow);
    hatGroup.visible = false;

    const glasses = new THREE.Group();
    f.root.add(glasses);
    this.props.tube(glasses, [-15, 7, 16], [15, 7, 16], 1.0, '#18181e');
    for (const gx of [-8, 8]) {
      const lens = this.props.oval(glasses, [gx, 6, 16.2], [5.6, 4.4, 0.8], '#1c2430');
      const lm = lens.material as THREE.MeshBasicMaterial;
      lm.transparent = true;
      lm.opacity = 0.42;
      lm.depthWrite = false;
    }
    glasses.visible = false;

    const beard = this.props.oval(f.root, [0, -9, -15], [15, 8, 7], '#2d241f');
    beard.visible = false;

    this.costumes.set(f, { hairBlobs, splitVest, hatGroup, hatCrown, hatBrim, glasses, beard, collar });
    return f;
  }

  private dress(f: VideoFigure, look: Wardrobe, beat: number, intensity: number, t: number, reachLeft = false): void {
    const w = WARDROBE[look];
    const c = this.costumes.get(f)!;

    (f.torso.material as THREE.MeshBasicMaterial).color.set(w.top);
    (c.collar.material as THREE.MeshBasicMaterial).color.set(w.top);
    c.splitVest.visible = Boolean(w.leftTop);
    if (w.leftTop) {
      (c.splitVest.material as THREE.MeshBasicMaterial).color.set(w.leftTop);
    }

    for (let i = 0; i < f.arms.length; i++) {
      const col = w.leftTop && i < 2 ? w.leftTop : w.top;
      (f.arms[i]!.material as THREE.MeshBasicMaterial).color.set(col);
    }
    for (const leg of f.legs) (leg.material as THREE.MeshBasicMaterial).color.set(w.pants);
    for (const ft of f.feet) (ft.material as THREE.MeshBasicMaterial).color.set('#f2f4f6');
    for (const hb of c.hairBlobs) {
      (hb.material as THREE.MeshBasicMaterial).color.set(w.hair);
      hb.visible = !w.hat;
    }

    c.hatGroup.visible = Boolean(w.hat);
    if (w.hat) {
      (c.hatCrown.material as THREE.MeshBasicMaterial).color.set(w.hat);
      (c.hatBrim.material as THREE.MeshBasicMaterial).color.set(w.hat);
    }
    c.glasses.visible = Boolean(w.beard);
    c.beard.visible = Boolean(w.beard);

    // Natural human arm coordinates in VideoFigure local space (shoulder = -14, mid-torso = -39, hips = -70)
    const groove = Math.sin(beat) * (4 + intensity * 4);
    const hands: [Point, Point, Point, Point] = reachLeft
      ? [
          [-48, -16, 12],
          [-84, -14, 16], // Iconic 0:14 reach across the phone bezel!
          [26, -38, 12],
          [24, -56, 18],
        ]
      : [
          [-27, -36 + groove * 0.5, 14],
          [-30, -52 + groove, 22],
          [27, -36 - groove * 0.5, 14],
          [30, -52 - groove, 22],
        ];
    f.pose(t, hands, false);
    f.head.scene.rotation.x = -0.02 + Math.sin(beat * 0.5) * 0.03;
    f.head.scene.rotation.y -= Math.sin(beat * 0.45) * 0.12;
    f.head.scene.rotation.z = Math.sin(beat * 0.5) * 0.025;
  }

  private updateGrid12Visuals(view: StoneView | 'wide', t: number): void {
    const isChevrons = view === 'stone-chevrons' || view === 'stone-andy12';
    const isArms = view === 'stone-arms12';
    const isHats = view === 'stone-hats12';
    const isTiles = view === 'stone-tiles12';

    this.grid12Arms.visible = isArms;
    for (const ch of this.grid12Chevrons) ch.visible = isChevrons;

    const tileColors = [PALETTE.green, PALETTE.yellow, PALETTE.studioWhite, PALETTE.studioWhite, PALETTE.yellow, PALETTE.green];
    const hatCols = ['#14161c', '#181a22', PALETTE.brown, PALETTE.pink, PALETTE.yellow, PALETTE.green];
    const torsoCols = [PALETTE.green, PALETTE.yellow, PALETTE.brown, PALETTE.pink, PALETTE.yellow, PALETTE.green];

    for (let i = 0; i < this.grid12Screens.length; i++) {
      const col = i % 6;
      const mat = this.grid12Screens[i]!.material as THREE.MeshBasicMaterial;
      if (isHats) {
        mat.color.set(hatCols[col]!);
      } else if (isTiles) {
        mat.color.set(tileColors[col]!);
      } else if (isChevrons) {
        mat.color.set(PALETTE.studioWhite);
      } else if (isArms) {
        mat.color.set((col === 0 || col === 5) ? PALETTE.green : (col === 1 || col === 4) ? PALETTE.yellow : PALETTE.studioWhite);
      } else {
        const shift = Math.floor(t * 0.8) % 6;
        mat.color.set(torsoCols[(col + shift) % 6]!);
      }
    }
  }

  private updateWall35Visuals(view: StoneView | 'wide', t: number): void {
    this.wall35Starburst.visible = view === 'stone-burst';
    this.wall35Weave.visible = view === 'stone-weave';
    this.andyProxy.root.visible = view === 'stone-trio';

    if (this.wall35Starburst.visible) {
      this.wall35Starburst.rotation.z = Math.sin(t * 1.4) * 0.08;
    }

    const pulseStep = Math.floor(t * 2.2);
    for (let i = 0; i < this.wall35Screens.length; i++) {
      const r = Math.floor(i / 5);
      const c = i % 5;
      const mat = this.wall35Screens[i]!.material as THREE.MeshBasicMaterial;
      if (view === 'stone-burst') {
        mat.color.set(PALETTE.studioWhite);
      } else if (view === 'stone-weave') {
        mat.color.set(c === 1 ? PALETTE.yellow : c === 3 ? PALETTE.green : r % 2 === 0 ? PALETTE.pink : PALETTE.studioWhite);
      } else if (view === 'stone-matrix') {
        mat.color.set((c === 2 && r >= 1 && r <= 5) ? PALETTE.pink : PALETTE.green);
      } else if (view === 'stone-trio') {
        mat.color.set(c <= 1 ? PALETTE.green : c === 2 ? '#8c533c' : PALETTE.yellow);
      } else if (view === 'stone-mosaic') {
        const colors = [PALETTE.brick, PALETTE.green, PALETTE.yellow, PALETTE.studioWhite];
        mat.color.set(colors[(r + c + pulseStep) % colors.length]!);
      } else {
        // stone-climax: electric green & hot pink checkerboard!
        mat.color.set((r + c + pulseStep) % 2 === 0 ? PALETTE.green : PALETTE.pink);
      }
    }
  }

  resize(w: number, h: number): void {
    this.camera.aspect = w / Math.max(h, 1);
    this.camera.updateProjectionMatrix();
    this.props.resize(w, h);
    this.figures['stone-lead'].head.resize(w, h);
    this.figures['stone-harmony'].head.resize(w, h);
  }

  frame(
    t: number,
    playing: boolean,
    epoch: number,
    view: CameraView = 'wide',
    intensity = 0,
    speaker?: CharacterId,
  ): void {
    const reset = epoch !== this.epoch || this.time < 0 || Math.abs(t - this.time) > 0.25;
    const dt = reset ? 1 / 30 : Math.max(1 / 120, Math.min(0.05, t - this.time));
    this.epoch = epoch;
    this.time = t;

    const chosen: Shot = Object.hasOwn(CAMERA, view)
      ? CAMERA[view as StoneView | 'wide']
      : view === 'stone-harmony'
      ? CAMERA['stone-hats-four']
      : ONE;
    const { set, look } = chosen;

    for (const name of Object.keys(this.sets) as SetName[]) {
      this.sets[name].visible = name === set;
    }

    const bgHex =
      set === 'black'
        ? '#000000'
        : set === 'studio'
        ? '#d6dad8'
        : set === 'droste'
        ? PALETTE.green
        : PALETTE.concrete;
    (this.scene.background as THREE.Color).set(bgHex);
    (this.scene.fog as THREE.Fog).color.set(bgHex);

    // 108 BPM gentle indie-pop pulse
    const beat = t * (108 / 60) * Math.PI * 2;

    if (set === 'table') {
      const isSlab = view === 'stone-slab';
      const isOne = view === 'stone-one';
      const isTwo = view === 'stone-two';
      this.titleCard.visible = isSlab;
      this.tableArmChain.visible = view === 'stone-four' && t >= 22.8;
      const showCount = isSlab ? 0 : isOne ? 1 : isTwo ? 2 : 4;
      for (let i = 0; i < 4; i++) {
        const ph = this.tablePhones[i]!;
        ph.visible = i < showCount;
        if (isOne) {
          ph.position.set(0, 144, -68);
        } else if (isTwo) {
          ph.position.set(i === 0 ? -56 : 56, 144, -68);
        } else {
          ph.position.set((i - 1.5) * 112, 144, -68);
        }
      }
      for (const p of this.tableProxies) {
        p.root.visible = view === 'stone-split';
        p.root.rotation.z = Math.sin(beat * 0.5 + p.phase) * 0.14;
      }
    } else if (set === 'grid12') {
      this.updateGrid12Visuals(view as StoneView, t);
    } else if (set === 'droste') {
      // Cycle studio ceramic wall color (green -> yellow -> brick) like 1:28-1:52!
      const phase = Math.floor((t - 86) / 4.2) % 3;
      const wallCol = phase === 1 ? PALETTE.yellow : phase === 2 ? PALETTE.brick : PALETTE.green;
      this.drosteWallMat.color.set(wallCol);
      const isTunnel = view === 'stone-tunnel';
      for (let i = 0; i < this.drosteFrames.length; i++) {
        const fr = this.drosteFrames[i]!;
        fr.rotation.z = isTunnel ? Math.sin(t * 1.1 + i * 0.35) * (0.18 + i * 0.08) : Math.sin(t * 0.7 + i * 0.2) * 0.04;
        const zoom = isTunnel ? 1 + 0.08 * Math.sin(t * 2.2 - i * 0.6) : 1;
        fr.scale.setScalar(zoom);
      }
    } else if (set === 'wall35') {
      this.updateWall35Visuals(view as StoneView, t);
      if (this.andyProxy.root.visible) {
        this.andyProxy.root.position.y = 10 + Math.abs(Math.sin(beat * 0.5)) * 3;
      }
    } else if (set === 'wall64') {
      const step = Math.floor(t * 3);
      const cols = [PALETTE.pink, PALETTE.yellow, PALETTE.green, PALETTE.brown, PALETTE.studioWhite];
      for (let i = 0; i < this.wall64Screens.length; i++) {
        const mat = this.wall64Screens[i]!.material as THREE.MeshBasicMaterial;
        mat.color.set(cols[(i + step) % cols.length]!);
      }
    }

    const leadFig = this.figures['stone-lead'];
    const harmFig = this.figures['stone-harmony'];
    const portrait = this.camera.aspect < 1.05;
    const harmSpeaking = speaker === 'stone-harmony' && intensity > 0.02;

    if (chosen.hideCast) {
      leadFig.root.visible = false;
      harmFig.root.visible = false;
    } else {
      const showLead = view !== 'stone-harmony';
      const showHarm =
        view === 'stone-harmony' ||
        harmSpeaking ||
        Boolean(chosen.harmAt && (!portrait || view === 'stone-hats-four' || view === 'stone-trio'));

      leadFig.root.visible = showLead;
      harmFig.root.visible = showHarm;

      const leadPos = chosen.leadAt;
      const harmPos: Point = chosen.harmAt ?? [92, 152, 12];
      leadFig.root.position.set(leadPos[0] + Math.sin(beat * 0.25) * 3, leadPos[1] + Math.abs(Math.sin(beat * 0.5)) * 2, leadPos[2]);
      leadFig.root.rotation.set(0, Math.sin(beat * 0.25) * 0.08, 0);

      harmFig.root.position.set(harmPos[0] - Math.sin(beat * 0.25) * 3, harmPos[1] + Math.abs(Math.cos(beat * 0.5)) * 2, harmPos[2]);
      harmFig.root.rotation.set(0, -0.12 - Math.sin(beat * 0.25) * 0.08, 0);

      const reachAcross = view === 'stone-two' && t >= 12.2 && t < 16.0;
      const leadLook: Wardrobe = view === 'stone-two' && t < 16.0 ? 'brown' : look;
      const harmLook: Wardrobe =
        view === 'stone-hats-four' || view === 'stone-hats12' || view === 'stone-trio'
          ? 'dan-yellow'
          : view === 'stone-droste'
          ? 'dan-green'
          : 'dan-pink';

      this.dress(leadFig, leadLook, beat, speaker === 'stone-lead' ? intensity : 0.3, t, reachAcross);
      this.dress(harmFig, harmLook, beat + 1.2, harmSpeaking ? intensity : 0.25, t, false);
    }

    // Focus camera cleanly on the active speaker in portrait or during harmony responses
    const aim = new THREE.Vector3(...chosen.aim);
    if (!chosen.hideCast) {
      const activeFig =
        view === 'stone-harmony' || (harmSpeaking && harmFig.root.visible) ? harmFig : leadFig;
      const targetPt = new THREE.Vector3(
        activeFig.root.position.x,
        activeFig.root.position.y - 4,
        activeFig.root.position.z,
      );
      if (portrait || view === 'stone-harmony' || harmSpeaking) {
        aim.lerp(targetPt, portrait ? 0.88 : 0.65);
      }
    }
    aim.x += Math.sin(t * 0.55) * 2.5;
    const dist = new THREE.Vector3(...chosen.offset);
    if (portrait && chosen.wide) dist.multiplyScalar(0.88);
    this.camera.position.copy(aim).add(dist);
    this.camera.lookAt(aim);
    this.camera.updateMatrixWorld(true);
    this.scene.updateMatrixWorld(true);

    if (leadFig.root.visible) leadFig.update(t, playing, this.camera, dt, reset);
    if (harmFig.root.visible) harmFig.update(t, playing, this.camera, dt, reset);
  }

  dispose(): void {
    for (const f of Object.values(this.figures)) f.dispose();
    for (const tex of this.textures) tex.dispose();
    this.props.dispose();
  }
}
