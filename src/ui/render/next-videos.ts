import * as THREE from 'three';
import { isShowcase, type ShowcaseView } from '../../scene/showcase-videos.ts';
import { buildShowcaseSet, SHOWCASE_FIGURES, SHOWCASE_WARDROBE } from './showcase-videos.ts';
import { isLaterVideo, type LaterVideoView } from '../../scene/later-videos.ts';
import { buildLaterVideoSet, LATER_VIDEO_FIGURES, LATER_VIDEO_WARDROBE } from './later-videos.ts';
import { isSevenVideo, type SevenVideoView } from '../../scene/seven-videos.ts';
import { buildSevenVideoSet, SEVEN_VIDEO_FIGURES, SEVEN_VIDEO_WARDROBE } from './seven-videos.ts';
import { NEXT_VIDEO_CAST, NEXT_VIDEO_INFO, type NextVideoSetting, type NextVideoView } from '../../scene/next-videos.ts';
import type { CameraView, CharacterId } from '../../scene/scene.ts';
import type { TeleTrack } from '../../show/tele.ts';
import type { VoiceModel } from '../analysis.ts';
import { VideoFigure, VideoProps, type VideoPoint as Point } from './videoProps.ts';

type Actor = { id: CharacterId; model: VoiceModel; track: TeleTrack };
type Set = { root: THREE.Group; background: string; features: THREE.Object3D[]; animate?: (time: number) => void };
type CastMember = { figure: VideoFigure; jacket: THREE.MeshBasicMaterial; base: string; pinky?: THREE.Mesh };
const range = (count: number) => Array.from({ length: count }, (_, i) => i);
const color = (colors: readonly string[], index: number) => colors[index % colors.length];
const random = (index: number) => Math.sin(index * 12.727 + 9.73) * .5 + .5;
const wardrobe: Record<NextVideoSetting, { jackets: string[]; hair: string[] }> = {
  ...SEVEN_VIDEO_WARDROBE,
  ...LATER_VIDEO_WARDROBE,
  ...SHOWCASE_WARDROBE,
  jamieoliver: { jackets: ['#efe5d1', '#3bb8b3', '#66c5c1'], hair: ['#9c402a', '#e5bc7d'] },
  barabastu: { jackets: ['#522c37', '#3c2c3a', '#5e5940', '#eee7d4'], hair: ['#493b32', '#916146', '#8c6b4f'] },
  anotrlikeit: { jackets: ['#4e252d', '#e8daca', '#f1dfd8', '#442f61'], hair: ['#403021', '#b69a85'] },
  pinkyup: { jackets: ['#eea5c8', '#7e90c0', '#e2c77c', '#9e83c4', '#87c4ac'], hair: ['#583031', '#2b2835', '#d49161', '#975344', '#322d3d'] },
  simzyoung: { jackets: ['#953b50', '#d2c34b', '#373640', '#605b69'], hair: ['#dfdce1', '#3b2832'] },
  manmadeofmeat: { jackets: ['#9a6e5d', '#3a515e', '#574776', '#463742'], hair: ['#7c4f3d', '#1a2a36', '#524036'] },
};
const settings: Record<NextVideoSetting, number> = {
  ...SEVEN_VIDEO_FIGURES,
  ...LATER_VIDEO_FIGURES,
  ...SHOWCASE_FIGURES,
  jamieoliver: 3, barabastu: 5, anotrlikeit: 4, pinkyup: 5, simzyoung: 4, manmadeofmeat: 5,
};

/** Source-clock staging with separate scenery and foreground performers. */
export class NextVideoStage {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(37, 1, 1, 2200);
  readonly figures: CastMember[];
  private readonly props = new VideoProps();
  private readonly sets = new Map<NextVideoView, Set>();
  private readonly background = new THREE.Color();
  private previousTime = -1;
  private previousEpoch = -1;
  private previousView?: NextVideoView;

