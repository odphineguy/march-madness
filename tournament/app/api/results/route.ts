import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Verify API key for agent access
function verifyApiKey(req: NextRequest): boolean {
  const apiKey = req.headers.get('x-api-key');
  const secret = process.env.API_SECRET_KEY;
  if (!secret) return true; // Allow if no key configured (dev mode)
  return apiKey === secret;
}

// GET: Fetch all tournament results
export async function GET(req: NextRequest) {
  const { data, error } = await supabase
    .from('tournament_results')
    .select('game_id, winner_team_key, updated_at')
    .order('updated_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 });
  }

  // Convert to a map for easy consumption
  const resultsMap: Record<string, string> = {};
  data?.forEach((r) => {
    resultsMap[r.game_id] = r.winner_team_key;
  });

  return NextResponse.json({ results: resultsMap, raw: data });
}

// POST: Update a game result (for Open Claw agent)
// Body: { game_id: "south-r64-1", winner_team_key: "south-1" }
export async function POST(req: NextRequest) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { game_id, winner_team_key } = await req.json();

    if (!game_id || !winner_team_key) {
      return NextResponse.json({ error: 'game_id and winner_team_key required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('tournament_results')
      .upsert(
        {
          game_id,
          winner_team_key,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'game_id' }
      );

    if (error) {
      return NextResponse.json({ error: 'Failed to save result' }, { status: 500 });
    }

    return NextResponse.json({ success: true, game_id, winner_team_key });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
