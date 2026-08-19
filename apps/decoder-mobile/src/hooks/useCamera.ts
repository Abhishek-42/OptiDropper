/*
 * useCamera — manages the phone camera lifecycle.
 *
 * Handles stream acquisition, cleanup, and provides a method
 * to capture a single frame as ImageData for the decoder pipeline.
 */

import { useRef, useState, useCallback, useEffect } from 'react';


interface CameraState {
  active: boolean;
  error: string | null;
}

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [state, setState] = useState<CameraState>({
    active: false,
    error: null,
  });

  /** Binds a video and canvas element for frame capture. */
  const setElements = useCallback(
    (video: HTMLVideoElement | null, canvas: HTMLCanvasElement | null) => {
      videoRef.current = video;
      canvasRef.current = canvas;
    },
    [],
  );

  /** Opens the rear-facing camera. */
  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 960 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setState({ active: true, error: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Camera access denied';
      setState({ active: false, error: message });
    }
  }, []);

  /** Stops the camera and releases resources. */
  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setState({ active: false, error: null });
  }, []);

  /**
   * Captures the current video frame as ImageData.
   * Returns null if the camera isn't running or the video isn't ready.
   */
  const captureFrame = useCallback((): ImageData | null => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return null;

    const w = video.videoWidth;
    const h = video.videoHeight;
    if (w === 0 || h === 0) return null;

    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, w, h);
    return ctx.getImageData(0, 0, w, h);
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return {
    active: state.active,
    error: state.error,
    setElements,
    start,
    stop,
    captureFrame,
  };
}
