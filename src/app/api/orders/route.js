// src/app/api/orders/route.js
import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { verifyAdmin } from '@/lib/authGuard';
import { getClientIp, checkRateLimit, getRateLimitHeaders } from '@/lib/rateLimit';
import { validateCoupon } from '@/lib/coupons';
import {
  isValidImageBuffer,
  sanitizeString,
  safeJsonParse,
  isSafeOrderNumber,
  isSafeId,
} from '@/lib/security';

export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_EXT = ['jpg', 'jpeg', 'png', 'webp'];
const ALLOWED_PAYMENT_STATUSES = ['pending', 'paid', 'rejected'];
const ALLOWED_ORDER_STATUSES = ['pending', 'preparing', 'ready', 'completed', 'cancelled'];

// Whitelists for pizza configuration
const VALID_DOUGHS = ['thin', 'classic', 'thick', 'cheese'];
const VALID_SAUCES = ['tomato', 'spicy', 'bbq', 'garlic'];
const VALID_CHEESES = ['mozzarella', 'extra', 'four', 'smoked'];
const VALID_MEATS = ['pepperoni', 'beef', 'chicken', 'sausage'];
const VALID_VEGS = ['olives', 'mushroom', 'onion', 'greenPepper', 'jalapeno', 'basil'];
const VALID_EXTRAS = ['extraCheese', 'chili', 'garlic', 'truffle', 'bbqDrizzle'];
const VALID_SIZES = ['small', 'med', 'large'];

// Default ingredient pricing fallback
const DEFAULT_ING_PRICES = {
  dough: { thin: 0, classic: 0, thick: 20, cheese: 35 },
  sauce: { tomato: 20, spicy: 30, bbq: 35, garlic: 40 },
  cheese: { mozzarella: 25, extra: 40, four: 55, smoked: 45 },
  meat: { pepperoni: 45, beef: 50, chicken: 45, sausage: 40 },
  veg: { olives: 15, mushroom: 20, onion: 12, greenPepper: 15, jalapeno: 18, basil: 10 },
  extras: { extraCheese: 30, chili: 10, garlic: 10, truffle: 35, bbqDrizzle: 15 },
};

async function calculateOrderTotal(items) {
  if (!Array.isArray(items) || items.length === 0) return 0;

  try {
    const [{ data: menuItems }, { data: ingSettings }] = await Promise.all([
      supabaseServer.from('menu_items').select('name, price'),
      supabaseServer.from('settings').select('data').eq('id', 'ingredients').single(),
    ]);

    const menuMap = new Map();
    if (Array.isArray(menuItems)) {
      for (const m of menuItems) {
        if (m.name) menuMap.set(m.name.toUpperCase().trim(), Math.max(0, Number(m.price) || 0));
      }
    }

    const ingPrices = ingSettings?.data || {};

    const getPrice = (cat, id, size = 'med') => {
      const sz = VALID_SIZES.includes(size) ? size : 'med';
      const remote = ingPrices[cat]?.[id];
      if (remote !== undefined) {
        if (typeof remote === 'object' && remote !== null) {
          return Math.max(0, Number(remote[sz] ?? remote.med ?? 0) || 0);
        }
        return Math.max(0, Number(remote) || 0);
      }
      return Math.max(0, DEFAULT_ING_PRICES[cat]?.[id] || 0);
    };

    let total = 0;

    for (const item of items) {
      if (!item || typeof item !== 'object') return 0;
      const qty = Math.min(50, Math.max(1, parseInt(item.qty, 10) || 1));
      let unit = 0;
      const normalizedName = sanitizeString(item.name || '', 100).toUpperCase().trim();

      if (menuMap.has(normalizedName)) {
        unit = menuMap.get(normalizedName);
      } else if (item.kind === 'pizza' && item.snap && typeof item.snap === 'object') {
        const snap = item.snap;
        const sz = VALID_SIZES.includes(snap.size) ? snap.size : 'med';

        if (snap.dough && VALID_DOUGHS.includes(snap.dough)) {
          unit += getPrice('dough', snap.dough, sz);
        }
        if (snap.sauce && VALID_SAUCES.includes(snap.sauce)) {
          unit += getPrice('sauce', snap.sauce, sz);
        }
        if (snap.cheese && VALID_CHEESES.includes(snap.cheese)) {
          unit += getPrice('cheese', snap.cheese, sz);
        }

        if (snap.meats && typeof snap.meats === 'object') {
          for (const [mId, mQty] of Object.entries(snap.meats)) {
            if (VALID_MEATS.includes(mId)) {
              const base = getPrice('meat', mId, sz);
              const mult = { less: 0.7, normal: 1, more: 1.4 }[mQty] || 1;
              unit += Math.round((base * mult) / 5) * 5;
            }
          }
        }

        if (Array.isArray(snap.vegs)) {
          for (const vId of snap.vegs) {
            if (VALID_VEGS.includes(vId)) {
              unit += getPrice('veg', vId, sz);
            }
          }
        }

        if (Array.isArray(snap.extras)) {
          for (const eId of snap.extras) {
            if (VALID_EXTRAS.includes(eId)) {
              unit += getPrice('extras', eId, sz);
            }
          }
        }
      } else {
        const fallbackDefaultPrices = {
          'GARLIC BUTTER BREAD': 60,
          'CRAFT COLA': 35,
          'CHOCOLATE LAVA': 75,
          'THE FIRE': 285,
          'THE TRUFFLE': 320,
          'THE BBQ': 275,
          'THE GREEN': 240,
          'MARGHERITA': 190,
          'THE ORIGINAL': 230,
          'DIABLO': 295,
        };
        if (fallbackDefaultPrices[normalizedName]) {
          unit = fallbackDefaultPrices[normalizedName];
        } else {
          return 0; // Reject order with unrecognized items to prevent price tampering
        }
      }

      total += unit * qty;
    }

    return total;
  } catch (err) {
    console.error('Error calculating order total:', err);
    return 0;
  }
}

