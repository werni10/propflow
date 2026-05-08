import { getSupabase } from '@/lib/supabase';
import { validateAuth } from '@/lib/auth/validate';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const location = searchParams.get('location');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const id = searchParams.get('id');
    const decoratorId = searchParams.get('decoratorId');

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

    if (decoratorId) query = query.eq('decorator_id', decoratorId);
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
    const userId = await validateAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Auto-create decorator profile if missing
    if (body.decorator_id) {
      await getSupabase()
        .from('decorators')
        .upsert([{ id: body.decorator_id, portfolio_verified: false, average_rating: 0, total_listings: 0, subscription_active: true }], { onConflict: 'id', ignoreDuplicates: true });
    }

    const { data, error } = await getSupabase().from('items').insert([body]).select();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data[0], { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = await validateAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    // Verify ownership
    const { data: existing } = await getSupabase()
      .from('items')
      .select('decorator_id')
      .eq('id', id)
      .single();

    if (!existing || existing.decorator_id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, category, price_per_day, condition, location, deposit_required, deposit_amount } = body;

    const { data, error } = await getSupabase()
      .from('items')
      .update({ title, description, category, price_per_day, condition, location, deposit_required, deposit_amount, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await validateAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    // Verify ownership
    const { data: existing } = await getSupabase()
      .from('items')
      .select('decorator_id')
      .eq('id', id)
      .single();

    if (!existing || existing.decorator_id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error } = await getSupabase().from('items').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
