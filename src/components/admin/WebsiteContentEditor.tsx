"use client";

import { useEffect, useState } from "react";
import { getContent, updateContent, ContentMap } from "@/lib/content";
import { Button, Input, Textarea } from "@/components/ui";
import { Check, Edit2, ImageIcon, Loader2, X } from "lucide-react";
import toast from "react-hot-toast";

type FieldType = 'text' | 'textarea' | 'image' | 'url';

interface FieldSchema {
    id: string;
    label: string;
    type: FieldType;
}

interface SectionSchema {
    id: string;
    title: string;
    fields: FieldSchema[];
}

const PAGE_SCHEMAS: Record<string, SectionSchema[]> = {
    homepage: [
        {
            id: 'hero',
            title: 'Hero Section',
            fields: [
                { id: 'badge', label: 'Badge Text', type: 'text' },
                { id: 'heading_line1', label: 'Heading Line 1', type: 'text' },
                { id: 'heading_line2', label: 'Heading Line 2', type: 'text' },
                { id: 'heading_line3', label: 'Heading Line 3', type: 'text' },
                { id: 'subheading', label: 'Subheading', type: 'textarea' },
                { id: 'button_primary_text', label: 'Primary Button Text', type: 'text' },
                { id: 'button_primary_url', label: 'Primary Button URL', type: 'url' },
                { id: 'button_secondary_text', label: 'Secondary Button Text', type: 'text' },
                { id: 'button_secondary_url', label: 'Secondary Button URL', type: 'url' },
                { id: 'stats_customers', label: 'Stats: Customers', type: 'text' },
                { id: 'stats_rating', label: 'Stats: Rating', type: 'text' },
                { id: 'badge_fast_delivery_title', label: 'Badge: Delivery Title', type: 'text' },
                { id: 'badge_fast_delivery_text', label: 'Badge: Delivery Text', type: 'text' },
                { id: 'badge_quality_title', label: 'Badge: Quality Title', type: 'text' },
                { id: 'badge_quality_text', label: 'Badge: Quality Text', type: 'text' },
            ]
        },
        {
            id: 'delivery_banner',
            title: 'Delivery Banner',
            fields: [
                { id: 'text', label: 'Banner Text', type: 'text' }
            ]
        },
        {
            id: 'categories',
            title: 'Categories Section',
            fields: [
                { id: 'badge', label: 'Badge', type: 'text' },
                { id: 'heading', label: 'Heading', type: 'text' },
                { id: 'button_text', label: 'Button Text', type: 'text' },
                { id: 'button_url', label: 'Button URL', type: 'url' },
            ]
        },
        {
            id: 'customer_favourites',
            title: 'Customer Favourites',
            fields: [
                { id: 'badge', label: 'Badge', type: 'text' },
                { id: 'heading', label: 'Heading', type: 'text' },
            ]
        },
        {
            id: 'newsletter',
            title: 'Newsletter Section',
            fields: [
                { id: 'badge', label: 'Badge', type: 'text' },
                { id: 'heading', label: 'Heading', type: 'text' },
                { id: 'subheading', label: 'Subheading', type: 'textarea' },
                { id: 'disclaimer', label: 'Disclaimer Footer', type: 'text' },
            ]
        }
    ],
    about: [
        {
            id: 'hero',
            title: 'Hero Section',
            fields: [
                { id: 'badge', label: 'Badge', type: 'text' },
                { id: 'heading', label: 'Heading', type: 'text' },
                { id: 'heading_italic', label: 'Heading (Italic part)', type: 'text' },
                { id: 'subheading', label: 'Subheading', type: 'textarea' },
                { id: 'stats_years', label: 'Stats: Years', type: 'text' },
                { id: 'stats_years_label', label: 'Stats: Years Label', type: 'text' },
                { id: 'stats_recipes', label: 'Stats: Recipes', type: 'text' },
                { id: 'stats_recipes_label', label: 'Stats: Recipes Label', type: 'text' },
                { id: 'stats_events', label: 'Stats: Events', type: 'text' },
                { id: 'stats_events_label', label: 'Stats: Events Label', type: 'text' },
            ]
        },
        {
            id: 'story',
            title: 'Our Story',
            fields: [
                { id: 'heading', label: 'Heading', type: 'text' },
                { id: 'paragraph_1', label: 'Paragraph 1', type: 'textarea' },
                { id: 'paragraph_2', label: 'Paragraph 2', type: 'textarea' },
                { id: 'paragraph_3', label: 'Paragraph 3', type: 'textarea' },
            ]
        },
        {
            id: 'why_different',
            title: 'Why We\'re Different',
            fields: [
                { id: 'badge', label: 'Badge', type: 'text' },
                { id: 'heading', label: 'Heading', type: 'text' },
            ]
        },
        {
            id: 'food_safety',
            title: 'Food Safety',
            fields: [
                { id: 'badge', label: 'Badge', type: 'text' },
                { id: 'heading', label: 'Heading', type: 'text' },
                { id: 'description', label: 'Description', type: 'textarea' },
            ]
        },
        {
            id: 'values',
            title: 'Values Row',
            fields: [
                { id: 'item1_title', label: 'Item 1 Title', type: 'text' },
                { id: 'item1_desc', label: 'Item 1 Description', type: 'textarea' },
                { id: 'item2_title', label: 'Item 2 Title', type: 'text' },
                { id: 'item2_desc', label: 'Item 2 Description', type: 'textarea' },
                { id: 'item3_title', label: 'Item 3 Title', type: 'text' },
                { id: 'item3_desc', label: 'Item 3 Description', type: 'textarea' },
            ]
        },
        {
            id: 'cta_banner',
            title: 'CTA Banner',
            fields: [
                { id: 'heading', label: 'Heading', type: 'text' },
                { id: 'button_text', label: 'Button Text', type: 'text' },
            ]
        }
    ],
    contact: [
        {
            id: 'hero',
            title: 'Hero Section',
            fields: [
                { id: 'badge', label: 'Badge', type: 'text' },
                { id: 'heading', label: 'Heading', type: 'text' },
                { id: 'heading_italic', label: 'Heading (Italic part)', type: 'text' },
                { id: 'subheading', label: 'Subheading', type: 'textarea' },
            ]
        },
        {
            id: 'info_sales',
            title: 'Sales & Orders',
            fields: [
                { id: 'title', label: 'Title', type: 'text' },
                { id: 'description', label: 'Description', type: 'text' },
                { id: 'email', label: 'Email', type: 'text' },
                { id: 'phone', label: 'Phone', type: 'text' },
            ]
        },
        {
            id: 'info_general',
            title: 'General Enquiries',
            fields: [
                { id: 'title', label: 'Title', type: 'text' },
                { id: 'description', label: 'Description', type: 'text' },
                { id: 'email', label: 'Email', type: 'text' },
            ]
        },
        {
            id: 'business_hours',
            title: 'Business Hours',
            fields: [
                { id: 'title', label: 'Title', type: 'text' },
                { id: 'mon_fri', label: 'Mon - Fri', type: 'text' },
                { id: 'sat', label: 'Saturday', type: 'text' },
                { id: 'sun', label: 'Sunday', type: 'text' },
            ]
        },
        {
            id: 'kitchen',
            title: 'Our Kitchen',
            fields: [
                { id: 'title', label: 'Title', type: 'text' },
                { id: 'location', label: 'Location', type: 'text' },
                { id: 'note', label: 'Note', type: 'textarea' },
            ]
        },
        {
            id: 'social',
            title: 'Follow Us',
            fields: [
                { id: 'title', label: 'Title', type: 'text' },
                { id: 'instagram', label: 'Instagram Text', type: 'text' },
            ]
        }
    ],
    menu: [
        {
            id: 'header',
            title: 'Menu Header',
            fields: [
                { id: 'badge', label: 'Badge', type: 'text' },
                { id: 'heading', label: 'Heading', type: 'text' },
                { id: 'heading_italic', label: 'Heading (Italic part)', type: 'text' },
                { id: 'subheading', label: 'Subheading', type: 'textarea' },
            ]
        },
        {
            id: 'categories',
            title: 'Category Descriptions (Menu Page)',
            fields: [
                { id: 'celebration_cakes_desc', label: 'Celebration Cakes Description', type: 'textarea' },
                { id: 'small_chops_desc', label: 'Small Chops Description', type: 'textarea' },
                { id: 'chin_chin_desc', label: 'Chin Chin Description', type: 'textarea' },
                { id: 'party_boxes_desc', label: 'Party Boxes Description', type: 'textarea' },
                { id: 'puff_puff_desc', label: 'Puff Puff Description', type: 'textarea' },
                { id: 'meat_pies_desc', label: 'Meat Pies Description', type: 'textarea' },
            ]
        }
    ],
    footer: [
        {
            id: 'footer',
            title: 'Footer Config',
            fields: [
                { id: 'tagline', label: 'Tagline', type: 'textarea' },
                { id: 'social_instagram', label: 'Instagram URL', type: 'url' },
                { id: 'social_facebook', label: 'Facebook URL', type: 'url' },
                { id: 'social_twitter', label: 'Twitter URL', type: 'url' },
                { id: 'copyright', label: 'Copyright Text', type: 'text' },
            ]
        }
    ]
}

