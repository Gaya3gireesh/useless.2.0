import React from 'react';
import { useGameStore } from '../store/gameStore';

const StartScreen = () => {
  const { gameStarted, startGame } = useGameStore(state => ({
    gameStarted: state.gameStarted,
    startGame: state.startGame
  }));

  if (gameStarted) return null;

  const handleStartGame = () => {
    startGame();
  };

  return (
    <div className="start-screen-overlay">
      <div className="start-screen">
        {/* Header */}
        <div className="start-header">
          <div className="ide-logo">
            <span className="logo-icon">🐞</span>
            <span className="logo-text">IDE Bug Hunter</span>
          </div>
          <div className="version-info">v1.0.0</div>
        </div>

        {/* Main Content */}
        <div className="start-content">
          <div className="game-title">
            <h1>🚨 COMPILER SCAN DETECTED</h1>
            <p className="subtitle">A stealth survival game in your IDE</p>
          </div>

          <div className="game-description">
            <div className="feature-grid">
              <div className="feature-item">
                <div className="feature-icon">🐞</div>
                <div className="feature-text">
                  <h3>Play as a Bug</h3>
                  <p>Navigate through code using arrow keys</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">🔴</div>
                <div className="feature-text">
                  <h3>Avoid the Scan</h3>
                  <p>Red laser scans line by line looking for bugs</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">🛡️</div>
                <div className="feature-text">
                  <h3>Hide in Errors</h3>
                  <p>Syntax errors provide 70% protection from detection</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">⚠️</div>
                <div className="feature-text">
                  <h3>Stay Alert</h3>
                  <p>Clean code lines offer no protection - 100% detection!</p>
                </div>
              </div>
            </div>
          </div>

          <div className="controls-info">
            <h3>🎮 Controls</h3>
            <div className="controls-grid">
              <div className="control-item">
                <kbd>↑</kbd> <span>Move Up</span>
              </div>
              <div className="control-item">
                <kbd>↓</kbd> <span>Move Down</span>
              </div>
              <div className="control-item">
                <kbd>←</kbd> <span>Move Left</span>
              </div>
              <div className="control-item">
                <kbd>→</kbd> <span>Move Right</span>
              </div>
            </div>
          </div>

          <div className="difficulty-info">
            <h3>🏆 Clear Victory Conditions</h3>
            <div className="strategy-tips">
              <div className="tip">🎯 <strong>WIN: Survive 5 complete scans</strong> - Master the art of evasion</div>
              <div className="tip">⏱️ <strong>OR WIN: Survive for 30 seconds</strong> - Outlast the compiler</div>
              <div className="tip">� <strong>LOSE: Get detected by scan</strong> - 100% detection in clean code, 30% in errors</div>
              <div className="tip">� Monitor progress in HUD - exact counts shown</div>
              <div className="tip">� Red lines = syntax errors = safer hiding spots</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="start-footer">
          <button className="start-game-btn" onClick={handleStartGame}>
            <span className="btn-icon">🚀</span>
            <span>START DEBUGGING SESSION</span>
          </button>
          <div className="footer-text">
            Built with React & FastAPI • Inspired by classic stealth games
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartScreen;
