"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronDown, Send } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ContentMap } from "@/lib/content";

const contactSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    phone: z.string().optional(),
    subject: z.enum(["General Enquiry", "Custom Cake Order", "Party Catering Quote", "Bulk / Wholesale Order", "Delivery Question", "Other"]),
    message: z.string().min(20, "Message must be at least 20 characters"),
});
type ContactForm = z.infer<typeof contactSchema>;

const CONTACT_CARDS = [
    {
        icon: "📱", title: "WhatsApp", desc: "Chat with us instantly", action: "Chat on WhatsApp", href: "https://wa.me/447000000000", color: "bg-green-500 hover:bg-green-600",
    },
    {
        icon: "📸", title: "Instagram", desc: "DM us on Instagram", action: "Visit Instagram", href: "https://instagram.com/sweetdelightuk", color: "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600",
    },
    {
        icon: "📧", title: "Email", desc: "hello@sweetdelight.co.uk", action: "Send Email", href: "mailto:hello@sweetdelight.co.uk", color: "bg-bakery-primary hover:bg-bakery-primary/90",
    },
];

const FAQS = [
    { q: "Do you deliver across the UK?", a: "Yes! We deliver nationwide via courier. Delivery costs £5 for orders under £50, and is free for orders over £50. We also offer local collection." },
    { q: "How much notice do I need for a custom cake?", a: "We ask for at least 5 days notice for custom cakes to ensure the best quality. For complex tiered cakes or large orders, 2 weeks is recommended." },
    { q: "What allergens do your products contain?", a: "Full allergen information is listed on every product page. Our kitchen handles gluten, dairy, eggs, nuts, and soya. If you have a severe allergy, please contact us before ordering." },
    { q: "Can I place a bulk order for a wedding or event?", a: "Absolutely! We love catering for special occasions. Contact us for a custom quote — we offer competitive bulk pricing for events, naming ceremonies, weddings, and corporate functions." },
    { q: "Do you make halal products?", a: "All our meat products use halal-certified meat. Please contact us to confirm for specific products." },
    { q: "How do I track my order?", a: "You'll receive an email with your order reference number. Visit our Track Order page and enter your reference to see real-time status updates." },
    { q: "Can I cancel or change my order?", a: "Please contact us as soon as possible if you need to change or cancel. Cancellations within 24 hours of ordering are fully refunded. Custom cake orders cannot be cancelled once preparation has begun." },
    { q: "Do you offer a referral scheme?", a: "Yes! Every customer gets a unique referral link. Share it with friends — when they place their first order, you earn £5 store credit. Sign up to get your link." },
];

