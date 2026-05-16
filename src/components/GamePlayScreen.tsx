import React, { useState, useEffect, useRef } from 'react';
import { GameMode } from '../mode/GameMode.tsx';
import { supabase } from '../database/supabase.ts'

// Constants for physics
const GRAVITY = 0.2;
const JUMP_STRENGTH = -7;
const PIPE_SPEED = 4;
const PIPE_SPAWN_RATE = 1500;
const BIRD_X = 50;

interface PipeData {
  id: number;
  x: number;
  topHeight: number;
  passed: boolean;
  gap: number;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

const GamePlayScreen: React.FC<{ mode: GameMode; onGameOver: () => void }> = ({ mode, onGameOver }) => {
  const [score, setScore] = useState(0);
  const [birdY, setBirdY] = useState(300);
  const [birdVelocity, setBirdVelocity] = useState(0);
  const [pipes, setPipes] = useState<PipeData[]>([]);
  const [countdown, setCountdown] = useState<number | null>(3);
  const [isGameOver, setIsGameOver] = useState(false);

  // Leaderboard / name entry state
  const [playerName, setPlayerName] = useState('');
  const [rank, setRank] = useState<number | null>(null);
  const [totalPlayers, setTotalPlayers] = useState<number>(0);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [rankLoaded, setRankLoaded] = useState(false);

  const requestRef = useRef<number>(0);
  const lastPipeSpawn = useRef<number>(0);
  const scoreRef = useRef(0);

  // Keep scoreRef in sync so game-over handler can read latest score
  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  // 1. Countdown Logic
  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setCountdown(null), 500);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // 2. Fetch rank when game is over
  useEffect(() => {
    if (!isGameOver) return;

    const fetchRank = async () => {
      const finalScore = scoreRef.current;
      // Count how many players scored strictly higher
      const { count: higherCount } = await supabase
        .from('scores')
        .select('*', { count: 'exact', head: true })
        .gt('score', finalScore);

      const { count: total } = await supabase
        .from('scores')
        .select('*', { count: 'exact', head: true });

      setRank((higherCount ?? 0) + 1); // rank = players with higher score + 1
      setTotalPlayers(total ?? 0);
      setRankLoaded(true);
    };

    fetchRank();
  }, [isGameOver]);

  // 3. Save score to Supabase
  const handleSaveScore = async () => {
    if (!playerName.trim()) return;
    setSaveStatus('saving');
    try {
      const { error } = await supabase
        .from('scores')
        .insert([{ name: playerName.trim(), score: scoreRef.current }]);

      if (error) throw error;
      setSaveStatus('saved');

      // Re-fetch rank to be accurate after insertion
      const { count: higherCount } = await supabase
        .from('scores')
        .select('*', { count: 'exact', head: true })
        .gt('score', scoreRef.current);
      const { count: total } = await supabase
        .from('scores')
        .select('*', { count: 'exact', head: true });
      setRank((higherCount ?? 0) + 1);
      setTotalPlayers(total ?? 0);
    } catch {
      setSaveStatus('error');
    }
  };

