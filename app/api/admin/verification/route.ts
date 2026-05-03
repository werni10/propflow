import { getSupabase, getSupabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('verification_queue')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { verification_id, user_id, approved, reviewed_by } = body;

    // Update verification queue
    const { error: updateError } = await supabase
      .from('verification_queue')
      .update({
        status: approved ? 'approved' : 'rejected',
        reviewed_by,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', verification_id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    // Update user status
    if (approved) {
      const { error: userError } = await supabase
        .from('users')
        .update({ status: 'verified' })
        .eq('id', user_id);

      if (userError) {
        return NextResponse.json({ error: userError.message }, { status: 400 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
