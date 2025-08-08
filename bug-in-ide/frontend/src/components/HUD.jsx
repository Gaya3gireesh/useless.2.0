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
    resetGame,
    winConditions 
  } = useGameStore(state => ({
    bug: state.bug,
    elapsedTime: state.elapsedTime,
    scansSurvived: state.scansSurvived,
    status: state.status,
    incrementTime: state.incrementTime,
    hiddenInError: state.hiddenInError,
    compilerScan: state.compilerScan,
    regenerateCode: state.regenerateCode,
    resetGame: state.resetGame,
    winConditions: state.winConditions
  }));

  useEffect(() => {
    const id = setInterval(() => incrementTime(), 1000);
    return () => clearInterval(id);
  }, [incrementTime]);

  return (
    <div className="hud-container">
      <div className="hud-row"><span className="hud-label">Line:</span> {bug.line}</div>
      <div className="hud-row"><span className="hud-label">Column:</span> {bug.column}</div>
      
      {/* Clear Win Progress */}
      <div className="hud-section-title">🏆 WIN CONDITIONS:</div>
      <div className={`hud-row ${elapsedTime >= winConditions.targetTime ? 'status-won' : ''}`}>
        <span className="hud-label">Time:</span> {elapsedTime}s / {winConditions.targetTime}s
      </div>
      <div className={`hud-row ${scansSurvived >= winConditions.targetScans ? 'status-won' : ''}`}>
        <span className="hud-label">Scans:</span> {scansSurvived} / {winConditions.targetScans}
      </div>
      
      {/* Current Status */}
      <div className="hud-section-title">📊 STATUS:</div>
      <div className="hud-row"><span className="hud-label">Scan Line:</span> {compilerScan.currentLine}</div>
      <div className={`hud-row ${hiddenInError ? 'hidden-in-error' : 'exposed'}`}>
        <span className="hud-label">Safety:</span> 
        {hiddenInError ? '🛡️ 70% Safe (In Error)' : '⚠️ 0% Safe (Exposed)'}
      </div>
      <div className={`hud-row status-${status}`}><span className="hud-label">Game:</span> {status.toUpperCase()}</div>
      
      <div className="hud-buttons">
        {status === 'alive' && (
          <>
            <button 
              className="regenerate-btn"
              onClick={regenerateCode}
              title="Generate new code with different error positions"
            >
              🔄 New Code
            </button>
            <button 
              className="regenerate-btn new-game-btn"
              onClick={resetGame}
              title="Start a completely new game"
            >
              🎮 New Game
            </button>
          </>
        )}
        
        {(status === 'dead' || status === 'won') && (
          <button 
            className="regenerate-btn"
            onClick={resetGame}
            title="Start a new game"
          >
            🎮 Start New Game
          </button>
        )}
      </div>
    </div>
  );
};

export default HUD;
