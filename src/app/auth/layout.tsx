"use client";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-bakery-background flex items-center justify-center px-6 py-20">
            <div className="w-full max-w-md">
                {children}
            </div>
        </div>
    );
}