export function WebsiteContentEditor({ page }: { page: string }) {
    const [content, setContent] = useState<ContentMap>({});
    const [isLoading, setIsLoading] = useState(true);
    const sections = PAGE_SCHEMAS[page] || [];

    useEffect(() => {
        loadContent();
    }, [page]);

    async function loadContent() {
        setIsLoading(true);
        try {
            const data = await getContent(page);
            setContent(data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load content");
        } finally {
            setIsLoading(false);
        }
    }

    if (isLoading) {
        return <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-bakery-cta" /></div>
    }

    return (
        <div className="space-y-6">
            {sections.map(section => (
                <div key={section.id} className="bg-white rounded-3xl p-6 luxury-shadow">
                    <h3 className="text-xl font-bold font-playfair mb-6">{section.title}</h3>
                    <div className="grid grid-cols-1 gap-6">
                        {section.fields.map(field => (
                            <ContentEditableField
                                key={field.id}
                                page={page}
                                section={section.id}
                                field={field}
                                initialValue={content[`${section.id}.${field.id}`] || ''}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}

function ContentEditableField({ page, section, field, initialValue }: { page: string, section: string, field: FieldSchema, initialValue: string }) {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(initialValue);
    const [isSaving, setIsSaving] = useState(false);
    const [savedJustNow, setSavedJustNow] = useState(false);

    async function handleSave() {
        setIsSaving(true);
        try {
            const res = await fetch('/api/dev/cms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ page, section, field: field.id, value })
            });

            if (!res.ok) throw new Error("Failed to save");

            setIsEditing(false);
            setSavedJustNow(true);
            setTimeout(() => setSavedJustNow(false), 2000);
        } catch (err) {
            console.error(err);
            toast.error("Failed to save changes");
        } finally {
            setIsSaving(false);
        }
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Escape') {
            setValue(initialValue);
            setIsEditing(false);
        }
    }

    return (
        <div className="flex flex-col md:flex-row md:items-start gap-4 p-4 rounded-xl border border-black/5 hover:border-black/10 transition-colors">
            <div className="w-full md:w-1/4 pt-2">
                <span className="font-bold text-sm text-bakery-primary/80">{field.label}</span>
                <span className="block text-[10px] text-bakery-primary/40 font-mono mt-1">{section}.{field.id}</span>
            </div>

            <div className="flex-1">
                {isEditing ? (
                    <div className="space-y-3">
                        {field.type === 'textarea' ? (
                            <Textarea
                                value={value}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                autoFocus
                                className="min-h-[120px] bg-white"
                            />
                        ) : field.type === 'image' ? (
                            <div className="flex items-center gap-4 bg-black/5 p-4 rounded-xl border border-black/10">
                                <ImageIcon className="text-black/30 w-8 h-8" />
                                <span className="text-sm font-medium">Image uploads coming soon via Supabase Storage</span>
                            </div>
                        ) : (
                            <Input
                                type={field.type === 'url' ? 'url' : 'text'}
                                value={value}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                autoFocus
                                className="bg-white"
                            />
                        )}
                        <div className="flex items-center gap-2">
                            <Button onClick={handleSave} disabled={isSaving || value === initialValue} size="sm" className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-4">
                                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <span>Save</span>}
                            </Button>
                            <Button onClick={() => { setIsEditing(false); setValue(initialValue); }} variant="outline" size="sm" className="rounded-lg">
                                Cancel
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-between items-start gap-4 group">
                        <div className="flex-1 whitespace-pre-wrap text-sm text-bakery-primary/90">
                            {value || <span className="text-bakery-primary/30 italic">No content set...</span>}
                        </div>
                        <div className="flex items-center">
                            {savedJustNow && (
                                <span className="text-green-600 font-bold text-xs flex items-center gap-1 mr-4 animate-fade-in">
                                    <Check size={14} /> Saved
                                </span>
                            )}
                            <button
                                onClick={() => setIsEditing(true)}
                                className="text-bakery-primary/40 hover:text-bakery-cta p-2 rounded-lg hover:bg-black/5 transition-colors opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs font-bold"
                            >
                                <Edit2 size={14} /> Edit
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
