import * as THREE from 'three';
import { isBtsTwoInsert, type BtsTwoView } from '../../scene/bts-2-point-0.ts';
import { VideoFigure, VideoProps, type VideoPoint } from './videoProps.ts';

export const BTS_TWO_WARDROBE = {
  jackets: ['#29302f', '#202729', '#333b3a', '#283337', '#25282a', '#46504a', '#252826'],
  hair: ['#485354', '#505751', '#556365', '#373f44', '#501e23', '#a19676', '#333843'],
};

const laterJackets = ['#526b6e', '#725744', '#353d36', '#3a3d31', '#913c3b', '#626c69', '#454f54'];
const jacketAccents = ['#a7bfba', '#cfbc92', '#a0a99a', '#c6ceac', '#d89c90', '#c5c9b6', '#b9c5c9'];

function triangle(props: VideoProps, root: THREE.Object3D, corners: [VideoPoint, VideoPoint, VideoPoint], color: string) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(corners.flat(), 3));
  geometry.computeVertexNormals();
  return props.mesh(root, geometry, [0, 0, 0], color);
}

export function dressBtsTwo(props: VideoProps, figure: VideoFigure, index: number) {
  const root = figure.root;
  const accent = jacketAccents[index];
  const lapel = index === 5 ? '#69736d' : '#586462';
  const shirt = index === 4 ? '#813c43' : '#c3cdc5';
  for (const side of [-1, 1]) {
    triangle(props, root, [[side * 14, -8, 8.7], [side * 3, -12, 12.2], [0, -42, 13.4]], shirt);
    triangle(props, root, [[side * 18, -13, 9], [side * 7, -18, 12.8], [0, -47, 12]], lapel);
    props.tube(root, [side * 10, -10, 11], [side * 5, -20, 13.1], .6, accent);
    props.box(root, 7, 1, 1, '#71837d', [side * 11, -40, 9.9]);
  }
  triangle(props, root, [[-2.1, -18, 13.9], [2.1, -18, 13.9], [0, -46, 14]], '#212529');
  for (let i = 0; i < 3; i++) {
    props.oval(root, [0, -49 - i * 6.5, 11.25], [.8, .8, .55], '#82908a');
  }
  if (index === 1 || index === 3 || index === 5) {
    for (const side of [-1, 1]) {
      props.box(root, 6.5, 3.1, 1.1, '#242e2e', [side * 4.4, 5.2, 9.9]);
      props.box(root, 6.2, .55, 1.2, accent, [side * 4.4, 6.5, 10]);
    }
    props.tube(root, [-1.8, 5.9, 10], [1.8, 5.9, 10], .34, accent);
  }
  // The rims pick out dark clothes while keeping the anatomical wireframe legible.
  for (const mesh of [figure.torso, ...figure.arms, ...figure.legs, ...figure.feet]) {
    const material = mesh.material as THREE.MeshBasicMaterial;
    material.onBeforeCompile = shader => {
      const varying = 'varying vec3 suitNormal;\n';
      shader.vertexShader = varying + shader.vertexShader.replace('#include <begin_vertex>',
        '#include <begin_vertex>\n suitNormal = normalize(normalMatrix * normal);');
      shader.fragmentShader = varying + shader.fragmentShader.replace('#include <color_fragment>', `
        #include <color_fragment>
        vec3 n = normalize(suitNormal);
        float edge = pow(1. - abs(n.z), 2.);
        float key = max(0., dot(n, vec3(-.33,.72,.61)));
        diffuseColor.rgb = diffuseColor.rgb * (.60 + .50 * key) + vec3(.09,.14,.14) * (.26 * edge);
      `);
    };
  }
}

const wideViews = new Set<BtsTwoView>([
  'bts-lift-indicator', 'bts-lift-ensemble', 'bts-entrance', 'bts-side-ensemble', 'bts-side-tracking',
  'bts-corridor-ensemble', 'bts-corridor-silhouette', 'bts-washroom-overhead', 'bts-washroom-ensemble',
  'bts-lift-overhead', 'bts-lobby-ensemble', 'bts-lobby-tracking', 'bts-record',
]);

export function btsTwoJacket(index: number, time: number) {
  return time < 143 ? BTS_TWO_WARDROBE.jackets[index] : laterJackets[index];
}

