import { getSupabaseAdmin } from '@/lib/supabase';
import type { NextRequest } from 'next/server';

export async function validateAuth(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.slice(7);

  try {
    const { data, error } = await getSupabaseAdmin().auth.getUser(token);
    if (error || !data.user) {
      return null;
    }
    return data.user.id;
  } catch (err) {
    return null;
  }
}
