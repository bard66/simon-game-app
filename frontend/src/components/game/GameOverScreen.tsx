/**
 * Game Over Screen Component
 * 
 * Displays the end game results with:
 * - Winner celebration with crown
 * - Final scoreboard with medals
 * - Game stats
 * - Play Again / Home buttons
 * - Share score functionality
 * 
 * Design: Dark theme with celebration animations
 */

import { useEffect, useState } from 'react';
import { soundService } from '../../services/soundService';

// =============================================================================
// TYPES
// =============================================================================

interface GameOverScreenProps {
  winner: {
    playerId: string;
    name: string;
    score: number;
  } | null;
  finalScores: Array<{
    playerId: string;
    name: string;
    score: number;
    isEliminated?: boolean;
  }>;
  currentPlayerId: string;
  roundsPlayed: number;
  onPlayAgain: () => void;
  onGoHome: () => void;
  gameCode: string;
}

// =============================================================================
// CONFETTI COMPONENT
// =============================================================================

const Confetti: React.FC = () => {
  const colors = ['#ff4136', '#ffdc00', '#2ecc40', '#0074d9', '#ff6b6b', '#ffd93d'];
  const confettiPieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 3,
    duration: 2 + Math.random() * 2,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * 360,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {confettiPieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute w-3 h-3 animate-fall"
          style={{
            left: `${piece.left}%`,
            top: '-20px',
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
            transform: `rotate(${piece.rotation}deg)`,
            borderRadius: Math.random() > 0.5 ? '50%' : '0',
          }}
        />
      ))}
    </div>
  );
};

