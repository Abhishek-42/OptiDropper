/*
 * Grid sampler — reads cell values from a camera frame once anchors
 * have been detected.
 *
 * Given the pixel positions of the four corners, this module maps
 * each grid cell to a pixel coordinate, samples the luminance at
 * that point, and determines whether the cell is filled (1) or
 * empty (0).
 */

import type { GridConfig, DecodedFrameData } from '../protocol/types';
import {
  DEFAULT_GRID,
  HEADER_INDEX_BITS,
  HEADER_TOTAL_BITS,
  CHECKSUM_BITS,
} from '../protocol/constants';
import { computeChecksum, fromBits } from '../protocol/checksum';
import { detectGrid, type DetectedGrid } from './anchor-detector';


/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * Extracts structured frame data from raw camera ImageData.
 *
 * Returns null if the grid cannot be found or the checksum fails.
 */
export function readFrame(
  imageData: ImageData,
  config: GridConfig = DEFAULT_GRID,
): DecodedFrameData | null {
  const detected = detectGrid(imageData, config);
  if (!detected) return null;

  const bits = sampleAllCells(imageData, detected, config);
  if (!bits) return null;

  return parseFrameBits(bits, config);
}


/* ------------------------------------------------------------------ */
/*  Cell sampling                                                      */
/* ------------------------------------------------------------------ */

/**
 * Walks through every non-anchor cell in reading order and samples
 * the pixel at its center to determine black (1) or white (0).
 */
function sampleAllCells(
  imageData: ImageData,
  grid: DetectedGrid,
  config: GridConfig,
): string | null {
  const { cols, rows, anchorSize } = config;
  const { topLeft, cellWidth, cellHeight } = grid;

  // Calculate the top-left origin of the full grid
  const originX = topLeft.x - (anchorSize / 2) * cellWidth;
  const originY = topLeft.y - (anchorSize / 2) * cellHeight;

  const luminance = imageToLuminance(imageData);
  const threshold = quickThreshold(luminance);

  let bits = '';

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (isAnchorCell(r, c, rows, cols, anchorSize)) continue;

      const px = Math.round(originX + (c + 0.5) * cellWidth);
      const py = Math.round(originY + (r + 0.5) * cellHeight);
      const idx = py * imageData.width + px;

      if (idx < 0 || idx >= luminance.length) return null;

      bits += luminance[idx] < threshold ? '1' : '0';
    }
  }

  return bits;
}


/* ------------------------------------------------------------------ */
/*  Bit parsing                                                        */
/* ------------------------------------------------------------------ */

/** Splits the raw bitstream into header fields and validates the checksum. */
function parseFrameBits(bits: string, config: GridConfig): DecodedFrameData | null {
  const headerLen = HEADER_INDEX_BITS + HEADER_TOTAL_BITS + CHECKSUM_BITS;
  if (bits.length < headerLen) return null;

  let cursor = 0;

  const index    = fromBits(bits.substring(cursor, cursor += HEADER_INDEX_BITS));
  const total    = fromBits(bits.substring(cursor, cursor += HEADER_TOTAL_BITS));
  const checksum = fromBits(bits.substring(cursor, cursor += CHECKSUM_BITS));
  const payload  = bits.substring(cursor);

  const actualChecksum = computeChecksum(payload);
  const valid = actualChecksum === checksum;

  return { index, total, payload, valid };
}


/* ------------------------------------------------------------------ */
/*  Image helpers                                                      */
/* ------------------------------------------------------------------ */

function imageToLuminance(img: ImageData): Uint8Array {
  const count = img.width * img.height;
  const lum = new Uint8Array(count);
  for (let i = 0; i < count; i++) {
    const o = i * 4;
    lum[i] = Math.round(0.299 * img.data[o] + 0.587 * img.data[o + 1] + 0.114 * img.data[o + 2]);
  }
  return lum;
}

function quickThreshold(lum: Uint8Array): number {
  let sum = 0;
  for (const v of lum) sum += v;
  return sum / lum.length;
}


/** Same anchor-cell check used by the encoder — keeps them in sync. */
function isAnchorCell(
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
