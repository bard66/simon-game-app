/**
 * Toast Notification Component
 * 
 * Shows temporary success/error messages
 * Design: Dark theme with Simon color accents
 */

import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
}

export function Toast({ message, type = 'success', duration = 3000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const styles = {
    success: {
      bg: 'bg-surface-success',
      border: 'border-simon-green/40',
      text: 'text-simon-green',
    },
    error: {
      bg: 'bg-surface-error',
      border: 'border-simon-red/40',
      text: 'text-simon-red',
    },
    info: {
      bg: 'bg-surface-info',
      border: 'border-simon-blue/40',
      text: 'text-simon-blue',
    },
  };

  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
  };

  const style = styles[type];

  return (
    <div className="fixed top-2 right-2 sm:top-4 sm:right-4 z-50 animate-slide-in max-w-[calc(100vw-1rem)] sm:max-w-md">
      <div 
        className={`
          ${style.bg} ${style.border} border
          backdrop-blur-xl
          px-4 sm:px-5 py-3 sm:py-4 rounded-xl 
          shadow-elevated
          flex items-center gap-3 
          min-w-[280px] sm:min-w-[300px]
        `}
      >
        <span className="text-xl sm:text-2xl">{icons[type]}</span>
        <span className={`font-medium text-sm sm:text-base flex-1 ${style.text}`}>
          {message}
        </span>
        <button
          onClick={onClose}
          className="text-text-muted hover:text-text-primary transition-colors duration-fast text-lg p-1"
          aria-label="Close notification"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
