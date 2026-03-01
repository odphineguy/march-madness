// 64 NCAA teams organized by region and seed
// Using 2025 bracket as placeholder until Selection Sunday 2026

export type Region = 'south' | 'west' | 'east' | 'midwest';

export const REGIONS: Region[] = ['south', 'west', 'east', 'midwest'];
export const REGION_LABELS: Record<Region, string> = {
  south: 'SOUTH',
  west: 'WEST',
  east: 'EAST',
  midwest: 'MIDWEST',
};

export const ROUNDS = ['r64', 'r32', 's16', 'e8'] as const;
export type Round = typeof ROUNDS[number];

export const ROUND_LABELS: Record<string, string> = {
  r64: 'ROUND OF 64',
  r32: 'ROUND OF 32',
  s16: 'SWEET 16',
  e8: 'ELITE 8',
  ff: 'FINAL FOUR',
  champ: 'CHAMPIONSHIP',
};

// Standard NCAA seed matchups in order
export const SEED_MATCHUPS: [number, number][] = [
  [1, 16], [8, 9], [5, 12], [4, 13],
  [6, 11], [3, 14], [7, 10], [2, 15],
];

// Teams by region, indexed by seed (1-16)
export const TEAMS: Record<Region, Record<number, string>> = {
  south: {
    1: "Auburn",       2: "Michigan St",
    3: "Iowa State",   4: "Texas A&M",
    5: "Michigan",     6: "Mississippi St",
    7: "Marquette",    8: "Louisville",
    9: "Creighton",   10: "New Mexico",
    11: "San Diego St",12: "UC San Diego",
    13: "Yale",       14: "Lipscomb",
    15: "Bryant",     16: "Alabama St",
  },
  west: {
    1: "Florida",      2: "St. John's",
    3: "Texas Tech",   4: "Maryland",
    5: "Memphis",      6: "Missouri",
    7: "Kansas",       8: "UConn",
    9: "Oklahoma",    10: "Arkansas",
    11: "Drake",      12: "Colorado St",
    13: "Grand Canyon",14: "UNC Wilmington",
    15: "Omaha",      16: "Norfolk St",
  },
  east: {
    1: "Duke",         2: "Alabama",
    3: "Wisconsin",    4: "Arizona",
    5: "Oregon",       6: "BYU",
    7: "St. Mary's",   8: "Mississippi",
    9: "Baylor",      10: "Vanderbilt",
    11: "VCU",        12: "Liberty",
    13: "Akron",      14: "Montana",
    15: "Robert Morris",16: "Mount St. Mary's",
  },
  midwest: {
    1: "Houston",      2: "Tennessee",
    3: "Kentucky",     4: "Purdue",
    5: "Clemson",      6: "Illinois",
    7: "UCLA",         8: "Gonzaga",
    9: "Georgia",     10: "Utah State",
    11: "Texas",      12: "McNeese",
    13: "High Point", 14: "Troy",
    15: "Wofford",    16: "SIU Edwardsville",
  },
};

// Build a team key from region and seed
export function teamKey(region: Region, seed: number): string {
  return `${region}-${seed}`;
}

// Get team name from a team key
export function teamName(key: string): string {
  const [region, seedStr] = key.split('-');
  const seed = parseInt(seedStr);
  return TEAMS[region as Region]?.[seed] ?? 'TBD';
}

// Get team seed from a team key
export function teamSeed(key: string): number {
  return parseInt(key.split('-')[1]);
}

// Scoring: points per round
export const SCORING: Record<string, number> = {
  r64: 1,
  r32: 2,
  s16: 4,
  e8: 8,
  ff: 16,
  champ: 32,
};
