"use client";

import * as React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, Calendar } from "lucide-react";
import { Badge } from "@/components/ui";

import { useQuery } from "@tanstack/react-query";

interface Post {
    id: string;
    slug: string;
    title: string;
    category: string;
    excerpt: string;
    cover_image: string;
    published_at: string;
    author: string;
    read_time?: string;
    featured?: boolean;
}

function BlogCard({ post, large = false }: { post: Post; large?: boolean }) {
    return (
        <Link href={`/blog/${post.slug}`} className="group block">
            <motion.div
                whileHover={{ y: -6 }}
                className={`bg-white rounded-[32px] overflow-hidden border border-bakery-primary/5 hover:shadow-2xl transition-all duration-300 ${large ? "grid lg:grid-cols-2" : ""}`}
            >
                <div className={`relative overflow-hidden ${large ? "aspect-[4/3]" : "aspect-video"}`}>
                    <Image src={post.cover_image} alt={post.title} fill sizes={large ? "(max-width: 1024px) 100vw, 50vw" : "(max-width: 768px) 100vw, 33vw"} className="object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                </div>
                <div className={`p-6 flex flex-col justify-between space-y-4 ${large ? "md:p-10" : ""}`}>
                    <div className="space-y-3">
                        <Badge variant="highlight">{post.category}</Badge>
                        <h2 className={`font-playfair font-black text-bakery-primary group-hover:text-bakery-cta transition-colors leading-tight ${large ? "text-2xl md:text-3xl" : "text-lg"}`}>
                            {post.title}
                        </h2>
                        <p className="text-bakery-primary/60 text-sm leading-relaxed line-clamp-3">{post.excerpt}</p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-bakery-primary/5">
                        <div className="flex items-center gap-4 text-xs text-bakery-primary/40 font-bold">
                            <span className="flex items-center gap-1.5"><Calendar size={12} />{new Date(post.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>
                            <span className="flex items-center gap-1.5"><Clock size={12} />{post.read_time || '5 min read'}</span>
                        </div>
                        <span className="text-bakery-cta font-black text-xs uppercase tracking-widest flex items-center gap-1.5 group-hover:gap-3 transition-all">
                            Read More <ArrowRight size={12} />
                        </span>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
}

export default function BlogPage() {
    const { data: postsRes = { posts: [] }, isLoading } = useQuery<{ posts: Post[] }>({
        queryKey: ["blog-posts"],
        queryFn: async () => {
            const res = await fetch("/api/blog");
            if (!res.ok) throw new Error("Failed to fetch posts");
            return res.json();
        }
    });

    const posts = postsRes.posts;
    const featured = posts.find((p) => p.featured) || posts[0];
    const rest = posts.filter((p) => p.id !== featured?.id);

    return (
        <div className="min-h-screen bg-[#FDF6F0] pt-20 pb-24 px-6 md:px-12">
            <div className="max-w-7xl mx-auto space-y-16">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-center space-y-4">
                    <Badge variant="highlight">Journal</Badge>
                    <h1 className="text-5xl md:text-7xl font-playfair font-black text-bakery-primary tracking-tighter">
                        Sweet <span className="text-bakery-cta italic">Reads</span>
                    </h1>
                    <p className="text-bakery-primary/60 max-w-xl mx-auto font-medium text-lg">
                        Tips, recipes, culture and everything Nigerian baking.
                    </p>
                </motion.div>

                {/* Featured post */}
                {featured && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
                        <BlogCard post={featured} large />
                    </motion.div>
                )}

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {rest.map((post, i) => (
                        <motion.div key={post.slug} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 * i }}>
                            <BlogCard post={post} />
                        </motion.div>
                    ))}
                </div>

                {/* Empty state */}
                {!isLoading && posts.length === 0 && (
                    <div className="py-24 text-center space-y-4">
                        <div className="text-6xl">📝</div>
                        <h3 className="text-2xl font-bold text-bakery-primary">No posts yet</h3>
                        <p className="text-bakery-primary/50">Check back soon — we&apos;re cooking up some great articles!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
