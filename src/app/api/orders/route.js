import { NextResponse } from 'next/server';
import { isSupabaseConfigured, supabase } from '../../../lib/supabase';

// GET /api/orders
export async function GET() {
  try {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return NextResponse.json({ success: true, orders: data });
    }

    return NextResponse.json({ success: true, orders: [] });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/orders
export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.customerName || !body.items || body.items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Missing required order data" },
        { status: 400 }
      );
    }

    const order = {
      id: `ORD-${Date.now().toString().slice(-6)}`,
      customer_name: body.customerName,
      customer_phone: body.customerPhone,
      customer_address: body.customerAddress,
      delivery_type: body.deliveryType || 'delivery',
      items: body.items,
      subtotal: body.subtotal,
      delivery_fee: body.deliveryFee || 0,
      total_amount: body.totalAmount,
      payment_method: body.paymentMethod || 'promptpay',
      notes: body.notes || '',
      status: 'pending_payment',
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('orders').insert(order).select();
      if (error) throw error;
      return NextResponse.json({ success: true, order: data[0] });
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
