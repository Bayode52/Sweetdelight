"use client";

import { useState, useRef } from "react";
import { Upload, X, Check, Image as ImageIcon, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

interface CropUploadProps {
    value?: string;
    onChange: (url: string) => void;
    label?: string;
    bucket?: string;
    aspectRatio?: "square" | "video" | "portrait";
}

export function CropUpload({
    value,
    onChange,
    label = "Upload Image",
    bucket = "site-images",
    aspectRatio = "square"
}: CropUploadProps) {
    const [preview, setPreview] = useState(value || "");
    const [isUploading, setIsUploading] = useState(false);
    const [isOk, setIsOk] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (file: File) => {
        setIsUploading(true);

        // Local preview
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target?.result as string);
        reader.readAsDataURL(file);

        try {
            const ext = file.name.split(".").pop();
            const path = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;

            const { data, error } = await supabase.storage
                .from(bucket)
                .upload(path, file, { upsert: true });

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);

            onChange(publicUrl);
            setPreview(publicUrl);
            setIsOk(true);
            setTimeout(() => setIsOk(false), 3000);
        } catch (error) {
            console.error("Upload failed:", error);
            alert("Failed to upload image. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    const ratioClasses = {
        square: "aspect-square",
        video: "aspect-video",
        portrait: "aspect-[3/4]"
    };

    return (
        <div className="space-y-4">
            {label && (
                <p className="text-[10px] font-black uppercase tracking-widest text-bakery-primary/40">
                    {label}
                </p>
            )}

            <div className={cn(
                "relative group overflow-hidden rounded-[32px] border-2 border-dashed transition-all duration-500",
                isUploading ? "border-bakery-cta/30 bg-bakery-cta/5" : "border-bakery-primary/5 hover:border-bakery-cta/30 bg-white shadow-sm hover:shadow-xl",
                ratioClasses[aspectRatio]
            )}>
                {preview ? (
                    <>
                        <img
                            src={preview}
                            className={cn(
                                "w-full h-full object-cover transition-transform duration-700 group-hover:scale-105",
                                isUploading && "opacity-40 grayscale-[0.5]"
                            )}
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                            <button
                                onClick={() => fileRef.current?.click()}
                                className="p-3 bg-white text-bakery-primary rounded-2xl shadow-xl hover:-translate-y-1 transition-all"
                            >
                                <Upload size={20} />
                            </button>
                            <button
                                onClick={() => { setPreview(""); onChange(""); }}
                                className="p-3 bg-white text-red-500 rounded-2xl shadow-xl hover:-translate-y-1 transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </>
                ) : (
                    <button
                        onClick={() => fileRef.current?.click()}
                        className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-bakery-primary/20 group-hover:text-bakery-cta group-hover:bg-bakery-cta/5 transition-all"
                    >
                        <div className="w-16 h-16 rounded-3xl bg-bakery-primary/5 flex items-center justify-center transition-colors group-hover:bg-bakery-cta/10">
                            <Upload size={32} />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-bold text-bakery-primary/40 group-hover:text-bakery-cta">Click to upload</p>
                            <p className="text-[10px] font-medium tracking-wide">JPG, PNG or WebP</p>
                        </div>
                    </button>
                )}

                {/* Status Overlay */}
                {isUploading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 backdrop-blur-md animate-in fade-in">
                        <Loader2 className="w-8 h-8 text-bakery-cta animate-spin mb-2" />
                        <p className="text-xs font-black uppercase text-bakery-cta tracking-widest">Uploading</p>
                    </div>
                )}

                {isOk && (
                    <div className="absolute inset-0 flex items-center justify-center bg-green-500/80 backdrop-blur-sm animate-in zoom-in duration-300">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-green-500 shadow-2xl">
                            <Check size={24} strokeWidth={4} />
                        </div>
                    </div>
                )}
            </div>

            <input
                type="file"
                ref={fileRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload(file);
                }}
            />
        </div>
    );
}
