// src/app/api/categories/route.js
import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

// 1. إضافة أو تعديل تصنيف
export async function POST(request) {
  try {
    const body = await request.json();
    const { id, name, sort_order, original_id } = body;

    if (!id || !name) {
      return NextResponse.json({ error: 'ID and Name are required' }, { status: 400 });
    }

    const payload = {
      id: id.toLowerCase().trim().replace(/\s+/g, '-'),
      name: name.toUpperCase().trim(),
      sort_order: parseInt(sort_order) || 10,
    };

    let result;
    if (original_id) {
      result = await supabaseServer.from('categories').update(payload).eq('id', original_id).select();
    } else {
      result = await supabaseServer.from('categories').insert([payload]).select();
    }

    if (result.error) throw result.error;

    return NextResponse.json({ success: true, category: data[0] });
  } catch (error) {
    console.error('API Error [POST /api/categories]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 2. حذف تصنيف
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    const { error } = await supabaseServer.from('categories').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error [DELETE /api/categories]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}