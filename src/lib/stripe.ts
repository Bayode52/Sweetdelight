import Stripe from 'stripe';

export function getStripe() {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
        console.warn('STRIPE_SECRET_KEY not set - Stripe disabled');
        return null;
    }
    return new Stripe(apiKey, {
        apiVersion: '2026-01-28.clover',
    });
}
