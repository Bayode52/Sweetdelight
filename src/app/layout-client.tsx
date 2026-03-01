"use client";

import { usePathname } from "next/navigation";
import { Navbar, Footer, AdminSidebar } from "@/components/layout";
import { PWAInstallPrompt } from "@/components/ui/PWAInstallPrompt";
import ChatWidget from "@/components/chat/ChatWidget";
import { Playfair_Display, Outfit } from "next/font/google";
import { ContentMap } from "@/lib/content";

const playfair = Playfair_Display({
    subsets: ["latin"],
    variable: "--font-playfair",
});

const outfit = Outfit({
    subsets: ["latin"],
    variable: "--font-outfit",
});

export default function LayoutClient({
    children,
    footerContent,
    settings
}: {
    children: React.ReactNode,
    footerContent?: ContentMap,
    settings?: Record<string, string>
}) {
    const pathname = usePathname();
    const isAdminPage = pathname.startsWith("/admin");

    return (
        <div className={`${playfair.variable} ${outfit.variable} font-outfit`}>
            {isAdminPage ? (
                <div className="flex min-h-screen">
                    <AdminSidebar />
                    <main className="flex-1 ml-64 p-8">{children}</main>
                </div>
            ) : (
                <div className="flex flex-col min-h-screen">
                    <Navbar settings={settings} />
                    <main className="flex-1 pt-[72px]">{children}</main>
                    <Footer content={footerContent} settings={settings} />
                    <ChatWidget />
                </div>
            )}
            <PWAInstallPrompt />
        </div>
    );
}
