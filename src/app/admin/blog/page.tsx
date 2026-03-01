"use client";

import { useEffect, useState } from "react";
import {
    Plus,
    Search,
    Filter,
    MoreVertical,
    Edit2,
    Trash2,
    Eye,
    CheckCircle2,
    Clock,
    FileText,
    ChevronRight,
    ArrowLeft,
    Save,
    X,
    Image as ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

type BlogPost = {
    id: string;
    title: string;
    slug: string;
    category: string;
    excerpt: string;
    content: string;
    cover_image: string;
    status: "published" | "draft" | "archived";
    created_at: string;
    published_at?: string;
};

export default function BlogAdminPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<Partial<BlogPost> | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/blog");
            const data = await res.json();
            if (res.ok) setPosts(data.posts || []);
        } catch (error) {
            toast.error("Failed to load posts");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingPost({
            title: "",
            category: "News",
            status: "draft",
            excerpt: "",
            content: "",
            cover_image: ""
        });
        setIsEditorOpen(true);
    };

    const handleEdit = (post: BlogPost) => {
        setEditingPost(post);
        setIsEditorOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this post?")) return;
        try {
            const res = await fetch(`/api/admin/blog/${id}`, { method: "DELETE" });
            if (res.ok) {
                toast.success("Post deleted");
                fetchPosts();
            }
        } catch (error) {
            toast.error("Failed to delete post");
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPost?.title) return toast.error("Title is required");

        setIsSaving(true);
        try {
            const isNew = !editingPost.id;
            const url = isNew ? "/api/admin/blog" : `/api/admin/blog/${editingPost.id}`;
            const method = isNew ? "POST" : "PATCH";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editingPost)
            });

            if (res.ok) {
                toast.success(isNew ? "Post created" : "Post updated");
                setIsEditorOpen(false);
                fetchPosts();
            } else {
                const err = await res.json();
                toast.error(err.error || "Save failed");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setIsSaving(false);
        }
    };

    const filteredPosts = posts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === "all" || post.status === filter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="p-8 max-w-7xl mx-auto font-inter">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-4xl font-black font-playfair tracking-tight text-bakery-primary mb-2">
                        Blog Content <span className="text-bakery-cta">CMS</span>
                    </h1>
                    <p className="text-bakery-primary/60 font-medium">Manage your stories, recipes, and bakery news.</p>
                </div>
                <Button
                    onClick={handleCreate}
                    className="bg-bakery-cta text-white hover:bg-bakery-cta/90 h-12 px-6 rounded-2xl luxury-shadow flex items-center gap-2"
                >
                    <Plus size={20} /> New Post
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-bakery-primary/30" size={18} />
                    <input
                        type="text"
                        placeholder="Search post titles..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-white border border-bakery-primary/5 rounded-2xl outline-none focus:ring-4 focus:ring-bakery-cta/5 focus:border-bakery-cta/20 transition-all font-medium"
                    />
                </div>
                <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-bakery-primary/5 shadow-sm">
                    {["all", "published", "draft"].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                "px-5 py-2.5 rounded-xl text-sm font-bold capitalize transition-all",
                                filter === f ? "bg-bakery-cta text-white shadow-md" : "text-bakery-primary/40 hover:text-bakery-primary"
                            )}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Posts Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-[400px] bg-white rounded-3xl animate-pulse border border-bakery-primary/5" />
                    ))}
                </div>
            ) : filteredPosts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPosts.map(post => (
                        <motion.div
                            layout
                            key={post.id}
                            className="group bg-white rounded-3xl overflow-hidden border border-bakery-primary/5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                        >
                            <div className="relative h-48 bg-bakery-primary/5 overflow-hidden">
                                {post.cover_image ? (
                                    <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-bakery-primary/10">
                                        <FileText size={48} />
                                    </div>
                                )}
                                <div className="absolute top-4 right-4 flex gap-2">
                                    <span className={cn(
                                        "px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md shadow-sm border",
                                        post.status === 'published'
                                            ? "bg-green-500/80 text-white border-white/20"
                                            : "bg-orange-500/80 text-white border-white/20"
                                    )}>
                                        {post.status}
                                    </span>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-[10px] font-black text-bakery-cta uppercase tracking-tighter bg-bakery-cta/10 px-2 py-0.5 rounded-md">
                                        {post.category}
                                    </span>
                                    <span className="text-[10px] font-bold text-bakery-primary/30 flex items-center gap-1">
                                        <Clock size={10} /> {new Date(post.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <h3 className="text-xl font-black font-playfair text-bakery-primary mb-3 line-clamp-2 leading-tight">
                                    {post.title}
                                </h3>
                                <p className="text-sm text-bakery-primary/50 line-clamp-2 mb-6 font-medium leading-relaxed">
                                    {post.excerpt || "No excerpt provided."}
                                </p>
                                <div className="flex items-center justify-between pt-4 border-t border-bakery-primary/5">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => handleEdit(post)}
                                            className="p-2.5 rounded-xl bg-bakery-primary/5 text-bakery-primary/60 hover:bg-bakery-cta hover:text-white transition-all shadow-sm"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(post.id)}
                                            className="p-2.5 rounded-xl bg-bakery-primary/5 text-bakery-primary/60 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <a
                                        href={`/blog/${post.slug}`}
                                        target="_blank"
                                        className="text-xs font-black text-bakery-primary/40 hover:text-bakery-cta flex items-center gap-1.5 transition-colors"
                                    >
                                        VIEW POST <Eye size={14} />
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-bakery-primary/10">
                    <div className="w-16 h-16 bg-bakery-primary/5 rounded-full flex items-center justify-center mx-auto mb-4 text-bakery-primary/20">
                        <FileText size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-bakery-primary mb-2">No posts found</h3>
                    <p className="text-bakery-primary/40 font-medium">Try a different search or create your first story.</p>
                </div>
            )}

            {/* Editor Sidebar/Overlay */}
            <AnimatePresence>
                {isEditorOpen && (
                    <div className="fixed inset-0 z-[100] flex justify-end">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsEditorOpen(false)}
                            className="absolute inset-0 bg-bakery-primary/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col"
                        >
                            {/* Editor Header */}
                            <div className="p-6 border-b border-bakery-primary/5 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setIsEditorOpen(false)} className="p-2.5 rounded-xl hover:bg-bakery-primary/5 transition-colors">
                                        <ArrowLeft size={20} />
                                    </button>
                                    <h2 className="text-2xl font-black font-playfair">{editingPost?.id ? "Edit Post" : "Compose Fresh"}</h2>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Button
                                        variant="ghost"
                                        onClick={() => setIsEditorOpen(false)}
                                        className="text-xs font-bold text-bakery-primary/40 hover:text-bakery-primary"
                                    >
                                        Discard
                                    </Button>
                                    <Button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="bg-bakery-cta text-white px-6 rounded-xl font-bold h-11 flex items-center gap-2 luxury-shadow"
                                    >
                                        {isSaving ? "Saving..." : <><Save size={18} /> Save Changes</>}
                                    </Button>
                                </div>
                            </div>

                            {/* Editor Content */}
                            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-xs font-black uppercase tracking-widest text-bakery-primary/40 mb-3 block">Post Title</label>
                                        <input
                                            type="text"
                                            value={editingPost?.title}
                                            onChange={e => setEditingPost({ ...editingPost, title: e.target.value })}
                                            placeholder="The secret to the perfect Nigerian Puff Puff..."
                                            className="w-full text-2xl font-black font-playfair border-b-2 border-bakery-primary/5 focus:border-bakery-cta outline-none pb-4 placeholder:text-bakery-primary/10 transition-colors"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-xs font-black uppercase tracking-widest text-bakery-primary/40 mb-3 block">Category</label>
                                            <select
                                                value={editingPost?.category}
                                                onChange={e => setEditingPost({ ...editingPost, category: e.target.value })}
                                                className="w-full p-4 bg-bakery-primary/5 rounded-2xl border-none outline-none font-bold text-sm transition-all focus:ring-4 focus:ring-bakery-cta/5 appearance-none"
                                            >
                                                <option>News</option>
                                                <option>Recipes</option>
                                                <option>Tips</option>
                                                <option>Events</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-black uppercase tracking-widest text-bakery-primary/40 mb-3 block">Publish Status</label>
                                            <div className="flex items-center gap-2 bg-bakery-primary/5 p-1 rounded-2xl">
                                                {['draft', 'published'].map(s => (
                                                    <button
                                                        key={s}
                                                        onClick={() => setEditingPost({ ...editingPost, status: s as any })}
                                                        className={cn(
                                                            "flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                                                            editingPost?.status === s ? "bg-white text-bakery-cta shadow-sm" : "text-bakery-primary/30"
                                                        )}
                                                    >
                                                        {s}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-black uppercase tracking-widest text-bakery-primary/40 mb-3 block">Cover Image URL</label>
                                        <div className="relative group">
                                            <ImageIcon className="absolute left-4 top-4 text-bakery-primary/30" size={18} />
                                            <input
                                                type="text"
                                                value={editingPost?.cover_image}
                                                onChange={e => setEditingPost({ ...editingPost, cover_image: e.target.value })}
                                                placeholder="https://..."
                                                className="w-full pl-12 pr-4 py-4 bg-bakery-primary/5 rounded-2xl border-none outline-none font-medium text-sm transition-all focus:ring-4 focus:ring-bakery-cta/5"
                                            />
                                        </div>
                                        {editingPost?.cover_image && (
                                            <div className="mt-4 h-40 rounded-2xl overflow-hidden border border-bakery-primary/5 bg-bakery-primary/5">
                                                <img src={editingPost.cover_image} className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="text-xs font-black uppercase tracking-widest text-bakery-primary/40 mb-3 block">Excerpt (Short Summary)</label>
                                        <textarea
                                            rows={2}
                                            value={editingPost?.excerpt}
                                            onChange={e => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                                            className="w-full p-5 bg-bakery-primary/5 rounded-3xl border-none outline-none font-medium text-sm transition-all focus:ring-4 focus:ring-bakery-cta/5 resize-none leading-relaxed"
                                            placeholder="A short hook for the social cards..."
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-black uppercase tracking-widest text-bakery-primary/40 mb-3 block">Story Content</label>
                                        <textarea
                                            rows={12}
                                            value={editingPost?.content}
                                            onChange={e => setEditingPost({ ...editingPost, content: e.target.value })}
                                            className="w-full p-6 bg-bakery-primary/5 rounded-[40px] border-none outline-none font-medium text-base transition-all focus:ring-4 focus:ring-bakery-cta/5 resize-none leading-relaxed custom-scrollbar"
                                            placeholder="Write your beautiful story here..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(44, 24, 16, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(212, 66, 26, 0.2);
                }
            `}</style>
        </div>
    );
}
