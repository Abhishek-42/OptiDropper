import { useRef, useEffect } from 'react';
import type { EncodedFrame } from '@s2c/core';
import { CELL_COLORS } from '@s2c/core';


interface FrameCanvasProps {
  frame: EncodedFrame | null;
}

/**
 * Renders a single encoded frame onto an HTML canvas.
 * Each boolean cell becomes a filled or empty square.
 * The canvas uses `image-rendering: pixelated` in CSS so
 * we can draw at the grid resolution and let the browser scale.
 */
export function FrameCanvas({ frame }: FrameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!frame) {
      // Draw an idle state
      canvas.width = 200;
      canvas.height = 200;
      ctx.fillStyle = CELL_COLORS.background;
      ctx.fillRect(0, 0, 200, 200);
      ctx.fillStyle = '#444';
      ctx.font = '14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Waiting for input…', 100, 105);
      return;
    }

    const rows = frame.grid.length;
    const cols = frame.grid[0].length;

    // Draw at native grid resolution for crisp pixels
    canvas.width = cols;
    canvas.height = rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        ctx.fillStyle = frame.grid[r][c] ? CELL_COLORS.filled : CELL_COLORS.empty;
        ctx.fillRect(c, r, 1, 1);
      }
    }
  }, [frame]);

  return (
    <div className="canvas-wrap">
      <canvas ref={canvasRef} id="frame-canvas" />
    </div>
  );
}
