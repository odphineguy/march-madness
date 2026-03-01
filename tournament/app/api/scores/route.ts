import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { calculateScore } from '@/lib/bracket-logic';

// Verify API key for agent access
function verifyApiKey(req: NextRequest): boolean {
  const apiKey = req.headers.get('x-api-key');
  const secret = process.env.API_SECRET_KEY;
  if (!secret) return true;
  return apiKey === secret;
}

// GET: Get all scores
export async function GET() {
  const { data, error } = await supabase
    .from('brackets')
    .select('user_id, score, locked, users(display_name)')
    .order('score', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch scores' }, { status: 500 });
  }

  return NextResponse.json({ scores: data });
}

// POST: Recalculate all bracket scores (for Open Claw agent)
export async function POST(req: NextRequest) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Fetch all results
    const { data: resultsData } = await supabase
      .from('tournament_results')
      .select('game_id, winner_team_key');

    const results: Record<string, string> = {};
    resultsData?.forEach((r) => {
      results[r.game_id] = r.winner_team_key;
    });

    // Fetch all brackets
    const { data: brackets } = await supabase
      .from('brackets')
      .select('user_id, picks');

    if (!brackets) {
      return NextResponse.json({ error: 'No brackets found' }, { status: 404 });
    }

    // Calculate and update scores
    const updates = [];
    for (const bracket of brackets) {
      const score = calculateScore(bracket.picks || {}, results);
      updates.push({
        user_id: bracket.user_id,
        score,
      });

      await supabase
        .from('brackets')
        .update({ score })
        .eq('user_id', bracket.user_id);
    }

    return NextResponse.json({
      success: true,
      updated: updates.length,
      scores: updates,
    });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
