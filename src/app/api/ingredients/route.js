// src/app/api/ingredients/route.js
import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { verifyAdmin } from '@/lib/authGuard';
import { getClientIp, checkRateLimit, getRateLimitHeaders } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

const VALID_CATEGORIES = ['dough', 'sauce', 'cheese', 'meat', 'veg', 'extras'];

export async function GET(request) {
  try {
    const ip = getClientIp(request);
    const limit = 60;
    const limitResult = checkRateLimit(`get_ing_${ip}`, { limit, windowMs: 60 * 1000 });
    if (!limitResult.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: getRateLimitHeaders(limitResult, limit) });
    }

    const { data, error } = await supabaseServer
      .from('settings')
      .select('data')
      .eq('id', 'ingredients')
      .single();

    if (error || !data) return NextResponse.json({});
    return NextResponse.json(data.data || {}, { headers: getRateLimitHeaders(limitResult, limit) });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const ip = getClientIp(request);
    const limit = 20;
    const limitResult = checkRateLimit(`post_ing_${ip}`, { limit, windowMs: 60 * 1000 });
    if (!limitResult.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: getRateLimitHeaders(limitResult, limit) });
    }

    const authResult = await verifyAdmin(request);
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error || 'Unauthorized to change pricing' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Invalid pricing data structure' }, { status: 400 });
    }

    // Whitelist and sanitize pricing data
    const sanitizedPricing = {};
    for (const [cat, items] of Object.entries(body)) {
      if (VALID_CATEGORIES.includes(cat) && typeof items === 'object' && items !== null) {
        sanitizedPricing[cat] = {};
        for (const [itemId, priceData] of Object.entries(items)) {
          const cleanItemId = String(itemId).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 50);
          if (cleanItemId) {
            if (typeof priceData === 'object' && priceData !== null) {
              sanitizedPricing[cat][cleanItemId] = {
                small: Math.max(0, Math.min(10000, Number(priceData.small) || 0)),
                med: Math.max(0, Math.min(10000, Number(priceData.med) || 0)),
                large: Math.max(0, Math.min(10000, Number(priceData.large) || 0)),
              };
            } else {
              sanitizedPricing[cat][cleanItemId] = Math.max(0, Math.min(10000, Number(priceData) || 0));
            }
          }
        }
      }
    }

    const { data, error } = await supabaseServer
      .from('settings')
      .upsert({ id: 'ingredients', data: sanitizedPricing }, { onConflict: 'id' })
      .select();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(
      { success: true, data },
      { headers: getRateLimitHeaders(limitResult, limit) }
    );
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}