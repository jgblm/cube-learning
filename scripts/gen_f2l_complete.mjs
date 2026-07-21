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

const output = cases.map(c => ({
  case: c.case,
  name: `F2L ${c.case}`,
  subgroup: c.subgroup,
  setup: normalizeMoves(c.setup),
  algorithms: c.algorithms.map(normalizeMoves),
  dataFl: c.dataFl || ''.padStart(45, 'l'),
}));

console.log(JSON.stringify(output, null, 2));
process.stderr.write(`\nExtracted ${output.length} F2L cases\n`);
