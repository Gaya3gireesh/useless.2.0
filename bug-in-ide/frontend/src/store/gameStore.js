import { create } from 'zustand';

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

  // Direct setters
  setBugPosition: ({ line, column }) => set(state => ({
    bug: {
      line: Math.max(1, line),
      column: Math.max(1, column ?? state.bug.column),
    }
  })),
  moveBug: (direction, maxLines) => {
    const { bug, status } = get();
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
    set({ bug: { line, column } });
  },
  incrementTime: () => set(state => ({ elapsedTime: state.elapsedTime + 1 })),
  incrementScans: () => set(state => ({ scansSurvived: state.scansSurvived + 1 })),
  setStatus: (status) => set({ status }),
  resetGame: () => set({
    bug: { line: INITIAL_LINE, column: INITIAL_COLUMN },
    elapsedTime: 0,
    scansSurvived: 0,
    status: 'alive'
  }),
}));

export default useGameStore;
