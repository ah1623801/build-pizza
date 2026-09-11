// src/app/api/ingredients/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// منع Next.js من تشغيل الـ API وقت الـ Build
export const dynamic = 'force-dynamic';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    throw new Error('Supabase environment variables are missing');
  }
  
  return createClient(url, key);
}

// 1. جلب الأسعار من جدول settings
export async function GET() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('settings')
      .select('data')
      .eq('id', 'ingredients')
      .single();

    if (error || !data) {
      return NextResponse.json({ error: error?.message || 'No data found' }, { status: 400 });
    }

    return NextResponse.json(data.data);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// 2. حفظ وتحديث الأسعار في جدول settings
export async function POST(req) {
  try {
    const supabase = getSupabase();
    const updatedPrices = await req.json();

    const { error } = await supabase
      .from('settings')
      .upsert({ id: 'ingredients', data: updatedPrices });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}