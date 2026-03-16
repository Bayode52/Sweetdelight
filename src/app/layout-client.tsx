"use client";

import { usePathname } from "next/navigation";
import { Navbar, AdminSidebar } from "@/components/layout";
import { PWAInstallPrompt } from "@/components/ui/PWAInstallPrompt";
import ChatWidget from "@/components/chat/ChatWidget";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
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
    footerNode,
    settings,
    whatsapp
}: {
    children: React.ReactNode,
    footerNode?: React.ReactNode,
    settings?: Record<string, string>,
    whatsapp?: string
}) {
    const pathname = usePathname();
    const isAdminPage = pathname.startsWith("/admin");

    return (
        <div className={`${playfair.variable} ${outfit.variable} font-outfit`}>
            {isAdminPage ? (
                <div className="flex min-h-screen">
                    <AdminSidebar />
                    <main className="flex-1 md:ml-64 p-4 md:p-8">{children}</main>
                </div>
            ) : (
                <div className="flex flex-col min-h-screen">
                    <Navbar settings={settings} />
                    <main className="flex-1 pt-[68px] min-h-screen flex flex-col">{children}</main>
                    {footerNode}
                    <ChatWidget />
                    <WhatsAppButton phoneNumber={whatsapp} />
                </div>
            )}
            <PWAInstallPrompt />
        </div>
    );
}
