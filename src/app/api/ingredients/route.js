// src/app/api/ingredients/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// منع Next.js من تشغيل الـ API وقت الـ Build
export const dynamic = 'force-dynamic';

function getSupabase() {
  // توحيد أسماء المتغيرات لتعمل في جميع الحالات (مثل ملف auth)
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    throw new Error('Supabase environment variables are missing');
  }
  
  return createClient(url, key, {
    auth: { persistSession: false }, // مهم جداً لمنع تعليق السيرفر
  });
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
      // إرجاع كائن فارغ في حال عدم وجود البيانات بدلاً من خطأ
      return NextResponse.json({});
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
    console.error('Ingredients API Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}