/**
 * Curated CFOP algorithm reference used by the formula cheat sheet.
 *
 * Two-look OLL (orientation of the last layer in two steps) and a selection
 * of common PLL permutations. Each entry has:
 *   id         stable identifier
 *   name       { zh, en }
 *   algorithm  space-separated move string (faces U/D/L/R/F/B + slices M/E/S)
 *   setup      space-separated move string that, played from a solved cube,
 *              reaches the algorithm's real "before" case. It is the inverse
 *              of `algorithm`, so playing setup then algorithm returns to solved.
 *   pattern?   9-cell top-face map (1 = yellow) — only for OLL cross cases
 *   hint?      { zh, en } teaching note
 *
 * Note: this is a teaching reference, not the full 57 OLL / 21 PLL set.
 * Algorithms are standard CFOP; always verify against your own muscle memory.
 */

// Top-face pattern for the "make the yellow cross" step (edges only).
// Cells are read left-to-right, top-to-bottom (index 4 is always yellow U-centre).
export const OLL_2LOOK = [
  {
    id: 'oll-dot',
    name: { zh: '十字·点', en: 'Cross · Dot' },
    pattern: [0, 0, 0, 0, 1, 0, 0, 0, 0],
    algorithm: "F R U R' U' F' y2 F R U R' U' F'",
    setup: "F U R U' R' F' y2 F U R U' R' F'",
    hint: { zh: '无黄色棱，做两次（中间需转向）', en: 'No yellow edges — repeat with a turn in between' },
  },
  {
    id: 'oll-line',
    name: { zh: '十字·线', en: 'Cross · Line' },
    pattern: [0, 0, 0, 1, 1, 1, 0, 0, 0],
    algorithm: "F R U R' U' F'",
    setup: "F U R U' R' F'",
    hint: { zh: '黄色棱成一条线', en: 'Yellow edges form a line' },
  },
  {
    id: 'oll-l',
    name: { zh: '十字·L', en: 'Cross · L' },
    pattern: [1, 0, 0, 0, 1, 0, 0, 0, 0],
    algorithm: "F R U R' U' F' y F R U R' U' F'",
    setup: "F U R U' R' F' y' F U R U' R' F'",
    hint: { zh: '黄色棱成 L 形', en: 'Yellow edges form an L' },
  },
  {
    id: 'oll-sune',
    name: { zh: '翻角·Sune', en: 'Corners · Sune' },
    algorithm: "R U R' U R U2 R'",
    setup: "R U2 R' U' R U' R'",
    hint: { zh: '1 个顶面角块已黄（鱼头）', en: 'One yellow corner — "fish head"' },
  },
  {
    id: 'oll-antisune',
    name: { zh: '翻角·反 Sune', en: 'Corners · Anti-Sune' },
    algorithm: "R' U' R U' R' U2 R",
    setup: "R' U2 R U R' U R",
    hint: { zh: 'Sune 的镜像', en: 'Mirror of Sune' },
  },
  {
    id: 'oll-lshape',
    name: { zh: '翻角·L', en: 'Corners · L' },
    algorithm: "F R' F' R U R U' R'",
    setup: "R U R' U' R' F R F'",
    hint: { zh: '2 个相邻角块需翻', en: 'Two adjacent corners to flip' },
  },
  {
    id: 'oll-t',
    name: { zh: '翻角·T', en: 'Corners · T' },
    algorithm: "R U R' U' R' F R F'",
    setup: "F R' F' R U R U' R'",
    hint: { zh: '2 个相对角块需翻', en: 'Two opposite corners to flip' },
  },
  {
    id: 'oll-pi',
    name: { zh: '翻角·Pi', en: 'Corners · Pi' },
    algorithm: "R U2 R2 U' R2 U' R2 U2 R",
    setup: "R' U2 R2 U R2 U R2 U2 R'",
    hint: { zh: '4 个角块全部未翻', en: 'All four corners un-oriented' },
  },
];

