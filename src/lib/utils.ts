import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { formatDistanceToNow } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatNaira(amount: number) {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        maximumFractionDigits: 0
    }).format(amount);
}

export function formatDate(date: string | Date) {
    return new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    }).format(new Date(date));
}

export function formatRelativeTime(date: string | Date) {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function generateOrderId() {
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `PB-${year}-${random}`;
}

export function generateReferralCode(firstName: string) {
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${firstName.toUpperCase().replace(/\s/g, '')}${random}`;
}

export function truncateText(text: string, maxLength: number) {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
}
