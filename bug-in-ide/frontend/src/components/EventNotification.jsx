import React, { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';

const EventNotification = () => {
  const { 
    activeEvent, 
    status, 
    triggerRandomEvent 
  } = useGameStore(state => ({
    activeEvent: state.activeEvent,
    status: state.status,
    triggerRandomEvent: state.triggerRandomEvent
  }));

  // Trigger random events periodically
  useEffect(() => {
    if (status !== 'alive') return;

    const interval = setInterval(() => {
      triggerRandomEvent();
    }, 5000); // Check for events every 5 seconds

    return () => clearInterval(interval);
  }, [status, triggerRandomEvent]);

  if (!activeEvent) return null;

  return (
    <div className="event-notification">
      <div className="event-content">
        <div className="event-icon">⚡</div>
        <div className="event-text">
          <div className="event-name">{activeEvent.name}</div>
          <div className="event-description">{activeEvent.description}</div>
        </div>
      </div>
    </div>
  );
};

export default EventNotification;
