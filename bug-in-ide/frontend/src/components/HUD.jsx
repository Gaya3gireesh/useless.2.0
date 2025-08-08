import React, { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';

const HUD = () => {
  const { 
    bug, 
    elapsedTime, 
    scansSurvived, 
    status, 
    incrementTime, 
    hiddenInError, 
    compilerScan,
    regenerateCode,
    resetGame 
  } = useGameStore(state => ({
    bug: state.bug,
    elapsedTime: state.elapsedTime,
    scansSurvived: state.scansSurvived,
    status: state.status,
    incrementTime: state.incrementTime,
    hiddenInError: state.hiddenInError,
    compilerScan: state.compilerScan,
    regenerateCode: state.regenerateCode,
    resetGame: state.resetGame
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
      <div className="hud-row"><span className="hud-label">Scan Line:</span> {compilerScan.currentLine}</div>
      <div className={`hud-row ${hiddenInError ? 'hidden-in-error' : 'exposed'}`}>
        <span className="hud-label">Status:</span> 
        {hiddenInError ? '🛡️ Hidden in Error (70% safe)' : '⚠️ Exposed (100% detection)'}
      </div>
      <div className={`hud-row status-${status}`}><span className="hud-label">Game:</span> {status}</div>
      
      {status === 'alive' && (
        <button 
          className="regenerate-btn"
          onClick={regenerateCode}
          title="Generate new code with different error positions"
        >
          🔄 New Code
        </button>
      )}
      
      {status !== 'alive' && (
        <button 
          className="regenerate-btn"
          onClick={resetGame}
          title="Start a new game"
        >
          🎮 Start New Game
        </button>
      )}
    </div>
  );
};

export default HUD;
