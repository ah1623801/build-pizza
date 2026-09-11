// src/app/api/ingredients/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// جلب الأسعار من الداتابيز
export async function GET() {
  const { data, error } = await supabase
    .from('settings')
    .select('data')
    .eq('id', 'ingredients')
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }

  return NextResponse.json(data.data);
}

// حفظ الأسعار في الداتابيز
export async function POST(req) {
  try {
    const updatedPrices = await req.json();

    const { error } = await supabase
      .from('settings')
      .upsert({ id: 'ingredients', data: updatedPrices });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}