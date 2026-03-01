import { Instagram, Facebook, Twitter, Mail, Phone, Heart } from "lucide-react";
import Link from "next/link";
import { NewsletterForm } from "@/components/ui/NewsletterForm";
import { ContentMap } from "@/lib/content";

export function Footer({ content, settings }: { content?: ContentMap, settings?: Record<string, string> }) {
    const businessName = settings?.business_name || "Sweet Delight";
    const tagline = settings?.tagline || content?.['footer.main.tagline'] || "Handcrafting moments of joy with premium ingredients and traditional Nigerian warmth.";

    const phone = process.env.NEXT_PUBLIC_PHONE || '447000000000';
    const instagram = process.env.NEXT_PUBLIC_INSTAGRAM || 'sweetdelight';
    const email = process.env.NEXT_PUBLIC_EMAIL || 'hello@sweetdelight.co.uk';
    const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP || '447000000000';

    const socialLinks = [
        { icon: <Instagram size={20} />, href: `https://instagram.com/${instagram.replace('@', '')}` },
        { icon: <Facebook size={20} />, href: "#" },
        { icon: <Twitter size={20} />, href: "#" },
    ];

    return (
        <footer className="bg-bakery-background pt-20 pb-10 px-6 md:px-12 border-t border-bakery-primary/5">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
                {/* Col 1: Brand */}
                <div className="space-y-6">
                    <Link href="/" className="text-3xl font-playfair font-black text-bakery-primary tracking-tighter">
                        {businessName}
                    </Link>
                    <p className="text-bakery-primary/60 text-sm leading-relaxed max-w-xs">
                        {tagline}
                    </p>
                    <div className="flex gap-4">
                        {socialLinks.map((social, i) => (
                            <a key={i} href={social.href} className="p-3 rounded-xl bg-bakery-primary/5 text-bakery-primary hover:bg-bakery-cta hover:text-white transition-all">
                                {social.icon}
                            </a>
                        ))}
                    </div>
                </div>

                {/* Col 2: Links */}
                <div className="space-y-6">
                    <h4 className="font-playfair font-bold text-xl">Quick Links</h4>
                    <ul className="space-y-4">
                        {[
                            { label: "Home", href: "/" },
                            { label: "Menu", href: "/menu" },
                            { label: "Custom Order", href: "/custom-order" },
                            { label: "About Us", href: "/about" },
                            { label: "Contact", href: "/contact" },
                            { label: "Blog", href: "/blog" },
                            { label: "Reviews", href: "/reviews" },
                            { label: "Track Order", href: "/track-order" },
                            { label: "Terms", href: "/terms" },
                            { label: "Privacy Policy", href: "/privacy" },
                        ].map((link) => (
                            <li key={link.label}>
                                <Link href={link.href} className="text-bakery-primary/60 hover:text-bakery-cta text-sm font-bold transition-colors">
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Col 3: Contact */}
                <div className="space-y-6">
                    <h4 className="font-playfair font-bold text-xl">Contact Us</h4>
                    <ul className="space-y-4">
                        <li className="flex gap-3 text-bakery-primary/60">
                            <Phone size={18} className="text-bakery-cta" />
                            <a href={`https://wa.me/${whatsapp}`} className="text-sm font-bold hover:text-bakery-cta transition-colors">+{whatsapp}</a>
                        </li>
                        <li className="flex gap-3 text-bakery-primary/60">
                            <Instagram size={18} className="text-bakery-cta" />
                            <a href={`https://instagram.com/${instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-sm font-bold hover:text-bakery-cta transition-colors">@{instagram.replace('@', '')}</a>
                        </li>
                        <li className="flex gap-3 text-bakery-primary/60">
                            <Mail size={18} className="text-bakery-cta" />
                            <a href={`mailto:${email}`} className="text-sm font-bold hover:text-bakery-cta transition-colors">{email}</a>
                        </li>
                    </ul>
                </div>

                {/* Col 4: Newsletter */}
                <div className="space-y-6">
                    <h4 className="font-playfair font-bold text-xl">{content?.['newsletter.title'] || 'Join the Club'}</h4>
                    <p className="text-bakery-primary/60 text-sm leading-relaxed">
                        {content?.['newsletter.description'] || 'Subscribe to get sweet updates and special discounts.'}
                    </p>
                    <NewsletterForm compact />
                </div>
            </div>

            <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-bakery-primary/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold uppercase tracking-widest text-bakery-primary/20 text-center md:text-left">
                <p>&copy; {new Date().getFullYear()} {businessName}. All rights reserved.</p>
                <div className="flex items-center gap-2">
                    <span>{content?.['bottom.made_with'] || 'Made with'}</span>
                    <Heart size={12} className="fill-bakery-cta text-bakery-cta" />
                    <span>{content?.['bottom.made_in'] || 'in the UK 🇬🇧 — with Nigerian Soul'}</span>
                </div>
            </div>
        </footer>
    );
}
