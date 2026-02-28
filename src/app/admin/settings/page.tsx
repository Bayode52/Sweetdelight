"use client";

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Save, Loader2, Globe, Phone, Truck, Clock, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    async function fetchSettings() {
        try {
            const res = await fetch('/api/admin/settings');
            const data = await res.json();
            setSettings(data);
        } catch (error) {
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    }

    async function handleSave(section: string, keys: string[]) {
        setSaving(section);
        try {
            const updates: Record<string, string> = {};
            keys.forEach(key => {
                updates[key] = settings[key] || '';
            });

            const res = await fetch('/api/admin/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });

            if (!res.ok) throw new Error('Failed to save');

            toast.success('✅ Saved!', {
                style: { borderRadius: '20px', background: '#3D1A0F', color: '#fff', fontWeight: 'bold' }
            });
        } catch (error) {
            toast.error('Failed to save changes');
        } finally {
            setSaving(null);
        }
    }

    const handleChange = (key: string, value: string) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-[#D4421A]" />
            </div>
        );
    }

    const inputClass = "w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4421A]/20 focus:border-[#D4421A] transition-all text-sm";
    const labelClass = "block text-sm font-bold text-gray-700 mb-1.5";
    const sectionClass = "bg-orange-50/30 rounded-3xl p-8 border border-orange-100 space-y-6";

    return (
        <div className="max-w-4xl space-y-10">
            <div>
                <h1 className="text-3xl font-playfair font-black text-bakery-primary">Site Settings</h1>
                <p className="text-gray-500 mt-2">Manage your business identity, contact details and pricing.</p>
            </div>

            {/* SECTION: Business Identity */}
            <div className={sectionClass}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center luxury-shadow">
                            <Globe className="text-[#D4421A]" size={20} />
                        </div>
                        <h2 className="text-xl font-playfair font-black">Business Identity</h2>
                    </div>
                    <button
                        onClick={() => handleSave('identity', ['business_name', 'tagline'])}
                        disabled={saving === 'identity'}
                        className="flex items-center gap-2 bg-[#D4421A] text-white px-5 py-2 rounded-xl font-bold text-sm hover:brightness-110 transition-all disabled:opacity-50"
                    >
                        {saving === 'identity' ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Save Changes
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className={labelClass}>Business Name</label>
                        <input
                            value={settings.business_name || ''}
                            onChange={e => handleChange('business_name', e.target.value)}
                            className={inputClass}
                            placeholder="e.g. Sweet Delight"
                        />
                        <p className="text-[10px] text-gray-400 mt-1">This name appears in the navbar, footer and browser tab</p>
                    </div>
                    <div>
                        <label className={labelClass}>Tagline</label>
                        <input
                            value={settings.tagline || ''}
                            onChange={e => handleChange('tagline', e.target.value)}
                            className={inputClass}
                            placeholder="Handcrafted Nigerian pastries delivered across the UK"
                        />
                    </div>
                </div>
            </div>

            {/* SECTION: Contact Details */}
            <div className={sectionClass}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center luxury-shadow">
                            <Phone className="text-[#D4421A]" size={20} />
                        </div>
                        <h2 className="text-xl font-playfair font-black">Contact Details</h2>
                    </div>
                    <button
                        onClick={() => handleSave('contact', ['whatsapp', 'instagram', 'email', 'facebook', 'tiktok'])}
                        disabled={saving === 'contact'}
                        className="flex items-center gap-2 bg-[#D4421A] text-white px-5 py-2 rounded-xl font-bold text-sm hover:brightness-110 transition-all disabled:opacity-50"
                    >
                        {saving === 'contact' ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Save Changes
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className={labelClass}>WhatsApp Number</label>
                        <input
                            value={settings.whatsapp || ''}
                            onChange={e => handleChange('whatsapp', e.target.value)}
                            className={inputClass}
                            placeholder="447XXXXXXXXX (no + sign, no spaces)"
                        />
                        <p className="text-[10px] text-gray-400 mt-1">Customers will WhatsApp this number for orders and enquiries</p>
                    </div>
                    <div>
                        <label className={labelClass}>Instagram Handle</label>
                        <input
                            value={settings.instagram || ''}
                            onChange={e => handleChange('instagram', e.target.value)}
                            className={inputClass}
                            placeholder="@sweetdelight"
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Email Address</label>
                        <input
                            value={settings.email || ''}
                            onChange={e => handleChange('email', e.target.value)}
                            className={inputClass}
                            placeholder="hello@sweetdelight.co.uk"
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Facebook Page URL</label>
                        <input
                            value={settings.facebook || ''}
                            onChange={e => handleChange('facebook', e.target.value)}
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>TikTok Handle</label>
                        <input
                            value={settings.tiktok || ''}
                            onChange={e => handleChange('tiktok', e.target.value)}
                            className={inputClass}
                        />
                    </div>
                </div>
            </div>

            {/* SECTION: Delivery & Pricing */}
            <div className={sectionClass}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center luxury-shadow">
                            <Truck className="text-[#D4421A]" size={20} />
                        </div>
                        <h2 className="text-xl font-playfair font-black">Delivery & Pricing</h2>
                    </div>
                    <button
                        onClick={() => handleSave('pricing', ['delivery_fee', 'min_order', 'free_delivery_over', 'delivery_areas'])}
                        disabled={saving === 'pricing'}
                        className="flex items-center gap-2 bg-[#D4421A] text-white px-5 py-2 rounded-xl font-bold text-sm hover:brightness-110 transition-all disabled:opacity-50"
                    >
                        {saving === 'pricing' ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Save Changes
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className={labelClass}>Delivery Fee (£)</label>
                        <input
                            type="number"
                            value={settings.delivery_fee || ''}
                            onChange={e => handleChange('delivery_fee', e.target.value)}
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Minimum Order (£)</label>
                        <input
                            type="number"
                            value={settings.min_order || ''}
                            onChange={e => handleChange('min_order', e.target.value)}
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Free Delivery Over (£)</label>
                        <input
                            type="number"
                            value={settings.free_delivery_over || ''}
                            onChange={e => handleChange('free_delivery_over', e.target.value)}
                            className={inputClass}
                        />
                    </div>
                    <div className="md:col-span-3">
                        <label className={labelClass}>Delivery Areas Description</label>
                        <textarea
                            value={settings.delivery_areas || ''}
                            onChange={e => handleChange('delivery_areas', e.target.value)}
                            className={cn(inputClass, "h-24 resize-none")}
                            placeholder="We deliver across the UK"
                        />
                    </div>
                </div>
            </div>

            {/* SECTION: Business Hours */}
            <div className={sectionClass}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center luxury-shadow">
                            <Clock className="text-[#D4421A]" size={20} />
                        </div>
                        <h2 className="text-xl font-playfair font-black">Business Hours</h2>
                    </div>
                    <button
                        onClick={() => handleSave('hours', ['mon_fri_hours', 'sat_hours', 'sun_hours'])}
                        disabled={saving === 'hours'}
                        className="flex items-center gap-2 bg-[#D4421A] text-white px-5 py-2 rounded-xl font-bold text-sm hover:brightness-110 transition-all disabled:opacity-50"
                    >
                        {saving === 'hours' ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Save Changes
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className={labelClass}>Monday to Friday</label>
                        <input
                            value={settings.mon_fri_hours || ''}
                            onChange={e => handleChange('mon_fri_hours', e.target.value)}
                            className={inputClass}
                            placeholder="9am - 7pm"
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Saturday</label>
                        <input
                            value={settings.sat_hours || ''}
                            onChange={e => handleChange('sat_hours', e.target.value)}
                            className={inputClass}
                            placeholder="9am - 5pm"
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Sunday</label>
                        <input
                            value={settings.sun_hours || ''}
                            onChange={e => handleChange('sun_hours', e.target.value)}
                            className={inputClass}
                            placeholder="Custom orders only"
                        />
                    </div>
                </div>
            </div>

            {/* SECTION: Lead Times */}
            <div className={sectionClass}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center luxury-shadow">
                            <Calendar className="text-[#D4421A]" size={20} />
                        </div>
                        <h2 className="text-xl font-playfair font-black">Lead Times</h2>
                    </div>
                    <button
                        onClick={() => handleSave('leads', ['custom_cake_notice', 'platter_notice'])}
                        disabled={saving === 'leads'}
                        className="flex items-center gap-2 bg-[#D4421A] text-white px-5 py-2 rounded-xl font-bold text-sm hover:brightness-110 transition-all disabled:opacity-50"
                    >
                        {saving === 'leads' ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Save Changes
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className={labelClass}>Custom cake notice</label>
                        <input
                            value={settings.custom_cake_notice || ''}
                            onChange={e => handleChange('custom_cake_notice', e.target.value)}
                            className={inputClass}
                            placeholder="e.g. 5 days"
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Party platter notice</label>
                        <input
                            value={settings.platter_notice || ''}
                            onChange={e => handleChange('platter_notice', e.target.value)}
                            className={inputClass}
                            placeholder="e.g. 48 hours"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
