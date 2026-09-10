// src/app/api/menu/route.js
import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

// 1. جلب المنيو والتصنيفات للموقع الرئيسي وللداشبورد
export async function GET() {
  try {
    const [{ data: categories, error: catError }, { data: items, error: itemError }] = await Promise.all([
      supabaseServer.from('categories').select('*').order('sort_order', { ascending: true }),
      supabaseServer.from('menu_items').select('*').order('created_at', { ascending: false })
    ]);

    if (catError) throw catError;
    if (itemError) throw itemError;

    return NextResponse.json({ categories: categories || [], items: items || [] });
  } catch (error) {
    console.error('API Error [GET /api/menu]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 2. إضافة أو تعديل منتج + رفع الصورة على السيرفر
export async function POST(request) {
  try {
    const formData = await request.formData();
    const id = formData.get('id'); // لو موجود يبقى تعديل، لو مش موجود يبقى إضافة
    const name = formData.get('name');
    const itemId = formData.get('item_id');
    const price = parseFloat(formData.get('price'));
    const isSimple = formData.get('is_simple') === 'true';
    const categories = JSON.parse(formData.get('categories') || '[]');
    const ingredients = JSON.parse(formData.get('ingredients') || '[]');
    let imageUrl = formData.get('image_url') || '';

    // رفع الصورة إن وُجدت
    const imageFile = formData.get('image');
    if (imageFile && typeof imageFile === 'object' && imageFile.size > 0) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `items/${fileName}`;

      const buffer = Buffer.from(await imageFile.arrayBuffer());

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
      name: name.toUpperCase().trim(),
      item_id: itemId.toLowerCase().trim(),
      price,
      is_simple: isSimple,
      categories,
      ingredients,
      image_url: imageUrl,
    };

    let result;
    if (id) {
      // تعديل منتج حالي
      result = await supabaseServer.from('menu_items').update(payload).eq('id', id).select();
    } else {
      // إضافة منتج جديد
      result = await supabaseServer.from('menu_items').insert([payload]).select();
    }

    if (result.error) throw result.error;

    return NextResponse.json({ success: true, item: result.data[0] });
  } catch (error) {
    console.error('API Error [POST /api/menu]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 3. حذف منتج
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    const { error } = await supabaseServer.from('menu_items').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error [DELETE /api/menu]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}