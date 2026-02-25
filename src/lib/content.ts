"use server"

import { createServerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export type ContentMap = Record<string, string>

export async function getContent(page: string): Promise<ContentMap> {
    const cookieStore = cookies()

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) { return cookieStore.get(name)?.value; },
                set(name: string, value: string, options: Record<string, unknown>) {
                    cookieStore.set({ name, value, ...options });
                },
                remove(name: string, options: Record<string, unknown>) {
                    cookieStore.set({ name, value: '', ...options });
                },
            },
        }
    )

    const { data, error } = await supabase
        .from('site_content')
        .select('section, field, value')
        .eq('page', page)

    if (error) {
        console.error('Error fetching content for page:', page, error)
        return {}
    }

    const contentMap: ContentMap = {}
    if (data) {
        data.forEach((item: { section: string; field: string; value: string | null }) => {
            const key = `${item.section}.${item.field}`
            if (item.value !== null && item.value !== undefined) {
                contentMap[key] = item.value
            }
        })
    }

    return contentMap
}

export async function updateContent(page: string, section: string, field: string, value: string): Promise<void> {
    const cookieStore = cookies()

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) { return cookieStore.get(name)?.value; },
                set(name: string, val: string, options: Record<string, unknown>) {
                    cookieStore.set({ name, value: val, ...options });
                },
                remove(name: string, options: Record<string, unknown>) {
                    cookieStore.set({ name, value: '', ...options });
                },
            },
        }
    )

    const { error } = await supabase
        .from('site_content')
        .upsert({
            page,
            section,
            field,
            value,
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'page,section,field'
        })

    if (error) {
        console.error(`Error updating content ${page}.${section}.${field}:`, error)
        throw new Error('Failed to update content')
    }
}
