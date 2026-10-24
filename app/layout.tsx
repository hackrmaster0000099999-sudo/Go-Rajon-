import type { Metadata } from 'next';
import { Inter, Hind_Siliguri } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getCategories, getSiteSettings } from '@/lib/data';
import { generateWebSiteSchema } from '@/lib/seo';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const hindSiliguri = Hind_Siliguri({
  weight: ['400', '500', '600', '700'],
  subsets: ['bengali'],
  display: 'swap',
  variable: '--font-bengali',
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://gorajon.site'),
    title: {
      default: settings.default_seo_title,
      template: `%s | ${settings.site_name}`,
    },
    description: settings.default_meta_description,
    openGraph: {
      title: settings.default_seo_title,
      description: settings.default_meta_description,
      siteName: settings.site_name,
      locale: 'en_US',
      type: 'website',
      images: settings.default_og_image ? [{ url: settings.default_og_image }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: settings.default_seo_title,
      description: settings.default_meta_description,
      images: settings.default_og_image ? [settings.default_og_image] : [],
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
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [categories, settings] = await Promise.all([
    getCategories({ includeCounts: false }),
    getSiteSettings(),
  ]);

  const webSiteJsonLd = generateWebSiteSchema(settings);

  return (
    <html lang="en" className={`${inter.variable} ${hindSiliguri.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-stone-50/30 text-stone-900 font-sans antialiased selection:bg-stone-900 selection:text-white flex flex-col justify-between" suppressHydrationWarning>
        <div>
          <Navbar categories={categories} siteName={settings.site_name} />
          {children}
        </div>
        <Footer
          categories={categories}
          siteName={settings.site_name}
          siteDescription={settings.site_description}
        />
      </body>
    </html>
  );
}
