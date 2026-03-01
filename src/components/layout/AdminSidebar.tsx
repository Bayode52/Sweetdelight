"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
    LayoutDashboard,
    Package,
    ShoppingBag,
    Star,
    Users,
    Settings,
    LogOut,
    ChevronRight,
    FileEdit,
    MessageSquare,
    BookOpen,
    Zap,
    BarChart3,
    Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";

const ADMIN_LINKS = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Customers", href: "/admin/customers", icon: Users },
    { name: "Reviews", href: "/admin/reviews", icon: Star },
    { name: "Messages", href: "/admin/messages", icon: MessageSquare },
    { name: "Edit Website", href: "/admin/content", icon: FileEdit },
    { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [userProfile, setUserProfile] = useState<{ full_name: string | null; email: string | null }>({ full_name: null, email: null });

    useEffect(() => {
        async function getProfile() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("full_name, email")
                    .eq("id", user.id)
                    .single();
                if (profile) {
                    setUserProfile({ full_name: profile.full_name, email: profile.email });
                }
            }
        }
        getProfile();
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/auth/login");
    };

    return (
        <aside className="fixed left-0 top-0 h-full w-64 bg-bakery-primary text-white flex flex-col border-r border-white/5 z-40">
            {/* Header */}
            <div className="p-8 pb-6">
                <Link href="/" className="text-2xl font-playfair font-black tracking-tighter block mb-6 uppercase">
                    <span className="text-bakery-cta">Sweet</span> Delight<span className="text-bakery-cta text-xs">.</span>Admin
                </Link>

                <div className="bg-white/5 rounded-2xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-bakery-cta flex items-center justify-center font-bold text-white uppercase shrink-0">
                        {userProfile.full_name?.charAt(0) || "A"}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-bold truncate">{userProfile.full_name || "Admin User"}</p>
                        <span className="inline-block px-2 py-0.5 bg-bakery-cta/20 text-bakery-cta text-[10px] font-black uppercase tracking-widest rounded-full">
                            Admin
                        </span>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-4 space-y-2">
                {ADMIN_LINKS.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={cn(
                                "group flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300",
                                isActive
                                    ? "bg-bakery-cta text-white luxury-shadow"
                                    : "text-white/60 hover:bg-white/5 hover:text-white"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <link.icon size={20} className={cn("transition-transform", isActive ? "scale-110" : "group-hover:scale-110")} />
                                <span className="font-bold text-sm tracking-wide">{link.name}</span>
                            </div>
                            {isActive && <ChevronRight size={16} />}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 mt-auto">
                <Button
                    variant="ghost"
                    fullWidth
                    className="text-white/60 hover:text-white hover:bg-bakery-error/20"
                    onClick={handleSignOut}
                >
                    <LogOut size={18} className="mr-2" />
                    Sign Out
                </Button>
            </div>
        </aside>
    );
}
