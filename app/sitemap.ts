import { MetadataRoute } from 'next';
import { getSupabaseAdmin } from '@/lib/supabase';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://propflow.ma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${APP_URL}/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${APP_URL}/auth/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${APP_URL}/auth/signup`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  // Dynamic item routes
  try {
    const { data: items } = await getSupabaseAdmin()
      .from('items')
      .select('id, updated_at')
      .eq('status', 'active');

    const itemRoutes: MetadataRoute.Sitemap = (items ?? []).map((item) => ({
      url: `${APP_URL}/items/${item.id}`,
      lastModified: item.updated_at ? new Date(item.updated_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    return [...staticRoutes, ...itemRoutes];
  } catch {
    // If DB is unavailable, fall back to static routes only
    return staticRoutes;
  }
}
