"use client";

import * as React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, Calendar } from "lucide-react";
import { Badge } from "@/components/ui";

const BLOG_POSTS = [
    {
        slug: "what-are-small-chops",
        title: "What Are Small Chops? A Guide to Nigeria's Favourite Party Food",
        category: "Nigerian Food Culture",
        excerpt: "From puff puff to mini spring rolls — small chops are the centrepiece of every Nigerian celebration. Here's everything you need to know.",
        coverImage: "https://images.unsplash.com/photo-1606913084603-3e75fb777da1?auto=format&fit=crop&q=80&w=1200",
        date: "2024-02-10",
        author: "Sweet Delight",
        readTime: "5 min read",
        featured: true,
    },
    {
        slug: "plan-nigerian-party-uk",
        title: "How to Plan the Perfect Nigerian Party in the UK",
        category: "Events & Catering",
        excerpt: "Hosting a naming ceremony, birthday or celebration in the UK? Here's how to get the food right — and make your guests talk about it for years.",
        coverImage: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=800",
        date: "2024-02-05",
        author: "Sweet Delight",
        readTime: "6 min read",
        featured: false,
    },
    {
        slug: "chin-chin-west-africa",
        title: "Chin Chin: The Story of West Africa's Most Loved Snack",
        category: "Nigerian Food Culture",
        excerpt: "Crunchy, golden, slightly sweet — chin chin is the snack that every Nigerian grew up with. We explore its history and why it's winning over British food lovers too.",
        coverImage: "https://images.unsplash.com/photo-1548840410-dd0ad53a5763?auto=format&fit=crop&q=80&w=800",
        date: "2024-01-28",
        author: "Sweet Delight",
        readTime: "4 min read",
        featured: false,
    },
    {
        slug: "order-custom-birthday-cake",
        title: "How to Order a Custom Birthday Cake: Everything You Need to Know",
        category: "Tips & Advice",
        excerpt: "Planning a custom cake? From flavours to timelines to budget — here's what every customer should know before placing their order.",
        coverImage: "https://images.unsplash.com/photo-1564355808539-22fda35bed7e?auto=format&fit=crop&q=80&w=800",
        date: "2024-01-20",
        author: "Sweet Delight",
        readTime: "5 min read",
        featured: false,
    },
];

function BlogCard({ post, large = false }: { post: typeof BLOG_POSTS[0]; large?: boolean }) {
    return (
        <Link href={`/blog/${post.slug}`} className="group block">
            <motion.div
                whileHover={{ y: -6 }}
                className={`bg-white rounded-[32px] overflow-hidden border border-bakery-primary/5 hover:shadow-2xl transition-all duration-300 ${large ? "grid lg:grid-cols-2" : ""}`}
            >
                <div className={`relative overflow-hidden ${large ? "aspect-[4/3]" : "aspect-video"}`}>
                    <Image src={post.coverImage} alt={post.title} fill sizes={large ? "(max-width: 1024px) 100vw, 50vw" : "(max-width: 768px) 100vw, 33vw"} className="object-cover transition-transform duration-700 group-hover:scale-110" />
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
                            <span className="flex items-center gap-1.5"><Calendar size={12} />{new Date(post.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>
                            <span className="flex items-center gap-1.5"><Clock size={12} />{post.readTime}</span>
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
    const featured = BLOG_POSTS.find((p) => p.featured);
    const rest = BLOG_POSTS.filter((p) => !p.featured);

    return (
        <div className="min-h-screen bg-[#FDF6F0] pt-40 pb-24 px-6 md:px-12">
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
                {BLOG_POSTS.length === 0 && (
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
