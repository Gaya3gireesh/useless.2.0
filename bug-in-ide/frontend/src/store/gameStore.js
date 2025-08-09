import { create } from 'zustand';
import { generateCodeWithErrors } from '../utils/codeGenerator';

// Initial positions
const INITIAL_LINE = 5; // Start bug on line 5 to give some safety buffer
const INITIAL_COLUMN = 10; // Start with some column offset

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
    targetScans: 5,   // Win after surviving 5 complete scans
    targetTime: 60,   // Win after 60 seconds
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
    speed: 2000, // ms per line - starting speed (slower at beginning)
    lastScanTime: 0,
    baseSpeed: 2000, // Base speed for calculations
    speedIncrement: 100, // Speed increase per scan cycle
  },
  
  // Code lines with error information
  codeLines: generateCodeWithErrors(),
  
  // Game mechanics
  hiddenInError: false,
  
  // Random events system
  lastEventTime: 0,
  eventCooldown: 20000, // 20 seconds between possible events
  activeEvent: null,

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
        // Scan completed - increment survived scans, increase speed, and restart
        const newSpeed = Math.max(800, compilerScan.speed - compilerScan.speedIncrement); // Minimum 800ms, gets faster
        
        set(state => ({
          compilerScan: {
            ...state.compilerScan,
            currentLine: 1,
            lastScanTime: now,
            speed: newSpeed // Increase speed each cycle
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

  // Instant game over when scan touches bug's line - simplified logic
  checkBugDetection: () => {
    const { bug, compilerScan, hiddenInError, status, gameFlags } = get();
    
    // Early exit conditions - only check when scan is active and game is alive
    if (status !== 'alive' || !compilerScan.isActive || gameFlags.hasDied || gameFlags.hasWon) {
      return false;
    }
    
    // INSTANT GAME OVER: When scan reaches bug's line
    if (compilerScan.currentLine === bug.line && 
        compilerScan.currentLine > 0 && 
        compilerScan.isActive && // Ensure scan is actually active
        compilerScan.currentLine !== gameFlags.lastCheckedLine) {
      
      let detectionChance;
      
      if (hiddenInError) {
        // 30% chance to survive when hidden in syntax error
        detectionChance = 0.7; // 70% protection = 30% detection
      } else {
        // INSTANT DEATH: 100% detection when NOT hidden in error
        detectionChance = 1.0;
      }
      
      // Update last checked line to prevent multiple checks
      set(state => ({
        gameFlags: { ...state.gameFlags, lastCheckedLine: compilerScan.currentLine }
      }));
      
      // Roll for detection - if detected, instant game over
      if (Math.random() < detectionChance) {
        set(state => ({ 
          status: 'dead',
          gameFlags: { ...state.gameFlags, hasDied: true }
        }));
        
        // Stop the compiler scan
        const { stopCompilerScan } = get();
        stopCompilerScan();
        
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
  
  // Random event system for extra fun
  triggerRandomEvent: () => {
    const { status, lastEventTime, eventCooldown, elapsedTime } = get();
    
    if (status !== 'alive') return;
    
    const now = Date.now();
    if (now - lastEventTime < eventCooldown) return;
    
    // 15% chance of triggering an event
    if (Math.random() < 0.15) {
      const events = [
        {
          type: 'syntax_storm',
          name: 'Syntax Storm',
          description: 'More syntax errors appear! 🌪️',
          effect: 'Regenerates code with more errors',
          duration: 0
        },
        {
          type: 'code_cleanup',
          name: 'Code Cleanup Bot',
          description: 'Auto-formatter removes some errors! 🤖',
          effect: 'Reduces number of syntax errors',
          duration: 0
        },
        {
          type: 'debug_freeze',
          name: 'Debug Freeze',
          description: 'Scan pauses for 3 seconds! ❄️',
          effect: 'Temporarily stops compiler scan',
          duration: 3000
        }
      ];
      
      const randomEvent = events[Math.floor(Math.random() * events.length)];
      
      set(state => ({
        activeEvent: randomEvent,
        lastEventTime: now
      }));
      
      // Apply event effect
      const { applyEventEffect } = get();
      applyEventEffect(randomEvent);
      
      // Clear event after display duration
      setTimeout(() => {
        set(state => ({ activeEvent: null }));
      }, 3000);
    }
  },
  
  // Helper function to apply event effects
  applyEventEffect: (event) => {
    switch (event.type) {
      case 'syntax_storm':
        // Regenerate code with more errors
        set({ codeLines: generateCodeWithErrors() });
        break;
      case 'code_cleanup':
        // Reduce errors in current code
        const { codeLines } = get();
        const cleanedLines = codeLines.map(line => ({
          ...line,
          hasError: line.hasError && Math.random() > 0.6 // 40% chance to keep error
        }));
        set({ codeLines: cleanedLines });
        break;
      case 'debug_freeze':
        // Temporarily stop scan
        set(state => ({
          compilerScan: { ...state.compilerScan, isActive: false }
        }));
        
        // Resume after duration
        setTimeout(() => {
          const currentState = get();
          if (currentState.status === 'alive') {
            set(state => ({
              compilerScan: { ...state.compilerScan, isActive: true }
            }));
          }
        }, event.duration);
        break;
    }
  },
  
  // Game control methods
  startGame: () => {
    // Reset the game state and start fresh
    set({
      gameStarted: true,
      bug: { line: INITIAL_LINE, column: INITIAL_COLUMN },
      elapsedTime: 0,
      scansSurvived: 0,
      status: 'alive',
      codeLines: generateCodeWithErrors(),
      hiddenInError: false,
      lastEventTime: 0,
      activeEvent: null,
      compilerScan: {
        currentLine: 0,
        isActive: false, // Don't start immediately
        speed: 2000,
        lastScanTime: 0,
        baseSpeed: 2000,
        speedIncrement: 100,
      },
      gameFlags: {
        hasWon: false,
        hasDied: false,
        scanInProgress: false,
        lastCheckedLine: 0,
      }
    });
    
    // Start the compiler scan after a 2-second delay to give player time
    setTimeout(() => {
      const currentState = get();
      if (currentState.status === 'alive' && currentState.gameStarted) {
        set(state => ({
          compilerScan: {
            ...state.compilerScan,
            isActive: true,
            currentLine: 1,
            lastScanTime: Date.now()
          }
        }));
      }
    }, 2000);
  },
  
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
  resetGame: () => {
    set({
      gameStarted: true, // Keep game started when resetting
      bug: { line: INITIAL_LINE, column: INITIAL_COLUMN },
      elapsedTime: 0,
      scansSurvived: 0,
      status: 'alive',
      codeLines: generateCodeWithErrors(),
      hiddenInError: false,
      lastEventTime: 0,
      activeEvent: null,
      compilerScan: {
        currentLine: 0,
        isActive: false, // Don't start immediately
        speed: 2000, // Reset to base speed
        lastScanTime: 0,
        baseSpeed: 2000,
        speedIncrement: 100,
      },
      gameFlags: {
        hasWon: false,
        hasDied: false,
        scanInProgress: false,
        lastCheckedLine: 0,
      }
    });
    
    // Start the compiler scan after a 2-second delay
    setTimeout(() => {
      const currentState = get();
      if (currentState.status === 'alive' && currentState.gameStarted) {
        set(state => ({
          compilerScan: {
            ...state.compilerScan,
            isActive: true,
            currentLine: 1,
            lastScanTime: Date.now()
          }
        }));
      }
    }, 2000);
  },
}));

export default useGameStore;
