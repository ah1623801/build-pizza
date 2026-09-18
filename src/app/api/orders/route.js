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

    const order_number = 'FN-' + Math.floor(100000 + Math.random() * 900000);

    const { data, error } = await supabaseServer
      .from('orders')
      .insert([{
        order_number,
        customer_name,
        customer_phone,
        customer_address,
        items,
        total,
        payment_method,
        payment_status: 'pending',
        order_status: 'pending',
        receipt_url
      }])
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, order: data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const { id, payment_status, order_status } = await request.json();
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