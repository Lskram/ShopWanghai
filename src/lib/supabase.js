import { createClient } from '@supabase/supabase-js';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_COLLECTIONS } from '../data/mockProducts.js';

const DEFAULT_SUPABASE_URL = 'https://ecehmprfledkftkcyrnp.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjZWhtcHJmbGVka2Z0a2N5cm5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5MzAzNzMsImV4cCI6MjEwNjUwNjM3M30.TOrUQ7pyoOQRpbRV_PlXZPH_GkMkPwCzWAjQdpUibhQ';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseUrl = rawUrl.replace('ecehmprffledkftkcyrnp', 'ecehmprfledkftkcyrnp');
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('https://'));

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const DATA_VERSION = 'v2.2_ai_training_and_logs';

export const INITIAL_AI_RULES = [
  {
    id: 'RULE-001',
    topic: 'การจัดส่งและโปรส่งฟรี',
    question_pattern: 'ส่งฟรีกี่บาท, ค่าส่งเท่าไหร่, คิดค่าส่งยังไง, ส่งของยังไง, มีส่งฟรีไหม',
    answer: 'ร้านมีบริการจัดส่งด่วนทั่วไทยเริ่มต้นเพียง 35 บาท และพิเศษสุด! ส่งฟรีทันทีเมื่อสั่งซื้อสินค้าครบ 300 บาทขึ้นไปค่ะ 🚚💨',
    recommended_product_ids: ['TRAD-01', 'TRAD-02'],
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'RULE-002',
    topic: 'ของดีประจำหมู่บ้านวังไฮ',
    question_pattern: 'ของดีวังไฮ, ประวัติวังไฮ, ทำไมต้องวังไฮ, สินค้าเด่น, เรื่องราวชุมชน',
    answer: 'บ้านวังไฮ ต.วังไฮ อ.เมือง จ.ลำพูน เป็นชุมชนเข้มแข็งที่มีชื่อเสียงด้าน ข้าวหอมมะลิอินทรีย์ น้ำผึ้งป่าเดือนห้าแท้ และผ้าทอมือย้อมครามธรรมชาติ ผลิตด้วยหัวใจจากกลุ่มแม่บ้านและวิสาหกิจชุมชนค่ะ 🌾',
    recommended_product_ids: ['WH-01', 'WH-02', 'WH-04'],
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'RULE-003',
    topic: 'ขนม 90s แถมของเล่นสะสม',
    question_pattern: 'ของแถม, การ์ดพลัง, บ้านกระดาษ, สติกเกอร์, โอเดงยา, จาจา',
    answer: 'ขนมโอเดงยาทุกซองแถมการ์ดพลังในตำนานให้สะสม และขนมจาจ้าแถมชุดต่อบ้านกระดาษ 3 มิติ ย้อนความทรงจำวัยประถมได้ทันทีเลยค่ะ 🎮',
    recommended_product_ids: ['TRAD-04', 'TRAD-07'],
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'RULE-004',
    topic: 'ช่องทางการชำระเงิน',
    question_pattern: 'จ่ายเงินยังไง, โอนเงิน, เก็บเงินปลายทาง, พร้อมเพย์, บัญชีธนาคาร',
    answer: 'ร้านค้ารองรับการชำระเงินผ่านการสแกน QR Code / PromptPay โอนเข้าบัญชีกองทุนหมู่บ้านวังไฮ สะดวก ปลอดภัย และมีหลักฐานชัดเจนค่ะ 💳',
    recommended_product_ids: [],
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'RULE-005',
    topic: 'เวลาเปิดทำการและที่ตั้งหน้าร้าน',
    question_pattern: 'ไปซื้อที่ร้าน, หน้าร้านอยู่ไหน, เปิดกี่โมง, แผนที่ร้าน',
    answer: 'หน้าร้านตั้งอยู่ที่ทำการกองทุนหมู่บ้านวังไฮ ต.วังไฮ อ.เมือง จ.ลำพูน เปิดบริการทุกวัน 07:00 - 20:00 น. หรือสั่งซื้อผ่านเว็บไซต์ได้ตลอด 24 ชม. ค่ะ 🏡',
    recommended_product_ids: [],
    is_active: true,
    created_at: new Date().toISOString()
  }
];

