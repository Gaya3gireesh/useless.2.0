import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';

// Keep in sync with Bug.jsx
const LINE_HEIGHT = 19;
const TOP_PADDING = 8;

/**
 * CompilerScan
 * A horizontal red laser bar that moves from line to line, continuously scanning.
 * When it reaches the bottom, it starts over from the top.
 * Checks for bug detection on each line.
 */
const CompilerScan = ({ totalLines = 25, thickness = 4 }) => {
  const { 
    compilerScan, 
    startCompilerScan, 
    updateCompilerScan, 
    stopCompilerScan,
    checkBugDetection,
    status 
  } = useGameStore(state => ({ 
    compilerScan: state.compilerScan,
    startCompilerScan: state.startCompilerScan,
    updateCompilerScan: state.updateCompilerScan,
    stopCompilerScan: state.stopCompilerScan,
    checkBugDetection: state.checkBugDetection,
    status: state.status
  }));
  
  const animationRef = useRef();
  const prevLineRef = useRef(0);

  // Start the scan when component mounts
  useEffect(() => {
    if (status === 'alive' && !compilerScan.isActive) {
      startCompilerScan();
    }
  }, [status, compilerScan.isActive, startCompilerScan]);

  // Main game loop - update scan position and check for detection
  useEffect(() => {
    if (status !== 'alive') {
      stopCompilerScan();
      return;
    }

    const gameLoop = () => {
      if (compilerScan.isActive && status === 'alive') {
        updateCompilerScan();
        
        // Check for bug detection when scan moves to a new line
        if (compilerScan.currentLine !== prevLineRef.current && compilerScan.currentLine > 0) {
          checkBugDetection();
          prevLineRef.current = compilerScan.currentLine;
        }
      }
      
      if (status === 'alive') {
        animationRef.current = requestAnimationFrame(gameLoop);
      }
    };

    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [compilerScan.isActive, compilerScan.currentLine, updateCompilerScan, checkBugDetection, status, stopCompilerScan]);

  // Stop scan when game ends
  useEffect(() => {
    if (status !== 'alive') {
      stopCompilerScan();
    }
  }, [status, stopCompilerScan]);

  if (!compilerScan.isActive || compilerScan.currentLine === 0) {
    return null;
  }

  const top = TOP_PADDING + (compilerScan.currentLine - 1) * LINE_HEIGHT + Math.round((LINE_HEIGHT - thickness) / 2);

  return (
    <div
      className="compiler-scan-laser active-continuous"
      style={{ 
        top, 
        height: thickness,
        position: 'absolute',
        left: 0,
        width: '100%',
        background: 'linear-gradient(90deg, rgba(255,0,0,0.1), #ff2d2d 35%, #ff6b6b 60%, rgba(255,0,0,0.1))',
        boxShadow: '0 0 6px 2px rgba(255,50,50,0.6), 0 0 18px 4px rgba(255,0,0,0.3)',
        opacity: 1,
        pointerEvents: 'none',
        borderRadius: '2px',
        zIndex: 10,
        transition: 'top 0.3s ease-in-out'
      }}
      aria-hidden="true"
    />
  );
};

export default CompilerScan;
