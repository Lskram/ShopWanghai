import crypto from 'crypto';
import { storeRepo } from './supabase.js';
import { INITIAL_PRODUCTS, INITIAL_COLLECTIONS } from '../data/mockProducts.js';

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

  // Ensure messages is an array and max 5 messages per LINE API limits
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
          text: 'ดูขนมโบราณ'
        }
      },
      {
        type: 'action',
        action: {
          type: 'message',
          label: '🌾 สินค้า OTOP',
          text: 'ดูสินค้า OTOP'
        }
      },
      {
        type: 'action',
        action: {
          type: 'message',
          label: '🔥 สินค้าขายดี',
          text: 'สินค้าขายดี'
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
          text: 'ติดต่อร้านค้า'
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
            type: 'separator',
            margin: 'md'
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
              text: 'ดูขนมโบราณ'
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
      text: 'ขออภัยค่ะ ไม่พบสินค้าที่ตรงกับคำค้นหา ลองค้นหาด้วยคำอื่น เช่น ขนม, OTOP หรือของชำ นะคะ 😊',
      quickReply: getQuickReplyItems()
    };
  }

  const bubbles = items.map(product => {
    // Safe fallback image
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
              label: isOutOfStock ? 'ดูสินค้าอื่นบนเว็บ' : '🛒 ซื้อผ่านเว็บ',
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
 * Flex Message: Collections Showcase
 */
export function createCollectionsFlexMessage(collections, storeUrl = DEFAULT_STORE_URL) {
  const cols = collections || INITIAL_COLLECTIONS;
  const bubbles = cols.map(c => ({
    type: 'bubble',
    size: 'kilo',
    hero: {
      type: 'image',
      url: c.image || 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=800',
      size: 'full',
      aspectRatio: '16:9',
      aspectMode: 'cover'
    },
    body: {
      type: 'box',
      layout: 'vertical',
      spacing: 'sm',
      contents: [
        {
          type: 'text',
          text: c.badge || 'เซ็ตแนะนำ',
          size: 'xxs',
          color: '#2563eb',
          weight: 'bold'
        },
        {
          type: 'text',
          text: c.name,
          weight: 'bold',
          size: 'sm',
          wrap: true
        },
        {
          type: 'text',
          text: c.tagline,
          size: 'xxs',
          color: '#64748b',
          wrap: true,
          maxLines: 2
        }
      ]
    },
    footer: {
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'button',
          style: 'primary',
          color: '#059669',
          height: 'sm',
          action: {
            type: 'uri',
            label: '🔎 ดูสินค้าคอลเลกชันนี้',
            uri: `${storeUrl}?collection=${c.id}`
          }
        }
      ]
    }
  }));

  return {
    type: 'flex',
    altText: 'คอลเลกชันสินค้าแนะนำ ร้านค้ากองทุนหมู่บ้านวังไฮ',
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
                  { type: 'text', text: '📞 ติดต่อ:', size: 'xs', color: '#64748b', flex: 3 },
                  { type: 'text', text: '053-123-456 หรือ 089-999-9999', size: 'xs', color: '#1e293b', flex: 7 }
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
 * Call Google Gemini AI with Contextual Bridge Prompting
 */
async function callGeminiAi(prompt, geminiApiKey) {
  const apiKey = geminiApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const models = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash'];
  
  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.75,
            maxOutputTokens: 600
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text.trim();
      }
    } catch (e) {
      console.warn(`Gemini model ${model} error:`, e.message);
    }
  }

  return null;
}

/**
 * Smart Keyword Extractor for Thai E-commerce queries
 */
