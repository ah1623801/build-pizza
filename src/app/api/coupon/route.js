// src/app/api/coupon/route.js
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  // تم تعليق جزء الكوبونات بالكامل من الموقع (ctrl + ظ)
  /*
  import { validateCouponAsync } from '@/lib/coupons';
  import { getClientIp, checkRateLimit, getRateLimitHeaders } from '@/lib/rateLimit';
  import { sanitizeString } from '@/lib/security';

  try {
    const ip = getClientIp(request);
    const limit = 10;
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

    const result = await validateCouponAsync(rawCode, subtotal);
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
  */
  return NextResponse.json({ success: false, error: 'Coupons are currently disabled' }, { status: 400 });
}
