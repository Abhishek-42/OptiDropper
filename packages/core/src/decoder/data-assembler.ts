/*
 * Data assembler — collects decoded frames and reconstructs the
 * original text payload once all unique frames have arrived.
 *
 * This is the "receiver state machine". It:
 *   - Deduplicates frames by index
 *   - Tracks progress toward completion
 *   - Joins chunks in the correct order when done
 */

import type { DecodedFrameData, DecodeProgress, IDataAssembler } from '../protocol/types';
import { binaryToText } from '../encoder/text-serializer';


export class DataAssembler implements IDataAssembler {
  private chunks = new Map<number, string>();
  private totalFrames = 0;

  /**
   * Feeds a decoded frame into the assembler.
   * Invalid frames (bad checksum) are silently ignored.
   */
  addFrame(frame: DecodedFrameData): DecodeProgress {
    if (frame.valid && !this.chunks.has(frame.index)) {
      this.chunks.set(frame.index, frame.payload);
      this.totalFrames = frame.total;
    }

    return this.getProgress();
  }

  /** Returns the reconstructed text if all frames are in, otherwise null. */
  getData(): string | null {
    if (!this.isComplete()) return null;

    // Concatenate chunks in index order
    let binary = '';
    for (let i = 0; i < this.totalFrames; i++) {
      binary += this.chunks.get(i) ?? '';
    }

    return binaryToText(binary);
  }

  /** Resets the assembler for a new transfer session. */
  reset(): void {
    this.chunks.clear();
    this.totalFrames = 0;
  }

  private isComplete(): boolean {
    return this.totalFrames > 0 && this.chunks.size >= this.totalFrames;
  }

  private getProgress(): DecodeProgress {
    return {
      receivedFrames: this.chunks.size,
      totalFrames: this.totalFrames,
      receivedIndices: new Set(this.chunks.keys()),
      complete: this.isComplete(),
    };
  }
}
