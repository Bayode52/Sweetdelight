import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { emailTemplates } from '@/lib/email-templates';

function getResend() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        console.warn('RESEND_API_KEY not set - emails disabled');
        return null;
    }
    return new Resend(apiKey);
}

export async function POST(req: Request) {
    try {
        // Authorization check to prevent abuse
        const authHeader = req.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.INTERNAL_API_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { type, email, data } = body;

        let subject = '';
        let html = '';

        switch (type) {
            case 'welcome':
                subject = 'Welcome to Sweet Delight 🥐';
                html = emailTemplates.welcome(data.name);
                break;
            case 'order_confirmed':
                subject = `Order Confirmed - PB-${data.orderId.substring(0, 8).toUpperCase()}`;
                html = emailTemplates.orderConfirmed(data.name, data.orderId, data.items, data.total);
                break;
            case 'status_update':
                subject = `Order Update - PB-${data.orderId.substring(0, 8).toUpperCase()}`;
                html = emailTemplates.statusUpdate(data.name, data.orderId, data.status);
                break;
            case 'review_request':
                subject = 'How did we do? ⭐️';
                html = emailTemplates.reviewRequest(data.name, data.orderId);
                break;
            case 'referral_credited':
                subject = "You've Got Store Credit! 💸";
                html = emailTemplates.referralCredited(data.name, data.amount);
                break;
            case 'admin_new_order':
                subject = `🚨 New Order: PB-${data.orderId.substring(0, 8).toUpperCase()}`;
                html = emailTemplates.adminNewOrder(data.orderId, data.total);
                break;
            case 'admin_custom_order':
                subject = `✨ New Custom Order: #${data.orderId}`;
                html = emailTemplates.adminCustomOrder(data.orderId, data.customSpec, data.customer);
                break;
            case 'abandoned_basket':
                subject = 'You left something sweet behind... 🥺';
                html = emailTemplates.abandonedBasket(data.name);
                break;
            default:
                return NextResponse.json({ error: 'Invalid notification type' }, { status: 400 });
        }

        const resend = getResend();
        if (resend) {
            const resendRes = await resend.emails.send({
                from: 'Sweet Delight <onboarding@resend.dev>', // Use verified sender identity once added to Resend
                to: email,
                subject,
                html,
            });

            if (resendRes.error) {
                console.error("Resend Error:", resendRes.error);
                throw resendRes.error;
            }

            return NextResponse.json({ success: true, id: resendRes.data?.id });
        } else {
            console.log('Email skipped - Resend not configured');
            return NextResponse.json({ success: true, warning: 'Email skipped - Resend not configured' });
        }
    } catch (e: any) {
        console.error("Notification API Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
