/*
 * Frame builder — the core of the encoding pipeline.
 *
 * Takes a binary payload and splits it across multiple visual frames,
 * each containing corner anchors, a small header, and a data region.
 *
 * Frame layout (20×20 default):
 *
 *   [A A A] . . . . . . . . . . . . . . [A A A]
 *   [A . A] . . . . . . . . . . . . . . [A . A]
 *   [A A A] . . . . . . . . . . . . . . [A A A]
 *    . . . (header bits, then data bits) . . .
 *    . . .            ...                . . .
 *   [A A A] . . . . . . . . . . . . . . [A A A]
 *   [A . A] . . . . . . . . . . . . . . [A . A]
 *   [A A A] . . . . . . . . . . . . . . [A A A]
 *
 * A = anchor cell (fixed pattern), . = writable cell
 */

import type { GridConfig, EncodedFrame } from '../protocol/types';
import {
  DEFAULT_GRID,
  ANCHOR_PATTERN,
  HEADER_INDEX_BITS,
  HEADER_TOTAL_BITS,
  CHECKSUM_BITS,
} from '../protocol/constants';
import { computeChecksum, toBits } from '../protocol/checksum';


/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * Encodes a binary payload string into a sequence of renderable frames.
 * Each frame is self-contained: anchors + header + data chunk.
 */
export function buildFrames(
  binaryPayload: string,
  config: GridConfig = DEFAULT_GRID,
): EncodedFrame[] {
  const capacity = calculateDataCapacity(config);
  if (capacity <= 0) {
    throw new Error(
      `Grid ${config.cols}×${config.rows} is too small to carry any data.`,
    );
  }

  const chunks = splitIntoChunks(binaryPayload, capacity);
  const totalFrames = chunks.length;

  return chunks.map((chunk, index) => {
    const checksum = computeChecksum(chunk);
    const grid = assembleGrid(index, totalFrames, chunk, checksum, config);
    return { index, total: totalFrames, grid, checksum };
  });
}


/* ------------------------------------------------------------------ */
/*  Internal helpers                                                   */
/* ------------------------------------------------------------------ */

/** How many data bits fit in a single frame after reserving anchors + header. */
function calculateDataCapacity(config: GridConfig): number {
  const totalCells = config.cols * config.rows;
  const anchorCells = 4 * config.anchorSize * config.anchorSize;
  const headerCells = HEADER_INDEX_BITS + HEADER_TOTAL_BITS + CHECKSUM_BITS;
  return totalCells - anchorCells - headerCells;
}

/** Splits a string into fixed-size pieces; the last piece may be shorter. */
function splitIntoChunks(data: string, chunkSize: number): string[] {
  if (data.length === 0) return [''];

  const chunks: string[] = [];
  for (let i = 0; i < data.length; i += chunkSize) {
    chunks.push(data.substring(i, i + chunkSize));
  }
  return chunks;
}


/**
 * Constructs the full boolean[][] grid for one frame.
 *
 * Walk through cells in reading order (top-left → bottom-right),
 * skipping any cell that belongs to a corner anchor. The first
 * HEADER bits go to the header, everything after is payload.
 */
function assembleGrid(
  frameIndex: number,
  totalFrames: number,
  dataBits: string,
  checksum: number,
  config: GridConfig,
): boolean[][] {
  const { cols, rows, anchorSize } = config;

  // Start with a blank (all-white) grid
  const grid: boolean[][] = [];
  for (let r = 0; r < rows; r++) {
    grid.push(new Array(cols).fill(false));
  }

  // Stamp the four corner anchors
  stampAnchor(grid, 0,                0,                anchorSize);
  stampAnchor(grid, 0,                cols - anchorSize, anchorSize);
  stampAnchor(grid, rows - anchorSize, 0,                anchorSize);
  stampAnchor(grid, rows - anchorSize, cols - anchorSize, anchorSize);

  // Build the linear bitstream: header then data
  const headerBits =
    toBits(frameIndex, HEADER_INDEX_BITS) +
    toBits(totalFrames, HEADER_TOTAL_BITS) +
    toBits(checksum, CHECKSUM_BITS);

  const stream = headerBits + dataBits;
  let cursor = 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (isInsideAnchor(r, c, rows, cols, anchorSize)) continue;
      if (cursor < stream.length) {
        grid[r][c] = stream[cursor] === '1';
        cursor++;
      }
    }
  }

  return grid;
}


/** Writes the anchor pattern into the grid at a given origin. */
function stampAnchor(
  grid: boolean[][],
  originRow: number,
  originCol: number,
  size: number,
): void {
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (size === 3) {
        grid[originRow + r][originCol + c] = ANCHOR_PATTERN[r][c];
      } else {
        // Generalized concentric-ring pattern for any anchor size
        const ring = Math.min(r, c, size - 1 - r, size - 1 - c);
        grid[originRow + r][originCol + c] = ring % 2 === 0;
      }
    }
  }
}


/** Returns true if (row, col) falls inside any of the four corner anchors. */
function isInsideAnchor(
  row: number, col: number,
  totalRows: number, totalCols: number,
  anchorSize: number,
): boolean {
  const top    = row < anchorSize;
  const bottom = row >= totalRows - anchorSize;
  const left   = col < anchorSize;
  const right  = col >= totalCols - anchorSize;

  return (top && left) || (top && right) || (bottom && left) || (bottom && right);
}
