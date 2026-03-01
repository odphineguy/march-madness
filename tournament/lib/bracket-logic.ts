import { REGIONS, SEED_MATCHUPS, Region, teamKey } from './teams';

export interface FeedTarget {
  target: string;
  slot: 'top' | 'bot';
}

export interface GameSlots {
  top: string | null; // team key or null if empty
  bot: string | null;
}

// Build the feed map: which game feeds into which
export function buildFeedMap(): Record<string, FeedTarget> {
  const map: Record<string, FeedTarget> = {};

  REGIONS.forEach(region => {
    // R64 → R32
    for (let i = 1; i <= 8; i++) {
      const r32Game = `${region}-r32-${Math.ceil(i / 2)}`;
      const slot = (i % 2 === 1) ? 'top' : 'bot';
      map[`${region}-r64-${i}`] = { target: r32Game, slot: slot as 'top' | 'bot' };
    }
    // R32 → S16
    for (let i = 1; i <= 4; i++) {
      const s16Game = `${region}-s16-${Math.ceil(i / 2)}`;
      const slot = (i % 2 === 1) ? 'top' : 'bot';
      map[`${region}-r32-${i}`] = { target: s16Game, slot: slot as 'top' | 'bot' };
    }
    // S16 → E8
    for (let i = 1; i <= 2; i++) {
      const slot = (i % 2 === 1) ? 'top' : 'bot';
      map[`${region}-s16-${i}`] = { target: `${region}-e8-1`, slot: slot as 'top' | 'bot' };
    }
  });

  // E8 → Final Four
  map['south-e8-1'] = { target: 'ff-1', slot: 'top' };
  map['west-e8-1'] = { target: 'ff-1', slot: 'bot' };
  map['east-e8-1'] = { target: 'ff-2', slot: 'top' };
  map['midwest-e8-1'] = { target: 'ff-2', slot: 'bot' };

  // Final Four → Championship
  map['ff-1'] = { target: 'champ', slot: 'top' };
  map['ff-2'] = { target: 'champ', slot: 'bot' };

  return map;
}

// Build the initial game slots (Round of 64 pre-populated, rest empty)
export function buildInitialSlots(): Record<string, GameSlots> {
  const slots: Record<string, GameSlots> = {};

  REGIONS.forEach(region => {
    // R64: pre-populate with teams
    SEED_MATCHUPS.forEach(([seed1, seed2], idx) => {
      slots[`${region}-r64-${idx + 1}`] = {
        top: teamKey(region, seed1),
        bot: teamKey(region, seed2),
      };
    });
    // R32, S16, E8: empty
    for (let i = 1; i <= 4; i++) {
      slots[`${region}-r32-${i}`] = { top: null, bot: null };
    }
    for (let i = 1; i <= 2; i++) {
      slots[`${region}-s16-${i}`] = { top: null, bot: null };
    }
    slots[`${region}-e8-1`] = { top: null, bot: null };
  });

  // Final Four + Championship
  slots['ff-1'] = { top: null, bot: null };
  slots['ff-2'] = { top: null, bot: null };
  slots['champ'] = { top: null, bot: null };

  return slots;
}

// Make a pick and return updated state
export function makePick(
  picks: Record<string, string>,
  slots: Record<string, GameSlots>,
  feedMap: Record<string, FeedTarget>,
  gameId: string,
  chosenTeamKey: string
): { picks: Record<string, string>; slots: Record<string, GameSlots> } {
  const newPicks = { ...picks };
  const newSlots = deepCloneSlots(slots);
  const previousPick = newPicks[gameId];

  // Record the pick
  newPicks[gameId] = chosenTeamKey;

  // Advance winner into next round slot
  const feed = feedMap[gameId];
  if (feed) {
    newSlots[feed.target][feed.slot] = chosenTeamKey;
  }

  // If changing a pick, cascade-clear downstream
  if (previousPick && previousPick !== chosenTeamKey) {
    clearDownstream(newPicks, newSlots, feedMap, gameId, previousPick);
  }

  return { picks: newPicks, slots: newSlots };
}

function clearDownstream(
  picks: Record<string, string>,
  slots: Record<string, GameSlots>,
  feedMap: Record<string, FeedTarget>,
  sourceGameId: string,
  removedTeamKey: string
) {
  const feed = feedMap[sourceGameId];
  if (!feed) return;

  const targetGameId = feed.target;

  // If the removed team was picked to win the target game, clear that pick too
  if (picks[targetGameId] === removedTeamKey) {
    delete picks[targetGameId];
    clearDownstream(picks, slots, feedMap, targetGameId, removedTeamKey);
  }

  // Clear the slot in the target game if it contains the removed team
  if (slots[targetGameId][feed.slot] === removedTeamKey) {
    slots[targetGameId][feed.slot] = null;
  }
}

function deepCloneSlots(slots: Record<string, GameSlots>): Record<string, GameSlots> {
  const clone: Record<string, GameSlots> = {};
  for (const key in slots) {
    clone[key] = { ...slots[key] };
  }
  return clone;
}

// Calculate score for a bracket against results
export function calculateScore(
  picks: Record<string, string>,
  results: Record<string, string>
): number {
  let score = 0;
  const roundPoints: Record<string, number> = {
    r64: 1, r32: 2, s16: 4, e8: 8, ff: 16, champ: 32,
  };

  for (const gameId in picks) {
    if (results[gameId] && picks[gameId] === results[gameId]) {
      const round = getRoundFromGameId(gameId);
      score += roundPoints[round] || 0;
    }
  }

  return score;
}

function getRoundFromGameId(gameId: string): string {
  if (gameId === 'champ') return 'champ';
  if (gameId.startsWith('ff-')) return 'ff';
  const parts = gameId.split('-');
  return parts[1]; // e.g., 'r64', 'r32', 's16', 'e8'
}

// Get all game IDs in proper round order
export function getAllGameIds(): string[] {
  const ids: string[] = [];
  REGIONS.forEach(region => {
    for (let i = 1; i <= 8; i++) ids.push(`${region}-r64-${i}`);
    for (let i = 1; i <= 4; i++) ids.push(`${region}-r32-${i}`);
    for (let i = 1; i <= 2; i++) ids.push(`${region}-s16-${i}`);
    ids.push(`${region}-e8-1`);
  });
  ids.push('ff-1', 'ff-2', 'champ');
  return ids;
}

export const TOTAL_GAMES = 63;
