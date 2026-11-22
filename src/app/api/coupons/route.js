// src/app/api/coupons/route.js
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// تم تعليق جزء الكوبونات بالكامل من الموقع (ctrl + ظ)
/*
import { verifyAdmin } from '@/lib/authGuard';
import { getClientIp, checkRateLimit, getRateLimitHeaders } from '@/lib/rateLimit';
import { sanitizeString } from '@/lib/security';
import {
  getCouponsMap,
  saveCouponsMap,
  DEFAULT_COUPONS,
  invalidateCouponsCache,
} from '@/lib/coupons';

export async function GET(request) {
  try {
    const ip = getClientIp(request);
    const limit = 60;
    const limitResult = checkRateLimit(`get_coupons_admin_${ip}`, { limit, windowMs: 60 * 1000 });
    if (!limitResult.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: getRateLimitHeaders(limitResult, limit) });
    }

    const authResult = await verifyAdmin(request);
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error || 'Unauthorized' }, { status: 401 });
    }

    const couponsMap = await getCouponsMap(true);
    const couponsList = Object.values(couponsMap || {});

    return NextResponse.json(
      { success: true, coupons: couponsList },
      { headers: getRateLimitHeaders(limitResult, limit) }
    );
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const ip = getClientIp(request);
    const limit = 30;
    const limitResult = checkRateLimit(`post_coupons_admin_${ip}`, { limit, windowMs: 60 * 1000 });
    if (!limitResult.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: getRateLimitHeaders(limitResult, limit) });
    }

    const authResult = await verifyAdmin(request);
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error || 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const action = body?.action || 'save';
    const currentMap = { ...(await getCouponsMap(true)) };

    // 1. Toggle Coupon Active Status
    if (action === 'toggle') {
      const code = sanitizeString(body?.code || '', 30).toUpperCase();
      if (!code || !currentMap[code]) {
        return NextResponse.json({ error: 'Coupon code not found' }, { status: 404 });
      }

      currentMap[code] = {
        ...currentMap[code],
        active: !currentMap[code].active,
      };

      await saveCouponsMap(currentMap);
      return NextResponse.json({
        success: true,
        coupons: Object.values(currentMap),
        message: `Coupon ${code} is now ${currentMap[code].active ? 'Active' : 'Disabled'}`,
      });
    }

    // 2. Delete Coupon
    if (action === 'delete') {
      const code = sanitizeString(body?.code || '', 30).toUpperCase();
      if (!code || !currentMap[code]) {
        return NextResponse.json({ error: 'Coupon code not found' }, { status: 404 });
      }

      delete currentMap[code];
      await saveCouponsMap(currentMap);
      return NextResponse.json({
        success: true,
        coupons: Object.values(currentMap),
        message: `Coupon ${code} deleted successfully`,
      });
    }

    // 3. Reset to Defaults
    if (action === 'reset') {
      await saveCouponsMap(DEFAULT_COUPONS);
      return NextResponse.json({
        success: true,
        coupons: Object.values(DEFAULT_COUPONS),
        message: 'Coupons reset to default successfully',
      });
    }

    // 4. Save / Create / Edit Coupon
    const rawCode = sanitizeString(body?.code || '', 30).toUpperCase().replace(/[^A-Z0-9_-]/g, '');
    if (!rawCode || rawCode.length < 2) {
      return NextResponse.json({ error: 'Coupon code must be at least 2 characters (letters, numbers, underscores)' }, { status: 400 });
    }

    const originalCode = body?.originalCode ? sanitizeString(body.originalCode, 30).toUpperCase() : null;
    const type = body?.type === 'fixed' ? 'fixed' : 'percent';
    const rawVal = Number(body?.value);

    let value = 0;
    if (type === 'percent') {
      if (isNaN(rawVal) || rawVal < 1 || rawVal > 100) {
        return NextResponse.json({ error: 'Percentage discount must be between 1% and 100%' }, { status: 400 });
      }
      value = Math.round(rawVal);
    } else {
      if (isNaN(rawVal) || rawVal <= 0) {
        return NextResponse.json({ error: 'Fixed discount amount must be greater than 0 EGP' }, { status: 400 });
      }
      value = Math.min(10000, Math.round(rawVal));
    }

    const minSubtotal = Math.max(0, Math.min(50000, Number(body?.minSubtotal) || 0));
    const maxDiscount = type === 'percent' ? Math.max(0, Math.min(50000, Number(body?.maxDiscount) || 0)) : 0;
    const active = body?.active !== false;

    const descEn = sanitizeString(body?.description?.en || (type === 'percent' ? `${value}% discount applied!` : `${value} EGP discount applied!`), 140);
    const descAr = sanitizeString(body?.description?.ar || (type === 'percent' ? `تم تطبيق خصم ${value}% على طلبك!` : `تم تطبيق خصم ${value} ج.م على طلبك!`), 140);

    // If renamed code, remove old key
    if (originalCode && originalCode !== rawCode && currentMap[originalCode]) {
      delete currentMap[originalCode];
    }

    currentMap[rawCode] = {
      code: rawCode,
      type,
      value,
      minSubtotal,
      maxDiscount,
      active,
      description: {
        en: descEn,
        ar: descAr,
      },
    };

    await saveCouponsMap(currentMap);

    return NextResponse.json(
      {
        success: true,
        coupons: Object.values(currentMap),
        savedCoupon: currentMap[rawCode],
      },
      { headers: getRateLimitHeaders(limitResult, limit) }
    );
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
*/

export async function GET() {
  return NextResponse.json({ success: false, error: 'Coupons module is disabled' }, { status: 400 });
}

export async function POST() {
  return NextResponse.json({ success: false, error: 'Coupons module is disabled' }, { status: 400 });
}
