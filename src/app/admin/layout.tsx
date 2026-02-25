"use client";

import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const router = useRouter();

    useEffect(() => {
        async function checkAdmin() {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push("/login?redirect=/admin");
                return;
            }

            const { data: profile } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", user.id)
                .single();

            if (profile?.role === "admin") {
                setIsAdmin(true);
            } else {
                router.push("/");
            }
        }

        checkAdmin();
    }, [router]);

    if (isAdmin === null) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-[#FFF8F0]">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#FFF8F0]">
            <AdminSidebar />
            <main className="flex-1 ml-64 min-h-screen">
                {children}
            </main>
        </div>
    );
}
