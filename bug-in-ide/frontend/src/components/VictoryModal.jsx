import React from 'react';
import { useGameStore } from '../store/gameStore';

const VictoryModal = () => {
  const { status, scansSurvived, elapsedTime, resetGame, winConditions } = useGameStore(state => ({
    status: state.status,
    scansSurvived: state.scansSurvived,
    elapsedTime: state.elapsedTime,
    resetGame: state.resetGame,
    winConditions: state.winConditions
  }));

  if (status !== 'won') return null;

  const handlePlayAgain = () => {
    resetGame();
  };

  const handleClose = () => {
    resetGame();
  };

  // Determine win reason
  const wonByScans = scansSurvived >= winConditions.targetScans;
  const wonByTime = elapsedTime >= winConditions.targetTime;

  return (
    <div className="victory-overlay">
      <div className="victory-modal">
        {/* Modal Header */}
        <div className="modal-header victory-header">
          <div className="modal-title">
            <span className="victory-icon">🎉</span>
            <span>DEBUGGING SESSION SUCCESSFUL</span>
          </div>
          <button className="modal-close" onClick={handleClose}>×</button>
        </div>
        
        {/* Modal Content */}
        <div className="modal-content">
          <div className="victory-message">
            <div className="success-banner">
              <div className="banner-icon">🏆</div>
              <div className="banner-text">
                <h2>CONGRATULATIONS!</h2>
                <p>You've successfully evaded the compiler scan system and mastered Bug-in-IDE!</p>
              </div>
            </div>
            
            <div className="victory-stats">
              <div className="stat-item primary">
                <div className="stat-icon">⏱️</div>
                <div className="stat-content">
                  <div className="stat-value">{elapsedTime}s</div>
                  <div className="stat-label">Survival Time</div>
                </div>
              </div>
              <div className="stat-item primary">
                <div className="stat-icon">🔄</div>
                <div className="stat-content">
                  <div className="stat-value">{scansSurvived}</div>
                  <div className="stat-label">Scans Survived</div>
                </div>
              </div>
            </div>

            <div className="achievement-details">
              <h3>🎯 Achievement Unlocked</h3>
              {wonByScans && (
                <div className="achievement">
                  <span className="achievement-icon">🛡️</span>
                  <div className="achievement-text">
                    <strong>Scan Master</strong>
                    <p>Survived {winConditions.targetScans} complete compiler scans</p>
                  </div>
                </div>
              )}
              {wonByTime && (
                <div className="achievement">
                  <span className="achievement-icon">⏰</span>
                  <div className="achievement-text">
                    <strong>Time Survivor</strong>
                    <p>Evaded detection for {winConditions.targetTime} seconds</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="victory-output">
            <div className="output-header">SYSTEM STATUS:</div>
            <div className="output-text">
              <div className="output-line success">✓ Bug successfully evaded detection</div>
              <div className="output-line success">✓ Compiler scan cycle completed without errors</div>
              <div className="output-line success">✓ System integrity maintained</div>
              <div className="output-line info">→ Debug session terminated successfully</div>
              <div className="output-line info">→ Ready for next challenge</div>
            </div>
          </div>
        </div>
        
        {/* Modal Actions */}
        <div className="modal-actions">
          <button className="btn btn-primary" onClick={handlePlayAgain}>
            🚀 New Challenge
          </button>
          <button className="btn btn-secondary" onClick={handleClose}>
            🏁 Finish Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default VictoryModal;
