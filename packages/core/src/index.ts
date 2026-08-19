/*
 * @s2c/core — Screen-to-Camera optical data transfer protocol.
 *
 * This package contains the pure logic for encoding text into visual
 * grid frames and decoding camera captures back into text. It has
 * zero dependencies on DOM, React, or any UI framework.
 */

// Protocol layer
export type {
  GridConfig,
  EncodedFrame,
  DecodedFrameData,
  DecodeProgress,
  IFrameEncoder,
  IFrameDecoder,
  IDataAssembler,
} from './protocol/types';

export {
  DEFAULT_GRID,
  ANCHOR_PATTERN,
  HEADER_INDEX_BITS,
  HEADER_TOTAL_BITS,
  CHECKSUM_BITS,
  TOTAL_HEADER_BITS,
  DEFAULT_FPS,
  MIN_FPS,
  MAX_FPS,
  CELL_COLORS,
} from './protocol/constants';

export { computeChecksum, toBits, fromBits } from './protocol/checksum';

// Encoder
export { textToBinary, binaryToText } from './encoder/text-serializer';
export { buildFrames } from './encoder/frame-builder';

// Decoder
export { detectGrid } from './decoder/anchor-detector';
export type { DetectedGrid, Point } from './decoder/anchor-detector';
export { readFrame } from './decoder/grid-sampler';
export { DataAssembler } from './decoder/data-assembler';