export function placeBtsTwoFigure(
  props: VideoProps, figure: VideoFigure, view: BtsTwoView, slot: number, time: number,
  beat: number, emphasis: number, narrow: boolean, tight: boolean,
) {
  const dance = !/lift|indicator|record/.test(view);
  const phase = beat * .5 + (slot ? slot * .53 : 0);
  const side = slot % 2 ? -1 : 1;
  const column = slot ? Math.floor((slot + 1) / 2) : 0;
  const singleLine = /side|lobby/.test(view);
  const across = singleLine ? column * (narrow ? 42 : 58) : ((column + 1) % 3) * 44;
  const depth = singleLine ? 8 + column * 19 : 12 + column * 45;
  const stride = Math.sin(phase) * (dance ? 11.5 : 1.5);
  const sway = Math.sin(phase * .5) * (dance ? 8 : 1.7);
  const crouch = view === 'bts-lift-overhead' || view === 'bts-washroom-overhead';
  const lift = dance ? 3 * Math.cos(phase * 2) : 1.5 * Math.cos(phase);
  figure.root.visible = !isBtsTwoInsert(view) && (!slot || (!tight && wideViews.has(view)));
  figure.root.position.set(sway + (slot ? side * across : 0), 153 + lift - (crouch ? 12 : 0), slot ? 10 - depth : 14);
  figure.root.rotation.set(dance ? -.045 + .05 * Math.cos(phase) : -.018, .13 * Math.sin(phase) + slot * side * .018, .055 * Math.sin(phase));
  const sweep = dance ? Math.sin(phase) : .14 * Math.sin(phase);
  const bend = dance ? Math.max(0, Math.cos(phase)) : 0;
  figure.pose(time, [
    [-25 - 9 * bend, -39 + 10 * sweep, 6],
    [-16 - 29 * bend, -60 + 26 * sweep + 12 * emphasis, 26 + 17 * bend],
    [27 + 9 * bend, -36 - 8 * sweep, 8],
    [19 + 28 * bend, -52 - 27 * sweep + 13 * emphasis, 24 + 20 * bend],
  ], crouch);
  if (dance && !crouch) {
    for (const [i, direction] of [-1, 1].entries()) {
      const knee: VideoPoint = [direction * (15 + Math.abs(stride) * .55), -103, direction * stride * .6];
      const foot: VideoPoint = [direction * (17 + Math.abs(stride)), -147 + Math.max(0, direction * stride) * .72, 8 + direction * stride * 1.6];
      props.segment(figure.legs[2 * i], [direction * 10, -70, 0], knee, 7);
      props.segment(figure.legs[2 * i + 1], knee, foot, 5);
      figure.feet[i].position.set(...foot);
    }
  }
  figure.head.scene.rotation.y += .14 + .14 * Math.sin(phase * .6);
}

export function frameBtsTwoCamera(camera: THREE.PerspectiveCamera, view: BtsTwoView, time: number, narrow: boolean, tight: boolean) {
  const across = /side/.test(view);
  const overhead = /overhead/.test(view);
  const moving = /tracking|entrance|silhouette/.test(view);
  const shift = narrow ? 0 : 22 * Math.sin(time * (moving ? .43 : .17));
  if (view === 'bts-lift-indicator') {
    camera.fov = narrow ? 38 : 32;
    camera.position.set(-44, 225, 28);
    camera.lookAt(0, 250, -122);
  } else if (view === 'bts-record') {
    camera.fov = narrow ? 49 : 39;
    camera.position.set(shift, 179, narrow ? 340 : 240);
    camera.lookAt(0, 124, -146);
  } else if (tight) {
    camera.fov = narrow ? 44 : 38;
    camera.position.set(shift - 13, 153, 174);
    camera.lookAt(narrow ? 0 : 8, 142, 5);
  } else {
    camera.fov = narrow ? 47 : 42;
    camera.position.set(shift + (across ? 31 : 0), overhead ? 315 : across ? 150 : 137, overhead ? 328 : narrow ? 373 : across ? 406 : 365);
    camera.lookAt(0, overhead ? 93 : narrow ? 99 : 96, 0);
  }
}

function surface(mesh: THREE.Mesh, reflection = 0) {
  const material = mesh.material as THREE.MeshBasicMaterial;
  material.onBeforeCompile = shader => {
    const varying = 'varying vec3 surfacePoint;\n';
    shader.uniforms.floorReflection = { value: reflection };
    shader.vertexShader = varying + shader.vertexShader.replace('#include <begin_vertex>',
      '#include <begin_vertex>\n surfacePoint = (modelMatrix * vec4(position, 1.)).xyz;');
    shader.fragmentShader = varying + 'uniform float floorReflection;\n' + shader.fragmentShader.replace('#include <color_fragment>', `
      #include <color_fragment>
      vec3 p = surfacePoint;
      float speckle = fract(sin(dot(floor(p * 1.6), vec3(19.43, 71.83, 47.54))) * 35418.2);
      float stains = .5 + .5 * sin(p.x * .087 + .9 * sin(p.z * .032 + p.y * .09)) * cos(p.y * .044 - p.z * .08);
      float pool = exp(-pow(p.x / 136., 2.)) * (.64 + .36 * sin(p.z * .071));
      float fringe = exp(-pow((abs(p.x) - 106.) / 8., 2.));
      diffuseColor.rgb *= .65 + .38 * stains + .12 * speckle;
      diffuseColor.rgb += vec3(.027,.066,.063) * floorReflection * (pool + .45 * fringe);
    `);
  };
}

