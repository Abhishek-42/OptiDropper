/*
 * useEncoder — hook that bridges the core encoding logic with
 * React state. Manages frame generation and playback timing.
 */

import { useState, useRef, useCallback } from 'react';
import { textToBinary, buildFrames, DEFAULT_FPS } from '@s2c/core';
import type { EncodedFrame } from '@s2c/core';


interface EncoderState {
  frames: EncodedFrame[];
  currentIndex: number;
  playing: boolean;
  fps: number;
}

export function useEncoder() {
  const [state, setState] = useState<EncoderState>({
    frames: [],
    currentIndex: 0,
    playing: false,
    fps: DEFAULT_FPS,
  });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /** Generate frames from raw text. Does not start playback. */
  const encode = useCallback((text: string) => {
    if (!text.trim()) return;

    const binary = textToBinary(text);
    const frames = buildFrames(binary);

    stopPlayback();
    setState((prev) => ({ ...prev, frames, currentIndex: 0 }));
  }, []);

  /** Start cycling through frames at the current FPS. */
  const play = useCallback(() => {
    setState((prev) => {
      if (prev.frames.length === 0) return prev;

      stopTimer();
      timerRef.current = setInterval(() => {
        setState((s) => ({
          ...s,
          currentIndex: (s.currentIndex + 1) % s.frames.length,
        }));
      }, 1000 / prev.fps);

      return { ...prev, playing: true };
    });
  }, []);

  /** Pause playback without resetting position. */
  const pause = useCallback(() => {
    stopTimer();
    setState((prev) => ({ ...prev, playing: false }));
  }, []);

  /** Change playback speed. Restarts the timer if already playing. */
  const setFps = useCallback((fps: number) => {
    setState((prev) => {
      if (prev.playing) {
        stopTimer();
        timerRef.current = setInterval(() => {
          setState((s) => ({
            ...s,
            currentIndex: (s.currentIndex + 1) % s.frames.length,
          }));
        }, 1000 / fps);
      }
      return { ...prev, fps };
    });
  }, []);

  const stopPlayback = useCallback(() => {
    stopTimer();
    setState((prev) => ({ ...prev, playing: false, currentIndex: 0 }));
  }, []);

  function stopTimer() {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  const currentFrame = state.frames[state.currentIndex] ?? null;

  return {
    frames: state.frames,
    currentFrame,
    currentIndex: state.currentIndex,
    playing: state.playing,
    fps: state.fps,
    encode,
    play,
    pause,
    setFps,
    stopPlayback,
  };
}