  constructor(readonly setting: NextVideoSetting, actors: Actor[]) {
    this.scene.background = this.background;
    const { jackets, hair } = wardrobe[setting];
    const cast: readonly CharacterId[] = NEXT_VIDEO_CAST[setting];
    const voices = cast.map(id => {
      const actor = actors.find(person => person.id === id);
      if (!actor) throw new Error('Missing scene performer ' + id);
      return actor;
    });
    this.figures = range(settings[setting]).map(i => {
      const actor = voices[i] ?? voices[0];
      const base = color(jackets, i);
      const figure = new VideoFigure(actor.model, actor.track, this.props, this.scene, base);
      const ink = figure.hair;
      ink.begin();
      for (let strand = 0; strand < 23; strand++) {
        const angle = strand * .254;
        const curve = range(10).map(j => {
          const sweep = 2.38 - j * .25;
          return [
            10.8 * Math.cos(angle) * Math.sin(sweep),
            10.6 * Math.cos(sweep) + 5.1,
            10 * Math.sin(angle) * Math.sin(sweep) - 2.0,
          ] as Point;
        });
        this.props.line(ink, curve, color(hair, i), setting === 'simzyoung' && !i ? 1.55 : 1.05);
      }
      ink.end();
      // Wide collars and seams stay below the physical head.
      this.props.tube(figure.root, [-15, -15, 9], [0, -35, 12], 1.45, '#e9d7bd');
      this.props.tube(figure.root, [15, -15, 9], [0, -35, 12], 1.45, '#e9d7bd');
      if (setting === 'jamieoliver' && !i) {
        for (const side of [-1, 1]) for (const j of range(11)) {
          const plume = this.props.oval(figure.root, [side * (15 + 1.8 * (j % 6)), -16 - Math.floor(j / 6) * 7, 3],
            [2.5, 8 + 2 * random(j), 2.2], color(['#f8efd9', '#ded2bd', '#fff8ed'], j));
          plume.rotation.z = -.55 * side;
        }
      }
      if (setting === 'barabastu' && i === 2) {
        this.props.box(figure.root, 31, 22, 8, '#2e1e29', [0, -44, 17]);
        for (const j of range(13)) this.props.box(figure.root, 1.4, 19, 1, '#d5bb8a', [-13 + 2.1*j, -44, 21.5]);
      }
      if (setting === 'simzyoung' && !i) {
        this.props.oval(figure.root, [-6, -51, 22], [15, 20, 4.6], '#33877c');
        this.props.tube(figure.root, [0, -51, 25], [30, -21, 26], 2.7, '#432c39');
        for (const j of range(4)) this.props.tube(figure.root, [j - 2, -55, 27], [28 + j, -22, 29], .19, '#f9ce93');
      }
      if (setting === 'animalflow' && i > 0) {
        const fur = i % 2 ? '#ded7bf' : '#443737';
        for (const side of [-1, 1]) {
          const ear = this.props.oval(figure.root, [side * 11.5, 13, 1], [3, 6, 2.6], fur);
          ear.rotation.z = -side * .4;
        }
        this.props.oval(figure.root, [0, .5, 10.5], [6, 4, 3.6], i % 2 ? '#ae8a81' : '#66584f');
      }
      if (setting === 'mitskinobody' && i === 0) {
        for (let dot=0; dot<15; dot++) {
          this.props.oval(figure.root, [(dot%3-1)*7.6+(Math.floor(dot/3)%2)*3,-24-Math.floor(dot/3)*8,11], [1.2,1.25,.6], '#ceb7a2');
        }
      }
      if (setting === 'grimesoblivion' && i === 0) {
        for (const side of [-1,1]) this.props.oval(figure.root,[side*10.7,1,1],[3.3,6.9,4.3],'#84788b');
        this.props.tube(figure.root,[-10.5,7,0],[0,14,0],1.05,'#817288');
        this.props.tube(figure.root,[0,14,0],[10.5,7,0],1.05,'#817288');
      }
      if (setting === 'justicedance') {
        const colors=['#b97199','#8eb9af','#d7b079','#a19bc0'];
        for (let index=0;index<colors.length;index++) {
          const block=this.props.box(figure.root,18-index*2,3.1,1.2,colors[(index+i)%colors.length],
            [0,-25-index*5.5,10.9]);
          block.rotation.z=.16;
        }
      }
      if (setting === 'intergalactic') {
        const color='#b8a479';
        this.props.box(figure.root,17,4.4,13,color,[0,10.2,2.4]);
        this.props.box(figure.root,12,1.45,7.7,color,[0,8.3,9.6]);
      }
      if (setting === 'virtualinsanity' && i === 0) {
        this.props.oval(figure.root, [0, 14, 1], [13, 6, 12], '#312d36');
        this.props.oval(figure.root, [0, 10.5, 4], [15, 1.7, 13], '#3b353d');
      }
      if (setting === 'auroracure' && i > 0) {
        const mask = '#c5b99b';
        this.props.oval(figure.root, [0,6,10], [9,4.8,2.2], mask);
        for(const side of [-1,1]) {
          this.props.oval(figure.root, [side*4.1,6.4,12], [1.8,1.4,.65], '#453c42');
        }
      }
      if (setting === 'roisinover' && i === 0) {
        for (const side of [-1,1]) for (let arc=0;arc<6;arc++) {
          this.props.oval(figure.root, [side*(17+arc*.65),-18-arc*6,3], [7+arc*1.55,4.2,5.3],
            arc%2?'#54505d':'#d1c8ba');
        }
      }
      if (setting === 'robynfriend') {
        for (const [j,tone] of ['#d6a080','#bc8275','#d2bf9b','#658f9e'].entries()) {
          this.props.box(figure.root, 23, 4.2, 1.4, tone, [0,-28-j*7,10.6]);
        }
      }
      const pinky = setting === 'pinkyup' ? this.props.oval(figure.root, [0, 0, 0], [1.05, 3.2, 1.1], '#d6bdad') : undefined;
      return { figure, base, jacket: figure.torso.material as THREE.MeshBasicMaterial, pinky };
    });
    for (const [, view] of NEXT_VIDEO_INFO[setting].shots) if (!this.sets.has(view)) this.sets.set(view, this.build(view));
  }

