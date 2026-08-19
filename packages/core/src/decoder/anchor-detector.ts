/*
 * Anchor detector — locates the four corner markers in a camera frame.
 *
 * The detection pipeline:
 *   1. Convert RGBA pixels to grayscale luminance
 *   2. Compute an adaptive black/white threshold
 *   3. Search each image quadrant for the bullseye anchor pattern
 *   4. Return the pixel coordinates of all four corners
 *
 * This gives us everything we need to map pixel positions back to
 * grid cell coordinates, even if the camera is slightly off-center.
 */

import type { GridConfig } from '../protocol/types';
import { DEFAULT_GRID } from '../protocol/constants';


/* ------------------------------------------------------------------ */
/*  Public types                                                       */
/* ------------------------------------------------------------------ */

export interface Point {
  x: number;
  y: number;
}

export interface DetectedGrid {
  topLeft: Point;
  topRight: Point;
  bottomLeft: Point;
  bottomRight: Point;
  cellWidth: number;
  cellHeight: number;
}


/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * Attempts to find all four corner anchors in the given image.
 * Returns null if any anchor could not be located.
 */
export function detectGrid(
  imageData: ImageData,
  config: GridConfig = DEFAULT_GRID,
): DetectedGrid | null {
  const { width, height, data } = imageData;

  const luminance = toLuminance(data, width * height);
  const threshold = otsuThreshold(luminance);
  const dark = luminance.map((v) => v < threshold);

  const halfW = Math.floor(width / 2);
  const halfH = Math.floor(height / 2);

  // Each anchor search is confined to its own quadrant
  const topLeft     = scanForAnchor(dark, width, 0,     0,     halfW, halfH, config.anchorSize);
  const topRight    = scanForAnchor(dark, width, halfW, 0,     width, halfH, config.anchorSize);
  const bottomLeft  = scanForAnchor(dark, width, 0,     halfH, halfW, height, config.anchorSize);
  const bottomRight = scanForAnchor(dark, width, halfW, halfH, width, height, config.anchorSize);

  if (!topLeft || !topRight || !bottomLeft || !bottomRight) {
    return null;
  }

  const cellWidth  = (topRight.x - topLeft.x) / (config.cols - config.anchorSize);
  const cellHeight = (bottomLeft.y - topLeft.y) / (config.rows - config.anchorSize);

  if (cellWidth <= 0 || cellHeight <= 0) return null;

  return { topLeft, topRight, bottomLeft, bottomRight, cellWidth, cellHeight };
}


/* ------------------------------------------------------------------ */
/*  Image processing helpers                                           */
/* ------------------------------------------------------------------ */

/** Converts RGBA pixel buffer to a flat grayscale array. */
function toLuminance(rgba: Uint8ClampedArray, pixelCount: number): Uint8Array {
  const lum = new Uint8Array(pixelCount);
  for (let i = 0; i < pixelCount; i++) {
    const off = i * 4;
    lum[i] = Math.round(0.299 * rgba[off] + 0.587 * rgba[off + 1] + 0.114 * rgba[off + 2]);
  }
  return lum;
}


/**
 * Otsu's method — finds the threshold that minimizes intra-class
 * variance between dark and light pixels.
 */
function otsuThreshold(luminance: Uint8Array): number {
  const histogram = new Uint32Array(256);
  for (const v of luminance) histogram[v]++;

  const total = luminance.length;
  let sumAll = 0;
  for (let i = 0; i < 256; i++) sumAll += i * histogram[i];

  let sumBg = 0;
  let weightBg = 0;
  let best = 0;
  let bestThreshold = 128; // sensible fallback

  for (let t = 0; t < 256; t++) {
    weightBg += histogram[t];
    if (weightBg === 0) continue;

    const weightFg = total - weightBg;
    if (weightFg === 0) break;

    sumBg += t * histogram[t];
    const meanBg = sumBg / weightBg;
    const meanFg = (sumAll - sumBg) / weightFg;
    const variance = weightBg * weightFg * (meanBg - meanFg) ** 2;

    if (variance > best) {
      best = variance;
      bestThreshold = t;
    }
  }

  return bestThreshold;
}


/* ------------------------------------------------------------------ */
/*  Anchor pattern scanning                                            */
/* ------------------------------------------------------------------ */

/**
 * Scans a rectangular region for the bullseye anchor pattern.
 * Returns the center point of the best match, or null.
 *
 * Strategy: slide a window whose size roughly matches one anchor
 * and score each position by how well it matches the bullseye.
 */
function scanForAnchor(
  dark: boolean[],
  imgWidth: number,
  x0: number, y0: number,
  x1: number, y1: number,
  anchorSize: number,
): Point | null {
  // We need to estimate the approximate cell size to know how large
  // the anchor appears in pixels. We guess based on the image size
  // and grid size — this works well when the grid fills most of the frame.
  const regionW = x1 - x0;
  const regionH = y1 - y0;

  // The anchor occupies anchorSize cells. If the grid roughly fills
  // the full image, each cell is about (imageWidth / gridCols) px wide.
  // Since we don't know gridCols here, we estimate the anchor block
  // as roughly 15% of the quadrant (anchors are ~3/20 of the grid).
  const blockW = Math.floor(regionW * 0.3);
  const blockH = Math.floor(regionH * 0.3);

  if (blockW < 3 || blockH < 3) return null;

  const step = Math.max(1, Math.floor(Math.min(blockW, blockH) / 8));
  let bestScore = -1;
  let bestX = 0;
  let bestY = 0;

  for (let y = y0; y <= y1 - blockH; y += step) {
    for (let x = x0; x <= x1 - blockW; x += step) {
      const score = scoreBullseye(dark, imgWidth, x, y, blockW, blockH, anchorSize);
      if (score > bestScore) {
        bestScore = score;
        bestX = x;
        bestY = y;
      }
    }
  }

  // Only accept if the score indicates a reasonably strong match
  if (bestScore < 0.5) return null;

  return {
    x: bestX + Math.floor(blockW / 2),
    y: bestY + Math.floor(blockH / 2),
  };
}


/**
 * Scores how well a rectangular region matches the 3×3 bullseye.
 * Returns 0..1 where 1 is a perfect match.
 */
function scoreBullseye(
  dark: boolean[],
  imgWidth: number,
  ox: number, oy: number,
  blockW: number, blockH: number,
  anchorSize: number,
): number {
  const cellW = blockW / anchorSize;
  const cellH = blockH / anchorSize;

  let matches = 0;
  let samples = 0;

  for (let gr = 0; gr < anchorSize; gr++) {
    for (let gc = 0; gc < anchorSize; gc++) {
      // Expected value: border cells dark, center cell light (for 3×3)
      const ring = Math.min(gr, gc, anchorSize - 1 - gr, anchorSize - 1 - gc);
      const expected = ring % 2 === 0; // ring 0 = dark, ring 1 = light

      // Sample a few pixels in the center of this cell
      const cx = Math.floor(ox + gc * cellW + cellW / 2);
      const cy = Math.floor(oy + gr * cellH + cellH / 2);

      const idx = cy * imgWidth + cx;
      if (idx >= 0 && idx < dark.length) {
        if (dark[idx] === expected) matches++;
        samples++;
      }
    }
  }

  return samples > 0 ? matches / samples : 0;
}
