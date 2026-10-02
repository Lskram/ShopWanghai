import crypto from 'crypto';
import { storeRepo } from './supabase.js';
import { INITIAL_PRODUCTS, INITIAL_COLLECTIONS } from '../data/mockProducts.js';
import { DEFAULT_STORE_KNOWLEDGE } from '../data/storeKnowledge.js';

const DEFAULT_LINE_SECRET = 'fcd0db0af8330d9bd35a20616259d4bf';
const DEFAULT_LINE_TOKEN = 'YWzK8zBn3WhDmPiBrn3VUP0WBZgCyqgs7m2pETTXOIhWpHdN13eHQS2Tb0RxHsFjoe0FH8tE3rWa0ncwX9Bp/gXW9mLunfui2go2FpzN967j5KhME6He9XxwJRsROOeLIHsOzUvJrPBdhbHPnp+f3AdB04t89/1O/w1cDnyilFU=';
const LINE_REPLY_API = 'https://api.line.me/v2/bot/message/reply';
const DEFAULT_STORE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://shop-wanghai-o7qg.vercel.app';

/**
 * Verify LINE Webhook Signature (HMAC-SHA256)
 */
export function verifyLineSignature(rawBody, signature, channelSecret) {
  const secret = channelSecret || process.env.LINE_CHANNEL_SECRET || DEFAULT_LINE_SECRET;
  if (!secret) return true;
  if (!signature) return false;

  try {
    const hash = crypto
      .createHmac('sha256', secret)
      .update(Buffer.from(rawBody, 'utf8'))
      .digest('base64');
    return hash === signature;
  } catch (err) {
    console.error('Signature verification error:', err);
    return false;
  }
}

/**
 * Send Reply to LINE Messaging API
 */
export async function sendLineReply(replyToken, messages, channelAccessToken) {
  const token = channelAccessToken || process.env.LINE_CHANNEL_ACCESS_TOKEN || DEFAULT_LINE_TOKEN;
  if (!token) {
    console.error('LINE_CHANNEL_ACCESS_TOKEN is missing');
    return false;
  }

  const formattedMessages = Array.isArray(messages) ? messages.slice(0, 5) : [messages];

  try {
    const res = await fetch(LINE_REPLY_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        replyToken,
        messages: formattedMessages
      })
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('LINE Reply API error response:', res.status, errorText);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error sending reply to LINE:', err);
    return false;
  }
}

/**
 * Build Quick Reply Buttons
 */
export function getQuickReplyItems() {
  return {
    items: [
      {
        type: 'action',
        action: {
          type: 'message',
          label: '🍭 ขนมโบราณ 90s',
          text: 'ดูขนมโบราณ 90s ทั้งหมด'
        }
      },
      {
        type: 'action',
        action: {
          type: 'message',
          label: '🌾 สินค้า OTOP วังไฮ',
          text: 'แนะนำสินค้า OTOP ของดีบ้านวังไฮ'
        }
      },
      {
        type: 'action',
        action: {
          type: 'message',
          label: '🚚 โปรส่งฟรี',
          text: 'ส่งฟรีกี่บาท มีโปรโมชั่นอะไรบ้าง'
        }
      },
      {
        type: 'action',
        action: {
          type: 'uri',
          label: '🛒 สั่งซื้อผ่านเว็บ',
          uri: DEFAULT_STORE_URL
        }
      },
      {
        type: 'action',
        action: {
          type: 'message',
          label: '📍 ติดต่อร้านค้า',
          text: 'ติดต่อร้านค้าและเวลาเปิดปิด'
        }
      }
    ]
  };
}

/**
 * Flex Message: Welcome Card
 */
