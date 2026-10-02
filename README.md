# 🏪 ร้านค้าสวัสดิการ กองทุนหมู่บ้านวังไฮ (Wang Hai Village Fund Store)

เว็บแอปพลิเคชันร้านขายของชำ ขนมโบราณ 90s และสินค้าชุมชน OTOP สำหรับ **กองทุนหมู่บ้านวังไฮ จ.ลำพูน** พัฒนาด้วย **Next.js (App Router), React 18, Tailwind CSS, Supabase** พร้อมระบบ **Modern Generative AI Agent with Real-Time RAG (Gemini LLM)** เชื่อมต่อกับ **LINE Official Account (@237ipknp)**

---

## 🌟 ฟีเจอร์เด่นในระบบ

### 1. 🛒 หน้าร้านสำหรับลูกค้า (Storefront)
- **หมวดหมู่สินค้าครบครัน (พร้อมรูปภาพจริง):**
  - 🍭 **ขนมไทยโบราณ & ขนมวัยเด็กยุค 90s** (โอเดงยาแถมการ์ดพลัง, จาจาแถมบ้านกระดาษ, หมากฝรั่งนกแก้ว, ลูกอมซาสี่, ตังเมไม้, ขนมผิง, กล้วยเบรคแตก)
  - 🌾 **สินค้าชุมชน OTOP วังไฮ** (ข้าวหอมมะลิอินทรีย์, ข้าวกล้อง, น้ำผึ้งป่าเดือนห้าแท้, ผ้าทอมือย้อมคราม, ลำไยอบแห้งสีทอง, กล้วยตากพลังงานแสงอาทิตย์)
  - 🛒 **ของใช้ในครัวเรือน & เครื่องปรุง** (น้ำปลา, น้ำมันพืช, ข้าวสาร, อาหารแห้ง, ผงซักฟอก)
- **ระบบค้นหา & ตัวกรองอัจฉริยะ (Search & Filter):** ค้นหาชื่อสินค้า สเปก หรือแท็กได้แบบ Real-time
- **ระบบตะกร้าสินค้า (Shopping Cart Drawer):** ปรับจำนวนสินค้า คำนวณยอดเงินรวมอัตโนมัติ
- **ระบบคำนวณค่าจัดส่ง:** สั่งครบ 300 บาท จัดส่งด่วนฟรีทั่วไทย (ต่ำกว่า 300 บาท เหมาจ่าย 35 บาท)
- **ระบบชำระเงิน:** พร้อมเพย์ QR Code (คำนวณยอดตามบิลจริง) หรือชำระเงินสดปลายทาง (COD)

### 2. 🤖 ระบบ AI Chatbot อัจฉริยะ "น้องพร้อมเสิร์ฟ" (100% Dynamic Generative AI)
- **Zero Hardcoded Responses:** ประมวลผลและตอบคำถามแบบไดนามิกผ่าน Gemini LLM 100%
- **Strict Store Grounding:** ตอบภายใต้คลังความรู้ [storeKnowledge.md](file:///C:/Users/tlelo/src/data/storeKnowledge.md) และแคตตาล็อกสินค้าจริงในร้านเท่านั้น
- **High-Speed Multi-Model Pipeline:** สลับโมเดลความเร็วสูงอัตโนมัติ (`gemini-flash-lite-latest`, `gemini-3.5-flash`) ตอบกลับได้ใน 1 - 2 วินาที
- **LINE Flex Message Carousel:** สร้างการ์ดสินค้าพร้อมปุ่มกดสั่งซื้อแนบไปในแชทอัตโนมัติ
- 📖 **อ่านคู่มือการตั้งค่า AI ฉบับเต็มได้ที่:** [AI_BOT_SETUP.md](file:///C:/Users/tlelo/AI_BOT_SETUP.md)

### 3. 📦 ระบบจัดการสต็อก & คลังความรู้หลังบ้าน (Admin Dashboard: `/admin`)
- ตรวจสอบจำนวนสต็อกคงเหลือรวม และแจ้งเตือน **สินค้าใกล้หมด (Low Stock Alert ≤ 5)**
- ปรับเพิ่ม/ลดสต็อกแบบด่วน (Quick Stock Adjustment `+`, `-`, `+5`)
- **แท็บคลังความรู้ & ฝึกสอน AI (.md):** แก้ไขกฎ กติกา และนโยบายร้านค้าแบบ Markdown พร้อมบันทึกขึ้น Supabase แบบ Real-time
- **Live Chat Logs:** ดูสตรีมคำถามลูกค้าจาก LINE OA พร้อมปุ่มกดเพิ่มเข้ากฎ .md หรือกดฝึกสอน AI ได้ทันที

---

## 🚀 วิธีการรันโปรเจกต์ (Local Development)

1. เปิด Terminal ในโฟลเดอร์โปรเจกต์:
   ```bash
   npm run dev
   ```
2. เปิดเบราว์เซอร์เข้าไปที่:
   * **หน้าร้านค้า:** [http://localhost:3000](http://localhost:3000)
   * **ระบบจัดการสต็อก & AI หลังบ้าน:** [http://localhost:3000/admin](http://localhost:3000/admin)

---

## 🗄️ การเชื่อมต่อกับ Supabase (Online Database)

1. สร้างโปรเจกต์บน [Supabase](https://supabase.com/)
2. นำ SQL ในไฟล์ `supabase_schema.sql` ไปรันใน SQL Editor
3. ตั้งค่า Environment Variables ในไฟล์ `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsIn...
   LINE_CHANNEL_SECRET=fcd0db0af8330d9bd35a20616259d4bf
   LINE_CHANNEL_ACCESS_TOKEN=YWzK8zBn3WhDm...
   GEMINI_API_KEY=AQ.Ab8...
   ```

---

## ☁️ การนำขึ้น Vercel (Deploy to Production)

1. นำขึ้น GitHub Repository
2. เชื่อมต่อกับ Vercel และเพิ่ม Environment Variables
3. Webhook URL สำหรับ LINE Developers Console:
   ```
   https://shop-wanghai-o7qg.vercel.app/api/webhook
   ```
