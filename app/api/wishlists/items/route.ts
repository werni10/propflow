import { getSupabaseAdmin } from '@/lib/supabase';
import { validateAuth } from '@/lib/auth/validate';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const userId = await validateAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { wishlist_id, item_id, notes } = body;

    if (!wishlist_id || !item_id) {
      return NextResponse.json({ error: 'wishlist_id and item_id are required' }, { status: 400 });
    }

    const db = getSupabaseAdmin();

    // Verify wishlist belongs to user
    const { data: wishlist, error: wErr } = await db
      .from('wishlists')
      .select('user_id')
      .eq('id', wishlist_id)
      .single();

    if (wErr || !wishlist) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    }
    if (wishlist.user_id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data, error } = await db
      .from('wishlist_items')
      .insert([{
        wishlist_id,
        item_id,
        notes: notes?.trim() ?? null,
      }])
      .select()
      .single();

    if (error) {
      // Handle duplicate (unique constraint)
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Prop already saved to this board' }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data, { status: 201 });
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
    const wishlist_id = searchParams.get('wishlist_id');
    const item_id     = searchParams.get('item_id');

    if (!wishlist_id || !item_id) {
      return NextResponse.json({ error: 'wishlist_id and item_id are required' }, { status: 400 });
    }

    const db = getSupabaseAdmin();

    // Verify wishlist belongs to user
    const { data: wishlist, error: wErr } = await db
      .from('wishlists')
      .select('user_id')
      .eq('id', wishlist_id)
      .single();

    if (wErr || !wishlist) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    }
    if (wishlist.user_id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error } = await db
      .from('wishlist_items')
      .delete()
      .eq('wishlist_id', wishlist_id)
      .eq('item_id', item_id);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
