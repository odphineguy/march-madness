'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!name.trim() || !password) {
      setError('Enter your name and password');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: name.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      router.push('/bracket');
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      <div className="animate-reveal" style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Image
            src="/images/dunk.png"
            alt="Tony's Mascot"
            width={100}
            height={100}
            style={{ width: 100, height: 'auto', margin: '0 auto', animation: 'float 4s ease-in-out infinite, glow-pulse 3s ease-in-out infinite' }}
          />
          <h2 style={{ marginTop: '1rem', color: 'var(--text-main)' }}>Welcome Back</h2>
          <p className="data-mono" style={{ marginTop: '0.5rem' }}>// Log In To Your Bracket</p>
        </div>

        <div className="relief-card">
          <div className="relief-inner">
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label className="input-label">Display Name</label>
                <input
                  className="input-field"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="input-label">Password</label>
                <input
                  className="input-field"
                  type="password"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error && <p className="msg-error">{error}</p>}

              <button
                type="submit"
                className="pebble-cta"
                disabled={loading}
                style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', opacity: loading ? 0.6 : 1 }}
              >
                {loading ? 'Logging In...' : 'Log In'}
              </button>
            </form>

            <p style={{
              textAlign: 'center',
              marginTop: '1.5rem',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.75rem',
              color: 'var(--text-dim)',
            }}>
              Don&apos;t have an account?{' '}
              <Link href="/signup" style={{ color: 'var(--orange)' }}>Sign up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