  private build(view: NextVideoView): Set {
    if (isShowcase(this.setting)) {
      const scenery = buildShowcaseSet(this.props, this.setting, view as ShowcaseView);
      scenery.root.visible = false;
      this.scene.add(scenery.root);
      return scenery;
    }
    if (isLaterVideo(this.setting)) {
      const scenery = buildLaterVideoSet(this.props, this.setting, view as LaterVideoView);
      scenery.root.visible = false;
      this.scene.add(scenery.root);
      return scenery;
    }
    if (isSevenVideo(this.setting)) {
      const scenery = buildSevenVideoSet(this.props, this.setting, view as SevenVideoView);
      scenery.root.visible = false;
      this.scene.add(scenery.root);
      return scenery;
    }
    const root = new THREE.Group();
    const features: THREE.Object3D[] = [];
    const p = this.props;
    const box = (w: number, h: number, d: number, x: number, y: number, z: number, shade: string) =>
      p.box(root, w, h, d, shade, [x, y, z]);
    const lamp = (x: number, y: number, z: number, shade: string, radius = 7) => {
      p.oval(root, [x, y, z - 2], [radius * 1.3, radius * 1.3, 3.8], '#24202b');
      return p.oval(root, [x, y, z], [radius, radius, 5], shade);
    };
    const floor = (shade: string) => box(2000, 1, 1900, 0, -1, -350, shade);
    const frame = (x: number, y: number, w: number, h: number, shade: string) => {
      box(w + 8, h + 8, 9, x, y, -209, '#30242e');
      box(w, h, 1, x, y, -204, shade);
    };
    const backdrop = (shade: string) => box(1500, 410, 3, 0, 203, -270, shade);
    let background: string;
    if (this.setting === 'jamieoliver') {
      const kitchen = view === 'petrol-kitchen' || view === 'petrol-service';
      background = kitchen ? '#253c40' : '#102938';
      floor(kitchen ? '#3b4944' : '#183a60');
      backdrop(kitchen ? '#305753' : '#075569');
      if (kitchen) {
        for (const j of range(19)) {
          box(29, 110, 2, (j - 9) * 33, 118, -265, color(['#2f5a5a', '#416765', '#345f5d'], j));
          box(29, 29, 4, (j - 9) * 33, 207, -264, '#597677');
        }
        box(470, 13, 56, 0, 91, -143, '#929a91');
        box(470, 58, 47, 0, 55, -146, '#29454b');
        for (const j of range(11)) {
          const x = (j - 5) * 39;
          p.oval(root, [x, 105, -145], [15, 8 + j % 3 * 3, 12], color(['#666b6b', '#e0d2ad', '#1d262b'], j));
          box(21, 2, 3, x, 71, -119, '#899e9d');
        }
        frame(114, 193, 73, 49, '#172c36');
        for (const j of range(6)) box(58 - j % 3 * 13, 2, 1, 111, 210 - j * 6, -203, '#a9decb');
      } else {
        for (const j of range(28)) box(17, 360, 12, (j - 13.5) * 21, 160, -245 + 6 * random(j),
          color(['#11617b', '#164d66', '#0a3a55', '#267281'], j));
        for (const j of range(3)) box(270 - j * 34, 12, 85, 0, 4 + j * 12, -126 - j * 14, color(['#1a427a', '#325b93', '#4d75a5'], j));
        for (const j of range(24)) {
          const angle = j * Math.PI / 12;
          p.tube(root, [0, 197, -228], [Math.cos(angle) * (85 + j % 2 * 40), 197 + Math.sin(angle) * 95, -226],
            j % 2 ? .7 : 1.6, color(['#b88640', '#e8c473', '#825633'], j));
        }
        lamp(0, 197, -221, '#ffe4a6', 24);
        if (view === 'petrol-drums') for (const j of range(6)) {
          const x = (j - 2.5) * 37;
          p.oval(root, [x, 42 + j % 2 * 22, -84], [18, 18, 15], '#bf7a68');
          p.oval(root, [x, 45 + j % 2 * 22, -68], [16, 16, 2], '#e1cdb2');
          p.tube(root, [x, 0, -91], [x, 90, -91], .9, '#aaa797');
          p.oval(root, [x, 89, -91], [18, 2, 13], '#ba9546');
        }
      }
    } else if (this.setting === 'barabastu') {
      const forest = view === 'bastu-campfire' || view === 'bastu-opening';
      const hot = view === 'bastu-steam' || view === 'bastu-choir';
      background = forest ? '#221325' : hot ? '#46252d' : '#181c4b';
      floor(forest ? '#24202a' : '#49323a');
      backdrop(background);
      if (forest) {
        for (const j of range(17)) {
          const x = (j - 8) * 43;
          for (const k of range(4)) p.mesh(root, new THREE.ConeGeometry(27 - k * 4, 53 + j % 3 * 6, 7),
            [x + random(j) * 11, 40 + 29 * k + random(j) * 42, -220 + j % 3 * 23], color(['#193731', '#244b40', '#30514a'], j));
        }
        for (const j of range(13)) {
          const angle = j * 2 * Math.PI / 13;
          p.oval(root, [-62 + 32 * Math.cos(angle), 4, -53 + 24 * Math.sin(angle)], [9, 5, 8], '#65524f');
          features.push(p.mesh(root, new THREE.ConeGeometry(4 + j % 3, 17 + j % 4 * 7, 5),
            [-68 + j % 6 * 3, 13, -50 + Math.sin(angle) * 11], color(['#f78c42', '#ffcc6b', '#b74745'], j)));
        }
      } else {
        for (const j of range(28)) {
          box(410, 7, 4, 0, j * 9 + 5, -242, color(['#794b41', '#a97654', '#8a5641', '#542e32'], j));
        }
        box(436, 10, 12, 0, 254, -236, '#d4976f');
        for (const x of [-225, 225]) box(12, 265, 15, x, 127, -237, '#742f39');
        for (const j of range(11)) {
          const x = (j - 5) * 48;
          const tone = hot ? color(['#f3a34f', '#eb6857', '#ffe7a4'],j) : color(['#56c6fd', '#a18efc', '#f070b9'],j);
          lamp(x, 232, -230, tone, 4.3);
          if (!hot) features.push(p.tube(root, [x, 226, -227], [x * 2.9, 38, -221], .85, tone));
        }
        if (hot) for (const j of range(16)) {
          const puff = p.oval(root, [(j - 8) * 17, 40 + j % 7 * 23, -166], [17, 12, 5], '#efb49d');
          (puff.material as THREE.MeshBasicMaterial).setValues({transparent: true, opacity: .13, depthWrite: false});
          features.push(puff);
        }
      }
    } else if (this.setting === 'anotrlikeit') {
      const hall = view === 'likeit-hall';
      const blue = view === 'likeit-dance' || view === 'likeit-smoke';
      background = hall ? '#401726' : blue ? '#25254d' : '#341a45';
      floor(blue ? '#302f58' : '#502231');
      backdrop(background);
      for (const j of range(12)) {
        const x = (j - 5.5) * 47;
        box(42, 222, 4, x, 118, -229, color(blue ? ['#3d437a', '#282f58', '#634b80'] : ['#622240', '#4d203d', '#93484f'], j));
        box(1.4, 223, 4, x - 21, 118, -226, blue ? '#6282d0' : '#cf7687');
        features.push(lamp(x, 243 - j % 3 * 15, -218, color(blue ? ['#92bbff', '#dfacff'] : ['#f8819b', '#faad91'], j), hall ? 3 : 5));
      }
      if (hall) for (const j of range(5)) {
        const z = -235 + j * 23;
        const x = 196 + j * 28;
        for (const side of [-1, 1]) box(5, 211, 6, side * x, 105, z, '#a4596c');
        box(x * 2, 5, 6, 0, 209, z, '#a4596c');
      } else {
        p.oval(root, [0, 230, -135], [21, 21, 21], '#bd8ab4');
        for (const j of range(48)) {
          const angle = j * 2.398;
          const y = (j / 48 - .5) * 38;
          const radius = Math.sqrt(21 ** 2 - y ** 2);
          box(3, 3, 3, Math.cos(angle) * radius, 230 + y, -135 + Math.sin(angle) * radius,
            color(['#f4ccf7', '#7eb8db', '#eda1cd', '#a374b7'], j));
        }
      }
    } else if (this.setting === 'pinkyup') {
      const jade = view === 'pinky-swans' || view === 'pinky-claw';
      const tea = view === 'pinky-tea';
      background = jade ? '#234940' : tea ? '#775a77' : '#4c344d';
      floor(jade ? '#457461' : tea ? '#896b82' : '#60556d');
      backdrop(background);
      for (const j of range(104)) {
        const x = (j % 13 - 6) * 46;
        const y = Math.floor(j / 13) * 29 + 13;
        box(44, 27, 1, x, y, -248,
          color(jade ? ['#507563', '#4a6a5c', '#577a65'] : ['#6a4566', '#624260', '#78536f'], Math.round(random(j) * 12)));
      }
      const shades = ['#b78886', '#ecb3a6', '#dcc29d', '#aac2b4', '#d18aab'];
      if (view === 'pinky-toys' || view === 'pinky-car' || view === 'pinky-claw') {
        const claw = view === 'pinky-claw';
        for (const j of range(32)) {
          const x = (j % 9 - 4) * 31 + random(j) * 11;
          const y = 22 + Math.floor(j / 9) * 24 + random(j) * 12;
          const z = -118 - j % 3 * 19;
          const shade = color(shades, j);
          p.oval(root, [x, y, z], [15, 17, 12], shade);
          p.oval(root, [x, y + 16, z + 3], [11, 11, 8], shade);
          for (const side of [-1, 1]) {
            p.oval(root, [x + side * 8, y + 24, z + 2], [4, 5, 3], shade);
            p.oval(root, [x + side * 4, y + 18, z + 10], [1.5, 1.5, 1.4], '#493947');
          }
        }
        if (claw) {
          for (const x of [-157, 157]) box(7, 194, 6, x, 102, -111, '#a1dbba');
          for (const y of [10, 194]) box(316, 8, 6, 0, y, -111, '#a1dbba');
          for (const side of [-1, 1]) p.tube(root, [0, 182, -122], [side * 23, 154, -121], 3, '#caddda');
          features.push(p.tube(root, [0, 189, -123], [0, 151, -123], 1.8, '#edcfdf'));
        }
        if (view === 'pinky-car') {
          box(290, 31, 71, 0, 35, -97, '#a92c44');
          box(263, 8, 12, 0, 29, -58, '#dc8d9a');
          for (const x of [-94, 94]) p.oval(root, [x, 18, -58], [23, 23, 7], '#352534');
        }
      } else if (tea) {
        p.oval(root, [0, 76, -103], [116, 7, 46], '#d9a6b7');
        for (const x of [-83, 83]) p.tube(root, [x, 1, -116], [x, 75, -116], 4.5, '#986b87');
        for (const j of range(5)) {
          p.oval(root, [(j - 2) * 32, 85, -97], [9, 5, 7], '#f2dfd6');
          p.oval(root, [(j - 2) * 32, 91, -95], [5, 7, 4], '#f7e8e0');
        }
      } else if (jade) {
        for (const [i, x] of [-132, -85, 86, 143].entries()) {
          const z = -115 - i % 2 * 17;
          p.oval(root, [x, 22, z], [28, 12, 14], '#f1e9d9');
          p.tube(root, [x + 13, 24, z], [x + 22, 52, z], 5, '#eee5d6');
          p.oval(root, [x + 18, 52, z + 2], [7, 6, 5], '#f7e7d9');
          p.oval(root, [x + 24, 50, z + 4], [6, 2, 3], '#e6a679');
        }
      } else for (const j of range(21)) features.push(lamp((j % 11 - 5) * 48, j < 11 ? 210 : 140, -207,
        color(['#fdcbdc', '#c2abd8', '#ece1c2'], j), view === 'pinky-dust' ? 2 : 4));
    } else if (this.setting === 'simzyoung') {
      const street = view === 'young-street' || view === 'young-chase';
      const pub = view === 'young-pub' || view === 'young-stage';
      background = street ? '#6f777e' : pub ? '#4e2c35' : '#65516b';
      floor(street ? '#4c4b58' : pub ? '#58353d' : '#62506a');
      backdrop(street ? '#8c7773' : pub ? '#6e3d3a' : '#786576');
      if (street) {
        for (const j of range(100)) box(33, 12, 2, (j % 20 - 10) * 35 + Math.floor(j / 20) % 2 * 17, 19 + Math.floor(j / 20) * 15, -232,
          color(['#967669', '#9a7268', '#80695f', '#825f61'], j));
        for (const x of [-163, -57, 64, 167]) frame(x, 137, 57, 87, '#4c6470');
        for (const x of [-240, 240]) {
          p.tube(root, [x, 0, -114], [x, 217, -114], 3.4, '#242b34');
          lamp(x, 216, -107, '#c7d8c6', 9);
        }
      } else if (pub) {
        for (const j of range(15)) box(4, 170, 2, (j - 7) * 38, 82, -213, '#3c2530');
        box(440, 11, 66, 0, 74, -132, '#b27456');
        for (const j of range(24)) p.tube(root, [(j - 11.5) * 17, 80, -142], [(j - 11.5) * 17, 94 + j % 5 * 3, -141],
          3.2, color(['#8b985f', '#c79066', '#e6ad66', '#c1a389'], j));
        for (const j of range(9)) features.push(lamp((j - 4) * 61, 191, -205, color(['#e9a773', '#d19078', '#ffcb81'], j)));
        if (view === 'young-stage') {
          p.tube(root, [-29, 0, -33], [-29, 132, -33], 1.4, '#302737');
          p.oval(root, [-29, 132, -30], [4, 7, 5], '#bda79b');
        }
      } else {
        const x = view === 'young-window' ? 0 : 108;
        frame(x, 150, 114, 109, '#797d9a');
        for (const dx of [-57, 0, 57]) box(3, 110, 3, x + dx, 150, -202, '#d3b8a0');
        box(115, 3, 5, x, 149, -199, '#d3b8a0');
        box(232, 32, 60, -86, 19, -103, '#9b7990');
        box(227, 41, 13, -86, 51, -127, '#846685');
        for (const j of range(5)) frame(-215 + 25 * j, 193 + 15 * (j % 2), 17, 24, color(['#c7a5a3', '#6e6679', '#4a4c61'], j));
      }
    } else {
      const blue = view === 'meat-blue-room';
      const party = view === 'meat-party';
      background = blue ? '#20365b' : party ? '#613d4d' : '#717c86';
      floor(blue ? '#38517b' : party ? '#6d515f' : '#8e8c88');
      backdrop(blue ? '#345688' : party ? '#6b4959' : '#a7aeb0');
      for (const x of [-154, 0, 154]) frame(x, 139, x ? 86 : 119, x ? 95 : 134, '#c8b5a8');
      for (const j of range(33)) {
        const angle = j * .72;
        const radius = 18 + 1.13 * j;
        p.oval(root, [radius * Math.cos(angle), 135 + .9 * radius * Math.sin(angle), -198 - j % 6 * 1.6],
          [7 + j % 5, 8 + j % 3, 4.1], color(['#874d57', '#c57470', '#b28388', '#d1a49b', '#683e54'], j));
      }
      for (const j of range(9)) features.push(lamp((j - 4) * 49, 231, -205, party ? '#e5a09d' : blue ? '#7fbbff' : '#fff0d7', 4));
      if (view === 'meat-auction' || view === 'meat-critics') for (const [i, x] of [-153, -87, 87, 154].entries()) {
        p.tube(root, [x, 33, -71], [x, 103 + i % 2 * 12, -73], 2, '#7b514c');
        p.oval(root, [x, 113 + i % 2 * 12, -73], [13, 16, 2], '#eadccf');
        for (const j of range(i + 1)) box(1.5, 7, 1, x - 3 + j * 3, 113 + i % 2 * 12, -70, '#312733');
      }
      if (view === 'meat-trampoline') {
        p.oval(root, [0, 15, -65], [107, 5, 78], '#303447');
        p.oval(root, [0, 17, -65], [101, 5, 70], '#464a55');
        for (const j of range(13)) p.tube(root,
          [104 * Math.cos(j * .5), 15, -65 + 75 * Math.sin(j * .5)],
          [103 * Math.cos(j * .5), 2, -65 + 75 * Math.sin(j * .5)], 2, '#a7a3a7');
      }
      if (blue) {
        for (const x of [-119, 119]) box(3, 223, 3, x, 111, -93, '#8ebdf1');
        for (const y of [2, 221]) box(237, 3, 3, 0, y, -93, '#8ebdf1');
      }
    }
    root.visible = false;
    this.scene.add(root);
    return { root, background, features };
  }