// =============================================================================
// GAME OVER SCREEN COMPONENT
// =============================================================================

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  winner,
  finalScores,
  currentPlayerId,
  roundsPlayed,
  onPlayAgain,
  onGoHome,
  gameCode,
}) => {
  const [showConfetti, setShowConfetti] = useState(true);
  const [animatedScore, setAnimatedScore] = useState(0);
  const isWinner = winner?.playerId === currentPlayerId;
  const isSoloGame = finalScores.length === 1;

  // Animate score count-up
  useEffect(() => {
    if (!winner) return;
    
    const targetScore = winner.score;
    const duration = 1500; // 1.5 seconds
    const steps = 30;
    const increment = targetScore / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= targetScore) {
        setAnimatedScore(targetScore);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [winner]);

  // Play victory sound on mount
  useEffect(() => {
    soundService.playVictory();
    
    // Hide confetti after 5 seconds
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  // Get medal emoji based on rank
  const getMedal = (rank: number): string => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `${rank}.`;
    }
  };

  // Share score functionality
  const handleShare = async () => {
    const myScore = finalScores.find(s => s.playerId === currentPlayerId)?.score || 0;
    const rank = finalScores.findIndex(s => s.playerId === currentPlayerId) + 1;
    
    const shareText = isSoloGame
      ? `🎮 I reached Round ${roundsPlayed} in Bar Says with ${myScore} points! Can you beat my score?`
      : `🏆 I finished #${rank} in Bar Says with ${myScore} points! ${isWinner ? '👑 WINNER!' : ''}`;
    
    const shareUrl = `${window.location.origin}/?join=${gameCode}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Bar Says Score',
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or error - fallback to copy
        if ((err as Error).name !== 'AbortError') {
          copyToClipboard(shareText + '\n' + shareUrl);
        }
      }
    } else {
      copyToClipboard(shareText + '\n' + shareUrl);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Could add toast notification here
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient glows */}
      <div className="ambient-glow glow-yellow w-[500px] h-[500px] top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20" />
      <div className="ambient-glow glow-green w-[400px] h-[400px] bottom-0 left-0 -translate-x-1/2 translate-y-1/2 opacity-10" />
      <div className="ambient-glow glow-blue w-[400px] h-[400px] bottom-0 right-0 translate-x-1/2 translate-y-1/2 opacity-10" />
      
      {/* Confetti */}
      {showConfetti && <Confetti />}
      
      <div className="relative z-10 w-full max-w-md animate-scale-in">
        {/* Game Over Title */}
        <div className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-2">
            🎉 GAME OVER 🎉
          </h1>
        </div>

        {/* Winner Section */}
        {winner && (
          <div className="bg-surface-warning border border-simon-yellow/40 rounded-2xl p-6 mb-4 text-center relative overflow-hidden">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-simon-yellow/5 animate-pulse" />
            
            <div className="relative z-10">
              {/* Crown animation */}
              <div className="text-5xl mb-2 animate-bounce">👑</div>
              
              <h2 className="text-2xl font-bold text-simon-yellow mb-2">
                {isSoloGame ? 'GREAT JOB!' : 'WINNER!'}
              </h2>
              
              <div className="text-text-primary text-xl font-semibold mb-1">
                {winner.name}
              </div>
              
              <div className="text-4xl font-bold text-simon-yellow">
                {animatedScore} <span className="text-lg text-text-secondary">points</span>
              </div>
              
              {isWinner && !isSoloGame && (
                <div className="mt-3 text-simon-green text-sm font-semibold">
                  ✨ That's YOU! ✨
                </div>
              )}
            </div>
          </div>
        )}

        {/* Scoreboard (Multiplayer only) */}
        {!isSoloGame && finalScores.length > 0 && (
          <div className="glass-card p-4 mb-4">
            <h3 className="text-text-secondary font-medium text-center mb-3 text-xs uppercase tracking-wider">
              Final Standings
            </h3>
            
            <div className="space-y-2">
              {finalScores.map((player, index) => {
                const isCurrentPlayer = player.playerId === currentPlayerId;
                const rank = index + 1;
                
                return (
                  <div
                    key={player.playerId}
                    className={`
                      flex items-center justify-between px-3 py-2.5 rounded-xl
                      transition-all duration-fast
                      ${isCurrentPlayer
                        ? 'bg-surface-info border border-simon-blue/30 scale-[1.02]'
                        : 'bg-bg-elevated border border-border-subtle'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl w-8 text-center">
                        {getMedal(rank)}
                      </span>
                      <span className="text-text-primary font-medium">
                        {player.name}
                        {isCurrentPlayer && (
                          <span className="text-xs ml-1.5 text-simon-blue">(you)</span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-text-primary font-bold">
                        {player.score} <span className="text-text-muted font-normal">pts</span>
                      </span>
                      {player.isEliminated && (
                        <span className="text-simon-red text-xs">💀</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Game Stats */}
        <div className="glass-card p-4 mb-6">
          <div className="flex justify-around text-center">
            <div>
              <div className="text-2xl font-bold text-text-primary">{roundsPlayed}</div>
              <div className="text-text-muted text-xs uppercase tracking-wide">Rounds</div>
            </div>
            <div className="w-px bg-border-default" />
            <div>
              <div className="text-2xl font-bold text-text-primary">
                {finalScores.find(s => s.playerId === currentPlayerId)?.score || 0}
              </div>
              <div className="text-text-muted text-xs uppercase tracking-wide">Your Score</div>
            </div>
            {!isSoloGame && (
              <>
                <div className="w-px bg-border-default" />
                <div>
                  <div className="text-2xl font-bold text-text-primary">
                    #{finalScores.findIndex(s => s.playerId === currentPlayerId) + 1}
                  </div>
                  <div className="text-text-muted text-xs uppercase tracking-wide">Your Rank</div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Play Again Button */}
          <button
            onClick={onPlayAgain}
            className="btn btn-primary w-full text-lg"
          >
            🔄 PLAY AGAIN
          </button>

          {/* Home Button */}
          <button
            onClick={onGoHome}
            className="btn btn-ghost w-full text-lg bg-bg-elevated border border-border-subtle"
          >
            🏠 HOME
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="btn btn-secondary w-full"
          >
            📤 SHARE SCORE
          </button>
        </div>
      </div>

      {/* CSS for confetti animation */}
      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-fall {
          animation: fall linear infinite;
        }
      `}</style>
    </div>
  );
};

export default GameOverScreen;
