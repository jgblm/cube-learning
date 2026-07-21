const URL = 'https://speedcubedb.com/a/3x3/F2L';
const resp = await fetch(URL, { headers: { 'User-Agent': 'Mozilla/5.0' } });
const html = await resp.text();

function parseCaseBlocks(html) {
  const clean = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '');
  const caseStart = /<div\s+class="row\s+singlealgorithm\s+g-0"\s+data-subgroup="([^"]*)"\s+data-alg="F2L\s+(\d+)"\s+style="">/g;
  const positions = [];
  let match;
  while ((match = caseStart.exec(clean)) !== null) {
    positions.push({ index: match.index, num: parseInt(match[2], 10), subgroup: match[1] });
  }
  const results = [];
  for (let i = 0; i < positions.length; i++) {
    const start = positions[i].index;
    const end = i + 1 < positions.length ? positions[i + 1].index : clean.length;
    const section = clean.slice(start, end);
    const flMatch = section.match(/<div\s+class="icube"[^>]*data-fl="([^"]+)"/);
    const dataFl = flMatch ? flMatch[1] : '';
    const setupMatch = section.match(/<div\s+class="setup-case[^"]*"[^>]*>(?:<[^>]*>)*setup:(?:<[^>]*>)*\s*([A-Za-z0-2'\s]+?)(?:<|\n)/);
    const setup = setupMatch ? setupMatch[1].trim() : '';
    const oriSection = section.match(/<div\s+data-ori='0'>([\s\S]*?)(?:<div\s+data-ori='1'|$)/);
    const targetSection = oriSection ? oriSection[1] : section;
    const algRegex = /formatted-alg">([^<]+)/g;
    const algs = [];
    let a;
    while ((a = algRegex.exec(targetSection)) !== null && algs.length < 2) {
      const alg = a[1].trim();
      if (alg.length > 0) algs.push(alg);
    }
    results.push({ case: positions[i].num, subgroup: positions[i].subgroup, setup, dataFl, algorithms: algs });
  }
  return results;
}

/** Normalize a space-separated move string to use standard notation:
 *  - lowercase wide moves → uppercase + w (e.g. r → Rw, r' → Rw')
 *  - U2' / U2' → U2 (180° is directionless)
 */
function normalizeMoves(movesStr) {
  if (!movesStr) return movesStr;
  return movesStr.split(/\s+/).map(m => {
    if (!m) return m;
    // U2' → U2, R2' → R2
    let s = m.replace(/(\d)'/, '$1');
    // Lowercase wide moves: r → Rw, u → Uw, etc.
    s = s.replace(/^r(?![A-Za-z])/, 'Rw');
    s = s.replace(/^u(?![A-Za-z])/, 'Uw');
    s = s.replace(/^f(?![A-Za-z])/, 'Fw');
    s = s.replace(/^d(?![A-Za-z])/, 'Dw');
    s = s.replace(/^l(?![A-Za-z])/, 'Lw');
    s = s.replace(/^b(?![A-Za-z])/, 'Bw');
    return s;
  }).join(' ');
}

const cases = parseCaseBlocks(html);

/**
 * Parse data-fl (45 chars) into a set of cubie positions to keep colored.
 *
 * data-fl contains 5 faces × 9 stickers, in this order:
 *   [U(9)][F(9)][R(9)][L(9)][B(9)]
 *
 * Char meanings:
 *   l = gray (default)
 *   w = white (D/cross)
 *   g = green (R face)
 *   o = orange (B face)
 *
 * D face is not in data-fl (always gray for F2L).
 * Each face is 9 chars in row-major: left→right, top→bottom (looking from outside).
 *
 * When a sticker has a non-'l' char, the corresponding cubie is "colored".
 * We skip center positions (0,0,0) since there is no center cubie.
 */

/** Map (faceIdx 0-4, stickerPos 0-8) → cubie [x,y,z]
 *  Each face is viewed from outside the cube, row-major
 *  (image top row = stickerPos 0..2, middle = 3..5, bottom = 6..8).
 *  Crucially, "image top" depends on which face we're looking at:
 *    - U  (top-down):  image top = back of cube  (z = -1)
 *    - F  (front):     image top = top           (y = +1)
 *    - R  (right):     image top = top, image left = front (z = +1)
 *    - L  (left):      image top = top, image left = BACK  (z = -1)
 *    - B  (back):      image top = top, image left = cube's RIGHT (x = +1)
 */
const STICKER_MAP = [
  // 0: U face (y=1) — looking down from +y. image top = back (z=-1)
  [[-1,1,-1],[0,1,-1],[1,1,-1], [-1,1,0],[0,1,0],[1,1,0], [-1,1,1],[0,1,1],[1,1,1]],
  // 1: F face (z=1) — looking from +z. image top = top (y=+1)
  [[-1,1,1],[0,1,1],[1,1,1], [-1,0,1],[0,0,1],[1,0,1], [-1,-1,1],[0,-1,1],[1,-1,1]],
  // 2: R face (x=1) — looking from +x. image top = top, image left = front (z=+1)
  [[1,1,1],[1,1,0],[1,1,-1], [1,0,1],[1,0,0],[1,0,-1], [1,-1,1],[1,-1,0],[1,-1,-1]],
  // 3: L face (x=-1) — looking from -x. image top = top, image left = BACK (z=-1)
  [[-1,1,-1],[-1,1,0],[-1,1,1], [-1,0,-1],[-1,0,0],[-1,0,1], [-1,-1,-1],[-1,-1,0],[-1,-1,1]],
  // 4: B face (z=-1) — looking from -z. image top = top, image left = cube's RIGHT (x=+1)
  [[1,1,-1],[0,1,-1],[-1,1,-1], [1,0,-1],[0,0,-1],[-1,0,-1], [1,-1,-1],[0,-1,-1],[-1,-1,-1]],
];

/** Skip the virtual centre cubie [0,0,0]. */
function isCenter(pos) { return pos[0] === 0 && pos[1] === 0 && pos[2] === 0; }

function key(p) { return p.join(','); }

const output = cases.map(c => {
  const fl = c.dataFl || ''.padStart(45, 'l');
  const coloredCubies = new Set();

  for (let i = 0; i < 45; i++) {
    const ch = fl[i];
    if (ch !== 'l') {
      const faceIdx = Math.floor(i / 9);
      const stickerPos = i % 9;
      const cubiePos = STICKER_MAP[faceIdx][stickerPos];
      if (!isCenter(cubiePos)) {
        coloredCubies.add(key(cubiePos));
      }
    }
  }

  return {
    case: c.case,
    name: `F2L ${c.case}`,
    subgroup: c.subgroup,
    setup: normalizeMoves(c.setup),
    algorithms: c.algorithms.map(normalizeMoves),
    dataFl: fl,
    coloredPositions: [...coloredCubies].map(s => s.split(',').map(Number)),
  };
});

console.log(JSON.stringify(output, null, 2));
process.stderr.write(`\nExtracted ${output.length} F2L cases with sticker masks\n`);
process.stderr.write(`Colored cubies per case: ${output.map(c => c.coloredPositions.length).join(', ')}\n`);
