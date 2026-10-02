-- ==============================================================================
-- 🚀 SUPABASE SQL SCHEMA: ระบบคลังความรู้ AI & สกัดคีย์เวิร์ดคำถามลูกค้า
-- ร้านค้าสวัสดิการกองทุนหมู่บ้านวังไฮ (@237ipknp)
-- ==============================================================================

-- 1. ตารางคลังความรู้และกฎการตอบของ AI (Dynamic Knowledge & Q&A Memory)
CREATE TABLE IF NOT EXISTS public.ai_rules (
    id TEXT PRIMARY KEY,
    topic TEXT NOT NULL,                              -- หัวข้อความรู้ เช่น 'การจัดส่ง', 'ประวัติข้าวหอมมะลิ'
    question_pattern TEXT NOT NULL,                   -- คีย์เวิร์ดดักจับคำถาม เช่น 'ส่งฟรีกี่บาท, ค่าส่ง'
    keywords TEXT[] DEFAULT '{}',                     -- อาร์เรย์คีย์เวิร์ดที่ผ่านการ Normalize
    answer TEXT NOT NULL,                             -- คำตอบที่สอนให้น้องพร้อมเสิร์ฟตอบ
    recommended_product_ids JSONB DEFAULT '[]'::jsonb,-- รหัสสินค้าที่ให้แนบ Flex Carousel
    is_active BOOLEAN DEFAULT TRUE,                   -- สถานะเปิด/ปิดใช้งานกฎนี้
    usage_count INT DEFAULT 0,                        -- จำนวนครั้งที่ลูกค้าถามตรงกับกฎนี้
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ตารางบันทึกประวัติการแชทและการสกัดคีย์เวิร์ด (Chat Logs & Few-Shot Classroom)
CREATE TABLE IF NOT EXISTS public.chat_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT,                                     -- LINE User ID
    user_query TEXT NOT NULL,                         -- คำถามเต็มที่ลูกค้าพิมพ์มา
    extracted_keywords TEXT[] DEFAULT '{}',           -- คีย์เวิร์ดสำคัญที่ระบบสกัดได้ (เช่น ['อกหัก', 'ขนม'])
    bot_response TEXT NOT NULL,                       -- ข้อความที่บอทตอบกลับ
    matched_intent TEXT,                              -- เจตนาที่ตรวจพบ (เช่น 'emotional_comfort', 'merit_making')
    matched_rule_id TEXT REFERENCES public.ai_rules(id) ON DELETE SET NULL,
    rating TEXT DEFAULT 'unrated',                    -- 'good' (เป็นตัวอย่างที่ดี), 'bad', 'unrated'
    admin_correction TEXT,                            -- คำตอบที่แอดมินแก้ไขเพื่อใช้สอน AI
    use_for_training BOOLEAN DEFAULT FALSE,           -- ธงบอกว่าให้นำไปใช้เป็น Few-shot training หรือไม่
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ตารางสถิติและจัดอันดับคีย์เวิร์ดยอดนิยม (Keyword Analytics & Trend Aggregation)
CREATE TABLE IF NOT EXISTS public.keyword_analytics (
    id BIGSERIAL PRIMARY KEY,
    keyword TEXT UNIQUE NOT NULL,                     -- คำค้นหา/คีย์เวิร์ด เช่น 'โอเดงยา', 'ส่งฟรี', 'อกหัก'
    category TEXT DEFAULT 'general',                  -- หมวดหมู่: 'product', 'emotion', 'policy', 'general'
    frequency INT DEFAULT 1,                          -- จำนวนครั้งที่ลูกค้าพูดถึงคำนี้
    last_asked_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ⚡ FUNCTIONS & STORED PROCEDURES (ฟังก์ชันคำนวณและอัปเดตสถิติอัตโนมัติ)
-- ==============================================================================

-- ฟังก์ชันเพิ่มจำนวนครั้งการใช้งานของกฎ AI (Rule Usage Increment)
CREATE OR REPLACE FUNCTION public.increment_ai_rule_usage(target_rule_id TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE public.ai_rules
    SET usage_count = usage_count + 1,
        updated_at = NOW()
    WHERE id = target_rule_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ฟังก์ชันคำนวณและอัปเดตความถี่คีย์เวิร์ด (Upsert Keyword Frequency)
CREATE OR REPLACE FUNCTION public.record_keywords(keywords_array TEXT[])
RETURNS VOID AS $$
DECLARE
    kw TEXT;
BEGIN
    IF keywords_array IS NOT NULL THEN
        FOREACH kw IN ARRAY keywords_array
        LOOP
            IF LENGTH(TRIM(kw)) > 1 THEN
                INSERT INTO public.keyword_analytics (keyword, frequency, last_asked_at)
                VALUES (TRIM(kw), 1, NOW())
                ON CONFLICT (keyword)
                DO UPDATE SET 
                    frequency = public.keyword_analytics.frequency + 1,
                    last_asked_at = NOW();
            END IF;
        END LOOP;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 📊 VIEW: จัดอันดับ 20 คีย์เวิร์ดยอดนิยมที่ลูกค้าถามถึงบ่อยที่สุด
-- ==============================================================================
CREATE OR REPLACE VIEW public.v_top_customer_keywords AS
SELECT 
    keyword,
    frequency,
    last_asked_at,
    CASE 
        WHEN frequency >= 20 THEN '🔥 ยอดฮิตมาก'
        WHEN frequency >= 5 THEN '⭐ ถามบ่อย'
        ELSE '💬 ทั่วไป'
    END AS trend_status
FROM public.keyword_analytics
ORDER BY frequency DESC, last_asked_at DESC
LIMIT 20;

-- ==============================================================================
-- 🔒 ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.ai_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.keyword_analytics ENABLE ROW LEVEL SECURITY;

-- อนุญาตให้อ่านและเขียนข้อมูลผ่าน Anon Key & Authenticated Key
CREATE POLICY "Allow public read ai_rules" ON public.ai_rules FOR SELECT USING (true);
CREATE POLICY "Allow public insert ai_rules" ON public.ai_rules FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update ai_rules" ON public.ai_rules FOR UPDATE USING (true);
CREATE POLICY "Allow public delete ai_rules" ON public.ai_rules FOR DELETE USING (true);

CREATE POLICY "Allow public read chat_logs" ON public.chat_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert chat_logs" ON public.chat_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update chat_logs" ON public.chat_logs FOR UPDATE USING (true);
CREATE POLICY "Allow public delete chat_logs" ON public.chat_logs FOR DELETE USING (true);

CREATE POLICY "Allow public read keyword_analytics" ON public.keyword_analytics FOR SELECT USING (true);
CREATE POLICY "Allow public insert keyword_analytics" ON public.keyword_analytics FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update keyword_analytics" ON public.keyword_analytics FOR UPDATE USING (true);

-- ==============================================================================
-- 🌱 SEED INITIAL DATA (ชุดข้อมูลเริ่มต้น)
-- ==============================================================================
INSERT INTO public.ai_rules (id, topic, question_pattern, keywords, answer, recommended_product_ids, is_active)
VALUES
('RULE-001', 'การจัดส่งและโปรส่งฟรี', 'ส่งฟรีกี่บาท, ค่าส่งเท่าไหร่, คิดค่าส่งยังไง, ส่งของยังไง, มีส่งฟรีไหม', ARRAY['ส่งฟรี', 'ค่าส่ง', 'จัดส่ง'], 'ร้านมีบริการจัดส่งด่วนทั่วไทยเริ่มต้นเพียง 35 บาท และพิเศษสุด! ส่งฟรีทันทีเมื่อสั่งซื้อสินค้าครบ 300 บาทขึ้นไปค่ะ 🚚💨', '["TRAD-01", "TRAD-02"]'::jsonb, TRUE),
('RULE-002', 'ของดีประจำหมู่บ้านวังไฮ', 'ของดีวังไฮ, ประวัติวังไฮ, ทำไมต้องวังไฮ, สินค้าเด่น, เรื่องราวชุมชน', ARRAY['วังไฮ', 'otop', 'ของดี', 'ข้าวหอมมะลิ', 'น้ำผึ้งป่า'], 'บ้านวังไฮ ต.วังไฮ อ.เมือง จ.ลำพูน เป็นชุมชนเข้มแข็งที่มีชื่อเสียงด้าน ข้าวหอมมะลิอินทรีย์ น้ำผึ้งป่าเดือนห้าแท้ และผ้าทอมือย้อมครามธรรมชาติ ผลิตด้วยหัวใจจากกลุ่มแม่บ้านและวิสาหกิจชุมชนค่ะ 🌾', '["WH-01", "WH-02", "WH-04"]'::jsonb, TRUE),
('RULE-003', 'ขนม 90s แถมของเล่นสะสม', 'ของแถม, การ์ดพลัง, บ้านกระดาษ, สติกเกอร์, โอเดงยา, จาจา', ARRAY['โอเดงยา', 'การ์ดพลัง', 'ของเล่น', 'จาจา', 'บ้านกระดาษ'], 'ขนมโอเดงยาทุกซองแถมการ์ดพลังในตำนานให้สะสม และขนมจาจ้าแถมชุดต่อบ้านกระดาษ 3 มิติ ย้อนความทรงจำวัยประถมได้ทันทีเลยค่ะ 🎮', '["TRAD-04", "TRAD-07"]'::jsonb, TRUE),
('RULE-004', 'ช่องทางการชำระเงิน', 'จ่ายเงินยังไง, โอนเงิน, เก็บเงินปลายทาง, พร้อมเพย์, บัญชีธนาคาร', ARRAY['จ่ายเงิน', 'โอนเงิน', 'พร้อมเพย์', 'qr code'], 'ร้านค้ารองรับการชำระเงินผ่านการสแกน QR Code / PromptPay โอนเข้าบัญชีกองทุนหมู่บ้านวังไฮ สะดวก ปลอดภัย และมีหลักฐานชัดเจนค่ะ 💳', '[]'::jsonb, TRUE),
('RULE-005', 'เวลาเปิดทำการและที่ตั้งหน้าร้าน', 'ไปซื้อที่ร้าน, หน้าร้านอยู่ไหน, เปิดกี่โมง, แผนที่ร้าน', ARRAY['หน้าร้าน', 'เปิดกี่โมง', 'ที่ตั้ง', 'แผนที่'], 'หน้าร้านตั้งอยู่ที่ทำการกองทุนหมู่บ้านวังไฮ ต.วังไฮ อ.เมือง จ.ลำพูน เปิดบริการทุกวัน 07:00 - 20:00 น. หรือสั่งซื้อผ่านเว็บไซต์ได้ตลอด 24 ชม. ค่ะ 🏡', '[]'::jsonb, TRUE)
ON CONFLICT (id) DO NOTHING;