export function createWelcomeFlexMessage(storeUrl = DEFAULT_STORE_URL) {
  return {
    type: 'flex',
    altText: 'ยินดีต้อนรับสู่ ร้านค้าสวัสดิการกองทุนหมู่บ้านวังไฮ',
    contents: {
      type: 'bubble',
      hero: {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=800&auto=format&fit=crop&q=80',
        size: 'full',
        aspectRatio: '20:13',
        aspectMode: 'cover'
      },
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'md',
        contents: [
          {
            type: 'text',
            text: 'กองทุนหมู่บ้านวังไฮ 🌾',
            weight: 'bold',
            size: 'xl',
            color: '#1e3a8a'
          },
          {
            type: 'text',
            text: 'ยินดีต้อนรับสู่ร้านค้าสวัสดิการและของดีชุมชนบ้านวังไฮ พร้อมส่งต่อรสชาติวันวานและของดี OTOP ถึงมือคุณ',
            size: 'xs',
            color: '#475569',
            wrap: true
          },
          {
            type: 'separator'
          },
          {
            type: 'box',
            layout: 'vertical',
            margin: 'md',
            spacing: 'sm',
            contents: [
              {
                type: 'box',
                layout: 'baseline',
                spacing: 'sm',
                contents: [
                  { type: 'text', text: '🍭', size: 'sm', flex: 1 },
                  { type: 'text', text: 'ขนมไทยโบราณ & ขนมวัยเด็กยุค 90s', size: 'xs', color: '#334155', flex: 9, weight: 'bold' }
                ]
              },
              {
                type: 'box',
                layout: 'baseline',
                spacing: 'sm',
                contents: [
                  { type: 'text', text: '🌾', size: 'sm', flex: 1 },
                  { type: 'text', text: 'สินค้า OTOP ข้าวหอมมะลิ น้ำผึ้งป่า ผ้าทอ', size: 'xs', color: '#334155', flex: 9, weight: 'bold' }
                ]
              },
              {
                type: 'box',
                layout: 'baseline',
                spacing: 'sm',
                contents: [
                  { type: 'text', text: '🛒', size: 'sm', flex: 1 },
                  { type: 'text', text: 'ของชำ เครื่องปรุง ข้าวสาร อาหารแห้ง', size: 'xs', color: '#334155', flex: 9, weight: 'bold' }
                ]
              }
            ]
          }
        ]
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        contents: [
          {
            type: 'button',
            style: 'primary',
            color: '#2563eb',
            height: 'sm',
            action: {
              type: 'uri',
              label: '🛍️ สั่งซื้อผ่านเว็บไซต์',
              uri: storeUrl
            }
          },
          {
            type: 'button',
            style: 'secondary',
            height: 'sm',
            action: {
              type: 'message',
              label: '🍭 ดูขนมโบราณยอดฮิต',
              text: 'ดูขนมโบราณ 90s ทั้งหมด'
            }
          }
        ]
      }
    },
    quickReply: getQuickReplyItems()
  };
}

/**
 * Flex Message: Product Carousel (Max 10 items per carousel)
 */
export function createProductCarousel(products, storeUrl = DEFAULT_STORE_URL, headerText = 'สินค้าแนะนำสำหรับคุณ') {
  const items = (products || []).slice(0, 10);
  if (items.length === 0) {
    return {
      type: 'text',
      text: 'ขออภัยค่ะ ไม่พบสินค้าที่ตรงกับคำค้นหา ลองเข้าดูสินค้าทั้งหมดบนหน้าเว็บได้เลยนะคะ 😊',
      quickReply: getQuickReplyItems()
    };
  }

  const bubbles = items.map(product => {
    const imageUrl = product.image && product.image.startsWith('http') 
      ? product.image 
      : 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80';

    const isOutOfStock = Number(product.stock) <= 0;
    const isRetro = product.category === 'retro-snacks' || (product.collections && product.collections.includes('retro-thai-sweets'));
    const isOtop = product.category === 'otop' || (product.collections && product.collections.includes('wanghai-signature-otop'));
    
    let badgeText = 'สินค้าสวัสดิการ';
    let badgeColor = '#2563eb';
    if (isRetro) {
      badgeText = '🍭 ขนมโบราณ 90s';
      badgeColor = '#d97706';
    } else if (isOtop) {
      badgeText = '🌾 OTOP วังไฮ';
      badgeColor = '#059669';
    } else if (product.badge) {
      badgeText = product.badge;
    }

    return {
      type: 'bubble',
      size: 'kilo',
      hero: {
        type: 'image',
        url: imageUrl,
        size: 'full',
        aspectRatio: '4:3',
        aspectMode: 'cover'
      },
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        paddingAll: '13px',
        contents: [
          {
            type: 'box',
            layout: 'baseline',
            contents: [
              {
                type: 'text',
                text: badgeText,
                size: 'xxs',
                color: badgeColor,
                weight: 'bold'
              }
            ]
          },
          {
            type: 'text',
            text: product.name || 'สินค้า',
            weight: 'bold',
            size: 'sm',
            maxLines: 2,
            wrap: true,
            color: '#1e293b'
          },
          {
            type: 'text',
            text: product.description || 'สินค้าคุณภาพดีจากกองทุนหมู่บ้านวังไฮ',
            size: 'xxs',
            color: '#64748b',
            maxLines: 2,
            wrap: true
          },
          {
            type: 'box',
            layout: 'baseline',
            margin: 'sm',
            contents: [
              {
                type: 'text',
                text: `฿${product.price}`,
                weight: 'bold',
                size: 'md',
                color: '#dc2626'
              },
              {
                type: 'text',
                text: ` / ${product.unit || 'ชิ้น'}`,
                size: 'xxs',
                color: '#94a3b8',
                margin: 'xs'
              },
              {
                type: 'text',
                text: isOutOfStock ? '❌ สินค้าหมด' : `คงเหลือ ${product.stock || 20}`,
                size: 'xxs',
                color: isOutOfStock ? '#ef4444' : '#16a34a',
                align: 'end',
                weight: 'bold'
              }
            ]
          }
        ]
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'xs',
        paddingAll: '10px',
        contents: [
          {
            type: 'button',
            style: isOutOfStock ? 'secondary' : 'primary',
            color: isOutOfStock ? '#94a3b8' : '#2563eb',
            height: 'sm',
            action: {
              type: 'uri',
              label: isOutOfStock ? 'ดูสินค้าอื่นบนเว็บ' : '🛒 สั่งซื้อผ่านเว็บ',
              uri: `${storeUrl}?category=${product.category || 'all'}`
            }
          }
        ]
      }
    };
  });

  return {
    type: 'flex',
    altText: headerText,
    contents: {
      type: 'carousel',
      contents: bubbles
    },
    quickReply: getQuickReplyItems()
  };
}

