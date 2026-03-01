'use client'
import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'

// ─── Supabase client ───────────────────────────────
function getSupabase() {
    const { createBrowserClient } = require('@supabase/ssr')
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
}

// ─── Save content to DB ────────────────────────────
async function saveField(page: string, section: string, field: string, value: string) {
    const res = await fetch('/api/admin/content', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page, section, field, value })
    })
    return res.ok
}

// ─── Upload image to Supabase storage ─────────────
async function uploadImage(file: File, bucket: string = 'site-images'): Promise<string | null> {
    const supabase = getSupabase()
    const ext = file.name.split('.').pop()
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, { upsert: true })
    if (error || !data) return null
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path)
    return publicUrl
}

// ─── Reusable text field ──────────────────────────
function Field({ label, defaultValue, page, section, field, multiline = false, hint }: {
    label: string; defaultValue?: string; page: string
    section: string; field: string; multiline?: boolean; hint?: string
}) {
    const [editing, setEditing] = useState(false)
    const [value, setValue] = useState(defaultValue || '')
    const [saving, setSaving] = useState(false)
    const [ok, setOk] = useState(false)

    const save = async () => {
        setSaving(true)
        const success = await saveField(page, section, field, value)
        setSaving(false)
        if (success) { setOk(true); setEditing(false); setTimeout(() => setOk(false), 3000) }
    }

    return (
        <div className="py-3 border-b border-gray-100 last:border-0">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
                    {hint && <p className="text-xs text-orange-500 mb-1">{hint}</p>}
                    {!editing ? (
                        <p className="text-gray-700 text-sm leading-relaxed truncate">{value || <span className="text-gray-300 italic">Not set</span>}</p>
                    ) : multiline ? (
                        <textarea value={value} onChange={e => setValue(e.target.value)} rows={4}
                            className="w-full border-2 border-orange-300 rounded-xl p-3 text-sm focus:outline-none focus:border-orange-500 resize-none" />
                    ) : (
                        <input value={value} onChange={e => setValue(e.target.value)}
                            className="w-full border-2 border-orange-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-500" />
                    )}
                </div>
                <div className="flex items-center gap-2 pt-5 shrink-0">
                    {ok && <span className="text-green-500 text-xs font-bold">✅</span>}
                    {!editing ? (
                        <button onClick={() => setEditing(true)}
                            className="text-xs font-semibold text-orange-500 hover:text-orange-700 px-3 py-1.5 rounded-lg hover:bg-orange-50">
                            Edit
                        </button>
                    ) : (
                        <>
                            <button onClick={save} disabled={saving}
                                className="text-xs font-semibold bg-[#D4421A] text-white px-3 py-1.5 rounded-lg hover:bg-[#b8381a]">
                                {saving ? '...' : 'Save'}
                            </button>
                            <button onClick={() => setEditing(false)}
                                className="text-xs text-gray-400 px-2 py-1.5 rounded-lg hover:bg-gray-100">
                                ✕
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

// ─── Image upload field ───────────────────────────
function ImageField({ label, defaultValue, page, section, field, hint, bucket = 'site-images' }: {
    label: string; defaultValue?: string; page: string
    section: string; field: string; hint?: string; bucket?: string
}) {
    const [preview, setPreview] = useState(defaultValue || '')
    const [uploading, setUploading] = useState(false)
    const [ok, setOk] = useState(false)

    const handle = async (file: File) => {
        setUploading(true)
        const reader = new FileReader()
        reader.onload = e => setPreview(e.target?.result as string)
        reader.readAsDataURL(file)
        const url = await uploadImage(file, bucket)
        if (url) {
            await saveField(page, section, field, url)
            setPreview(url)
            setOk(true)
            setTimeout(() => setOk(false), 3000)
        }
        setUploading(false)
    }

    return (
        <div className="py-3 border-b border-gray-100 last:border-0">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
            {hint && <p className="text-xs text-orange-500 mb-2">{hint}</p>}
            <div className="flex items-center gap-4">
                {preview && (
                    <img src={preview} className="w-20 h-20 object-cover rounded-xl border-2 border-gray-200 shrink-0"
                        onError={e => (e.currentTarget.style.display = 'none')} />
                )}
                <label className="cursor-pointer">
                    <div className={`flex items-center gap-2 border-2 border-dashed rounded-xl px-4 py-3 transition-colors ${uploading ? 'border-orange-300 bg-orange-50' : 'border-gray-200 hover:border-orange-400 hover:bg-orange-50'
                        }`}>
                        <span className="text-xl">{uploading ? '⏳' : '📸'}</span>
                        <div>
                            <p className="text-sm font-semibold text-gray-700">
                                {uploading ? 'Uploading...' : ok ? '✅ Uploaded!' : 'Upload Photo'}
                            </p>
                            <p className="text-xs text-gray-400">JPG, PNG, WebP • Max 10MB</p>
                        </div>
                    </div>
                    <input type="file" accept="image/*" className="hidden"
                        onChange={e => { const f = e.target.files?.[0]; if (f) handle(f) }} />
                </label>
            </div>
        </div>
    )
}

// ─── Section card ─────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-4 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                <h3 className="font-bold text-gray-800">{title}</h3>
            </div>
            <div className="px-6">{children}</div>
        </div>
    )
}

// ─── Main page ────────────────────────────────────
export default function ContentEditor() {
    const tabs = [
        { id: 'navbar', label: '🔝 Navbar' },
        { id: 'homepage', label: '🏠 Homepage' },
        { id: 'menu', label: '🍰 Menu' },
        { id: 'about', label: '👩🍳 About Us' },
        { id: 'contact', label: '📞 Contact' },
        { id: 'footer', label: '🔗 Footer' },
        { id: 'blog', label: '📝 Blog' },
    ]
    const [tab, setTab] = useState('homepage')

    return (
        <div className="p-6 max-w-3xl">
            <h1 className="text-3xl font-bold text-gray-900 mb-1"
                style={{ fontFamily: "'Playfair Display', serif" }}>
                Edit Website
            </h1>
            <p className="text-gray-500 mb-6">
                Every change goes live immediately. No code needed. ✨
            </p>

            {/* Tab bar */}
            <div className="flex gap-2 mb-6 flex-wrap">
                {tabs.map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)}
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${tab === t.id
                            ? 'bg-[#D4421A] text-white shadow-md'
                            : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-300'
                            }`}>
                        {t.label}
                    </button>
                ))}
            </div>

            {/* ── NAVBAR ── */}
            {tab === 'navbar' && (
                <>
                    <Section title="Business Name & Logo">
                        <Field label="Business Name" defaultValue="Sweet Delight" page="navbar" section="logo" field="name" hint="Appears in the top-left navbar" />
                        <Field label="Logo Tagline (optional small text)" defaultValue="" page="navbar" section="logo" field="tagline" />
                        <ImageField label="Logo Image (optional — leave empty to use text logo)" page="navbar" section="logo" field="image" hint="Upload a PNG logo file (transparent background recommended)" />
                    </Section>
                    <Section title="Navigation Links">
                        <Field label="Link 1 Label" defaultValue="Home" page="navbar" section="links" field="link1_label" />
                        <Field label="Link 2 Label" defaultValue="Menu" page="navbar" section="links" field="link2_label" />
                        <Field label="Link 3 Label" defaultValue="Custom Order" page="navbar" section="links" field="link3_label" />
                        <Field label="Link 4 Label" defaultValue="About Us" page="navbar" section="links" field="link4_label" />
                        <Field label="Link 5 Label" defaultValue="Contact" page="navbar" section="links" field="link5_label" />
                    </Section>
                    <Section title="Announcement Banner">
                        <Field label="Banner Text" defaultValue="🚚 Free delivery on orders over £50 · Minimum order £20" page="navbar" section="banner" field="text" multiline />
                        <Field label="Banner Background Colour (hex)" defaultValue="#D4421A" page="navbar" section="banner" field="bg_color" hint="e.g. #D4421A for orange, #2C1810 for dark brown" />
                    </Section>
                </>
            )}

            {/* ── HOMEPAGE ── */}
            {tab === 'homepage' && (
                <>
                    <Section title="Hero Section">
                        <Field label="Top Badge Text" defaultValue="🇬🇧 Proudly Serving the UK" page="home" section="hero" field="badge" />
                        <Field label="Headline Line 1" defaultValue="Baking Joy," page="home" section="hero" field="line1" />
                        <Field label="Headline Line 2" defaultValue="One Bite" page="home" section="hero" field="line2" />
                        <Field label="Headline Line 3" defaultValue="At A Time." page="home" section="hero" field="line3" />
                        <Field label="Subheading" defaultValue="Experience the perfect blend of London sophistication and Nigerian soul." page="home" section="hero" field="subtext" multiline />
                        <Field label="Button 1 Text" defaultValue="Order Fresh Now" page="home" section="hero" field="btn1" />
                        <Field label="Button 2 Text" defaultValue="View Our Menu" page="home" section="hero" field="btn2" />
                        <ImageField label="Hero Image" page="home" section="hero" field="image" hint="Best size: 900×700px. Shows on right side of homepage." />
                    </Section>
                    <Section title="Stats Bar">
                        <Field label="Stat 1 Number" defaultValue="500+" page="home" section="stats" field="s1_num" />
                        <Field label="Stat 1 Label" defaultValue="Happy Customers" page="home" section="stats" field="s1_label" />
                        <Field label="Stat 2 Number" defaultValue="4.9/5" page="home" section="stats" field="s2_num" />
                        <Field label="Stat 2 Label" defaultValue="Average Rating" page="home" section="stats" field="s2_label" />
                        <Field label="Stat 3 Number" defaultValue="45" page="home" section="stats" field="s3_num" />
                        <Field label="Stat 3 Label" defaultValue="Min Delivery" page="home" section="stats" field="s3_label" />
                    </Section>
                    <Section title="Scrolling Announcement Strip">
                        <Field label="Strip Text" defaultValue="🚚 Free delivery on orders over £50 · Minimum order £20 · 🕐 Allow 48h notice for custom cakes · 📍 Delivering across the UK" page="home" section="strip" field="text" multiline />
                    </Section>
                    <Section title="Category Section">
                        <Field label="Section Heading" defaultValue="Explore Categories" page="home" section="categories" field="heading" />
                        <ImageField label="Celebration Cakes Photo" page="home" section="categories" field="cat1_img" hint="Upload your own cake photo" />
                        <ImageField label="Small Chops Photo" page="home" section="categories" field="cat2_img" />
                        <ImageField label="Chin Chin & Snacks Photo" page="home" section="categories" field="cat3_img" />
                        <ImageField label="Party Boxes Photo" page="home" section="categories" field="cat4_img" />
                    </Section>
                    <Section title="Newsletter Section">
                        <Field label="Heading" defaultValue="Get 10% Off Your First Order" page="home" section="newsletter" field="heading" />
                        <Field label="Subtext" defaultValue="Be the first to hear about new seasonal drops and exclusive events." page="home" section="newsletter" field="subtext" multiline />
                        <Field label="Button Text" defaultValue="Join The Club" page="home" section="newsletter" field="btn" />
                    </Section>
                </>
            )}

            {/* ── MENU ── */}
            {tab === 'menu' && (
                <>
                    <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-4">
                        <p className="text-sm font-semibold text-orange-800">🍰 To edit individual products (name, price, description, photo), go to:</p>
                        <Link href="/admin/products" className="inline-block mt-2 bg-[#D4421A] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#b8381a]">
                            → Manage Products
                        </Link>
                    </div>
                    <Section title="Menu Page Header">
                        <Field label="Page Title" defaultValue="Our Menu" page="menu" section="header" field="title" />
                        <Field label="Subtitle" defaultValue="Handcrafted with love, baked fresh daily" page="menu" section="header" field="subtitle" />
                        <ImageField label="Menu Page Banner Image" page="menu" section="header" field="banner_image" hint="Wide banner shown at top of menu page" />
                    </Section>
                    <Section title="Category Cover Images">
                        <Field label="Note" defaultValue="" page="menu" section="note" field="info"
                            hint="Upload cover photos for each category below. These show on the homepage and menu page." />
                        <ImageField label="Celebration Cakes Cover" page="menu" section="covers" field="celebration_cakes" bucket="site-images" hint="Your best cake photo" />
                        <ImageField label="Small Chops Cover" page="menu" section="covers" field="small_chops" hint="Your platter or small chops photo" />
                        <ImageField label="Chin Chin & Snacks Cover" page="menu" section="covers" field="chin_chin" hint="Chin chin bag or snacks photo" />
                        <ImageField label="Party Boxes Cover" page="menu" section="covers" field="party_boxes" />
                        <ImageField label="Puff Puff Cover" page="menu" section="covers" field="puff_puff" />
                    </Section>
                    <Section title="Featured Products Section">
                        <Field label="Section Heading" defaultValue="Customer Favourites" page="menu" section="featured" field="heading" />
                        <Field label="Section Subtitle" defaultValue="Signature Items" page="menu" section="featured" field="subtitle" />
                    </Section>
                </>
            )}

            {/* ── ABOUT ── */}
            {tab === 'about' && (
                <>
                    <Section title="Page Header">
                        <Field label="Main Heading" defaultValue="Made With Love, Baked With Pride" page="about" section="hero" field="heading" />
                        <Field label="Subheading" defaultValue="Where Nigerian tradition meets London sophistication." page="about" section="hero" field="subheading" />
                    </Section>
                    <Section title="Your Story">
                        <Field label="Story Section Title" defaultValue="From Lagos to London" page="about" section="story" field="heading" />
                        <Field label="Paragraph 1" page="about" section="story" field="para1" multiline
                            defaultValue="Sweet Delight was born from a simple longing — the taste of home." />
                        <Field label="Paragraph 2" page="about" section="story" field="para2" multiline />
                        <Field label="Paragraph 3" page="about" section="story" field="para3" multiline />
                    </Section>
                    <Section title="Your Photo">
                        <ImageField label="Baker / Owner Photo 📸"
                            page="about" section="story" field="baker_image"
                            hint="Upload YOUR photo here — customers love seeing the real baker!" />
                    </Section>
                    <Section title="Why Choose Us (3 cards)">
                        <Field label="Card 1 Title" defaultValue="100% Authentic" page="about" section="why" field="c1_title" />
                        <Field label="Card 1 Description" defaultValue="Traditional Nigerian recipes passed down through generations." page="about" section="why" field="c1_desc" multiline />
                        <Field label="Card 2 Title" defaultValue="Always Fresh" page="about" section="why" field="c2_title" />
                        <Field label="Card 2 Description" defaultValue="Baked fresh to order, never mass-produced." page="about" section="why" field="c2_desc" multiline />
                        <Field label="Card 3 Title" defaultValue="UK-Wide Delivery" page="about" section="why" field="c3_title" />
                        <Field label="Card 3 Description" defaultValue="Delivering joy across the whole of the UK." page="about" section="why" field="c3_desc" multiline />
                    </Section>
                </>
            )}

            {/* ── CONTACT ── */}
            {tab === 'contact' && (
                <>
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-4">
                        <p className="text-sm text-green-800 font-semibold">
                            ✅ Changes here update everywhere — footer, contact page, chatbot responses.
                        </p>
                    </div>
                    <Section title="Contact Details">
                        <Field label="WhatsApp Number (447XXXXXXXXX — no + or spaces)" defaultValue="447000000000" page="contact" section="details" field="whatsapp" hint="Used for WhatsApp order links across the site" />
                        <Field label="Phone Number (displayed to customers)" defaultValue="+44 7000 000000" page="contact" section="details" field="phone" />
                        <Field label="Instagram Handle" defaultValue="@sweetdelight" page="contact" section="details" field="instagram" />
                        <Field label="Instagram URL" defaultValue="https://instagram.com/sweetdelight" page="contact" section="details" field="instagram_url" />
                        <Field label="Facebook URL" defaultValue="" page="contact" section="details" field="facebook" />
                        <Field label="TikTok Handle" defaultValue="" page="contact" section="details" field="tiktok" />
                        <Field label="Email Address" defaultValue="hello@sweetdelight.co.uk" page="contact" section="details" field="email" />
                    </Section>
                    <Section title="Business Hours">
                        <Field label="Monday – Friday" defaultValue="9am – 7pm" page="contact" section="hours" field="mon_fri" />
                        <Field label="Saturday" defaultValue="9am – 5pm" page="contact" section="hours" field="saturday" />
                        <Field label="Sunday" defaultValue="Custom orders only" page="contact" section="hours" field="sunday" />
                    </Section>
                    <Section title="Ordering & Delivery">
                        <Field label="Custom Cake Notice" defaultValue="5 days" page="contact" section="ordering" field="cake_notice" />
                        <Field label="Party Platter Notice" defaultValue="48 hours" page="contact" section="ordering" field="platter_notice" />
                        <Field label="Delivery Areas" defaultValue="We deliver across the UK" page="contact" section="ordering" field="delivery_areas" multiline />
                        <Field label="Minimum Order" defaultValue="£20" page="contact" section="ordering" field="min_order" />
                        <Field label="Free Delivery Over" defaultValue="£50" page="contact" section="ordering" field="free_delivery_over" />
                    </Section>
                </>
            )}

            {/* ── FOOTER ── */}
            {tab === 'footer' && (
                <>
                    <Section title="Brand">
                        <Field label="Footer Tagline" defaultValue="Handcrafting moments of joy with premium ingredients and traditional Nigerian warmth." page="footer" section="brand" field="tagline" multiline />
                        <Field label="Copyright Text" defaultValue="© 2026 Sweet Delight. All rights reserved." page="footer" section="brand" field="copyright" />
                        <Field label="Made In Text" defaultValue="Made within the UK 🇬🇧 — with Nigerian Soul" page="footer" section="brand" field="made_in" />
                    </Section>
                    <Section title="Contact Details in Footer">
                        <Field label="Phone Number" defaultValue="+44 7000 000000" page="footer" section="contact" field="phone" hint="Shown in footer contact column" />
                        <Field label="Instagram Handle" defaultValue="@sweetdelight" page="footer" section="contact" field="instagram" />
                        <Field label="Instagram URL" defaultValue="https://instagram.com/sweetdelight" page="footer" section="contact" field="instagram_url" />
                        <Field label="WhatsApp Number (for click-to-chat link)" defaultValue="447000000000" page="footer" section="contact" field="whatsapp" />
                        <Field label="Email Address" defaultValue="hello@sweetdelight.co.uk" page="footer" section="contact" field="email" />
                    </Section>
                    <Section title="Social Media Links">
                        <Field label="Facebook URL" defaultValue="" page="footer" section="social" field="facebook" />
                        <Field label="TikTok URL" defaultValue="" page="footer" section="social" field="tiktok" />
                        <Field label="Twitter/X URL" defaultValue="" page="footer" section="social" field="twitter" />
                        <Field label="YouTube URL" defaultValue="" page="footer" section="social" field="youtube" />
                    </Section>
                </>
            )}

            {/* ── BLOG ── */}
            {tab === 'blog' && (
                <>
                    <Section title="Blog Page">
                        <Field label="Page Title" defaultValue="Sweet News" page="blog" section="header" field="title" />
                        <Field label="Subtitle" defaultValue="Stories, recipes and news from the Sweet Delight kitchen" page="blog" section="header" field="subtitle" multiline />
                        <ImageField label="Blog Header Image" page="blog" section="header" field="image" />
                    </Section>
                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                        <p className="text-sm text-blue-800 font-semibold">
                            📝 To write and publish blog posts, go to the Blog section in Products/Content management.
                            Each post has its own title, content, image and publish date.
                        </p>
                    </div>
                </>
            )}

        </div>
    )
}
