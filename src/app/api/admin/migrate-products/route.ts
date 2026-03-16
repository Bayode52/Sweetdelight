import { NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export async function POST() {
    const sb = createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Add missing columns to products table
    const migrations = [
        `ALTER TABLE products ADD COLUMN IF NOT EXISTS ingredients text DEFAULT ''`,
        `ALTER TABLE products ADD COLUMN IF NOT EXISTS allergens text DEFAULT ''`,
        `ALTER TABLE products ADD COLUMN IF NOT EXISTS serves text DEFAULT ''`,
        `ALTER TABLE products ADD COLUMN IF NOT EXISTS notice text DEFAULT ''`,
        `ALTER TABLE products ADD COLUMN IF NOT EXISTS badge text DEFAULT ''`,
        `ALTER TABLE products ADD COLUMN IF NOT EXISTS is_available boolean DEFAULT true`,
        `ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false`,
        `ALTER TABLE products ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0`,
        `ALTER TABLE products ADD COLUMN IF NOT EXISTS options jsonb DEFAULT '[]'`,
        `ALTER TABLE products ADD COLUMN IF NOT EXISTS flavours jsonb DEFAULT '[]'`,
        `ALTER TABLE products ADD COLUMN IF NOT EXISTS discount_percent integer DEFAULT 0`,
        `ALTER TABLE products ADD COLUMN IF NOT EXISTS discount_label text DEFAULT ''`,
        `ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_note text DEFAULT ''`,
        `ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now()`,
    ]

    const results = []
    for (const sql of migrations) {
        let error = null
        try {
            const res = await sb.rpc('exec_sql', { sql })
            error = res.error
        } catch (err: any) {
            error = { message: err.message } as any
        }
        results.push({ sql: sql.slice(0, 50), error: error?.message || 'ok' })
    }

    return NextResponse.json({ results })
}
