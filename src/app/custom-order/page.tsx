"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronRight, Sparkles, Cake, Gift, Coffee, ShoppingBag, ArrowLeft, Check } from "lucide-react";
import { getQuestionsForType } from "./questions";
import { ErrorBoundary } from "@/components/ErrorBoundary";

type ProductType = "Celebration Cake" | "Small Chops Platter" | "Puff Puff" | "Pastry Box" | "Custom Gift Box" | "Chin Chin Bag" | null;

const PRODUCT_TYPES: { id: ProductType; title: string; desc: string; icon: any }[] = [
    { id: "Celebration Cake", title: "Celebration Cake", desc: "Bespoke cakes for your special moments.", icon: Cake },
    { id: "Small Chops Platter", title: "Small Chops Platter", desc: "Perfect party platters of Nigerian snacks.", icon: Coffee },
    { id: "Puff Puff", title: "Puff Puff", desc: "Fresh, warm, and perfectly round.", icon: ShoppingBag },
    { id: "Pastry Box", title: "Pastry Box", desc: "A curated selection of our best bakes.", icon: Gift },
    { id: "Custom Gift Box", title: "Custom Gift Box", desc: "The perfect edible gift tailored by you.", icon: Gift },
    { id: "Chin Chin Bag", title: "Chin Chin Bag", desc: "Crunchy, sweet, and highly addictive.", icon: ShoppingBag },
];

