import React from 'react';
import CodeLine from './CodeLine';
import Bug from './Bug';
import HUD from './HUD';
import CompilerScan from './CompilerScan';
import GameOverModal from './GameOverModal';
import VictoryModal from './VictoryModal';
import { useGameStore } from '../store/gameStore';

const CodeEditor = ({ fileName }) => {
  const { codeLines } = useGameStore(state => ({ codeLines: state.codeLines }));

  return (
    <div className="ide-code-editor-integrated">
      <HUD />
      {/* Editor Content */}
      <div className="editor-content">
        {/* Line Numbers Gutter */}
        <div className="line-numbers-gutter">
          {codeLines.map((line, index) => (
            <div key={index} className="line-number-item">
              {line.lineNumber}
            </div>
          ))}
        </div>

        {/* Code Content Area */}
        <div className="code-content-area">
          {codeLines.map((line, index) => (
            <CodeLine 
              key={index}
              lineNumber={line.lineNumber}
              text={line.text}
              hasError={line.hasError}
              errorType={line.errorType}
            />
          ))}
          <Bug totalLines={codeLines[codeLines.length - 1].lineNumber} />
          <CompilerScan totalLines={codeLines.length} />
          {/* Cursor */}
          <div className="editor-cursor"></div>
        </div>
      </div>
      
      {/* Game Over Modal */}
      <GameOverModal />
      
      {/* Victory Modal */}
      <VictoryModal />
    </div>
  );
};

export default CodeEditor;
