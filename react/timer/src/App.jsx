import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [isRunning, setIsRunning] = useState(false);
  const [initialTime, setInitialTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isTimeUp, setIsTimeUp] = useState(false);

  useEffect(() => {
    if (isRunning && !isTimeUp && currentTime > 0) {
      const interval = setInterval(() => {
        setCurrentTime((prevTime) => {
          if (prevTime <= 1) {
            setIsRunning(false);
            setIsTimeUp(true);
            clearInterval(interval);
          }
          return prevTime - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isRunning]);

  const handleReset = () => {
    setIsRunning(false);
    setCurrentTime(initialTime);
    setIsTimeUp(false);
  };

  const handleStartStop = () => {
    if (isRunning) {
      setIsRunning(false);
    } else {
      if (currentTime > 0) {
        setIsTimeUp(false);
        setIsRunning(true);
        setInitialTime(currentTime);
      } else {
        setIsTimeUp(false);
      }
    }
  };

  return (
    <div className='container'>
      <div className='input-container'>
        {isRunning || isTimeUp ? (
          <p className='timer-container'>{currentTime}s</p>
        ) : (
          <label>
            Enter the time in seconds:{' '}
            <input
              type='text'
              value={currentTime}
              onChange={(e) => setCurrentTime(e.target.value)}
            />
          </label>
        )}
      </div>
      <div className='buttons-container'>
        <button onClick={handleStartStop}>
          {isRunning ? 'Stop' : isTimeUp ? 'Ok' : 'Start'}
        </button>
        <button onClick={handleReset}>Reset</button>
      </div>
    </div>
  );
}

export default App;
