import React, { useEffect, useState } from 'react';
import { ScreenType } from './ScreenType.tsx';
import { supabase } from '../database/supabase.ts'

interface ScoreEntry {
  id: number;
  name: string;
  score: number;
  created_at: string;
}

interface RankingProps {
  navigate: (target: typeof ScreenType[keyof typeof ScreenType]) => void;
}

const MEDAL: Record<number, { emoji: string; color: string }> = {
  1: { emoji: '👑', color: '#FFE566' },
  2: { emoji: '🥈', color: '#C0C0C0' },
  3: { emoji: '🥉', color: '#CD7F32' },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function RankingScreen({ navigate }: RankingProps) {
  const [entries, setEntries] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchScores = async () => {
    setLoading(true);
    setError(false);
    try {
      const { data, error } = await supabase
        .from('scores')
        .select('*')
        .order('score', { ascending: false })
        .limit(20);

      if (error) throw error;
      setEntries(data ?? []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScores();

    const channel = supabase
      .channel('scores-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'scores' }, () => {
        fetchScores();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <>
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -600px 0; }
          100% { background-position: 600px 0; }
        }
        .rank-row {
          animation: fadeSlideIn 0.35s ease both;
        }
        .rank-row:hover .ranking-item {
          background: rgba(255, 255, 255, 0.16) !important;
          transform: translateX(4px) scale(1.012);
          border-color: rgba(255, 255, 255, 0.25) !important;
        }
        .ranking-item {
          transition: transform 0.18s ease, background 0.18s ease, border-color 0.18s ease;
        }
        .skeleton-row {
          background: linear-gradient(
            90deg,
            rgba(255,255,255,0.04) 25%,
            rgba(255,255,255,0.1) 50%,
            rgba(255,255,255,0.04) 75%
          );
          background-size: 600px 100%;
          animation: shimmer 1.5s infinite linear;
          border-radius: 14px;
          height: 64px;
        }
      `}</style>

      <div className="screen-container" style={{ maxWidth: '620px', padding: '44px 40px' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '2.2rem', marginBottom: '8px' }}>🏆</div>
          <h1 className="section-title" style={{ marginBottom: '6px' }}>Rankings</h1>
          <p style={{
            fontFamily: "'Nunito', sans-serif",
            color: 'rgba(200, 232, 255, 0.6)',
            fontSize: '0.9rem',
            fontWeight: 700,
            margin: 0,
          }}>
            Top 20 all-time scores
          </p>
        </div>

        {/* Board */}
        <div className="ranking-board" style={{ marginBottom: '32px' }}>

          {/* Loading skeletons */}
          {loading && Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="skeleton-row"
              style={{ animationDelay: `${i * 0.08}s` }}
            />
          ))}

          {/* Error state */}
          {!loading && error && (
            <div style={{
              textAlign: 'center',
              padding: '44px 20px',
              fontFamily: "'Press Start 2P', monospace",
              color: '#ff7070',
              fontSize: '0.6rem',
              lineHeight: 2,
            }}>
              ⚠ COULD NOT LOAD<br />
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.5rem' }}>Check your connection</span>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && entries.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '48px 20px',
              fontFamily: "'Press Start 2P', monospace",
              color: 'rgba(255,255,255,0.35)',
              fontSize: '0.6rem',
              lineHeight: 2.2,
            }}>
              NO SCORES YET<br />
              <span style={{ fontSize: '0.5rem', color: 'rgba(200,232,255,0.4)' }}>Be the first to play! 🐦</span>
            </div>
          )}

          {/* Entries */}
          {!loading && !error && entries.map((entry, index) => {
            const rank = index + 1;
            const medal = MEDAL[rank];
            const isTop3 = rank <= 3;

            return (
              <div
                key={entry.id}
                className="rank-row"
                style={{ animationDelay: `${index * 0.04}s` }}
              >
                <div
                  className="ranking-item"
                  style={isTop3 ? {
                    background: `rgba(255, 229, 102, 0.1)`,
                    borderColor: `${medal.color}55`,
                    boxShadow: `0 4px 20px ${medal.color}22`,
                  } : {}}
                >
                  {/* Rank badge */}
                  <div style={{ textAlign: 'center' }}>
                    {medal ? (
                      <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>{medal.emoji}</span>
                    ) : (
                      <span style={{
                        fontFamily: "'Press Start 2P', monospace",
                        fontSize: '0.6rem',
                        color: rank <= 10 ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)',
                      }}>
                        #{rank}
                      </span>
                    )}
                  </div>

                  {/* Name + time */}
                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      fontFamily: "'Nunito', sans-serif",
                      fontWeight: 900,
                      fontSize: isTop3 ? '1.05rem' : '0.95rem',
                      color: isTop3 ? medal.color : 'white',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {entry.name}
                    </div>
                    <div style={{
                      fontFamily: "'Nunito', sans-serif",
                      fontSize: '0.72rem',
                      color: 'rgba(255,255,255,0.3)',
                      marginTop: '2px',
                      fontWeight: 600,
                    }}>
                      {timeAgo(entry.created_at)}
                    </div>
                  </div>

                  {/* Score */}
                  <div style={{
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: isTop3 ? '1.4rem' : '1.1rem',
                    color: isTop3 ? medal.color : '#FFE566',
                    textShadow: isTop3 ? `0 0 14px ${medal.color}88` : '0 0 10px rgba(255,229,102,0.4)',
                    letterSpacing: '1px',
                  }}>
                    {entry.score}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer buttons */}
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center' }}>
          <button
            onClick={fetchScores}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.18)',
              borderRadius: '14px',
              color: 'rgba(255,255,255,0.75)',
              padding: '16px 22px',
              cursor: 'pointer',
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '0.6rem',
              fontWeight: 400,
              transition: 'background 0.2s, transform 0.2s',
              letterSpacing: '0.03em',
              lineHeight: 1.6,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.14)';
              e.currentTarget.style.transform = 'translateY(-3px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            ↻ REFRESH
          </button>
          <button
            className="back-button"
            onClick={() => navigate(ScreenType.MAIN_MENU)}
          >
            ← BACK
          </button>
        </div>

      </div>
    </>
  );
}

export default RankingScreen;