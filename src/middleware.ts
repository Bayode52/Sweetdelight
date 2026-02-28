import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Simple in-memory rate limiting for the middleware instance
const rateLimitMap = new Map<string, { count: number, reset: number }>();
const RATE_LIMIT_THRESHOLD = 100; // requests per minute
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({ request })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return request.cookies.getAll() },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value))
                    response = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options))
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()
    const path = request.nextUrl.pathname
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

    // ─── Ban Enforcement ─────────────────────────────────────────────
    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('banned, is_bot')
            .eq('id', user.id)
            .single();

        if (profile?.banned) {
            return NextResponse.redirect(new URL('/banned', request.url));
        }
    }

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

    // ─── Referral handling ───────────────────────────────────────────
    if (path.startsWith('/ref/')) {
        const parts = path.split('/');
        const code = parts[2];
        if (code) {
            const nextRes = NextResponse.next({ request });
            nextRes.cookies.set('referral_code', code, {
                maxAge: 60 * 60 * 24 * 30, // 30 days
                path: '/',
                sameSite: 'lax',
            });
            return nextRes;
        }
    }

    // Protect /account routes — must be logged in
    if (path.startsWith('/account') && !user) {
        const loginUrl = new URL('/auth/login', request.url)
        loginUrl.searchParams.set('redirect', path)
        return NextResponse.redirect(loginUrl)
    }

    if (path.startsWith('/admin')) {
        if (!user) {
            return NextResponse.redirect(
                new URL('/auth/login?redirect=/admin', request.url)
            )
        }

        // Use service role key to bypass RLS for middleware check
        const adminSupabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                cookies: {
                    getAll() { return request.cookies.getAll() },
                    setAll() { },
                },
            }
        )

        const { data: profile } = await adminSupabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile?.role !== 'admin') {
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    return response
}

export const config = {
    matcher: [
        '/',
        '/menu/:path*',
        '/about/:path*',
        '/contact/:path*',
        '/admin/:path*',
        '/account/:path*',
        '/checkout/:path*',
        '/api/reviews/:path*',
        '/api/orders/:path*',
        '/ref/:path*',
    ]
}

