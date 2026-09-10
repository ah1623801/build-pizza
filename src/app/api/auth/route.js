// src/app/api/auth/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// عميل مخصص لتوثيق المستخدمين داخل السيرفر فقط
const authClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  {
    auth: { persistSession: false },
  }
);

// 1. فحص الجلسة
export async function GET(request) {
  try {
    const token = request.cookies.get('admin_token')?.value;
    if (!token) return NextResponse.json({ authenticated: false });

    // التأكد من صحة التوكن من سوبابيز
    const { data: { user }, error } = await authClient.auth.getUser(token);
    if (error || !user) return NextResponse.json({ authenticated: false });

    return NextResponse.json({ authenticated: true, email: user.email });
  } catch (err) {
    return NextResponse.json({ authenticated: false });
  }
}

// 2. تسجيل الدخول والتحقق من قاعدة بيانات سوبابيز
export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // نطلب من سوبابيز فحص الحساب اللي متسجل عنده في جدول الـ Users
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

    // حفظ توكن الجلسة المشفر في httpOnly Cookie مستحيل الـ Frontend يوصله
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

// 3. تسجيل الخروج ومسح الجلسة
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('admin_token');
  return response;
}