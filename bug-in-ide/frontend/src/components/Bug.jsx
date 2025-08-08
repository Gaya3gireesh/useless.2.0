import React, { useCallback, useMemo, useState } from 'react';
import useKeyboard from '../hooks/useKeyboard';
import { useGameStore } from '../store/gameStore';

// Height of a code line (keep in sync with CSS line-height px value)
const LINE_HEIGHT = 19; // matches .ide-code-editor-integrated line height
const TOP_PADDING = 8; // padding top in code content area

const Bug = ({ totalLines = 25 }) => {
  const { bug, moveBug } = useGameStore(state => ({ bug: state.bug, moveBug: state.moveBug }));
  const [wiggle, setWiggle] = useState(false);

  const onDirection = useCallback((dir) => {
    moveBug(dir, totalLines);
    setWiggle(true);
    setTimeout(() => setWiggle(false), 180);
  }, [moveBug, totalLines]);

  useKeyboard(onDirection);

  const style = useMemo(() => ({
    position: 'absolute',
    left: 4 + bug.column * 10, // simple horizontal placement
    top: TOP_PADDING + (bug.line - 1) * LINE_HEIGHT,
    transition: 'top 120ms ease, left 120ms ease',
    zIndex: 5,
    pointerEvents: 'none',
    fontSize: '16px',
    filter: 'drop-shadow(0 0 2px #000)'
  }), [bug.line, bug.column]);

  return (
    <div className={`bug-avatar ${wiggle ? 'bug-wiggle' : ''}`} style={style} aria-label="Bug player" role="img">
      🐞
    </div>
  );
};

export default Bug;
