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
    options: string[]
    flavours: string[]
    discount_percent: number
    discount_label: string
    stock_note: string
}

export default function MenuPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [activeCategory, setActiveCategory] = useState('All')
    const [search, setSearch] = useState('')
    const [selected, setSelected] = useState<Product | null>(null)
    const [selectedOption, setSelectedOption] = useState('')
    const [selectedFlavour, setSelectedFlavour] = useState('')
    const [addedId, setAddedId] = useState<string | null>(null)

    useEffect(() => {
        async function load() {
            setLoading(true)
            const { data } = await sb
                .from('products')
                .select('*')
                .order('sort_order', { ascending: true })
            setProducts(data || [])
            setLoading(false)
        }
        load()
    }, [])

    const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))]

    const filtered = products.filter(p => {
        const matchCat = activeCategory === 'All' || p.category === activeCategory
        const matchSearch = !search ||
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.category.toLowerCase().includes(search.toLowerCase())
        return matchCat && matchSearch
    })

    function openProduct(product: Product) {
        setSelected(product)
        const opts = Array.isArray(product.options) ? product.options : []
        const flavs = Array.isArray(product.flavours) ? product.flavours : []
        setSelectedOption(opts[0] || '')
        setSelectedFlavour(flavs[0] || '')
    }

    function discountedPrice(product: Product) {
        if (!product.discount_percent) return product.price
        return product.price * (1 - product.discount_percent / 100)
    }

    function handleAddToCart(product: Product) {
        // Add to cart logic — fire and show confirmation
        setAddedId(product.id)
        setTimeout(() => setAddedId(null), 2000)
        setSelected(null)
    }

    return (
        <div className="min-h-screen" style={{ background: '#FAF7F2', paddingTop: '72px' }}>

            {/* HERO */}
            <div className="text-center py-16 px-4">
                <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3"
                    style={{ color: '#C8401A' }}>
                    Handcrafted with Love
                </p>
                <h1 style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                    fontWeight: 700, color: '#1A0800', lineHeight: 1.1, marginBottom: '16px'
                }}>
                    Our <span style={{ color: '#C8401A', fontStyle: 'italic' }}>Menu</span>
                </h1>
                <p style={{ color: '#7A6555', fontSize: '1.05rem', maxWidth: '560px', margin: '0 auto' }}>
                    Handcrafted Nigerian pastries and artisanal bakes,
                    made fresh daily with love and the finest ingredients.
                </p>
            </div>

            {/* SEARCH + CATEGORIES */}
            <div className="max-w-6xl mx-auto px-4 mb-8">
                {/* Search bar */}
                <div className="relative max-w-sm mb-6">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                    <input
                        type="text"
                        placeholder="Search our delicious bakes..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-2xl border-2 border-gray-100 bg-white text-sm focus:outline-none focus:border-orange-300 transition-colors"
                    />
                </div>

                {/* Category tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2 mb-6" style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className="px-5 py-2.5 rounded-full text-sm font-semibold transition-all flex-shrink-0"
                            style={{
                                background: activeCategory === cat ? '#C8401A' : 'white',
                                color: activeCategory === cat ? 'white' : '#7A6555',
                                border: activeCategory === cat ? 'none' : '1.5px solid #e5e0d8',
                                boxShadow: activeCategory === cat ? '0 4px 16px rgba(200,64,26,0.3)' : 'none',
                            }}>
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* PRODUCT GRID */}
            <div className="max-w-6xl mx-auto px-4 pb-20">
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                                <div className="h-52 bg-gray-100" />
                                <div className="p-4 space-y-2">
                                    <div className="h-4 bg-gray-100 rounded w-3/4" />
                                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-5xl mb-4">🍰</p>
                        <p className="text-xl font-bold text-gray-700 mb-2">Nothing found</p>
                        <p className="text-gray-400">Try a different search or category</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
                        {filtered.map(product => {
                            const finalPrice = discountedPrice(product)
                            const hasDiscount = product.discount_percent > 0
                            const isAdded = addedId === product.id

                            return (
                                <div
                                    key={product.id}
                                    onClick={() => product.is_available && openProduct(product)}
                                    className="bg-white rounded-2xl overflow-hidden group transition-all duration-300"
                                    style={{
                                        boxShadow: '0 2px 12px rgba(26,8,0,0.06)',
                                        cursor: product.is_available ? 'pointer' : 'default',
                                        opacity: product.is_available ? 1 : 0.7,
                                    }}
                                    onMouseEnter={e => {
                                        if (product.is_available) {
                                            (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'
                                                ; (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 36px rgba(26,8,0,0.13)'
                                        }
                                    }}
                                    onMouseLeave={e => {
                                        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
                                            ; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(26,8,0,0.06)'
                                    }}
                                >
                                    {/* Image */}
                                    <div className="relative overflow-hidden" style={{ height: '190px' }}>
                                        <img
                                            src={product.image_url || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400'}
                                            alt={product.name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        {/* Badge */}
                                        {product.badge && product.is_available && (
                                            <span className="absolute top-2.5 left-2.5 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide"
                                                style={{ background: '#C8401A', color: 'white' }}>
                                                {product.badge}
                                            </span>
                                        )}
                                        {/* Out of stock */}
                                        {!product.is_available && (
                                            <div className="absolute inset-0 flex items-center justify-center"
                                                style={{ background: 'rgba(0,0,0,0.5)' }}>
                                                <span className="bg-white text-gray-800 font-black text-xs px-4 py-2 rounded-full uppercase tracking-widest">
                                                    {product.stock_note || 'Out of Stock'}
                                                </span>
                                            </div>
                                        )}
                                        {/* Discount */}
                                        {hasDiscount && product.is_available && (
                                            <span className="absolute top-2.5 right-2.5 text-[10px] font-black px-2 py-1 rounded-full"
                                                style={{ background: '#16a34a', color: 'white' }}>
                                                -{product.discount_percent}%
                                            </span>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="p-4">
                                        <p className="text-[10px] uppercase tracking-wider font-semibold mb-1"
                                            style={{ color: '#C8401A' }}>
                                            {product.category}
                                        </p>
                                        <h3 className="font-bold text-sm leading-tight mb-2"
                                            style={{ fontFamily: "'Playfair Display', serif", color: '#1A0800' }}>
                                            {product.name}
                                        </h3>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="font-bold text-base"
                                                    style={{ fontFamily: "'Playfair Display', serif", color: '#1A0800' }}>
                                                    £{finalPrice.toFixed(2)}
                                                </span>
                                                {hasDiscount && (
                                                    <span className="text-xs text-gray-400 line-through ml-1.5">
                                                        £{product.price.toFixed(2)}
                                                    </span>
                                                )}
                                            </div>
                                            {product.is_available && (
                                                <span className="text-xs text-orange-500 font-semibold">
                                                    View →
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* PRODUCT DETAIL MODAL */}
            {selected && (
                <div
                    className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4"
                    style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
                    onClick={() => setSelected(null)}
                >
                    <div
                        className="bg-white w-full md:max-w-lg rounded-t-3xl md:rounded-3xl overflow-hidden"
                        style={{ maxHeight: '92vh', overflowY: 'auto' }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Product image */}
                        <div className="relative" style={{ height: '240px' }}>
                            <img
                                src={selected.image_url || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600'}
                                alt={selected.name}
                                className="w-full h-full object-cover"
                            />
                            <button
                                onClick={() => setSelected(null)}
                                className="absolute top-4 right-4 bg-white/90 backdrop-blur rounded-full w-9 h-9 flex items-center justify-center font-bold text-gray-700 shadow"
                            >
                                ✕
                            </button>
                            {selected.badge && (
                                <span className="absolute top-4 left-4 text-xs font-black px-3 py-1.5 rounded-full uppercase"
                                    style={{ background: '#C8401A', color: 'white' }}>
                                    {selected.badge}
                                </span>
                            )}
                            {selected.discount_percent > 0 && (
                                <span className="absolute bottom-4 left-4 text-sm font-black px-3 py-1.5 rounded-full"
                                    style={{ background: '#16a34a', color: 'white' }}>
                                    {selected.discount_percent}% OFF — {selected.discount_label}
                                </span>
                            )}
                        </div>

                        <div className="p-6">
                            {/* Name + Price */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1 pr-4">
                                    <p className="text-xs uppercase tracking-widest font-semibold mb-1"
                                        style={{ color: '#C8401A' }}>
                                        {selected.category}
                                    </p>
                                    <h2 className="text-2xl font-bold"
                                        style={{ fontFamily: "'Playfair Display', serif", color: '#1A0800' }}>
                                        {selected.name}
                                    </h2>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="text-2xl font-bold"
                                        style={{ fontFamily: "'Playfair Display', serif", color: '#C8401A' }}>
                                        £{discountedPrice(selected).toFixed(2)}
                                    </p>
                                    {selected.discount_percent > 0 && (
                                        <p className="text-sm text-gray-400 line-through">
                                            £{selected.price.toFixed(2)}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Description */}
                            <p className="text-gray-600 leading-relaxed mb-5 text-sm">
                                {selected.description}
                            </p>

                            {/* Quick info chips */}
                            <div className="flex flex-wrap gap-2 mb-5">
                                {selected.serves && (
                                    <span className="flex items-center gap-1.5 bg-orange-50 text-orange-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                                        👥 Serves {selected.serves}
                                    </span>
                                )}
                                {selected.notice && (
                                    <span className="flex items-center gap-1.5 bg-amber-50 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                                        ⏰ {selected.notice}
                                    </span>
                                )}
                                <span className="flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                                    🚚 UK-wide delivery
                                </span>
                                <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                                    ✨ Made fresh to order
                                </span>
                            </div>

                            {/* Options selector */}
                            {Array.isArray(selected.options) && selected.options.length > 0 && (
                                <div className="mb-4">
                                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                                        Size / Quantity
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {selected.options.map(opt => (
                                            <button key={opt}
                                                onClick={() => setSelectedOption(opt)}
                                                className="px-4 py-2 rounded-xl text-sm font-semibold transition-all border-2"
                                                style={{
                                                    borderColor: selectedOption === opt ? '#C8401A' : '#e5e0d8',
                                                    background: selectedOption === opt ? '#fff5f2' : 'white',
                                                    color: selectedOption === opt ? '#C8401A' : '#7A6555',
                                                }}>
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Flavour selector */}
                            {Array.isArray(selected.flavours) && selected.flavours.length > 0 && (
                                <div className="mb-5">
                                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                                        Flavour
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {selected.flavours.map(fl => (
                                            <button key={fl}
                                                onClick={() => setSelectedFlavour(fl)}
                                                className="px-4 py-2 rounded-xl text-sm font-semibold transition-all border-2"
                                                style={{
                                                    borderColor: selectedFlavour === fl ? '#C8401A' : '#e5e0d8',
                                                    background: selectedFlavour === fl ? '#fff5f2' : 'white',
                                                    color: selectedFlavour === fl ? '#C8401A' : '#7A6555',
                                                }}>
                                                {fl}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Ingredients */}
                            {selected.ingredients && (
                                <details className="mb-3">
                                    <summary className="cursor-pointer text-sm font-bold text-gray-700 py-3 border-t border-gray-100 flex items-center justify-between">
                                        <span>🥣 Ingredients</span>
                                        <span className="text-gray-400 text-xs">Tap to expand</span>
                                    </summary>
                                    <p className="text-sm text-gray-500 leading-relaxed pt-2 pb-3">
                                        {selected.ingredients}
                                    </p>
                                </details>
                            )}

                            {/* Allergens */}
                            {selected.allergens && (
                                <div className="mb-5 p-4 rounded-2xl border-2 border-amber-100 bg-amber-50">
                                    <p className="text-xs font-bold uppercase tracking-widest text-amber-700 mb-2">
                                        ⚠️ Allergen Information
                                    </p>
                                    <p className="text-sm text-amber-800 leading-relaxed">
                                        {selected.allergens}
                                    </p>
                                    <p className="text-xs text-amber-600 mt-2 font-semibold">
                                        For specific allergen queries, please WhatsApp us before ordering.
                                    </p>
                                </div>
                            )}

                            {/* Add to cart + WhatsApp */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => handleAddToCart(selected)}
                                    className="flex-1 py-4 rounded-2xl text-white font-bold text-sm transition-all"
                                    style={{ background: '#C8401A' }}>
                                    🛒 Add to Cart
                                </button>
                                <a
                                    href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP || '447000000000'}?text=Hi! I'd like to order: ${selected.name}${selectedOption ? ` (${selectedOption})` : ''}${selectedFlavour ? ` - ${selectedFlavour}` : ''}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-5 py-4 rounded-2xl font-bold text-sm flex items-center justify-center border-2 transition-all"
                                    style={{ borderColor: '#25D366', color: '#25D366' }}>
                                    💬 WhatsApp
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
