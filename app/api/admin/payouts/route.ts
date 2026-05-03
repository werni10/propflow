import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';
    const month = searchParams.get('month');

    let query = supabase
      .from('payouts')
      .select('*, decorators:decorator_id(users:id(name, email))')
      .eq('status', status);

    if (month) {
      const startDate = new Date(month);
      const endDate = new Date(month);
      endDate.setMonth(endDate.getMonth() + 1);

      query = query
        .gte('period_start', startDate.toISOString().split('T')[0])
        .lt('period_end', endDate.toISOString().split('T')[0]);
    }

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
    const { decorator_id, amount, period_start, period_end } = body;

    const { data, error } = await supabase
      .from('payouts')
      .insert([
        {
          decorator_id,
          amount,
          period_start,
          period_end,
          status: 'pending',
        },
      ])
      .select();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data[0], { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
