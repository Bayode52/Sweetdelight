"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

export default function AdminDebugPage() {
    const [session, setSession] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        async function check() {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                setSession(session);

                if (session?.user) {
                    // Try to fetch from profiles table directly
                    const { data, error } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .single();

                    if (error) {
                        setError(`Profile fetch error: ${error.message}`);
                    } else {
                        setProfile(data);
                    }

                    // Also check the /api/auth/profile route
                    const res = await fetch('/api/auth/profile');
                    const apiData = await res.json();
                    console.log('API Profile Response:', apiData);
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        check();
    }, []);

    if (loading) return <div className="p-10">Loading debug data...</div>;

    return (
        <div className="p-10 space-y-8 max-w-4xl mx-auto font-mono text-sm">
            <h1 className="text-2xl font-bold">Admin Debug Dashboard</h1>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100">
                    <strong>Error:</strong> {error}
                </div>
            )}

            <section className="space-y-2">
                <h2 className="text-lg font-bold">1. Authentication Status</h2>
                <div className="bg-gray-50 p-4 rounded-xl whitespace-pre-wrap overflow-auto">
                    {session ? `Logged in as: ${session.user.email}` : "Not logged in"}
                    <br />
                    User ID: {session?.user?.id || "N/A"}
                </div>
            </section>

            <section className="space-y-2">
                <h2 className="text-lg font-bold">2. Profile Data (Direct Query)</h2>
                <div className="bg-gray-50 p-4 rounded-xl">
                    <pre>{JSON.stringify(profile, null, 2)}</pre>
                </div>
                {profile?.role === 'admin' ? (
                    <div className="text-green-600 font-bold">✅ System recognizes you as ADMIN</div>
                ) : (
                    <div className="text-orange-600 font-bold">⚠️ Role is currently: {profile?.role || 'UNKNOWN'}</div>
                )}
            </section>

            <section className="space-y-2">
                <h2 className="text-lg font-bold">3. Browser Environment</h2>
                <div className="bg-gray-50 p-4 rounded-xl">
                    URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}
                    <br />
                    Anon Key set: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Yes" : "No"}
                </div>
            </section>

            <button
                onClick={() => window.location.reload()}
                className="bg-bakery-cta text-white px-6 py-2 rounded-xl"
            >
                Refresh Check
            </button>
        </div>
    );
}
