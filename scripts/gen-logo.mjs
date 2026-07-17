// One-off generator for the isometric Rubik's-cube logo / favicon.
// Produces public/logo.svg (detailed) and public/favicon.svg (small-size tuned).
import { mkdirSync, writeFileSync } from 'node:fs';

// ---- Isometric cube geometry (64x64 viewBox) ----
const T = [32, 6], R = [58, 21], Bt = [32, 36], L = [6, 21];
const down = [0, 26];
const add = (p, q) => [p[0] + q[0], p[1] + q[1]];
const sub = (p, q) => [p[0] - q[0], p[1] - q[1]];
const Lp = add(L, down), Btp = add(Bt, down), Rp = add(R, down);

// A face: origin corner O plus edge vectors u (cols) and v (rows), each full length.
const faces = {
  top:   { O: L,  u: sub(T, L),   v: sub(Bt, L) },
  left:  { O: L,  u: sub(Bt, L),  v: down },
  right: { O: Bt, u: sub(R, Bt),  v: down },
};

// Palette — brand accents, with each face a distinct hue like a solved cube.
const palette = {
  top:   { base: '#eef2f8', edge: '#c7d0de' }, // white
  left:  { base: '#ff7a45', edge: '#e0592a' }, // orange accent
  right: { base: '#4f8cff', edge: '#2f6ae0' }, // blue accent
};

const GAP = '#0d0f15'; // dark gap between stickers (matches --bg)

function cellPolys(face, inset) {
  const { O, u, v } = face;
  const at = (i, j) => add(add(O, [(u[0] * i) / 3, (u[1] * i) / 3]), [(v[0] * j) / 3, (v[1] * j) / 3]);
  const polys = [];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let c = [at(i, j), at(i + 1, j), at(i + 1, j + 1), at(i, j + 1)];
      // inset toward centroid so the dark background shows as gaps
      const cx = (c[0][0] + c[1][0] + c[2][0] + c[3][0]) / 4;
      const cy = (c[0][1] + c[1][1] + c[2][1] + c[3][1]) / 4;
      c = c.map((p) => [cx + (p[0] - cx) * inset, cy + (p[1] - cy) * inset]);
      polys.push(c.map((p) => `${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(' '));
    }
  }
  return polys;
}

function faceOutline(face) {
  const { O, u, v } = face;
  const pts = [O, add(O, u), add(add(O, u), v), add(O, v)];
  return pts.map((p) => `${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(' ');
}

function buildSvg({ inset, rounded }) {
  let body = '';
  for (const name of ['top', 'left', 'right']) {
    const f = faces[name];
    const col = palette[name];
    // solid dark base fills the whole face (becomes the gaps)
    body += `    <polygon points="${faceOutline(f)}" fill="${GAP}"/>\n`;
    for (const poly of cellPolys(f, inset)) {
      body += `    <polygon points="${poly}" fill="${col.base}" stroke="${col.edge}" stroke-width="0.4"/>\n`;
    }
  }
  const rx = rounded ? ` rx="12"` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" role="img" aria-label="Rubik's Cube">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#1b2333"/>
      <stop offset="1" stop-color="#0f1117"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64"${rx} fill="url(#bg)"/>
  <g>
${body}  </g>
</svg>
`;
}

mkdirSync('public', { recursive: true });
// logo: tighter gaps read well large; rounded card background
writeFileSync('public/logo.svg', buildSvg({ inset: 0.86, rounded: true }));
// favicon: slightly bolder stickers + rounded corners for tab clarity
writeFileSync('public/favicon.svg', buildSvg({ inset: 0.9, rounded: true }));
console.log('wrote public/logo.svg and public/favicon.svg');
