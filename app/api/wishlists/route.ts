import { getSupabaseAdmin } from '@/lib/supabase';
import { validateAuth } from '@/lib/auth/validate';
import { NextRequest, NextResponse } from 'next/server';

function generateToken(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const id     = searchParams.get('id');
    const token  = searchParams.get('token');

    const db = getSupabaseAdmin();

    // Public view by share_token — no auth required
    if (token) {
      const { data: wishlist, error: wErr } = await db
        .from('wishlists')
        .select('*')
        .eq('share_token', token)
        .eq('is_public', true)
        .single();

      if (wErr || !wishlist) {
        return NextResponse.json({ error: 'Board not found or is private' }, { status: 404 });
      }

      const { data: items, error: iErr } = await db
        .from('wishlist_items')
        .select('*, item:item_id(*)')
        .eq('wishlist_id', wishlist.id)
        .order('added_at', { ascending: false });

      if (iErr) return NextResponse.json({ error: iErr.message }, { status: 400 });

      return NextResponse.json({ ...wishlist, wishlist_items: items ?? [] });
    }

    // Single board by id (with items + item details)
    if (id) {
      const { data: wishlist, error: wErr } = await db
        .from('wishlists')
        .select('*')
        .eq('id', id)
        .single();

      if (wErr || !wishlist) {
        return NextResponse.json({ error: 'Board not found' }, { status: 404 });
      }

      const { data: items, error: iErr } = await db
        .from('wishlist_items')
        .select('*, item:item_id(*)')
        .eq('wishlist_id', id)
        .order('added_at', { ascending: false });

      if (iErr) return NextResponse.json({ error: iErr.message }, { status: 400 });

      return NextResponse.json({ ...wishlist, wishlist_items: items ?? [] });
    }

    // All boards for user with item count
    if (userId) {
      const { data, error } = await db
        .from('wishlists')
        .select('*, wishlist_items(count)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json(data ?? []);
    }

    return NextResponse.json({ error: 'userId, id, or token required' }, { status: 400 });
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
    const { name, description, user_id, is_public } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const share_token = is_public ? generateToken() : null;

    const { data, error } = await getSupabaseAdmin()
      .from('wishlists')
      .insert([{
        user_id: user_id ?? userId,
        name: name.trim(),
        description: description?.trim() ?? null,
        is_public: !!is_public,
        share_token,
      }])
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data, { status: 201 });
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

    const body = await request.json();
    const { id, name, description, is_public } = body;

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const db = getSupabaseAdmin();

    // Verify ownership
    const { data: existing, error: fetchErr } = await db
      .from('wishlists')
      .select('user_id, share_token')
      .eq('id', id)
      .single();

    if (fetchErr || !existing) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    }
    if (existing.user_id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // If turning public and no existing token, generate one
    let share_token = existing.share_token;
    if (is_public && !share_token) {
      share_token = generateToken();
    }

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (name !== undefined)        updates.name        = name.trim();
    if (description !== undefined) updates.description = description?.trim() ?? null;
    if (is_public !== undefined) {
      updates.is_public    = !!is_public;
      updates.share_token  = is_public ? share_token : null;
    }

    const { data, error } = await db
      .from('wishlists')
      .update(updates)
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

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const db = getSupabaseAdmin();

    // Verify ownership
    const { data: existing, error: fetchErr } = await db
      .from('wishlists')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchErr || !existing) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    }
    if (existing.user_id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error } = await db
      .from('wishlists')
      .delete()
      .eq('id', id);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
