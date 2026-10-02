import { NextResponse } from 'next/server';
import { INITIAL_PRODUCTS } from '../../../data/mockProducts';
import { isSupabaseConfigured, supabase } from '../../../lib/supabase';

// GET /api/products?category=otop&search=กล้วย
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const limit = Number(searchParams.get('limit')) || 50;

  try {
    let products = INITIAL_PRODUCTS;

    if (isSupabaseConfigured && supabase) {
      let query = supabase.from('products').select('*');
      if (category && category !== 'all') {
        query = query.eq('category', category);
      }
      if (search) {
        query = query.ilike('name', `%${search}%`);
      }
      const { data, error } = await query.limit(limit);
      if (!error && data && data.length > 0) {
        products = data;
      }
    } else {
      if (category && category !== 'all') {
        products = products.filter(p => p.category === category);
      }
      if (search) {
        products = products.filter(p => 
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.description?.toLowerCase().includes(search.toLowerCase())
        );
      }
    }

    return NextResponse.json({
      success: true,
      store: "ร้านค้าสวัสดิการ กองทุนหมู่บ้านวังไฮ",
      count: products.length,
      products: products
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/products (Add or update product)
export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.name || !body.price) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (name, price)" },
        { status: 400 }
      );
    }

    const product = {
      id: body.id || `WH-${Date.now().toString().slice(-4)}`,
      name: body.name,
      category: body.category || 'seasoning',
      categoryName: body.categoryName || 'ทั่วไป',
      price: Number(body.price),
      unit: body.unit || 'ชิ้น',
      stock: Number(body.stock || 0),
      description: body.description || '',
      image: body.image || '',
      isCommunityProduct: Boolean(body.isCommunityProduct),
      isFeatured: Boolean(body.isFeatured),
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('products').upsert(product).select();
      if (error) throw error;
      return NextResponse.json({ success: true, product: data[0] });
    }

    return NextResponse.json({ success: true, product });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
