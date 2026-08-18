import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import { ApolloWrapper } from '@/components/providers/apollo-wrapper';
import { ReactQueryProvider } from '@/components/providers/react-query-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { AuthProvider } from '@/components/auth/auth-provider';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { SEO } from '@/lib/constants';
import '@/styles/globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-heading',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: SEO.DEFAULT_TITLE,
    template: `%s | ${SEO.DEFAULT_TITLE}`,
  },
  description: SEO.DEFAULT_DESCRIPTION,
  keywords: SEO.DEFAULT_KEYWORDS,
  authors: [
    {
      name: 'TechArena Uganda',
      url: 'https://techarenaug.com',
    },
  ],
  creator: 'TechArena Uganda',
  metadataBase: new URL('https://techarenaug.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://techarenaug.com',
    title: SEO.DEFAULT_TITLE,
    description: SEO.DEFAULT_DESCRIPTION,
    siteName: SEO.DEFAULT_TITLE,
    images: [
      {
        url: SEO.DEFAULT_IMAGE,
        width: 1200,
        height: 630,
        alt: SEO.DEFAULT_TITLE,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SEO.DEFAULT_TITLE,
    description: SEO.DEFAULT_DESCRIPTION,
    images: [SEO.DEFAULT_IMAGE],
    creator: SEO.TWITTER_HANDLE,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  verification: {
    google: 'google-site-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          inter.variable,
          poppins.variable
        )}
      >
        <ThemeProvider>
          <AuthProvider>
            <ReactQueryProvider>
              <ApolloWrapper>
                <div className="relative flex min-h-screen flex-col">
                  <Header />
                  {children}
                  <Footer />
                </div>
                <Toaster />
              </ApolloWrapper>
            </ReactQueryProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}