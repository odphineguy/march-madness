'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export default function Home() {
  const [countdown, setCountdown] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const target = new Date('2026-03-15T00:00:00');
    function update() {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) {
        setCountdown({ d: 0, h: 0, m: 0, s: 0 });
        return;
      }
      setCountdown({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    }
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '4rem 2rem', position: 'relative' }}>
      {/* Header */}
      <header className="animate-reveal" style={{ animationDelay: '0.1s' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem', flexWrap: 'wrap' }}>
          <div>
            <p className="data-mono">// MARCH TO THE TITLE 2026</p>
            <h1>TONY&apos;S<br />MADNESS</h1>
          </div>
          <div style={{ position: 'relative' }}>
            <Image
              src="/images/dunk.png"
              alt="Tony's Mascot"
              width={280}
              height={280}
              priority
              style={{
                width: 'clamp(160px, 20vw, 280px)',
                height: 'auto',
                objectFit: 'contain',
                animation: 'float 4s ease-in-out infinite, glow-pulse 3s ease-in-out infinite',
                marginRight: '4rem',
              }}
            />
          </div>
        </div>
      </header>

      {/* Matchup Card */}
      <section className="relief-card animate-reveal" style={{ animationDelay: '0.3s', marginTop: '3rem' }}>
        <div className="relief-inner">
          <div className="data-mono" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <span>64 Teams &bull; Single Elimination</span>
            <span>Entry Fee: $25</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.2rem', color: 'var(--orange)', opacity: 0.6 }}>#01</span>
              <span style={{ fontSize: 'clamp(1.5rem, 4vw, 3rem)', fontWeight: 900, lineHeight: 1 }}>YOUR<br />TEAM</span>
            </div>

            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 'clamp(2rem, 6vw, 5rem)',
              fontWeight: 300,
              background: 'linear-gradient(180deg, #fff 0%, #444 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              padding: '0 2rem',
              borderLeft: '1px solid rgba(255,255,255,0.1)',
              borderRight: '1px solid rgba(255,255,255,0.1)',
              textAlign: 'center',
            }}>
              VS
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'right', alignItems: 'flex-end' }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.2rem', color: 'var(--orange)', opacity: 0.6 }}>#16</span>
              <span style={{ fontSize: 'clamp(1.5rem, 4vw, 3rem)', fontWeight: 900, lineHeight: 1 }}>THEIR<br />TEAM</span>
            </div>
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--orange)">
              <circle cx="12" cy="12" r="10" fillOpacity="0.2" />
              <circle cx="12" cy="12" r="4" />
            </svg>
            <span className="data-mono" style={{ color: 'var(--text-dim)' }}>Make Your Picks Before Brackets Lock</span>
          </div>
        </div>
      </section>

      {/* Countdown */}
      <div className="animate-reveal" style={{ animationDelay: '0.5s', marginTop: '5rem', textAlign: 'center' }}>
        <p style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.8rem',
          letterSpacing: '0.2em',
          color: 'var(--orange)',
          textTransform: 'uppercase',
          marginBottom: '1.5rem',
        }}>// Teams Announced In</p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {[
            { val: countdown.d, label: 'Days' },
            { val: countdown.h, label: 'Hours' },
            { val: countdown.m, label: 'Mins' },
            { val: countdown.s, label: 'Secs' },
          ].map((item) => (
            <div key={item.label} className="card" style={{
              minWidth: 100,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '1.5rem 1.8rem',
            }}>
              <span style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '3.5rem',
                fontWeight: 900,
                lineHeight: 1,
              }}>{pad(item.val)}</span>
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.65rem',
                letterSpacing: '0.15em',
                color: 'var(--text-dim)',
                textTransform: 'uppercase',
              }}>{item.label}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '2.5rem', marginTop: '2rem', flexWrap: 'wrap' }}>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.75rem',
            color: 'var(--text-dim)',
            letterSpacing: '0.05em',
          }}>
            Brackets Lock <span style={{ color: 'var(--text-main)', fontWeight: 900 }}>Mar 19</span>
          </span>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.75rem',
            color: 'var(--text-dim)',
            letterSpacing: '0.05em',
          }}>
            Entry Fee <span style={{ color: 'var(--orange)', fontWeight: 900 }}>$25</span>
          </span>
        </div>
      </div>

      {/* CTAs */}
      <div className="animate-reveal" style={{ animationDelay: '0.7s', marginTop: '4rem', textAlign: 'center', display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link href="/signup" className="pebble-cta">
          Sign Up &amp; Make Picks
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
        <Link href="/login" className="btn-secondary">
          Already Signed Up? Log In
        </Link>
      </div>

      {/* Leaderboard link */}
      <div className="animate-reveal" style={{ animationDelay: '0.9s', marginTop: '2rem', textAlign: 'center' }}>
        <Link href="/leaderboard" style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.75rem',
          letterSpacing: '0.15em',
          color: 'var(--text-dim)',
          textTransform: 'uppercase',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '2px',
          transition: 'color 0.3s',
        }}>
          View Leaderboard
        </Link>
      </div>
    </div>
  );
}
