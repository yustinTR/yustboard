import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/providers/SessionProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Toaster } from 'sonner';

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto',
});

export const metadata: Metadata = {
  title: "YustBoard - Personal Dashboard",
  description: "Your personal dashboard for agenda, banking, routes, weather, and social media.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${roboto.variable} font-sans antialiased`}
      >
        <QueryProvider>
          <SessionProvider>
            {children}
            <Analytics />
            <SpeedInsights />
            <Toaster
              position="bottom-left"
              toastOptions={{
                className: 'shadow-2',
                style: {
                  background: 'var(--card)',
                  color: 'var(--card-foreground)',
                  border: '1px solid var(--border)',
                },
              }}
            />
          </SessionProvider>
        </QueryProvider>
      </body>
    </html>
  );
}