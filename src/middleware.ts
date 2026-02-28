import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Protect /account
    if (!user && request.nextUrl.pathname.startsWith('/account')) {
        const url = request.nextUrl.clone()
        url.pathname = '/auth/login'
        url.searchParams.set('redirect', request.nextUrl.pathname)
        return NextResponse.redirect(url)
    }

    // Protect /admin
    if (request.nextUrl.pathname.startsWith('/admin')) {
        if (!user) {
            const url = request.nextUrl.clone()
            url.pathname = '/auth/login'
            url.searchParams.set('redirect', '/admin')
            return NextResponse.redirect(url)
        }

        // Try service role first (fastest, bypasses RLS)
        let profile;
        if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
            const serviceSupabase = createServerClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!,
                {
                    cookies: {
                        getAll() { return [] },
                        setAll() { },
                    },
                }
            )
            const { data: serviceProfile } = await serviceSupabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()
            profile = serviceProfile;
        }

        // Fallback to regular client if service role failed or key missing
        if (!profile) {
            const { data: regularProfile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()
            profile = regularProfile;
        }

        if (profile?.role !== 'admin') {
            const url = request.nextUrl.clone()
            url.pathname = '/'
            return NextResponse.redirect(url)
        }
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
