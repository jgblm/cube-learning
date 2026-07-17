import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FACE_DEF, normalize, randomScramble, toSequence } from './moves.js';

/**
 * Standard colour scheme (Western / "BOY"):
 *   U = white, D = yellow, F = green, B = blue, L = orange, R = red.
 */
const COLORS = {
  U: 0xf5f5f5, // white
  D: 0xffd500, // yellow
  F: 0x00b04f, // green
  B: 0x0051ba, // blue
  L: 0xff5800, // orange
  R: 0xc41e3a, // red
};

const CUBIE = 0.95; // body size
const STICKER = 0.82; // sticker size
const BASE_DURATION = 230; // ms per quarter turn at speed 1

/**
 * CubeEngine wraps a Three.js scene that renders a 3x3 cube and animates
 * face turns. It is intentionally framework-agnostic: a React component
 * creates it, drives it through the public methods, and disposes it.
 */
export default class CubeEngine {
  constructor(container) {
    this.container = container;
    this.cubies = [];
    this.queue = []; // pending moves (normalised strings)
    this.current = null; // { pivot, axisVec, angle, selected, start, duration }
    this.speed = 1;
    this.disposed = false;

    // Shared geometry / materials (reused across cubies, disposed on teardown).
    this.bodyGeo = new THREE.BoxGeometry(CUBIE, CUBIE, CUBIE);
    this.bodyMat = new THREE.MeshStandardMaterial({
      color: 0x0c0e14,
      roughness: 0.85,
      metalness: 0.0,
    });
    this.stickerGeo = new THREE.PlaneGeometry(STICKER, STICKER);
    this.stickerMats = {};
    for (const [k, c] of Object.entries(COLORS)) {
      this.stickerMats[k] = new THREE.MeshStandardMaterial({
        color: c,
        roughness: 0.45,
        metalness: 0.05,
      });
    }

    this._initScene();
    this._buildCubies();
    this._startLoop();
  }

  _initScene() {
    const w = this.container.clientWidth || 480;
    const h = this.container.clientHeight || 380;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0e1018);

