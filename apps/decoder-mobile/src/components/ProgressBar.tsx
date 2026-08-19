import type { DecodeProgress } from '@s2c/core';

interface ProgressBarProps {
  progress: DecodeProgress;
}

/**
 * Visual progress indicator showing how many frames have been
 * captured vs. the total needed.
 */
export function ProgressBar({ progress }: ProgressBarProps) {
  const { receivedFrames, totalFrames, complete } = progress;

  const percent = totalFrames > 0
    ? Math.round((receivedFrames / totalFrames) * 100)
    : 0;

  const label = totalFrames > 0
    ? `${receivedFrames} / ${totalFrames} frames`
    : 'Waiting for signal…';

  return (
    <div className="progress">
      <div className="progress__row">
        <span className="progress__label">{label}</span>
        <span className="progress__value">{percent}%</span>
      </div>
      <div className="progress__track">
        <div
          className={`progress__fill ${complete ? 'progress__fill--complete' : ''}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
