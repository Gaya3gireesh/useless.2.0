import React, { useState, useEffect, useCallback } from 'react';

const CompilerScan = ({ bugPosition, onGameOver, isActive = true }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanPosition, setScanPosition] = useState(0);

  // Simulate sending bug position to API endpoint
  const scanForBug = useCallback(async (currentLine) => {
    try {
      // Simulate API call to /scan-bug-position
      const response = await fetch('/scan-bug-position', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scanLine: currentLine,
          bugPosition: bugPosition
        })
      });

      const data = await response.json();
      
      if (data.hit) {
        console.log('🐛 Bug detected! Game Over!');
        onGameOver();
        return true;
      }
      
      return false;
    } catch (error) {
      // For demo purposes, simulate bug detection logic locally
      console.log(`Scanning line ${currentLine}, bug at line ${bugPosition}`);
      
      // Check if laser hits the bug (within 1 line tolerance)
      if (Math.abs(currentLine - bugPosition) <= 1) {
        console.log('🐛 Bug detected! Game Over!');
        onGameOver();
        return true;
      }
      
      return false;
    }
  }, [bugPosition, onGameOver]);

  // Convert scan position percentage to line number (assuming 25 lines total)
  const getCurrentLine = useCallback((position) => {
    return Math.floor((position / 100) * 25) + 1;
  }, []);

  // Perform scan animation
  const performScan = useCallback(async () => {
    if (!isActive) return;

    setIsScanning(true);
    setScanPosition(0);

    // Animate the laser from left to right
    const scanDuration = 3000; // 3 seconds
    const frameRate = 60;
    const totalFrames = (scanDuration / 1000) * frameRate;
    let currentFrame = 0;

    const animateFrame = async () => {
      currentFrame++;
      const progress = currentFrame / totalFrames;
      const newPosition = Math.min(progress * 100, 100);
      
      setScanPosition(newPosition);

      // Check for bug at current scan line
      const currentLine = getCurrentLine(newPosition);
      const bugHit = await scanForBug(currentLine);

      if (bugHit) {
        setIsScanning(false);
        return; // Stop animation if bug is hit
      }

      if (currentFrame < totalFrames) {
        requestAnimationFrame(animateFrame);
      } else {
        setIsScanning(false);
        setScanPosition(0);
      }
    };

    requestAnimationFrame(animateFrame);
  }, [isActive, scanForBug, getCurrentLine]);

  // Set up periodic scanning
  useEffect(() => {
    if (!isActive) return;

    const scanInterval = setInterval(() => {
      performScan();
    }, 5000); // Scan every 5 seconds

    // Perform initial scan after 2 seconds
    const initialScanTimeout = setTimeout(() => {
      performScan();
    }, 2000);

    return () => {
      clearInterval(scanInterval);
      clearTimeout(initialScanTimeout);
    };
  }, [performScan, isActive]);

  if (!isActive) return null;

  return (
    <div className="compiler-scan-container">
      {/* Laser beam */}
      <div 
        className={`laser-beam ${isScanning ? 'scanning' : ''}`}
        style={{
          transform: `translateY(${scanPosition}%)`,
          opacity: isScanning ? 1 : 0
        }}
      >
        <div className="laser-line"></div>
        <div className="laser-glow"></div>
      </div>

      {/* Scan indicator */}
      {isScanning && (
        <div className="scan-indicator">
          <span className="scan-text">🔍 COMPILER SCANNING...</span>
          <div className="scan-progress">
            <div 
              className="scan-progress-bar"
              style={{ width: `${scanPosition}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Debug info (remove in production) */}
      <div className="scan-debug">
        <div>Bug Position: Line {bugPosition}</div>
        <div>Scan Line: {getCurrentLine(scanPosition)}</div>
        <div>Scanning: {isScanning ? 'Yes' : 'No'}</div>
      </div>
    </div>
  );
};

export default CompilerScan;
