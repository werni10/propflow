import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/account', '/decorators/dashboard', '/decorators/bookings', '/decorators/earnings', '/decorators/profile'],
      },
    ],
    sitemap: `${process.env.NEXT_PUBLIC_APP_URL || 'https://propflow-gamma-nine.vercel.app'}/sitemap.xml`,
  };
}
