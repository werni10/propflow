'use client';

import { supabase } from '@/lib/supabase';
import { User } from '@/lib/types';

export async function signUp(
  email: string,
  password: string,
  name: string,
  role: 'decorator' | 'renter'
): Promise<{ user: User | null; error: string | null }> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role },
      },
    });

    if (error) return { user: null, error: error.message };

    // Create user profile
    if (data.user) {
      const { error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id: data.user.id,
            email,
            name,
            role,
            status: 'unverified',
          },
        ]);

      if (profileError) return { user: null, error: profileError.message };

      return {
        user: {
          id: data.user.id,
          email,
          name,
          role,
          status: 'unverified',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        error: null,
      };
    }

    return { user: null, error: 'Unknown error' };
  } catch (err) {
    return { user: null, error: String(err) };
  }
}

export async function signIn(
  email: string,
  password: string
): Promise<{ user: User | null; error: string | null }> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return { user: null, error: error.message };

    if (data.user) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (userError) return { user: null, error: userError.message };

      return { user: userData as User, error: null };
    }

    return { user: null, error: 'Unknown error' };
  } catch (err) {
    return { user: null, error: String(err) };
  }
}

export async function signInWithGoogle() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Google sign-in error:', err);
    throw err;
  }
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (userError) return null;
    return userData as User;
  } catch {
    return null;
  }
}
