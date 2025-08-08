import React, { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../store/gameStore';

// Keep in sync with Bug.jsx
const LINE_HEIGHT = 19;
const TOP_PADDING = 8;

/**
 * CompilerScan
 * A horizontal red laser bar that animates left->right once (no loop for now).
 * After completing the scan animation it reports the bug's current line to the backend.
 */
const CompilerScan = ({ durationMs = 1600, thickness = 4 }) => {
  const { bug, setStatus } = useGameStore(state => ({ bug: state.bug, setStatus: state.setStatus }));
  const [startLine] = useState(bug.line); // snapshot line at start
  const [started, setStarted] = useState(false);
  const laserRef = useRef(null);

  useEffect(() => {
    if (!started) {
      // trigger CSS animation by adding a class after paint
      requestAnimationFrame(() => setStarted(true));
    }
  }, [started]);

  const handleAnimationEnd = async () => {
    // On scan completion, send bug line to backend
    try {
      const res = await fetch('/scan-bug-position', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ line: bug.line, scannedLine: startLine })
      });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.hit) {
          setStatus('dead');
        }
      }
    } catch (e) {
      // Silently ignore for now; backend not implemented yet.
    }
  };

  const top = TOP_PADDING + (startLine - 1) * LINE_HEIGHT + Math.round((LINE_HEIGHT - thickness) / 2);

  return (
    <div
      ref={laserRef}
      className={`compiler-scan-laser ${started ? 'active' : ''}`}
      style={{ top, height: thickness, '--scan-duration': `${durationMs}ms` }}
      onAnimationEnd={handleAnimationEnd}
      aria-hidden="true"
    />
  );
};

export default CompilerScan;
