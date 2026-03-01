import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/auth';

// GET: Fetch bracket(s)
// ?userId=<id>  → single user's bracket
// (no params)   → all brackets (for leaderboard / agent)
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');

  if (userId) {
    const { data, error } = await supabase
      .from('brackets')
      .select('*, users(display_name)')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return NextResponse.json({ bracket: null });
    }

    return NextResponse.json({ bracket: data });
  }

  // Return all brackets with user names
  const { data, error } = await supabase
    .from('brackets')
    .select('*, users(display_name)')
    .order('score', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch brackets' }, { status: 500 });
  }

  return NextResponse.json({ brackets: data });
}

// POST: Save bracket picks
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { userId, picks, locked } = await req.json();

    // Users can only save their own bracket
    if (userId !== session.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if bracket is already locked
    const { data: existing } = await supabase
      .from('brackets')
      .select('locked')
      .eq('user_id', userId)
      .single();

    if (existing?.locked) {
      return NextResponse.json({ error: 'Bracket is already locked' }, { status: 400 });
    }

    const { error } = await supabase
      .from('brackets')
      .upsert({
        user_id: userId,
        picks,
        locked: locked || false,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (error) {
      return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