  resize(width: number, height: number) {
    this.camera.aspect = width / Math.max(1, height);
    this.props.resize(width, height);
  }

  frame(time: number, playing: boolean, epoch: number, view: CameraView, intensity: number, speaker?: CharacterId) {
    const shots = NEXT_VIDEO_INFO[this.setting].shots;
    const sourceView = shots.filter(([start]) => start <= time).at(-1)?.[1] ?? shots[0][1];
    const stageView = this.sets.has(view as NextVideoView) ? view as NextVideoView : sourceView;
    if (this.previousView !== stageView) {
      if (this.previousView) this.sets.get(this.previousView)!.root.visible = false;
      this.sets.get(stageView)!.root.visible = true;
      this.background.set(this.sets.get(stageView)!.background);
      this.previousView = stageView;
    }

    const cast: readonly CharacterId[] = NEXT_VIDEO_CAST[this.setting];
    const designated = cast.indexOf(view as CharacterId);
    const active = Math.max(0, designated >= 0 ? designated : cast.indexOf(speaker as CharacterId));
    const reset = epoch !== this.previousEpoch || time < this.previousTime || time - this.previousTime > .22;
    const dt = reset ? 1 / 60 : THREE.MathUtils.clamp(time - this.previousTime, 1 / 120, .05);
    const beat = Math.PI * 2 * (time * NEXT_VIDEO_INFO[this.setting].bpm / 60);
    const tight = designated >= 0 || /close|portrait|window|canvas/.test(stageView);
    const group = /dance|choir|party|revu|finale|pub|auction|chase|ensemble|rehearsal|club|runway|taxes-crowd|witness-line|witness-wheels|witness-desks|witness-conference|rope-band|look-white-stage|sweet-office|sweet-car|sweet-ufo|tessellate-steps|tessellate-table|water-tv|time-meeting|genghis-house|silk-porch|silk-room|oblivion-bleachers|toxic-cabin|shack-front|bricks-duo|bricks-drums|take-band|artistes-parade|justice-shirts|justice-crossing|intergalactic-trio|treads-crossing|treads-line|treads-pairs/.test(stageView);
    const seated = /campfire|tea|flat/.test(stageView);
    const ensemble = this.setting === 'virtualinsanity' ? stageView === 'virtual-white-ensemble' : group;
    const core = this.figures.length;
    const slide = this.setting==='virtualinsanity' && !tight ? 13*Math.sin(time*.67) : 0;
    for (const [i, member] of this.figures.entries()) {
      const { figure, jacket, base } = member;
      const slot = (i - active + core) % core;
      const side = slot % 2 ? -1 : 1;
      const offset = slot ? side * (44 + Math.floor((slot - 1) / 2) * 41) : 0;
      const phase = beat + i * .52;
      const bounce = group ? 3.8 : 1.45;
      const flying = stageView === 'doritos-flight' ? 22 + 17 * Math.sin(time * .72 + slot * .8) : 0;
      const emphasis = i === active ? Math.min(1, intensity) : .16;
      const leap = stageView === 'meat-trampoline' ? 22 * Math.max(0, Math.sin(phase * .5)) : 0;
      figure.root.visible = i === active || (!tight && (i < cast.length || ensemble || /kitchen|service|steam/.test(stageView)));
      const beltTravel=this.setting==='treadmills' && group && !tight ? 14*Math.sin(time*1.27+slot*1.7) : 0;
      figure.root.position.set(slide + offset + Math.sin(phase * .5) * 2, (seated ? 127 : 153) + bounce * Math.cos(phase) + leap + flying,
        (slot ? -37 - 14 * Math.floor((slot - 1) / 2) : 13) + beltTravel);
      figure.root.rotation.set(.015 * Math.sin(phase), side * Math.min(.095, Math.abs(offset) * .001) + .042 * Math.sin(phase * .5),
        .039 * Math.sin(phase * .5));
      const pinky = this.setting === 'pinkyup' && (group || stageView === 'pinky-tea');
      const raised = pinky ? -1 - 9 * Math.cos(phase * .5) : -51 + 13 * Math.sin(phase) + 17 * emphasis;
      figure.pose(time, [
        [-28, -38 + 7 * Math.sin(phase), 9], [-25 - emphasis * 9, -62 + 17 * Math.sin(phase * .5), 17],
        [30, -32 + 8 * Math.sin(phase + .4), 10], [34 + 5 * Math.sin(phase * .5), raised, 20],
      ], seated);
      if ((isLaterVideo(this.setting) || isShowcase(this.setting)) && group && !tight) {
        for (const [sideIndex, direction] of [-1, 1].entries()) {
          const stride = Math.sin(phase + sideIndex * Math.PI);
          const knee: Point = [direction * (14 + 4 * stride), -103 + 4 * Math.max(0,stride), 6 * stride];
          const foot: Point = [direction * (18 + 7 * stride), -146 + 9 * Math.max(0,stride), 11 * stride];
          this.props.segment(figure.legs[2 * sideIndex], [direction * 10, -70, 0], knee, 7);
          this.props.segment(figure.legs[2 * sideIndex + 1], knee, foot, 5);
          figure.feet[sideIndex].position.set(...foot);
        }
      }
      if (member.pinky) {
        member.pinky.visible = pinky;
        member.pinky.position.copy(figure.hands[1].position).add(new THREE.Vector3(2.5, 7, 0));
        member.pinky.rotation.z = -.34;
      }
      figure.head.scene.rotation.y += .18 + .08 * Math.sin(phase * .5);
      jacket.color.set(this.setting === 'jamieoliver' && i === 1 && /kitchen|service|drums/.test(stageView) ? '#dfd6c3'
        : this.setting === 'barabastu' && i >= 3 ? '#eee7d4'
        : this.setting === 'anotrlikeit' && stageView === 'likeit-dance' && i === active ? '#d5b861'
        : this.setting === 'simzyoung' && i === active && /flat|window/.test(stageView) ? '#765885' : base);
    }
    const narrow = this.camera.aspect < 1.05;
    this.camera.fov = tight ? (narrow ? 42 : 33) : (narrow ? 52 : 39);
    const cameraSide = tight ? -13 : group ? 14 : -24;
    this.camera.position.set(cameraSide + 9 * Math.sin(time * .31), tight ? 159 : 160, tight ? 154 : narrow ? 352 : 327);
    this.camera.lookAt(0, tight ? 134 : seated ? 104 : 111, 0);
    this.camera.updateProjectionMatrix();
    this.camera.updateMatrixWorld();
    for (const [i, {figure}] of this.figures.entries()) {
      if (figure.root.visible) figure.update(i < cast.length ? time : 0, playing && i < cast.length, this.camera, dt, reset);
    }
    const scenery=this.sets.get(stageView)!;
    scenery.animate?.(time);
    for (const [i, feature] of scenery.features.entries()) {
      const pulse = Math.sin(.63 * beat + i * .71);
      const opacity = (feature as THREE.Mesh).material as THREE.MeshBasicMaterial;
      if (opacity.transparent) opacity.opacity = .1 + .07 * pulse;
      else feature.rotation.z = .057 * pulse;
    }
    this.previousEpoch = epoch;
    this.previousTime = time;
  }

  dispose() {
    for (const {figure} of this.figures) figure.dispose();
    this.props.dispose();
    this.scene.clear();
  }
}
