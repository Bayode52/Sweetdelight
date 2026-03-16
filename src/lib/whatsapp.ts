import type { CartItem } from "@/store/useCartStore";

interface CustomerDetails {
    fullName: string;
    email: string;
    phone: string;
    deliveryType: "Home Delivery" | "Collection";
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    postcode?: string;
    deliveryNote?: string;
    specialInstructions?: string;
}

interface OrderSummary {
    ref: string;
    subtotal: number;
    deliveryFee: number;
    discountAmount: number;
    storeCreditUsed: number;
    total: number;
}

export function generateOrderMessage(
    order: OrderSummary,
    items: CartItem[],
    customer: CustomerDetails
): string {
    const itemLines = items
        .map((item) => `  - ${item.name} x${item.quantity} — £${(item.price * item.quantity).toFixed(2)}`)
        .join("\n");

    const deliveryLine =
        customer.deliveryType === "Home Delivery"
            ? `£${order.deliveryFee.toFixed(2)}`
            : "Free Collection";

    const addressLine =
        customer.deliveryType === "Home Delivery"
            ? [customer.addressLine1, customer.addressLine2, customer.city, customer.postcode]
                .filter(Boolean)
                .join(", ")
            : "Collection — no delivery needed";

    const discountLine =
        order.discountAmount > 0 ? `\n💸 Discount: -£${order.discountAmount.toFixed(2)}` : "";
    const creditLine =
        order.storeCreditUsed > 0 ? `\n🏦 Store Credit: -£${order.storeCreditUsed.toFixed(2)}` : "";
    const noteLine = customer.specialInstructions
        ? `\n📝 Notes: ${customer.specialInstructions}`
        : "";

    return `🎂 *New Order — Sweet Delites*
━━━━━━━━━━━━━━━━━━
📋 Order Ref: ${order.ref}
👤 Name: ${customer.fullName}
📱 Phone: ${customer.phone}
📧 Email: ${customer.email}
━━━━━━━━━━━━━━━━━━
🛒 *ORDER ITEMS:*
${itemLines}
━━━━━━━━━━━━━━━━━━
💷 Subtotal: £${order.subtotal.toFixed(2)}
🚗 Delivery: ${deliveryLine}${discountLine}${creditLine}
💰 *TOTAL: £${order.total.toFixed(2)}*
━━━━━━━━━━━━━━━━━━
📍 Delivery to: ${addressLine}${noteLine}
━━━━━━━━━━━━━━━━━━
Please send payment to complete your order. Thank you! 🙏`;
}

export function generateReferralShareMessage(name: string, link: string): string {
    return `Hey! 👋 I've been ordering from Sweet Delites for amazing Nigerian pastries in the UK 🎂🍢\n\nThey do custom cakes, small chops platters, chin chin and more — all handmade and delivered nationwide.\n\nUse my link to get money off your first order: ${link}\n\nTell them ${name} sent you! 😄`;
}
