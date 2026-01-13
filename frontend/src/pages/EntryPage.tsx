/**
 * Entry Page
 * 
 * Name + avatar selection page.
 * First screen players see.
 * 
 * Design: Dark theme with Simon color ambient glows
 */

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createSession, joinGame } from '../services/authService';
import { useAuthStore } from '../store/authStore';

// Avatar options with emojis
const AVATARS = ['😀', '🎮', '🚀', '⚡', '🎨', '🎯', '🏆', '🌟'];

export function EntryPage() {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<'create' | 'join' | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [gameCode, setGameCode] = useState('');
  const [avatarId, setAvatarId] = useState('1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { setSession } = useAuthStore();
  const navigate = useNavigate();
  
  // Handle invite link with game code in URL
  useEffect(() => {
    const joinCode = searchParams.get('join');
    if (joinCode) {
      setMode('join');
      setGameCode(joinCode.toUpperCase());
    }
  }, [searchParams]);

  const handleCreateGame = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await createSession(displayName, avatarId);
      setSession(response.session);
      navigate('/waiting');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create game');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGame = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await joinGame(displayName, avatarId, gameCode);
      setSession(response.session);
      navigate('/waiting');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join game');
    } finally {
      setLoading(false);
    }
  };

  // Mode Selection Screen
  if (!mode) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4 relative overflow-hidden">
        {/* Ambient glow effects */}
        <div className="ambient-glow glow-green w-[400px] h-[400px] -top-48 -left-48 animate-glow-pulse" />
        <div className="ambient-glow glow-blue w-[400px] h-[400px] -bottom-48 -right-48 animate-glow-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="ambient-glow glow-red w-[300px] h-[300px] top-1/4 -right-32 animate-glow-pulse" style={{ animationDelay: '0.75s' }} />
        <div className="ambient-glow glow-yellow w-[300px] h-[300px] bottom-1/4 -left-32 animate-glow-pulse" style={{ animationDelay: '2.25s' }} />
        
        <div className="relative z-10 w-full max-w-md animate-scale-in">
          {/* Logo & Title */}
          <div className="text-center mb-10">
            <h1 className="text-5xl sm:text-6xl font-bold text-text-primary tracking-tight mb-3">
              BAR SAYS
            </h1>
            <p className="text-text-secondary text-lg">
              Online Rally Edition
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={() => setMode('create')}
              className="btn btn-primary w-full text-lg"
            >
              <span>🎮</span> Create Game
            </button>
            
            <button
              onClick={() => setMode('join')}
              className="btn btn-secondary w-full text-lg"
            >
              <span>🔗</span> Join Game
            </button>
          </div>
          
          {/* Footer hint */}
          <p className="text-center text-text-muted text-sm mt-8">
            Create a room and invite friends to play
          </p>
        </div>
      </div>
    );
  }

  // Form Screen (Create/Join)
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient glow effects */}
      <div className="ambient-glow glow-green w-[400px] h-[400px] -top-48 -left-48 animate-glow-pulse" />
      <div className="ambient-glow glow-blue w-[400px] h-[400px] -bottom-48 -right-48 animate-glow-pulse" style={{ animationDelay: '1.5s' }} />
      
      <div className="relative z-10 w-full max-w-md animate-fade-slide-up">
        {/* Back Button */}
        <button
          onClick={() => setMode(null)}
          className="btn btn-ghost mb-6 -ml-2 px-3 min-h-0 h-10"
        >
          <span>←</span> Back
        </button>
        
        {/* Card */}
        <div className="glass-card p-6 sm:p-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-6">
            {mode === 'create' ? '🎮 Create Game' : '🔗 Join Game'}
          </h2>
          
          <form onSubmit={mode === 'create' ? handleCreateGame : handleJoinGame} className="space-y-5">
            {/* Display Name Input */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your name"
                minLength={3}
                maxLength={12}
                required
                className="w-full px-4 py-3 bg-bg-elevated border border-border-default rounded-xl 
                         text-text-primary placeholder:text-text-muted
                         focus:outline-none focus:border-simon-blue focus:ring-1 focus:ring-simon-blue
                         transition-all duration-fast"
              />
            </div>
            
            {/* Game Code Input (Join only) */}
            {mode === 'join' && (
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Game Code
                  {searchParams.get('join') && (
                    <span className="ml-2 text-xs text-simon-green font-normal">
                      ✅ Pre-filled from invite
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  value={gameCode}
                  onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                  placeholder="ABCDEF"
                  maxLength={6}
                  required
                  className="w-full px-4 py-3 bg-bg-elevated border border-border-default rounded-xl 
                           text-text-primary placeholder:text-text-muted font-mono text-xl tracking-[0.2em] text-center uppercase
                           focus:outline-none focus:border-simon-blue focus:ring-1 focus:ring-simon-blue
                           transition-all duration-fast"
                />
              </div>
            )}
            
            {/* Avatar Selection */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-3">
                Choose Avatar
              </label>
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 snap-x scrollbar-hide">
                {AVATARS.map((emoji, index) => {
                  const id = String(index + 1);
                  const isSelected = avatarId === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setAvatarId(id)}
                      className={`
                        flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl
                        flex items-center justify-center text-2xl sm:text-3xl
                        transition-all duration-fast snap-center
                        ${isSelected
                          ? 'bg-surface-success ring-2 ring-simon-green scale-110 shadow-glow-green'
                          : 'bg-bg-elevated hover:bg-bg-hover border border-border-subtle'
                        }
                      `}
                      style={{ touchAction: 'manipulation' }}
                    >
                      {emoji}
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="bg-surface-error border border-simon-red/30 text-simon-red px-4 py-3 rounded-xl text-sm animate-fade-in">
                {error}
              </div>
            )}
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full text-lg mt-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span> Loading...
                </>
              ) : (
                <>
                  {mode === 'create' ? '🚀 Create Game' : '🎯 Join Game'}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
