import { MIN_FPS, MAX_FPS } from '@s2c/core';

interface ControlsProps {
  hasFrames: boolean;
  playing: boolean;
  fps: number;
  onEncode: () => void;
  onPlay: () => void;
  onPause: () => void;
  onFpsChange: (fps: number) => void;
}

/**
 * Playback controls: Encode button, Play/Pause, and speed slider.
 */
export function Controls({
  hasFrames,
  playing,
  fps,
  onEncode,
  onPlay,
  onPause,
  onFpsChange,
}: ControlsProps) {
  return (
    <div className="controls">
      <button
        id="btn-encode"
        className="btn btn--primary"
        onClick={onEncode}
      >
        Encode
      </button>

      {hasFrames && !playing && (
        <button
          id="btn-play"
          className="btn btn--secondary"
          onClick={onPlay}
        >
          ▶ Play
        </button>
      )}

      {hasFrames && playing && (
        <button
          id="btn-pause"
          className="btn btn--secondary"
          onClick={onPause}
        >
          ❚❚ Pause
        </button>
      )}

      {hasFrames && (
        <div className="speed-control">
          <label htmlFor="speed-slider">Speed</label>
          <input
            id="speed-slider"
            type="range"
            min={MIN_FPS}
            max={MAX_FPS}
            value={fps}
            onChange={(e) => onFpsChange(Number(e.target.value))}
          />
          <span>{fps} fps</span>
        </div>
      )}
    </div>
  );
}
