import { useRef, useEffect } from 'react';

interface CameraViewProps {
  onReady: (video: HTMLVideoElement, canvas: HTMLCanvasElement) => void;
  active: boolean;
}

/**
 * Camera viewport with decorative scan overlay.
 * The hidden canvas is used internally for frame capture —
 * only the video element is visible to the user.
 */
export function CameraView({ onReady, active }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (videoRef.current && canvasRef.current) {
      onReady(videoRef.current, canvasRef.current);
    }
  }, [onReady]);

  return (
    <div className="camera-viewport">
      <video
        ref={videoRef}
        id="camera-feed"
        playsInline
        muted
        autoPlay
      />
      <canvas ref={canvasRef} />

      {/* Decorative scan UI */}
      <div className="scan-overlay">
        <div className="scan-corner scan-corner--tl" />
        <div className="scan-corner scan-corner--tr" />
        <div className="scan-corner scan-corner--bl" />
        <div className="scan-corner scan-corner--br" />
        {active && <div className="scan-line" />}
      </div>
    </div>
  );
}
