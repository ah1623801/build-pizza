import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function POST(request) {
  try {
    const { name, email, phone, topic, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // حفظ في جدول messages (لو موجود) أو تسجيل في الكونسول الآمن
    const { error } = await supabaseServer
      .from('messages')
      .insert([{ name, email, phone, topic, message }]);

    if (error) {
      console.warn('DB Messages warning (Fallback to log):', error.message);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}