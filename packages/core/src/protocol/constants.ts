/*
 * Protocol constants and default values.
 *
 * Centralizing magic numbers here keeps the rest of the codebase
 * clean and makes tuning the protocol straightforward.
 */

import type { GridConfig } from './types';


/* ------------------------------------------------------------------ */
/*  Grid Defaults                                                      */
/* ------------------------------------------------------------------ */

export const DEFAULT_GRID: GridConfig = {
  cols: 20,
  rows: 20,
  anchorSize: 3,
};


/* ------------------------------------------------------------------ */
/*  Anchor Pattern                                                     */
/* ------------------------------------------------------------------ */

/**
 * 3×3 bullseye pattern placed in each corner of the frame.
 * The filled border with a hollow center is easy to detect
 * and unlikely to appear in random data.
 */
export const ANCHOR_PATTERN: boolean[][] = [
  [true,  true,  true],
  [true,  false, true],
  [true,  true,  true],
];


/* ------------------------------------------------------------------ */
/*  Header Layout                                                      */
/* ------------------------------------------------------------------ */

export const HEADER_INDEX_BITS = 10;   // supports up to 1023 frames
export const HEADER_TOTAL_BITS = 10;
export const CHECKSUM_BITS     = 8;

export const TOTAL_HEADER_BITS =
  HEADER_INDEX_BITS + HEADER_TOTAL_BITS + CHECKSUM_BITS;


/* ------------------------------------------------------------------ */
/*  Playback                                                           */
/* ------------------------------------------------------------------ */

export const DEFAULT_FPS = 10;
export const MIN_FPS     = 2;
export const MAX_FPS     = 10;


/* ------------------------------------------------------------------ */
/*  Rendering Colors                                                   */
/* ------------------------------------------------------------------ */

export const CELL_COLORS = {
  filled:       '#000000',
  empty:        '#FFFFFF',
  background:   '#888888',
} as const;
