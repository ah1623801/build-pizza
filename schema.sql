-- ==============================================================================
-- 🍕 FORNO PIZZA - Complete & Secured Production Database Schema
-- Run this script in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ==============================================================================

-- تفعيل ملحق UUID لو لم يكن مفعلاً
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- 1. جدول الإعدادات (أسعار المكونات لـ 3 مقاسات)
-- ==========================================
CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY DEFAULT 'ingredients',
  data JSONB NOT NULL
);

INSERT INTO settings (id, data) 
VALUES ('ingredients', '{
  "dough": {
    "thin": { "small": 0, "med": 0, "large": 0 },
    "classic": { "small": 0, "med": 0, "large": 0 },
    "thick": { "small": 15, "med": 20, "large": 25 },
    "cheese": { "small": 25, "med": 35, "large": 45 }
  },
  "sauce": {
    "tomato": { "small": 15, "med": 20, "large": 25 },
    "spicy": { "small": 20, "med": 30, "large": 35 },
    "bbq": { "small": 25, "med": 35, "large": 40 },
    "garlic": { "small": 30, "med": 40, "large": 45 }
  },
  "cheese": {
    "mozzarella": { "small": 20, "med": 25, "large": 35 },
    "extra": { "small": 30, "med": 40, "large": 50 },
    "four": { "small": 45, "med": 55, "large": 65 },
    "smoked": { "small": 35, "med": 45, "large": 55 }
  },
  "meat": {
    "pepperoni": { "small": 35, "med": 45, "large": 55 },
    "beef": { "small": 40, "med": 50, "large": 60 },
    "chicken": { "small": 35, "med": 45, "large": 55 },
    "sausage": { "small": 30, "med": 40, "large": 50 }
  },
  "veg": {
    "olives": { "small": 10, "med": 15, "large": 20 },
    "mushroom": { "small": 15, "med": 20, "large": 25 },
    "onion": { "small": 8, "med": 12, "large": 15 },
    "greenPepper": { "small": 10, "med": 15, "large": 20 },
    "jalapeno": { "small": 12, "med": 18, "large": 22 },
    "corn": { "small": 10, "med": 12, "large": 15 },
    "basil": { "small": 8, "med": 10, "large": 12 }
  },
  "extras": {
    "extraCheese": { "small": 25, "med": 30, "large": 40 },
    "chili": { "small": 8, "med": 10, "large": 12 },
    "garlic": { "small": 8, "med": 10, "large": 12 },
    "truffle": { "small": 25, "med": 35, "large": 45 }
  }
}')
ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data;

-- ==========================================
-- 2. جدول التصنيفات (Categories)
-- ==========================================
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

INSERT INTO categories (id, name, sort_order) VALUES
  ('signature', 'SIGNATURE', 1),
  ('classic', 'CLASSIC', 2),
  ('spicy', 'SPICY', 3),
  ('vegetarian', 'VEGETARIAN', 4),
  ('sides', 'SIDES', 5),
  ('drinks', 'DRINKS', 6),
  ('desserts', 'DESSERTS', 7)
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 3. جدول المنتجات (Menu Items)
-- ==========================================
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  image_url TEXT,
  categories TEXT[] NOT NULL DEFAULT '{}',
  ingredients TEXT[] NOT NULL DEFAULT '{}',
  is_simple BOOLEAN DEFAULT false,
  preset JSONB DEFAULT null
);

INSERT INTO menu_items (item_id, name, price, categories, ingredients, is_simple, image_url) VALUES
  ('fire', 'THE FIRE', 285, '{"signature", "spicy"}', '{"Tomato", "Mozzarella", "Pepperoni", "Jalapeño", "Chili Oil"}', false, 'https://image.qwenlm.ai/public_source/dc6c2b4d-a883-49e5-8fdc-ae104a79b739/1b4990fe0-1764-4ee3-983a-5650bfa908e9.png'),
  ('bbq', 'THE BBQ', 275, '{"signature"}', '{"BBQ", "Mozzarella", "Chicken", "Smoked Cheese", "Onion"}', false, 'https://image.qwenlm.ai/public_source/dc6c2b4d-a883-49e5-8fdc-ae104a79b739/186044168-cf4d-4b48-a2ad-a7302f181b81.png'),
  ('green', 'THE GREEN', 240, '{"signature", "vegetarian"}', '{"Mozzarella", "Mushroom", "Olives", "Green Pepper", "Basil"}', false, 'https://image.qwenlm.ai/public_source/dc6c2b4d-a883-49e5-8fdc-ae104a79b739/1d09c168e-1f1c-4f6d-82d2-38857089ef6f.png'),
  ('marg', 'MARGHERITA', 190, '{"classic", "vegetarian"}', '{"Tomato", "Mozzarella", "Basil", "Olive Oil"}', false, 'https://image.qwenlm.ai/public_source/dc6c2b4d-a883-49e5-8fdc-ae104a79b739/159cb951d-fd66-4b13-a24d-4bd5dc71c4e6.png'),
  ('original', 'THE ORIGINAL', 230, '{"classic"}', '{"Tomato", "Mozzarella", "Double Pepperoni"}', false, 'https://image.qwenlm.ai/public_source/dc6c2b4d-a883-49e5-8fdc-ae104a79b739/1dc5fbcdf-abfc-4041-af24-57397c1bd986.png'),
  ('diablo', 'DIABLO', 295, '{"spicy"}', '{"Spicy Tomato", "Beef", "Jalapeño", "Chili Flakes"}', false, 'https://image.qwenlm.ai/public_source/dc6c2b4d-a883-49e5-8fdc-ae104a79b739/1dc5fbcdf-abfc-4041-af24-57397c1bd986.png'),
  ('bread', 'GARLIC BUTTER BREAD', 60, '{"sides"}', '{"Wood-Oven", "Garlic", "Herbs", "Butter"}', true, null),
  ('cola', 'CRAFT COLA', 35, '{"drinks"}', '{"Ice Cold", "House Syrup", "Citrus"}', true, null),
  ('lava', 'CHOCOLATE LAVA', 75, '{"desserts"}', '{"Molten Center", "Sea Salt", "Vanilla"}', true, null)
