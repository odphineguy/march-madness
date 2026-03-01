import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabase } from '@/lib/supabase';
import { createSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { displayName, password } = await req.json();

    if (!displayName || !password) {
      return NextResponse.json({ error: 'Name and password required' }, { status: 400 });
    }

    if (password.length < 4) {
      return NextResponse.json({ error: 'Password must be at least 4 characters' }, { status: 400 });
    }

    // Check if name is taken
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('display_name', displayName)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Name already taken' }, { status: 409 });
    }

    // Hash password and create user
    const passwordHash = await bcrypt.hash(password, 10);
    const { data: user, error: insertError } = await supabase
      .from('users')
      .insert({ display_name: displayName, password_hash: passwordHash })
      .select('id, display_name')
      .single();

    if (insertError || !user) {
      return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
    }

    // Create empty bracket for the user
    await supabase
      .from('brackets')
      .insert({ user_id: user.id, picks: {}, locked: false, score: 0 });

    // Create session
    const token = await createSession({ id: user.id, displayName: user.display_name });
    const response = NextResponse.json({ success: true, user: { id: user.id, displayName: user.display_name } });
    response.cookies.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