export function buildBtsTwoSet(props: VideoProps, view: BtsTwoView) {
  const root = new THREE.Group();
  const box = (w: number, h: number, d: number, color: string, x: number, y: number, z: number) =>
    props.box(root, w, h, d, color, [x, y, z]);
  const pipe = (a: VideoPoint, b: VideoPoint, size: number, color: string) => props.tube(root, a, b, size, color);
  const paint = (w: number, h: number, d: number, color: string, x: number, y: number, z: number, wet = 0) =>
    surface(box(w, h, d, color, x, y, z), wet);
  const light = (w: number, d: number, x: number, y: number, z: number, color = '#badfce') => {
    box(w + 10, 7, d + 7, '#252e2d', x, y, z);
    box(w, 1.1, d, color, x, y - 4.1, z);
    const halo = box(w + 1, .6, d + 2, color, x, y - 5.25, z);
    const tint = halo.material as THREE.MeshBasicMaterial;
    tint.transparent = true;
    tint.opacity = .19;
    tint.depthWrite = false;
  };

  const lift = /lift|entrance/.test(view);
  const washroom = view.includes('washroom');
  const lobby = view.includes('lobby');
  const side = view.includes('side');
  const record = view === 'bts-record';
  const background = view.includes('silhouette') ? '#0c1313' : lobby ? '#152322' : '#141e1d';
  paint(1040, 3, 1160, lobby ? '#243331' : '#313b39', 0, -3, -226, lobby ? 1.2 : .67);
  for (let x = -438; x <= 438; x += 73) {
    box(.85, .3, 950, '#43534d', x, -1.28, -210);
  }
  for (let z = -620; z <= 225; z += 52) {
    box(1040, .22, .8, '#485a55', 0, -1.22, z);
  }

  if (lift) {
    paint(438, 328, 8, '#3b5550', 0, 160, -141);
    for (const x of [-177, -119, 119, 177]) {
      box(3, 314, 4, '#6a8579', x, 154, -134);
      box(1, 301, 2, '#b7b9a2', x - 1.5, 156, -131.5);
    }
    for (const x of [-205, 205]) {
      paint(18, 315, 165, '#2d4946', x, 156, -94);
      pipe([x * .91, 82, -70], [x * .91, 82, -141], 1.8, '#81958b');
    }
    for (const x of [-63, 63]) {
      paint(122, 227, 5, '#324641', x, 114, -132);
      box(122, 1.4, 1.6, '#344c49', x, 6, -127.8);
    }
    box(137, 21, 5, '#172422', 0, 250, -122);
    box(7, 14, 2.1, '#e44242', -16, 250, -118);
    triangle(props, root, [[4, 245, -118], [18, 245, -118], [11, 257, -118]], '#f66b5e');
    for (let i = 0; i < 6; i++) box(3, 3, 2, i === 2 ? '#edbf69' : '#829181', 167, 103 + 6 * i, -127);
    light(158, 9, -61, 229, -30, '#e2d8ac');
    light(158, 9, 96, 229, -30);
    pipe([-191, 82, -128], [191, 82, -128], 2.15, '#9caa9f');
    if (view === 'bts-lift-ensemble' || view === 'bts-lift-overhead' || view === 'bts-entrance') {
      for (const [i, color] of ['#be5246', '#d6ad55', '#426b9d'].entries()) {
        props.mesh(root, new THREE.CircleGeometry(17.5, 20, Math.PI * (i * 2 / 3), Math.PI * 2 / 3),
          [-108, 140, -34], color);
      }
      pipe([-108, 124, -34], [-108, 102, -34], 1.2, '#a59765');
    }
  } else if (record) {
    paint(602, 341, 8, '#4e686b', 0, 139, -184);
    box(512, 39, 4, '#293f42', 0, 21, -178);
    box(560, 3, 4, '#9ca9a6', 0, 44, -175);
    box(448, 23, 5, '#637d7d', 0, 59, -175);
    for (const x of [-190, -177, -164, 164, 177, 190]) box(6, 8, 1, '#18262a', x, 59, -171.9);
    const reels = [-111, 111].map((x, i) => {
      const reel = new THREE.Group();
      reel.position.set(x, 149, -169);
      root.add(reel);
      const face = i === 0 ? '#839898' : '#141d20';
      const rim = i === 0 ? '#afbeb9' : '#35494c';
      props.mesh(reel, new THREE.CircleGeometry(92, 72), [0, 0, -2], face);
      const grooves = props.ink(reel);
      grooves.begin();
      for (let r = 23; r <= 90; r += i === 0 ? 7 : 3) {
        props.ring(grooves, [0, 0, 0], [r, 0, 0], [0, r, 0], rim, .55);
      }
      grooves.end();
      for (let j = 0; j < 3; j++) {
        const angle = j * 2 * Math.PI / 3;
        const spoke = box(55, 7, 2.4, i === 0 ? '#5b777a' : '#516a6c', 0, 0, 0);
        reel.add(spoke);
        spoke.position.set(48 * Math.cos(angle), 48 * Math.sin(angle), 1.1);
        spoke.rotation.z = angle;
      }
      props.mesh(reel, new THREE.CircleGeometry(22, 36), [0, 0, 1.1], '#344e51');
      props.oval(reel, [0, 0, 2.1], [8, 8, 1.6], '#b1c4b9');
      return reel;
    });
    pipe([-111, 66, -167], [111, 63, -167], .9, '#303a33');
    return {
      root, background, features: [],
      animate: (time: number) => { reels[0].rotation.z = time * 1.51; reels[1].rotation.z = time * 2.13; },
    };
  } else if (side || lobby) {
    paint(1040, 320, 6, lobby ? '#273f3d' : '#3c5350', 0, 157, -151);
    for (const y of [14, 95, 169, 221]) {
      box(1030, .8, 2, '#647671', 0, y, -146);
    }
    for (let x = -460; x <= 460; x += 92) {
      paint(lobby ? 19 : 5, 258, lobby ? 23 : 3, lobby ? '#647373' : '#4b625c', x, 129, -132 - (lobby ? 0 : 12));
      if (lobby) {
        box(70, 91, 3, '#34575a', x + 46, 133, -146);
        box(70, .85, 1, '#8eb2aa', x + 46, 114, -144.5);
        box(70, .85, 1, '#8eb2aa', x + 46, 155, -144.5);
        box(.8, 91, 1, '#8eb2aa', x + 46, 133, -144.5);
        box(64, 9, 15, '#292f30', x + 46, 14, -127);
      } else {
        const width = 39 + 5 * Math.cos(x);
        paint(width, 163, 5, '#354844', x + 43, 83, -141);
        box(2, 12, 2, '#aaae86', x + 52, 94, -137);
      }
      light(lobby ? 67 : 66, 6, x + 40, 211, -56, x % 3 === 0 ? '#b1c9bd' : '#cce5ce');
    }
    pipe([-508, 225, -128], [508, 225, -128], 2.4, '#171f20');
    pipe([-508, 215, -122], [508, 215, -122], 1.7, '#748b86');
    if (lobby) box(1040, .32, 2.5, '#39906e', 0, -1.06, -31);
  } else {
    const width = washroom ? 162 : 149;
    const back = washroom ? -285 : -490;
    paint(2 * width, 304, 5, washroom ? '#50686a' : '#243632', 0, 148, back);
    for (const x of [-width, width]) {
      paint(6, 294, 495, washroom ? '#526c6c' : '#3d5350', x, 146, back / 2 - 21);
      for (let y = 24; y < 209; y += washroom ? 16 : 37) {
        box(1.2, .75, 446, '#718280', x * .976, y, back / 2 - 14);
      }
      for (let z = back + 38; z <= -18; z += 45) {
        box(1.6, 220, .9, '#5a6b64', x * .976, 110, z);
      }
      pipe([x * .89, 201, -11], [x * .89, 201, back], 1.65, '#233335');
      pipe([x * .92, 188, -9], [x * .92, 188, back], 1.25, '#7c8c81');
      for (let z = back + 33; z < 12; z += 94) {
        box(3, 148, washroom ? 29 : 34, '#293f3c', x * .959, 77, z);
        light(27, 6, x * .83, 179, z, '#b5a367');
      }
    }
    for (let z = back + 30; z <= -17; z += 68) {
      box(2 * width - 5, 8, 7, '#303e3e', 0, 225, z);
      light(washroom ? 83 : 132, 4.8, 0, 215, z + 7, '#c6e4df');
    }
    if (washroom) {
      for (const z of [-64, -127, -190]) {
        box(12, 45, 32, '#6e9596', -153, 127, z);
        props.oval(root, [-141, 86, z], [14, 3.2, 20], '#b9c9c4');
        props.oval(root, [-139, 87.6, z], [9, .7, 13], '#758e89');
        pipe([-145, 88, z], [-145, 97, z], 1, '#a4aaa3');
      }
    }
  }
  return { root, background, features: [] };
}
