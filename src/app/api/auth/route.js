// src/app/api/auth/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// إجبار Next.js على تشغيل المسار كـ Dynamic فقط وعدم تشغيله وقت الـ Build
export const dynamic = 'force-dynamic';

function getAuthClient() {
  const url = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
  const key = process.env.SUPABASE_ANON_KEY || 'placeholder-key';
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

// 1. فحص الجلسة
export async function GET(request) {
  try {
    const token = request.cookies.get('admin_token')?.value;
    if (!token) return NextResponse.json({ authenticated: false });

    const authClient = getAuthClient();
    const { data: { user }, error } = await authClient.auth.getUser(token);
    if (error || !user) return NextResponse.json({ authenticated: false });

    return NextResponse.json({ authenticated: true, email: user.email });
  } catch (err) {
    return NextResponse.json({ authenticated: false });
  }
}

// 2. تسجيل الدخول
export async function POST(request) {
  try {
    const { email, password } = await request.json();
    const authClient = getAuthClient();

    const { data, error } = await authClient.auth.signInWithPassword({
      email: (email || '').trim(),
      password: (password || '').trim(),
    });

    if (error || !data.session) {
      return NextResponse.json(
        { error: error?.message || 'بيانات الدخول غير صحيحة' },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ success: true, email: data.user.email });

    response.cookies.set('admin_token', data.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 3. تسجيل الخروج
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('admin_token');
  return response;
}