export async function GET(request) {
  try {
    const ip = getClientIp(request);
    const limit = 30; // 30 req/min
    const limitResult = checkRateLimit(`get_orders_${ip}`, { limit, windowMs: 60 * 1000 });
    if (!limitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment.' },
        { status: 429, headers: getRateLimitHeaders(limitResult, limit) }
      );
    }

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');

    if (orderId) {
      if (!isSafeOrderNumber(orderId)) {
        return NextResponse.json({ error: 'Invalid order number format' }, { status: 400 });
      }

      const authResult = await verifyAdmin(request);
      
      // If admin, return full order details
      if (authResult.authorized) {
        const { data, error } = await supabaseServer
          .from('orders')
          .select('*')
          .eq('order_number', orderId.trim())
          .single();
        if (error) return NextResponse.json({ error: error.message }, { status: 404 });
        return NextResponse.json(data);
      }

      // If customer tracking, return ONLY safe tracking fields to prevent IDOR / PII leak
      const { data, error } = await supabaseServer
        .from('orders')
        .select('order_number, order_status, payment_status, items, created_at')
        .eq('order_number', orderId.trim())
        .single();

      if (error) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      return NextResponse.json(data);
    }

    // Require admin session to list all orders
    const authResult = await verifyAdmin(request);
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error || 'Unauthorized to view all orders' }, { status: 401 });
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
    const ip = getClientIp(request);
    const limit = 10;
    const limitResult = checkRateLimit(`order_${ip}`, { limit, windowMs: 5 * 60 * 1000 });
    if (!limitResult.allowed) {
      return NextResponse.json(
        { error: 'تم إرسال عدد كبير من الطلبات، يرجى الانتظار بضع دقائق والمحاولة ثانية.' },
        { status: 429, headers: getRateLimitHeaders(limitResult, limit) }
      );
    }

    const formData = await request.formData();
    const customer_name = sanitizeString(formData.get('customer_name') || '', 100);
    const customer_phone = sanitizeString(formData.get('customer_phone') || '', 30);
    const customer_address = sanitizeString(formData.get('customer_address') || '', 500);
    const rawPayment = formData.get('payment_method') || 'cash';
    const payment_method = rawPayment === 'visa' ? 'visa' : 'cash';

    const items = safeJsonParse(formData.get('items'), []);
    if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
      return NextResponse.json({ error: 'Order must contain between 1 and 50 valid items' }, { status: 400 });
    }

    const receiptFile = formData.get('receipt');

    if (!customer_name || customer_name.length < 2) {
      return NextResponse.json({ error: 'Customer name is required (2-100 characters)' }, { status: 400 });
    }

    const cleanPhoneDigits = customer_phone.replace(/[^\d+]/g, '');
    if (!customer_phone || cleanPhoneDigits.length < 7 || cleanPhoneDigits.length > 20) {
      return NextResponse.json({ error: 'A valid customer phone number is required (7-20 digits)' }, { status: 400 });
    }

    // Recalculate true total on the server to prevent price tampering
    const baseTotal = await calculateOrderTotal(items);
    if (baseTotal <= 0) {
      return NextResponse.json({ error: 'Invalid order calculation' }, { status: 400 });
    }

    const coupon_code = sanitizeString(formData.get('coupon_code') || '', 20).toUpperCase();
    let discount_amount = 0;
    let finalTotal = baseTotal;

    if (coupon_code) {
      const couponCheck = validateCoupon(coupon_code, baseTotal);
      if (couponCheck.valid) {
        discount_amount = couponCheck.discount;
        finalTotal = couponCheck.finalTotal;
      }
    }

    let receipt_url = null;
    if (receiptFile && typeof receiptFile === 'object' && receiptFile.size > 0) {
      if (receiptFile.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: 'Receipt file exceeds 5MB limit' }, { status: 400 });
      }

      const rawExt = receiptFile.name ? receiptFile.name.split('.').pop().toLowerCase() : '';
      if (!ALLOWED_EXT.includes(rawExt) || !ALLOWED_MIME.includes(receiptFile.type)) {
        return NextResponse.json({ error: 'Invalid file type. Only JPG, PNG, and WebP images are allowed.' }, { status: 400 });
      }

      const buffer = Buffer.from(await receiptFile.arrayBuffer());

      // Magic Bytes Binary Signature Verification
      if (!isValidImageBuffer(buffer, receiptFile.type, rawExt)) {
        return NextResponse.json({ error: 'Corrupted or spoofed image file rejected.' }, { status: 400 });
      }

      const path = `receipt_${Date.now()}_${Math.random().toString(36).slice(2)}.${rawExt}`;
      const { error: uploadError } = await supabaseServer.storage
        .from('receipts')
        .upload(path, buffer, { contentType: receiptFile.type });