/**
 * Flex Message: Store Contact & Information
 */
export function createContactFlexMessage(storeUrl = DEFAULT_STORE_URL) {
  return {
    type: 'flex',
    altText: 'ข้อมูลการติดต่อ ร้านค้าสวัสดิการกองทุนหมู่บ้านวังไฮ',
    contents: {
      type: 'bubble',
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'md',
        contents: [
          {
            type: 'text',
            text: '🏡 ร้านค้ากองทุนหมู่บ้านวังไฮ',
            weight: 'bold',
            size: 'lg',
            color: '#1e3a8a'
          },
          {
            type: 'text',
            text: 'ศูนย์รวมสินค้าสวัสดิการชุมชน ขนมไทยโบราณ และสินค้า OTOP คุณภาพ',
            size: 'xs',
            color: '#475569',
            wrap: true
          },
          {
            type: 'separator'
          },
          {
            type: 'box',
            layout: 'vertical',
            spacing: 'sm',
            contents: [
              {
                type: 'box',
                layout: 'baseline',
                spacing: 'sm',
                contents: [
                  { type: 'text', text: '📍 ที่ตั้ง:', size: 'xs', color: '#64748b', flex: 3 },
                  { type: 'text', text: 'ที่ทำการกองทุนหมู่บ้านวังไฮ ต.วังไฮ อ.เมือง จ.ลำพูน', size: 'xs', color: '#1e293b', flex: 7, wrap: true }
                ]
              },
              {
                type: 'box',
                layout: 'baseline',
                spacing: 'sm',
                contents: [
                  { type: 'text', text: '⏰ เวลาเปิด:', size: 'xs', color: '#64748b', flex: 3 },
                  { type: 'text', text: '07:00 - 20:00 น. (ทุกวัน)', size: 'xs', color: '#1e293b', flex: 7 }
                ]
              },
              {
                type: 'box',
                layout: 'baseline',
                spacing: 'sm',
                contents: [
                  { type: 'text', text: '💬 LINE ID:', size: 'xs', color: '#64748b', flex: 3 },
                  { type: 'text', text: '@237ipknp', size: 'xs', color: '#059669', flex: 7, weight: 'bold' }
                ]
              }
            ]
          }
        ]
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        contents: [
          {
            type: 'button',
            style: 'primary',
            color: '#2563eb',
            height: 'sm',
            action: {
              type: 'uri',
              label: '🌐 เปิดร้านค้าออนไลน์',
              uri: storeUrl
            }
          }
        ]
      }
    },
    quickReply: getQuickReplyItems()
  };
}

/**
 * Modern AI Agent Engine powered by Gemini LLM + Knowledge Base (.md) + Live Catalog (RAG)
 */
