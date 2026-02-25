import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
    return <div className={cn("animate-pulse bg-bakery-primary/8 rounded-2xl", className)} />;
}

export function ProductCardSkeleton() {
    return (
        <div className="bg-white rounded-[40px] p-4 border border-bakery-primary/5">
            <Skeleton className="aspect-square rounded-[32px] mb-4" />
            <div className="px-2 space-y-3">
                <div className="flex justify-between">
                    <Skeleton className="h-3 w-20 rounded-full" />
                    <Skeleton className="h-3 w-8 rounded-full" />
                </div>
                <Skeleton className="h-5 w-3/4 rounded-xl" />
                <div className="flex justify-between items-center">
                    <Skeleton className="h-6 w-16 rounded-xl" />
                    <Skeleton className="h-10 w-10 rounded-xl" />
                </div>
            </div>
        </div>
    );
}

export function OrderCardSkeleton() {
    return (
        <div className="bg-white rounded-3xl p-6 border border-bakery-primary/5 space-y-4">
            <div className="flex justify-between">
                <Skeleton className="h-5 w-32 rounded-xl" />
                <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-4 w-full rounded-xl" />
                <Skeleton className="h-4 w-2/3 rounded-xl" />
            </div>
            <div className="flex justify-between">
                <Skeleton className="h-4 w-24 rounded-xl" />
                <Skeleton className="h-4 w-16 rounded-xl" />
            </div>
        </div>
    );
}

export function BlogCardSkeleton() {
    return (
        <div className="bg-white rounded-3xl overflow-hidden border border-bakery-primary/5">
            <Skeleton className="aspect-video" />
            <div className="p-6 space-y-3">
                <Skeleton className="h-3 w-24 rounded-full" />
                <Skeleton className="h-6 w-full rounded-xl" />
                <Skeleton className="h-4 w-5/6 rounded-xl" />
                <Skeleton className="h-4 w-3/4 rounded-xl" />
                <Skeleton className="h-3 w-32 rounded-full mt-2" />
            </div>
        </div>
    );
}

export function ReviewCardSkeleton() {
    return (
        <div className="bg-white rounded-3xl p-6 border border-bakery-primary/5 space-y-4">
            <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24 rounded-xl" />
                    <Skeleton className="h-3 w-16 rounded-full" />
                </div>
            </div>
            <Skeleton className="h-4 w-full rounded-xl" />
            <Skeleton className="h-4 w-4/5 rounded-xl" />
        </div>
    );
}

export function MenuSectionSkeleton() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-8 w-48 rounded-xl" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
        </div>
    );
}
