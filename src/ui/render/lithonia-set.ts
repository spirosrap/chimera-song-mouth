import * as THREE from 'three';
import type {lithoniaState} from '../../scene/lithonia.ts';
import {VideoProps, type VideoPoint as Point} from './videoProps.ts';

const brass = '#b19a70';
const charcoal = '#25272b';
const wood = '#615145';
const ivory = '#dad1b9';
const letters: Record<string, string[]> = {
  L: ['1000','1000','1000','1000','1111'],
  I: ['111','010','010','010','111'],
  T: ['11111','00100','00100','00100','00100'],
  H: ['1001','1001','1111','1001','1001'],
  O: ['0110','1001','1001','1001','0110'],
  N: ['1001','1101','1011','1001','1001'],
  A: ['0110','1001','1111','1001','1001'],
};

export function propGroup(parent: THREE.Object3D, position: Point = [0, 0, 0]) {
  const group = new THREE.Group();
  group.position.set(...position);
  parent.add(group);
  return group;
}

export function stageMic(p: VideoProps, parent: THREE.Object3D, position: Point, scale = 1) {
  const root = propGroup(parent, position);
  root.scale.setScalar(scale);
  p.tube(root, [0, -17, 0], [0, 5, 0], 3.2, '#2c3037');
  p.oval(root, [0, 10, 0], [5.3, 6.8, 5.3], '#9ca4a4');
  const mesh = p.ink(root);
  mesh.begin();
  for (let i = 0; i < 7; i++) {
    const y = i - 3;
    const r = Math.sqrt(1 - (y / 6.8) ** 2) * 5.5;
    p.ring(mesh, [0, 10 + y, 0], [r, 0, 0], [0, 0, r], '#414b4c', .75);
  }
  mesh.end();
  p.mesh(root, new THREE.TorusGeometry(4.1, .5, 5, 14), [0, 5, 0], '#b6af9e').rotation.x = Math.PI / 2;
  return root;
}

function shadeLamp(p: VideoProps, parent: THREE.Object3D, pos: Point) {
  const root = propGroup(parent, pos);
  p.oval(root, [0, 2, 0], [11, 2, 11], '#655745');
  p.tube(root, [0, 3, 0], [0, 32, 0], 1.8, brass);
  p.mesh(root, new THREE.CylinderGeometry(13, 17, 28, 24), [0, 36, 0], '#e9bf83');
  p.oval(root, [0, 22, 0], [16.5, 1.5, 16.5], '#ffe2a1');
  const light = new THREE.PointLight('#ffb26d', 16, 280, 2);
  light.position.set(0, 28, 0);
  root.add(light);
  return root;
}

function monitor(p: VideoProps, parent: THREE.Object3D, pos: Point, wide = 60) {
  const root = propGroup(parent, pos);
  p.box(root, wide, 46, 25, '#323231', [0, 23, 0]);
  p.box(root, wide - 7, 38, 2, '#151b1e', [0, 23, 13]);
  for (let i = 0; i < 10; i++) p.box(root, wide - 10, .6, .8, '#414248', [0, 6 + i * 3.6, 14.6]);
  for (let i = 0; i < 5; i++) p.oval(root, [(i - 2) * 6.5, 42, 14.8], [1.05, 1.05, .6], brass);
  return root;
}

