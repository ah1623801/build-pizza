// src/app/api/menu/route.js
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { supabaseServer } from '@/lib/supabaseServer';
import { verifyAdmin } from '@/lib/authGuard';
import { getClientIp, checkRateLimit, getRateLimitHeaders } from '@/lib/rateLimit';
import {
  isValidImageBuffer,
  sanitizeString,
  safeJsonParse,
  isSafeId,
} from '@/lib/security';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function ensureStaticProductImages() {
  try {
    const publicImagesDir = path.join(process.cwd(), 'public', 'images');
    if (!fs.existsSync(publicImagesDir)) {
      fs.mkdirSync(publicImagesDir, { recursive: true });
    }

    const artifactDir = 'C:\\Users\\Administrator\\.gemini\\antigravity\\brain\\27ffe414-161b-4c03-8f2f-2f2aee9d1819';
    const mappings = [
      { src: path.join(artifactDir, 'garlic_bread_1791121818000.jpg'), dest: path.join(publicImagesDir, 'bread.jpg') },
      { src: path.join(artifactDir, 'craft_cola_1791118523696.jpg'), dest: path.join(publicImagesDir, 'cola.jpg') },
      { src: path.join(artifactDir, 'lava_cake_1791118542456.jpg'), dest: path.join(publicImagesDir, 'lava.jpg') }
    ];

    for (const m of mappings) {
      if (!fs.existsSync(m.dest) && fs.existsSync(m.src)) {
        fs.copyFileSync(m.src, m.dest);
      }
    }
  } catch (err) {
    console.warn('Failed to ensure product images:', err);
  }
}

// تشغيل النسخ فوراً عند تحميل الـ Route
ensureStaticProductImages();

const CUSTOM_MENU_FILE = path.join(process.cwd(), 'src', 'data', 'menu_custom.json');
const DELETED_MENU_FILE = path.join(process.cwd(), 'src', 'data', 'menu_deleted.json');

