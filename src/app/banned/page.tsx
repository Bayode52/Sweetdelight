export default function BannedPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-bakery-background p-6">
            <div className="max-w-md w-full bg-white rounded-[40px] luxury-shadow border border-bakery-primary/5 p-12 text-center">
                <div className="w-20 h-20 bg-bakery-error/10 rounded-full flex items-center justify-center mx-auto mb-8">
                    <span className="text-4xl text-bakery-error">🚫</span>
                </div>
                <h1 className="text-3xl font-black font-playfair text-bakery-primary mb-4 leading-tight">
                    Account Suspended
                </h1>
                <p className="text-bakery-primary/60 font-medium mb-8">
                    Your account has been suspended. If you believe this is a mistake, please contact our support team.
                </p>
                <div className="bg-bakery-primary/5 rounded-2xl p-4 flex flex-col items-center gap-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-bakery-primary/40">Support Email</p>
                    <a href="mailto:hello@cravebakery.co.uk" className="text-bakery-cta font-bold hover:underline">
                        hello@cravebakery.co.uk
                    </a>
                </div>
            </div>
        </div>
    );
}
