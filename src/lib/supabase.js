import { createClient } from '@supabase/supabase-js';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_COLLECTIONS } from '../data/mockProducts.js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('https://'));

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const DATA_VERSION = 'v2.1_retro_snacks';

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
        // Upgrade / Refresh mock data with new snacks & collections
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
  }
};
