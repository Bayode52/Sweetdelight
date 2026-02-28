import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
    title: "Privacy Policy | Sweet Delight",
    description: "Privacy Policy and GDPR information for Sweet Delight.",
};

export default function PrivacyPage() {
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
                    <h1 className="text-4xl md:text-5xl font-playfair font-black mb-4">Privacy Policy</h1>
                    <p className="text-[#4A3222]/60 italic mb-8">Last updated: February 2026</p>

                    <div className="space-y-8 text-[#4A3222]/80 leading-relaxed">
                        <section>
                            <h2 className="text-2xl font-playfair font-black text-[#4A3222] mb-4">1. Information We Collect</h2>
                            <p>
                                To process your orders and provide our services, we collect:
                            </p>
                            <ul className="list-disc pl-6 mt-2 space-y-1">
                                <li>Identity Data: Name, username</li>
                                <li>Contact Data: Email address, phone number</li>
                                <li>Delivery Data: Billing and delivery addresses</li>
                                <li>Transaction Data: Details of orders placed with us</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-playfair font-black text-[#4A3222] mb-4">2. Why We Collect It</h2>
                            <p>
                                We use your personal data to:
                            </p>
                            <ul className="list-disc pl-6 mt-2 space-y-1">
                                <li>Process and deliver your orders</li>
                                <li>Communicate with you regarding updates, delays, or issues</li>
                                <li>Improve our website and services</li>
                                <li>Send promotional emails (only if you have opted in)</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-playfair font-black text-[#4A3222] mb-4">3. Data Retention</h2>
                            <p>
                                We securely store your data only for as long as necessary to fulfill the purposes we collected it for,
                                including satisfying any legal, accounting, or reporting requirements.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-playfair font-black text-[#4A3222] mb-4">4. Your Rights</h2>
                            <p>
                                Under the GDPR, you have the right to:
                            </p>
                            <ul className="list-disc pl-6 mt-2 space-y-1">
                                <li>Request access to your personal data</li>
                                <li>Request correction of inaccurate data</li>
                                <li>Request deletion of your data (Right to be Forgotten)</li>
                                <li>Request transfer of your data to another service</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-playfair font-black text-[#4A3222] mb-4">5. Third-Party Services</h2>
                            <p>
                                We use trusted third-party providers to securely operate our business:
                            </p>
                            <ul className="list-disc pl-6 mt-2 space-y-1">
                                <li><strong>Supabase:</strong> For database hosting and authentication.</li>
                                <li><strong>Stripe:</strong> For secure payment processing. We do not store your raw payment details.</li>
                                <li><strong>Resend:</strong> For dispatching order updates and emails.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-playfair font-black text-[#4A3222] mb-4">6. Cookie Policy</h2>
                            <p>
                                We use essential cookies to keep you logged in and process your cart. We may also use analytical
                                cookies to understand how our website is used. You can adjust your browser settings to refuse cookies.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-playfair font-black text-[#4A3222] mb-4">7. Contact Us & ICO</h2>
                            <p>
                                If you wish to exercise any of your data rights or have questions, please contact us:{" "}
                                <a href="mailto:hello@sweetdelight.co.uk" className="text-[#D97757] font-bold hover:underline">
                                    hello@sweetdelight.co.uk
                                </a>
                            </p>
                            <p className="mt-4 text-sm bg-[#4A3222]/5 p-4 rounded-xl border border-[#4A3222]/10">
                                Note: You also have the right to make a complaint at any time to the Information Commissioner's Office (ICO),
                                the UK supervisory authority for data protection issues.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </main>
    );
}