    this.camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    this.camera.position.set(4.6, 4.4, 6.2);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(w, h);
    this.container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.12;
    this.controls.enablePan = false;
    this.controls.minDistance = 5;
    this.controls.maxDistance = 14;

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.85));
    const dir = new THREE.DirectionalLight(0xffffff, 0.7);
    dir.position.set(6, 9, 7);
    this.scene.add(dir);
    const dir2 = new THREE.DirectionalLight(0x88aaff, 0.25);
    dir2.position.set(-6, -4, -7);
    this.scene.add(dir2);

    this.group = new THREE.Group();
    this.scene.add(this.group);

    this._onResize = () => this._resize();
    this._ro = new ResizeObserver(this._onResize);
    this._ro.observe(this.container);
  }

  _resize() {
    if (!this.container || this.disposed) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    if (!w || !h) return;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  /** Build the 26 visible cubies (skip the hidden centre). */
  _buildCubies() {
    for (let x = -1; x <= 1; x += 1) {
      for (let y = -1; y <= 1; y += 1) {
        for (let z = -1; z <= 1; z += 1) {
          if (x === 0 && y === 0 && z === 0) continue;
          this.group.add(this._makeCubie(x, y, z));
        }
      }
    }
  }

  _makeCubie(x, y, z) {
    const cubie = new THREE.Group();
    cubie.add(new THREE.Mesh(this.bodyGeo, this.bodyMat));

    const stickers = [
      [x === 1, 'px', COLORS.R],
      [x === -1, 'nx', COLORS.L],
      [y === 1, 'py', COLORS.U],
      [y === -1, 'ny', COLORS.D],
      [z === 1, 'pz', COLORS.F],
      [z === -1, 'nz', COLORS.B],
    ];

    for (const [show, face, color] of stickers) {
      if (!show) continue;
      const sticker = new THREE.Mesh(this.stickerGeo, this.stickerMats[colorKey(color)]);
      this._orientSticker(sticker, face);
      cubie.add(sticker);
    }

    cubie.position.set(x, y, z);
    cubie.userData.pos = new THREE.Vector3(x, y, z);
    this.cubies.push(cubie);
    return cubie;
  }

  _orientSticker(mesh, face) {
    const off = CUBIE / 2 + 0.001;
    switch (face) {
      case 'px':
        mesh.rotation.y = Math.PI / 2;
        mesh.position.set(off, 0, 0);
        break;
      case 'nx':
        mesh.rotation.y = -Math.PI / 2;
        mesh.position.set(-off, 0, 0);
        break;
      case 'py':
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.set(0, off, 0);
        break;
      case 'ny':
        mesh.rotation.x = Math.PI / 2;
        mesh.position.set(0, -off, 0);
        break;
      case 'pz':
        mesh.position.set(0, 0, off);
        break;
      case 'nz':
        mesh.rotation.y = Math.PI;
        mesh.position.set(0, 0, -off);
        break;
      default:
        break;
    }
  }

  /** Resolve a move string into the data needed to animate it. */
  _resolve(move) {
    const { face, prime, dbl } = normalize(move);
    const def = FACE_DEF[face];
    const sign = def.sign * (prime ? -1 : 1);
    const angle = sign * (dbl ? Math.PI : Math.PI / 2);
    const axisVec = new THREE.Vector3(
      def.axis === 'x' ? 1 : 0,
      def.axis === 'y' ? 1 : 0,
      def.axis === 'z' ? 1 : 0,
    );
    return { axis: def.axis, layer: def.layer, axisVec, angle };
  }

  /** Queue one move (string) or many (array / space-separated string). */
  enqueue(input) {
    const seq = toSequence(input);
    this.queue.push(...seq);
  }

  /** Alias used by the UI. */
  play(input) {
    this.enqueue(input);
  }

  applySequence(input) {
    this.enqueue(input);
  }

  scramble(n = 20) {
    this.queue = [];
    this.current = null;
    const seq = randomScramble(n);
    this.queue.push(...seq);
    return seq;
  }

  reset() {
    this.queue = [];
    if (this.current) {
      this.group.remove(this.current.pivot);
      this.current = null;
    }
    for (const c of this.cubies) this.group.remove(c);
    this.cubies = [];
    this._buildCubies();
  }

  setSpeed(mult) {
    this.speed = Math.max(0.25, Math.min(4, mult));
  }

  _startLoop() {
    const loop = () => {
      if (this.disposed) return;
      this.raf = requestAnimationFrame(loop);

      if (!this.current && this.queue.length) {
        this._beginMove(this.queue.shift());
      }
      if (this.current) {
        this._advanceMove();
      }

      this.controls.update();
      this.renderer.render(this.scene, this.camera);
    };
    this.raf = requestAnimationFrame(loop);
  }

  _beginMove(move) {
    const { axis, layer, axisVec, angle } = this._resolve(move);
    const selected = this.cubies.filter(
      (c) => Math.round(c.userData.pos[axis]) === layer,
    );

    const pivot = new THREE.Group();
    this.group.add(pivot);
    selected.forEach((c) => pivot.attach(c));

    this.current = {
      pivot,
      axisVec,
      angle,
      selected,
      start: performance.now(),
      duration: BASE_DURATION / this.speed,
    };
  }

  _advanceMove() {
    const cur = this.current;
    const t = Math.min(1, (performance.now() - cur.start) / cur.duration);
    cur.pivot.setRotationFromAxisAngle(cur.axisVec, cur.angle * t);

    if (t >= 1) {
      // Bake the transform back into each cubie and update logical coords.
      cur.selected.forEach((c) => {
        this.group.attach(c);
        c.userData.pos.applyAxisAngle(cur.axisVec, cur.angle).round();
      });
      this.group.remove(cur.pivot);
      this.current = null;
    }
  }

  dispose() {
    this.disposed = true;
    if (this.raf) cancelAnimationFrame(this.raf);
    if (this._ro) this._ro.disconnect();
    if (this.controls) this.controls.dispose();
    for (const c of this.cubies) this.group.remove(c);
    this.cubies = [];
    this.bodyGeo.dispose();
    this.stickerGeo.dispose();
    this.bodyMat.dispose();
    Object.values(this.stickerMats).forEach((m) => m.dispose());
    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
    }
  }
}

/** Map a colour integer back to its scheme key for material lookup. */
function colorKey(color) {
  for (const [k, c] of Object.entries(COLORS)) {
    if (c === color) return k;
  }
  return 'U';
}