export function getCustomMenuItems() {
  try {
    if (fs.existsSync(CUSTOM_MENU_FILE)) {
      const content = fs.readFileSync(CUSTOM_MENU_FILE, 'utf8');
      const parsed = JSON.parse(content);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (err) {
    console.warn('Failed reading custom menu file:', err);
  }
  return [];
}

export function saveCustomMenuItems(list) {
  try {
    const dir = path.dirname(CUSTOM_MENU_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CUSTOM_MENU_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (err) {
    console.warn('Failed saving custom menu file:', err);
  }
}

export function getDeletedMenuItemIds() {
  try {
    if (fs.existsSync(DELETED_MENU_FILE)) {
      const content = fs.readFileSync(DELETED_MENU_FILE, 'utf8');
      const parsed = JSON.parse(content);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (err) {
    console.warn('Failed reading deleted menu file:', err);
  }
  return [];
}

export function addDeletedMenuItemId(id) {
  try {
    const list = getDeletedMenuItemIds();
    const strId = String(id);
    if (!list.includes(strId)) {
      list.push(strId);
      const dir = path.dirname(DELETED_MENU_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DELETED_MENU_FILE, JSON.stringify(list, null, 2), 'utf8');
    }
  } catch (err) {
    console.warn('Failed recording deleted item ID:', err);
  }
}

export function normalizeItemImage(it) {
  if (!it) return '/ico.webp';
  let img = it.image_url;
  if (typeof img === 'string') {
    img = img.trim();
    if (img === '/images/truffle.webp') return '/images/pTruffle.webp';
    if (img === '/images/bbq.webp') return '/images/pBBQ.webp';
    if (img === '/images/green.webp') return '/images/pGreen.webp';
    if (img === '/images/margherita.webp') return '/images/pMarg.webp';
    if (img === '/images/original.webp') return '/images/pOriginal.webp';
    if (img.startsWith('images/')) return '/' + img;
    const isBadUrl = img.includes('qwenlm.ai') || img === '/ico.webp' || img === 'null' || img === 'undefined' || img === '';
    if (!isBadUrl) {
      return img;
    }
  }

  const id = String(it.item_id || it.id || '').toLowerCase().trim();
  const name = String(it.name || '').toLowerCase().trim();

  if (id === 'fire' || name.includes('fire') || name.includes('فاير')) return '/images/fire.webp';
  if (id === 'truffle' || name.includes('truffle') || name.includes('ترافل')) return '/images/pTruffle.webp';
  if (id === 'bbq' || name.includes('bbq') || name.includes('باربيكيو') || name.includes('باربكيو')) return '/images/pBBQ.webp';
  if (id === 'green' || name.includes('green') || name.includes('سوبريم') || name.includes('خضار')) return '/images/pGreen.webp';
  if (id === 'marg' || name.includes('marg') || name.includes('مارجريتا')) return '/images/pMarg.webp';
  if (id === 'original' || name.includes('original') || name.includes('كلاسيك')) return '/images/pOriginal.webp';
  if (id === 'diablo' || name.includes('diablo') || name.includes('ديابلو')) return '/images/pOriginal.webp';
  if (id === 'bread' || name.includes('bread') || name.includes('خبز') || name.includes('garlic')) return '/images/bread.jpg';
  if (id === 'cola' || name.includes('cola') || name.includes('كولا')) return '/images/cola.jpg';
  if (id === 'lava' || name.includes('lava') || name.includes('لافا') || name.includes('مولتن')) return '/images/lava.jpg';

  return it.is_simple ? '/ico.webp' : '/images/pOriginal.webp';
}

const DEFAULT_CATEGORIES = [
  { id: 'signature', name: 'SIGNATURE || المميزة', sort_order: 1 },
  { id: 'classic', name: 'CLASSIC || كلاسيك', sort_order: 2 },
  { id: 'spicy', name: 'SPICY || سبايسي', sort_order: 3 },
  { id: 'vegetarian', name: 'VEGGIE || خضار وجبن', sort_order: 4 },
  { id: 'sides', name: 'SIDES || مقبلات', sort_order: 5 },
  { id: 'drinks', name: 'DRINKS || مشروبات', sort_order: 6 },
  { id: 'desserts', name: 'DESSERTS || حلويات', sort_order: 7 },
];

const DEFAULT_MENU_ITEMS = [
  {
    id: '1',
    item_id: 'fire',
    name: 'PEPPERONI FIRE || بيبروني فاير',
    price: 285,
    is_simple: false,
    categories: ['signature', 'spicy'],
    ingredients: ['Tomato', 'Mozzarella', 'Pepperoni', 'Jalapeño', 'Chili Oil'],
    image_url: '/images/fire.webp',
  },
  {
    id: '2',
    item_id: 'truffle',
    name: 'TRUFFLE MUSHROOM || ترافل مشروم',
    price: 320,
    is_simple: false,
    categories: ['signature', 'vegetarian'],
    ingredients: ['Truffle Cream', 'Mozzarella', 'Mushroom', 'Parmesan'],
    image_url: '/images/pTruffle.webp',
  },
  {
    id: '3',
    item_id: 'bbq',
    name: 'BBQ CHICKEN || تشيكن باربيكيو',
    price: 275,
    is_simple: false,
    categories: ['signature'],
    ingredients: ['BBQ', 'Mozzarella', 'Chicken', 'Smoked Cheese', 'Onion'],
    image_url: '/images/pBBQ.webp',
  },
  {
    id: '4',
    item_id: 'green',
    name: 'VEGGIE SUPREME || سوبريم خضار',
    price: 240,
    is_simple: false,
    categories: ['signature', 'vegetarian'],
    ingredients: ['Mozzarella', 'Mushroom', 'Olives', 'Green Pepper', 'Basil'],
    image_url: '/images/pGreen.webp',
  },
  {
    id: '5',
    item_id: 'marg',
    name: 'MARGHERITA || مارجريتا',
    price: 190,
    is_simple: false,
    categories: ['classic', 'vegetarian'],
    ingredients: ['Tomato', 'Mozzarella', 'Basil', 'Olive Oil'],
    image_url: '/images/pMarg.webp',
  },
  {
    id: '6',
    item_id: 'original',
    name: 'CLASSIC PEPPERONI || بيبروني كلاسيك',
    price: 230,
    is_simple: false,
    categories: ['classic'],
    ingredients: ['Tomato', 'Mozzarella', 'Double Pepperoni'],
    image_url: '/images/pOriginal.webp',
  },
  {
    id: '7',
    item_id: 'diablo',
    name: 'DIABLO SPICY || ديابلو حارة',
    price: 295,
    is_simple: false,
    categories: ['spicy'],
    ingredients: ['Spicy Tomato', 'Beef', 'Jalapeño', 'Chili Flakes'],
    image_url: '/images/pOriginal.webp',
  },
  {
    id: '8',
    item_id: 'bread',
    name: 'GARLIC BREAD || خبز بالثوم',
    price: 60,
    is_simple: true,
    categories: ['sides'],
    ingredients: ['Wood-Oven', 'Garlic', 'Herbs', 'Butter'],
    image_url: '/images/bread.jpg',
  },
  {
    id: '9',
    item_id: 'cola',
    name: 'CRAFT COLA || كولا مثلجة',
    price: 35,
    is_simple: true,
    categories: ['drinks'],
    ingredients: ['Ice Cold', 'House Syrup', 'Citrus'],
    image_url: '/images/cola.jpg',
  },
  {
    id: '10',
    item_id: 'lava',
    name: 'CHOCOLATE LAVA || مولتن لافا',
    price: 75,
    is_simple: true,
    categories: ['desserts'],
    ingredients: ['Molten Center', 'Sea Salt', 'Vanilla'],
    image_url: '/images/lava.jpg',
  },
];

// 1. جلب المنيو والتصنيفات للموقع الرئيسي وللداشبورد
export async function GET(request) {
  try {
    const ip = getClientIp(request);
    const limit = 60;
    const limitResult = checkRateLimit(`get_menu_${ip}`, { limit, windowMs: 60 * 1000 });
    if (!limitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: getRateLimitHeaders(limitResult, limit) }
      );
    }

    const [{ data: categories, error: catError }, { data: items, error: itemError }] = await Promise.all([
      supabaseServer.from('categories').select('*').order('sort_order', { ascending: true }),
      supabaseServer.from('menu_items').select('*').order('created_at', { ascending: false }),
    ]);

    if (catError) {
      console.warn('API Warning [GET /api/menu categories]:', catError);
    }
    if (itemError) {
      console.warn('API Warning [GET /api/menu items]:', itemError);
    }

    let sizePricesMap = {};
    try {
      const { data: sizePricesSettings } = await supabaseServer
        .from('settings')
        .select('data')
        .eq('id', 'pizza_size_prices')
        .maybeSingle();

      if (sizePricesSettings && sizePricesSettings.data) {
        sizePricesMap = sizePricesSettings.data;
      }
    } catch (err) {
      console.warn('Settings table query bypassed:', err);
    }

    // إذا كانت الجداول فارغة في السوبابيس لأي سبب، نستخدم التصنيفات والمنتجات الافتراضية
    let safeCategories = Array.isArray(categories) && categories.length > 0 ? categories : DEFAULT_CATEGORIES;
    let baseItems = Array.isArray(items) && items.length > 0 ? items : DEFAULT_MENU_ITEMS;

    // دمج المنتجات المخصصة والملغية المحفوظة محلياً لضمان عدم ضياع التعديلات أو الصور المرفوعة
    const customItems = getCustomMenuItems();
    const deletedIds = getDeletedMenuItemIds();

    const itemMap = new Map();
    baseItems.forEach((it) => {
      const key = String(it.item_id || it.id || '');
      if (key && !deletedIds.includes(String(it.id)) && !deletedIds.includes(String(it.item_id))) {
        itemMap.set(key, { ...it });
      }
    });

    customItems.forEach((it) => {
      const key = String(it.item_id || it.id || '');
      if (key && !deletedIds.includes(String(it.id)) && !deletedIds.includes(String(it.item_id))) {
        const existing = itemMap.get(key) || {};
        itemMap.set(key, { ...existing, ...it });
      }
    });

    const safeItems = Array.from(itemMap.values());

    // محاولة الحفظ الخلفي التلقائي إذا كانت الجداول فارغة في قاعدة البيانات
    if ((!categories || categories.length === 0) && supabaseServer) {
      try {
        await supabaseServer.from('categories').upsert(DEFAULT_CATEGORIES, { onConflict: 'id' });
      } catch (_) {}
    }
    if ((!items || items.length === 0) && supabaseServer) {
      try {
        await supabaseServer.from('menu_items').upsert(DEFAULT_MENU_ITEMS, { onConflict: 'id' });
      } catch (_) {}
    }

    const cleanCategories = safeCategories.map(c => ({
      ...c,
      name: c.name || ''
    }));

    ensureStaticProductImages();

    // إصلاح روابط qwenlm.ai التالفة أو المنتهية في السوبابيس تلقائياً
    safeItems.forEach((it) => {
      if (typeof it.image_url === 'string' && it.image_url.includes('qwenlm.ai')) {
        const cleanImg = normalizeItemImage(it);
        it.image_url = cleanImg;
        if (it.id && supabaseServer) {
          supabaseServer.from('menu_items').update({ image_url: cleanImg }).eq('id', it.id).then(() => {}).catch(() => {});
        }
      }
    });

    const itemsWithSizePrices = safeItems.map((it) => {
      const p = Number(it.price) || 0;
      const customSizes = sizePricesMap[it.item_id] || sizePricesMap[it.id] || it.size_prices;
      return {
        ...it,
        name: it.name || '',
        image_url: normalizeItemImage(it),
        ingredients: Array.isArray(it.ingredients) ? it.ingredients : [],
        size_prices: customSizes || {
          small: Math.round(p * 0.85),
          med: p,
          large: Math.round(p * 1.25),
        },
      };
    });

    return NextResponse.json(
      { categories: cleanCategories, items: itemsWithSizePrices },
      { headers: getRateLimitHeaders(limitResult, limit) }
    );
  } catch (error) {
    console.error('API Error [GET /api/menu]:', error);
    // إرجاع البيانات الافتراضية كحماية قصوى لمنع تصفير الداشبورد تحت أي ظرف
    return NextResponse.json({
      categories: DEFAULT_CATEGORIES,
      items: DEFAULT_MENU_ITEMS.map((it) => ({
        ...it,
        image_url: normalizeItemImage(it),
      })),
    });
  }
}

// 2. إضافة أو تعديل منتج + رفع الصورة على السيرفر
export async function POST(request) {
  try {
    const ip = getClientIp(request);
    const limit = 30;
    const limitResult = checkRateLimit(`post_menu_${ip}`, { limit, windowMs: 60 * 1000 });
    if (!limitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: getRateLimitHeaders(limitResult, limit) }
      );
    }

    const authResult = await verifyAdmin(request);
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error || 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const id = formData.get('id'); // لو موجود يبقى تعديل، لو مش موجود يبقى إضافة
    const name = sanitizeString(formData.get('name') || '', 100);
    const itemIdRaw = formData.get('item_id');
    const priceRaw = formData.get('price');
    const price = parseFloat(priceRaw);
    const isSimple = formData.get('is_simple') === 'true';

    const categories = safeJsonParse(formData.get('categories'), []);
    const ingredients = safeJsonParse(formData.get('ingredients'), []);

    let imageUrl = sanitizeString(formData.get('image_url') || '', 500);
    
    // حماية أمنية: منع الروابط الخبيثة والتأكد من أنها تبدأ بروتوكول ويب آمن
    if (imageUrl && !/^(https?:\/\/|\/)/i.test(imageUrl)) {
      imageUrl = '';
    }

    if (!name || name.length === 0) {
      return NextResponse.json({ error: 'Item name is required' }, { status: 400 });
    }

    if (!itemIdRaw || typeof itemIdRaw !== 'string' || itemIdRaw.trim().length === 0) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    const cleanItemId = itemIdRaw.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '-').slice(0, 50);
    if (!cleanItemId) {
      return NextResponse.json({ error: 'Invalid Item ID format' }, { status: 400 });
    }

    if (id && !isSafeId(id)) {
      return NextResponse.json({ error: 'Invalid Item record ID' }, { status: 400 });
    }

    if (isNaN(price) || price < 0 || price > 100000) {
      return NextResponse.json({ error: 'Price must be a valid positive number up to 100,000' }, { status: 400 });
    }

    // رفع الصورة إن وُجدت مع فحص الأمان وفحص الـ Magic Bytes
    const imageFile = formData.get('image');
    if (imageFile && typeof imageFile === 'object' && imageFile.size > 0) {
      const MAX_IMG_SIZE = 5 * 1024 * 1024;
      const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];
      const ALLOWED_EXT = ['jpg', 'jpeg', 'png', 'webp'];

      if (imageFile.size > MAX_IMG_SIZE) {
        return NextResponse.json({ error: 'Image exceeds 5MB limit' }, { status: 400 });
      }

      const fileExt = imageFile.name ? imageFile.name.split('.').pop().toLowerCase() : 'webp';
      if (!ALLOWED_EXT.includes(fileExt) || !ALLOWED_MIME.includes(imageFile.type)) {
        return NextResponse.json({ error: 'Invalid image format. Allowed: JPG, PNG, WebP' }, { status: 400 });
      }

      const buffer = Buffer.from(await imageFile.arrayBuffer());

      // Magic Bytes Binary Signature Check
      if (!isValidImageBuffer(buffer, imageFile.type, fileExt)) {
        return NextResponse.json({ error: 'Spoofed or corrupted image file rejected' }, { status: 400 });
      }

      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      // 1. حفظ الصورة مباشرة على السيرفر في public/uploads/items لضمان الظهور الفوري وعدم الاعتماد على أي وسيط
      try {
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'items');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        fs.writeFileSync(path.join(uploadsDir, fileName), buffer);
        imageUrl = `/uploads/items/${fileName}`;
      } catch (localWriteErr) {
        console.warn('Local uploads write failed:', localWriteErr);
      }

      // 2. محاولة الرفع الاحتياطي إلى Supabase Storage إن أمكن بدون أن يعطل العملية إذا فشل
      try {
        const filePath = `items/${fileName}`;
        const { error: uploadError } = await supabaseServer.storage
          .from('menu-images')
          .upload(filePath, buffer, {
            contentType: imageFile.type,
            upsert: true,
          });

        if (!uploadError) {
          const { data: publicData } = supabaseServer.storage
            .from('menu-images')
            .getPublicUrl(filePath);
          if (publicData?.publicUrl && !imageUrl) {
            imageUrl = publicData.publicUrl;
          }
        }
      } catch (storageErr) {
        console.warn('Supabase storage upload bypassed:', storageErr);
      }
    }

    // استخراج أسعار الـ 3 أحجام
    const sizePricesRaw = formData.get('size_prices');
    const priceSmallRaw = formData.get('price_small');
    const priceLargeRaw = formData.get('price_large');
    let sizePricesObj = safeJsonParse(sizePricesRaw, null);
    if (!sizePricesObj && (priceSmallRaw || priceLargeRaw)) {
      sizePricesObj = {
        small: Number(priceSmallRaw) || Math.round(price * 0.85),
        med: price,
        large: Number(priceLargeRaw) || Math.round(price * 1.25),
      };
    }

    const payload = {
      name: name.toUpperCase(),
      item_id: cleanItemId,
      price,
      is_simple: isSimple,
      categories: Array.isArray(categories)
        ? categories.map(c => sanitizeString(String(c), 50)).slice(0, 20)
        : [],
      ingredients: Array.isArray(ingredients)
        ? ingredients.map(i => sanitizeString(String(i), 50)).slice(0, 50)
        : [],
      image_url: imageUrl,
    };

    const recordId = id || cleanItemId || String(Date.now());
    const savedItem = {
      id: recordId,
      ...payload,
      size_prices: sizePricesObj || {
        small: Math.round(price * 0.85),
        med: price,
        large: Math.round(price * 1.25),
      },
      updated_at: new Date().toISOString(),
    };

    // 1. حفظ المنتج محلياً في JSON فوراً لضمان عدم ضياع التعديل أو الصورة أبداً
    try {
      const customList = getCustomMenuItems();
      const existingIdx = customList.findIndex(
        x => String(x.id) === String(recordId) || String(x.item_id) === String(cleanItemId)
      );
      if (existingIdx >= 0) {
        customList[existingIdx] = { ...customList[existingIdx], ...savedItem };
      } else {
        customList.push(savedItem);
      }
      saveCustomMenuItems(customList);
    } catch (fsErr) {
      console.warn('Failed saving to local custom menu store:', fsErr);
    }

    // 2. محاولة الحفظ في Supabase مع تجاوز أي أخطاء بالجدول أو المعرفات
    try {
      if (id) {
        const updateRes = await supabaseServer.from('menu_items').update(payload).eq('id', id).select();
        if (updateRes?.data?.[0]) {
          savedItem.id = updateRes.data[0].id;
        }
      } else {
        const insertRes = await supabaseServer.from('menu_items').insert([payload]).select();
        if (insertRes?.data?.[0]?.id) {
          savedItem.id = insertRes.data[0].id;
        }
      }
    } catch (dbErr) {
      console.warn('Supabase DB menu_items update/insert bypassed:', dbErr);
    }

    // حفظ وتحديث أسعار الـ 3 أحجام في جدول الإعدادات
    if (sizePricesObj && !isSimple) {
      try {
        const { data: existingSettings } = await supabaseServer
          .from('settings')
          .select('data')
          .eq('id', 'pizza_size_prices')
          .maybeSingle();

        const updatedMap = {
          ...(existingSettings?.data || {}),
          [cleanItemId]: {
            small: Math.max(0, Number(sizePricesObj.small) || 0),
            med: Math.max(0, Number(sizePricesObj.med) || price),
            large: Math.max(0, Number(sizePricesObj.large) || 0),
          },
        };

        await supabaseServer
          .from('settings')
          .upsert({ id: 'pizza_size_prices', data: updatedMap }, { onConflict: 'id' });
      } catch (err) {
        console.warn('Could not persist size prices to settings:', err);
      }
    }

    return NextResponse.json(
      { success: true, item: savedItem },
      { headers: getRateLimitHeaders(limitResult, limit) }
    );
  } catch (error) {
    console.error('API Error [POST /api/menu]:', error);
    return NextResponse.json({ error: 'Failed to save menu item' }, { status: 500 });
  }
}

