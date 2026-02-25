"use client"

import { useState } from "react"
import { WebsiteContentEditor } from "@/components/admin/WebsiteContentEditor"

export default function AdminContentPage() {
    const [activeTab, setActiveTab] = useState("homepage");

    const tabs = [
        { id: "homepage", label: "Homepage" },
        { id: "about", label: "About Us" },
        { id: "contact", label: "Contact" },
        { id: "menu", label: "Menu Page" },
        { id: "footer", label: "Footer" },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-black font-playfair tracking-tight mb-2">Website Content &copy;</h1>
                <p className="text-bakery-primary/60">
                    Edit text, images, and configuration values across the public website. Changes are live immediately.
                </p>
            </div>

            <div className="space-y-8">
                <div className="bg-white luxury-shadow rounded-2xl p-2 max-w-full overflow-x-auto flex flex-wrap gap-2 justify-start">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`rounded-xl px-6 py-3 text-sm font-bold transition-colors ${activeTab === tab.id
                                    ? "bg-bakery-accent text-bakery-primary"
                                    : "text-bakery-primary/60 hover:text-bakery-primary hover:bg-black/5"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="space-y-8">
                    <WebsiteContentEditor page={activeTab} />
                </div>
            </div>
        </div>
    )
}
