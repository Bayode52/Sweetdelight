import { createClient } from '@/lib/supabase/server'

export async function getSettings(): Promise<Record<string, string>> {
    const supabase = await createClient()
    const { data } = await supabase
        .from('site_settings')
        .select('key, value')

    const settings: Record<string, string> = {}
    data?.forEach(row => {
        settings[row.key] = row.value || ''
    })
    return settings
}

export async function getContent(page?: string): Promise<any> {
    const supabase = await createClient()
    let query = supabase.from('site_content').select('page, section, field, value')

    if (page) {
        query = query.eq('page', page)
    }

    const { data } = await query

    // Return a nested structure: { [page]: { [section]: { [field]: value } } }
    const content: any = {}
    data?.forEach(row => {
        if (!content[row.page]) content[row.page] = {}
        if (!content[row.page][row.section]) content[row.page][row.section] = {}
        content[row.page][row.section][row.field] = row.value
    })

    return content
}
