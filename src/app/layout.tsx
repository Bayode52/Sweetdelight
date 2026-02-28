import { CartDrawer } from "@/components/layout";
import { Providers } from "@/components/Providers";
import { Metadata, Viewport } from "next";
import { Toaster } from "react-hot-toast";
import LayoutClient from "./layout-client";
import { getSettings } from "@/lib/settings";
import { getContent } from "@/lib/content";
import "./globals.css";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://cravebakery.co.uk"),
  title: {
    template: "%s | Crave Bakery — Fresh Nigerian Pastries in the UK",
    default: "Fresh Handcrafted Cakes & Pastries | Crave Bakery UK",
  },
  description: "Order fresh handmade cakes, chin chin, small chops and pastries online. Nationwide UK delivery. Crave Bakery — Nigerian soul, baked in the UK.",
  keywords: ["Bakery", "Nigerian Pastries", "Cakes UK", "Chin Chin", "Small Chops", "Fresh Baked Daily", "London Bakery"],
  authors: [{ name: "Crave Bakery" }],
  creator: "Crave Bakery",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Crave Bakery",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: "Crave Bakery",
    images: [{ url: "/og-image.jpg" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Crave Bakery",
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
  const footerContent = await getContent("footer");
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Bakery",
              "name": "Crave Bakery",
              "image": "https://cravebakery.co.uk/og-image.jpg",
              "description": "Order fresh handmade cakes, chin chin, small chops and pastries online. Nationwide UK delivery.",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "London",
                "addressCountry": "UK"
              },
              "priceRange": "££",
              "url": "https://cravebakery.co.uk"
            })
          }}
        />
      </head>
      <body className="antialiased bg-bakery-background text-bakery-primary">
        <Providers>
          <LayoutClient footerContent={footerContent} settings={settings}>{children}</LayoutClient>
          <CartDrawer />
          <Toaster position="bottom-right" />
        </Providers>
      </body>
    </html>
  );
}
