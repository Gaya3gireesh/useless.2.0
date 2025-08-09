import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';

const ScanCountdown = () => {
  const { gameStarted, compilerScan, status } = useGameStore(state => ({
    gameStarted: state.gameStarted,
    compilerScan: state.compilerScan,
    status: state.status
  }));

  const [countdown, setCountdown] = useState(0);
  const [showCountdown, setShowCountdown] = useState(false);

  useEffect(() => {
    if (gameStarted && !compilerScan.isActive && status === 'alive') {
      // Show countdown for 2 seconds
      setShowCountdown(true);
      setCountdown(2);
      
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setShowCountdown(false);
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setShowCountdown(false);
    }
  }, [gameStarted, compilerScan.isActive, status]);

  if (!showCountdown) return null;

  return (
    <div className="scan-countdown">
      <div className="countdown-content">
        <div className="countdown-icon">⚠️</div>
        <div className="countdown-text">
          <div className="countdown-title">COMPILER SCAN STARTING</div>
          <div className="countdown-timer">{countdown}</div>
        </div>
      </div>
    </div>
  );
};

export default ScanCountdown;
