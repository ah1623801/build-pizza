// src/app/api/contact/route.js
import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { verifyAdmin } from '@/lib/authGuard';
import { getClientIp, checkRateLimit, getRateLimitHeaders } from '@/lib/rateLimit';
import { sanitizeString, isSafeId } from '@/lib/security';

export const dynamic = 'force-dynamic';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 1. استرجاع رسائل العملاء للوحة تحكم الإدارة
export async function GET(request) {
  try {
    const authResult = await verifyAdmin(request);
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error || 'Unauthorized' }, { status: 401 });
    }

    const { data: messages, error } = await supabaseServer
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(messages || []);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const ip = getClientIp(request);
    const limit = 5;
    const limitResult = checkRateLimit(`contact_${ip}`, { limit, windowMs: 5 * 60 * 1000 });
    if (!limitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many messages sent. Please wait a few minutes before trying again.' },
        { status: 429, headers: getRateLimitHeaders(limitResult, limit) }
      );
    }

    const body = await request.json().catch(() => ({}));
    
    // 1. فخ صيد البوتات (Honeypot): لو أي بوت ملىء حقل خفي يتم إسقاط الرسالة فوراً
    if (body.website || body.company || body.hp) {
      return NextResponse.json({ success: true }); // رد زائف لخداع البوت
    }

    const { name, email, phone, topic, message } = body;

    if (!name || typeof name !== 'string' || !email || typeof email !== 'string' || !message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid required fields (Name, Email, Message)' }, { status: 400 });
    }

    const ALLOWED_TOPICS = ['GENERAL', 'ORDER', 'CATERING', 'FEEDBACK', 'PARTNERSHIP'];
    const cleanName = sanitizeString(name, 100);
    const cleanEmail = sanitizeString(email, 150).toLowerCase();
    const cleanPhone = (phone || '').replace(/[^\d+]/g, '').slice(0, 20); // الاحتفاظ بالأرقام وعلامة + فقط
    const cleanTopic = ALLOWED_TOPICS.includes(String(topic).toUpperCase()) ? String(topic).toUpperCase() : 'GENERAL';
    const cleanMessage = sanitizeString(message, 2000);

    if (cleanName.length < 2) {
      return NextResponse.json({ error: 'Name must be at least 2 characters long' }, { status: 400 });
    }

    if (!EMAIL_REGEX.test(cleanEmail)) {
      return NextResponse.json({ error: 'Invalid email address format' }, { status: 400 });
    }

    if (cleanMessage.length < 5) {
      return NextResponse.json({ error: 'Message must be at least 5 characters long' }, { status: 400 });
    }

    const { error } = await supabaseServer
      .from('messages')
      .insert([{
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        topic: cleanTopic,
        message: cleanMessage,
      }]);

    if (error) {
      console.warn('DB Messages warning:', error.message);
    }

    return NextResponse.json(
      { success: true },
      { headers: getRateLimitHeaders(limitResult, limit) }
    );
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// 3. حذف رسالة بعد المتابعة بواسطة الأدمن
export async function DELETE(request) {
  try {
    const authResult = await verifyAdmin(request);
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error || 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id || !isSafeId(id)) {
      return NextResponse.json({ error: 'Valid Message ID is required' }, { status: 400 });
    }

    const { error } = await supabaseServer.from('messages').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}