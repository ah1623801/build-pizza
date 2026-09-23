// src/app/api/orders/route.js
import { NextResponse } from 'next/server';
import { supabaseServer } from '../../../lib/supabaseServer';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');

    if (orderId) {
      const { data, error } = await supabaseServer
        .from('orders')
        .select('*')
        .eq('order_number', orderId)
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 404 });
      return NextResponse.json(data);
    }

// حماية الخصوصية: لا يمكن سحب جميع الطلبات إلا إذا كان هناك جلسة أدمن صالحة
    const token = request.cookies.get('admin_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized to view all orders' }, { status: 401 });
    }

    const { data, error } = await supabaseServer
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data || []);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const customer_name = formData.get('customer_name');
    const customer_phone = formData.get('customer_phone');
    const customer_address = formData.get('customer_address');
    const payment_method = formData.get('payment_method');
    const total = Number(formData.get('total')) || 0;
    const items = JSON.parse(formData.get('items') || '[]');
    const receiptFile = formData.get('receipt');

    let receipt_url = null;
    if (receiptFile && typeof receiptFile === 'object' && receiptFile.size > 0) {
      const ext = receiptFile.name ? receiptFile.name.split('.').pop() : 'png';
      const path = `receipt_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const buffer = Buffer.from(await receiptFile.arrayBuffer());
      const { error: uploadError } = await supabaseServer.storage
        .from('receipts')
        .upload(path, buffer, { contentType: receiptFile.type || 'image/png' });

      if (!uploadError) {
        const { data: { publicUrl } } = supabaseServer.storage.from('receipts').getPublicUrl(path);
        receipt_url = publicUrl;
      }
    }

// توليد رقم طلب فريد مع تكرار المحاولة في حالة التصادم النادر
    let order_number = '';
    let inserted = false;
    let data = null;
    let insertError = null;

    const safeAddress = customer_address ? customer_address.trim() : 'IN-STORE / PICKUP';

    for (let attempt = 0; attempt < 3; attempt++) {
      order_number = 'FN-' + Math.floor(100000 + Math.random() * 900000);
      const res = await supabaseServer
        .from('orders')
        .insert([{
          order_number,
          customer_name: (customer_name || '').trim(),
          customer_phone: (customer_phone || '').trim(),
          customer_address: safeAddress,
          items,
          total,
          payment_method: payment_method || 'cash',
          payment_status: 'pending',
          order_status: 'pending',
          receipt_url
        }])
        .select()
        .single();

      if (!res.error) {
        data = res.data;
        inserted = true;
        break;
      }
      insertError = res.error;
    }

    if (!inserted) return NextResponse.json({ error: insertError?.message || 'Failed to generate order' }, { status: 500 });
    return NextResponse.json({ success: true, order: data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const token = request.cookies.get('admin_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized to update orders' }, { status: 401 });
    }

    const { id, payment_status, order_status } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const updateData = {};
    if (payment_status) updateData.payment_status = payment_status;
    if (order_status) updateData.order_status = order_status;

    const { data, error } = await supabaseServer
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, order: data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}