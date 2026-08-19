/*
 * Protocol type definitions for the S2C data transfer system.
 *
 * These interfaces form the contract between the encoder and decoder.
 * All modules depend on these abstractions, never on concrete implementations.
 */


/* ------------------------------------------------------------------ */
/*  Grid Configuration                                                 */
/* ------------------------------------------------------------------ */

/** Defines the dimensions and anchor layout of the visual grid. */
export interface GridConfig {
  cols: number;
  rows: number;
  anchorSize: number;
}


/* ------------------------------------------------------------------ */
/*  Frame Data                                                         */
/* ------------------------------------------------------------------ */

/** A single frame produced by the encoder, ready to be rendered on screen. */
export interface EncodedFrame {
  index: number;
  total: number;
  grid: boolean[][];
  checksum: number;
}

/** Raw values extracted from a single camera-captured frame. */
export interface DecodedFrameData {
  index: number;
  total: number;
  payload: string;
  valid: boolean;
}


/* ------------------------------------------------------------------ */
/*  Session State                                                      */
/* ------------------------------------------------------------------ */

/** Tracks the receiver's progress toward full payload reconstruction. */
export interface DecodeProgress {
  receivedFrames: number;
  totalFrames: number;
  receivedIndices: Set<number>;
  complete: boolean;
}


/* ------------------------------------------------------------------ */
/*  Abstractions (Dependency Inversion)                                */
/* ------------------------------------------------------------------ */

/** Encodes a text payload into a sequence of visual frames. */
export interface IFrameEncoder {
  encode(text: string, config?: Partial<GridConfig>): EncodedFrame[];
}

/** Attempts to decode a single camera frame into structured data. */
export interface IFrameDecoder {
  processFrame(imageData: ImageData, config?: Partial<GridConfig>): DecodedFrameData | null;
}

/** Collects decoded frames and reassembles the original payload. */
export interface IDataAssembler {
  addFrame(frame: DecodedFrameData): DecodeProgress;
  getData(): string | null;
  reset(): void;
}
