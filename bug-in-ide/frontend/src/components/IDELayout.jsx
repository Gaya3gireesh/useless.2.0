import React from 'react';
import CodeEditor from './CodeEditor';
import CompilerScan from './CompilerScan';

const IDELayout = () => {
  const [gameOver, setGameOver] = React.useState(false);
  const [bugPosition, setBugPosition] = React.useState(12); // Bug on line 12

  const handleGameOver = () => {
    setGameOver(true);
    alert('🐛 GAME OVER! The compiler found your bug!');
    // Reset after 3 seconds
    setTimeout(() => {
      setGameOver(false);
      setBugPosition(Math.floor(Math.random() * 25) + 1); // New random bug position
    }, 3000);
  };

  return (
    <div className="ide-container">
      {/* Left Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-icon active">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M14.5 3l-.5.5L9.5 8l4.5 4.5.5.5-.5.5L13 14.5 8.5 10 4 14.5 2.5 13 7 8.5 2.5 4 4 2.5 8.5 7 13 2.5z"/>
            </svg>
          </div>
          <div className="sidebar-icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M15.7 13.3l-3.81-3.83A5.93 5.93 0 0 0 13 6c0-3.31-2.69-6-6-6S1 2.69 1 6s2.69 6 6 6c1.3 0 2.48-.41 3.47-1.11l3.83 3.81c.19.2.45.3.7.3.25 0 .52-.09.7-.3a.996.996 0 0 0 0-1.41v.01zM7 10.7c-2.59 0-4.7-2.11-4.7-4.7 0-2.59 2.11-4.7 4.7-4.7 2.59 0 4.7 2.11 4.7 4.7 0 2.59-2.11 4.7-4.7 4.7z"/>
            </svg>
          </div>
        </div>
        
        <div className="file-explorer">
          <div className="explorer-header">EXPLORER</div>
          <div className="file-tree">
            <div className="folder">
              <span className="folder-icon">📁</span>
              <span>src</span>
            </div>
            <div className="file indent">
              <span className="file-icon">📄</span>
              <span>App.jsx</span>
            </div>
            <div className="file indent">
              <span className="file-icon">📄</span>
              <span>main.jsx</span>
            </div>
            <div className="file indent">
              <span className="file-icon">📄</span>
              <span>index.css</span>
            </div>
            <div className="folder">
              <span className="folder-icon">📁</span>
              <span>components</span>
            </div>
            <div className="file indent">
              <span className="file-icon">📄</span>
              <span>IDELayout.jsx</span>
            </div>
            <div className="file">
              <span className="file-icon">🐍</span>
              <span>app.py</span>
            </div>
            <div className="file">
              <span className="file-icon">📄</span>
              <span>package.json</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        {/* Tab Bar */}
        <div className="tab-bar">
          <div className="tab active">
            <span className="tab-icon">📄</span>
            <span>main.js</span>
            <button className="tab-close">×</button>
          </div>
          <div className="tab">
            <span className="tab-icon">🐍</span>
            <span>app.py</span>
            <button className="tab-close">×</button>
          </div>
          <div className="tab">
            <span className="tab-icon">📄</span>
            <span>IDELayout.jsx</span>
            <button className="tab-close">×</button>
          </div>
        </div>

        {/* Code Editor */}
        <div style={{ position: 'relative' }}>
          <CodeEditor />
          
          {/* Compiler Scan Overlay */}
          <CompilerScan 
            bugPosition={bugPosition}
            onGameOver={handleGameOver}
            isActive={!gameOver}
          />
          
          {/* Game Over Overlay */}
          {gameOver && (
            <div className="game-over-overlay">
              <div className="game-over-message">
                <h2>🐛 BUG DETECTED!</h2>
                <p>The compiler found your bug on line {bugPosition}</p>
                <p>Restarting scan...</p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Terminal Panel */}
        <div className="terminal-panel">
          <div className="terminal-header">
            <div className="terminal-tabs">
              <div className="terminal-tab active">TERMINAL</div>
              <div className="terminal-tab">PROBLEMS</div>
              <div className="terminal-tab">OUTPUT</div>
              <div className="terminal-tab">DEBUG CONSOLE</div>
            </div>
            <div className="terminal-controls">
              <button className="terminal-btn">+</button>
              <button className="terminal-btn">⌄</button>
              <button className="terminal-btn">×</button>
            </div>
          </div>
          <div className="terminal-content">
            <div className="terminal-line">
              <span className="terminal-prompt">user@computer:</span>
              <span className="terminal-path">~/project$</span>
              <span className="terminal-command">npm run dev</span>
            </div>
            <div className="terminal-line">
              <span className="terminal-output">  VITE v5.0.8  ready in 432 ms</span>
            </div>
            <div className="terminal-line">
              <span className="terminal-output">  ➜  Local:   http://localhost:5173/</span>
            </div>
            <div className="terminal-line">
              <span className="terminal-output">  ➜  Network: use --host to expose</span>
            </div>
            <div className="terminal-line">
              <span className="terminal-prompt">user@computer:</span>
              <span className="terminal-path">~/project$</span>
              <span className="terminal-cursor">_</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IDELayout;
