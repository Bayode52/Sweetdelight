"use client";

import React, { useState, useRef } from "react";
import { StarRating } from "@/components/ui/StarRating";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { UploadCloud, X, Film, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import Image from "next/image";

interface Product {
    id: string;
    name: string;
}

interface ReviewFormProps {
    userId: string;
    orderId: string;
    products: Product[];
    preselectProductId?: string;
    onSuccess?: () => void;
    onCancel?: () => void;
}

type FileWithPreview = File & { preview: string };

export default function ReviewForm({
    userId,
    orderId,
    products,
    preselectProductId,
    onSuccess,
    onCancel,
}: ReviewFormProps) {
    const [productId, setProductId] = useState(preselectProductId || products[0]?.id || "");
    const [rating, setRating] = useState(0);
    const [title, setTitle] = useState("");
    const [text, setText] = useState("");
    const [files, setFiles] = useState<FileWithPreview[]>([]);

    const [isDragging, setIsDragging] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Character counters
    const titleLeft = 100 - title.length;
    const textLeft = 1000 - text.length;
    const isTextValid = text.length >= 20 && text.length <= 1000;

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const validateAndAddFiles = (newFiles: File[]) => {
        let currentPhotos = files.filter(f => f.type.startsWith("image/")).length;
        let currentVideos = files.filter(f => f.type.startsWith("video/")).length;

        const validFiles: FileWithPreview[] = [];

        for (const file of newFiles) {
            const isImage = file.type.startsWith("image/");
            const isVideo = file.type.startsWith("video/");

            if (isImage) {
                if (file.size > 5 * 1024 * 1024) {
                    toast.error(`Image ${file.name} exceeds 5MB limit`);
                    continue;
                }
                if (currentVideos > 0) {
                    toast.error("Cannot mix photos and videos (Max 1 video OR 3 photos)");
                    continue;
                }
                if (currentPhotos >= 3) {
                    toast.error("Maximum 3 photos allowed");
                    continue;
                }
                currentPhotos++;
            } else if (isVideo) {
                if (file.size > 50 * 1024 * 1024) {
                    toast.error(`Video ${file.name} exceeds 50MB limit`);
                    continue;
                }
                if (currentPhotos > 0 || currentVideos > 0) {
                    toast.error("Only 1 video allowed, and cannot mix with photos");
                    continue;
                }
                currentVideos++;
            } else {
                toast.error("Unsupported file type. Use JPG, PNG, WEBP, MP4, or MOV");
                continue;
            }

            validFiles.push(Object.assign(file, { preview: URL.createObjectURL(file) }));
        }

        setFiles(prev => [...prev, ...validFiles]);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            validateAndAddFiles(Array.from(e.dataTransfer.files));
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            validateAndAddFiles(Array.from(e.target.files));
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => {
            const newFiles = [...prev];
            URL.revokeObjectURL(newFiles[index].preview);
            newFiles.splice(index, 1);
            return newFiles;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (rating === 0) {
            toast.error("Please provide a star rating");
            return;
        }
        if (!productId) {
            toast.error("Please select a product");
            return;
        }
        if (!isTextValid) {
            toast.error("Review text must be between 20 and 1000 characters");
            return;
        }

        setIsSubmitting(true);

        try {
            const uploadedUrls: string[] = [];
            const timestamp = Date.now();

            // 1. Upload files
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const ext = file.name.split('.').pop();
                const path = `${userId}/${timestamp}_${i}.${ext}`;

                // Set initial progress
                setUploadProgress(prev => ({ ...prev, [file.name]: 10 }));

                // Get signed upload URL
                const signedRes = await fetch('/api/upload', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ path, contentType: file.type })
                });

                if (!signedRes.ok) throw new Error("Failed to get upload URL");
                const { signedUrl } = await signedRes.json();

                // Upload direct to Supabase Storage
                const uploadRes = await fetch(signedUrl, {
                    method: 'PUT',
                    headers: { 'Content-Type': file.type },
                    body: file
                });

                if (!uploadRes.ok) throw new Error(`Failed to upload ${file.name}`);

                setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));

                // Get public URL
                const { data } = supabase.storage.from('reviews').getPublicUrl(path);
                uploadedUrls.push(data.publicUrl);
            }

            // 2. Save review to database
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    orderId,
                    productId,
                    rating,
                    title: title.trim(),
                    text: text.trim(),
                    mediaUrls: uploadedUrls,
                    status: 'pending'
                })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to submit review");
            }

            setIsSuccess(true);
            toast.success("Review submitted successfully!");

        } catch (error: unknown) {
            toast.error((error as Error).message || "An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl border border-gray-100 shadow-sm text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-500">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2 font-serif">Thank You!</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Your review has been submitted successfully and is currently awaiting approval from our moderation team.
                </p>
                <Button onClick={onSuccess || onCancel} size="lg" className="w-full sm:w-auto">
                    Back to My Account
                </Button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 font-serif">Write a Review</h3>

            <div className="space-y-6">
                {/* Product Selector */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Which product are you reviewing?</label>
                    <select
                        value={productId}
                        onChange={(e) => setProductId(e.target.value)}
                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all bg-white"
                        required
                    >
                        <option value="" disabled>Select a product...</option>
                        {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>

                {/* Rating */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        Your Rating <span className="text-red-500">*</span>
                    </label>
                    <StarRating
                        rating={rating}
                        onChange={setRating}
                        interactive={true}
                        size="lg"
                    />
                </div>

                {/* Title */}
                <div className="space-y-2">
                    <div className="flex justify-between items-end">
                        <label className="text-sm font-semibold text-gray-700">Review Title (Optional)</label>
                        <span className={`text-xs ${titleLeft < 10 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                            {titleLeft}
                        </span>
                    </div>
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value.slice(0, 100))}
                        placeholder="Sum up your experience in a short sentence"
                        className="w-full"
                    />
                </div>

                {/* Text */}
                <div className="space-y-2">
                    <div className="flex justify-between items-end">
                        <label className="text-sm font-semibold text-gray-700">
                            Your Review <span className="text-red-500">*</span>
                        </label>
                        <span className={`text-xs ${text.length < 20 ? 'text-orange-500' : textLeft < 50 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                            {text.length < 20 ? `Min 20 chars (${text.length}/20)` : `${textLeft} remaining`}
                        </span>
                    </div>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value.slice(0, 1000))}
                        placeholder="What did you love about it? Was it as expected?..."
                        className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all min-h-[120px] resize-y"
                        required
                    />
                </div>

                {/* Media Upload */}
                <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-700">
                        Add Photos or Video (Optional)
                    </label>
                    <p className="text-xs text-gray-500 leading-relaxed mb-3">
                        Show off your pastry! You can upload up to 3 photos (JPG, PNG, WEBP - Max 5MB) OR 1 short video (MP4, MOV - Max 50MB).
                    </p>

                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`w-full border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all text-center
                            ${isDragging ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50/50'}
                        `}
                    >
                        <UploadCloud className={`w-10 h-10 mb-3 ${isDragging ? 'text-orange-500' : 'text-gray-400'}`} />
                        <p className="text-sm font-medium text-gray-800 mb-1">
                            Drop photos/videos here, or click to browse
                        </p>
                        <p className="text-xs text-gray-500">
                            Maximum 3 photos or 1 video
                        </p>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            multiple
                            accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime"
                            onChange={handleFileSelect}
                        />
                    </div>

                    {/* Previews */}
                    {files.length > 0 && (
                        <div className="grid grid-cols-3 gap-4 pt-4">
                            {files.map((file, idx) => (
                                <div key={idx} className="relative group rounded-xl overflow-hidden border border-gray-200 aspect-square bg-gray-50">
                                    {file.type.startsWith('image/') ? (
                                        <Image src={file.preview} alt="preview" fill className="object-cover" />
                                    ) : (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center">
                                            <Film className="w-8 h-8 text-gray-400 mb-2" />
                                            <span className="text-xs text-gray-500 truncate w-full px-2">{file.name}</span>
                                        </div>
                                    )}

                                    {/* Progress Bar Overlay */}
                                    {uploadProgress[file.name] !== undefined && uploadProgress[file.name] < 100 && (
                                        <div className="absolute inset-x-0 bottom-0 h-1 bg-gray-200">
                                            <div
                                                className="h-full bg-orange-500 transition-all duration-300"
                                                style={{ width: `${uploadProgress[file.name]}%` }}
                                            />
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                                        className="absolute top-2 right-2 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                                        disabled={isSubmitting}
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                    <Button type="button" variant="ghost" className="text-gray-500" onClick={onCancel} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button type="submit" size="lg" disabled={isSubmitting || rating === 0 || !isTextValid}>
                        {isSubmitting ? "Submitting..." : "Submit Review"}
                    </Button>
                </div>
            </div>
        </form>
    );
}
