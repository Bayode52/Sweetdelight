import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
    title: "Terms & Conditions | Crave Bakery",
    description: "Terms and Conditions for Crave Bakery custom orders and deliveries.",
};

export default function TermsPage() {
    return (
        <main className="min-h-screen bg-[#FDFBF7] pt-32 pb-24 text-[#4A3222]">
            <div className="max-w-3xl mx-auto px-6">
                <Link
                    href="/auth/signup"
                    className="inline-flex items-center gap-2 text-sm font-bold text-[#4A3222]/60 hover:text-[#D97757] transition-colors mb-8"
                >
                    <ArrowLeft size={16} /> Back to Sign Up
                </Link>

                <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-[#4A3222]/5">
                    <h1 className="text-4xl md:text-5xl font-playfair font-black mb-4">Terms & Conditions</h1>
                    <p className="text-[#4A3222]/60 italic mb-8">Last updated: February 2026</p>

                    <div className="space-y-8 text-[#4A3222]/80 leading-relaxed">
                        <section>
                            <h2 className="text-2xl font-playfair font-black text-[#4A3222] mb-4">1. Business Information</h2>
                            <p>
                                Crave Bakery operates in the United Kingdom.
                                By placing an order with us, you agree to these Terms and Conditions.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-playfair font-black text-[#4A3222] mb-4">2. Ordering & Payment</h2>
                            <p>
                                All orders are subject to acceptance and availability. Prices are quoted in GBP (£).
                                A non-refundable deposit may be required for custom orders to secure your date.
                                Full payment must be cleared before delivery or collection.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-playfair font-black text-[#4A3222] mb-4">3. Delivery Policy</h2>
                            <p>
                                We offer both delivery and collection options. While we take every precaution to secure
                                your order during transit, we are not liable for any damages that occur once the product
                                has been handed over to you or your designated recipient.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-playfair font-black text-[#4A3222] mb-4">4. Custom Order Cancellations</h2>
                            <p>
                                Custom orders require significant planning and preparation.
                                Cancellations must be made at least 7 days before the delivery/collection date for a refund,
                                minus any non-refundable deposits. Orders cancelled within 7 days are non-refundable.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-playfair font-black text-[#4A3222] mb-4">5. Food Safety & Allergens</h2>
                            <p>
                                Please be aware that our products are baked in a kitchen that handles nuts, dairy, gluten, and other allergens.
                                While we take steps to minimize cross-contamination, we cannot guarantee that any product is 100% free of allergens.
                                It is the customer's responsibility to inform us of any dietary requirements and to notify their guests.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-playfair font-black text-[#4A3222] mb-4">6. Refund Policy</h2>
                            <p>
                                Due to the perishable nature of our products, we do not offer refunds once an item has been accepted.
                                If you are unsatisfied with your order, please contact us within 24 hours with photographic evidence,
                                and we will assess the situation on a case-by-case basis.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-playfair font-black text-[#4A3222] mb-4">7. Intellectual Property</h2>
                            <p>
                                All content on this website, including images, designs, and text, is the property of Sweet Delight
                                and may not be reproduced without our written permission.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-playfair font-black text-[#4A3222] mb-4">8. Governing Law</h2>
                            <p>
                                These Terms and Conditions shall be governed by and construed in accordance with the laws of England and Wales.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-playfair font-black text-[#4A3222] mb-4">9. Contact Us</h2>
                            <p>
                                For any disputes or questions regarding these terms, please contact us at:{" "}
                                <a href="mailto:hello@cravebakery.co.uk" className="text-[#D97757] font-bold hover:underline">
                                    hello@cravebakery.co.uk
                                </a>
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </main>
    );
}