export default function CustomOrderPage() {
    const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
    const [productType, setProductType] = useState<ProductType>(null);

    // Answers will hold the user's responses to the dynamic questionnaire
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiPreview, setAiPreview] = useState<any>(null);

    // Step 4 Checkout State
    const [customerDetails, setCustomerDetails] = useState({ name: "", email: "", phone: "", deliveryType: "collection", address: "", paymentMethod: "dm_whatsapp", notes: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);

    // Step 2 Questionnaire State
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const questions = getQuestionsForType(productType);
    const currentQuestion = questions[currentQuestionIndex];

    const isNextDisabled = () => {
        if (!currentQuestion) return true;
        const answer = answers[currentQuestion.id];
        if (!answer) return true;
        if (Array.isArray(answer) && answer.length === 0) return true;

        // Ensure "Custom" selections have text provided
        const isCustomSelected = Array.isArray(answer)
            ? answer.some(a => typeof a === "string" && a.startsWith("Custom"))
            : (typeof answer === "string" && answer.startsWith("Custom"));

        if (isCustomSelected) {
            const customText = answers[`${currentQuestion.id}_custom`];
            if (!customText || customText.trim() === "") return true;
        }
        return false;
    };

    const handleProductSelect = (type: ProductType) => {
        setProductType(type);
        setAnswers({});
        setCurrentQuestionIndex(0);
        setStep(2);
    };

    const handleAnswer = (answer: any) => {
        setAnswers(prev => ({ ...prev, [currentQuestion!.id]: answer }));
    };

    const handleNext = async () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            // Done with questions, move to Step 3 AI generation
            setStep(3);
            generatePreview();
        }
    };

    const handleBack = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        } else {
            setStep(1);
        }
    };

    const generatePreview = async () => {
        setIsGenerating(true);
        try {
            const res = await fetch("/api/custom-order/preview", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productType, answers })
            });
            const data = await res.json();
            setAiPreview(data);
        } catch (error) {
            console.error("Failed to generate preview", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSubmitOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await fetch("/api/custom-order/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productType,
                    answers,
                    aiPreview,
                    customerDetails,
                    totalEstimate: aiPreview?.priceEstimate
                })
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setOrderSuccess(true);
            } else {
                alert("Failed to sumbit order: " + (data.error || "Unknown error"));
            }
        } catch (error) {
            console.error("Submission error:", error);
            alert("An error occurred while placing your order.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderInput = () => {
        if (!currentQuestion) return null;

        const answer = answers[currentQuestion.id];
        const customTextValue = answers[`${currentQuestion.id}_custom`] || "";
        const isCustom = (val: any) => typeof val === "string" && val.startsWith("Custom");

        switch (currentQuestion.type) {
            case "select":
                return (
                    <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {currentQuestion.options?.map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => handleAnswer(opt)}
                                    className={`p-4 rounded-xl border-2 text-left font-bold transition-all ${answer === opt ? "border-bakery-cta bg-bakery-cta/5 text-bakery-cta" : "border-bakery-primary/10 text-bakery-primary hover:border-bakery-primary/30"}`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                        {isCustom(answer) && (
                            <input
                                type="text"
                                value={customTextValue}
                                onChange={(e) => setAnswers(prev => ({ ...prev, [`${currentQuestion.id}_custom`]: e.target.value }))}
                                placeholder="Please describe your custom choice..."
                                className="w-full p-4 rounded-xl border-2 border-bakery-cta/30 focus:border-bakery-cta focus:ring-4 focus:ring-bakery-cta/10 outline-none text-bakery-primary font-medium mt-2 animate-in fade-in"
                                autoFocus
                            />
                        )}
                    </div>
                );
            case "multi-select":
            case "multi-colour":
                const selected = Array.isArray(answer) ? answer : [];
                const toggle = (opt: string) => {
                    if (selected.includes(opt)) handleAnswer(selected.filter(x => x !== opt));
                    else handleAnswer([...selected, opt].slice(0, currentQuestion.type === "multi-colour" ? 3 : 10)); // max 3 colours
                };
                const hasCustomMulti = selected.some(isCustom);
                return (
                    <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {currentQuestion.options?.map(opt => {
                                const isSelected = selected.includes(opt);
                                return (
                                    <button
                                        key={opt}
                                        onClick={() => toggle(opt)}
                                        className={`p-3 rounded-xl border-2 font-bold text-sm transition-all flex items-center justify-between ${isSelected ? "border-bakery-cta bg-bakery-cta/5 text-bakery-cta" : "border-bakery-primary/10 text-bakery-primary hover:border-bakery-primary/30"}`}
                                    >
                                        {currentQuestion.type === "multi-colour" && opt !== "No preference" ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: opt.toLowerCase() }}></div>
                                                {opt}
                                            </div>
                                        ) : opt}
                                        {isSelected && <Check size={16} />}
                                    </button>
                                );
                            })}
                        </div>
                        {hasCustomMulti && (
                            <input
                                type="text"
                                value={customTextValue}
                                onChange={(e) => setAnswers(prev => ({ ...prev, [`${currentQuestion.id}_custom`]: e.target.value }))}
                                placeholder="Please describe your custom choices..."
                                className="w-full p-4 rounded-xl border-2 border-bakery-cta/30 focus:border-bakery-cta focus:ring-4 focus:ring-bakery-cta/10 outline-none text-bakery-primary font-medium mt-2 animate-in fade-in"
                                autoFocus
                            />
                        )}
                    </div>
                );
            case "text-font":
                return (
                    <div className="space-y-4">
                        <input
                            type="text"
                            value={answer?.text || ""}
                            onChange={(e) => handleAnswer({ ...answer, text: e.target.value })}
                            placeholder={currentQuestion.placeholder}
                            maxLength={40}
                            className="w-full p-4 rounded-xl border-2 border-bakery-primary/10 focus:border-bakery-cta focus:ring-4 focus:ring-bakery-cta/10 outline-none text-bakery-primary font-medium"
                        />
                        {answer?.text && (
                            <div className="flex gap-2">
                                {["Classic", "Modern", "Cursive"].map(font => (
                                    <button
                                        key={font}
                                        onClick={() => handleAnswer({ ...answer, font })}
                                        className={`px-4 py-2 rounded-lg text-sm font-bold border-2 transition-all ${answer?.font === font ? "border-bakery-cta text-bakery-cta" : "border-bakery-primary/10 hover:border-bakery-primary/30"}`}
                                    >
                                        {font}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                );
            case "textarea":
                return (
                    <textarea
                        value={answer || ""}
                        onChange={(e) => handleAnswer(e.target.value)}
                        placeholder={currentQuestion.placeholder}
                        rows={4}
                        className="w-full p-4 rounded-xl border-2 border-bakery-primary/10 focus:border-bakery-cta focus:ring-4 focus:ring-bakery-cta/10 outline-none text-bakery-primary font-medium resize-none"
                    />
                );
            case "date":
                return (
                    <div className="space-y-2">
                        <input
                            type="date"
                            value={answer || ""}
                            onChange={(e) => handleAnswer(e.target.value)}
                            min={new Date(Date.now() + ((currentQuestion as any).minDays || 0) * 86400000).toISOString().split('T')[0]}
                            className="w-full p-4 rounded-xl border-2 border-bakery-primary/10 focus:border-bakery-cta focus:ring-4 focus:ring-bakery-cta/10 outline-none text-bakery-primary font-bold"
                        />
                        {(currentQuestion as any).tooltip && <p className="text-sm text-bakery-primary/50 font-medium">💡 {(currentQuestion as any).tooltip}</p>}
                    </div>
                );
        }
    };

    return (
        <ErrorBoundary>
            <main className="min-h-screen bg-bakery-background pt-32 pb-24 text-bakery-primary">
                <div className="max-w-5xl mx-auto px-6">

                    {/* Header Section */}
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bakery-cta/10 text-bakery-cta text-sm font-bold mb-6">
                            <Sparkles size={16} />
                            <span>AI-Powered Custom Orders</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-playfair font-black tracking-tight mb-6 leading-tight">
                            Design Your Perfect Bake
                        </h1>
                        <p className="text-lg text-bakery-primary/70 max-w-2xl mx-auto leading-relaxed">
                            Tell us exactly what you're craving. Our AI baker will visualise your dream product, provide an instant price estimate, and prepare it for our kitchen.
                        </p>
                    </div>

                    {/* Main Content Area */}
                    <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-bakery-primary/5">

                        {/* STEP 1: Product Selection */}
                        {step === 1 && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h2 className="text-2xl font-black font-playfair mb-8 text-center">What are we baking today?</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {PRODUCT_TYPES.map((product) => (
                                        <button
                                            key={product.id}
                                            onClick={() => handleProductSelect(product.id)}
                                            className="group text-left p-6 rounded-2xl border-2 border-bakery-primary/5 hover:border-bakery-cta hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="w-8 h-8 rounded-full bg-bakery-cta/10 flex items-center justify-center text-bakery-cta">
                                                    <ChevronRight size={16} />
                                                </div>
                                            </div>
                                            <div className="w-12 h-12 rounded-xl bg-bakery-primary/5 group-hover:bg-bakery-cta/10 flex items-center justify-center text-bakery-primary mb-6 transition-colors">
                                                <product.icon size={24} className="group-hover:text-bakery-cta transition-colors" />
                                            </div>
                                            <h3 className="font-bold text-lg mb-2">{product.title}</h3>
                                            <p className="text-sm text-bakery-primary/60 leading-relaxed">{product.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* STEP 2: Questionnaire */}
                        {step === 2 && currentQuestion && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500 max-w-2xl mx-auto">
                                <button
                                    onClick={handleBack}
                                    className="text-sm font-bold text-bakery-primary/60 hover:text-bakery-cta mb-8 transition-colors flex items-center gap-2"
                                >
                                    <ArrowLeft size={16} /> Back
                                </button>

                                {/* Progress Bar */}
                                <div className="mb-8">
                                    <div className="flex justify-between text-sm font-bold text-bakery-primary/40 mb-2">
                                        <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                                        <span>{Math.round(((currentQuestionIndex) / questions.length) * 100)}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-bakery-primary/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-bakery-cta transition-all duration-500 ease-out rounded-full"
                                            style={{ width: `${((currentQuestionIndex) / questions.length) * 100}%` }}
                                        />
                                    </div>
                                </div>

                                <div key={currentQuestion.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <h2 className="text-2xl md:text-3xl font-black font-playfair mb-8">{currentQuestion.question}</h2>

                                    <div className="mb-10">
                                        {renderInput()}
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            onClick={handleNext}
                                            disabled={isNextDisabled()}
                                            className="bg-bakery-cta text-white px-8 py-3.5 rounded-xl font-black disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-1 transition-all shadow-lg shadow-bakery-cta/20 flex items-center gap-2"
                                        >
                                            {currentQuestionIndex === questions.length - 1 ? "Generate Preview ✨" : "Next"}
                                            {currentQuestionIndex !== questions.length - 1 && <ChevronRight size={18} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: AI Loading/Result */}
                        {step === 3 && (
                            <div className="animate-in fade-in duration-500">
                                {isGenerating ? (
                                    <div className="text-center py-20 space-y-6 flex flex-col items-center">
                                        <div className="w-16 h-16 border-4 border-bakery-primary/10 border-t-bakery-cta rounded-full animate-spin"></div>
                                        <h2 className="text-2xl font-black font-playfair">Our AI baker is preparing your preview...</h2>
                                        <p className="text-bakery-primary/60">Mixing the ingredients of your imagination.</p>
                                    </div>
                                ) : aiPreview && (
                                    <div className="max-w-4xl mx-auto">
                                        <button
                                            onClick={() => setStep(2)}
                                            className="text-sm font-bold text-bakery-primary/60 hover:text-bakery-cta mb-8 transition-colors flex items-center gap-2"
                                        >
                                            <ArrowLeft size={16} /> Edit Details
                                        </button>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                            {/* Image Section */}
                                            <div className="relative aspect-square md:aspect-auto md:h-full min-h-[400px] rounded-3xl overflow-hidden shadow-2xl bg-bakery-primary/5">
                                                {aiPreview.imageQuery ? (
                                                    <Image
                                                        src={`https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1089&auto=format&fit=crop`} // Fallback static image just in case fetch fails
                                                        alt="AI Generated Reference"
                                                        fill
                                                        className="object-cover"
                                                        unoptimized
                                                    />
                                                ) : (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-bakery-primary/5">
                                                        <Cake size={64} className="text-bakery-primary/20" />
                                                    </div>
                                                )}
                                                {/* We use Pollinations AI, which generates an image on the fly! This is faster and much more powerful than simple stock search. */}
                                                {aiPreview.imageQuery && (
                                                    <img
                                                        src={`https://image.pollinations.ai/prompt/${encodeURIComponent(aiPreview.imageQuery + ", delicious bakery food, high quality photo, 4k")}?width=800&height=1000&nologo=true`}
                                                        alt="AI Reference"
                                                        className="object-cover w-full h-full absolute inset-0 z-10"
                                                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                                    />
                                                )}

                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-20 flex items-end p-8">
                                                    <div className="text-white">
                                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold mb-3">
                                                            <Sparkles size={14} /> AI Visualisation
                                                        </div>
                                                        <h3 className="text-2xl font-playfair font-black">{productType}</h3>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Content Section */}
                                            <div className="space-y-8 flex flex-col justify-center">
                                                <div>
                                                    <h2 className="text-3xl font-black font-playfair mb-4">Your Custom Creation</h2>
                                                    <p className="text-lg text-bakery-primary/80 leading-relaxed italic">
                                                        "{aiPreview.visualDescription}"
                                                    </p>
                                                </div>

                                                <div className="bg-bakery-primary/5 rounded-2xl p-6">
                                                    <h4 className="font-bold mb-4 flex items-center gap-2"><Check size={18} className="text-bakery-cta" /> Specifications</h4>
                                                    <dl className="space-y-3 text-sm">
                                                        {aiPreview.specifications?.map((spec: any, i: number) => (
                                                            <div key={i} className="flex justify-between border-b border-bakery-primary/10 pb-2 last:border-0 last:pb-0">
                                                                <dt className="text-bakery-primary/60 font-medium">{spec.label}</dt>
                                                                <dd className="font-bold text-right max-w-[60%] line-clamp-2">
                                                                    {typeof spec.value === 'object' && spec.value !== null
                                                                        ? (Array.isArray(spec.value) ? spec.value.join(', ') : Object.values(spec.value).join(' - '))
                                                                        : String(spec.value || '')}
                                                                </dd>
                                                            </div>
                                                        ))}
                                                    </dl>
                                                </div>

                                                <div className="flex items-end justify-between border-t border-bakery-primary/10 pt-6">
                                                    <div>
                                                        <p className="text-sm font-bold text-bakery-primary/60 mb-1">Estimated Price</p>
                                                        <p className="text-3xl font-black font-playfair text-bakery-cta">{aiPreview.priceEstimate}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => setStep(4)}
                                                        className="bg-bakery-cta text-white px-8 py-4 rounded-xl font-black hover:-translate-y-1 transition-all shadow-lg shadow-bakery-cta/20 flex items-center gap-2"
                                                    >
                                                        Proceed to Checkout <ChevronRight size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 4: Order Placement Form */}
                        {step === 4 && !orderSuccess && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500 max-w-2xl mx-auto">
                                <button
                                    onClick={() => setStep(3)}
                                    className="text-sm font-bold text-bakery-primary/60 hover:text-bakery-cta mb-8 transition-colors flex items-center gap-2"
                                >
                                    <ArrowLeft size={16} /> Back to Preview
                                </button>

                                <div className="text-center mb-8">
                                    <h2 className="text-3xl font-black font-playfair mb-4">Complete Your Order</h2>
                                    <p className="text-bakery-primary/60">Finalize your details to send this brief to our kitchen.</p>
                                </div>

                                <form onSubmit={handleSubmitOrder} className="space-y-6">
                                    {/* Contact Info */}
                                    <div className="space-y-4">
                                        <h3 className="font-bold text-lg border-b border-bakery-primary/10 pb-2">Contact Details</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold mb-2">Full Name *</label>
                                                <input required type="text" value={customerDetails.name} onChange={e => setCustomerDetails({ ...customerDetails, name: e.target.value })} className="w-full p-3 rounded-xl border-2 border-bakery-primary/10 focus:border-bakery-cta outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold mb-2">Email *</label>
                                                <input required type="email" value={customerDetails.email} onChange={e => setCustomerDetails({ ...customerDetails, email: e.target.value })} className="w-full p-3 rounded-xl border-2 border-bakery-primary/10 focus:border-bakery-cta outline-none" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold mb-2">Phone Number *</label>
                                            <input required type="tel" value={customerDetails.phone} onChange={e => setCustomerDetails({ ...customerDetails, phone: e.target.value })} className="w-full p-3 rounded-xl border-2 border-bakery-primary/10 focus:border-bakery-cta outline-none" />
                                        </div>
                                    </div>

                                    {/* Delivery Info */}
                                    <div className="space-y-4 pt-4">
                                        <h3 className="font-bold text-lg border-b border-bakery-primary/10 pb-2">Delivery Options</h3>
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <button type="button" onClick={() => setCustomerDetails({ ...customerDetails, deliveryType: 'collection' })} className={`p-4 rounded-xl border-2 font-bold transition-all ${customerDetails.deliveryType === 'collection' ? "border-bakery-cta bg-bakery-cta/5 text-bakery-cta" : "border-bakery-primary/10 text-bakery-primary"}`}>
                                                Collection
                                            </button>
                                            <button type="button" onClick={() => setCustomerDetails({ ...customerDetails, deliveryType: 'delivery' })} className={`p-4 rounded-xl border-2 font-bold transition-all ${customerDetails.deliveryType === 'delivery' ? "border-bakery-cta bg-bakery-cta/5 text-bakery-cta" : "border-bakery-primary/10 text-bakery-primary"}`}>
                                                Delivery
                                            </button>
                                        </div>

                                        {customerDetails.deliveryType === 'delivery' && (
                                            <div>
                                                <label className="block text-sm font-bold mb-2">Full Delivery Address *</label>
                                                <textarea required rows={3} value={customerDetails.address} onChange={e => setCustomerDetails({ ...customerDetails, address: e.target.value })} className="w-full p-3 rounded-xl border-2 border-bakery-primary/10 focus:border-bakery-cta outline-none resize-none" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Payment Info */}
                                    <div className="space-y-4 pt-4">
                                        <h3 className="font-bold text-lg border-b border-bakery-primary/10 pb-2">Payment Option</h3>
                                        <p className="text-sm text-bakery-primary/60 mb-2">Once approved, we will send an invoice or payment link.</p>
                                        <div className="grid grid-cols-1 gap-4">
                                            <button type="button" onClick={() => setCustomerDetails({ ...customerDetails, paymentMethod: 'dm_whatsapp' })} className={`p-4 rounded-xl border-2 font-bold transition-all text-left flex items-center justify-between ${customerDetails.paymentMethod === 'dm_whatsapp' ? "border-[#25D366] bg-[#25D366]/5 text-[#25D366]" : "border-bakery-primary/10 text-bakery-primary"}`}>
                                                <span>Continue via WhatsApp</span>
                                                {customerDetails.paymentMethod === 'dm_whatsapp' && <Check size={18} />}
                                            </button>
                                            <button type="button" onClick={() => setCustomerDetails({ ...customerDetails, paymentMethod: 'stripe' })} className={`p-4 rounded-xl border-2 font-bold transition-all text-left flex items-center justify-between ${customerDetails.paymentMethod === 'stripe' ? "border-bakery-cta bg-bakery-cta/5 text-bakery-cta" : "border-bakery-primary/10 text-bakery-primary"}`}>
                                                <span>Send Invoice to Email</span>
                                                {customerDetails.paymentMethod === 'stripe' && <Check size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="pt-8 flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting || !customerDetails.name || !customerDetails.email || !customerDetails.phone || (customerDetails.deliveryType === 'delivery' && !customerDetails.address)}
                                            className="bg-bakery-cta text-white px-8 py-4 rounded-xl font-black disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-1 transition-all shadow-lg shadow-bakery-cta/20 w-full sm:w-auto"
                                        >
                                            {isSubmitting ? "Placing Order..." : "Confirm Custom Order ✨"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Step 5: Success State */}
                        {orderSuccess && (
                            <div className="text-center py-16 animate-in zoom-in duration-500 max-w-xl mx-auto">
                                <div className="w-20 h-20 bg-[#25D366]/10 text-[#25D366] rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Check size={40} />
                                </div>
                                <h2 className="text-3xl font-black font-playfair mb-4">Request Received!</h2>
                                <p className="text-lg text-bakery-primary/70 mb-8">
                                    Thank you for choosing Crave Bakery. Our team is reviewing your custom order details. We will be in touch shortly to confirm everything and arrange payment.
                                </p>

                                {customerDetails.paymentMethod === 'dm_whatsapp' ? (
                                    <a
                                        href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '447000000000'}?text=Hi, I just submitted a custom order for a ${encodeURIComponent(productType || '')}. My email is ${encodeURIComponent(customerDetails.email)}.`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 bg-[#25D366] text-white px-8 py-4 rounded-xl font-black shadow-lg hover:-translate-y-1 transition-all"
                                    >
                                        Message us on WhatsApp
                                    </a>
                                ) : (
                                    <a
                                        href="/"
                                        className="inline-flex items-center gap-2 bg-bakery-cta text-white px-8 py-4 rounded-xl font-black shadow-lg hover:-translate-y-1 transition-all"
                                    >
                                        Return to Home
                                    </a>
                                )}
                            </div>
                        )}

                    </div>
                </div>
            </main>
        </ErrorBoundary>
    );
}
