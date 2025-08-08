import { create } from 'zustand';
import { generateCodeWithErrors } from '../utils/codeGenerator';

// Initial positions
const INITIAL_LINE = 1;
const INITIAL_COLUMN = 1; // placeholder for future horizontal movement

export const useGameStore = create((set, get) => ({
  // Game state
  gameStarted: false,
  
  bug: {
    line: INITIAL_LINE,
    column: INITIAL_COLUMN,
  },
  elapsedTime: 0,
  scansSurvived: 0,
  status: 'alive', // 'alive' | 'dead' | 'escaped' | 'won'
  
  // Win conditions - Clear and precise
  winConditions: {
    targetScans: 5,   // Reduced for better gameplay - Win after surviving 5 complete scans
    targetTime: 30,   // Reduced for better gameplay - Win after 30 seconds
  },
  
  // Game state flags for efficient checking
  gameFlags: {
    hasWon: false,
    hasDied: false,
    scanInProgress: false,
    lastCheckedLine: 0,
  },
  
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
  
  // Optimized compiler scan update
  updateCompilerScan: () => {
    const { compilerScan, codeLines, status, gameFlags } = get();
    
    // Don't update if game is over or scan not active
    if (!compilerScan.isActive || status !== 'alive' || gameFlags.hasWon || gameFlags.hasDied) {
      return;
    }
    
    const now = Date.now();
    if (now - compilerScan.lastScanTime >= compilerScan.speed) {
      const nextLine = compilerScan.currentLine + 1;
      const maxLines = codeLines.length;
      
      if (nextLine > maxLines) {
        // Scan completed - increment survived scans and restart
        set(state => ({
          compilerScan: {
            ...state.compilerScan,
            currentLine: 1,
            lastScanTime: now
          },
          scansSurvived: state.scansSurvived + 1,
          gameFlags: { ...state.gameFlags, lastCheckedLine: 0 } // Reset line check
        }));
        
        // Check win condition immediately after scan completion
        const { checkWinCondition } = get();
        checkWinCondition();
      } else {
        // Continue scan to next line
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
  
  // Optimized win condition check - only check when conditions can change
  checkWinCondition: () => {
    const { scansSurvived, elapsedTime, winConditions, status, gameFlags } = get();
    
    // Early exit if already won/lost or game not active
    if (status !== 'alive' || gameFlags.hasWon || gameFlags.hasDied) return false;
    
    // Check win conditions - either scans OR time (whichever comes first)
    const hasWonByScans = scansSurvived >= winConditions.targetScans;
    const hasWonByTime = elapsedTime >= winConditions.targetTime;
    
    if (hasWonByScans || hasWonByTime) {
      set(state => ({ 
        status: 'won',
        gameFlags: { ...state.gameFlags, hasWon: true }
      }));
      return true;
    }
    return false;
  },

  // Optimized and clear-cut bug detection
  checkBugDetection: () => {
    const { bug, compilerScan, hiddenInError, status, gameFlags } = get();
    
    // Early exit conditions - only check when scan is active and game is alive
    if (status !== 'alive' || !compilerScan.isActive || gameFlags.hasDied || gameFlags.hasWon) {
      return false;
    }
    
    // Only check if scan line has actually changed and matches bug position
    if (compilerScan.currentLine === bug.line && 
        compilerScan.currentLine > 0 && 
        compilerScan.currentLine !== gameFlags.lastCheckedLine) {
      
      let detectionChance;
      
      if (hiddenInError) {
        // CLEAR RULE: 30% detection when hidden in syntax error
        detectionChance = 0.3;
      } else {
        // CLEAR RULE: 100% detection when NOT hidden in error
        detectionChance = 1.0;
      }
      
      // Update last checked line to prevent multiple checks
      set(state => ({
        gameFlags: { ...state.gameFlags, lastCheckedLine: compilerScan.currentLine }
      }));
      
      // Roll for detection
      if (Math.random() < detectionChance) {
        set(state => ({ 
          status: 'dead',
          gameFlags: { ...state.gameFlags, hasDied: true }
        }));
        
        // Visual feedback
        setTimeout(() => {
          document.body.classList.add('detection-flash');
          setTimeout(() => document.body.classList.remove('detection-flash'), 200);
        }, 100);
        
        return true;
      }
    }
    return false;
  },
  
  // Game control methods
  startGame: () => set({ gameStarted: true }),
  
  // Generate new code with errors
  regenerateCode: () => set({
    codeLines: generateCodeWithErrors()
  }),
  // Optimized time increment with immediate win check
  incrementTime: () => {
    const { status, gameFlags } = get();
    
    // Don't increment if game is over
    if (status !== 'alive' || gameFlags.hasWon || gameFlags.hasDied) return;
    
    set(state => ({ elapsedTime: state.elapsedTime + 1 }));
    
    // Check win condition immediately after time increment
    const { checkWinCondition } = get();
    checkWinCondition();
  },
  incrementScans: () => set(state => ({ scansSurvived: state.scansSurvived + 1 })),
  setStatus: (status) => set({ status }),
  resetGame: () => set({
    gameStarted: true, // Keep game started when resetting
    bug: { line: INITIAL_LINE, column: INITIAL_COLUMN },
    elapsedTime: 0,
    scansSurvived: 0,
    status: 'alive',
    codeLines: generateCodeWithErrors(),
    hiddenInError: false,
    compilerScan: {
      currentLine: 0,
      isActive: false,
      speed: 1500,
      lastScanTime: 0
    },
    gameFlags: {
      hasWon: false,
      hasDied: false,
      scanInProgress: false,
      lastCheckedLine: 0,
    }
  }),
}));

export default useGameStore;
