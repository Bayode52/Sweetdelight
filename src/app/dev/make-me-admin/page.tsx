"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function MakeMeAdminPage() {
    const [status, setStatus] = useState("Idle");

    const handleUpgrade = async () => {
        setStatus("Checking session...");
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            setStatus("Error: You are not logged in.");
            return;
        }

        setStatus("Checking for existing profile...");
        const { data: profile } = await supabase.from("profiles").select("id").eq("id", session.user.id).single();

        setStatus("Attempting to upgrade role...");
        let error = null;

        if (profile) {
            const res = await supabase
                .from("profiles")
                .update({ role: "admin" })
                .eq("id", session.user.id);
            error = res.error;
        } else {
            const res = await supabase
                .from("profiles")
                .insert({
                    id: session.user.id,
                    email: session.user.email,
                    role: "admin",
                    full_name: session.user.user_metadata?.full_name || "Admin"
                });
            error = res.error;
        }

        if (error) {
            setStatus(`Error: Could not upgrade. RLS or DB error: ${error.message}`);
            return;
        }

        // Verify it actually worked
        const { data: checkAdmin } = await supabase.from("profiles").select("role").eq("id", session.user.id).single();
        if (checkAdmin?.role !== "admin") {
            setStatus("Error: DB reported success but role is not admin! Check RLS or triggers.");
            return;
        }

        setStatus("Success! Your role has been upgraded to admin. Redirecting...");
        setTimeout(() => {
            window.location.href = "/admin";
        }, 1000);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-bakery-background text-bakery-primary p-6">
            <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center space-y-6">
                <h1 className="text-2xl font-black font-playfair">Developer Tools</h1>
                <p className="text-bakery-primary/70 mb-4">
                    Click the button below to attempt to upgrade your current account to an Admin.
                </p>

                <button
                    onClick={handleUpgrade}
                    className="w-full bg-bakery-cta text-white font-bold py-3 px-4 rounded-xl hover:brightness-110 transition-all"
                >
                    Make Me Admin
                </button>

                <div className="mt-4 p-4 bg-gray-50 rounded-xl text-sm font-medium border border-gray-100 min-h-[60px] flex items-center justify-center">
                    {status}
                </div>
            </div>
        </div>
    );
}
