"use client";

import { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { Save, Loader2, Image as ImageIcon, Edit3, X, Check, UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';

type ContentField = {
    id: string;
    page: string;
    section: string;
    field: string;
    value: string;
};

export default function ContentEditorPage() {
    const [content, setContent] = useState<ContentField[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('home');

    const tabs = [
        { id: 'home', label: '🏠 Homepage' },
        { id: 'about', label: '👩‍🍳 About Us' },
        { id: 'footer', label: '🔗 Footer' },
    ];

    useEffect(() => {
        fetchContent();
    }, []);

    async function fetchContent() {
        try {
            const res = await fetch('/api/admin/content');
            const data = await res.json();
            setContent(data);
        } catch (error) {
            toast.error('Failed to load content');
        } finally {
            setLoading(false);
        }
    }

    const updateLocalContent = (page: string, section: string, field: string, value: string) => {
        setContent(prev => {
            const exists = prev.find(c => c.page === page && c.section === section && c.field === field);
            if (exists) {
                return prev.map(c => (c.page === page && c.section === section && c.field === field) ? { ...c, value } : c);
            }
            return [...prev, { id: Math.random().toString(), page, section, field, value }];
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-[#D4421A]" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl space-y-8">
            <div>
                <h1 className="text-3xl font-playfair font-black text-bakery-primary">Edit Website Content</h1>
                <p className="text-gray-500 mt-2">Click any field to edit it. Changes go live immediately.</p>
            </div>

            {/* TABS */}
            <div className="flex gap-2 p-1 bg-orange-50/50 rounded-2xl w-fit">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "px-6 py-2.5 rounded-xl font-bold text-sm transition-all",
                            activeTab === tab.id
                                ? "bg-white text-[#D4421A] luxury-shadow"
                                : "text-gray-500 hover:text-gray-700"
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* CONTENT FIELDS */}
            <div className="space-y-6">
                {activeTab === 'home' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <EditableField page="home" section="hero" field="badge" label="Top Badge text" content={content} onUpdate={updateLocalContent} />
                        <EditableField page="home" section="hero" field="line1" label="Headline line 1" content={content} onUpdate={updateLocalContent} />
                        <EditableField page="home" section="hero" field="line2" label="Headline line 2" content={content} onUpdate={updateLocalContent} />
                        <EditableField page="home" section="hero" field="line3" label="Headline line 3" content={content} onUpdate={updateLocalContent} />
                        <EditableField page="home" section="hero" field="subtext" label="Subheading text" textarea content={content} onUpdate={updateLocalContent} />
                        <ImageField page="home" section="hero" field="image" label="Hero Image" content={content} onUpdate={updateLocalContent} />
                    </div>
                )}

                {activeTab === 'about' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <EditableField page="about" section="hero" field="heading" label="Page Heading" content={content} onUpdate={updateLocalContent} />
                        <EditableField page="about" section="hero" field="subheading" label="Page Subheading" content={content} onUpdate={updateLocalContent} />
                        <EditableField page="about" section="story" field="heading" label="Story Section Heading" content={content} onUpdate={updateLocalContent} />
                        <EditableField page="about" section="story" field="para1" label="Story Paragraph 1" textarea content={content} onUpdate={updateLocalContent} />
                        <EditableField page="about" section="story" field="para2" label="Story Paragraph 2" textarea content={content} onUpdate={updateLocalContent} />
                        <EditableField page="about" section="story" field="para3" label="Story Paragraph 3" textarea content={content} onUpdate={updateLocalContent} />
                        <ImageField
                            page="about" section="story" field="baker_image" label="Your Photo"
                            note="Upload a photo of yourself — your customers want to see the real you! 📸"
                            content={content} onUpdate={updateLocalContent}
                        />
                    </div>
                )}

                {activeTab === 'footer' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <EditableField page="footer" section="main" field="tagline" label="Footer Tagline" textarea content={content} onUpdate={updateLocalContent} />
                    </div>
                )}
            </div>
        </div>
    );
}

function EditableField({ page, section, field, label, textarea, content, onUpdate }: any) {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState('');
    const [saving, setSaving] = useState(false);
    const [showSaved, setShowSaved] = useState(false);

    useEffect(() => {
        const item = content.find((c: any) => c.page === page && c.section === section && c.field === field);
        setValue(item?.value || '');
    }, [content, page, section, field]);

    async function handleSave() {
        setSaving(true);
        try {
            const res = await fetch('/api/admin/content', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ page, section, field, value })
            });
            if (!res.ok) throw new Error('Failed');

            onUpdate(page, section, field, value);
            setIsEditing(false);
            setShowSaved(true);
            setTimeout(() => setShowSaved(false), 2000);
        } catch (error) {
            toast.error('Failed to save');
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 hover:border-[#D4421A]/20 transition-all flex flex-col gap-3 group">
            <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">{label}</label>
                {showSaved && <span className="text-xs font-bold text-green-500 flex items-center gap-1"><Check size={12} /> Saved</span>}
            </div>

            {isEditing ? (
                <div className="space-y-3">
                    {textarea ? (
                        <textarea
                            value={value}
                            onChange={e => setValue(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4421A] text-sm h-32 resize-none"
                            autoFocus
                        />
                    ) : (
                        <div className="relative">
                            <input
                                value={value}
                                onChange={e => setValue(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4421A] text-sm"
                                autoFocus
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-300 font-bold">{value.length} codes</span>
                        </div>
                    )}
                    <div className="flex gap-2">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex-1 bg-[#D4421A] text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                        >
                            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            Save
                        </button>
                        <button
                            onClick={() => setIsEditing(false)}
                            className="px-4 py-2 bg-gray-100 text-gray-500 rounded-xl text-xs font-bold"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex items-start justify-between gap-4">
                    <p className="text-sm font-medium text-gray-700 line-clamp-3 leading-relaxed">{value || <span className="text-gray-300 italic">Empty</span>}</p>
                    <button
                        onClick={() => setIsEditing(true)}
                        className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:text-[#D4421A] hover:bg-orange-50 transition-all"
                    >
                        <Edit3 size={16} />
                    </button>
                </div>
            )}
        </div>
    );
}

function ImageField({ page, section, field, label, note, content, onUpdate }: any) {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const currentUrl = content.find((c: any) => c.page === page && c.section === section && c.field === field)?.value || '';

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) return toast.error('Max file size 10MB');

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            // 1. Upload to storage
            const uploadRes = await fetch('/api/admin/content/upload', {
                method: 'POST',
                body: formData
            });
            const { url } = await uploadRes.json();

            // 2. Save URL to content table
            const res = await fetch('/api/admin/content', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ page, section, field, value: url })
            });

            if (!res.ok) throw new Error('Failed');

            onUpdate(page, section, field, url);
            toast.success('Photo updated!');
        } catch (error) {
            toast.error('Failed to upload image');
        } finally {
            setUploading(false);
        }
    }

    return (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 flex flex-col gap-4">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400">{label}</label>

            <div className="flex items-center gap-6">
                <div className="relative w-32 h-32 rounded-2xl overflow-hidden bg-gray-100 group">
                    {currentUrl ? (
                        <img src={currentUrl} className="w-full h-full object-cover" alt={label} />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <ImageIcon size={32} />
                        </div>
                    )}
                    {uploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Loader2 className="text-white animate-spin" size={24} />
                        </div>
                    )}
                </div>

                <div className="flex-1 space-y-3">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 bg-white border-2 border-dashed border-gray-200 text-gray-600 px-4 py-2.5 rounded-xl font-bold text-xs hover:border-[#D4421A] hover:text-[#D4421A] transition-all"
                    >
                        <UploadCloud size={16} />
                        📸 Change Photo
                    </button>
                    {note && <p className="text-[10px] text-gray-400 leading-tight">{note}</p>}
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                </div>
            </div>
        </div>
    );
}