async function callModernAiAgent({ userMessage, knowledgeBase, products, trainingExamples, geminiApiKey }) {
  const apiKey = (geminiApiKey || process.env.GEMINI_API_KEY || '').trim();
  const catalogSummary = (products || []).map(p => 
    `- [ID: ${p.id}] ${p.name} (ราคา ฿${p.price}/${p.unit || 'ชิ้น'} | หมวด: ${p.categoryName || p.category}): ${p.description} [Tags: ${(p.tags || []).join(', ')}] [คงเหลือ: ${p.stock || 20}]`
  ).join('\n');

  const fewShotText = (trainingExamples || [])
    .slice(0, 5)
    .map(ex => `ลูกค้าถาม: "${ex.user_query}"\nแนวทางตอบที่ถูกต้อง: "${ex.admin_correction || ex.bot_response}"`)
    .join('\n\n');

  const systemInstruction = `
${knowledgeBase}

---

## 📦 รายการสินค้าจริงทั้งหมดในร้านค้า (Live Product Catalog):
${catalogSummary}

${fewShotText ? `## 💡 ตัวอย่างคำตอบที่แอดมินเคยฝึกฝนให้คุณ (Training Examples):\n${fewShotText}` : ''}

---

## 🎯 กฎเหล็กและข้อกำหนดในการตอบลูกค้า (Strict Grounding Rules):
1. คุณคือ "น้องพร้อมเสิร์ฟ" แอดมินสาวน้อยน่ารัก ใจดี เป็นกันเอง แห่งร้านค้าสวัสดิการกองทุนหมู่บ้านวังไฮ จ.ลำพูน (อู้คำเมืองได้นิดหน่อยน่ารักๆ สุภาพ อบอุ่น มีอีโมจิ 2-3 ตัว)
2. **ตอบภายใต้ข้อมูลและสินค้าที่มีในร้านเท่านั้น (Strict Store Grounding)**:
   - ห้ามกุเรื่องหรือคิดสินค้า/บริการที่ไม่มีในร้านขึ้นมาเองเด็ดขาด
   - หากลูกค้าถามหาสิ่งที่ร้านไม่มี (เช่น ชาเขียวชงสด, ชานมไข่มุก, กาแฟสด, พิซซ่า, ส้มตำ ฯลฯ) ให้แจ้งปฏิเสธอย่างสุภาพน่ารักว่าร้านยังไม่มีเมนูดังกล่าว แล้วนำเสนอสินค้าใกล้เคียงที่มีในร้าน (เช่น ขนมโบราณ 90s, กาแฟโบราณ, ลูกอมซาสี่, ของดี OTOP) แทน
   - หากลูกค้าถามเรื่องงบประมาณ (เช่น มี 50 บาท, 100 บาท อยากได้หลายชิ้น หรืออยากได้ชุดของขวัญ) ให้เลือกสินค้าจริงจากแคตตาล็อกที่มีราคาและจำนวนตรงตามที่ลูกค้าต้องการ พร้อมคำนวณราคารวมให้ชัดเจน
   - หากลูกค้าถามเรื่องโปรโมชั่น/ส่งฟรี/ที่ตั้ง/เวลาเปิดปิด ให้ตอบตามข้อมูลในเอกสารร้านค้า (ส่งฟรีเมื่อครบ 300 บาท, ถ้าไม่ถึง 300 บาท คิดค่าส่ง 35 บาท, ร้านเปิด 07:00-20:00 น. ที่ทำการกองทุนหมู่บ้านวังไฮ ต.วังไฮ อ.เมือง จ.ลำพูน)
   - หากลูกค้าชวนคุย แสดงอารมณ์ เครียด เหงา เศร้า อกหัก หรือถามคำถามทั่วไป ให้คุยอย่างเป็นกันเอง ปลอบใจ และชวนทานขนม/ของดีในร้านเพื่อเติมพลังใจ
3. **ส่งผลลัพธ์กลับมาเป็น JSON ตามรูปแบบนี้เท่านั้น (ห้ามใส่ markdown หรือข้อความอื่นนอก JSON)**:
{
  "replyText": "ข้อความคำตอบจากน้องพร้อมเสิร์ฟที่สร้างสรรค์และตอบตรงประเด็น (สุภาพ น่ารัก อบอุ่น มีอีโมจิ 2-3 บรรทัด)",
  "recommendedProductIds": ["TRAD-01", "TRAD-02"],
  "intent": "snack_recommendation"
}
`;

  const models = [
    'gemini-flash-lite-latest',
    'gemini-3.5-flash',
    'gemini-3-flash-preview',
    'gemini-3.1-flash-lite',
    'gemini-flash-latest'
  ];

  if (apiKey) {
    for (const model of models) {
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  { text: `${systemInstruction}\n\nลูกค้าพิมพ์มาว่า: "${userMessage}"` }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.6,
              maxOutputTokens: 600,
              responseMimeType: 'application/json'
            }
          })
        });

        if (res.ok) {
          const data = await res.json();
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const cleanedText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleanedText);
          if (parsed && parsed.replyText) {
            return parsed;
          }
        }
      } catch (err) {
        console.warn(`Model ${model} error:`, err.message);
      }
    }
  }

  // Graceful fallback when AI API is unavailable
  return {
    replyText: 'ยินดีต้อนรับสู่ร้านค้าสวัสดิการกองทุนหมู่บ้านวังไฮเจ้า 😊 น้องพร้อมเสิร์ฟยินดีให้บริการขนมโบราณ 90s และสินค้า OTOP คุณภาพ ช้อปง่ายส่งไวถึงบ้านเลยนะคะ 🍬🌾',
    recommendedProductIds: (products || []).filter(p => p.isFeatured).slice(0, 3).map(p => p.id),
    intent: 'fallback_greeting'
  };
}

/**
 * Main Webhook Entrypoint - Modern AI Agent Handler
 */
export async function handleLineMessage(userMessage, storeUrl = DEFAULT_STORE_URL) {
  const query = (userMessage || '').trim();

  // Basic Protocol Greet / Menu Check
  if (!query || ['สวัสดี', 'หวัดดี', 'hello', 'hi', 'เริ่ม', 'menu', 'เมนู', 'ยินดีต้อนรับ'].includes(query.toLowerCase())) {
    return [createWelcomeFlexMessage(storeUrl)];
  }

  if (['ติดต่อ', 'ติดต่อร้านค้า', 'ที่อยู่', 'เบอร์โทร', 'เวลาเปิด'].includes(query.toLowerCase())) {
    return [createContactFlexMessage(storeUrl)];
  }

  // 1. Fetch live products, knowledge base, training examples, and API key from database
  let products = [];
  let knowledgeBase = DEFAULT_STORE_KNOWLEDGE;
  let chatLogs = [];
  let geminiApiKey = process.env.GEMINI_API_KEY || '';

  try {
    const [p, k, l, customKey] = await Promise.all([
      storeRepo.getProducts(),
      storeRepo.getStoreKnowledge(),
      storeRepo.getChatLogs(),
      storeRepo.getGeminiApiKey()
    ]);
    if (p && p.length > 0) products = p;
    if (k) knowledgeBase = k;
    if (l && l.length > 0) chatLogs = l;
    if (customKey) geminiApiKey = customKey;
  } catch (e) {
    console.warn('Data loading error in lineBot:', e);
  }

  if (!products || products.length === 0) products = INITIAL_PRODUCTS;

  // 2. Run Modern AI Agent Reasoning
  const aiResponse = await callModernAiAgent({
    userMessage: query,
    knowledgeBase,
    products,
    trainingExamples: chatLogs.filter(l => l.rating === 'good' || l.admin_correction),
    geminiApiKey
  });

  const replyMessages = [
    {
      type: 'text',
      text: aiResponse.replyText,
      quickReply: getQuickReplyItems()
    }
  ];

  // 3. Attach Interactive Product Carousel if AI recommended specific products
  const recIds = aiResponse.recommendedProductIds || [];
  const recProducts = products.filter(p => recIds.includes(p.id));

  if (recProducts.length > 0) {
    const carousel = createProductCarousel(recProducts, storeUrl, `✨ สินค้าแนะนำสำหรับคุณ`);
    replyMessages.push(carousel);
  }

  // 4. Save to Chat Logs in Supabase
  try {
    await storeRepo.saveChatLog({
      user_query: query,
      bot_response: aiResponse.replyText,
      matched_intent: aiResponse.intent || 'ai_agent_reasoning',
      extracted_keywords: recIds.map(id => `#${id}`)
    });
  } catch (e) {
    console.warn('Logging error:', e);
  }

  return replyMessages;
}
