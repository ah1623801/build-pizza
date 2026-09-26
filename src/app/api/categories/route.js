// src/app/api/categories/route.js
import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { verifyAdmin } from '@/lib/authGuard';
import { getClientIp, checkRateLimit, getRateLimitHeaders } from '@/lib/rateLimit';
import { sanitizeString, isSafeId } from '@/lib/security';

export const dynamic = 'force-dynamic';

// 1. إضافة أو تعديل تصنيف
export async function POST(request) {
  try {
    const ip = getClientIp(request);
    const limit = 30;
    const limitResult = checkRateLimit(`post_cat_${ip}`, { limit, windowMs: 60 * 1000 });
    if (!limitResult.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: getRateLimitHeaders(limitResult, limit) });
    }

    const authResult = await verifyAdmin(request);
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error || 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { id, name, sort_order, original_id } = body;

    if (!id || typeof id !== 'string' || !name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Valid Category ID and Name are required' }, { status: 400 });
    }

    const cleanId = id.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '-').slice(0, 50);
    const cleanName = sanitizeString(name, 100).toUpperCase();
    const cleanSortOrder = Math.max(0, Math.min(9999, parseInt(sort_order, 10) || 10));

    if (!cleanId || !cleanName) {
      return NextResponse.json({ error: 'Category ID and Name cannot be empty' }, { status: 400 });
    }

    if (original_id && !isSafeId(original_id)) {
      return NextResponse.json({ error: 'Invalid original category ID' }, { status: 400 });
    }

    const payload = {
      id: cleanId,
      name: cleanName,
      sort_order: cleanSortOrder,
    };

    let result;
    if (original_id) {
      result = await supabaseServer.from('categories').update(payload).eq('id', original_id).select();
    } else {
      result = await supabaseServer.from('categories').insert([payload]).select();
    }

    if (result.error) throw result.error;

    return NextResponse.json(
      { success: true, category: result.data[0] },
      { headers: getRateLimitHeaders(limitResult, limit) }
    );
  } catch (error) {
    console.error('API Error [POST /api/categories]:', error);
    return NextResponse.json({ error: 'Failed to save category' }, { status: 500 });
  }
}

// 2. حذف تصنيف
export async function DELETE(request) {
  try {
    const ip = getClientIp(request);
    const limit = 30;
    const limitResult = checkRateLimit(`del_cat_${ip}`, { limit, windowMs: 60 * 1000 });
    if (!limitResult.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: getRateLimitHeaders(limitResult, limit) });
    }

    const authResult = await verifyAdmin(request);
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error || 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || !isSafeId(id)) {
      return NextResponse.json({ error: 'Valid Category ID is required' }, { status: 400 });
    }

    // فحص هندسي وقائي: منع حذف أي تصنيف ما زال تحته منتجات نشطة في المنيو
    const { count } = await supabaseServer
      .from('menu_items')
      .select('id', { count: 'exact', head: true })
      .contains('categories', [id]);

    if (count && count > 0) {
      return NextResponse.json(
        { error: `لا يمكن حذف هذا التصنيف لوجود (${count}) منتج مرتبط به حالياً. قم بنقلها أو حذفها أولاً.` },
        { status: 400 }
      );
    }

    const { error } = await supabaseServer.from('categories').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json(
      { success: true },
      { headers: getRateLimitHeaders(limitResult, limit) }
    );
  } catch (error) {
    console.error('API Error [DELETE /api/categories]:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}