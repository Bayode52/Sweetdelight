"use client";

import { useState } from "react";
import { useCartStore } from "@/store/useCartStore";
import Step1OrderReview from "@/components/checkout/Step1OrderReview";
import Step2CustomerDetails, { type CustomerDetailsForm } from "@/components/checkout/Step2CustomerDetails";
import Step3Discounts from "@/components/checkout/Step3Discounts";
import Step4PaymentMethod from "@/components/checkout/Step4PaymentMethod";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
    { number: 1, label: "Basket Review" },
    { number: 2, label: "Your Details" },
    { number: 3, label: "Discounts" },
    { number: 4, label: "Payment" },
];

export default function CheckoutPage() {
    const [currentStep, setCurrentStep] = useState(1);
    const [customerDetails, setCustomerDetails] = useState<CustomerDetailsForm>({
        fullName: "", email: "", phone: "", deliveryType: "Home Delivery",
    });
    const [discountData, setDiscountData] = useState({ amount: 0, storeCredit: 0, code: "" });
    useCartStore();

    const nextStep = () => setCurrentStep((s) => Math.min(s + 1, STEPS.length));
    const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 1));

    const handleDetailsSubmit = (data: CustomerDetailsForm) => {
        setCustomerDetails(data);
        nextStep();
    };

    const handleDiscountsSubmit = (amount: number, storeCredit: number, code: string) => {
        setDiscountData({ amount, storeCredit, code });
        nextStep();
    };

    return (
        <div className="min-h-screen bg-[#FDF6F0] pt-8 pb-24">
            <div className="max-w-5xl mx-auto px-4">
                {/* Stepper */}
                <div className="mb-12">
                    <div className="flex items-center justify-between relative">
                        {/* Connector line */}
                        <div className="absolute top-5 left-0 right-0 h-0.5 bg-bakery-primary/10 z-0" />
                        <div
                            className="absolute top-5 left-0 h-0.5 bg-bakery-cta z-0 transition-all duration-500"
                            style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
                        />

                        {STEPS.map((step) => {
                            const isDone = currentStep > step.number;
                            const isActive = currentStep === step.number;
                            return (
                                <div key={step.number} className="relative z-10 flex flex-col items-center gap-2">
                                    <div className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center font-black text-sm transition-all border-2",
                                        isDone ? "bg-bakery-cta border-bakery-cta text-white"
                                            : isActive ? "bg-bakery-cta border-bakery-cta text-white shadow-lg shadow-bakery-cta/30"
                                                : "bg-white border-bakery-primary/20 text-bakery-primary/40"
                                    )}>
                                        {isDone ? <Check size={16} strokeWidth={3} /> : step.number}
                                    </div>
                                    <span className={cn(
                                        "text-xs font-black uppercase tracking-widest text-center hidden sm:block",
                                        isActive ? "text-bakery-cta" : isDone ? "text-bakery-primary/60" : "text-bakery-primary/30"
                                    )}>
                                        {step.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Step content */}
                <div className="max-w-4xl mx-auto">
                    {currentStep === 1 && <Step1OrderReview onNext={nextStep} />}
                    {currentStep === 2 && (
                        <Step2CustomerDetails
                            defaultValues={customerDetails}
                            onNext={handleDetailsSubmit}
                            onBack={prevStep}
                        />
                    )}
                    {currentStep === 3 && (
                        <Step3Discounts
                            deliveryType={customerDetails.deliveryType}
                            onNext={handleDiscountsSubmit}
                            onBack={prevStep}
                        />
                    )}
                    {currentStep === 4 && (
                        <Step4PaymentMethod
                            customerDetails={customerDetails}
                            discountAmount={discountData.amount}
                            storeCreditUsed={discountData.storeCredit}
                            promoCode={discountData.code}
                            onBack={prevStep}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