  // 4. Input Handling
  const jump = () => {
    if (countdown === null && !isGameOver) {
      setBirdVelocity(JUMP_STRENGTH);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'Enter' || e.code === 'KeyW') jump();
    };
    if (mode === GameMode.KEYBOARD) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, countdown, isGameOver]);

  // 5. Game Loop
  const update = (time: number) => {
    if (countdown !== null || isGameOver) return;

    setBirdY((y) => {
      const newY = y + birdVelocity;
      setBirdVelocity((v) => v + GRAVITY);
      if (newY > window.innerHeight - 120 || newY < 0) {
        setIsGameOver(true);
      }
      return newY;
    });

    setPipes((prevPipes) => {
      if (time - lastPipeSpawn.current > PIPE_SPAWN_RATE) {
        const randomGap = 260 + Math.random() * 90;
        const newPipe: PipeData = {
          id: Date.now(),
          x: window.innerWidth,
          topHeight: 100 + Math.random() * 250,
          passed: false,
          gap: randomGap,
        };
        lastPipeSpawn.current = time;
        prevPipes.push(newPipe);
      }
      return prevPipes.map((p) => ({ ...p, x: p.x - PIPE_SPEED })).filter((p) => p.x > -100);
    });

    pipes.forEach((pipe) => {
      if (!pipe.passed && pipe.x < BIRD_X) {
        pipe.passed = true;
        setScore((s) => s + 1);
      }
      const birdRect = { top: birdY, bottom: birdY + 45, left: BIRD_X, right: BIRD_X + 55 };
      if (
        birdRect.right > pipe.x &&
        birdRect.left < pipe.x + 90 &&
        (birdRect.top < pipe.topHeight || birdRect.bottom > pipe.topHeight + 170)
      ) {
        setIsGameOver(true);
      }
    });

    requestRef.current = requestAnimationFrame(update);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [countdown, isGameOver, birdVelocity, pipes]);

  // Rank badge helper
  const getRankLabel = () => {
    if (rank === null) return null;
    if (rank === 1) return { emoji: '👑', label: 'NEW #1!', color: '#FFD700' };
    if (rank <= 3) return { emoji: '🥇', label: `Top 3!`, color: '#FFD700' };
    if (rank <= 10) return { emoji: '🏅', label: `Top 10!`, color: '#C0C0C0' };
    if (rank <= 50) return { emoji: '⭐', label: `Top 50`, color: '#CD7F32' };
    return { emoji: '🎯', label: `Rank #${rank}`, color: '#aaa' };
  };

  const rankInfo = getRankLabel();

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }} onClick={jump}>
      {/* Score */}
      <div style={{
        position: 'absolute', top: 40, width: '100%', textAlign: 'center',
        color: 'white', fontSize: '4rem', fontWeight: 'bold', zIndex: 20,
        textShadow: '2px 2px 8px rgba(0,0,0,0.5)',
      }}>
        {score}
      </div>

      {/* Countdown */}
      {countdown !== null && (
        <div className="overlay">
          <h1 style={{ fontSize: '10rem', color: 'white' }}>{countdown === 0 ? 'GO!' : countdown}</h1>
        </div>
      )}

      {/* Game Over */}
      {isGameOver && (
        <div className="overlay" style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)' }}>
          <div style={{
            background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '24px',
            padding: '40px 48px',
            maxWidth: '420px',
            width: '90vw',
            textAlign: 'center',
            boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
          }}>
            <h1 style={{
              fontFamily: "'Fredoka One', cursive",
              fontSize: '2.8rem',
              color: '#FF6B6B',
              margin: '0 0 4px',
              letterSpacing: '2px',
            }}>GAME OVER</h1>

            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', margin: '0 0 20px' }}>
              Better luck next time!
            </p>

            {/* Score */}
            <div style={{
              background: 'rgba(255,255,255,0.06)',
              borderRadius: '16px',
              padding: '16px 24px',
              marginBottom: '20px',
            }}>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', letterSpacing: '2px', textTransform: 'uppercase' }}>
                Final Score
              </div>
              <div style={{
                fontFamily: "'Fredoka One', cursive",
                fontSize: '4rem',
                color: '#FFD700',
                lineHeight: 1.1,
              }}>
                {score}
              </div>
            </div>

            {/* Rank badge */}
            {rankLoaded && rankInfo && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: `rgba(255,255,255,0.08)`,
                border: `1px solid ${rankInfo.color}44`,
                borderRadius: '999px',
                padding: '8px 20px',
                marginBottom: '24px',
              }}>
                <span style={{ fontSize: '1.4rem' }}>{rankInfo.emoji}</span>
                <span style={{ color: rankInfo.color, fontWeight: 700, fontSize: '1rem' }}>{rankInfo.label}</span>
                {totalPlayers > 0 && (
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
                    of {totalPlayers + 1} players
                  </span>
                )}
              </div>
            )}

            {/* Name entry — only show if not saved */}
            {saveStatus !== 'saved' && (
              <div style={{ marginBottom: '24px' }}>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginBottom: '10px' }}>
                  Enter your name to save to leaderboard:
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    maxLength={20}
                    placeholder="Your name..."
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    onKeyDown={(e) => e.code === 'Enter' && handleSaveScore()}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      flex: 1,
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '10px',
                      color: 'white',
                      padding: '10px 14px',
                      fontSize: '1rem',
                      outline: 'none',
                    }}
                  />
                  <button
                    onClick={(e) => { e.stopPropagation(); handleSaveScore(); }}
                    disabled={saveStatus === 'saving' || !playerName.trim()}
                    style={{
                      background: saveStatus === 'saving' ? '#555' : 'linear-gradient(135deg, #43e97b, #38f9d7)',
                      border: 'none',
                      borderRadius: '10px',
                      color: '#000',
                      fontWeight: 700,
                      padding: '10px 18px',
                      cursor: saveStatus === 'saving' ? 'not-allowed' : 'pointer',
                      fontSize: '0.9rem',
                      transition: 'opacity 0.2s',
                    }}
                  >
                    {saveStatus === 'saving' ? '...' : 'Save'}
                  </button>
                </div>
                {saveStatus === 'error' && (
                  <p style={{ color: '#FF6B6B', fontSize: '0.8rem', marginTop: '6px' }}>
                    Failed to save. Please try again.
                  </p>
                )}
              </div>
            )}

            {saveStatus === 'saved' && (
              <div style={{
                background: 'rgba(67, 233, 123, 0.1)',
                border: '1px solid rgba(67,233,123,0.3)',
                borderRadius: '12px',
                padding: '12px',
                marginBottom: '24px',
                color: '#43e97b',
                fontSize: '0.9rem',
              }}>
                ✅ Score saved! You're #{rank} on the leaderboard.
              </div>
            )}

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                className="play-button"
                onClick={(e) => { e.stopPropagation(); window.location.reload(); }}
              >
                Try Again
              </button>
              <button
                className="back-button"
                onClick={(e) => { e.stopPropagation(); onGameOver(); }}
              >
                Main Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bird */}
      <div
        className="bird"
        style={{
          top: birdY,
          left: BIRD_X,
          transform: `rotate(${birdVelocity * 3}deg)`,
          animation: 'none',
        }}
      >
        <div className="bird-eye" />
        <div className="bird-wing" />
      </div>

      {/* Pipes */}
      {pipes.map((pipe) => (
        <div
          key={pipe.id}
          className="pipe-set"
          style={{ transform: `translateX(${pipe.x}px)`, animation: 'none' }}
        >
          <div className="pipe pipe-top" style={{ height: pipe.topHeight }} />
          <div className="pipe-gap" style={{ height: pipe.gap }} />
          <div className="pipe pipe-bottom" style={{ height: `calc(100vh - ${pipe.topHeight + pipe.gap}px)` }} />
        </div>
      ))}
    </div>
  );
};

export default GamePlayScreen;