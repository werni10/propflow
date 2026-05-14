import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: 'PropFlow — Cinema Props Morocco', template: '%s | PropFlow' },
  description:
    "Morocco's first marketplace for cinema prop rentals. Find furniture, lighting, decor, and vintage props for film productions.",
  keywords: [
    'cinema props',
    'Morocco',
    'film production',
    'prop rental',
    'set decoration',
    'Casablanca',
    'Marrakech',
  ],
  openGraph: {
    siteName: 'PropFlow',
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ background: '#0E0D0C' }}>
      <body style={{ minHeight: '100vh' }}>{children}</body>
    </html>
  );
}
