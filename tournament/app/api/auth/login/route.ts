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

    const { data: user } = await supabase
      .from('users')
      .select('id, display_name, password_hash')
      .eq('display_name', displayName)
      .single();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'Wrong password' }, { status: 401 });
    }

    const token = await createSession({ id: user.id, displayName: user.display_name });
    const response = NextResponse.json({ success: true, user: { id: user.id, displayName: user.display_name } });
    response.cookies.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
