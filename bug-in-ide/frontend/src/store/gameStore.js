import { create } from 'zustand';
import { generateCodeWithErrors } from '../utils/codeGenerator';

// Initial positions
const INITIAL_LINE = 1;
const INITIAL_COLUMN = 1; // placeholder for future horizontal movement

export const useGameStore = create((set, get) => ({
  bug: {
    line: INITIAL_LINE,
    column: INITIAL_COLUMN,
  },
  elapsedTime: 0,
  scansSurvived: 0,
  status: 'alive', // 'alive' | 'dead' | 'escaped'
  
  // Compiler scan state
  compilerScan: {
    currentLine: 0,
    isActive: false,
    speed: 1500, // ms per line - faster for better gameplay
    lastScanTime: 0
  },
  
  // Code lines with error information
  codeLines: generateCodeWithErrors(),
  
  // Game mechanics
  hiddenInError: false,

  // Direct setters
  setBugPosition: ({ line, column }) => {
    const { codeLines } = get();
    const targetLine = codeLines.find(l => l.lineNumber === line);
    const hiddenInError = targetLine ? targetLine.hasError : false;
    
    set(state => ({
      bug: {
        line: Math.max(1, line),
        column: Math.max(1, column ?? state.bug.column),
      },
      hiddenInError
    }));
  },
  
  moveBug: (direction, maxLines) => {
    const { bug, status, codeLines } = get();
    if (status !== 'alive') return;
    let { line, column } = bug;
    switch (direction) {
      case 'up':
        line = Math.max(1, line - 1);
        break;
      case 'down':
        if (maxLines) line = Math.min(maxLines, line + 1); else line = line + 1;
        break;
      case 'left':
        column = Math.max(1, column - 1);
        break;
      case 'right':
        column = column + 1;
        break;
      default:
        break;
    }
    
    // Check if new position is in an error line
    const targetLine = codeLines.find(l => l.lineNumber === line);
    const hiddenInError = targetLine ? targetLine.hasError : false;
    
    set({ 
      bug: { line, column },
      hiddenInError
    });
  },
  
  // Compiler scan methods
  startCompilerScan: () => set(state => ({
    compilerScan: {
      ...state.compilerScan,
      currentLine: 1,
      isActive: true,
      lastScanTime: Date.now()
    }
  })),
  
  updateCompilerScan: () => {
    const { compilerScan, codeLines } = get();
    if (!compilerScan.isActive) return;
    
    const now = Date.now();
    if (now - compilerScan.lastScanTime >= compilerScan.speed) {
      const nextLine = compilerScan.currentLine + 1;
      const maxLines = codeLines.length;
      
      if (nextLine > maxLines) {
        // Restart from top
        set(state => ({
          compilerScan: {
            ...state.compilerScan,
            currentLine: 1,
            lastScanTime: now
          },
          scansSurvived: state.scansSurvived + 1
        }));
      } else {
        set(state => ({
          compilerScan: {
            ...state.compilerScan,
            currentLine: nextLine,
            lastScanTime: now
          }
        }));
      }
    }
  },
  
  stopCompilerScan: () => set(state => ({
    compilerScan: {
      ...state.compilerScan,
      isActive: false
    }
  })),
  
  checkBugDetection: () => {
    const { bug, compilerScan, hiddenInError, status } = get();
    
    // Don't check if game is already over or scan is not active
    if (status !== 'alive' || !compilerScan.isActive) return false;
    
    if (compilerScan.currentLine === bug.line && compilerScan.currentLine > 0) {
      if (hiddenInError) {
        // 30% chance of detection when hidden in error
        if (Math.random() < 0.3) {
          set({ status: 'dead' });
          // Add a small delay to show the detection moment
          setTimeout(() => {
            document.body.classList.add('detection-flash');
            setTimeout(() => document.body.classList.remove('detection-flash'), 200);
          }, 100);
          return true;
        }
      } else {
        // 100% detection when not hidden in error
        set({ status: 'dead' });
        // Add a small delay to show the detection moment
        setTimeout(() => {
          document.body.classList.add('detection-flash');
          setTimeout(() => document.body.classList.remove('detection-flash'), 200);
        }, 100);
        return true;
      }
    }
    return false;
  },
  
  // Generate new code with errors
  regenerateCode: () => set({
    codeLines: generateCodeWithErrors()
  }),
  incrementTime: () => set(state => ({ elapsedTime: state.elapsedTime + 1 })),
  incrementScans: () => set(state => ({ scansSurvived: state.scansSurvived + 1 })),
  setStatus: (status) => set({ status }),
  resetGame: () => set({
    bug: { line: INITIAL_LINE, column: INITIAL_COLUMN },
    elapsedTime: 0,
    scansSurvived: 0,
    status: 'alive',
    codeLines: generateCodeWithErrors(),
    hiddenInError: false,
    compilerScan: {
      currentLine: 0,
      isActive: false,
      speed: 2000,
      lastScanTime: 0
    }
  }),
}));

export default useGameStore;
