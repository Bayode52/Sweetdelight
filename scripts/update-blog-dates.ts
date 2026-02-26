import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log('Fetching blog posts...');
    const { data: posts, error } = await supabase.from('blog_posts').select('*');
    if (error) {
        console.error('Error fetching posts:', error);
        return;
    }

    console.log(`Found ${posts.length} posts`);

    for (const post of posts) {
        let updates: any = {};
        if (post.created_at) {
            const date = new Date(post.created_at);
            date.setFullYear(date.getFullYear() + 1);
            updates.created_at = date.toISOString();
        }
        if (post.published_at) {
            const date = new Date(post.published_at);
            date.setFullYear(date.getFullYear() + 1);
            updates.published_at = date.toISOString();
        }

        if (Object.keys(updates).length > 0) {
            const { error: updateError } = await supabase
                .from('blog_posts')
                .update(updates)
                .eq('id', post.id);

            if (updateError) {
                console.error(`Error updating post ${post.id}:`, updateError);
            } else {
                console.log(`Updated post ${post.id} dates to ${updates.created_at} / ${updates.published_at}`);
            }
        }
    }
    console.log('Update complete.');
}

main();