function kit(p: VideoProps, room: THREE.Object3D) {
  const root = propGroup(room, [12, 0, -139]);
  p.mesh(root, new THREE.CylinderGeometry(27, 27, 42, 32), [0, 34, 10], '#2c3439').rotation.x = Math.PI / 2;
  p.oval(root, [0, 34, 32], [25, 25, 1.5], '#635d51');
  p.mesh(root, new THREE.TorusGeometry(26, 1.2, 8, 36), [0, 34, 33], brass);
  p.oval(root, [8, 28, 33.4], [8, 8, 1.6], '#231f21');
  for (const [x, y, z, r] of [[-28, 65, 5, 14], [20, 67, 9, 13], [40, 53, -11, 17], [-20, 57, -13, 15]]) {
    p.mesh(root, new THREE.CylinderGeometry(r, r, 19, 22), [x, y, z], '#474a47');
    p.mesh(root, new THREE.CylinderGeometry(r + 1, r + 1, 2.4, 20), [x, y + 10, z], ivory);
    for (const side of [-1, 1]) p.tube(root, [x + side * r, y - 8, z], [x + side * r, y + 10, z], .95, brass);
  }
  const cymbals = [[-58, 92, 2, 22], [50, 100, -23, 23], [42, 82, 20, 19]].map(([x, y, z, r]) => {
    p.tube(root, [x, 0, z], [x, y + 3, z], 1.2, '#787876');
    for (let i = 0; i < 3; i++) {
      const q = i * Math.PI * 2 / 3;
      p.tube(root, [x, 17, z], [x + 14 * Math.cos(q), 0, z + 14 * Math.sin(q)], 1, '#6a6c67');
    }
    const cymbal = propGroup(root, [x, y, z]);
    p.mesh(cymbal, new THREE.CylinderGeometry(r - 1, r, 1.9, 36), [0, 0, 0], brass);
    p.oval(cymbal, [0, 1, 0], [r * .22, 2.3, r * .22], '#c7aa79');
    return cymbal;
  });
  return {root, cymbals};
}

function keys(p: VideoProps, room: THREE.Object3D) {
  const root = propGroup(room, [-149, 0, -29]);
  p.box(root, 114, 12, 40, charcoal, [0, 71, 0]);
  p.box(root, 112, 6, 9, '#633a37', [0, 71, 21]);
  for (let i = 0; i < 25; i++) {
    p.box(root, 3.7, 2, 23, '#d5cbb2', [(i - 12) * 4.3, 78, 5]);
    if (![0, 3].includes(i % 7)) p.box(root, 2.4, 2.4, 12, '#202124', [(i - 11.5) * 4.3, 79, -1]);
  }
  for (const side of [-1, 1]) p.tube(root, [side * 46, 0, -7], [-side * 38, 65, -7], 2, '#72736d');
  const mic = stageMic(p, root, [30, 111, -30], .81);
  mic.rotation.set(-.9, 0, -.24);
  p.tube(root, [47, 2, -14], [47, 103, -14], 1.2, '#64636c');
  p.tube(root, [47, 103, -14], [30, 108, -26], 1.2, '#64636c');
  return root;
}

function stool(p: VideoProps, room: THREE.Object3D, x: number, z: number, color: string) {
  p.oval(room, [x, 35, z], [31, 9, 28], color);
  for (const s of [-1, 1]) for (const edge of [-1, 1]) {
    p.tube(room, [x + s * 18, 35, z + edge * 16], [x + s * 21, 0, z + edge * 20], 2.1, '#615046');
  }
}

