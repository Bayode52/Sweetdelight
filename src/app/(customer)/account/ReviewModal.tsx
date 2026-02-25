"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { X, Upload, Star, Loader2, Video } from "lucide-react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { toast } from "react-hot-toast";

interface OrderItem {
    id: string;
    product_id: string;
    product_name: string;
    product_image: string;
}

interface ReviewModalProps {
    orderId: string;
    items: OrderItem[];
    onClose: () => void;
    onSuccess: () => void;
}

export function ReviewModal({ orderId, items, onClose, onSuccess }: ReviewModalProps) {
    const [selectedProductId, setSelectedProductId] = useState<string>(items[0]?.product_id || "");
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [title, setTitle] = useState("");
    const [text, setText] = useState("");
    const [files, setFiles] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const droppedFiles = Array.from(e.dataTransfer.files);
        validateAndSetFiles(droppedFiles);
    };

    const validateAndSetFiles = (newFiles: File[]) => {
        const videoCount = newFiles.filter(f => f.type.startsWith('video/')).length;
        const currentVideoCount = files.filter(f => f.type.startsWith('video/')).length;

        if (videoCount + currentVideoCount > 1) {
            toast.error("Maximum 1 video allowed");
            return;
        }

        const totalFiles = files.length + newFiles.length;
        if (totalFiles > 3) {
            toast.error("Maximum 3 media files allowed");
            return;
        }

        setFiles(prev => [...prev, ...newFiles]);
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!rating) return toast.error("Please provide a rating");
        if (text.length < 20) return toast.error("Review must be at least 20 characters");
        if (selectedProductId === "") return toast.error("Please select a product");

        setIsSubmitting(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("Not logged in");

            const timestamp = Date.now();
            const mediaUrls: string[] = [];

            // Upload files
            for (const file of files) {
                const path = `${session.user.id}/${timestamp}/${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

                const res = await fetch('/api/reviews/upload', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ path })
                });

                if (!res.ok) throw new Error("Failed to get upload URL");
                const { signedUrl, publicUrl } = await res.json();

                const uploadRes = await fetch(signedUrl, {
                    method: 'PUT',
                    body: file,
                    headers: { 'Content-Type': file.type }
                });

                if (!uploadRes.ok) throw new Error("Failed to upload media");
                mediaUrls.push(publicUrl);
            }

            // Submit review
            const reviewRes = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId,
                    productId: selectedProductId,
                    rating,
                    title,
                    text,
                    mediaUrls
                })
            });

            if (!reviewRes.ok) throw new Error("Failed to submit review");

            toast.success("Thank you! Your review is awaiting approval ✅");
            onSuccess();
        } catch (e: unknown) {
            toast.error((e as Error).message || "Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-bakery-primary/40 backdrop-blur-sm"
                onClick={onClose}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-2xl bg-white rounded-[40px] luxury-shadow border border-bakery-primary/10 overflow-hidden flex flex-col max-h-[90vh]"
            >
                <div className="p-8 border-b border-bakery-primary/10 flex justify-between items-center bg-bakery-background">
                    <div>
                        <h2 className="font-playfair font-black text-3xl text-bakery-primary">Leave a Review</h2>
                        <p className="text-sm font-bold text-bakery-primary/40 uppercase tracking-widest mt-1">Order #{orderId.slice(0, 8).toUpperCase()}</p>
                    </div>
                    <button onClick={onClose} className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-bakery-primary hover:bg-bakery-error hover:text-white transition-all shadow-sm">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 overflow-y-auto space-y-8">
                    {/* Product Selector */}
                    <div>
                        <label className="text-xs font-black uppercase tracking-widest text-bakery-primary/40 block mb-3">Which product are you reviewing?</label>
                        <div className="grid grid-cols-2 gap-4">
                            {items.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setSelectedProductId(item.product_id)}
                                    className={`p-4 rounded-2xl border-2 text-left transition-all flex items-center gap-4 ${selectedProductId === item.product_id
                                        ? 'border-bakery-cta bg-bakery-cta/5'
                                        : 'border-bakery-primary/5 hover:border-bakery-cta/30'
                                        }`}
                                >
                                    <div className="w-12 h-12 bg-bakery-primary/5 rounded-xl overflow-hidden relative shrink-0">
                                        <Image src={item.product_image || '/placeholder.jpg'} alt={item.product_name} fill className="object-cover" />
                                    </div>
                                    <p className="font-bold text-bakery-primary text-sm line-clamp-2">{item.product_name}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Star Rating */}
                    <div>
                        <label className="text-xs font-black uppercase tracking-widest text-bakery-primary/40 block mb-3">Rate your experience</label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button
                                    key={star}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    onClick={() => setRating(star)}
                                    className="p-2 transition-transform hover:scale-110"
                                >
                                    <Star
                                        size={40}
                                        fill={(hoverRating || rating) >= star ? '#F97316' : 'transparent'}
                                        className={(hoverRating || rating) >= star ? 'text-bakery-cta' : 'text-bakery-primary/20'}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Review Title & Text */}
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-black uppercase tracking-widest text-bakery-primary/40 block mb-2">Review Title (Optional)</label>
                            <input
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="w-full h-14 bg-bakery-primary/5 border-none rounded-2xl px-6 font-bold"
                                placeholder="Summarize your experience..."
                            />
                        </div>
                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <label className="text-xs font-black uppercase tracking-widest text-bakery-primary/40 block">Your Review</label>
                                <span className={`text-xs font-black ${(text.length < 20 || text.length > 1000) ? 'text-bakery-error' : 'text-bakery-primary/40'}`}>
                                    {text.length}/1000
                                </span>
                            </div>
                            <textarea
                                value={text}
                                onChange={e => setText(e.target.value)}
                                className="w-full h-32 bg-bakery-primary/5 border-none rounded-2xl p-6 font-bold resize-none"
                                placeholder="What did you love? Would you recommend it?"
                            />
                            {text.length > 0 && text.length < 20 && (
                                <p className="text-xs text-bakery-error mt-2 font-bold flex items-center gap-1">Please write at least 20 characters.</p>
                            )}
                        </div>
                    </div>

                    {/* Media Upload */}
                    <div>
                        <div className="flex justify-between items-end mb-3">
                            <label className="text-xs font-black uppercase tracking-widest text-bakery-primary/40 block">Photos / Video (Optional)</label>
                            <span className="text-xs font-bold text-bakery-primary/40">Max 3 files (1 video)</span>
                        </div>

                        <div
                            onDragOver={e => e.preventDefault()}
                            onDrop={handleFileDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-bakery-primary/10 rounded-3xl p-8 text-center cursor-pointer hover:border-bakery-cta hover:bg-bakery-cta/5 transition-all group"
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                multiple
                                accept="image/*,video/mp4,video/quicktime"
                                onChange={e => e.target.files && validateAndSetFiles(Array.from(e.target.files))}
                            />
                            <div className="w-16 h-16 bg-bakery-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform text-bakery-cta">
                                <Upload size={24} />
                            </div>
                            <p className="font-bold text-bakery-primary">Click or drag media here</p>
                            <p className="text-sm font-medium text-bakery-primary/50 mt-1">Upload pictures or a short video of your treats!</p>
                        </div>

                        {files.length > 0 && (
                            <div className="flex gap-4 mt-4 overflow-x-auto pb-2">
                                {files.map((file, i) => (
                                    <div key={i} className="relative w-24 h-24 rounded-2xl overflow-hidden shrink-0 border border-bakery-primary/10">
                                        {file.type.startsWith('video/') ? (
                                            <div className="w-full h-full bg-bakery-primary/5 flex items-center justify-center text-bakery-primary/40">
                                                <Video size={24} />
                                            </div>
                                        ) : (
                                            <Image src={URL.createObjectURL(file)} alt="Preview" fill className="object-cover" />
                                        )}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                                            className="absolute top-1 right-1 w-6 h-6 bg-bakery-error text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-8 border-t border-bakery-primary/10 bg-bakery-background flex gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 h-14 bg-white text-bakery-primary rounded-2xl font-black text-sm hover:bg-bakery-primary/5 transition-all luxury-shadow border border-bakery-primary/5"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !rating || text.length < 20 || text.length > 1000 || !selectedProductId}
                        className="flex-[2] h-14 bg-bakery-cta text-white rounded-2xl font-black text-sm hover:scale-[1.02] transition-all luxury-shadow-sm disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <><Loader2 size={18} className="animate-spin" /> Submitting...</>
                        ) : (
                            "Submit Review"
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
