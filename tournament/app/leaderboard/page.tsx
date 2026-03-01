'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface BracketEntry {
  user_id: string;
  score: number;
  locked: boolean;
  picks: Record<string, string>;
  users: { display_name: string };
}

export default function LeaderboardPage() {
  const [brackets, setBrackets] = useState<BracketEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/brackets')
      .then((r) => r.json())
      .then((data) => {
        setBrackets(data.brackets || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem', minHeight: '100vh' }}>
      {/* Header */}
      <div className="animate-reveal" style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <Link href="/">
          <Image
            src="/images/dunk.png"
            alt="Logo"
            width={80}
            height={80}
            style={{ width: 80, height: 'auto', margin: '0 auto', animation: 'float 4s ease-in-out infinite, glow-pulse 3s ease-in-out infinite' }}
          />
        </Link>
        <h2 style={{ marginTop: '1rem' }}>Leaderboard</h2>
        <p className="data-mono" style={{ marginTop: '0.5rem' }}>// Tony&apos;s Madness 2026</p>
      </div>

      {/* Navigation */}
      <div className="animate-reveal" style={{ animationDelay: '0.1s', display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2rem' }}>
        <Link href="/" className="btn-secondary">Home</Link>
        <Link href="/bracket" className="btn-secondary">My Bracket</Link>
      </div>

      {/* Leaderboard Table */}
      <div className="animate-reveal" style={{ animationDelay: '0.2s' }}>
        <div className="relief-card">
          <div className="relief-inner" style={{ padding: '0' }}>
            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                <p className="data-mono">Loading...</p>
              </div>
            ) : brackets.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-dim)', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem' }}>
                  No brackets submitted yet. Be the first!
                </p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <th style={thStyle}>#</th>
                    <th style={{ ...thStyle, textAlign: 'left' }}>Player</th>
                    <th style={thStyle}>Picks</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {brackets.map((b, i) => {
                    const pickCount = Object.keys(b.picks || {}).length;
                    return (
                      <tr
                        key={b.user_id}
                        style={{
                          borderBottom: '1px solid rgba(255,255,255,0.03)',
                          background: i === 0 ? 'rgba(255, 92, 0, 0.05)' : 'transparent',
                        }}
                      >
                        <td style={tdStyle}>
                          <span style={{
                            color: i < 3 ? 'var(--orange)' : 'var(--text-dim)',
                            fontWeight: i < 3 ? 900 : 400,
                          }}>
                            {i + 1}
                          </span>
                        </td>
                        <td style={{ ...tdStyle, textAlign: 'left' }}>
                          <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                            {b.users?.display_name || 'Unknown'}
                          </span>
                        </td>
                        <td style={tdStyle}>
                          <span style={{ color: pickCount === 63 ? '#55ff55' : 'var(--text-dim)' }}>
                            {pickCount}/63
                          </span>
                        </td>
                        <td style={tdStyle}>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '100px',
                            fontSize: '0.6rem',
                            letterSpacing: '0.1em',
                            background: b.locked ? 'rgba(85, 255, 85, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                            color: b.locked ? '#55ff55' : 'var(--text-dim)',
                            border: `1px solid ${b.locked ? 'rgba(85, 255, 85, 0.2)' : 'var(--border-subtle)'}`,
                          }}>
                            {b.locked ? 'LOCKED' : 'OPEN'}
                          </span>
                        </td>
                        <td style={tdStyle}>
                          <span style={{
                            fontWeight: 900,
                            fontSize: '1.1rem',
                            color: b.score > 0 ? 'var(--orange)' : 'var(--text-dim)',
                          }}>
                            {b.score}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Scoring Info */}
      <div className="animate-reveal" style={{ animationDelay: '0.4s', marginTop: '2rem' }}>
        <div className="card" style={{ padding: '1.5rem' }}>
          <p className="data-mono" style={{ marginBottom: '1rem' }}>// Scoring System</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem' }}>
            {[
              { round: 'Round of 64', pts: '1 pt' },
              { round: 'Round of 32', pts: '2 pts' },
              { round: 'Sweet 16', pts: '4 pts' },
              { round: 'Elite 8', pts: '8 pts' },
              { round: 'Final Four', pts: '16 pts' },
              { round: 'Championship', pts: '32 pts' },
            ].map((s) => (
              <div key={s.round} style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                  {s.round}
                </span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', color: 'var(--orange)', fontWeight: 500 }}>
                  {s.pts}
                </span>
              </div>
            ))}
          </div>
          <p style={{
            marginTop: '1rem',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.7rem',
            color: 'var(--text-dim)',
          }}>
            Max possible: <span style={{ color: 'var(--orange)' }}>192 points</span>
          </p>
        </div>
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: '1rem 0.75rem',
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '0.65rem',
  letterSpacing: '0.15em',
  textTransform: 'uppercase',
  color: 'var(--text-dim)',
  textAlign: 'center',
};

const tdStyle: React.CSSProperties = {
  padding: '0.75rem',
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '0.75rem',
  textAlign: 'center',
};
