// src/app/api/menu/route.js
import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { verifyAdmin } from '@/lib/authGuard';
import { getClientIp, checkRateLimit, getRateLimitHeaders } from '@/lib/rateLimit';
import {
  isValidImageBuffer,
  sanitizeString,
  safeJsonParse,
  isSafeId,
} from '@/lib/security';

export const dynamic = 'force-dynamic';

// 1. جلب المنيو والتصنيفات للموقع الرئيسي وللداشبورد
export async function GET(request) {
  try {
    const ip = getClientIp(request);
    const limit = 60;
    const limitResult = checkRateLimit(`get_menu_${ip}`, { limit, windowMs: 60 * 1000 });
    if (!limitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: getRateLimitHeaders(limitResult, limit) }
      );
    }

    const [{ data: categories, error: catError }, { data: items, error: itemError }] = await Promise.all([
      supabaseServer.from('categories').select('*').order('sort_order', { ascending: true }),
      supabaseServer.from('menu_items').select('*').order('created_at', { ascending: false }),
    ]);

    if (catError) throw catError;
    if (itemError) throw itemError;

    return NextResponse.json(
      { categories: categories || [], items: items || [] },
      { headers: getRateLimitHeaders(limitResult, limit) }
    );
  } catch (error) {
    console.error('API Error [GET /api/menu]:', error);
    return NextResponse.json({ error: 'Failed to fetch menu' }, { status: 500 });
  }
}

// 2. إضافة أو تعديل منتج + رفع الصورة على السيرفر
export async function POST(request) {
  try {
    const ip = getClientIp(request);
    const limit = 30;
    const limitResult = checkRateLimit(`post_menu_${ip}`, { limit, windowMs: 60 * 1000 });
    if (!limitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: getRateLimitHeaders(limitResult, limit) }
      );
    }

    const authResult = await verifyAdmin(request);
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error || 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const id = formData.get('id'); // لو موجود يبقى تعديل، لو مش موجود يبقى إضافة
    const name = sanitizeString(formData.get('name') || '', 100);
    const itemIdRaw = formData.get('item_id');
    const priceRaw = formData.get('price');
    const price = parseFloat(priceRaw);
    const isSimple = formData.get('is_simple') === 'true';

    const categories = safeJsonParse(formData.get('categories'), []);
    const ingredients = safeJsonParse(formData.get('ingredients'), []);

    let imageUrl = sanitizeString(formData.get('image_url') || '', 500);
    
    // حماية أمنية: منع الروابط الخبيثة والتأكد من أنها تبدأ بروتوكول ويب آمن
    if (imageUrl && !/^(https?:\/\/|\/)/i.test(imageUrl)) {
      imageUrl = '';
    }

    if (!name || name.length === 0) {
      return NextResponse.json({ error: 'Item name is required' }, { status: 400 });
    }

    if (!itemIdRaw || typeof itemIdRaw !== 'string' || itemIdRaw.trim().length === 0) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    const cleanItemId = itemIdRaw.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '-').slice(0, 50);
    if (!cleanItemId) {
      return NextResponse.json({ error: 'Invalid Item ID format' }, { status: 400 });
    }

    if (id && !isSafeId(id)) {
      return NextResponse.json({ error: 'Invalid Item record ID' }, { status: 400 });
    }

    if (isNaN(price) || price < 0 || price > 100000) {
      return NextResponse.json({ error: 'Price must be a valid positive number up to 100,000' }, { status: 400 });
    }

    // رفع الصورة إن وُجدت مع فحص الأمان وفحص الـ Magic Bytes
    const imageFile = formData.get('image');
    if (imageFile && typeof imageFile === 'object' && imageFile.size > 0) {
      const MAX_IMG_SIZE = 5 * 1024 * 1024;
      const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];
      const ALLOWED_EXT = ['jpg', 'jpeg', 'png', 'webp'];

      if (imageFile.size > MAX_IMG_SIZE) {
        return NextResponse.json({ error: 'Image exceeds 5MB limit' }, { status: 400 });
      }

      const fileExt = imageFile.name ? imageFile.name.split('.').pop().toLowerCase() : '';
      if (!ALLOWED_EXT.includes(fileExt) || !ALLOWED_MIME.includes(imageFile.type)) {
        return NextResponse.json({ error: 'Invalid image format. Allowed: JPG, PNG, WebP' }, { status: 400 });
      }

      const buffer = Buffer.from(await imageFile.arrayBuffer());

      // Magic Bytes Binary Signature Check
      if (!isValidImageBuffer(buffer, imageFile.type, fileExt)) {
        return NextResponse.json({ error: 'Spoofed or corrupted image file rejected' }, { status: 400 });
      }

      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `items/${fileName}`;

      const { error: uploadError } = await supabaseServer.storage
        .from('menu-images')
        .upload(filePath, buffer, {
          contentType: imageFile.type,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: publicData } = supabaseServer.storage
        .from('menu-images')
        .getPublicUrl(filePath);

      imageUrl = publicData.publicUrl;
    }

    const payload = {
      name: name.toUpperCase(),
      item_id: cleanItemId,
      price,
      is_simple: isSimple,
      categories: Array.isArray(categories)
        ? categories.map(c => sanitizeString(String(c), 50)).slice(0, 20)
        : [],
      ingredients: Array.isArray(ingredients)
        ? ingredients.map(i => sanitizeString(String(i), 50)).slice(0, 50)
        : [],
      image_url: imageUrl,
    };

    let result;
    if (id) {
      result = await supabaseServer.from('menu_items').update(payload).eq('id', id).select();
    } else {
      result = await supabaseServer.from('menu_items').insert([payload]).select();
    }

    if (result.error) throw result.error;

    return NextResponse.json(
      { success: true, item: result.data[0] },
      { headers: getRateLimitHeaders(limitResult, limit) }
    );
  } catch (error) {
    console.error('API Error [POST /api/menu]:', error);
    return NextResponse.json({ error: 'Failed to save menu item' }, { status: 500 });
  }
}

// 3. حذف منتج
export async function DELETE(request) {
  try {
    const ip = getClientIp(request);
    const limit = 30;
    const limitResult = checkRateLimit(`del_menu_${ip}`, { limit, windowMs: 60 * 1000 });
    if (!limitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: getRateLimitHeaders(limitResult, limit) }
      );
    }

    const authResult = await verifyAdmin(request);
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error || 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || !isSafeId(id)) {
      return NextResponse.json({ error: 'Valid Item ID is required' }, { status: 400 });
    }

    const { error } = await supabaseServer.from('menu_items').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json(
      { success: true },
      { headers: getRateLimitHeaders(limitResult, limit) }
    );
  } catch (error) {
    console.error('API Error [DELETE /api/menu]:', error);
    return NextResponse.json({ error: 'Failed to delete menu item' }, { status: 500 });
  }
}