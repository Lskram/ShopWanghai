-- ========================================================
-- 🛒 สคริปต์สร้างฐานข้อมูล Supabase สำหรับร้านค้ากองทุนหมู่บ้านวังไฮ (V2 - มี Collections)
-- นำโค้ดนี้ไปรันใน Supabase -> SQL Editor ได้ทันที
-- ========================================================

-- 1. สร้างตารางคอลเลกชันสินค้า (collections)
CREATE TABLE IF NOT EXISTS collections (
  id VARCHAR PRIMARY KEY,
  name VARCHAR NOT NULL,
  tagline TEXT,
  badge VARCHAR,
  color VARCHAR,
  image TEXT,
  item_count INTEGER DEFAULT 0,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. สร้างตารางหมวดหมู่สินค้า (categories)
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR PRIMARY KEY,
  name VARCHAR NOT NULL,
  icon VARCHAR DEFAULT 'Store',
  color VARCHAR DEFAULT 'bg-emerald-100 text-emerald-800',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. สร้างตารางสินค้า (products)
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR PRIMARY KEY,
  name VARCHAR NOT NULL,
  category VARCHAR REFERENCES categories(id),
  category_name VARCHAR NOT NULL,
  collections TEXT[], -- เก็บ Collection IDs เช่น ['retro-thai-sweets', 'wanghai-signature-otop']
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  unit VARCHAR DEFAULT 'ชิ้น',
  stock INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER DEFAULT 5,
  rating NUMERIC(2,1) DEFAULT 5.0,
  sold_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  is_community_product BOOLEAN DEFAULT FALSE,
  description TEXT,
  image TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. สร้างตารางคำสั่งซื้อ (orders)
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR PRIMARY KEY,
  customer_name VARCHAR NOT NULL,
  customer_phone VARCHAR NOT NULL,
  customer_address TEXT,
  delivery_type VARCHAR DEFAULT 'delivery', -- 'delivery' หรือ 'pickup'
  items JSONB NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL,
  delivery_fee NUMERIC(10,2) DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL,
  payment_method VARCHAR DEFAULT 'promptpay',
  status VARCHAR DEFAULT 'pending_payment',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. เปิดใช้งาน Row Level Security (RLS)
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public collections read" ON collections FOR SELECT USING (true);
CREATE POLICY "Public categories read" ON categories FOR SELECT USING (true);
CREATE POLICY "Public products read" ON products FOR SELECT USING (true);
CREATE POLICY "Public products insert/update" ON products FOR ALL USING (true);
CREATE POLICY "Public orders insert/read" ON orders FOR ALL USING (true);

-- 6. ข้อมูลคอลเลกชันเริ่มต้น
INSERT INTO collections (id, name, tagline, badge, color, image, tags) VALUES
  ('retro-thai-sweets', 'ขนมไทยโบราณ & ขนมย้อนวัย 90s', 'รสชาติวันวาน หาทานยาก คัดสรรขนมไทยพื้นบ้านแท้ๆ', 'คอลเลกชันแนะนำ ⭐', 'from-amber-600 to-orange-700', 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=800', ARRAY['สูตรโบราณ', 'หาทานยาก', 'ยุค90s']),
  ('wanghai-signature-otop', 'ของดีประจำหมู่บ้านวังไฮ (Signature OTOP)', 'ผลผลิตเกษตรอินทรีย์และงานฝีมือกลุ่มแม่บ้านบ้านวังไฮ', 'สินค้าชูโรงประจำชุมชน 🏆', 'from-emerald-700 to-teal-800', 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800', ARRAY['OTOP 5 ดาว', 'ส่งเสริมชุมชน']),
  ('pantry-essentials', 'เซตของชำประหยัดคู่ครัว', 'เครื่องปรุง ข้าวสาร อาหารแห้ง ราคาสวัสดิการเพื่อลดค่าครองชีพ', 'คุ้มค่าเพื่อชุมชน 🛒', 'from-blue-700 to-indigo-800', 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800', ARRAY['ของใช้จำเป็น', 'ราคาประหยัด']),
  ('snack-tea-time', 'เซตของว่าง ชาเขียว & กาแฟยามบ่าย', 'เครื่องดื่มเย็นสดชื่น คู่กับขนมเคี้ยวเพลินคลายหิว', 'เซตยอดฮิต ☕', 'from-rose-600 to-pink-700', 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=800', ARRAY['ยามบ่าย', 'สดชื่น'])
ON CONFLICT (id) DO NOTHING;

-- 7. บันทึกข้อมูลหมวดหมู่เริ่มต้น
INSERT INTO categories (id, name, icon, color) VALUES
  ('retro-snacks', 'ขนมไทยโบราณ & ย้อนวัย', 'Sparkles', 'bg-amber-100 text-amber-900'),
  ('otop', 'สินค้าชุมชนวังไฮ (OTOP)', 'Sparkles', 'bg-emerald-100 text-emerald-800'),
  ('seasoning', 'เครื่องปรุง & วัตถุดิบ', 'Flame', 'bg-orange-100 text-orange-800'),
  ('dryfood', 'อาหารแห้ง & บะหมี่', 'Soup', 'bg-red-100 text-red-800'),
  ('snacks', 'ขนมขบเคี้ยว & เบเกอรี่', 'Cookie', 'bg-yellow-100 text-yellow-800'),
  ('drinks', 'เครื่องดื่ม & นม', 'Coffee', 'bg-blue-100 text-blue-800'),
  ('household', 'ของใช้ในครัวเรือน', 'Home', 'bg-teal-100 text-teal-800')
ON CONFLICT (id) DO NOTHING;
