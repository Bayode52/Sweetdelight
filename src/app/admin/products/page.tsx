'use client'
import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'

const sb = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Product = {
    id: string
    name: string
    category: string
    price: number
    description: string
    ingredients: string
    allergens: string
    serves: string
    notice: string
    badge: string
    is_available: boolean
    is_featured: boolean
    image_url: string
    options: string
    flavours: string
    discount_percent: number
    discount_label: string
    stock_note: string
    sort_order: number
}

const CATEGORIES = [
    'Celebration Cakes',
    'Small Chops',
    'Puff Puff',
    'Chin Chin & Snacks',
    'Savoury Bakes',
    'Party Boxes',
    'Seasonal Specials',
]

const BLANK: Partial<Product> = {
    name: '', category: 'Celebration Cakes', price: 0,
    description: '', ingredients: '', allergens: '',
    serves: '', notice: '', badge: '', is_available: true,
    is_featured: false, image_url: '', options: '',
    flavours: '', discount_percent: 0, discount_label: '',
    stock_note: '', sort_order: 0,
}

export default function AdminProducts() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [view, setView] = useState<'grid' | 'form'>('grid')
    const [editing, setEditing] = useState<Partial<Product>>(BLANK)
    const [saving, setSaving] = useState(false)
    const [toast, setToast] = useState('')
    const [filter, setFilter] = useState('All')
    const [uploading, setUploading] = useState(false)
    const [search, setSearch] = useState('')

    function showToast(msg: string) {
        setToast(msg)
        setTimeout(() => setToast(''), 3500)
    }

    async function load() {
        setLoading(true)
        const { data } = await sb.from('products').select('*').order('sort_order')
        setProducts(data || [])
        setLoading(false)
    }

    useEffect(() => { load() }, [])

    function openNew() {
        setEditing({ ...BLANK })
        setView('form')
    }

    function openEdit(p: Product) {
        setEditing({ ...p })
        setView('form')
    }

    async function save() {
        if (!editing.name?.trim()) { showToast('❌ Product name is required'); return }
        if (!editing.price || editing.price <= 0) { showToast('❌ Price must be greater than 0'); return }
        setSaving(true)

        const payload = {
            ...editing,
            price: Number(editing.price),
            discount_percent: Number(editing.discount_percent || 0),
            sort_order: Number(editing.sort_order || 0),
            updated_at: new Date().toISOString(),
        }

        const { error } = editing.id
            ? await sb.from('products').update(payload).eq('id', editing.id)
            : await sb.from('products').insert(payload)

        setSaving(false)
        if (error) { showToast('❌ Save failed: ' + error.message); return }
        showToast(editing.id ? '✅ Product updated!' : '✅ Product created!')
        await load()
        setView('grid')
    }

    async function toggleAvailable(p: Product) {
        await sb.from('products').update({ is_available: !p.is_available }).eq('id', p.id)
        setProducts(prev => prev.map(x => x.id === p.id ? { ...x, is_available: !x.is_available } : x))
        showToast(p.is_available ? '⚠️ Marked as out of stock' : '✅ Marked as available')
    }

    async function deleteProduct(p: Product) {
        if (!confirm(`Delete "${p.name}"?\n\nThis cannot be undone.`)) return
        await sb.from('products').delete().eq('id', p.id)
        setProducts(prev => prev.filter(x => x.id !== p.id))
        showToast('🗑️ Product deleted')
    }

    async function uploadImage(file: File) {
        const allowed = ['image/jpeg', 'image/png', 'image/webp']
        if (!allowed.includes(file.type)) { showToast('❌ Only JPG, PNG or WebP images'); return }
        if (file.size > 8 * 1024 * 1024) { showToast('❌ Image must be under 8MB'); return }

        setUploading(true)
        const ext = file.name.split('.').pop()
        const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { data, error } = await sb.storage.from('products').upload(path, file, { upsert: true })

        if (error || !data) {
            // Try site-images bucket as fallback
            const { data: d2, error: e2 } = await sb.storage.from('site-images').upload(path, file, { upsert: true })
            if (e2 || !d2) { showToast('❌ Upload failed — check storage bucket exists'); setUploading(false); return }
            const { data: { publicUrl } } = sb.storage.from('site-images').getPublicUrl(d2.path)
            setEditing(prev => ({ ...prev, image_url: publicUrl }))
        } else {
            const { data: { publicUrl } } = sb.storage.from('products').getPublicUrl(data.path)
            setEditing(prev => ({ ...prev, image_url: publicUrl }))
        }
        setUploading(false)
        showToast('✅ Image uploaded!')
    }

    const categories = ['All', ...CATEGORIES]
    const displayed = products.filter(p => {
        const matchCat = filter === 'All' || p.category === filter
        const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase())
        return matchCat && matchSearch
    })

    const inp = 'w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-orange-400 focus:outline-none transition-colors bg-white'
    const lbl = 'block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5'

    // ── FORM VIEW ──
    if (view === 'form') return (
        <div className="p-6 max-w-2xl">
            {toast && <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl text-sm shadow-xl">{toast}</div>}

            <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setView('grid')} className="text-sm text-gray-400 hover:text-gray-700 transition-colors">
                    ← Back to products
                </button>
                <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {editing.id ? '✏️ Edit Product' : '➕ New Product'}
                </h1>
            </div>

            <div className="space-y-5 pb-16">

                {/* Image upload */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <label className={lbl}>Product Photo</label>
                    {editing.image_url && (
                        <div className="relative mb-3">
                            <img src={editing.image_url} className="w-full h-44 object-cover rounded-xl border" alt="preview" />
                            <button onClick={() => setEditing(p => ({ ...p, image_url: '' }))}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-7 h-7 text-sm flex items-center justify-center font-bold shadow">
                                ✕
                            </button>
                        </div>
                    )}
                    <label className={`flex items-center gap-3 p-4 border-2 border-dashed rounded-xl cursor-pointer transition-all ${uploading ? 'border-orange-300 bg-orange-50' : 'border-gray-200 hover:border-orange-400 hover:bg-orange-50'}`}>
                        <span className="text-2xl">{uploading ? '⏳' : '📸'}</span>
                        <div>
                            <p className="text-sm font-semibold text-gray-700">{uploading ? 'Uploading...' : 'Upload food photo'}</p>
                            <p className="text-xs text-gray-400">JPG, PNG, WebP · Max 8MB</p>
                        </div>
                        <input type="file" accept="image/*" className="hidden" disabled={uploading}
                            onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f) }} />
                    </label>
                </div>

                {/* Basic info */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
                    <h3 className="font-bold text-gray-700 text-sm uppercase tracking-widest">Basic Information</h3>

                    <div>
                        <label className={lbl}>Product Name *</label>
                        <input className={inp} value={editing.name || ''} placeholder="e.g. Gold Tier Celebration Cake"
                            onChange={e => setEditing(p => ({ ...p, name: e.target.value }))} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={lbl}>Category *</label>
                            <select className={inp} value={editing.category || ''}
                                onChange={e => setEditing(p => ({ ...p, category: e.target.value }))}>
                                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={lbl}>Price (£) *</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">£</span>
                                <input className={`${inp} pl-7`} type="number" step="0.01" min="0"
                                    value={editing.price || ''} placeholder="0.00"
                                    onChange={e => setEditing(p => ({ ...p, price: parseFloat(e.target.value) || 0 }))} />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className={lbl}>Short Description (shown on card)</label>
                        <textarea className={inp} rows={2} maxLength={200}
                            placeholder="e.g. A stunning handcrafted cake made fresh to your exact specifications..."
                            value={editing.description || ''}
                            onChange={e => setEditing(p => ({ ...p, description: e.target.value }))} />
                        <p className="text-xs text-right text-gray-300 mt-1">{(editing.description || '').length}/200</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={lbl}>Badge Label (optional)</label>
                            <input className={inp} value={editing.badge || ''} placeholder="e.g. BEST SELLER, NEW, HOT"
                                onChange={e => setEditing(p => ({ ...p, badge: e.target.value }))} />
                        </div>
                        <div>
                            <label className={lbl}>Display Order</label>
                            <input className={inp} type="number" value={editing.sort_order || 0}
                                onChange={e => setEditing(p => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))} />
                        </div>
                    </div>
                </div>

                {/* Options & Flavours */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
                    <h3 className="font-bold text-gray-700 text-sm uppercase tracking-widest">Options & Variants</h3>

                    <div>
                        <label className={lbl}>Size / Quantity Options</label>
                        <input className={inp} value={editing.options || ''}
                            placeholder="1 Tier, 2 Tier, 3 Tier, 4 Tier"
                            onChange={e => setEditing(p => ({ ...p, options: e.target.value }))} />
                        <p className="text-xs text-gray-400 mt-1">Separate each option with a comma</p>
                    </div>

                    <div>
                        <label className={lbl}>Available Flavours</label>
                        <input className={inp} value={editing.flavours || ''}
                            placeholder="Vanilla, Chocolate, Red Velvet, Lemon"
                            onChange={e => setEditing(p => ({ ...p, flavours: e.target.value }))} />
                        <p className="text-xs text-gray-400 mt-1">Separate each flavour with a comma</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={lbl}>Serves</label>
                            <input className={inp} value={editing.serves || ''} placeholder="e.g. 10–15 people"
                                onChange={e => setEditing(p => ({ ...p, serves: e.target.value }))} />
                        </div>
                        <div>
                            <label className={lbl}>Advance Notice Required</label>
                            <input className={inp} value={editing.notice || ''} placeholder="e.g. 5 days notice"
                                onChange={e => setEditing(p => ({ ...p, notice: e.target.value }))} />
                        </div>
                    </div>
                </div>

                {/* Ingredients & Allergens */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
                    <h3 className="font-bold text-gray-700 text-sm uppercase tracking-widest">Ingredients & Allergens</h3>

                    <div>
                        <label className={lbl}>Ingredients</label>
                        <textarea className={inp} rows={3}
                            placeholder="e.g. Flour, butter, eggs, sugar, vanilla extract, milk..."
                            value={editing.ingredients || ''}
                            onChange={e => setEditing(p => ({ ...p, ingredients: e.target.value }))} />
                    </div>

                    <div>
                        <label className={lbl}>Allergen Information ⚠️</label>
                        <textarea className={inp} rows={2}
                            placeholder="e.g. Contains: Gluten, Dairy, Eggs. May contain nuts."
                            value={editing.allergens || ''}
                            onChange={e => setEditing(p => ({ ...p, allergens: e.target.value }))} />
                        <p className="text-xs text-orange-500 mt-1 font-semibold">
                            ⚠️ Be thorough — customer safety depends on this information
                        </p>
                    </div>
                </div>

                {/* Availability & Discount */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
                    <h3 className="font-bold text-gray-700 text-sm uppercase tracking-widest">Availability & Pricing</h3>

                    {/* Available toggle */}
                    <div className="flex items-center justify-between p-4 rounded-xl"
                        style={{ background: editing.is_available ? '#f0fdf4' : '#fef2f2' }}>
                        <div>
                            <p className="font-bold text-sm" style={{ color: editing.is_available ? '#166534' : '#991b1b' }}>
                                {editing.is_available ? '✅ Available — customers can order' : '❌ Out of Stock — hidden from ordering'}
                            </p>
                            <p className="text-xs mt-0.5" style={{ color: editing.is_available ? '#16a34a' : '#dc2626' }}>
                                Toggle to mark as out of stock
                            </p>
                        </div>
                        <button type="button"
                            onClick={() => setEditing(p => ({ ...p, is_available: !p.is_available }))}
                            className="relative w-12 h-6 rounded-full transition-colors"
                            style={{ background: editing.is_available ? '#16a34a' : '#dc2626' }}>
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${editing.is_available ? 'left-7' : 'left-1'}`} />
                        </button>
                    </div>

                    {/* Stock note */}
                    {!editing.is_available && (
                        <div>
                            <label className={lbl}>Out of Stock Message (optional)</label>
                            <input className={inp} value={editing.stock_note || ''}
                                placeholder="e.g. Back in stock after Christmas, Available from January"
                                onChange={e => setEditing(p => ({ ...p, stock_note: e.target.value }))} />
                        </div>
                    )}

                    {/* Featured toggle */}
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                        <div>
                            <p className="font-bold text-sm text-blue-800">
                                {editing.is_featured ? '⭐ Featured on homepage' : '○ Not featured'}
                            </p>
                            <p className="text-xs text-blue-600 mt-0.5">Featured products appear in "Customer Favourites"</p>
                        </div>
                        <button type="button"
                            onClick={() => setEditing(p => ({ ...p, is_featured: !p.is_featured }))}
                            className="relative w-12 h-6 rounded-full transition-colors"
                            style={{ background: editing.is_featured ? '#2563eb' : '#9ca3af' }}>
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${editing.is_featured ? 'left-7' : 'left-1'}`} />
                        </button>
                    </div>

                    {/* Discount */}
                    <div className="p-4 bg-green-50 rounded-xl">
                        <p className="font-bold text-sm text-green-800 mb-3">🏷️ Discount / Special Offer</p>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className={lbl}>Discount %</label>
                                <div className="relative">
                                    <input className={`${inp} pr-8`} type="number" min="0" max="100"
                                        value={editing.discount_percent || ''}
                                        placeholder="0"
                                        onChange={e => setEditing(p => ({ ...p, discount_percent: parseInt(e.target.value) || 0 }))} />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
                                </div>
                            </div>
                            <div>
                                <label className={lbl}>Discount Label</label>
                                <input className={inp} value={editing.discount_label || ''}
                                    placeholder="e.g. Christmas Sale"
                                    onChange={e => setEditing(p => ({ ...p, discount_label: e.target.value }))} />
                            </div>
                        </div>
                        {(editing.discount_percent || 0) > 0 && (
                            <p className="text-xs text-green-700 mt-2 font-semibold">
                                Original: £{editing.price?.toFixed(2)} →
                                Sale: £{((editing.price || 0) * (1 - (editing.discount_percent || 0) / 100)).toFixed(2)}
                            </p>
                        )}
                    </div>
                </div>

                {/* Save button */}
                <div className="flex gap-3">
                    <button onClick={save} disabled={saving}
                        className="flex-1 py-4 rounded-2xl font-bold text-white text-sm disabled:opacity-50"
                        style={{ background: '#C8401A' }}>
                        {saving ? '⏳ Saving...' : (editing.id ? '✅ Save Changes' : '➕ Create Product')}
                    </button>
                    <button onClick={() => setView('grid')}
                        className="px-6 py-4 rounded-2xl font-semibold text-gray-600 bg-gray-100 text-sm hover:bg-gray-200 transition-colors">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    )

    // ── GRID VIEW ──
    const available = products.filter(p => p.is_available).length
    const outOfStock = products.filter(p => !p.is_available).length
    const withDiscount = products.filter(p => p.discount_percent > 0).length

    return (
        <div className="p-6">
            {toast && <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl text-sm shadow-xl">{toast}</div>}

            {/* Header */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Products
                    </h1>
                    <p className="text-sm text-gray-400 mt-1">
                        {products.length} total · {available} available · {outOfStock} out of stock · {withDiscount} on discount
                    </p>
                </div>
                <button onClick={openNew}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-sm shadow-md"
                    style={{ background: '#C8401A' }}>
                    ➕ Add New Product
                </button>
            </div>

            {/* Seed button — only show if no products */}
            {products.length === 0 && !loading && (
                <div className="mb-6 p-5 bg-orange-50 border-2 border-orange-200 rounded-2xl">
                    <p className="font-bold text-orange-800 mb-1">🍰 No products yet!</p>
                    <p className="text-sm text-orange-700 mb-3">Load sample products to get started quickly, then edit them to match your real menu.</p>
                    <button
                        onClick={async () => {
                            const res = await fetch('/api/admin/seed-products', { method: 'POST' })
                            const data = await res.json()
                            if (data.success) { showToast('✅ Sample products loaded!'); load() }
                            else showToast('❌ ' + data.error)
                        }}
                        className="px-5 py-2.5 rounded-xl text-white font-bold text-sm"
                        style={{ background: '#C8401A' }}>
                        Load Sample Products
                    </button>
                </div>
            )}

            {/* Search + filter */}
            <div className="flex gap-3 mb-5 flex-wrap">
                <div className="relative flex-1 min-w-48">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                    <input className="w-full pl-9 pr-4 py-2.5 rounded-xl border-2 border-gray-200 text-sm focus:border-orange-300 focus:outline-none bg-white"
                        placeholder="Search products..."
                        value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {categories.map(cat => (
                        <button key={cat} onClick={() => setFilter(cat)}
                            className="px-4 py-2 rounded-full text-xs font-bold transition-all"
                            style={{
                                background: filter === cat ? '#C8401A' : 'white',
                                color: filter === cat ? 'white' : '#7A6555',
                                border: filter === cat ? 'none' : '1.5px solid #e5e0d8',
                            }}>
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Products grid */}
            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse" />)}
                </div>
            ) : displayed.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
                    <p className="text-5xl mb-3">📦</p>
                    <p className="font-bold text-gray-700 mb-1">No products found</p>
                    <p className="text-sm text-gray-400">Try a different filter or add a new product</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {displayed.map(p => (
                        <div key={p.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            {/* Image */}
                            <div className="relative h-40 overflow-hidden bg-gray-50">
                                {p.image_url ? (
                                    <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-4xl text-gray-200">🍰</div>
                                )}
                                {/* Status overlay */}
                                {!p.is_available && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                        <span className="bg-red-500 text-white text-xs font-black px-3 py-1 rounded-full uppercase">
                                            Out of Stock
                                        </span>
                                    </div>
                                )}
                                {/* Discount badge */}
                                {p.discount_percent > 0 && (
                                    <span className="absolute top-2 right-2 bg-green-500 text-white text-xs font-black px-2 py-1 rounded-full">
                                        -{p.discount_percent}%
                                    </span>
                                )}
                                {/* Featured badge */}
                                {p.is_featured && (
                                    <span className="absolute top-2 left-2 bg-blue-500 text-white text-xs font-black px-2 py-1 rounded-full">
                                        ⭐
                                    </span>
                                )}
                            </div>

                            {/* Info */}
                            <div className="p-3">
                                <p className="text-[10px] uppercase tracking-wider text-orange-500 font-bold mb-0.5">{p.category}</p>
                                <p className="font-bold text-sm text-gray-900 truncate mb-1"
                                    style={{ fontFamily: "'Playfair Display', serif" }}>
                                    {p.name}
                                </p>
                                <div className="flex items-center gap-1.5 mb-3">
                                    <span className="font-bold text-gray-900">£{p.price.toFixed(2)}</span>
                                    {p.discount_percent > 0 && (
                                        <span className="text-xs text-green-600 font-bold">
                                            → £{(p.price * (1 - p.discount_percent / 100)).toFixed(2)}
                                        </span>
                                    )}
                                </div>

                                {/* Action buttons */}
                                <div className="flex gap-1.5">
                                    <button onClick={() => openEdit(p)}
                                        className="flex-1 py-2 rounded-lg text-xs font-bold bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors">
                                        ✏️ Edit
                                    </button>
                                    <button onClick={() => toggleAvailable(p)}
                                        className="flex-1 py-2 rounded-lg text-xs font-bold transition-colors"
                                        style={{
                                            background: p.is_available ? '#fef2f2' : '#f0fdf4',
                                            color: p.is_available ? '#dc2626' : '#16a34a'
                                        }}>
                                        {p.is_available ? '❌ Stock' : '✅ Stock'}
                                    </button>
                                    <button onClick={() => deleteProduct(p)}
                                        className="py-2 px-2.5 rounded-lg text-xs font-bold bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
