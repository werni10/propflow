import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PropFlow — Cinema Prop Rental, Morocco",
  description: "Morocco's premier marketplace for cinema prop rentals. Connect set decorators with filmmakers.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ background: '#0E0D0C' }}>
      <body style={{ minHeight: '100vh' }}>{children}</body>
    </html>
  );
}