export const INITIAL_CHAT_LOGS = [
  {
    id: 'LOG-001',
    user_id: 'U_SAMPLE_1',
    user_query: 'อกหัก กินอะไรดี',
    bot_response: 'โอ๋ๆ นะคะคนเก่ง 🥺 กอดๆ น้า ให้ของหวานอร่อยๆ ช่วยเยียวยาหัวใจนะคะ น้องพร้อมเสิร์ฟคัดขนมหวานย้อนวัย 90s และกล้วยเบรคแตกเคี้ยวเพลินๆ มาให้เติมพลังใจค่ะ ❤️',
    matched_intent: 'emotional_comfort',
    rating: 'good',
    admin_correction: '',
    use_for_training: true,
    created_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'LOG-002',
    user_id: 'U_SAMPLE_2',
    user_query: 'มีขนมที่แถมการ์ดพลังไหม',
    bot_response: 'ย้อนวัยยุค 90s สุดคลาสสิก! 🎮 ขนมโอเดงยาแถมการ์ดพลังในตำนาน มีพร้อมส่งให้สะสมความทรงจำวัยเด็กแล้วค่ะ!',
    matched_intent: 'nostalgia_toys',
    rating: 'good',
    admin_correction: '',
    use_for_training: true,
    created_at: new Date(Date.now() - 7200000).toISOString()
  }
];

