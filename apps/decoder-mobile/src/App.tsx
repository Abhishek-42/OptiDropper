import { useState, useCallback } from 'react';
import { useCamera } from './hooks/useCamera';
import { useDecoder } from './hooks/useDecoder';
import { CameraView } from './components/CameraView';
import { ProgressBar } from './components/ProgressBar';
import { ResultDisplay } from './components/ResultDisplay';
import { BottomNav } from './components/BottomNav';


export function App() {
  const [activeTab, setActiveTab] = useState('scan');
  const camera = useCamera();
  const decoder = useDecoder();

  const handleCameraReady = useCallback(
    (video: HTMLVideoElement, canvas: HTMLCanvasElement) => {
      camera.setElements(video, canvas);
    },
    [camera.setElements],
  );

  async function handleStartScan() {
    if (!camera.active) {
      await camera.start();
    }
    decoder.startScanning(camera.captureFrame);
  }

  function handleStopScan() {
    decoder.stopScanning();
    camera.stop();
  }

  function handleReset() {
    decoder.reset();
    camera.stop();
  }

  const isScanning = decoder.scanning;
  const isComplete = decoder.progress.complete;

  return (
    <div className="app-shell">
      {/* Top bar */}
      <header className="top-bar">
        <h1 className="top-bar__title">Optidropper</h1>
        <div className="top-bar__actions">
          {isComplete && (
            <button className="icon-btn" onClick={handleReset} title="New scan">
              ↻
            </button>
          )}
        </div>
      </header>

      {/* Main content */}
      <div className="content">
        {/* Status badge */}
        <div className="text-center">
          {isScanning && (
            <span className="badge badge--scanning">
              <span className="badge__dot" />
              Scanning
            </span>
          )}
          {isComplete && (
            <span className="badge badge--complete">
              <span className="badge__dot" />
              Complete
            </span>
          )}
        </div>

        {/* Camera feed */}
        <div className="card">
          <CameraView onReady={handleCameraReady} active={isScanning} />
        </div>

        {/* Progress */}
        <div className="card">
          <span className="card__label">Transfer Progress</span>
          <ProgressBar progress={decoder.progress} />
        </div>

        {/* Action button */}
        {!isScanning && !isComplete && (
          <button
            id="btn-start-scan"
            className="icon-btn"
            style={{
              width: '100%',
              height: '48px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--accent)',
              color: 'white',
              fontSize: '0.9rem',
              fontWeight: 600,
              border: 'none',
            }}
            onClick={handleStartScan}
          >
            Start Scanning
          </button>
        )}

        {isScanning && (
          <button
            id="btn-stop-scan"
            className="icon-btn"
            style={{
              width: '100%',
              height: '48px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-elevated)',
              color: 'var(--text-secondary)',
              fontSize: '0.9rem',
              fontWeight: 600,
              border: '1px solid var(--border-subtle)',
            }}
            onClick={handleStopScan}
          >
            Stop
          </button>
        )}

        {/* Result */}
        {(isComplete || decoder.result !== null) && (
          <div className="card card--highlight">
            <span className="card__label">Received Data</span>
            <ResultDisplay result={decoder.result} />
          </div>
        )}

        {/* Camera error */}
        {camera.error && (
          <div className="card" style={{ borderColor: 'var(--error)' }}>
            <span className="card__label" style={{ color: 'var(--error)' }}>Error</span>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              {camera.error}
            </p>
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
