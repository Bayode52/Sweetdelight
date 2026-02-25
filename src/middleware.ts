import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
    const res = NextResponse.next();

    // Auto-refresh Supabase session on every request
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) { return req.cookies.get(name)?.value; },
                set(name: string, value: string, options: Record<string, unknown>) {
                    req.cookies.set(name, value);
                    res.cookies.set({ name, value, ...options });
                },
                remove(name: string, options: Record<string, unknown>) {
                    req.cookies.set(name, '');
                    res.cookies.set({ name, value: '', ...options });
                },
            },
        }
    );
    const { data: { session } } = await supabase.auth.getSession();

    const { pathname } = req.nextUrl;

    // ─── Referral cookie: /ref/[code] ────────────────────────────────
    if (pathname.startsWith('/ref/')) {
        const parts = pathname.split('/');
        const code = parts[2];
        if (code) {
            const nextRes = NextResponse.next();
            nextRes.cookies.set('referral_code', code, {
                maxAge: 60 * 60 * 24 * 30, // 30 days
                path: '/',
                sameSite: 'lax',
            });
            return nextRes;
        }
        return res;
    }

    // ─── Protect /account/* ──────────────────────────────────────────
    if (pathname.startsWith('/account')) {
        if (!session) {
            const loginUrl = new URL('/auth/login', req.url);
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        }
        return res;
    }

    // ─── Protect /admin/* ────────────────────────────────────────────
    if (pathname.startsWith('/admin')) {
        if (!session) {
            return NextResponse.redirect(new URL('/auth/login', req.url));
        }

        // Check user role from profiles table
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

        // In development, temporarily bypass strict admin check for easier testing if requested,
        // but for safety, keep the requirement that they must be logged in.
        // We'll enforce the admin role check.
        if (!profile || profile.role !== 'admin') {
            return NextResponse.redirect(new URL('/', req.url));
        }

        return res;
    }

    return res;
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/account/:path*',
        '/ref/:path*',
    ],
};

