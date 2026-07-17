import { invertSequence } from './moves.js';

/**
 * The auto-solve demo guarantees correctness by scrambling the cube itself
 * and then replaying the *inverse* of that scramble. Because every move is
 * undone in reverse order, the cube always returns to the solved state.
 */
export function planInverseSolve(scrambleSeq) {
  return invertSequence(scrambleSeq);
}

/**
 * Placeholder for a future real solver. A genuine layer-by-layer (LBL) or
 * two-phase solver would read the cube's current sticker state and return a
 * solution sequence. Until then the demo relies on `planInverseSolve`.
 *
 * @param {object} _state logical cube state (not yet used)
 * @returns {string[]} solution moves
 */
export function solveLBL(_state) {
  throw new Error('A full LBL solver is not implemented yet — see planInverseSolve for the demo.');
}
