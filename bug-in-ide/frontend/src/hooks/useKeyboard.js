import { useEffect, useCallback } from 'react';

/**
 * useKeyboard - listens for arrow / WASD keys and invokes a callback with a direction string
 * Directions: 'up' | 'down' | 'left' | 'right'
 * @param {(direction: string, event: KeyboardEvent)=>void} onDirection
 */
export function useKeyboard(onDirection) {
  const handler = useCallback((e) => {
    const key = e.key.toLowerCase();
    let direction = null;
    switch (key) {
      case 'arrowup':
      case 'w':
        direction = 'up';
        break;
      case 'arrowdown':
      case 's':
        direction = 'down';
        break;
      case 'arrowleft':
      case 'a':
        direction = 'left';
        break;
      case 'arrowright':
      case 'd':
        direction = 'right';
        break;
      default:
        break;
    }
    if (direction) {
      e.preventDefault();
      onDirection && onDirection(direction, e);
    }
  }, [onDirection]);

  useEffect(() => {
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handler]);
}

export default useKeyboard;
