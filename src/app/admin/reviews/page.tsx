"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Star, MessageSquareQuote, Check, X, Search, Image as ImageIcon, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/Badge";
import { toast } from "react-hot-toast";

type ReviewStatus = "pending" | "approved" | "rejected" | "featured" | "hidden";

export default function AdminReviewsPage() {
    const queryClient = useQueryClient();
    const [statusFilter, setStatusFilter] = useState<ReviewStatus | "all">("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedReview, setSelectedReview] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ title: "", text: "", rating: 5 });

    const { data: reviews, isLoading } = useQuery({
        queryKey: ["admin-reviews", statusFilter],
        queryFn: async () => {
            let query = supabase
                .from("reviews")
                .select(`
                    *,
                    profiles:user_id(full_name, email),
                    products:product_id(name)
                `)
                .order("created_at", { ascending: false });

            if (statusFilter !== "all") {
                query = query.eq("status", statusFilter);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data;
        }
    });

    const reviewActionMutation = useMutation({
        mutationFn: async ({ id, action, payload }: { id: string, action: string, payload?: any }) => {
            const { data: { user } } = await supabase.auth.getUser();

            const res = await fetch('/api/dev/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id,
                    action,
                    payload,
                    admin_id: user?.id
                })
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Failed to update review");
            }
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
            if (variables.action === "delete") {
                toast.success("Review deleted unconditionally.");
                setSelectedReview(null);
            } else {
                toast.success(`Review ${variables.action.replace(/_/g, " ")} successfully.`);
            }
            setIsEditing(false);
            // Wait for queries to invalidate before closing modal to show updated state? 
            // Better to just let the list update and close modal for some actions, but for edits maybe keep open.
            if (["delete"].includes(variables.action)) {
                setSelectedReview(null);
            } else if (selectedReview && variables.payload) {
                setSelectedReview({ ...selectedReview, ...variables.payload });
            }
        },
        onError: (err: any) => {
            toast.error(err.message || "Failed to perform action");
        }
    });

    const filteredReviews = reviews?.filter(r =>
        r.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.products?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.text?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const stats = {
        total: reviews?.length || 0,
        pending: reviews?.filter(r => r.status === 'pending').length || 0,
        avgRating: reviews?.length ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : "0.0"
    };

    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-black font-playfair text-bakery-primary tracking-tighter">Reviews Management</h1>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Total Reviews", value: stats.total, icon: MessageSquareQuote, color: "text-bakery-primary" },
                    { label: "Pending Approval", value: stats.pending, icon: Search, color: "text-amber-500" },
                    { label: "Average Rating", value: `${stats.avgRating} / 5.0`, icon: Star, color: "text-bakery-cta" },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white p-6 rounded-[32px] luxury-shadow border border-bakery-primary/5">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xs font-black uppercase tracking-widest text-bakery-primary/40 leading-tight w-24">
                                {stat.label}
                            </h3>
                            <div className={`p-3 rounded-2xl bg-bakery-primary/5 ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                        </div>
                        <p className="text-4xl font-black text-bakery-primary tracking-tighter">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Controls */}
            <div className="bg-white p-4 rounded-[32px] luxury-shadow border border-bakery-primary/5 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    {["all", "pending", "approved", "featured", "rejected", "hidden"].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status as any)}
                            className={`px-6 h-12 rounded-2xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${statusFilter === status
                                ? "bg-bakery-primary text-white"
                                : "bg-bakery-primary/5 text-bakery-primary/60 hover:bg-bakery-primary/10"
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-auto">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-bakery-primary/40" size={18} />
                    <input
                        type="text"
                        placeholder="Search reviews..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full md:w-80 h-12 bg-bakery-primary/5 border-none rounded-2xl pl-12 pr-6 font-bold text-bakery-primary placeholder:text-bakery-primary/30"
                    />
                </div>
            </div>

            {/* Reviews List */}
            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-32 bg-white rounded-[32px] animate-pulse" />)}
                </div>
            ) : filteredReviews?.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-[32px] luxury-shadow border border-bakery-primary/5">
                    <MessageSquareQuote size={48} className="mx-auto text-bakery-primary/20 mb-4" />
                    <p className="text-bakery-primary/40 font-bold uppercase tracking-widest">No reviews found</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredReviews?.map((review) => (
                        <div
                            key={review.id}
                            onClick={() => {
                                setSelectedReview(review);
                                setIsEditing(false);
                                setEditData({ title: review.title || "", text: review.text || "", rating: review.rating || 5 });
                            }}
                            className="bg-white p-6 rounded-[32px] luxury-shadow border border-bakery-primary/5 hover:border-bakery-cta/30 transition-all cursor-pointer flex flex-col md:flex-row gap-6 items-start md:items-center"
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <Star key={star} size={14} fill={star <= review.rating ? "#F97316" : "transparent"} className={star <= review.rating ? "text-bakery-cta" : "text-bakery-primary/20"} />
                                        ))}
                                    </div>
                                    <Badge status={review.status === 'approved' ? 'success' : review.status === 'rejected' ? 'error' : review.status === 'featured' ? 'success' : 'pending'}>
                                        {review.status}
                                    </Badge>
                                    {review.media_urls?.length > 0 && (
                                        <div className="bg-bakery-primary/5 text-bakery-primary/60 px-2 py-1 rounded w-fit flex gap-1 items-center">
                                            <ImageIcon size={12} /> {review.media_urls.length}
                                        </div>
                                    )}
                                </div>
                                <h4 className="font-bold text-bakery-primary truncate flex items-center gap-2">
                                    {review.is_pinned && <span className="text-xl" title="Pinned Review">📌</span>}
                                    {review.title || 'No Title'}
                                    {review.admin_edited && <span className="text-[9px] font-black uppercase bg-bakery-primary/5 text-bakery-primary/40 px-2 py-0.5 rounded ml-2">Edited</span>}
                                </h4>
                                <p className="text-sm text-bakery-primary/60 truncate mt-1">{review.text}</p>
                            </div>

                            <div className="shrink-0 text-left md:text-right hidden sm:block">
                                <p className="font-bold text-bakery-primary">{review.profiles?.full_name}</p>
                                <p className="text-xs text-bakery-primary/60">{review.products?.name}</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-bakery-primary/40 mt-2">
                                    {new Date(review.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Review Details Modal */}
            <AnimatePresence>
                {selectedReview && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-bakery-primary/40 backdrop-blur-sm"
                            onClick={() => setSelectedReview(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-2xl bg-white rounded-[40px] luxury-shadow border border-bakery-primary/10 overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="p-8 border-b border-bakery-primary/5 flex justify-between items-start bg-bakery-background">
                                <div>
                                    <h2 className="text-2xl font-black font-playfair text-bakery-primary mb-2">Review Details</h2>
                                    <p className="text-sm text-bakery-primary/60 font-medium">By {selectedReview.profiles?.full_name} ({selectedReview.profiles?.email})</p>
                                </div>
                                <button onClick={() => setSelectedReview(null)} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-bakery-primary hover:bg-bakery-error hover:text-white transition-all shadow-sm">
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="p-8 overflow-y-auto space-y-8">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-widest text-bakery-primary/40 mb-1">Product</p>
                                        <p className="font-bold text-bakery-primary">{selectedReview.products?.name}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-black uppercase tracking-widest text-bakery-primary/40 mb-1">Rating</p>
                                        {isEditing ? (
                                            <div className="flex gap-1 justify-end">
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <Star key={star} size={20}
                                                        fill={star <= editData.rating ? "#F97316" : "transparent"}
                                                        className={`cursor-pointer ${star <= editData.rating ? "text-bakery-cta" : "text-bakery-primary/20 hover:text-bakery-cta"}`}
                                                        onClick={() => setEditData({ ...editData, rating: star })}
                                                    />
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex gap-1 justify-end">
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <Star key={star} size={16} fill={star <= selectedReview.rating ? "#F97316" : "transparent"} className={star <= selectedReview.rating ? "text-bakery-cta" : "text-bakery-primary/20"} />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="text-xs font-black uppercase tracking-widest text-bakery-primary/40">Content {selectedReview.admin_edited && "(Admin Edited)"}</p>
                                        {!isEditing && (
                                            <button onClick={() => setIsEditing(true)} className="text-xs font-bold text-bakery-cta hover:underline">
                                                Edit Content
                                            </button>
                                        )}
                                    </div>
                                    <div className="bg-bakery-primary/5 rounded-3xl p-6 space-y-4">
                                        {isEditing ? (
                                            <>
                                                <input
                                                    type="text"
                                                    value={editData.title}
                                                    onChange={e => setEditData({ ...editData, title: e.target.value })}
                                                    className="w-full bg-white p-3 rounded-xl border border-bakery-primary/10 font-bold text-bakery-primary"
                                                    placeholder="Review Title"
                                                />
                                                <textarea
                                                    value={editData.text}
                                                    onChange={e => setEditData({ ...editData, text: e.target.value })}
                                                    rows={4}
                                                    className="w-full bg-white p-3 rounded-xl border border-bakery-primary/10 text-bakery-primary/70 font-medium"
                                                    placeholder="Review Content"
                                                />
                                                <div className="flex gap-2 justify-end pt-2">
                                                    <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm font-bold text-bakery-primary/60 hover:text-bakery-primary">Cancel</button>
                                                    <button
                                                        onClick={() => {
                                                            reviewActionMutation.mutate({
                                                                id: selectedReview.id,
                                                                action: "edited_content",
                                                                payload: { title: editData.title, text: editData.text, rating: editData.rating, admin_edited: true }
                                                            });
                                                        }}
                                                        className="px-6 py-2 bg-bakery-cta text-white text-sm font-black rounded-xl hover:brightness-110"
                                                    >
                                                        Save Changes
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                {selectedReview.title && <h4 className="font-bold text-bakery-primary text-lg flex items-center gap-2">{selectedReview.is_pinned && "📌"} {selectedReview.title}</h4>}
                                                <p className="text-bakery-primary/70 leading-relaxed font-medium">"{selectedReview.text}"</p>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {selectedReview.media_urls?.length > 0 && (
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-widest text-bakery-primary/40 mb-2">Media Attached</p>
                                        <div className="flex gap-4 overflow-x-auto pb-4">
                                            {selectedReview.media_urls.map((url: string, i: number) => (
                                                <div key={i} className="relative w-32 h-32 rounded-2xl overflow-hidden shrink-0 border border-bakery-primary/10">
                                                    {url.endsWith('.mp4') || url.endsWith('.mov') ? (
                                                        <video src={url} controls className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Image src={url} alt={`Review media ${i + 1}`} fill className="object-cover" />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-8 border-t border-bakery-primary/5 bg-bakery-background flex flex-col gap-4">
                                {/* State Modifiers */}
                                <div className="flex gap-2 flex-wrap pb-4 border-b border-bakery-primary/5">
                                    <p className="w-full text-xs font-black uppercase tracking-widest text-bakery-primary/40">Status & Visiblity Actions</p>

                                    {selectedReview.status !== 'approved' && selectedReview.status !== 'featured' && (
                                        <button onClick={() => reviewActionMutation.mutate({ id: selectedReview.id, action: "status_approved", payload: { status: 'approved' } })} className="flex-1 min-w-[120px] h-12 bg-bakery-cta/10 text-bakery-cta rounded-2xl font-black text-sm hover:bg-bakery-cta hover:text-white transition-all flex items-center justify-center gap-2">
                                            <Check size={16} /> Approve
                                        </button>
                                    )}

                                    {selectedReview.status !== 'featured' && (
                                        <button onClick={() => reviewActionMutation.mutate({ id: selectedReview.id, action: "status_featured", payload: { status: 'featured' } })} className="flex-1 min-w-[120px] h-12 bg-bakery-primary text-white rounded-2xl font-black text-sm hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                                            <Sparkles size={16} /> Feature
                                        </button>
                                    )}

                                    {selectedReview.status !== 'hidden' && (
                                        <button onClick={() => reviewActionMutation.mutate({ id: selectedReview.id, action: "status_hidden", payload: { status: 'hidden' } })} className="flex-1 min-w-[120px] h-12 bg-zinc-200 text-zinc-700 rounded-2xl font-black text-sm hover:bg-zinc-300 transition-all flex items-center justify-center gap-2">
                                            Hold (Hide)
                                        </button>
                                    )}

                                    {selectedReview.status !== 'rejected' && (
                                        <button onClick={() => reviewActionMutation.mutate({ id: selectedReview.id, action: "status_rejected", payload: { status: 'rejected' } })} className="flex-1 min-w-[120px] h-12 bg-bakery-error/10 text-bakery-error rounded-2xl font-black text-sm hover:bg-bakery-error hover:text-white transition-all flex items-center justify-center gap-2">
                                            <X size={16} /> Reject
                                        </button>
                                    )}
                                </div>

                                {/* Danger / Meta Actions */}
                                <div className="flex justify-between items-center pt-2">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => reviewActionMutation.mutate({ id: selectedReview.id, action: selectedReview.is_pinned ? "unpinned" : "pinned", payload: { is_pinned: !selectedReview.is_pinned } })}
                                            className={`h-12 px-6 rounded-2xl font-black text-sm transition-all flex items-center gap-2 ${selectedReview.is_pinned ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-bakery-primary/5 text-bakery-primary/60 hover:bg-bakery-primary/10'}`}
                                        >
                                            📌 {selectedReview.is_pinned ? "Unpin Review" : "Pin Review"}
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => {
                                            if (window.confirm("Are you sure you want to permanently delete this review?")) {
                                                reviewActionMutation.mutate({ id: selectedReview.id, action: "delete" })
                                            }
                                        }}
                                        className="h-12 px-6 text-bakery-error font-bold text-sm hover:underline"
                                    >
                                        Delete Permanently
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
