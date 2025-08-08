import React from 'react';
import { useGameStore } from '../store/gameStore';

const GameOverModal = () => {
  const { status, scansSurvived, elapsedTime, resetGame } = useGameStore(state => ({
    status: state.status,
    scansSurvived: state.scansSurvived,
    elapsedTime: state.elapsedTime,
    resetGame: state.resetGame
  }));

  if (status !== 'dead') return null;

  const handleRestart = () => {
    resetGame();
  };

  const handleClose = () => {
    resetGame();
  };

  return (
    <div className="game-over-overlay">
      <div className="game-over-modal">
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title">
            <span className="error-icon">🚨</span>
            <span>COMPILER ERROR DETECTED</span>
          </div>
          <button className="modal-close" onClick={handleClose}>×</button>
        </div>
        
        {/* Modal Content */}
        <div className="modal-content">
          <div className="error-message">
            <div className="error-line">
              <span className="line-number">Line {Math.floor(Math.random() * 50) + 1}</span>
              <span className="error-text">Fatal Error: Bug detected in runtime execution</span>
            </div>
            <div className="error-details">
              <p>🐞 <strong>Runtime Exception:</strong> Unauthorized bug entity found in code execution context</p>
              <p>📊 <strong>Process terminated after {elapsedTime} seconds</strong></p>
              <p>🔄 <strong>Scan cycles survived:</strong> {scansSurvived}</p>
            </div>
          </div>
          
          <div className="compiler-output">
            <div className="output-header">COMPILER OUTPUT:</div>
            <div className="output-text">
              <div className="output-line">Compilation failed with 1 error</div>
              <div className="output-line error">Error: Bug entity detected at runtime</div>
              <div className="output-line">  Expected: Clean code execution</div>
              <div className="output-line">  Actual: Unauthorized bug presence</div>
              <div className="output-line warning">Warning: System security compromised</div>
              <div className="output-line">Build process terminated.</div>
            </div>
          </div>
        </div>
        
        {/* Modal Actions */}
        <div className="modal-actions">
          <button className="btn btn-primary" onClick={handleRestart}>
            🔄 Restart Process
          </button>
          <button className="btn btn-secondary" onClick={handleClose}>
            📝 Debug Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOverModal;
