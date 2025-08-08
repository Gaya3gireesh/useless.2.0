import React, { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';

const HUD = () => {
  const { bug, elapsedTime, scansSurvived, status, incrementTime } = useGameStore(state => ({
    bug: state.bug,
    elapsedTime: state.elapsedTime,
    scansSurvived: state.scansSurvived,
    status: state.status,
    incrementTime: state.incrementTime,
  }));

  useEffect(() => {
    const id = setInterval(() => incrementTime(), 1000);
    return () => clearInterval(id);
  }, [incrementTime]);

  return (
    <div className="hud-container">
      <div className="hud-row"><span className="hud-label">Line:</span> {bug.line}</div>
      <div className="hud-row"><span className="hud-label">Column:</span> {bug.column}</div>
      <div className="hud-row"><span className="hud-label">Time:</span> {elapsedTime}s</div>
      <div className="hud-row"><span className="hud-label">Scans:</span> {scansSurvived}</div>
      <div className={`hud-row status-${status}`}><span className="hud-label">Status:</span> {status}</div>
    </div>
  );
};

export default HUD;
