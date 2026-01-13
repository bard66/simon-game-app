/**
 * Circular Timer Component
 * 
 * Apple Watch-inspired circular countdown timer.
 * Shows remaining time as a ring that depletes clockwise.
 */

interface CircularTimerProps {
  secondsRemaining: number;
  totalSeconds: number;
  timerColor: 'green' | 'yellow' | 'red';
  isPulsing?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const CircularTimer: React.FC<CircularTimerProps> = ({
  secondsRemaining,
  totalSeconds,
  timerColor,
  isPulsing = false,
  size = 'md',
}) => {
  // Size configurations
  const sizes = {
    sm: { width: 56, strokeWidth: 4, fontSize: 'text-lg', radius: 24 },
    md: { width: 72, strokeWidth: 5, fontSize: 'text-2xl', radius: 30 },
    lg: { width: 96, strokeWidth: 6, fontSize: 'text-3xl', radius: 40 },
  };
  
  const config = sizes[size];
  const circumference = 2 * Math.PI * config.radius;
  const progress = secondsRemaining / totalSeconds;
  const strokeDashoffset = circumference * (1 - progress);
  
  // Color mapping to CSS variables
  const colorMap = {
    green: {
      stroke: 'var(--simon-green)',
      glow: 'var(--glow-green)',
      text: 'text-simon-green',
    },
    yellow: {
      stroke: 'var(--simon-yellow)',
      glow: 'var(--glow-yellow)',
      text: 'text-simon-yellow',
    },
    red: {
      stroke: 'var(--simon-red)',
      glow: 'var(--glow-red)',
      text: 'text-simon-red',
    },
  };
  
  const colors = colorMap[timerColor];
  const center = config.width / 2;

  return (
    <div 
      className={`relative ${isPulsing ? 'animate-pulse' : ''}`}
      style={{ width: config.width, height: config.width }}
    >
      <svg 
        className="w-full h-full -rotate-90"
        viewBox={`0 0 ${config.width} ${config.width}`}
      >
        {/* Background ring */}
        <circle
          cx={center}
          cy={center}
          r={config.radius}
          stroke="var(--bg-elevated)"
          strokeWidth={config.strokeWidth}
          fill="none"
        />
        
        {/* Progress ring */}
        <circle
          cx={center}
          cy={center}
          r={config.radius}
          stroke={colors.stroke}
          strokeWidth={config.strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-linear"
          style={{
            filter: timerColor === 'red' ? `drop-shadow(0 0 8px ${colors.stroke})` : undefined,
          }}
        />
      </svg>
      
      {/* Number in center */}
      <span 
        className={`
          absolute inset-0 flex items-center justify-center 
          font-bold ${config.fontSize} ${colors.text}
          transition-colors duration-300
        `}
      >
        {secondsRemaining}
      </span>
      
      {/* Accessibility */}
      <span className="sr-only">
        {secondsRemaining} seconds remaining
      </span>
    </div>
  );
};

export default CircularTimer;
