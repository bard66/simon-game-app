/**
 * Mute Button Component
 * 
 * Toggle button for muting/unmuting game sounds.
 * Persists preference in localStorage.
 * Design: Glass morphism floating button
 */

import { useState, useEffect } from 'react';
import { soundService } from '../../services/soundService';

export const MuteButton: React.FC = () => {
  const [isMuted, setIsMuted] = useState(soundService.getMuted());

  // Sync with sound service on mount
  useEffect(() => {
    setIsMuted(soundService.getMuted());
  }, []);

  const handleToggle = () => {
    const newMuted = soundService.toggleMute();
    setIsMuted(newMuted);
  };

  return (
    <button
      onClick={handleToggle}
      className={`
        fixed top-4 right-4 z-50
        w-12 h-12 rounded-full
        flex items-center justify-center
        transition-all duration-fast
        backdrop-blur-xl
        border
        ${isMuted 
          ? 'bg-bg-elevated/80 border-border-subtle hover:bg-bg-hover' 
          : 'bg-surface-success border-simon-green/30 hover:brightness-110 shadow-glow-green'}
        active:scale-95
      `}
      style={{ touchAction: 'manipulation' }}
      aria-label={isMuted ? 'Unmute sounds' : 'Mute sounds'}
      title={isMuted ? 'Click to unmute' : 'Click to mute'}
    >
      <span className="text-2xl">
        {isMuted ? '🔇' : '🔊'}
      </span>
    </button>
  );
};

export default MuteButton;
