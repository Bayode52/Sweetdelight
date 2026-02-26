import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/auth-helpers-nextjs';

// Simple in-memory rate limiting for the middleware instance
const rateLimitMap = new Map<string, { count: number, reset: number }>();
const RATE_LIMIT_THRESHOLD = 100; // requests per minute
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

export async function middleware(req: NextRequest) {
    const res = NextResponse.next();

    // Auto-refresh Supabase session on every request
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return req.cookies.getAll(); },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
                    cookiesToSet.forEach(({ name, value, options }) => res.cookies.set({ name, value, ...options }));
                },
            },
        }
    );
    const { data: { session } } = await supabase.auth.getSession();

    const { pathname } = req.nextUrl;
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';

    // ─── Rate Limiting ───────────────────────────────────────────────
    const now = Date.now();
    const rateData = rateLimitMap.get(ip) || { count: 0, reset: now + RATE_LIMIT_WINDOW };

    if (now > rateData.reset) {
        rateData.count = 1;
        rateData.reset = now + RATE_LIMIT_WINDOW;
    } else {
        rateData.count++;
    }
    rateLimitMap.set(ip, rateData);

    if (rateData.count > RATE_LIMIT_THRESHOLD) {
        return new NextResponse('Too Many Requests', { status: 429 });
    }

    // ─── Bot Protection (Honeypot) ──────────────────────────────────
    // If it's a POST request and has a "honeypot" field that's filled, it's a bot
    if (req.method === 'POST' && !pathname.startsWith('/api/security/log')) {
        const contentType = req.headers.get('content-type') || '';
        if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
            const formData = await req.clone().formData();
            if (formData.get('hp_field')) { // Our hidden honeypot field name
                // Log the bot event silently via the internal API
                await fetch(`${req.nextUrl.origin}/api/security/log`, {
                    method: 'POST',
                    body: JSON.stringify({
                        event_type: 'bot_detection',
                        severity: 'high',
                        description: `Honeypot triggered by ${ip}`,
                        metadata: { path: pathname, ip }
                    })
                }).catch(() => { });

                return new NextResponse('Bot detected', { status: 403 });
            }
        }
    }


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

        // Check Store Status (is_live)
        const { data: settings } = await supabase.from('settings').select('is_live').single();

        // If not live, only allow admins
        if (settings && !settings.is_live && profile?.role !== 'admin' && !pathname.startsWith('/maintenance') && !pathname.startsWith('/auth') && !pathname.startsWith('/_next') && !pathname.startsWith('/api')) {
            return NextResponse.redirect(new URL('/maintenance', req.url));
        }

        if (!profile || profile.role !== 'admin') {
            return NextResponse.redirect(new URL('/', req.url));
        }

        return res;
    }

    // ─── Maintenance Mode for Public Routes ──────────────────────────
    const publicPaths = ['/', '/menu', '/about', '/contact'];
    if (publicPaths.some(p => pathname === p || pathname.startsWith(p + '/'))) {
        const { data: settings } = await supabase.from('settings').select('is_live').single();
        if (settings && !settings.is_live) {
            // Check if logged in user is admin
            let isAdmin = false;
            if (session) {
                const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
                isAdmin = profile?.role === 'admin';
            }
            if (!isAdmin) {
                return NextResponse.redirect(new URL('/maintenance', req.url));
            }
        }
    }

    return res;

    return res;
}

export const config = {
    matcher: [
        '/',
        '/menu/:path*',
        '/about/:path*',
        '/contact/:path*',
        '/admin/:path*',
        '/account/:path*',
        '/ref/:path*',
    ],
};

