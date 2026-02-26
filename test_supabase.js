const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function test() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
    const { data, error } = await supabase.from('site_content').select('*').limit(1)
    if (error) {
        console.log('Error code:', error.code)
        console.log('Error message:', error.message)
    } else {
        console.log('Success:', data)
    }
}

test()
