import { CartDrawer } from "@/components/layout";
import { Providers } from "@/components/Providers";
import { Metadata, Viewport } from "next";
import { Toaster } from "react-hot-toast";
import LayoutClient from "./layout-client";
import { getSettings, getContent } from "@/lib/settings";
import Footer from "@/components/layout/Footer";
import "./globals.css";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://sweetdelight-eta.vercel.app"),
  title: {
    default: 'Sweet Delites | cakesnmore',
    template: '%s | Sweet Delites'
  },
  description: 'Premium Nigerian pastries — celebration cakes, small chops, puff puff & more. Handcrafted fresh, delivered UK-wide.',
  keywords: ['Nigerian pastry', 'celebration cakes', 'small chops', 'puff puff', 'UK bakery'],
  openGraph: {
    title: 'Sweet Delites | cakesnmore',
    description: 'Premium Nigerian pastries delivered UK-wide',
    type: 'website',
    locale: "en_GB",
    siteName: "Sweet Delites",
    images: [{ url: "/og-image.jpg" }],
  },
  authors: [{ name: "Sweet Delites" }],
  creator: "Sweet Delites",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Sweet Delites",
  },
  formatDetection: {
    telephone: false,
  },
  twitter: {
    card: "summary_large_image",
    title: "Sweet Delites",
    description: "Order fresh handmade cakes and Nigerian pastries online.",
  },
  icons: {
    apple: "/icon-192.png",
  },
  alternates: {
    canonical: "/",
  }
};

export const viewport: Viewport = {
  themeColor: "#3D1A0F",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSettings();
  const siteContent = await getContent('footer');
  const whatsapp = siteContent?.footer?.contact?.whatsapp || '447000000000';
  return (
    <html lang="en" style={{ scrollBehavior: 'smooth' }}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Bakery",
              "name": "Sweet Delites",
              "image": "https://sweetdelight-eta.vercel.app/og-image.jpg",
              "description": "Order fresh handmade cakes, chin chin, small chops and pastries online. Nationwide UK delivery.",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "London",
                "addressCountry": "UK"
              },
              "priceRange": "££",
              "url": "https://sweetdelight-eta.vercel.app"
            })
          }}
        />
      </head>
      <body className="antialiased bg-bakery-background text-bakery-primary">
        <Providers>
          <LayoutClient footerNode={<Footer />} settings={settings} whatsapp={whatsapp}>{children}</LayoutClient>
          <CartDrawer />
          <Toaster position="bottom-right" />
        </Providers>
      </body>
    </html>
  );
}
