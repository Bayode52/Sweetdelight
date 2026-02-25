"use client";

import * as React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Calendar, Clock, Share2, Copy } from "lucide-react";
import { Badge } from "@/components/ui";
import toast from "react-hot-toast";
import { notFound } from "next/navigation";

function renderMarkdown(content: string) {
    return content
        .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-playfair font-black text-bakery-primary mt-10 mb-4">$1</h2>')
        .replace(/^### (.+)$/gm, '<h3 class="text-xl font-bold text-bakery-primary mt-6 mb-3">$1</h3>')
        .replace(/\*\*(.+?)\*\*/g, '<strong class="font-black text-bakery-primary">$1</strong>')
        .replace(/^- (.+)$/gm, '<li class="text-bakery-primary/70 ml-4 list-disc">$1</li>')
        .replace(/(<li.*<\/li>\n?)+/g, '<ul class="space-y-1 my-4">$&</ul>')
        .replace(/\| (.+) \|/g, '<tr class="border-b border-bakery-primary/10"><td class="py-2 px-4 text-sm">$1</td></tr>')
        .replace(/^(\d+)\. (.+)$/gm, '<li class="text-bakery-primary/70 ml-4 list-decimal">$2</li>')
        .replace(/\n\n([^<\n][^\n]+)\n\n/g, '\n\n<p class="text-bakery-primary/70 leading-relaxed text-lg mb-4">$1</p>\n\n')
        .trim();
}

type Post = {
    slug: string; title: string; category: string; excerpt: string; coverImage: string;
    date: string; author: string; readTime: string; tags: string[]; content: string;
};

export function BlogPostClient({ post, related }: { post: Post, related: Post[] }) {
    const copyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied!", { icon: "🔗" });
    };

    return (
        <div className="min-h-screen bg-[#FDF6F0] pt-24">
            <div className="relative h-[55vh] overflow-hidden">
                <Image src={post.coverImage} alt={post.title} fill className="object-cover" sizes="100vw" priority />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-bakery-primary/80" />
            </div>

            <div className="max-w-3xl mx-auto px-6 md:px-12 -mt-32 relative z-10">
                <div className="bg-white rounded-[48px] p-10 luxury-shadow border border-bakery-primary/5 space-y-6 mb-12">
                    <Link href="/blog" className="inline-flex items-center gap-2 text-bakery-cta font-black text-xs uppercase tracking-widest hover:gap-3 transition-all">
                        <ArrowLeft size={14} /> Back to Blog
                    </Link>

                    <Badge variant="highlight">{post.category}</Badge>

                    <h1 className="text-3xl md:text-4xl font-playfair font-black text-bakery-primary leading-tight">{post.title}</h1>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-bakery-primary/40 font-bold border-t border-bakery-primary/5 pt-4">
                        <span className="flex items-center gap-1.5"><Calendar size={12} />{new Date(post.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>
                        <span className="flex items-center gap-1.5"><Clock size={12} />{post.readTime}</span>
                        <span>By {post.author}</span>
                    </div>
                </div>

                <motion.article
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    className="prose-content space-y-2 bg-white rounded-[48px] p-10 border border-bakery-primary/5 luxury-shadow mb-12"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
                />

                <div className="bg-white rounded-[32px] p-8 border border-bakery-primary/5 luxury-shadow mb-12 space-y-6">
                    <div className="flex flex-wrap gap-2">
                        {post.tags.map((t) => (
                            <span key={t} className="px-3 py-1.5 bg-bakery-primary/5 text-bakery-primary/60 text-xs font-bold rounded-full border border-bakery-primary/10">#{t}</span>
                        ))}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 border-t border-bakery-primary/5 pt-4">
                        <span className="text-xs font-black uppercase tracking-widest text-bakery-primary/40 flex items-center gap-2"><Share2 size={12} /> Share</span>
                        <a href={`https://wa.me/?text=${encodeURIComponent(post.title + " - " + (typeof window !== "undefined" ? window.location.href : ""))}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-green-500 text-white text-xs font-black rounded-xl hover:bg-green-600 transition-colors">
                            📱 WhatsApp
                        </a>
                        <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-blue-600 text-white text-xs font-black rounded-xl hover:bg-blue-700 transition-colors">
                            Facebook
                        </a>
                        <button onClick={copyLink} className="px-4 py-2 bg-bakery-primary/5 text-bakery-primary/60 text-xs font-black rounded-xl hover:bg-bakery-primary/10 transition-colors flex items-center gap-1.5">
                            <Copy size={12} /> Copy Link
                        </button>
                    </div>
                </div>

                <div className="bg-bakery-primary rounded-[40px] p-10 text-white text-center space-y-4 mb-12">
                    <div className="text-3xl">🧁</div>
                    <h3 className="text-2xl font-playfair font-black">Inspired by this post?</h3>
                    <p className="text-white/60">Browse our menu and taste the real thing.</p>
                    <Link href="/menu" className="inline-flex items-center gap-2 bg-bakery-cta text-white font-black px-6 py-3 rounded-2xl hover:brightness-110 transition-all text-sm uppercase tracking-widest">
                        Order Now →
                    </Link>
                </div>

                {related.length > 0 && (
                    <div className="space-y-6 mb-16">
                        <h3 className="text-2xl font-playfair font-black text-bakery-primary">You might also enjoy</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {related.map((rel) => (
                                <Link key={rel.slug} href={`/blog/${rel.slug}`} className="group block">
                                    <div className="bg-white rounded-3xl overflow-hidden border border-bakery-primary/5 hover:shadow-xl transition-all duration-300">
                                        <div className="relative aspect-video overflow-hidden">
                                            <Image src={rel.coverImage} alt={rel.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                        <div className="p-5 space-y-2">
                                            <Badge variant="highlight">{rel.category}</Badge>
                                            <h4 className="font-bold text-bakery-primary text-sm leading-snug line-clamp-2 group-hover:text-bakery-cta transition-colors">{rel.title}</h4>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
