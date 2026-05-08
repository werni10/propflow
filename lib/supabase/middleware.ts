import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: any[]) {
          cookiesToSet.forEach(({ name, value, options }: any) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session
  const { data: { user }, error } = await supabase.auth.getUser();

  // Route-specific auth checks
  const pathname = request.nextUrl.pathname;

  // Fetch role for protected routes
  let userRole: string | null = null;
  if (user && (pathname.startsWith('/admin') || pathname.startsWith('/decorators/dashboard'))) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
    userRole = profile?.role ?? null;
  }

  if (pathname.startsWith('/admin')) {
    if (!user) return NextResponse.redirect(new URL('/auth/login', request.url));
    if (userRole !== 'admin') return NextResponse.redirect(new URL('/', request.url));
  }

  if (pathname.startsWith('/decorators/dashboard')) {
    if (!user) return NextResponse.redirect(new URL('/auth/login', request.url));
    if (userRole !== 'decorator') return NextResponse.redirect(new URL('/', request.url));
  }

  if (pathname.startsWith('/bookings') || pathname.startsWith('/items/new')) {
    if (!user) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  return response;
}
