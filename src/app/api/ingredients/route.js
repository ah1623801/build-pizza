// src/app/api/ingredients/route.js
import { NextResponse } from 'next/server';
import { supabaseServer } from '../../../lib/supabaseServer';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from('settings')
      .select('data')
      .eq('id', 'ingredients')
      .single();

    if (error || !data) return NextResponse.json({});
    return NextResponse.json(data.data || {});
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { data, error } = await supabaseServer
      .from('settings')
      .upsert({ id: 'ingredients', data: body }, { onConflict: 'id' })
      .select();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}