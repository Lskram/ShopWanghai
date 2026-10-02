import { NextResponse } from 'next/server';
import { storeRepo } from '@/lib/supabase';
import { INITIAL_PRODUCTS } from '@/data/mockProducts';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { query, keywords } = await req.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Fetch live store products
    let products = [];
    try {
      products = await storeRepo.getProducts();
    } catch(e) {
      products = INITIAL_PRODUCTS;
    }
    if (!products || products.length === 0) products = INITIAL_PRODUCTS;

    const catalogText = products.map(p => 
      `- [${p.id}] ${p.name} (ราคา ฿${p.price}/${p.unit}): ${p.description} (หมวด: ${p.categoryName || p.category})`
    ).join('\n');

    const prompt = `
คุณคือ "น้องพร้อมเสิร์ฟ" ผู้ช่วย AI ประจำร้านค้าสวัสดิการกองทุนหมู่บ้านวังไฮ (@237ipknp)

ลูกค้าถามคำถามว่า: "${query}"
คีย์เวิร์ดที่สกัดได้: ${(keywords || []).join(', ') || query}

นี่คือแคตตาล็อกสินค้าจริงทั้งหมดของร้านเรา:
${catalogText}

หน้าที่ของคุณ:
1. วิเคราะห์คำถามของลูกค้า และจับคู่กับสินค้าที่เหมาะสมที่สุดในร้านเรา 1-3 รายการ
2. ร่างคำตอบภาษาไทยที่สุภาพ น่ารัก อบอุ่น มีอีโมจิน่ารัก (ความยาว 2-3 บรรทัด) โดยแนะนำสินค้าของร้านเรา ระบุชื่อสินค้าและราคาอย่างชัดเจน พร้อมบอกว่าทำไมสินค้าตัวนี้ถึงตอบโจทย์ลูกค้า
3. ระบุรหัสสินค้า (Product IDs) ที่เกี่ยวข้อง เช่น ["TRAD-01", "TRAD-02"]

ตอบกลับในรูปแบบ JSON ดังนี้เท่านั้น (ไม่ต้องใส่ markdown code block หรือคำอธิบายอื่น):
{
  "topic": "ชื่อหัวข้อสั้นๆ เช่น แนะนำขนมหวานปลอบใจ, ข้อมูลโปรส่งฟรี",
  "suggestedAnswer": "ข้อความคำตอบที่ร่างเสร็จสมบูรณ์พร้อมส่งให้ลูกค้า...",
  "suggestedProductIds": ["TRAD-01"]
}
`;

    const apiKey = process.env.GEMINI_API_KEY || '';
    const models = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash'];

    let aiResult = null;

    if (apiKey) {
      for (const model of models) {
        try {
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 600
              }
            })
          });

          if (res.ok) {
            const data = await res.json();
            const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
            const cleanedText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
            aiResult = JSON.parse(cleanedText);
            if (aiResult?.suggestedAnswer) break;
          }
        } catch(e) {
          // try next model
        }
      }
    }

    // Fallback: Smart local catalog synthesis if Gemini API key is not reachable
    if (!aiResult || !aiResult.suggestedAnswer) {
      const lowerQ = query.toLowerCase();
      let matchedProds = products.filter(p => 
        lowerQ.includes(p.name.toLowerCase()) || 
        (p.tags && p.tags.some(t => lowerQ.includes(t.toLowerCase()))) ||
        (p.category && lowerQ.includes(p.category))
      );

      if (matchedProds.length === 0) {
        if (lowerQ.includes('ขนม') || lowerQ.includes('หวาน') || lowerQ.includes('อกหัก')) {
          matchedProds = products.filter(p => p.category === 'retro-snacks').slice(0, 2);
        } else if (lowerQ.includes('otop') || lowerQ.includes('ของฝาก') || lowerQ.includes('ผู้ใหญ่')) {
          matchedProds = products.filter(p => p.category === 'otop').slice(0, 2);
        } else {
          matchedProds = products.filter(p => p.isFeatured).slice(0, 2);
        }
      }

      const prodNames = matchedProds.map(p => `${p.name} (฿${p.price})`).join(' และ ');
      aiResult = {
        topic: `ตอบคำถาม: ${query.slice(0, 25)}`,
        suggestedAnswer: `ยินดีให้บริการค่ะ 😊 สำหรับ "${query}" น้องพร้อมเสิร์ฟขอแนะนำ ${prodNames || 'สินค้าคุณภาพของร้านเรา'} รสชาติอร่อยถูกใจ ส่งตรงจากกองทุนหมู่บ้านวังไฮ สั่งซื้อผ่านเว็บได้เลยนะคะ 🛍️✨`,
        suggestedProductIds: matchedProds.map(p => p.id)
      };
    }

    return NextResponse.json({
      success: true,
      data: aiResult
    });

  } catch(error) {
    console.error('AI Suggest API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