// Helper data repository that seamlessly uses Supabase if configured or LocalStorage/Mock fallback
export const storeRepo = {
  // Get all collections
  async getCollections() {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('collections').select('*');
      if (!error && data && data.length > 0) return data;
    }
    return INITIAL_COLLECTIONS;
  },

  // Get all products (with optional collection / category filter)
  async getProducts(filter = {}) {
    if (isSupabaseConfigured && supabase) {
      let query = supabase.from('products').select('*');
      if (filter.category && filter.category !== 'all') {
        query = query.eq('category', filter.category);
      }
      if (filter.collection) {
        query = query.contains('collections', [filter.collection]);
      }
      const { data, error } = await query.order('id', { ascending: true });
      if (!error && data && data.length > 0) return data;
    }
    
    // Fallback: LocalStorage / Initial Mock
    let prods = INITIAL_PRODUCTS;
    if (typeof window !== 'undefined') {
      const savedVersion = localStorage.getItem('wanghai_data_version');
      if (savedVersion !== DATA_VERSION) {
        localStorage.setItem('wanghai_products', JSON.stringify(INITIAL_PRODUCTS));
        localStorage.setItem('wanghai_data_version', DATA_VERSION);
        prods = INITIAL_PRODUCTS;
      } else {
        const saved = localStorage.getItem('wanghai_products');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed && parsed.length > 0) prods = parsed;
          } catch (e) {
            console.error(e);
          }
        }
      }
    }

    if (filter.category && filter.category !== 'all') {
      prods = prods.filter(p => p.category === filter.category);
    }
    if (filter.collection) {
      prods = prods.filter(p => p.collections?.includes(filter.collection));
    }

    return prods;
  },

  // Save/Update product
  async saveProduct(product) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('products')
        .upsert(product)
        .select();
      if (!error) return data?.[0] || product;
    }

    if (typeof window !== 'undefined') {
      const current = await this.getProducts();
      const index = current.findIndex(p => p.id === product.id);
      let updated;
      if (index >= 0) {
        updated = [...current];
        updated[index] = { ...updated[index], ...product };
      } else {
        const newProd = {
          ...product,
          id: product.id || `PRD-${Date.now().toString().slice(-4)}`
        };
        updated = [newProd, ...current];
      }
      localStorage.setItem('wanghai_products', JSON.stringify(updated));
      return product;
    }
    return product;
  },

  // Delete product
  async deleteProduct(productId) {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('products').delete().eq('id', productId);
    }
    if (typeof window !== 'undefined') {
      const current = await this.getProducts();
      const updated = current.filter(p => p.id !== productId);
      localStorage.setItem('wanghai_products', JSON.stringify(updated));
    }
    return true;
  },

  // Create order
  async createOrder(orderData) {
    const order = {
      id: `ORD-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
      status: 'pending_payment',
      ...orderData
    };

    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from('orders').insert(order).select();
      if (data?.[0]) return data[0];
    }

    if (typeof window !== 'undefined') {
      const orders = JSON.parse(localStorage.getItem('wanghai_orders') || '[]');
      orders.unshift(order);
      localStorage.setItem('wanghai_orders', JSON.stringify(orders));
    }
    return order;
  },

  // Get orders
  async getOrders() {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (data) return data;
    }

    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('wanghai_orders') || '[]');
    }
    return [];
  },

  // ==========================================
  // 🧠 AI Rules & Q&A Memory Methods
  // ==========================================
  async getAiRules() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('ai_rules').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return data;
      } catch (e) {}
    }

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('wanghai_ai_rules');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.length > 0) return parsed;
        } catch (e) {}
      }
    }
    return INITIAL_AI_RULES;
  },

  async saveAiRule(rule) {
    const newRule = {
      ...rule,
      id: rule.id || `RULE-${Date.now().toString().slice(-4)}`,
      created_at: rule.created_at || new Date().toISOString(),
      is_active: rule.is_active !== undefined ? rule.is_active : true
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data } = await supabase.from('ai_rules').upsert(newRule).select();
        if (data?.[0]) return data[0];
      } catch (e) {}
    }

    if (typeof window !== 'undefined') {
      const current = await this.getAiRules();
      const index = current.findIndex(r => r.id === newRule.id);
      let updated;
      if (index >= 0) {
        updated = [...current];
        updated[index] = { ...updated[index], ...newRule };
      } else {
        updated = [newRule, ...current];
      }
      localStorage.setItem('wanghai_ai_rules', JSON.stringify(updated));
    }
    return newRule;
  },

  async deleteAiRule(ruleId) {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('ai_rules').delete().eq('id', ruleId);
      } catch (e) {}
    }
    if (typeof window !== 'undefined') {
      const current = await this.getAiRules();
      const updated = current.filter(r => r.id !== ruleId);
      localStorage.setItem('wanghai_ai_rules', JSON.stringify(updated));
    }
    return true;
  },

  // ==========================================
  // 📊 Chat Logs & Training Hub Methods
  // ==========================================
  async getChatLogs() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('chat_logs').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return data;
      } catch (e) {}
    }

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('wanghai_chat_logs');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.length > 0) return parsed;
        } catch (e) {}
      }
    }
    return INITIAL_CHAT_LOGS;
  },

  async saveChatLog(logData) {
    const log = {
      id: `LOG-${Date.now().toString().slice(-6)}`,
      created_at: new Date().toISOString(),
      rating: 'unrated',
      admin_correction: '',
      use_for_training: false,
      ...logData
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data } = await supabase.from('chat_logs').insert(log).select();
        if (data?.[0]) return data[0];
      } catch (e) {}
    }

    if (typeof window !== 'undefined') {
      const current = await this.getChatLogs();
      const updated = [log, ...current].slice(0, 100);
      localStorage.setItem('wanghai_chat_logs', JSON.stringify(updated));
    }
    return log;
  },

  async updateChatLog(logId, updates) {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data } = await supabase.from('chat_logs').update(updates).eq('id', logId).select();
        if (data?.[0]) return data[0];
      } catch (e) {}
    }

    if (typeof window !== 'undefined') {
      const current = await this.getChatLogs();
      const index = current.findIndex(l => l.id === logId);
      if (index >= 0) {
        current[index] = { ...current[index], ...updates };
        localStorage.setItem('wanghai_chat_logs', JSON.stringify(current));
        return current[index];
      }
    }
    return null;
  }
};