ON CONFLICT (item_id) DO NOTHING;

-- ==========================================
-- 4. جدول الطلبات (Orders)
-- ==========================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total NUMERIC NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT 'visa',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  order_status TEXT NOT NULL DEFAULT 'pending',
  receipt_url TEXT
);

-- ==========================================
-- 5. جدول الرسائل والتواصل (Messages) - مع حقول الأمان
-- ==========================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  topic TEXT DEFAULT 'GENERAL',
  message TEXT NOT NULL
);

-- ==========================================
-- 6. مستودعات تخزين الملفات (Storage Buckets)
-- ==========================================
-- مستودع صور إيصالات الدفع (خاص ومحمي تماماً)
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- مستودع صور المنيو (عام للقراءة فقط)
INSERT INTO storage.buckets (id, name, public)
VALUES ('menu-images', 'menu-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- ==========================================
-- 7. تفعيل جدار الحماية (RLS) وسياسات الأمان
-- ==========================================
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 1. جداول المنيو والإعدادات (قراءة عامة فقط)
DROP POLICY IF EXISTS "Public can read settings" ON settings;
CREATE POLICY "Public can read settings" ON settings FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Public can read categories" ON categories;
CREATE POLICY "Public can read categories" ON categories FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Public can read menu_items" ON menu_items;
CREATE POLICY "Public can read menu_items" ON menu_items FOR SELECT TO public USING (true);

-- 2. تأمين جدول الرسائل (Messages):
-- السماح لجميع الزوار بإرسال الرسائل (INSERT) حتى تصل للداشبورد فوراً
DROP POLICY IF EXISTS "Allow public to send messages" ON messages;
CREATE POLICY "Allow public to send messages" 
ON messages FOR INSERT 
TO public 
WITH CHECK (true);

-- منع قراءة أو استعراض الرسائل للعامة (فقط الأدمن المسجل ومفتاح السيرفر يقرؤونها)
DROP POLICY IF EXISTS "Deny public select to messages" ON messages;
DROP POLICY IF EXISTS "Allow admin full access to messages" ON messages;
CREATE POLICY "Allow admin full access to messages" 
ON messages FOR ALL 
TO authenticated 
USING (true)
WITH CHECK (true);

-- 3. تأمين جدول الطلبات (Orders):
-- ممنوع منعاً باتاً قراءة أو تعديل الطلبات من الفرونت إند مباشرة إلا عبر السيرفر أو الأدمن
DROP POLICY IF EXISTS "Deny direct public access to orders" ON orders;
DROP POLICY IF EXISTS "Allow admin full access to orders" ON orders;
CREATE POLICY "Allow admin full access to orders" 
ON orders FOR ALL 
TO authenticated 
USING (true)
WITH CHECK (true);

-- 4. تأمين مستودعات الصور (Storage Policies)
DROP POLICY IF EXISTS "Allow Public Receipts Upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow Public Receipts Select" ON storage.objects;

DROP POLICY IF EXISTS "Allow Public Menu Images Select" ON storage.objects;
CREATE POLICY "Allow Public Menu Images Select" 
ON storage.objects FOR SELECT TO public 
USING (bucket_id = 'menu-images');

-- ==========================================
-- 8. تفعيل الاستماع اللحظي (Realtime WebSockets)
-- ==========================================
-- تفعيل وصول الطلبات والرسائل الجديدة في نفس الثانية للداشبورد بدون ريفريش
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE orders;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE messages;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- تجنب التوقف لو كان الـ publication مفعلاً مسبقاً
    NULL;
END $$;

-- ==========================================
-- 9. قيود سلامة البيانات والفهارس (Constraints & Indexes)
-- ==========================================
DO $$
BEGIN
  -- قيود جدول الطلبات
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_positive_total') THEN
    ALTER TABLE orders ADD CONSTRAINT check_positive_total CHECK (total >= 0);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_payment_status') THEN
    ALTER TABLE orders ADD CONSTRAINT check_payment_status CHECK (payment_status IN ('pending', 'paid', 'rejected'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_order_status') THEN
    ALTER TABLE orders ADD CONSTRAINT check_order_status CHECK (order_status IN ('pending', 'preparing', 'ready', 'completed', 'cancelled'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_payment_method') THEN
    ALTER TABLE orders ADD CONSTRAINT check_payment_method CHECK (payment_method IN ('cash', 'visa'));
  END IF;

  -- قيود جدول المنيو
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_positive_price') THEN
    ALTER TABLE menu_items ADD CONSTRAINT check_positive_price CHECK (price >= 0);
  END IF;

  -- قيود جدول الرسائل
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_valid_message_length') THEN
    ALTER TABLE messages ADD CONSTRAINT check_valid_message_length CHECK (length(message) >= 5);
  END IF;
END $$;

-- فهارس السرعة والأداء للداشبورد
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders (payment_status);
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories (sort_order ASC);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_topic ON messages (topic);
