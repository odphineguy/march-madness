'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  buildFeedMap,
  buildInitialSlots,
  makePick as makePickLogic,
  TOTAL_GAMES,
  getAllGameIds,
  type GameSlots,
  type FeedTarget,
} from '@/lib/bracket-logic';
import {
  REGIONS,
  REGION_LABELS,
  SEED_MATCHUPS,
  ROUND_LABELS,
  teamKey,
  teamName,
  teamSeed,
  type Region,
} from '@/lib/teams';
import './bracket.css';

const FEED_MAP = buildFeedMap();

interface UserInfo {
  id: string;
  displayName: string;
}

export default function BracketPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [picks, setPicks] = useState<Record<string, string>>({});
  const [slots, setSlots] = useState<Record<string, GameSlots>>(buildInitialSlots);
  const [locked, setLocked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Check auth
  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (!data.user) {
          router.push('/login');
        } else {
          setUser(data.user);
        }
      })
      .catch(() => router.push('/login'));
  }, [router]);

  // Load bracket from Supabase
  useEffect(() => {
    if (!user) return;
    fetch(`/api/brackets?userId=${user.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.bracket) {
          const savedPicks = data.bracket.picks || {};
          setLocked(data.bracket.locked || false);
          // Replay picks to rebuild slots
          replayPicks(savedPicks);
        }
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [user]);

  function replayPicks(savedPicks: Record<string, string>) {
    let currentSlots = buildInitialSlots();
    const orderedIds = getAllGameIds();

    orderedIds.forEach((gameId) => {
      if (savedPicks[gameId]) {
        const tk = savedPicks[gameId];
        const feed = FEED_MAP[gameId];
        if (feed) {
          currentSlots[feed.target] = {
            ...currentSlots[feed.target],
            [feed.slot]: tk,
          };
        }
      }
    });

    setPicks(savedPicks);
    setSlots(currentSlots);
  }

  // Save to Supabase
  const saveBracket = useCallback(
    async (newPicks: Record<string, string>, isLocked = false) => {
      if (!user) return;
      setSaving(true);
      try {
        await fetch('/api/brackets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            picks: newPicks,
            locked: isLocked,
          }),
        });
      } catch (e) {
        console.error('Save failed', e);
      } finally {
        setSaving(false);
      }
    },
    [user]
  );

  function handlePick(gameId: string, chosenTeamKey: string) {
    if (locked) return;
    if (picks[gameId] === chosenTeamKey) return; // already picked

    const { picks: newPicks, slots: newSlots } = makePickLogic(
      picks,
      slots,
      FEED_MAP,
      gameId,
      chosenTeamKey
    );

    setPicks(newPicks);
    setSlots(newSlots);
    saveBracket(newPicks);
  }

  function handleLock() {
    const pickCount = Object.keys(picks).length;
    if (pickCount < TOTAL_GAMES) {
      alert(`Complete all ${TOTAL_GAMES} picks before locking! (${pickCount}/${TOTAL_GAMES} done)`);
      return;
    }
    if (!confirm('Lock your bracket? No more changes will be allowed.')) return;
    setLocked(true);
    saveBracket(picks, true);
  }

  function handleReset() {
    if (locked) return;
    if (!confirm('Reset all picks? This cannot be undone.')) return;
    setPicks({});
    setSlots(buildInitialSlots());
    saveBracket({});
  }

  function handleLogout() {
    document.cookie = 'session=; path=/; max-age=0';
    router.push('/');
  }

  const pickCount = Object.keys(picks).length;
  const pct = Math.round((pickCount / TOTAL_GAMES) * 100);

  // Get champion
  const champion = picks['champ'] ? teamName(picks['champ']) : null;

  if (!loaded) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <p className="data-mono">Loading bracket...</p>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <header className="bracket-header">
        <div className="bracket-header-left">
          <Link href="/">
            <Image src="/images/dunk.png" alt="Logo" width={60} height={60} style={{ width: 60, height: 'auto' }} />
          </Link>
          <h1 style={{ fontSize: '1.6rem', letterSpacing: '-0.02em' }}>
            <span style={{ color: 'var(--orange)' }}>TONY&apos;S</span> BRACKET
          </h1>
        </div>

        <div className="bracket-header-center">
          <div className="progress-wrap">
            <div className="progress-bar-outer">
              <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="progress-text">{pickCount}/{TOTAL_GAMES}</span>
          </div>
          {saving && <span className="progress-text" style={{ color: 'var(--orange)' }}>Saving...</span>}
          {locked && <span className="progress-text" style={{ color: '#55ff55' }}>LOCKED</span>}
        </div>

        <div className="bracket-header-right">
          {!locked && (
            <>
              <button className="btn-secondary" onClick={handleLock}>
                Lock Bracket
              </button>
              <button className="btn-danger" onClick={handleReset}>
                Reset
              </button>
            </>
          )}
          <Link href="/leaderboard" className="btn-secondary">
            Leaderboard
          </Link>
          <button className="btn-secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* Watermark logo */}
      <Image
        src="/images/dunk.png"
        alt=""
        width={800}
        height={800}
        className="bracket-watermark"
      />

      {/* Bracket */}
      <div className="bracket-wrapper">
        <div className="bracket-grid">
          {/* Left: South (top-left) and West (bottom-left) */}
          <RegionBracket
            region="south"
            slots={slots}
            picks={picks}
            locked={locked}
            onPick={handlePick}
            mirrored={false}
          />
          <RegionBracket
            region="west"
            slots={slots}
            picks={picks}
            locked={locked}
            onPick={handlePick}
            mirrored={false}
          />

          {/* Center: Final Four + Championship */}
          <div className="center-column">
            {/* FF Semifinal 1: South vs West */}
            <div>
              <p className="ff-label">Final Four</p>
              <MatchupSlot
                gameId="ff-1"
                slots={slots}
                picks={picks}
                locked={locked}
                onPick={handlePick}
                className="final-four-matchup"
              />
            </div>

            {/* Championship */}
            <div>
              <p className="ff-label">Championship</p>
              <MatchupSlot
                gameId="champ"
                slots={slots}
                picks={picks}
                locked={locked}
                onPick={handlePick}
                className="final-four-matchup"
              />
            </div>

            {/* Champion Display */}
            <div className={`champion-display ${champion ? 'has-winner' : ''}`}>
              <p className="champion-label">2026 Champion</p>
              <p className="champion-name">{champion || 'TBD'}</p>
            </div>

            {/* FF Semifinal 2: East vs Midwest */}
            <div>
              <p className="ff-label">Final Four</p>
              <MatchupSlot
                gameId="ff-2"
                slots={slots}
                picks={picks}
                locked={locked}
                onPick={handlePick}
                className="final-four-matchup"
              />
            </div>
          </div>

          {/* Right: East (top-right) and Midwest (bottom-right) - mirrored */}
          <RegionBracket
            region="east"
            slots={slots}
            picks={picks}
            locked={locked}
            onPick={handlePick}
            mirrored={true}
          />
          <RegionBracket
            region="midwest"
            slots={slots}
            picks={picks}
            locked={locked}
            onPick={handlePick}
            mirrored={true}
          />
        </div>
      </div>
    </>
  );
}

/* ============ Sub-components ============ */

function RegionBracket({
  region,
  slots,
  picks,
  locked,
  onPick,
  mirrored,
}: {
  region: Region;
  slots: Record<string, GameSlots>;
  picks: Record<string, string>;
  locked: boolean;
  onPick: (gameId: string, teamKey: string) => void;
  mirrored: boolean;
}) {
  const regionClass = `region region-${region} ${mirrored ? 'mirrored' : ''}`;

  const rounds = [
    { key: 'r64', count: 8, label: 'R64' },
    { key: 'r32', count: 4, label: 'R32' },
    { key: 's16', count: 2, label: 'S16' },
    { key: 'e8', count: 1, label: 'E8' },
  ];

  return (
    <div className={regionClass}>
      <span className="region-label">{REGION_LABELS[region]}</span>
      {rounds.map((round) => (
        <div key={round.key} className="round">
          {Array.from({ length: round.count }, (_, i) => {
            const gameId = `${region}-${round.key}-${i + 1}`;
            return (
              <MatchupSlot
                key={gameId}
                gameId={gameId}
                slots={slots}
                picks={picks}
                locked={locked}
                onPick={onPick}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

function MatchupSlot({
  gameId,
  slots,
  picks,
  locked,
  onPick,
  className = '',
}: {
  gameId: string;
  slots: Record<string, GameSlots>;
  picks: Record<string, string>;
  locked: boolean;
  onPick: (gameId: string, teamKey: string) => void;
  className?: string;
}) {
  const gameSlots = slots[gameId];
  if (!gameSlots) return null;

  const picked = picks[gameId];

  return (
    <div className={`matchup ${className}`}>
      <TeamSlotView
        teamKeyVal={gameSlots.top}
        isPicked={picked === gameSlots.top && !!gameSlots.top}
        isEliminated={!!picked && picked !== gameSlots.top && !!gameSlots.top}
        isLocked={locked}
        onClick={() => {
          if (gameSlots.top && !locked) onPick(gameId, gameSlots.top);
        }}
      />
      <TeamSlotView
        teamKeyVal={gameSlots.bot}
        isPicked={picked === gameSlots.bot && !!gameSlots.bot}
        isEliminated={!!picked && picked !== gameSlots.bot && !!gameSlots.bot}
        isLocked={locked}
        onClick={() => {
          if (gameSlots.bot && !locked) onPick(gameId, gameSlots.bot);
        }}
      />
    </div>
  );
}

function TeamSlotView({
  teamKeyVal,
  isPicked,
  isEliminated,
  isLocked,
  onClick,
}: {
  teamKeyVal: string | null;
  isPicked: boolean;
  isEliminated: boolean;
  isLocked: boolean;
  onClick: () => void;
}) {
  if (!teamKeyVal) {
    return (
      <div className="team-slot empty">
        <span className="slot-seed">-</span>
        <span className="slot-name">TBD</span>
      </div>
    );
  }

  const name = teamName(teamKeyVal);
  const seed = teamSeed(teamKeyVal);
  const classes = [
    'team-slot',
    isPicked ? 'picked' : '',
    isEliminated ? 'eliminated' : '',
    isLocked ? 'locked' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} onClick={onClick}>
      <span className="slot-seed">{seed}</span>
      <span className="slot-name">{name}</span>
    </div>
  );
}