// A selection of the most common PLL permutations.
export const PLL_COMMON = [
  { id: 'pll-ua', name: { zh: 'Ua 公式', en: 'Ua perm' }, algorithm: "R U R' U R U2 R' U R U' R' U'", setup: "U R U R' U' R U2 R' U' R U' R'" },
  { id: 'pll-ub', name: { zh: 'Ub 公式', en: 'Ub perm' }, algorithm: "R' U' R U' R' U2 R U' R' U R U", setup: "U' R' U' R U R' U2 R U R' U R" },
  { id: 'pll-h', name: { zh: 'H 公式', en: 'H perm' }, algorithm: "M2 U M2 U2 M2 U M2", setup: "M2 U' M2 U2 M2 U' M2" },
  { id: 'pll-z', name: { zh: 'Z 公式', en: 'Z perm' }, algorithm: "M2 U M2 U M' U2 M2 U2 M' U2", setup: "U2 M U2 M2 U2 M U' M2 U' M2" },
  { id: 'pll-aa', name: { zh: 'Aa 公式', en: 'Aa perm' }, algorithm: "R' F R' B2 R F' R' B2 R2", setup: "R2 B2 R F R' B2 R F' R" },
  { id: 'pll-ab', name: { zh: 'Ab 公式', en: 'Ab perm' }, algorithm: "R2 B2 R F R' B2 R F' R2", setup: "R2 F R' B2 R F' R' B2 R2" },
  { id: 'pll-t', name: { zh: 'T 公式', en: 'T perm' }, algorithm: "R U R' U R' F R2 U' R' U' R U R' F'", setup: "F R U' R' U R U R2 F' R U' R U' R'" },
  { id: 'pll-ja', name: { zh: 'Ja 公式', en: 'Ja perm' }, algorithm: "R' U L' U2 R U' R' U2 R L", setup: "L' R' U2 R U R' U2 L U' R" },
  { id: 'pll-jb', name: { zh: 'Jb 公式', en: 'Jb perm' }, algorithm: "R U R' F' R U R' U' R' F R2 U' R' U'", setup: "U R U R2 F' R U R U' R' F R U' R'" },
  { id: 'pll-f', name: { zh: 'F 公式', en: 'F perm' }, algorithm: "R' U' F R U R' U' R' F' R U R' U' R' U R U R'", setup: "R U' R' U' R U R U' R' F R U R U' R' F' U R" },
  { id: 'pll-na', name: { zh: 'Na 公式', en: 'Na perm' }, algorithm: "R U R' U R U R' F' R U R' U' R' F R2 U' R' U'", setup: "U R U R2 F' R U R U' R' F R U' R' U' R U' R'" },
  { id: 'pll-nb', name: { zh: 'Nb 公式', en: 'Nb perm' }, algorithm: "R' U L' U2 R U' R' U2 R L", setup: "L' R' U2 R U R' U2 L U' R" },
  { id: 'pll-ra', name: { zh: 'Ra 公式', en: 'Ra perm' }, algorithm: "R U R' F' R U R' U' R' F R2 U' R' U'", setup: "U R U R2 F' R U R U' R' F R U' R'" },
  { id: 'pll-rb', name: { zh: 'Rb 公式', en: 'Rb perm' }, algorithm: "R' U' R U R' F' R U R' U' R' F R2", setup: "R2 F' R U R U' R' F R U' R' U R" },
  { id: 'pll-v', name: { zh: 'V 公式', en: 'V perm' }, algorithm: "R' U R' U' R' F' R F R' U' R' U' R U R'", setup: "R U' R' U R U R F' R' F R U R U' R" },
  { id: 'pll-y', name: { zh: 'Y 公式', en: 'Y perm' }, algorithm: "F R U' R' U' R U R' F' R U R' U' R' F R F'", setup: "F R' F' R U R U' R' F R U' R' U R U R' F'" },
  { id: 'pll-ga', name: { zh: 'Ga 公式', en: 'Ga perm' }, algorithm: "R' U' R U D' R2 U R' U R2 D R2 U' R' U' R", setup: "R' U R U R2 D' R2 U' R U' R2 D U' R' U R" },
];
