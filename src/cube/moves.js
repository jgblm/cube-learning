/**
 * Move notation utilities for a 3x3 Rubik's cube.
 *
 * Supported notation: the six faces U, D, L, R, F, B, the three slices
 * M (between L/R), E (between U/D) and S (between F/B), each optionally
 * followed by "'" (prime / counter-clockwise) or "2" (double turn).
 * Examples: "R", "U'", "F2", "L", "M2".
 *
 * These helpers are pure string manipulation so they can be used anywhere
 * without pulling in three.js.
 */

/** Every face/slice this engine understands. */
export const FACES = ['U', 'D', 'L', 'R', 'F', 'B', 'M', 'E', 'S'];

/** Faces used when generating scrambles (slices are excluded). */
export const SCRAMBLE_FACES = ['U', 'D', 'L', 'R', 'F', 'B'];

/**
 * Geometry of each face turn, expressed relative to the cube's centre.
 *  - axis:  the rotation axis ('x' | 'y' | 'z')
 *  - layer: the coordinate of the turning layer along that axis (-1 or 1)
 *  - sign:  base direction (clockwise when looking at the face from outside
 *           is positive). Prime moves flip the sign; doubles keep it.
 */
export const FACE_DEF = {
  U: { axis: 'y', layer: 1, sign: 1 },
  D: { axis: 'y', layer: -1, sign: -1 },
  L: { axis: 'x', layer: -1, sign: 1 },
  R: { axis: 'x', layer: 1, sign: -1 },
  F: { axis: 'z', layer: 1, sign: 1 },
  B: { axis: 'z', layer: -1, sign: -1 },
  // Slices turn in the same rotational sense as their reference face.
  M: { axis: 'x', layer: 0, sign: 1 }, // matches L
  E: { axis: 'y', layer: 0, sign: -1 }, // matches D
  S: { axis: 'z', layer: 0, sign: 1 }, // matches F
};

/** Parse a move string into a normalised object. */
export function normalize(move) {
  const m = String(move).trim();
  const face = m[0];
  if (!FACES.includes(face)) {
    throw new Error(`Invalid move face: "${m}"`);
  }
  const mod = m.slice(1);
  return {
    face,
    prime: mod.includes("'"),
    dbl: mod.includes('2'),
  };
}

/** Serialise a normalised move back to a string. */
export function toString({ face, prime, dbl }) {
  return face + (dbl ? '2' : prime ? "'" : '');
}

/** Invert a single move (U -> U', U2 -> U2, U' -> U). */
export function invert(move) {
  const n = normalize(move);
  if (n.dbl) return toString(n);
  return toString({ face: n.face, prime: !n.prime, dbl: false });
}

/** Invert a whole sequence, reversing the order (like undoing a stack). */
export function invertSequence(seq) {
  return [...seq].reverse().map(invert);
}

/**
 * Expand an algorithm written either as an array of moves or as a single
 * space-separated string into an array of normalised move strings.
 */
export function toSequence(input) {
  if (Array.isArray(input)) return input.map((m) => String(m).trim());
  return String(input)
    .split(/\s+/)
    .filter(Boolean);
}

/** Generate a random scramble of `n` moves with no immediate face repeats. */
export function randomScramble(n = 20) {
  const mods = ['', "'", '2'];
  const seq = [];
  let last = null;
  for (let i = 0; i < n; i += 1) {
    let face;
    do {
      face = SCRAMBLE_FACES[Math.floor(Math.random() * SCRAMBLE_FACES.length)];
    } while (face === last);
    last = face;
    const mod = mods[Math.floor(Math.random() * mods.length)];
    seq.push(face + mod);
  }
  return seq;
}
