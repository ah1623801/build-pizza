// src/app/api/coupon/route.js
import { NextResponse } from 'next/server';
import { validateCoupon } from '@/lib/coupons';
import { getClientIp, checkRateLimit, getRateLimitHeaders } from '@/lib/rateLimit';
import { sanitizeString } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const ip = getClientIp(request);
    const limit = 10; // الحد الأقصى 10 محاولات في الدقيقة لمنع تخمين أكواد الخصم آلياً
    const limitResult = checkRateLimit(`coupon_${ip}`, { limit, windowMs: 60 * 1000 });
    if (!limitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many promo code attempts. Please wait a minute.' },
        { status: 429, headers: getRateLimitHeaders(limitResult, limit) }
      );
    }

    const body = await request.json().catch(() => ({}));
    const rawCode = sanitizeString(body?.code || '', 30);
    const subtotal = Math.max(0, Math.min(1000000, Number(body?.subtotal) || 0));

    const result = validateCoupon(rawCode, subtotal);
    if (!result.valid) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400, headers: getRateLimitHeaders(limitResult, limit) }
      );
    }

    return NextResponse.json(
      { success: true, ...result },
      { headers: getRateLimitHeaders(limitResult, limit) }
    );
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
