// src/app/api/auth/route.js
import { NextResponse } from 'next/server';
import { getAuthClient, isUserAdmin } from '@/lib/authGuard';
import { getClientIp, checkRateLimit, getRateLimitHeaders } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getCookieSecurityOptions(maxAge = 60 * 60 * 24 * 7) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge,
  };
}

// 1. فحص الجلسة وصلاحية المدير
export async function GET(request) {
  try {
    const token = request.cookies.get('admin_token')?.value;
    if (!token) return NextResponse.json({ authenticated: false });

    const authClient = getAuthClient();
    const { data: { user }, error } = await authClient.auth.getUser(token);
    if (error || !user || !isUserAdmin(user)) {
      // تنظيف الكوكي غير الصالحة فوراً
      const res = NextResponse.json({ authenticated: false });
      res.cookies.set('admin_token', '', getCookieSecurityOptions(0));
      return res;
    }

    return NextResponse.json({ authenticated: true, email: user.email });
  } catch {
    const res = NextResponse.json({ authenticated: false });
    res.cookies.set('admin_token', '', getCookieSecurityOptions(0));
    return res;
  }
}

// 2. تسجيل دخول المدير فقط
export async function POST(request) {
  try {
    const ip = getClientIp(request);
    const limit = 5;
    const limitResult = checkRateLimit(`auth_${ip}`, { limit, windowMs: 60 * 1000 });
    if (!limitResult.allowed) {
      return NextResponse.json(
        { error: 'محاولات دخول كثيرة جداً، يرجى الانتظار لمدة دقيقة والمحاولة مجدداً.' },
        { status: 429, headers: getRateLimitHeaders(limitResult, limit) }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { email, password } = body;

    if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'يرجى إدخال البريد الإلكتروني وكلمة المرور بشكل صحيح.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!EMAIL_REGEX.test(cleanEmail) || cleanPassword.length < 6 || cleanPassword.length > 100) {
      return NextResponse.json(
        { error: 'صيغة البريد الإلكتروني أو كلمة المرور غير صالحة.' },
        { status: 400 }
      );
    }

    const authClient = getAuthClient();

    const { data, error } = await authClient.auth.signInWithPassword({
      email: cleanEmail,
      password: cleanPassword,
    });

    if (error || !data.session || !data.user) {
      return NextResponse.json(
        { error: 'بيانات الدخول غير صحيحة' },
        { status: 401 }
      );
    }

    // التحقق الصارم من أن المستخدم يملك صلاحية الأدمن
    if (!isUserAdmin(data.user)) {
      return NextResponse.json(
        { error: 'غير مصرح: هذا الحساب لا يملك صلاحيات الوصول للوحة الإدارة' },
        { status: 403 }
      );
    }

const response = NextResponse.json(
      { success: true, email: data.user.email },
      { headers: getRateLimitHeaders(limitResult, limit) }
    );

    // حفظ التوكن بالإضافة لتوكن التجديد (Refresh Token) لضمان عدم طرد الكاشير كل ساعة
    response.cookies.set('admin_token', data.session.access_token, getCookieSecurityOptions(data.session.expires_in || 3600));
    if (data.session.refresh_token) {
      response.cookies.set('admin_refresh', data.session.refresh_token, getCookieSecurityOptions(60 * 60 * 24 * 30)); // 30 يوم
    }

    return response;
  } catch {
    return NextResponse.json({ error: 'حدث خطأ غير متوقع أثناء معالجة الطلب' }, { status: 500 });
  }
}

// 3. تسجيل الخروج وتنظيف جميع التوكنز
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set('admin_token', '', getCookieSecurityOptions(0));
  response.cookies.set('admin_refresh', '', getCookieSecurityOptions(0));
  return response;
}