function FaqItem({ q, a }: { q: string; a: string }) {
    const [open, setOpen] = React.useState(false);
    return (
        <div className="border border-bakery-primary/8 rounded-2xl overflow-hidden">
            <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-6 text-left hover:bg-bakery-primary/[0.02] transition-colors">
                <span className="font-bold text-bakery-primary pr-4">{q}</span>
                <ChevronDown className={cn("shrink-0 text-bakery-cta transition-transform duration-300", open && "rotate-180")} size={20} />
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
                        <div className="px-6 pb-6 text-bakery-primary/60 leading-relaxed border-t border-bakery-primary/8 pt-4">{a}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export function ContactPageClient({ content, settings }: { content: ContentMap, settings?: Record<string, string> }) {
    const [sent, setSent] = React.useState(false);
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ContactForm>({ resolver: zodResolver(contactSchema) });

    const whatsapp = settings?.whatsapp || "447000000000";
    const instagram = (settings?.instagram || "sweetdelight").replace('@', '');
    const email = settings?.email || "hello@sweetdelight.co.uk";
    const monFri = settings?.mon_fri_hours || "9am – 7pm";
    const satHours = settings?.sat_hours || "9am – 5pm";
    const sunHours = settings?.sun_hours || "Custom orders only";
    const cakeNotice = settings?.custom_cake_notice || "5 days";
    const platterNotice = settings?.platter_notice || "48 hours";
    const deliveryAreas = settings?.delivery_areas || "We deliver across the UK";

    const onSubmit = async (data: ContactForm) => {
        try {
            const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
            if (!res.ok) throw new Error("Failed");
            setSent(true);
            reset();
            toast.success("Message sent! We'll get back to you within 2 hours.", { icon: "✉️", style: { borderRadius: "20px", background: "#3D1A0F", color: "#fff", fontWeight: "bold" } });
        } catch {
            toast.error("Something went wrong. Please try WhatsApp instead.");
        }
    };

    const inputClass = "w-full px-5 py-3.5 bg-bakery-primary/[0.03] border border-bakery-primary/10 rounded-2xl text-bakery-primary font-medium focus:outline-none focus:border-bakery-cta/50 focus:bg-white transition-all placeholder:text-bakery-primary/30 text-sm";
    const errClass = "text-xs text-red-500 font-bold mt-1";

    return (
        <div className="min-h-screen bg-[#FDF6F0] pt-32 pb-24">
            {/* ── HERO ── */}
            <div className="bg-bakery-primary py-20 px-6 md:px-12 text-center mb-24">
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-2xl mx-auto space-y-4">
                    <h1 className="text-4xl md:text-6xl font-playfair font-black text-white">{content['hero.heading'] || 'Get In Touch'}</h1>
                    <p className="text-white/60 text-lg">{content['hero.subheading'] || 'Whether you\'re planning a party, ordering a birthday cake, or just have a question — we\'re here.'}</p>
                </motion.div>
            </div>

            <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-24">
                {/* ── TWO COLUMN ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    {/* LEFT */}
                    <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }} className="space-y-8">
                        <div className="space-y-4">
                            <h2 className="text-3xl font-playfair font-black text-bakery-primary">We&rsquo;d Love To Hear From You</h2>
                        </div>

                        <div className="space-y-4">
                            {[
                                {
                                    icon: "📱", title: "WhatsApp", desc: "Chat with us instantly", action: "Chat on WhatsApp", href: `https://wa.me/${whatsapp}`, color: "bg-green-500 hover:bg-green-600",
                                },
                                {
                                    icon: "📸", title: "Instagram", desc: `@${instagram}`, action: "Visit Instagram", href: `https://instagram.com/${instagram}`, color: "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600",
                                },
                                {
                                    icon: "📧", title: "Email", desc: email, action: "Send Email", href: `mailto:${email}`, color: "bg-bakery-primary hover:bg-bakery-primary/90",
                                },
                            ].map((c) => (
                                <Link key={c.title} href={c.href} target="_blank" rel="noopener noreferrer" className="block">
                                    <div className="bg-white rounded-3xl p-6 border border-bakery-primary/5 hover:shadow-xl transition-all duration-300 flex items-center gap-5">
                                        <div className="text-3xl">{c.icon}</div>
                                        <div className="flex-1">
                                            <p className="text-xs font-black uppercase tracking-widest text-bakery-primary/40">{c.title}</p>
                                            <p className="font-bold text-bakery-primary">{c.desc}</p>
                                        </div>
                                        <span className={cn("text-white text-xs font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all", c.color)}>
                                            {c.action}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        <div className="bg-white rounded-3xl p-8 border border-bakery-primary/5 space-y-4">
                            <h3 className="font-playfair font-black text-lg text-bakery-primary">Business Hours</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between"><span className="text-bakery-primary/60">Mon – Fri</span><span className="font-bold">{monFri}</span></div>
                                <div className="flex justify-between"><span className="text-bakery-primary/60">Saturday</span><span className="font-bold">{satHours}</span></div>
                                <div className="flex justify-between"><span className="text-bakery-primary/60">Sunday</span><span className="font-bold text-bakery-cta">{sunHours}</span></div>
                            </div>
                            <div className="space-y-2 pt-2 border-t border-bakery-primary/5 text-xs text-bakery-primary/50 font-medium whitespace-pre-line">
                                ⏱️ We typically reply within 2 hours on WhatsApp<br />
                                🎂 Custom cakes require minimum {cakeNotice} notice. Party platters require {platterNotice}.<br />
                                📍 {deliveryAreas}
                            </div>
                        </div>
                    </motion.div>

                    {/* RIGHT — FORM */}
                    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
                        <div className="bg-white rounded-[48px] p-10 border border-bakery-primary/5 luxury-shadow space-y-6">
                            <h3 className="text-2xl font-playfair font-black text-bakery-primary">Send a Message</h3>

                            {sent ? (
                                <div className="py-16 text-center space-y-4">
                                    <div className="text-6xl">✅</div>
                                    <h4 className="text-xl font-bold text-bakery-primary">Message Sent!</h4>
                                    <p className="text-bakery-primary/60">We&rsquo;ll get back to you within 2 hours.</p>
                                    <button onClick={() => setSent(false)} className="mt-4 text-bakery-cta font-black text-sm underline">Send another message</button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                    <div>
                                        <input {...register("name")} placeholder="Full Name *" className={inputClass} />
                                        {errors.name && <p className={errClass}>{errors.name.message}</p>}
                                    </div>
                                    <div>
                                        <input {...register("email")} type="email" placeholder="Email Address *" className={inputClass} />
                                        {errors.email && <p className={errClass}>{errors.email.message}</p>}
                                    </div>
                                    <div>
                                        <input {...register("phone")} placeholder="Phone Number (optional)" className={inputClass} />
                                    </div>
                                    <div>
                                        <select {...register("subject")} className={cn(inputClass, "cursor-pointer")}>
                                            <option value="">Select Subject *</option>
                                            <option>General Enquiry</option>
                                            <option>Custom Cake Order</option>
                                            <option>Party Catering Quote</option>
                                            <option>Bulk / Wholesale Order</option>
                                            <option>Delivery Question</option>
                                            <option>Other</option>
                                        </select>
                                        {errors.subject && <p className={errClass}>{errors.subject.message}</p>}
                                    </div>
                                    <div>
                                        <textarea {...register("message")} placeholder="Your message... (min 20 characters) *" rows={5} className={cn(inputClass, "resize-none")} />
                                        {errors.message && <p className={errClass}>{errors.message.message}</p>}
                                    </div>
                                    <button type="submit" disabled={isSubmitting} className="w-full flex items-center justify-center gap-2 bg-bakery-cta text-white font-black py-4 rounded-2xl hover:brightness-110 transition-all disabled:opacity-50 uppercase tracking-widest text-sm">
                                        <Send size={16} />
                                        {isSubmitting ? "Sending..." : "Send Message"}
                                    </button>
                                </form>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* ── FAQ ── */}
                <div className="space-y-10">
                    <div className="text-center space-y-3">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bakery-cta/10 text-bakery-cta text-xs font-black uppercase tracking-widest">FAQ</span>
                        <h2 className="text-3xl md:text-5xl font-playfair font-black text-bakery-primary">Frequently Asked Questions</h2>
                    </div>
                    <div className="max-w-3xl mx-auto space-y-3">
                        {FAQS.map((f) => <FaqItem key={f.q} q={f.q} a={f.a} />)}
                    </div>
                </div>

                {/* ── LEGAL LINKS ── */}
                <div className="pt-16 pb-8 border-t border-bakery-primary/10 mt-16 flex flex-wrap justify-center gap-6 text-sm font-bold text-bakery-primary/50">
                    <Link href="/terms" className="hover:text-bakery-cta transition-colors">Terms & Conditions</Link>
                    <Link href="/privacy" className="hover:text-bakery-cta transition-colors">Privacy Policy</Link>
                </div>
            </div>
        </div>
    );
}
