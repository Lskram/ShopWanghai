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
 * Call Google Gemini AI to analyze customer message & generate consultative selling responses
 */
async function callGeminiAi(prompt, geminiApiKey) {
  const apiKey = geminiApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  // Try standard models
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
            temperature: 0.7,
            maxOutputTokens: 500
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
 * Main Message Router and Logic Handler
 */
export async function handleLineMessage(userMessage, storeUrl = DEFAULT_STORE_URL) {
  const query = (userMessage || '').trim().toLowerCase();
  
  // Fetch live products
  let products = [];
  try {
    products = await storeRepo.getProducts();
  } catch (e) {
    products = INITIAL_PRODUCTS;
  }
  if (!products || products.length === 0) {
    products = INITIAL_PRODUCTS;
  }

  // 1. Follow / Greeting / Welcome Keywords
  if (!query || ['สวัสดี', 'หวัดดี', 'hello', 'hi', 'เริ่ม', 'menu', 'เมนู', 'ยินดีต้อนรับ'].includes(query)) {
    return [createWelcomeFlexMessage(storeUrl)];
  }

  // 2. Retro Snacks Keywords
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
    return [greetingText, carousel];
  }

  // 3. OTOP & Local Village Products
  if (
    query.includes('otop') ||
    query.includes('โอทอป') ||
    query.includes('ชุมชน') ||
    query.includes('ของดี') ||
    query.includes('ของฝาก') ||
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
    return [greetingText, carousel];
  }

  // 4. Best Sellers / Highlights
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
    return [greetingText, carousel];
  }

  // 5. Collections / Promotions / Sets
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
    return [intro, createCollectionsFlexMessage(collections, storeUrl)];
  }

  // 6. Contact & Store Info
  if (
    query.includes('ติดต่อ') ||
    query.includes('แอดมิน') ||
    query.includes('ที่อยู่') ||
    query.includes('เบอร์') ||
    query.includes('เปิดกี่โมง') ||
    query.includes('ร้านอยู่ไหน')
  ) {
    return [createContactFlexMessage(storeUrl)];
  }

  // 7. Budget Filter (e.g. "งบ 50", "ไม่เกิน 20", "20 บาท")
  const budgetMatch = query.match(/(\d+)\s*บาท/) || query.match(/งบ\s*(\d+)/) || query.match(/ไม่เกิน\s*(\d+)/);
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
        return [textMsg, carousel];
      }
    }
  }

  // 8. Specific Search in Product Names & Descriptions
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
    return [textMsg, carousel];
  }

  // 9. Conversational Fallback with Gemini AI (if available) or Consultative Assistant
  const catalogSummary = products.slice(0, 20).map(p => `- ${p.name} (฿${p.price}/${p.unit}): ${p.description}`).join('\n');
  const aiPrompt = `
คุณคือ "น้องพร้อมเสิร์ฟ" พนักงานแนะนำสินค้าใจดีและสุภาพประจำ "ร้านค้าสวัสดิการกองทุนหมู่บ้านวังไฮ" (@237ipknp)
ร้านเราจำหน่าย:
1. ขนมไทยโบราณและขนมยุค 90s ยอดฮิต (โอเดงยาแถมการ์ดพลัง, ขนมจาจาบ้านต่อกระดาษ, หมากฝรั่งตรานกแก้ว, ลูกอมซาสี่, ขนมไม้ตังเม, เวเฟอร์เซียงไฮ ฯลฯ)
2. สินค้า OTOP และของดีประจำหมู่บ้านวังไฮ (ข้าวหอมมะลิอินทรีย์, น้ำผึ้งป่าเดือนห้า, ผ้าทอมือย้อมคราม, ลำไยอบแห้งสีทอง)
3. ข้าวสาร อาหารแห้ง เครื่องปรุง และของใช้ในครัวเรือนราคาสวัสดิการ

รายการสินค้าบางส่วน:
${catalogSummary}

ลูกค้าถามว่า: "${userMessage}"

คำแนะนำในการตอบ:
- ตอบด้วยภาษาไทยที่สุภาพ อบอุ่น เป็นกันเอง และให้ข้อมูลอย่างตรงประเด็น (ความยาวประมาณ 2-4 บรรทัด)
- แนะนำสินค้าที่เกี่ยวข้องถ้ามี และเชิญชวนลูกค้าเข้าชมหรือสั่งซื้อผ่านเว็บไซต์ร้านค้า
- ไม่ต้องใส่สัญลักษณ์ Markdown ที่ซับซ้อน ตอบแบบพร้อมส่งเข้า LINE Chat ทันที
`;

  let aiReply = await callGeminiAi(aiPrompt);

  if (!aiReply) {
    aiReply = `ยินดีให้บริการค่ะ 😊 คุณลูกค้าสามารถสอบถามเกี่ยวกับขนมโบราณยุค 90s, สินค้า OTOP ของดีบ้านวังไฮ หรือกดเลือกดูหมวดหมู่สินค้าที่สนใจด้านล่างได้เลยนะคะ หรือเข้าสั่งซื้อผ่านร้านค้าออนไลน์ได้ตลอด 24 ชม. ค่ะ 🛍️`;
  }

  return [
    {
      type: 'text',
      text: aiReply,
      quickReply: getQuickReplyItems()
    }
  ];
}
