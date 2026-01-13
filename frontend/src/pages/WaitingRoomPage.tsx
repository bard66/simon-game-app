/**
 * Waiting Room / Game Page
 * 
 * Combined page that shows:
 * - Waiting room before game starts
 * - Simon game board during gameplay
 * 
 * Design: Unified dark theme with Simon color accents
 */

import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useSimonStore } from '../store/simonStore';
import { socketService } from '../services/socketService';
import { soundService } from '../services/soundService';
import { CircularSimonBoard } from '../components/game/CircularSimonBoard';
import { GameOverScreen } from '../components/game/GameOverScreen';
import { Toast } from '../components/ui/Toast';
import { MuteButton } from '../components/ui/MuteButton';

export function WaitingRoomPage() {
  const navigate = useNavigate();
  const { session, clearSession } = useAuthStore();
  const gameCode = session?.gameCode;
  const playerId = session?.playerId;
  
  const { 
    isGameActive, 
    currentSequence, 
    currentRound, 
    isShowingSequence,
    isInputPhase,
    playerSequence,
    lastResult,
    message,
    secondsRemaining,
    timerColor,
    isTimerPulsing,
    isEliminated,
    scores,
    submittedPlayers,
    isGameOver,
    gameWinner,
    finalScores,
    initializeListeners,
    cleanup,
    addColorToSequence,
    resetGame,
  } = useSimonStore();
  
  const [roomStatus, setRoomStatus] = useState<'waiting' | 'countdown' | 'active'>('waiting');
  const [countdownValue, setCountdownValue] = useState<number | null>(null);
  const [isHost, setIsHost] = useState(session?.isHost || false);
  const [players, setPlayers] = useState<any[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const lastCountdownValue = useRef<number | null>(null);
  
  // Initialize on mount
  useEffect(() => {
    console.log('🎮 WaitingRoomPage mounted');
    
    // CRITICAL FIX: Connect socket FIRST, then initialize listeners
    const socket = socketService.connect();
    console.log('✅ Socket connected:', socket.connected);
    
    // Initialize Simon listeners AFTER socket is connected
    initializeListeners();
    
    // Join room via socket
    if (gameCode && playerId) {
      socket.emit('join_room_socket', { gameCode, playerId });
    }
    
    // Listen for initial room state (ONCE to avoid race condition)
    socket.once('room_state', (room: any) => {
      console.log('📦 Initial room state:', room);
      setPlayers(room.players || []);
      setRoomStatus(room.status);
      
      // Check if we're the host
      const me = room.players?.find((p: any) => p.id === playerId);
      const isHostPlayer = me?.isHost || false;
      console.log('🎮 isHost check:', { playerId, me, isHostPlayer });
      setIsHost(isHostPlayer);
    });
    
    // Listen for room state updates (when players join/leave)
    socket.on('room_state_update', (room: any) => {
      console.log('🔄 Room state updated:', room);
      setPlayers(room.players || []);
      setRoomStatus(room.status);
      
      // Check if we're the host
      const me = room.players?.find((p: any) => p.id === playerId);
      setIsHost(me?.isHost || false);
    });
    
    // Listen for errors
    socket.on('error', (data: { message: string }) => {
      console.error('❌ Server error:', data.message);
      setToast({ message: data.message, type: 'error' });
    });
    
    // Listen for countdown
    socket.on('countdown', (data: { count: number }) => {
      console.log('⏳ Countdown:', data.count);
      setRoomStatus('countdown');
      setCountdownValue(data.count);
      
      // 🔊 Play countdown beep (only once per second)
      if (lastCountdownValue.current !== data.count) {
        soundService.playCountdown(data.count);
        lastCountdownValue.current = data.count;
      }
      
      if (data.count === 0) {
        setRoomStatus('active');
        setCountdownValue(null);
        lastCountdownValue.current = null;
      }
    });
    
    // Listen for player joined (for real-time feedback)
    socket.on('player_joined', (player: any) => {
      console.log('👋 Player joined:', player);
      // Don't modify state here - wait for room_state_update
    });
    
    // Listen for player left
    socket.on('player_left', (data: { playerId: string }) => {
      console.log('👋 Player left:', data.playerId);
      setPlayers(prev => prev.filter(p => p.id !== data.playerId));
    });
    
    // Listen for game restarted (Play Again)
    socket.on('game_restarted', (data: { gameCode: string }) => {
      console.log('🔄 Game restarted:', data.gameCode);
      // Reset local state to waiting room
      resetGame();
      setRoomStatus('waiting');
      lastCountdownValue.current = null;
    });
    
    // Cleanup on unmount
    return () => {
      cleanup();
      socket.off('room_state');
      socket.off('room_state_update');
      socket.off('error');
      socket.off('countdown');
      socket.off('player_joined');
      socket.off('player_left');
      socket.off('game_restarted');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameCode, playerId]); // Removed initializeListeners & cleanup - they're stable
  
  // Handle start game (host only)
  const handleStartGame = async () => {
    console.log('🎮 DEBUG: handleStartGame called');
    console.log('🎮 DEBUG: gameCode:', gameCode);
    console.log('🎮 DEBUG: playerId:', playerId);
    console.log('🎮 DEBUG: isHost:', isHost);
    
    // 🔊 Initialize sound on user interaction
    await soundService.init();
    
    const socket = socketService.getSocket();
    console.log('🎮 DEBUG: socket exists:', !!socket);
    console.log('🎮 DEBUG: socket connected:', socket?.connected);
    
    if (!socket) {
      console.error('❌ No socket connection');
      setToast({ message: 'No connection to server', type: 'error' });
      return;
    }
    
    if (!gameCode || !playerId) {
      console.error('❌ Missing gameCode or playerId');
      setToast({ message: 'Missing game info', type: 'error' });
      return;
    }
    
    console.log('📤 Emitting start_game:', { gameCode, playerId });
    socket.emit('start_game', { gameCode, playerId });
  };
  
  // Copy game code to clipboard
  const copyGameCode = async () => {
    if (!gameCode) return;
    
    try {
      await navigator.clipboard.writeText(gameCode);
      setToast({ message: 'Game code copied!', type: 'success' });
    } catch (err) {
      setToast({ message: 'Failed to copy code', type: 'error' });
    }
  };
  
  // Copy invite link to clipboard
  const copyInviteLink = async () => {
    if (!gameCode) return;
    
    const inviteUrl = `${window.location.origin}/?join=${gameCode}`;
    
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setToast({ message: 'Invite link copied!', type: 'success' });
    } catch (err) {
      setToast({ message: 'Failed to copy link', type: 'error' });
    }
  };
  
  // Handle Play Again
  const handlePlayAgain = () => {
    // Reset local game state
    resetGame();
    setRoomStatus('waiting');
    
    // Emit restart_game to reset room on server
    const socket = socketService.getSocket();
    if (socket && gameCode && playerId) {
      console.log('🔄 Restarting game:', { gameCode, playerId });
      socket.emit('restart_game', { gameCode, playerId });
    }
  };

  // Handle Go Home
  const handleGoHome = () => {
    cleanup();
    clearSession();
    navigate('/');
  };

  // Share game using native share API (mobile-friendly)
  const shareGame = async () => {
    if (!gameCode) return;
    
    const inviteUrl = `${window.location.origin}/?join=${gameCode}`;
    
    // Check if native share is supported
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join my Bar Says Game!',
          text: `Join me in Bar Says! Use code: ${gameCode}`,
          url: inviteUrl,
        });
        setToast({ message: 'Invite shared!', type: 'success' });
      } catch (err) {
        // User cancelled or error - fallback to copy
        if ((err as Error).name !== 'AbortError') {
          copyInviteLink();
        }
      }
    } else {
      // Fallback to copy for desktop
      copyInviteLink();
    }
  };
  
  // Render Game Over screen
  if (isGameOver) {
    return (
      <>
        <MuteButton />
        <GameOverScreen
          winner={gameWinner}
          finalScores={finalScores}
          currentPlayerId={playerId || ''}
          roundsPlayed={currentRound}
          onPlayAgain={handlePlayAgain}
          onGoHome={handleGoHome}
          gameCode={gameCode || ''}
        />
      </>
    );
  }

  // Render game board if active
  if (roomStatus === 'active' && isGameActive) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center p-2 sm:p-4 relative overflow-hidden">
        {/* Subtle ambient glow */}
        <div className="ambient-glow glow-blue w-[600px] h-[600px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5" />
        
        {/* Mute Button */}
        <MuteButton />
        
        <div className="flex flex-col items-center w-full max-w-md relative z-10">
          {/* Scoreboard */}
          {isGameActive && Object.keys(scores).length > 0 && (
            <div className="glass-card p-3 mb-4 w-full">
              <div className="space-y-1.5">
                {players.map((player) => {
                  const score = scores[player.id] || 0;
                  const hasSubmitted = submittedPlayers.includes(player.id);
                  const isCurrentPlayer = player.id === playerId;
                  
                  return (
                    <div
                      key={player.id}
                      className={`
                        flex items-center justify-between px-3 py-2 rounded-lg
                        transition-all duration-fast
                        ${isCurrentPlayer 
                          ? 'bg-surface-info border border-simon-blue/30' 
                          : 'bg-bg-elevated'
                        }
                      `}
                    >
                      <span className="text-text-primary text-sm flex items-center gap-2">
                        <span>{player.avatar || '😀'}</span>
                        <span className="font-medium">{player.displayName}</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-text-primary text-sm font-bold">
                          {score} <span className="text-text-muted font-normal">pts</span>
                        </span>
                        {hasSubmitted && isInputPhase && (
                          <span className="text-simon-green text-sm">✓</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Eliminated Message */}
          {isEliminated && (
            <div className="bg-surface-error border border-simon-red/40 rounded-2xl p-4 mb-4 text-center w-full animate-scale-in">
              <div className="text-4xl mb-2">💀</div>
              <div className="text-simon-red text-lg font-bold">
                Eliminated!
              </div>
              <p className="text-text-muted text-sm mt-1">
                Watch the remaining players
              </p>
            </div>
          )}
          
          <CircularSimonBoard
            sequence={currentSequence}
            round={currentRound}
            isShowingSequence={isShowingSequence}
            isInputPhase={isInputPhase}
            playerSequence={playerSequence}
            lastResult={lastResult}
            onColorClick={(color) => {
              if (gameCode && playerId) {
                addColorToSequence(color, gameCode, playerId);
              }
            }}
            disabled={isEliminated}
            secondsRemaining={secondsRemaining}
            timerColor={timerColor}
            isTimerPulsing={isTimerPulsing}
          />
          
          {/* Message Display */}
          {message && (
            <div className="mt-6 text-center">
              <p className="text-text-secondary text-lg">{message}</p>
            </div>
          )}
          
          {/* Players Status (compact) */}
          <div className="mt-6 glass-card p-3 w-full">
            <div className="flex flex-wrap gap-2 justify-center">
              {players.map(player => (
                <span 
                  key={player.id} 
                  className={`
                    text-sm px-2 py-1 rounded-lg
                    ${player.id === playerId ? 'text-simon-blue' : 'text-text-muted'}
                  `}
                >
                  {player.avatar || '😀'} {player.displayName}
                  {player.isHost && ' 👑'}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Render countdown
  if (roomStatus === 'countdown' && countdownValue !== null) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4 relative overflow-hidden">
        {/* Pulsing glow based on countdown */}
        <div 
          className="absolute inset-0 transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle at center, ${
              countdownValue > 2 ? 'var(--simon-green)' : 
              countdownValue > 1 ? 'var(--simon-yellow)' : 'var(--simon-red)'
            } 0%, transparent 70%)`,
            opacity: 0.15,
          }}
        />
        
        <div className="text-center relative z-10 animate-scale-in">
          <h1 
            className={`
              text-8xl sm:text-9xl font-bold mb-4 transition-all duration-300
              ${countdownValue > 2 ? 'text-simon-green' : ''}
              ${countdownValue === 2 ? 'text-simon-yellow' : ''}
              ${countdownValue <= 1 ? 'text-simon-red' : ''}
            `}
            style={{
              textShadow: countdownValue > 2 
                ? '0 0 60px var(--simon-green)' 
                : countdownValue === 2 
                  ? '0 0 60px var(--simon-yellow)' 
                  : '0 0 60px var(--simon-red)',
            }}
          >
            {countdownValue}
          </h1>
          <p className="text-xl sm:text-2xl text-text-secondary">Get ready!</p>
        </div>
      </div>
    );
  }
  
  // Render waiting room
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient glow effects */}
      <div className="ambient-glow glow-green w-[400px] h-[400px] -top-48 -left-48 animate-glow-pulse" />
      <div className="ambient-glow glow-blue w-[400px] h-[400px] -bottom-48 -right-48 animate-glow-pulse" style={{ animationDelay: '1.5s' }} />
      
      {/* Toast notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      <div className="glass-card p-6 sm:p-8 max-w-md w-full relative z-10 animate-fade-slide-up">
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary text-center mb-6">
          Waiting Room
        </h1>
        
        {/* Game Code Display */}
        <div className="mb-6">
          <div className="text-center py-5 bg-bg-elevated rounded-2xl border border-border-subtle mb-4">
            <p className="text-text-muted text-xs uppercase tracking-wider mb-2">
              Game Code
            </p>
            <p className="font-mono text-3xl sm:text-4xl font-bold text-text-primary tracking-[0.25em]">
              {gameCode}
            </p>
          </div>
          
          {/* Invite Buttons */}
          <div className="flex gap-2 justify-center">
            <button
              onClick={copyGameCode}
              className="btn btn-ghost flex-1 text-sm h-11 min-h-0 px-3"
              title="Copy game code"
            >
              📋 Code
            </button>
            
            <button
              onClick={copyInviteLink}
              className="btn btn-ghost flex-1 text-sm h-11 min-h-0 px-3 text-simon-blue"
              title="Copy invite link"
            >
              🔗 Link
            </button>
            
            <button
              onClick={shareGame}
              className="btn btn-ghost flex-1 text-sm h-11 min-h-0 px-3 text-simon-green"
              title="Share with friends"
            >
              📤 Share
            </button>
          </div>
        </div>
        
        {/* Players List */}
        <div className="mb-6">
          <h2 className="text-sm font-medium text-text-secondary uppercase tracking-wider mb-3">
            Players ({players.length})
          </h2>
          <div className="space-y-2 animate-stagger">
            {players.map(player => (
              <div 
                key={player.id} 
                className={`
                  rounded-xl p-3 flex items-center justify-between
                  transition-all duration-fast
                  ${player.id === playerId 
                    ? 'bg-surface-info border border-simon-blue/30' 
                    : 'bg-bg-elevated border border-border-subtle'
                  }
                `}
              >
                <span className="font-medium text-text-primary flex items-center gap-2">
                  <span className="text-xl">{player.avatar || '😀'}</span>
                  <span>{player.displayName}</span>
                  {player.id === playerId && (
                    <span className="text-xs text-simon-blue">(You)</span>
                  )}
                </span>
                {player.isHost && (
                  <span className="text-simon-yellow text-sm">👑 Host</span>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Start Button (host only, or solo player) */}
        {(isHost || players.length === 1) && (
          <>
            {players.length === 1 && (
              <p className="text-center text-sm text-text-muted mb-3">
                💡 You can start solo or wait for others to join
              </p>
            )}
            <button
              onClick={handleStartGame}
              className="btn btn-primary w-full text-lg"
            >
              🎮 {players.length === 1 ? 'Start Solo Game' : 'Start Game'}
            </button>
          </>
        )}
        
        {!isHost && players.length > 1 && (
          <div className="text-center py-4">
            <div className="inline-flex items-center gap-2 text-text-muted">
              <span className="animate-pulse">⏳</span>
              <span>Waiting for host to start...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