if (!uploadError) {
        const { data: signedData } = await supabaseServer.storage
          .from('receipts')
          .createSignedUrl(path, 60 * 60 * 24 * 60); // رابط موقع مشفر لمدة 60 يوم
        receipt_url = signedData?.signedUrl || null;
      }
    }

    let order_number = '';
    let inserted = false;
    let data = null;
    let insertError = null;

    const safeAddress = customer_address || 'IN-STORE / PICKUP';

    for (let attempt = 0; attempt < 5; attempt++) {
      const randBase = Math.floor(100000 + Math.random() * 900000);
      order_number = attempt === 0 ? `FN-${randBase}` : `FN-${randBase}${Date.now().toString().slice(-2)}`;
      const res = await supabaseServer
        .from('orders')
        .insert([{
          order_number,
          customer_name,
          customer_phone,
          customer_address: safeAddress,
          items,
          total: finalTotal,
          payment_method,
          payment_status: 'pending',
          order_status: 'pending',
          receipt_url,
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

    const sitePhone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '201001234567';
    const waMsg = `🍕 *طلب جديد من FORNO* 🍕\n` +
      `رقم الطلب: #${order_number}\n` +
      `الاسم: ${customer_name}\n` +
      `الهاتف: ${customer_phone}\n` +
      `العنوان: ${safeAddress}\n` +
      `الإجمالي: ${finalTotal} ج.م${discount_amount > 0 ? ` (بعد خصم ${discount_amount} ج.م بكود ${coupon_code})` : ''}\n` +
      `طريقة الدفع: ${payment_method === 'visa' ? 'فيزا / إنستاباي' : 'كاش'}\n` +
      `أرجو تأكيد تحضير طلبي فوراً وشكراً!`;
    const whatsapp_url = `https://wa.me/${sitePhone.replace(/[^\d]/g, '')}?text=${encodeURIComponent(waMsg)}`;

    return NextResponse.json(
      { success: true, order: data, whatsapp_url, discount_amount },
      { headers: getRateLimitHeaders(limitResult, limit) }
    );
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const ip = getClientIp(request);
    const limit = 60;
    const limitResult = checkRateLimit(`patch_order_${ip}`, { limit, windowMs: 60 * 1000 });
    if (!limitResult.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const authResult = await verifyAdmin(request);
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error || 'Unauthorized to update orders' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { id, payment_status, order_status } = body;
    if (!id || !isSafeId(id)) {
      return NextResponse.json({ error: 'Valid Order ID is required' }, { status: 400 });
    }

    const updateData = {};
    if (payment_status) {
      if (!ALLOWED_PAYMENT_STATUSES.includes(payment_status)) {
        return NextResponse.json({ error: `Invalid payment status. Allowed: ${ALLOWED_PAYMENT_STATUSES.join(', ')}` }, { status: 400 });
      }
      updateData.payment_status = payment_status;
    }

    if (order_status) {
      if (!ALLOWED_ORDER_STATUSES.includes(order_status)) {
        return NextResponse.json({ error: `Invalid order status. Allowed: ${ALLOWED_ORDER_STATUSES.join(', ')}` }, { status: 400 });
      }
      updateData.order_status = order_status;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid status fields provided for update' }, { status: 400 });
    }

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