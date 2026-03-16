"use client";

import { motion } from "framer-motion";
import { ArrowRight, Star, Clock, ShieldCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { NewsletterForm } from "@/components/ui/NewsletterForm";
import { useCartStore } from "@/store/useCartStore";
import { ProductDetailModal } from "@/components/ui/ProductDetailModal";
import { Product } from "@/store/useCartStore";
import React from "react";
import toast from "react-hot-toast";
import { ContentMap } from "@/lib/content";

// We'll move CATEGORIES inside the component to use images

const FEATURED_ITEMS = [
  { id: "f1", name: "Gold Tier Celebration Cake", price: 65.00, originalPrice: undefined, badge: "BEST SELLER" as const, rating: 4.9, image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=600", category: "Celebration Cakes", description: "Luxurious 3-tier vanilla sponge with Italian meringue buttercream.", reviewCount: 84, isAvailable: true, isFeatured: true },
  { id: "f2", name: "Small Chops Platter (30 pcs)", price: 35.00, badge: "SIGNATURE" as const, rating: 5.0, image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=600", category: "Small Chops", description: "The party crowd pleaser — puff puff, samosas, mini spring rolls, and more.", reviewCount: 214, isAvailable: true, isFeatured: true },
  { id: "f3", name: "Classic Chin Chin Bag 500g", price: 8.50, badge: "NEW" as const, rating: 4.8, image: "https://images.unsplash.com/photo-1464305795204-6f5bbfc7fb81?auto=format&fit=crop&q=80&w=600", category: "Chin Chin & Snacks", description: "Crunchy, golden, slightly sweet — just like grandma used to make.", reviewCount: 196, isAvailable: true, isFeatured: true },
  { id: "f4", name: "Premium Party Box", price: 85.00, originalPrice: 100.00, badge: "PREMIUM" as const, rating: 4.9, image: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&q=80&w=600", category: "Party Boxes", description: "Feeds 15 guests — small chops, chin chin, puff puff and a celebration cake slice.", reviewCount: 47, isAvailable: true, isFeatured: true },
  { id: "f5", name: "Puff Puff Dozen", price: 6.00, badge: "MUST TRY" as const, rating: 4.9, image: "https://images.unsplash.com/photo-1618897996318-5a901fa0807c?auto=format&fit=crop&q=80&w=600", category: "Puff Puff", description: "Soft, fluffy, deep-fried West African doughnuts. The ultimate party snack.", reviewCount: 388, isAvailable: true, isFeatured: true },
];

const BADGE_COLORS: Record<string, string> = {
  "BEST SELLER": "bg-[#D4421A] text-white",
  "SIGNATURE": "bg-purple-600 text-white",
  "NEW": "bg-green-600 text-white",
  "PREMIUM": "bg-[#D4AF37] text-[#3D1A0F]",
  "MUST TRY": "bg-red-600 text-white",
};

export function HomePageClient({ content, settings, images }: { content: ContentMap, settings?: Record<string, string>, images?: Record<string, string> }) {
  const addItem = useCartStore((s) => s.addItem);
  const carouselRef = React.useRef<HTMLDivElement>(null);
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);

  const fallbackImages = {
    heroImage: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=85&w=900",
    cakesImage: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=600",
    smallchopsImage: "https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&q=80&w=600",
    chinChinImage: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&q=80&w=600",
    partyBoxImage: "https://images.unsplash.com/photo-1548940740-204726a19be3?auto=format&fit=crop&q=80&w=600"
  };

  const imgs = images || fallbackImages;

  const CATEGORIES = [
    {
      name: "Celebration Cakes",
      count: 14,
      href: "/menu?category=Celebration Cakes",
      image: imgs.cakesImage,
    },
    {
      name: "Small Chops",
      count: 12,
      href: "/menu?category=Small Chops",
      image: imgs.smallchopsImage,
    },
    {
      name: "Chin Chin & Snacks",
      count: 8,
      href: "/menu?category=Chin Chin & Snacks",
      image: imgs.chinChinImage,
    },
    {
      name: "Party Boxes",
      count: 6,
      href: "/menu?category=Party Boxes",
      image: imgs.partyBoxImage,
    },
  ];

  const scroll = (dir: "left" | "right") => {
    if (!carouselRef.current) return;
    carouselRef.current.scrollBy({ left: dir === "right" ? 420 : -420, behavior: "smooth" });
  };

  const openProduct = (item: typeof FEATURED_ITEMS[0]) => {
    setSelectedProduct(item as unknown as Product);
    setIsDetailOpen(true);
  };

  return (
    <div className="w-full">
      {/* ────────── HERO SECTION — LUXURY REDESIGN ────────── */}
      <section className="relative" style={{
        background: 'var(--cream)',
        minHeight: '100vh',
        paddingTop: '68px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 480px), 1fr))',
        alignItems: 'stretch',
        overflow: 'hidden'
      }}>
        {/* Decorative elements */}
        <div className="absolute top-[-10%] right-[-5%] w-[65%] h-[65%] rounded-full blur-[120px] opacity-40 -z-10" style={{ background: 'var(--gold-light)' }} />
        <div className="absolute bottom-[-10%] left-[-5%] w-[45%] h-[45%] rounded-full blur-[100px] opacity-20 -z-10" style={{ background: 'var(--orange-brand)' }} />

        <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.9, ease: "easeOut" }} style={{
          padding: 'clamp(32px, 6vw, 80px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          paddingTop: 'clamp(48px, 8vw, 80px)',
        }}>
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/60 backdrop-blur-md border border-bakery-cta/10 text-bakery-cta text-[11px] font-black uppercase tracking-[0.2em] shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-bakery-cta animate-ping" />
            {content['hero.badge'] || '🇬🇧 Proudly Serving London & Beyond'}
          </div>

          <h1 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontWeight: 700,
            color: '#1A0800',
            lineHeight: 1.08,
            letterSpacing: '-0.01em',
            fontSize: 'clamp(2.2rem, 8vw, 5rem)',
            marginBottom: '20px',
          }}>
            <span style={{ display: 'block' }}>Baking Joy,</span>
            <span style={{ display: 'block' }}>
              <span style={{ color: '#C8401A', fontStyle: 'italic' }}>One Bite</span>
            </span>
            <span style={{ display: 'block' }}>At A Time.</span>
          </h1>

          <p style={{
            fontSize: 'clamp(0.9rem, 2.5vw, 1.05rem)',
            color: '#7A6555',
            lineHeight: 1.75,
            maxWidth: '480px',
            marginBottom: '32px',
          }}>
            Premium Nigerian pastries handcrafted with love —
            from celebration cakes to party platters,
            delivered fresh across the UK.
          </p>

          <div className="sm:flex sm:flex-row sm:items-center sm:gap-3">
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              marginBottom: '32px',
            }}>
              <a href="/menu" style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: '#C8401A',
                color: 'white',
                padding: '16px 32px',
                borderRadius: '50px',
                fontWeight: 700,
                fontSize: '14px',
                letterSpacing: '0.02em',
                textDecoration: 'none',
                boxShadow: '0 8px 24px rgba(200,64,26,0.32)',
                transition: 'all 0.2s',
                width: '100%',
                maxWidth: '320px',
              }}>
                🛒 Order Fresh Now
              </a>
              <a href="/menu" style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: 'transparent',
                color: '#C8401A',
                padding: '15px 32px',
                borderRadius: '50px',
                fontWeight: 700,
                fontSize: '14px',
                border: '1.5px solid rgba(200,64,26,0.4)',
                textDecoration: 'none',
                transition: 'all 0.2s',
                width: '100%',
                maxWidth: '320px',
              }}>
                View Our Menu →
              </a>
            </div>
          </div>

          {/* ── SOCIAL PROOF STRIP ── */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
            marginTop: '32px',
            paddingTop: '24px',
            borderTop: '1px solid rgba(184,134,11,0.2)',
          }}>
            {/* Stacked avatars — emoji based, never breaks */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {['👩🏾🦱', '👨🏿', '👩🏽', '👩🏾'].map((emoji, i) => (
                <div key={i} style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: ['#FEE2E2', '#FEF3C7', '#DCFCE7', '#DBEAFE'][i],
                  border: '2px solid white',
                  marginLeft: i === 0 ? 0 : '-10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  position: 'relative',
                  zIndex: 4 - i,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                }}>
                  {emoji}
                </div>
              ))}
            </div>

            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                marginBottom: '2px',
              }}>
                {'★★★★★'.split('').map((s, i) => (
                  <span key={i} style={{ color: '#D4A843', fontSize: '13px' }}>{s}</span>
                ))}
                <span style={{
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: 700,
                  fontSize: '14px',
                  color: '#1A0800',
                  marginLeft: '4px',
                }}>4.9/5</span>
              </div>
              <p style={{ fontSize: '11px', color: '#7A6555', fontWeight: 500 }}>
                from 500+ happy customers
              </p>
            </div>
          </div>
        </motion.div>

        {/* Right side — Image Showcase */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }} style={{
          minHeight: 'clamp(320px, 50vw, 100vh)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div className="relative aspect-square rounded-[60px] overflow-hidden luxury-shadow border-[12px] border-white/50 rotate-3 hover:rotate-0 transition-all duration-700 group">
            <Image
              src={imgs.heroImage}
              alt="Luxury Pastry"
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-1000"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-[#1C0A00]/40 to-transparent" />

            {/* Floating Price Tag */}
            <div className="absolute top-10 right-10 bg-white/90 backdrop-blur-md px-6 py-4 rounded-3xl shadow-2xl border border-white/20">
              <p className="text-[10px] font-black text-bakery-cta uppercase tracking-[0.2em] mb-1">Starting from</p>
              <p className="text-3xl font-black text-bakery-primary">£45.00</p>
            </div>
          </div>

          {/* Floating Badges */}
          <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 4, repeat: Infinity }} className="absolute -top-6 -left-6 bg-[#C9A84C] text-white p-5 rounded-[32px] shadow-2xl z-10">
            <ShieldCheck size={32} />
          </motion.div>

          <motion.div animate={{ y: [0, 15, 0] }} transition={{ duration: 5, repeat: Infinity, delay: 1 }} className="absolute -bottom-10 -right-6 bg-white p-6 rounded-[40px] shadow-2xl z-10 border border-bakery-primary/5 flex items-center gap-4">
            <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-bakery-cta">
              <Clock size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Rapid Delivery</p>
              <p className="text-lg font-black text-bakery-primary">Today 18:00</p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── STATS BAR ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '16px',
        padding: 'clamp(20px, 4vw, 40px) clamp(16px, 4vw, 80px)',
        background: 'white',
        borderTop: '1px solid rgba(184,134,11,0.1)',
        borderBottom: '1px solid rgba(184,134,11,0.1)',
      }}>
        {[
          { num: '500+', label: 'Happy Customers' },
          { num: '4.9/5', label: 'Star Rating' },
          { num: '45min', label: 'Fast Delivery' },
          { num: '100%', label: 'Fresh Daily' },
        ].map((stat, i) => (
          <div key={i} style={{
            textAlign: 'center',
            padding: '16px 8px',
            borderRadius: '16px',
            background: i % 2 === 0 ? '#FAF7F2' : 'white',
          }}>
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(1.4rem, 4vw, 1.9rem)',
              fontWeight: 700,
              color: '#1A0800',
              lineHeight: 1,
              marginBottom: '4px',
            }}>{stat.num}</div>
            <div style={{
              fontSize: '10px',
              color: '#7A6555',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontWeight: 600,
            }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ────────── DELIVERY BANNER ────────── */}
      <div className="bg-bakery-cta/5 border-y border-bakery-cta/10 py-4 px-6 overflow-hidden">
        <motion.p animate={{ x: [0, -800, 0] }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} style={{ fontSize: 'clamp(9px, 2.5vw, 11px)', whiteSpace: 'nowrap' }} className="font-bold text-bakery-primary/60">
          {`🚚 Free delivery on orders over £${settings?.free_delivery_over || '50'} · Minimum order £${settings?.min_order || '20'} · 🕐 Allow ${settings?.custom_cake_notice || '48h'} notice for custom cakes · 📍 ${settings?.delivery_areas || 'Delivering across the UK'}`} &nbsp;·&nbsp; {`🚚 Free delivery on orders over £${settings?.free_delivery_over || '50'} · Minimum order £${settings?.min_order || '20'} · 🕐 Allow ${settings?.custom_cake_notice || '48h'} notice for custom cakes · 📍 ${settings?.delivery_areas || 'Delivering across the UK'}`}
        </motion.p>
      </div>

      {/* ────────── CATEGORIES — FULL IMAGE CARDS ────────── */}
      <section className="py-24 px-6 md:px-12 bg-bakery-primary/[0.02]">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <div className="space-y-4">
              <Badge variant="highlight">{content['categories.badge'] || 'Shop by Cuisine'}</Badge>
              <h2 className="text-4xl md:text-6xl font-playfair font-black tracking-tighter">{content['categories.heading'] || 'Explore Categories'}</h2>
            </div>
            <Link href={content['categories.button_url'] || '/menu'}>
              <Button variant="ghost" className="text-bakery-cta font-black uppercase tracking-widest hover:bg-bakery-cta/5">
                {content['categories.button_text'] || 'View Full Menu'} <ArrowRight size={18} className="ml-2" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {CATEGORIES.map((cat) => (
              <Link key={cat.name} href={cat.href}>
                <motion.div
                  whileHover={{ y: -8 }}
                  className="group relative cursor-pointer rounded-2xl overflow-hidden"
                  style={{ height: "200px" }}
                >
                  {/* Full-frame food photo */}
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Dark gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Category info at bottom-left */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white leading-tight">{cat.name}</h3>
                      <p className="text-xs font-medium text-white/70">{cat.count} items</p>
                    </div>
                    {/* Arrow at bottom-right */}
                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-transform group-hover:translate-x-1">
                      <ArrowRight size={14} />
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ────────── CUSTOM ORDER PROMO ────────── */}
      <section className="py-12 px-6 md:px-12 bg-bakery-background">
        <div className="max-w-7xl mx-auto rounded-[40px] bg-[#4A3A35] p-10 md:p-16 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-bakery-cta/20 rounded-full blur-[80px]" />

          <div className="relative z-10 space-y-6 max-w-xl">
            <Badge variant="highlight" className="bg-bakery-cta text-white border-none">AI Custom Order</Badge>
            <h2 className="text-4xl md:text-5xl font-playfair font-black text-white tracking-tighter">
              Dream It. <span className="text-bakery-cta italic">We Bake It.</span>
            </h2>
            <p className="text-white/70 text-lg leading-relaxed font-medium">
              Experience our revolutionary AI custom order builder. Describe your perfect cake or pastry spread, see an instant AI-generated visual preview, and get a price estimate in seconds.
            </p>
            <Link href="/custom-order" className="inline-block pt-2">
              <Button size="lg" className="bg-bakery-cta hover:bg-white hover:text-[#4A3A35] text-white font-bold transition-all shadow-xl">
                Start Building <ArrowRight size={18} className="ml-2" />
              </Button>
            </Link>
          </div>

          <div className="relative z-10 w-full md:w-1/2 md:max-w-md aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500 border-4 border-white/10">
            <Image
              src="https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&q=80&w=800"
              alt="AI Custom Cakes"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-bakery-cta flex items-center justify-center text-white shrink-0">✨</div>
              <div>
                <h4 className="text-white font-bold text-sm leading-tight">Instant Visualization</h4>
                <p className="text-white/70 text-xs">Powered by AI technology</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────── SIGNATURE ITEMS CAROUSEL ────────── */}
      <section className="py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 mb-12 flex justify-between items-center">
          <div>
            <Badge variant="highlight" className="mb-3">{content['customer_favourites.badge'] || 'Signature Items'}</Badge>
            <h2 className="text-4xl md:text-5xl font-playfair font-black tracking-tighter italic">{content['customer_favourites.heading'] || 'Customer Favourites'}</h2>
          </div>
          <div className="flex gap-2">
            <button onClick={() => scroll("left")} className="p-4 rounded-full border border-bakery-primary/10 hover:bg-bakery-primary hover:text-white transition-all">
              <ChevronLeft size={20} />
            </button>
            <button onClick={() => scroll("right")} className="p-4 rounded-full bg-bakery-primary text-white border border-bakery-primary hover:bg-bakery-cta transition-all">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div ref={carouselRef} className="flex gap-8 px-6 md:px-[calc((100vw-80rem)/2+3rem)] overflow-x-auto no-scrollbar pb-12">
          {FEATURED_ITEMS.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ y: -8 }}
              className="min-w-[320px] md:min-w-[380px] group cursor-pointer"
              onClick={() => openProduct(item)}
            >
              <div className="relative aspect-[4/5] rounded-[50px] overflow-hidden luxury-shadow mb-6">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 380px"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  placeholder="blur"
                  blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzgwIiBoZWlnaHQ9IjQ3NSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjM0QxQTBGMjAiLz48L3N2Zz4="
                />
                <div className={cn("absolute top-6 left-6 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest", BADGE_COLORS[item.badge])}>
                  {item.badge}
                </div>
                {/* Hover overlay with Add to Cart */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-8">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addItem({ id: item.id, name: item.name, price: item.price, image_url: item.image, category: item.category, description: item.description, rating: item.rating, reviewCount: 0, is_available: true, is_featured: true });
                      toast.success(`${item.name} added!`, { icon: "🧁", style: { borderRadius: "20px", background: "#3D1A0F", color: "#fff", fontWeight: "bold" } });
                    }}
                    className="w-full py-4 rounded-2xl bg-bakery-cta text-white font-black text-sm uppercase tracking-widest hover:brightness-110 transition-all"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-start px-2">
                <div>
                  <h3 className="text-lg font-bold text-bakery-primary">{item.name}</h3>
                  {/* Clickable star rating → /reviews */}
                  <Link
                    href="/reviews"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 mt-1 text-bakery-cta hover:opacity-70 transition-opacity"
                  >
                    {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                    <span className="text-xs font-bold text-bakery-primary/40 ml-1">{item.rating}</span>
                  </Link>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black font-playfair text-bakery-cta">£{item.price.toFixed(2)}</p>
                  {item.originalPrice && <p className="text-sm line-through text-bakery-primary/30 font-bold">£{item.originalPrice.toFixed(2)}</p>}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ────────── NEWSLETTER ────────── */}
      <section className="py-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto rounded-[80px] bg-bakery-primary p-12 md:p-24 relative overflow-hidden flex flex-col items-center text-center space-y-10">
          <div className="absolute -top-12 -left-12 w-64 h-64 border border-white/5 rounded-full" />
          <div className="absolute top-24 -right-12 w-48 h-48 border border-white/5 rounded-full" />

          <Badge variant="highlight">{content['newsletter.badge'] || 'Sweet News'}</Badge>
          <h2 className="text-5xl md:text-7xl font-playfair font-black text-white max-w-2xl leading-none">
            {content['newsletter.heading'] || 'Get 10% Off Your First Order'}
          </h2>
          <p className="text-lg text-white/50 max-w-lg font-medium">
            {content['newsletter.subheading'] || 'Be the first to hear about new seasonal drops, secret recipes, and exclusive bakery events.'}
          </p>
          <NewsletterForm dark />
          <p className="text-xs font-bold uppercase tracking-widest text-white/20">
            {content['newsletter.disclaimer'] || 'No spam, just sweetness. Unsubscribe at any time.'}
          </p>
        </div>
      </section>

      <ProductDetailModal product={selectedProduct} isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} />
    </div>
  );
}
