import { useState } from 'react';
import { useEncoder } from './hooks/useEncoder';
import { TextInput } from './components/TextInput';
import { FrameCanvas } from './components/FrameCanvas';
import { Controls } from './components/Controls';

export function App() {
  const [text, setText] = useState('');
  const encoder = useEncoder();

  function handleEncode() {
    encoder.encode(text);
  }

  const frameInfo = encoder.currentFrame
    ? `Frame ${encoder.currentIndex + 1} / ${encoder.frames.length}`
    : 'No frames generated';

  return (
    <main className="app">
      <header className="app__header">
        <h1 className="app__title">Optidropper Encoder</h1>
        <p className="app__subtitle">
          Convert text into animated visual frames for optical transfer
        </p>
      </header>

      <div className="app__body">
        {/* Left column: input & controls */}
        <div className="card">
          <span className="card__label">Message</span>
          <TextInput
            value={text}
            onChange={setText}
            disabled={encoder.playing}
          />
          <Controls
            hasFrames={encoder.frames.length > 0}
            playing={encoder.playing}
            fps={encoder.fps}
            onEncode={handleEncode}
            onPlay={encoder.play}
            onPause={encoder.pause}
            onFpsChange={encoder.setFps}
          />
          <p className={`status ${encoder.playing ? 'status--active' : ''}`}>
            {frameInfo}
          </p>
        </div>

        {/* Right column: live preview */}
        <div className="card">
          <span className="card__label">Preview</span>
          <FrameCanvas frame={encoder.currentFrame} />
        </div>
      </div>
    </main>
  );
}
