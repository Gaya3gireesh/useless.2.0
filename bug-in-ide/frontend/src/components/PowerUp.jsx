import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';

const LINE_HEIGHT = 19;
const TOP_PADDING = 8;

const PowerUp = ({ totalLines = 25 }) => {
  const { 
    status, 
    codeLines, 
    bug, 
    elapsedTime,
    scansSurvived 
  } = useGameStore(state => ({
    status: state.status,
    codeLines: state.codeLines,
    bug: state.bug,
    elapsedTime: state.elapsedTime,
    scansSurvived: state.scansSurvived
  }));

  const [powerUp, setPowerUp] = useState(null);
  const [activePowerUp, setActivePowerUp] = useState(null);

  // Power-up types
  const powerUpTypes = [
    {
      id: 'shield',
      icon: '🛡️',
      name: 'Error Shield',
      description: '5 seconds of 90% protection even in clean code!',
      duration: 5000,
      effect: 'Grants temporary protection'
    },
    {
      id: 'speed',
      icon: '⚡',
      name: 'Lightning Reflexes',
      description: 'Move twice as fast for 8 seconds!',
      duration: 8000,
      effect: 'Increases movement speed'
    },
    {
      id: 'slow',
      icon: '🐌',
      name: 'Slow Motion',
      description: 'Slows down scan speed for 10 seconds!',
      duration: 10000,
      effect: 'Slows compiler scan'
    }
  ];

  // Spawn power-ups randomly
  useEffect(() => {
    if (status !== 'alive') return;

    // Increase chance of power-up based on survival time and scans
    const baseChance = 0.002; // 0.2% base chance per check
    const timeBonus = Math.floor(elapsedTime / 15) * 0.001; // Bonus every 15 seconds
    const scanBonus = scansSurvived * 0.001; // Bonus per scan survived
    const spawnChance = baseChance + timeBonus + scanBonus;

    const interval = setInterval(() => {
      if (!powerUp && Math.random() < spawnChance) {
        // Spawn a random power-up
        const randomType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
        const randomLine = Math.floor(Math.random() * totalLines) + 1;
        const randomColumn = Math.floor(Math.random() * 40) + 1;
        
        setPowerUp({
          ...randomType,
          line: randomLine,
          column: randomColumn,
          spawnTime: Date.now()
        });

        // Remove power-up after 15 seconds if not collected
        setTimeout(() => {
          setPowerUp(null);
        }, 15000);
      }
    }, 500); // Check every 500ms

    return () => clearInterval(interval);
  }, [status, elapsedTime, scansSurvived, powerUp, totalLines]);

  // Check for power-up collection
  useEffect(() => {
    if (powerUp && bug.line === powerUp.line && Math.abs(bug.column - powerUp.column) <= 2) {
      // Collected power-up!
      setActivePowerUp({
        ...powerUp,
        activatedAt: Date.now()
      });
      setPowerUp(null);

      // Apply power-up effect
      applyPowerUpEffect(powerUp);

      // Remove active power-up after duration
      setTimeout(() => {
        setActivePowerUp(null);
        removePowerUpEffect(powerUp);
      }, powerUp.duration);
    }
  }, [bug.line, bug.column, powerUp]);

  const applyPowerUpEffect = (powerUp) => {
    // Power-up effects would be applied to game state here
    // For now, we'll just show visual feedback
    console.log(`Applied ${powerUp.name} effect!`);
    
    // You could dispatch actions to the game store here
    // For example, temporarily modify detection chances, movement speed, etc.
  };

  const removePowerUpEffect = (powerUp) => {
    console.log(`${powerUp.name} effect expired`);
  };

  if (status !== 'alive') return null;

  const powerUpStyle = powerUp ? {
    position: 'absolute',
    left: 4 + powerUp.column * 10,
    top: TOP_PADDING + (powerUp.line - 1) * LINE_HEIGHT,
    zIndex: 4,
    pointerEvents: 'none',
    fontSize: '16px',
    filter: 'drop-shadow(0 0 4px #ffcc02)',
    animation: 'powerup-pulse 1s ease-in-out infinite alternate'
  } : {};

  return (
    <>
      {/* Power-up on the field */}
      {powerUp && (
        <div 
          className="power-up" 
          style={powerUpStyle}
          title={`${powerUp.name}: ${powerUp.description}`}
        >
          {powerUp.icon}
        </div>
      )}

      {/* Active power-up indicator */}
      {activePowerUp && (
        <div className="active-powerup-indicator">
          <div className="powerup-icon">{activePowerUp.icon}</div>
          <div className="powerup-name">{activePowerUp.name}</div>
          <div className="powerup-timer">
            {Math.ceil((activePowerUp.duration - (Date.now() - activePowerUp.activatedAt)) / 1000)}s
          </div>
        </div>
      )}
    </>
  );
};

export default PowerUp;
