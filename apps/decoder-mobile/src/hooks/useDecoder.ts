/*
 * useDecoder — orchestrates the decode loop.
 *
 * Once scanning starts, it captures camera frames at a steady
 * interval, feeds them through the core decoder, and tracks
 * progress until all frames have been received.
 */

import { useState, useRef, useCallback } from 'react';
import { readFrame, DataAssembler } from '@s2c/core';
import type { DecodeProgress } from '@s2c/core';


const SCAN_INTERVAL_MS = 100; // ~10 scans per second

interface DecoderState {
  scanning: boolean;
  progress: DecodeProgress;
  result: string | null;
}

const initialProgress: DecodeProgress = {
  receivedFrames: 0,
  totalFrames: 0,
  receivedIndices: new Set(),
  complete: false,
};

export function useDecoder() {
  const [state, setState] = useState<DecoderState>({
    scanning: false,
    progress: initialProgress,
    result: null,
  });

  const assemblerRef = useRef(new DataAssembler());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /**
   * Begin scanning. Pass a function that returns the current
   * camera frame as ImageData (or null if unavailable).
   */
  const startScanning = useCallback(
    (captureFrame: () => ImageData | null) => {
      assemblerRef.current.reset();
      setState({ scanning: true, progress: initialProgress, result: null });

      timerRef.current = setInterval(() => {
        const frame = captureFrame();
        if (!frame) return;

        const decoded = readFrame(frame);
        if (!decoded) return;

        const progress = assemblerRef.current.addFrame(decoded);

        setState((prev) => {
          if (progress.complete) {
            stopTimer();
            const result = assemblerRef.current.getData();
            return { scanning: false, progress, result };
          }
          return { ...prev, progress };
        });
      }, SCAN_INTERVAL_MS);
    },
    [],
  );

  /** Stop scanning without clearing results. */
  const stopScanning = useCallback(() => {
    stopTimer();
    setState((prev) => ({ ...prev, scanning: false }));
  }, []);

  /** Reset everything for a fresh scan. */
  const reset = useCallback(() => {
    stopTimer();
    assemblerRef.current.reset();
    setState({ scanning: false, progress: initialProgress, result: null });
  }, []);

  function stopTimer() {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  return {
    scanning: state.scanning,
    progress: state.progress,
    result: state.result,
    startScanning,
    stopScanning,
    reset,
  };
}
