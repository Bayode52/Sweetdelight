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

const CATEGORIES = [
  {
    name: "Celebration Cakes",
    count: 14,
    href: "/menu?category=Celebration Cakes",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=600",
  },
  {
    name: "Small Chops",
    count: 12,
    href: "/menu?category=Small Chops",
    image: "https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&q=80&w=600",
  },
  {
    name: "Chin Chin & Snacks",
    count: 8,
    href: "/menu?category=Chin Chin & Snacks",
    image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&q=80&w=600",
  },
  {
    name: "Party Boxes",
    count: 6,
    href: "/menu?category=Party Boxes",
    image: "https://images.unsplash.com/photo-1548940740-204726a19be3?auto=format&fit=crop&q=80&w=600",
  },
];

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

export function HomePageClient({ content, settings }: { content: ContentMap, settings?: Record<string, string> }) {
  const addItem = useCartStore((s) => s.addItem);
  const carouselRef = React.useRef<HTMLDivElement>(null);
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);

  const scroll = (dir: "left" | "right") => {
    if (!carouselRef.current) return;
    carouselRef.current.scrollBy({ left: dir === "right" ? 420 : -420, behavior: "smooth" });
  };

  const openProduct = (item: typeof FEATURED_ITEMS[0]) => {
    setSelectedProduct(item as Product);
    setIsDetailOpen(true);
  };

  return (
    <div className="w-full">
      {/* ────────── HERO ────────── */}
      <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden px-6 md:px-12">
        <div className="absolute top-[-10%] right-[-5%] w-[60%] h-[60%] bg-bakery-accent/30 rounded-full blur-[120px] -z-10 animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-bakery-cta/10 rounded-full blur-[100px] -z-10" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bakery-cta/5 border border-bakery-cta/10 text-bakery-cta text-sm font-bold uppercase tracking-widest">
              {content['hero.badge'] || '🇬🇧 Proudly Serving the UK'}
            </div>

            <h1 className="text-6xl md:text-8xl font-playfair font-black text-bakery-primary leading-[0.9] tracking-tighter">
              {content['hero.line1'] || 'Baking Joy,'}<br />
              <span className="text-bakery-cta italic">{content['hero.line2'] || 'One Bite'}</span><br />
              {content['hero.line3'] || 'At A Time.'}
            </h1>

            <p className="text-lg md:text-xl text-bakery-primary/60 max-w-lg leading-relaxed font-medium">
              {content['hero.subtext'] || 'Experience the perfect blend of London sophistication and Nigerian soul. Handcrafted pastries delivered warm to your doorstep.'}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href={'/menu'}>
                <Button size="xl" className="shadow-2xl shadow-bakery-cta/20 group">
                  {content['hero.cta_text'] || 'Order Fresh Now'}
                  <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href={'/menu'}>
                <Button variant="outline" size="xl">View Our Menu</Button>
              </Link>
            </div>

            <div className="flex items-center gap-8 pt-8 border-t border-bakery-primary/5">
              <div>
                <p className="text-3xl font-black font-playfair">{content['hero.stats_customers'] || '500+'}</p>
                <p className="text-xs uppercase tracking-widest font-bold text-bakery-primary/40">Happy Customers</p>
              </div>
              <div className="w-px h-10 bg-bakery-primary/10" />
              <div>
                <p className="text-3xl font-black font-playfair">{content['hero.stats_rating'] || '4.9/5'}</p>
                <div className="flex text-bakery-cta">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── FLOATING CAKE IMAGE ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative flex justify-center"
          >
            {/* Warm cream glow behind cake */}
            <div className="absolute inset-0 m-auto w-[85%] h-[85%] bg-bakery-accent/50 rounded-full blur-[60px]" />

            {/* Floating cake image */}
            <div className="relative hero-cake-float" style={{ borderRadius: "24px", overflow: "hidden", width: "100%", maxWidth: "480px", aspectRatio: "1/1" }}>
              <Image
                src={content['hero.image'] || "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=900"}
                alt="Elegant Celebration Cake"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bakery-primary/10 to-transparent" />
            </div>

            {/* Fast Delivery badge */}
            <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 4, repeat: Infinity }} className="absolute -top-6 -right-6 bg-white p-4 rounded-3xl shadow-xl border border-bakery-primary/5 flex items-center gap-3 z-10">
              <div className="w-12 h-12 bg-bakery-cta/10 rounded-2xl flex items-center justify-center text-bakery-cta"><Clock size={24} /></div>
              <div>
                <p className="text-xs font-bold text-bakery-primary/40 uppercase tracking-widest">{content['hero.badge_fast_delivery_title'] || 'Fast Delivery'}</p>
                <p className="text-sm font-black">{content['hero.badge_fast_delivery_text'] || 'Under 45 Mins'}</p>
              </div>
            </motion.div>

            {/* Quality Assurance badge */}
            <motion.div animate={{ y: [0, 20, 0] }} transition={{ duration: 5, repeat: Infinity, delay: 0.5 }} className="absolute -bottom-10 -left-10 bg-bakery-primary text-white p-6 rounded-[32px] shadow-2xl flex items-center gap-4 border border-white/10 z-10">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-bakery-cta"><ShieldCheck size={32} /></div>
              <div>
                <p className="text-xs font-bold text-white/40 uppercase tracking-widest">{content['hero.badge_quality_title'] || 'Quality Assurance'}</p>
                <p className="text-base font-black">{content['hero.badge_quality_text'] || '100% Fresh'}</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ────────── DELIVERY BANNER ────────── */}
      <div className="bg-bakery-cta/5 border-y border-bakery-cta/10 py-4 px-6 overflow-hidden">
        <motion.p animate={{ x: [0, -800, 0] }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} className="text-sm font-bold text-bakery-primary/60 whitespace-nowrap">
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
                      addItem({ id: item.id, name: item.name, price: item.price, image: item.image, category: item.category, description: item.description, rating: item.rating, reviewCount: 0, isAvailable: true, isFeatured: true });
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