export function buildLithoniaSet(p: VideoProps, scene: THREE.Scene) {
  const studio = propGroup(scene);
  const woods = propGroup(scene);
  const stage = propGroup(studio);
  const shell = propGroup(studio);
  p.box(shell, 2050, 6, 2120, '#45362c', [0, -6, -411]);
  p.box(shell, 1250, 534, 11, '#37302d', [0, 261, -398]);
  p.box(shell, 1240, 86, 7, '#473a33', [0, 42, -390]);
  for (let i = 0; i < 7; i++) {
    const x = (i - 3) * 174;
    p.box(shell, 121, 219, 4, '#624c3e', [x, 237, -388]);
    p.box(shell, 111, 207, 4, '#242830', [x, 237, -384]);
    p.box(shell, 105, 201, 2, i % 3 ? '#222228' : '#29272e', [x, 237, -381]);
    p.box(shell, 123, 4, 8, '#76614e', [x, 126, -376]);
  }
  for (const side of [-1, 1]) {
    p.tube(shell, [side * 577, 347, -372], [side * 369, 456, -175], 9, '#413835');
    p.tube(shell, [side * 366, 455, -177], [0, 514, -79], 8, '#3e3431');
  }
  const floorLines = p.ink(shell);
  floorLines.begin();
  for (let i = 0; i < 27; i++) {
    const x = (i - 13) * 39;
    p.line(floorLines, [[x, -2, -394], [x, -2, 560]], i % 4 ? '#564236' : '#655247', 1);
    const z = (i % 5) * 143 - 303;
    p.line(floorLines, [[x, -2, z], [x + 39, -2, z]], '#5d4a3f', 1);
  }
  floorLines.end();
  p.mesh(stage, new THREE.CircleGeometry(193, 56), [0, -.3, 9], '#36272b').rotation.x = -Math.PI / 2;
  const drumSet = kit(p, stage);
  const keyboard = keys(p, stage);
  monitor(p, stage, [239, 0, -165]);
  monitor(p, stage, [-244, 0, -177], 68);
  const amplifier = monitor(p, stage, [198, 0, -128], 48);
  amplifier.rotation.y = -.24;
  for (const [x, z] of [[-119, 47], [126, -42], [73, -96]]) {
    p.mesh(stage, new THREE.BoxGeometry(62, 17, 35), [x, 9, z], '#27272b').rotation.x = -.17;
  }
  const cables = p.ink(stage);
  cables.begin();
  for (let index = 0; index < 4; index++) p.line(cables, Array.from({length: 35}, (_, j) => {
    const q = j / 34;
    return [(index - 1.5) * 66 + Math.sin(q * 11 + index) * (23 + 8 * index), .55, q * 365 - 229] as Point;
  }), '#22262a', 1.5);
  cables.end();
  const stand = propGroup(studio, [31, 0, 62]);
  p.tube(stand, [0, 0, 0], [0, 127, 0], 1.7, '#656a6b');
  p.oval(stand, [0, 2, 0], [14, 2, 14], '#525353');
  const microphone = stageMic(p, stand, [0, 137, 0], 1.24);
  microphone.rotation.z = .38;
  const lamps = propGroup(studio);
  shadeLamp(p, lamps, [232, 0, -88]);
  shadeLamp(p, lamps, [-228, 0, -103]);
  const watcherLamp = shadeLamp(p, lamps, [204, 40, 68]);
  p.box(lamps, 51, 5, 46, wood, [204, 39, 68]);
  for (const side of [-1, 1]) p.tube(lamps, [204 + side * 18, 0, 70], [204 + side * 18, 41, 70], 2, wood);
  const audience = propGroup(studio);
  const listenerSeat = propGroup(audience);
  stool(p, listenerSeat, 140, 127, '#574335');
  const guestSeat = propGroup(audience);
  stool(p, guestSeat, -142, 113, '#333034');
  p.box(audience, 198, 35, 46, '#433632', [233, 17, -13]);
  for (let i = 0; i < 5; i++) {
    const x = i < 2 ? -230 - i * 57 : 214 + (i - 2) * 54;
    const z = i < 2 ? -28 - i * 17 : -33 - (i - 2) * 29;
    const coat = ['#282631','#3b373a','#484146','#332f36','#49484b'][i];
    p.oval(audience, [x, 56, z], [20, 24, 15], coat);
    p.oval(audience, [x, 93, z], [13, 16.5, 13.5], '#66524b');
    p.oval(audience, [x, 101, z - 2], [14, 12, 14], '#26262a');
    for (const side of [-1, 1]) {
      p.tube(audience, [x + side * 14, 65, z], [x + side * 24, 32, z + 10], 4.5, coat);
      p.tube(audience, [x + side * 8, 36, z], [x + side * 15, 10, z + 31], 5, coat);
    }
  }
  const stageLight = propGroup(studio, [2, 302, -58]);
  p.oval(stageLight, [0, 0, 0], [19, 15, 14], '#383137');
  p.oval(stageLight, [0, -4, 11], [9, 8, 3.5], '#fbe3cb');
  const flare = p.ink(stageLight);
  flare.begin();
  p.line(flare, [[-26, -4, 15], [26, -4, 15]], '#bb9b95', 1);
  p.line(flare, [[0, -30, 15], [0, 23, 15]], '#a18ba1', 1.35);
  flare.end();

  p.box(woods, 2230, 4, 2130, '#10252b', [0, -5, -525]);
  p.box(woods, 202, 5, 1400, '#2c3433', [0, -2, -282]);
  const trunks = propGroup(woods);
  for (let i = 0; i < 34; i++) {
    const side = i % 2 ? -1 : 1;
    const row = Math.floor(i / 6);
    const x = side * (129 + (i % 6) * 48 + Math.sin(i * 7.2) * 25);
    const z = -65 - row * 123 - (i % 3) * 32;
    const y = 200 + (i % 7) * 22;
    p.tube(trunks, [x, 0, z], [x + side * 26, y, z - 13], 6 + i % 6, i % 3 ? '#293e3d' : '#3f5050');
    for (let j = 0; j < 4; j++) {
      const bend: Point = [x + side * 17, y * (.56 + j * .08), z];
      const tip: Point = [x + (j - 1.5) * 30, y * (.85 + j * .062), z - 26 + j * 11];
      p.tube(trunks, bend, tip, 2.5 + (j % 2), '#314947');
      p.oval(trunks, tip, [27 + i % 4 * 6, 24 + j * 5, 29], ['#183a38','#1c4141','#153431','#225054'][i % 4]);
    }
    if (i < 19) p.oval(trunks, [x - side * 13, 10, z + 30], [30, 12, 28], i % 3 ? '#284447' : '#3b5144');
  }
  const streaks = p.ink(woods);
  streaks.begin();
  for (let i = 0; i < 37; i++) {
    const s = i % 2 ? -1 : 1;
    const x = s * (148 + i % 5 * 30);
    const y = 12 + i % 8 * 31;
    const z = -i * 9;
    p.line(streaks, [[x, y, z], [x + s * (14 + i % 6 * 9), y + i % 4, z - 25]], '#396465', 1.7);
  }
  streaks.end();
  const title = propGroup(woods, [0, 155, -76]);
  let cursor = -117;
  for (const char of 'LITHONIA') {
    const rows = letters[char];
    for (const [y, row] of rows.entries()) for (const [x, bit] of [...row].entries()) {
      if (bit === '1') p.box(title, 4.7, 7.6, 1, '#e5e5df', [cursor + x * 5, (2 - y) * 8, 0]);
    }
    cursor += (rows[0].length + 2) * 5;
  }

  function update(state: ReturnType<typeof lithoniaState>) {
    const {t, view, intro, chase} = state;
    studio.visible = state.room === 'studio';
    woods.visible = state.room === 'woods';
    shell.visible = !intro;
    stage.visible = !intro && view !== 'lith-reveal' && !/guest|listener|shock|reaction/.test(view);
    audience.visible = /room-wide|guest|listener|shock|reaction/.test(view);
    listenerSeat.position.x = view === 'lith-room-wide' ? 82 : 0;
    guestSeat.position.x = view === 'lith-room-wide' ? -85 : 0;
    stand.visible = intro || /reveal|wide|band|rise/.test(view);
    if (intro && view !== 'lith-microphone') {
      stand.position.set(-12, 0, 82);
      microphone.position.y = 155;
      microphone.rotation.set(-.53, 0, .19);
    } else {
      stand.position.set(intro ? 38 : view === 'lith-rise' ? 60 : 31, 0, intro ? 48 : 62);
      microphone.position.y = 137;
      microphone.rotation.set(0, 0, intro ? .55 : .31);
    }
    microphone.scale.setScalar(view === 'lith-microphone' ? 1.65 : 1.24);
    stageLight.visible = !intro && !/guest|listener|shock|reaction/.test(view);
    watcherLamp.visible = audience.visible;
    lamps.visible = !intro;
    for (const [i, cymbal] of drumSet.cymbals.entries()) cymbal.rotation.z = .025 * Math.sin(t * (13 + i * 4)) * state.rise;
    keyboard.visible = stage.visible;
    trunks.position.z = chase ? (t * 130) % 109 - 25 : 0;
    streaks.group.visible = chase;
    streaks.group.position.z = chase ? (t * 410) % 92 : 0;
    title.visible = view === 'lith-title';
  }
  return {studio, woods, stage, drumSet, keyboard, stand, microphone, lamps, audience, trunks, title, update};
}
