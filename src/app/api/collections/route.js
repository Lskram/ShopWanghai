import { NextResponse } from 'next/server';
import { INITIAL_COLLECTIONS } from '../../../data/mockProducts';
import { isSupabaseConfigured, supabase } from '../../../lib/supabase';

// GET /api/collections
export async function GET() {
  try {
    let collections = INITIAL_COLLECTIONS;

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('collections').select('*');
      if (!error && data && data.length > 0) {
        collections = data;
      }
    }

    return NextResponse.json({
      success: true,
      count: collections.length,
      collections: collections
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