// 3. حذف منتج
export async function DELETE(request) {
  try {
    const ip = getClientIp(request);
    const limit = 30;
    const limitResult = checkRateLimit(`del_menu_${ip}`, { limit, windowMs: 60 * 1000 });
    if (!limitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: getRateLimitHeaders(limitResult, limit) }
      );
    }

    const authResult = await verifyAdmin(request);
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error || 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || !isSafeId(id)) {
      return NextResponse.json({ error: 'Valid Item ID is required' }, { status: 400 });
    }

    // 1. تسجيل الحذف محلياً وإزالته من المنيو المخصص
    try {
      addDeletedMenuItemId(id);
      const customList = getCustomMenuItems().filter(
        x => String(x.id) !== String(id) && String(x.item_id) !== String(id)
      );
      saveCustomMenuItems(customList);
    } catch (fsErr) {
      console.warn('Failed recording deletion locally:', fsErr);
    }

    // 2. محاولة الحذف من Supabase
    try {
      await supabaseServer.from('menu_items').delete().eq('id', id);
    } catch (dbErr) {
      console.warn('Supabase DB delete bypassed:', dbErr);
    }

    return NextResponse.json(
      { success: true },
      { headers: getRateLimitHeaders(limitResult, limit) }
    );
  } catch (error) {
    console.error('API Error [DELETE /api/menu]:', error);
    return NextResponse.json({ error: 'Failed to delete menu item' }, { status: 500 });
  }
}