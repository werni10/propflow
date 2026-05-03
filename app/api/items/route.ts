import { getSupabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const location = searchParams.get('location');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const id = searchParams.get('id');

    if (id) {
      const { data, error } = await getSupabase()
        .from('items')
        .select('*, decorators:decorator_id(*)')
        .eq('id', id)
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json(data);
    }

    let query = getSupabase().from('items').select('*, decorators:decorator_id(*)');

    if (category) query = query.eq('category', category);
    if (location) query = query.ilike('location', `%${location}%`);
    if (minPrice) query = query.gte('price_per_day', parseFloat(minPrice));
    if (maxPrice) query = query.lte('price_per_day', parseFloat(maxPrice));

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await getSupabase().from('items').insert([body]).select();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data[0], { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
