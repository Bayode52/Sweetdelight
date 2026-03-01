import { Metadata } from "next";
import { notFound } from "next/navigation";
import { BLOG_POSTS } from "@/lib/blog-data";
import { BlogPostClient } from "./BlogPostClient";

type Props = {
    params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const post = BLOG_POSTS.find((p) => p.slug === params.slug);

    if (!post) {
        return {
            title: "Post Not Found",
        };
    }

    return {
        title: post.title,
        description: post.excerpt,
        openGraph: {
            title: post.title,
            description: post.excerpt,
            type: "article",
            publishedTime: post.date,
            authors: [post.author],
            tags: post.tags,
            images: [
                {
                    url: post.coverImage,
                    width: 1200,
                    height: 630,
                    alt: post.title,
                }
            ]
        },
        twitter: {
            card: "summary_large_image",
            title: post.title,
            description: post.excerpt,
            images: [post.coverImage],
        }
    };
}

// Generate static params so these pages can be built at compile time
export function generateStaticParams() {
    return BLOG_POSTS.map((post) => ({
        slug: post.slug,
    }));
}

export default function BlogPostPage({ params }: Props) {
    const post = BLOG_POSTS.find((p) => p.slug === params.slug);
    if (!post) notFound();

    const related = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 3);

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "BlogPosting",
                        headline: post.title,
                        image: [post.coverImage],
                        datePublished: post.date,
                        dateModified: post.date,
                        author: [{
                            "@type": "Organization",
                            "name": post.author,
                            "url": "https://sweetdelight.co.uk"
                        }]
                    })
                }}
            />
            <BlogPostClient post={post} related={related} />
        </>
    );
}
