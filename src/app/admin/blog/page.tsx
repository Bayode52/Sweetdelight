"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Edit2, Trash2, Calendar, Eye, EyeOff, AlertCircle } from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";
import BlogEditorModal from "./BlogEditorModal";

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    category: string;
    excerpt: string;
    content: string;
    cover_image: string;
    status: "published" | "draft" | "archived";
    created_at: string;
    updated_at: string;
}

export default function AdminBlog() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [modalOpen, setModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

    const { data: posts = [], isLoading } = useQuery<BlogPost[]>({
        queryKey: ["admin-blog"],
        queryFn: async () => {
            const res = await fetch("/api/admin/blog");
            if (!res.ok) throw new Error("Failed to fetch blog posts");
            const data = await res.json();
            return data.posts;
        }
    });

    const toggleStatus = useMutation({
        mutationFn: async ({ id, status, current }: { id: string; status: string; current: BlogPost }) => {
            const res = await fetch(`/api/admin/blog/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...current, status })
            });
            if (!res.ok) throw new Error("Failed to update status");
            return res.json();
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-blog"] })
    });

    const deletePost = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/admin/blog/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete post");
            return res.json();
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-blog"] })
    });

    const filteredPosts = posts.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "all" || p.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto pb-24">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-playfair font-black text-bakery-primary">Blog Posts</h1>
                    <p className="text-bakery-primary/60 mt-1">Write recipes, bakery news, and behind-the-scenes content.</p>
                </div>
                <button
                    onClick={() => { setEditingPost(null); setModalOpen(true); }}
                    className="bg-bakery-cta text-white px-5 py-2.5 rounded-xl font-black text-sm hover:bg-orange-600 transition-colors flex items-center gap-2 w-fit"
                >
                    <Plus size={18} /> Compose Post
                </button>
            </div>

            <div className="bg-white rounded-3xl border border-bakery-primary/10 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-bakery-primary/5 flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-bakery-primary/40" size={18} />
                        <input
                            type="text"
                            placeholder="Search posts by title..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 bg-bakery-primary/5 rounded-xl border-none focus:ring-2 focus:ring-bakery-cta text-sm font-medium outline-none text-bakery-primary placeholder:text-bakery-primary/40"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-bakery-primary/5 py-2.5 px-4 rounded-xl border-none focus:ring-2 focus:ring-bakery-cta text-sm font-bold text-bakery-primary outline-none min-w-[150px]"
                    >
                        <option value="all">Any Status</option>
                        <option value="published">Published</option>
                        <option value="draft">Drafts</option>
                        <option value="archived">Archived</option>
                    </select>
                </div>

                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="p-12 flex justify-center"><div className="w-8 h-8 border-4 border-bakery-cta border-t-transparent rounded-full animate-spin" /></div>
                    ) : filteredPosts.length === 0 ? (
                        <div className="p-12 text-center flex flex-col items-center">
                            <AlertCircle className="text-bakery-primary/20 mb-3" size={40} />
                            <p className="text-bakery-primary/60 font-bold">No posts found.</p>
                            <button onClick={() => { setEditingPost(null); setModalOpen(true); }} className="mt-4 text-bakery-cta font-bold hover:underline">Write your first post</button>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-bakery-primary/5 text-xs uppercase tracking-widest text-bakery-primary/40 font-black">
                                    <th className="p-4 font-black">Post</th>
                                    <th className="p-4 font-black">Category</th>
                                    <th className="p-4 font-black text-center">Date</th>
                                    <th className="p-4 font-black text-center">Status</th>
                                    <th className="p-4 font-black text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-bakery-primary/5">
                                {filteredPosts.map(p => (
                                    <tr key={p.id} className="hover:bg-bakery-primary/[0.02] transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-4">
                                                <div className="h-14 w-20 rounded-xl bg-bakery-primary/5 relative overflow-hidden shrink-0">
                                                    {p.cover_image ? (
                                                        <Image src={p.cover_image} alt={p.title} fill className="object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-bakery-primary/20"><Calendar size={20} /></div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm text-bakery-primary line-clamp-1 max-w-[300px]">{p.title}</p>
                                                    <a href={`/blog/${p.slug}`} target="_blank" rel="noreferrer" className="text-xs text-bakery-primary/40 hover:text-bakery-cta hover:underline mt-0.5 inline-block">/{p.slug}</a>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm font-bold capitalize text-bakery-primary/70">{p.category}</td>
                                        <td className="p-4 text-center">
                                            <div className="flex flex-col items-center">
                                                <span className="text-sm font-black text-bakery-primary">{format(new Date(p.created_at), "MMM d, yyyy")}</span>
                                                <span className="text-xs text-bakery-primary/40">{format(new Date(p.created_at), "h:mm a")}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`px-3 py-1 text-xs rounded-full font-black uppercase tracking-wider ${p.status === "published" ? "bg-green-100 text-green-700" :
                                                    p.status === "draft" ? "bg-slate-100 text-slate-700" : "bg-amber-100 text-amber-700"
                                                }`}>
                                                {p.status}
                                            </span>
                                            {p.status === "draft" && (
                                                <button onClick={() => toggleStatus.mutate({ id: p.id, status: "published", current: p })} className="block mx-auto mt-2 text-[10px] font-black uppercase text-bakery-cta hover:underline">Publish</button>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => { setEditingPost(p); setModalOpen(true); }}
                                                    className="p-2 text-bakery-primary/40 hover:text-bakery-cta hover:bg-bakery-cta/10 rounded-lg transition-colors"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => { if (window.confirm("Are you sure you want to delete this post? This cannot be undone.")) deletePost.mutate(p.id); }}
                                                    className="p-2 text-bakery-primary/40 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {modalOpen && (
                <BlogEditorModal
                    post={editingPost}
                    onClose={() => setModalOpen(false)}
                    onSuccess={() => { setModalOpen(false); queryClient.invalidateQueries({ queryKey: ["admin-blog"] }); }}
                />
            )}
        </div>
    );
}