export function extractKeywords(text) {
  if (!text) return [];
  const stopwords = [
    'ครับ', 'ค่ะ', 'นะคะ', 'หน่อย', 'บ้าง', 'อะไร', 'มี', 'อยากได้', 
    'ขอ', 'ซื้อ', 'กิน', 'ทาน', 'ช่วย', 'ไหม', 'มั้ย', 'นะ', 'จ้า', 
    'เอ่ย', 'ว่า', 'จะ', 'ให้', 'ได้', 'ก็', 'ยัง', 'ใน', 'กับ', 'ของ'
  ];
  
  let cleaned = text.toLowerCase().trim();
  const keywords = [];

  // Extract budget patterns (e.g. 50 บาท, งบ 100)
  const budgetMatch = cleaned.match(/(\d+)\s*บาท/) || cleaned.match(/งบ\s*(\d+)/);
  if (budgetMatch) {
    keywords.push(`งบ${budgetMatch[1]}บาท`);
  }

  // High-value phrase tokens
  const phrases = [
    'ขนมโบราณ', 'ยุค 90', '90s', 'ของดีวังไฮ', 'otop', 'ส่งฟรี', 'ค่าส่ง', 
    'การ์ดพลัง', 'บ้านกระดาษ', 'อกหัก', 'ง่วงนอน', 'ทำบุญ', 'ไหว้พระ', 
    'ของฝาก', 'เบาหวาน', 'กินเจ', 'มังสวิรัติ', 'ข้าวหอมมะลิ', 'น้ำผึ้งป่า',
    'โอเดงยา', 'จาจา', 'ตังเม', 'ข้าวแต๋น', 'กล้วยเบรคแตก'
  ];
  for (const phrase of phrases) {
    if (cleaned.includes(phrase.toLowerCase())) {
      keywords.push(phrase);
    }
  }

  // Tokenize remaining words
  const words = cleaned.replace(/[!?,.\/\\#]/g, ' ').split(/\s+/);
  for (const w of words) {
    if (w.length > 1 && !stopwords.includes(w) && !keywords.includes(w)) {
      keywords.push(w);
    }
  }

  return Array.from(new Set(keywords)).slice(0, 8);
}

/**
 * Main Message Router and Logic Handler with Contextual Bridge
 */
export async function handleLineMessage(userMessage, storeUrl = DEFAULT_STORE_URL) {
  const query = (userMessage || '').trim().toLowerCase();
  
  // Fetch live products, AI rules, and training logs
  let products = [];
  let aiRules = [];
  let chatLogs = [];
  try {
    const [p, r, l] = await Promise.all([
      storeRepo.getProducts(),
      storeRepo.getAiRules(),
      storeRepo.getChatLogs()
    ]);
    products = p || INITIAL_PRODUCTS;
    aiRules = r || [];
    chatLogs = l || [];
  } catch (e) {
    products = INITIAL_PRODUCTS;
  }
  if (!products || products.length === 0) {
    products = INITIAL_PRODUCTS;
  }

  let finalReply = null;
  let matchedIntent = 'general_qa';

  // Helper to finish and log chat with extracted keywords
  const wrapAndLog = async (messages, intent, matchedRuleId = null) => {
    try {
      const botTextSummary = messages.map(m => m.text || m.altText || '').filter(Boolean).join(' | ');
      const extractedKw = extractKeywords(userMessage);
      
      await storeRepo.saveChatLog({
        user_query: userMessage,
        extracted_keywords: extractedKw,
        bot_response: botTextSummary.slice(0, 300),
        matched_intent: intent,
        matched_rule_id: matchedRuleId
      });
    } catch (e) {
      console.warn('Logging error:', e.message);
    }
    return messages;
  };

  // ============================================================
  // 1. Follow / Greeting / Welcome
  // ============================================================
  if (!query || ['สวัสดี', 'หวัดดี', 'hello', 'hi', 'เริ่ม', 'menu', 'เมนู', 'ยินดีต้อนรับ'].includes(query)) {
    return wrapAndLog([createWelcomeFlexMessage(storeUrl)], 'welcome_greeting');
  }

  // ============================================================
  // 1.5 Dynamic Custom AI Rules & Q&A Memory (จากหน้า Admin)
  // ============================================================
  const activeRules = aiRules.filter(r => r.is_active !== false);
  for (const rule of activeRules) {
    const patterns = (rule.question_pattern || '').split(',').map(p => p.trim().toLowerCase()).filter(Boolean);
    const hasMatch = patterns.some(p => query.includes(p));
    if (hasMatch) {
      const textMsg = {
        type: 'text',
        text: rule.answer,
        quickReply: getQuickReplyItems()
      };
      const recIds = rule.recommended_product_ids || [];
      const recProducts = products.filter(p => recIds.includes(p.id));
      if (recProducts.length > 0) {
        const carousel = createProductCarousel(recProducts, storeUrl, `✨ สินค้าแนะนำ (${rule.topic || 'ร้านค้า'})`);
        return wrapAndLog([textMsg, carousel], `custom_rule_${rule.id}`);
      }
      return wrapAndLog([textMsg], `custom_rule_${rule.id}`);
    }
  }

  // ============================================================
  // 2. Emotional & Lifestyle Contexts (อกหัก, ง่วงนอน, เบื่อ, หิว)
  // ============================================================
  
  // 2.1 อกหัก / เศร้า / เครียด / เสียใจ -> แนะนำขนมหวานปลอบใจ
  if (
    query.includes('อกหัก') || 
    query.includes('เศร้า') || 
    query.includes('ร้องไห้') || 
    query.includes('เสียใจ') || 
    query.includes('เครียด') ||
    query.includes('ท้อ')
  ) {
    const sweetItems = products.filter(p => 
      p.category === 'retro-snacks' || 
      p.tags?.some(t => t.includes('หวาน') || t.includes('ขนม')) ||
      p.name.includes('กล้วย') ||
      p.name.includes('ทองม้วน')
    ).slice(0, 10);

    const replyText = {
      type: 'text',
      text: 'โอ๋ๆ นะคะคนเก่ง 🥺 กอดๆ น้า เวลาเครียดหรือเศร้า ให้ของหวานอร่อยๆ ช่วยเยียวยาหัวใจนะคะ น้องพร้อมเสิร์ฟคัดขนมหวานย้อนวัย 90s และกล้วยเบรคแตกเคี้ยวเพลินๆ มาให้เติมพลังใจค่ะ ❤️',
      quickReply: getQuickReplyItems()
    };
    return wrapAndLog([replyText, createProductCarousel(sweetItems, storeUrl, '💖 ขนมหวานเยียวยาหัวใจ')], 'emotional_comfort');
  }

  // 2.2 ง่วงนอน / เพลีย / เหนื่อย / ไม่มีแรง -> แนะนำกาแฟ / ลูกอมซาสี่ซ่าๆ / เครื่องดื่ม
  if (
    query.includes('ง่วง') || 
    query.includes('นอน') || 
    query.includes('ตาจะปิด') || 
    query.includes('เพลีย') || 
    query.includes('เหนื่อย') ||
    query.includes('ตาสว่าง')
  ) {
    const energyItems = products.filter(p => 
      p.category === 'drinks' || 
      p.name.includes('กาแฟ') || 
      p.name.includes('ซาสี่') ||
      p.name.includes('บ๊วย')
    ).slice(0, 10);

    const replyText = {
      type: 'text',
      text: 'ตาจะปิดแล้วใช่ไหมคะ 😴 แวะมาเติมความสดชื่นสักหน่อย! น้องแนะนำกาแฟโบราณหอมเข้ม หรือลูกอมซาสี่ซ่าส์ๆ เคี้ยวบ๊วยเปรี้ยวจี๊ด รับรองตาสว่างพร้อมลุยงานต่อแน่นอนค่ะ ⚡',
      quickReply: getQuickReplyItems()
    };
    return wrapAndLog([replyText, createProductCarousel(energyItems.length > 0 ? energyItems : products.slice(0, 8), storeUrl, '⚡ เติมพลัง สดชื่นตาสว่าง')], 'energy_boost');
  }

  // 2.3 เบื่อ / เหงาปาก / ปากว่าง / ไม่มีอะไรทำ -> ขนมเคี้ยวกรุบกรอบ
  if (
    query.includes('เบื่อ') || 
    query.includes('เซ็ง') || 
    query.includes('เหงาปาก') || 
    query.includes('ปากว่าง') ||
    query.includes('เคี้ยวเล่น')
  ) {
    const crunchItems = products.filter(p => 
      p.category === 'retro-snacks' || 
      p.category === 'snacks'
    ).slice(0, 10);

    const replyText = {
      type: 'text',
      text: 'ถ้าปากว่างจนเริ่มเบื่อ ลองหาอะไรกรุบกรอบเคี้ยวเพลินๆ ดูไหมคะ 😋 มีทั้งตังเมไม้กรอบ ขนมตุ๊บตั๊บ ข้าวแต๋นน้ำแตงโม เคี้ยวสนุกจนลืมเบื่อเลยค่ะ!',
      quickReply: getQuickReplyItems()
    };
    return wrapAndLog([replyText, createProductCarousel(crunchItems, storeUrl, '🍿 ขนมเคี้ยวเพลินแก้เบื่อ')], 'munch_snacks');
  }

  // 2.4 หิว / หิวดึก / หาอะไรกินรองท้อง
  if (
    query.includes('หิว') || 
    query.includes('หิวดึก') || 
    query.includes('มื้อดึก') || 
    query.includes('รองท้อง')
  ) {
    const mealItems = products.filter(p => 
      p.category === 'dryfood' || 
      p.name.includes('บะหมี่') || 
      p.name.includes('ข้าว') ||
      p.category === 'snacks'
    ).slice(0, 10);

    const replyText = {
      type: 'text',
      text: 'ท้องร้องแล้วใช่ไหมคะ 🍜 น้องพร้อมเสิร์ฟมีบะหมี่กึ่งสำเร็จรูปร้อนๆ ปลากระป๋อง และขนมรองท้องราคาประหยัด พร้อมส่งถึงมือคุณค่ะ!',
      quickReply: getQuickReplyItems()
    };
    return wrapAndLog([replyText, createProductCarousel(mealItems, storeUrl, '🍜 เมนูรองท้อง คลายหิว')], 'quick_meal');
  }

  // ============================================================
  // 3. Special Occasions & Gifting (ไหว้พระ ทำบุญ ของฝาก ของขวัญ)
  // ============================================================

  // 3.1 ทำบุญ / ไหว้พระ / ถวายพระ / ใส่บาตร / วันพระ
  if (
    query.includes('ทำบุญ') || 
    query.includes('ไหว้พระ') || 
    query.includes('ถวายพระ') || 
    query.includes('ใส่บาตร') || 
    query.includes('วันพระ') ||
    query.includes('สังฆทาน')
  ) {
    const meritItems = products.filter(p => 
      p.collections?.includes('pantry-essentials') || 
      p.name.includes('ข้าว') || 
      p.name.includes('น้ำผึ้ง') ||
      p.category === 'dryfood'
    ).slice(0, 10);

    const replyText = {
      type: 'text',
      text: 'ร่วมอนุโมทนาบุญด้วยนะคะ สาธุค่ะ 🙏✨ น้องแนะนำจัดชุดข้าวหอมมะลิใหม่อินทรีย์ น้ำผึ้งป่าเดือนห้าแท้ และของแห้งจำเป็น เหมาะสำหรับถวายพระและทำบุญตักบาตรมากๆ ค่ะ',
      quickReply: getQuickReplyItems()
    };
    return wrapAndLog([replyText, createProductCarousel(meritItems, storeUrl, '🙏✨ ชุดของชำคู่บุญ & ทำบุญ')], 'merit_making');
  }

  // 3.2 ของฝาก / ผู้ใหญ่ / ของขวัญ / เยี่ยมญาติ / ปีใหม่
  if (
    query.includes('ของฝาก') || 
    query.includes('ผู้ใหญ่') || 
    query.includes('ของขวัญ') || 
    query.includes('เยี่ยมญาติ') || 
    query.includes('ปีใหม่') ||
    query.includes('สงกรานต์')
  ) {
    const giftItems = products.filter(p => 
      p.category === 'otop' || 
      p.collections?.includes('wanghai-signature-otop') ||
      p.name.includes('น้ำผึ้ง') ||
      p.name.includes('ผ้าทอ') ||
      p.name.includes('เปี๊ยะ')
    ).slice(0, 10);

    const replyText = {
      type: 'text',
      text: 'สำหรับของฝากผู้ใหญ่หรือของขวัญคนพิเศษ 🎁 แนะนำสินค้า OTOP Signature วังไฮ ค่ะ ทั้งน้ำผึ้งป่าเดือนห้า ผ้าทอมือย้อมคราม ขนมเปี๊ยะอบควันเทียน สวยงาม ทรงคุณค่า ผู้รับประทับใจแน่นอนค่ะ!',
      quickReply: getQuickReplyItems()
    };
    return wrapAndLog([replyText, createProductCarousel(giftItems, storeUrl, '🎁 ของฝาก OTOP วังไฮ ชั้นเลิศ')], 'otop_gift');
  }

  // ============================================================
  // 4. Dietary & Health Constraints (เบาหวาน, หวานน้อย, สุขภาพ, เจ, มังสวิรัติ)
  // ============================================================

  // 4.1 สุขภาพ / เบาหวาน / หวานน้อย / ลดน้ำตาล / คลีน
  if (
    query.includes('เบาหวาน') || 
    query.includes('หวานน้อย') || 
    query.includes('ลดน้ำตาล') || 
    query.includes('สุขภาพ') || 
    query.includes('ไม่อ้วน') ||
    query.includes('อินทรีย์')
  ) {
    const healthItems = products.filter(p => 
      p.name.includes('ข้าวกล้อง') || 
      p.name.includes('กล้วยตาก') || 
      p.tags?.some(t => t.includes('อินทรีย์') || t.includes('ธรรมชาติ'))
    ).slice(0, 10);

    const replyText = {
      type: 'text',
      text: 'เพื่อสุขภาพที่ดี น้องพร้อมเสิร์ฟแนะนำ ข้าวกล้องหอมมะลิอินทรีย์ (ดัชนีน้ำตาลต่ำ) และ กล้วยตากพลังงานแสงอาทิตย์ หวานธรรมชาติแท้ 100% ไม่เติมน้ำตาล ไม่ใส่สารกันบูดค่ะ 🌿',
      quickReply: getQuickReplyItems()
    };
    return wrapAndLog([replyText, createProductCarousel(healthItems.length > 0 ? healthItems : products.slice(0, 6), storeUrl, '🌿 สินค้าสุขภาพ & อินทรีย์')], 'health_diet');
  }

  // 4.2 เจ / มังสวิรัติ / วีแกน
  if (
    query.includes('เจ') || 
    query.includes('มังสวิรัติ') || 
    query.includes('มัง') || 
    query.includes('วีแกน')
  ) {
    const veganItems = products.filter(p => 
      p.name.includes('ข้าวแต๋น') || 
      p.name.includes('ข้าวเกรียบว่าว') || 
      p.name.includes('กล้วยเบรคแตก') ||
      p.name.includes('ถั่วตัด') ||
      p.name.includes('ตังเม')
    ).slice(0, 10);

    const replyText = {
      type: 'text',
      text: 'สายบุญทานได้สบายใจค่ะ 🌱 ขนมพื้นบ้านของเราอย่าง ข้าวแต๋นน้ำแตงโม, ข้าวควบย่าง, กล้วยเบรคแตก และขนมถั่วตัด ทำจากพืชธรรมชาติแท้ๆ ไม่มีส่วนผสมของเนื้อสัตว์ค่ะ',
      quickReply: getQuickReplyItems()
    };
    return wrapAndLog([replyText, createProductCarousel(veganItems, storeUrl, '🌱 ขนมเจ & มังสวิรัติ')], 'vegan_diet');
  }

  // ============================================================
  // 5. Nostalgia & Toys 90s (การ์ดพลัง, ของเล่น, บ้านกระดาษ)
  // ============================================================
  if (
    query.includes('การ์ด') || 
    query.includes('ของเล่น') || 
    query.includes('บ้านกระดาษ') || 
    query.includes('สติกเกอร์') || 
    query.includes('ย้อนวัย') ||
    query.includes('เด็กประถม')
  ) {
    const retroToyItems = products.filter(p => 
      p.name.includes('โอเดงยา') || 
      p.name.includes('จาจา') || 
      p.name.includes('นกแก้ว') ||
      p.category === 'retro-snacks'
    ).slice(0, 10);

    const replyText = {
      type: 'text',
      text: 'ย้อนวัยยุค 90s สุดคลาสสิก! 🎮 ขนมโอเดงยาแถมการ์ดพลังในตำนาน และขนมจาจ้าแถมบ้านต่อกระดาษ มีพร้อมส่งให้สะสมความทรงจำวัยเด็กแล้วค่ะ!',
      quickReply: getQuickReplyItems()
    };
    return wrapAndLog([replyText, createProductCarousel(retroToyItems, storeUrl, '🎮 ขนม 90s แถมของเล่นในตำนาน')], 'nostalgia_toys');
  }

  // ============================================================
  // 6. External / Unrelated Food (พิซซ่า, ชานม, ชาบู, สเต็ก, เบอร์เกอร์)
  // ============================================================
  if (
    query.includes('พิซซ่า') || 
    query.includes('ชานม') || 
    query.includes('ชาบู') || 
    query.includes('สเต็ก') || 
    query.includes('เบอร์เกอร์') ||
    query.includes('ซูชิ') ||
    query.includes('หมูกระทะ')
  ) {
    const snackItems = products.filter(p => p.category === 'retro-snacks' || p.category === 'snacks').slice(0, 10);
    const replyText = {
      type: 'text',
      text: 'แหม เมนูนี้ฟังแล้วน่ากินมากเลยค่ะ 🤤 แต่ร้านเราเป็นร้านค้าสวัสดิการชุมชน ไม่มีเมนูนั้นโดยตรงนะคะ มีเป็นขนมขบเคี้ยวและของกินเล่นอร่อยๆ ย้อนวัย ทานรองท้องเพลินๆ แทนได้ในราคาสบายกระเป๋าค่ะ 🛒',
      quickReply: getQuickReplyItems()
    };
    return wrapAndLog([replyText, createProductCarousel(snackItems, storeUrl, '🍪 ของว่างเคี้ยวเพลินทดแทน')], 'external_food');
  }

  // ============================================================
  // 7. General Retro Snacks Category
  // ============================================================
  if (
    query.includes('ขนม') ||
    query.includes('โบราณ') ||
    query.includes('90') ||
    query.includes('โอเดงยา') ||
    query.includes('จาจา') ||
    query.includes('นกแก้ว') ||
    query.includes('ซาสี่') ||
    query.includes('ตังเม') ||
    query.includes('เซียงไฮ') ||
    query.includes('บ๊วย') ||
    query.includes('หวาน')
  ) {
    const retroItems = products.filter(p => 
      p.category === 'retro-snacks' || 
      (p.collections && p.collections.includes('retro-thai-sweets')) ||
      p.category === 'snacks'
    );
    const greetingText = {
      type: 'text',
      text: '🍭 รวมขนมไทยโบราณ & ขนมวัยเด็กยุค 90s รสชาติวันวานที่คิดถึง พร้อมส่งถึงบ้านคุณแล้วค่ะ!',
      quickReply: getQuickReplyItems()
    };
    const carousel = createProductCarousel(retroItems.slice(0, 10), storeUrl, '🍭 ขนมไทยโบราณ & ยุค 90s');
    return wrapAndLog([greetingText, carousel], 'category_retro_snacks');
  }

  // ============================================================
  // 8. OTOP & Local Village Products
  // ============================================================
  if (
    query.includes('otop') ||
    query.includes('โอทอป') ||
    query.includes('ชุมชน') ||
    query.includes('ของดี') ||
    query.includes('วังไฮ') ||
    query.includes('ข้าวหอม') ||
    query.includes('น้ำผึ้ง') ||
    query.includes('ผ้าทอ') ||
    query.includes('ลำไย')
  ) {
    const pureOtop = products.filter(p => p.category === 'otop');
    const colOtop = products.filter(p => p.collections && p.collections.includes('wanghai-signature-otop') && p.category !== 'otop');
    const otopItems = [...pureOtop, ...colOtop];

    const greetingText = {
      type: 'text',
      text: '🌾 สินค้า OTOP และของดีประจำหมู่บ้านวังไฮ ผลผลิตเกษตรอินทรีย์และงานฝีมือคุณภาพจากชาวบ้านค่ะ',
      quickReply: getQuickReplyItems()
    };
    const carousel = createProductCarousel(otopItems.slice(0, 10), storeUrl, '🌾 สินค้า OTOP ของดีบ้านวังไฮ');
    return wrapAndLog([greetingText, carousel], 'category_otop');
  }

  // ============================================================
  // 9. Best Sellers / Highlights
  // ============================================================
  if (
    query.includes('ขายดี') ||
    query.includes('ยอดฮิต') ||
    query.includes('แนะนำ') ||
    query.includes('ฮิต') ||
    query.includes('มีอะไรบ้าง') ||
    query.includes('สินค้า')
  ) {
    const topItems = products.filter(p => p.badge || p.isFeatured || p.stock > 0).slice(0, 10);
    const greetingText = {
      type: 'text',
      text: '🔥 สินค้ายอดนิยมประจำร้านค้ากองทุนหมู่บ้านวังไฮ กดดูรายการด้านล่างได้เลยนะคะ',
      quickReply: getQuickReplyItems()
    };
    const carousel = createProductCarousel(topItems, storeUrl, '🔥 สินค้ายอดนิยม');
    return wrapAndLog([greetingText, carousel], 'best_sellers');
  }

  // ============================================================
  // 10. Collections / Promotions / Sets
  // ============================================================
  if (
    query.includes('โปร') ||
    query.includes('เซ็ต') ||
    query.includes('เซต') ||
    query.includes('คอลเลกชัน') ||
    query.includes('ชุด')
  ) {
    let collections = [];
    try {
      collections = await storeRepo.getCollections();
    } catch(e) {
      collections = INITIAL_COLLECTIONS;
    }
    const intro = {
      type: 'text',
      text: '🎁 รวมเซ็ตสินค้าสุดคุ้มและคอลเลกชันพิเศษจากร้านค้าสวัสดิการกองทุนหมู่บ้านวังไฮค่ะ',
      quickReply: getQuickReplyItems()
    };
    return wrapAndLog([intro, createCollectionsFlexMessage(collections, storeUrl)], 'collections_promo');
  }

  // ============================================================
  // 11. Contact & Store Info
  // ============================================================
  if (
    query.includes('ติดต่อ') ||
    query.includes('แอดมิน') ||
    query.includes('ที่อยู่') ||
    query.includes('เบอร์') ||
    query.includes('เปิดกี่โมง') ||
    query.includes('ร้านอยู่ไหน')
  ) {
    return wrapAndLog([createContactFlexMessage(storeUrl)], 'contact_info');
  }

  // ============================================================
  // 12. Budget Filter (e.g. "งบ 50", "ไม่เกิน 20", "20 บาท")
  // ============================================================
  const budgetMatch = query.match(/(\d+)\s*บาท/) || query.match(/งบ\s*(\d+)/) || query.match(/ไม่เกิน\s*(\d+)/) || query.match(/มีตัง\s*(\d+)/);
  if (budgetMatch) {
    const maxBudget = parseInt(budgetMatch[1], 10);
    if (!isNaN(maxBudget) && maxBudget > 0) {
      const budgetItems = products.filter(p => Number(p.price) <= maxBudget).slice(0, 10);
      if (budgetItems.length > 0) {
        const textMsg = {
          type: 'text',
          text: `💰 รวมสินค้าในงบไม่เกิน ${maxBudget} บาท คัดสรรมาให้คุณแล้วค่ะ:`,
          quickReply: getQuickReplyItems()
        };
        const carousel = createProductCarousel(budgetItems, storeUrl, `💰 สินค้างบไม่เกิน ฿${maxBudget}`);
        return wrapAndLog([textMsg, carousel], `budget_under_${maxBudget}`);
      }
    }
  }

  // ============================================================
  // 13. Specific Search in Product Names & Descriptions
  // ============================================================
  const matched = products.filter(p => 
    p.name.toLowerCase().includes(query) || 
    (p.description && p.description.toLowerCase().includes(query)) ||
    (p.tags && p.tags.some(t => t.toLowerCase().includes(query)))
  );

  if (matched.length > 0) {
    const textMsg = {
      type: 'text',
      text: `🔎 น้องพร้อมเสิร์ฟพบสินค้าที่เกี่ยวกับ "${userMessage}" จำนวน ${matched.length} รายการค่ะ:`,
      quickReply: getQuickReplyItems()
    };
    const carousel = createProductCarousel(matched.slice(0, 10), storeUrl, `ผลการค้นหา: ${userMessage}`);
    return wrapAndLog([textMsg, carousel], 'product_search');
  }

  // ============================================================
  // 14. Conversational Fallback with Gemini AI (Contextual Bridge + Few-Shot Training)
  // ============================================================
  const catalogSummary = products.slice(0, 20).map(p => `- ${p.name} (฿${p.price}/${p.unit}): ${p.description}`).join('\n');
  
  // Format Knowledge Base Rules
  const rulesSummary = activeRules.map(r => `• กฎเรื่อง "${r.topic}": ถ้าลูกค้าถามเกี่ยวกับ (${r.question_pattern}) ให้ตอบแนวทาง: "${r.answer}"`).join('\n');
  
  // Format Few-Shot Examples from Chat Logs (rating: good or with correction)
  const trainingExamples = chatLogs
    .filter(l => l.rating === 'good' || l.admin_correction || l.use_for_training)
    .slice(0, 5)
    .map(l => `ตัวอย่าง:\nลูกค้า: "${l.user_query}"\nคำตอบที่ถูกต้อง: "${l.admin_correction || l.bot_response}"`)
    .join('\n\n');

  const aiPrompt = `
คุณคือ "น้องพร้อมเสิร์ฟ" พนักงานแนะนำสินค้าใจดี อารมณ์ดี และสุภาพประจำ "ร้านค้าสวัสดิการกองทุนหมู่บ้านวังไฮ" (@237ipknp)

เป้าหมายของคุณ:
รับฟังคำถามของลูกค้า ไม่ว่าจะถามเกี่ยวกับอะไร (อารมณ์, ปัญหาชีวิต, ถามกวนๆ, งบประหยัด) ให้ตอบรับด้วยความเข้าใจ อบอุ่น ยิ้มแย้ม และทำ "Contextual Bridge" เชื่อมโยงกลับมาแนะนำสินค้าในร้านได้อย่างแนบเนียน

คลังความรู้และนโยบายร้านค้า (Knowledge Base):
${rulesSummary || 'ไม่มีกฎเพิ่มเติม'}

ตัวอย่างการตอบที่ถูกต้องที่คุณได้รับการฝึกฝนมา (Few-Shot Training Examples):
${trainingExamples || 'ไม่มีตัวอย่างเพิ่มเติม'}

หมวดหมู่สินค้าในร้าน:
1. ขนมไทยโบราณและขนมยุค 90s (โอเดงยาแถมการ์ด, จาจาแถมบ้านกระดาษ, หมากฝรั่งนกแก้ว, ลูกอมซาสี่, ตังเมไม้, ขนมผิง, เซียงไฮ ฯลฯ)
2. สินค้า OTOP วังไฮ (ข้าวหอมมะลิอินทรีย์, น้ำผึ้งป่าเดือนห้า, ผ้าทอมือย้อมคราม, กล้วยตาก, ลำไยอบแห้ง)
3. ข้าวสาร อาหารแห้ง เครื่องปรุง และของใช้ในครัวเรือนราคาสวัสดิการ

รายการสินค้าตัวอย่าง:
${catalogSummary}

ลูกค้าพิมพ์มาว่า: "${userMessage}"

คำแนะนำในการตอบ:
- ตอบด้วยภาษาไทยที่สุภาพ น่ารัก อบอุ่น มีอีโมจิน่ารักประกอบ
- ความยาว 2-4 บรรทัด กำลังพอดี
- ชวนลูกค้าดูสินค้าหรือเข้าชมร้านค้าออนไลน์
`;

  let aiReply = await callGeminiAi(aiPrompt);

  if (!aiReply) {
    aiReply = `ยินดีให้บริการค่ะ 😊 คุณลูกค้าสามารถสอบถามเกี่ยวกับขนมโบราณยุค 90s, สินค้า OTOP ของดีบ้านวังไฮ หรือกดเลือกดูหมวดหมู่สินค้าที่สนใจด้านล่างได้เลยนะคะ หรือเข้าสั่งซื้อผ่านร้านค้าออนไลน์ได้ตลอด 24 ชม. ค่ะ 🛍️`;
  }

  return wrapAndLog([
    {
      type: 'text',
      text: aiReply,
      quickReply: getQuickReplyItems()
    }
  ], 'gemini_conversational');
}
