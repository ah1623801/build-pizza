// src/app/api/categories/route.js
import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

// 1. إضافة تصنيف جديد
export async function POST(request) {
  try {
    const body = await request.json();
    const { id, name, sort_order } = body;

    if (!id || !name) {
      return NextResponse.json({ error: 'ID and Name are required' }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from('categories')
      .insert([
        {
          id: id.toLowerCase().trim().replace(/\s+/g, '-'),
          name: name.toUpperCase().trim(),
          sort_order: parseInt(sort_order) || 10,
        },
      ])
      .select();

    if (error) throw error;

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