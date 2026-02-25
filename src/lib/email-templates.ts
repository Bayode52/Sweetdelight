const BASE_STYLES = `
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FDFBF7; color: #2D1810; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
  .header { text-align: center; margin-bottom: 40px; }
  .logo { font-size: 32px; font-weight: 900; color: #2D1810; text-decoration: none; }
  .logo-cta { color: #D97706; }
  .box { background-color: #ffffff; border-radius: 24px; border: 1px solid rgba(45,24,16,0.05); padding: 40px; box-shadow: 0 10px 40px rgba(45, 24, 16, 0.05); }
  h1 { font-size: 24px; font-weight: 900; margin-top: 0; margin-bottom: 20px; color: #2D1810; }
  h2 { font-size: 18px; font-weight: 800; margin-top: 30px; margin-bottom: 15px; color: #2D1810; }
  p { font-size: 16px; line-height: 1.6; margin-bottom: 20px; color: #4A3A35; }
  .btn { display: inline-block; background-color: #D97706; color: #ffffff !important; padding: 16px 32px; border-radius: 16px; font-weight: bold; text-decoration: none; text-align: center; margin-top: 10px; }
  .footer { text-align: center; margin-top: 40px; font-size: 12px; color: rgba(45, 24, 16, 0.4); text-transform: uppercase; letter-spacing: 0.1em; font-weight: bold; }
  .divider { height: 1px; background-color: rgba(45,24,16,0.05); margin: 30px 0; }
  .item-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 15px; }
  .item-name { font-weight: bold; }
  .item-price { color: #D97706; font-weight: bold; }
  .total-row { display: flex; justify-content: space-between; margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(45,24,16,0.1); font-size: 18px; font-weight: 900; color: #D97706; }
`;

function withBaseTemplate(content: string) {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>${BASE_STYLES}</style>
</head>
<body>
    <div class="container">
        <div class="header">
            <a href="https://example.com" class="logo">Crave<span class="logo-cta">.</span>Bakery</a>
        </div>
        <div class="box">
            ${content}
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Crave Bakery. All rights reserved.</p>
            <p>Made with ❤️ in the UK — with Nigerian Soul</p>
        </div>
    </div>
</body>
</html>
    `;
}

export const emailTemplates = {
    welcome: (name: string) => withBaseTemplate(`
        <h1>Welcome to the Family, ${name}! 🥐</h1>
        <p>We're absolutely thrilled to have you here at Crave Bakery. Prepare your tastebuds for a journey of rich flavors, premium ingredients, and a touch of Nigerian soul.</p>
        <p>As a welcome gift, dive into our menu and explore our daily fresh batches. We promise you won't be disappointed.</p>
        <div style="text-align: center">
            <a href="https://example.com/menu" class="btn">Explore the Menu</a>
        </div>
    `),

    orderConfirmed: (name: string, orderId: string, items: { name: string, qty: number, price: number }[], total: number) => {
        const itemsHtml = items.map(item => `
            <div class="item-row">
                <span class="item-name">${item.qty}x ${item.name}</span>
                <span class="item-price">£${item.price.toLocaleString()}</span>
            </div>
        `).join('');

        return withBaseTemplate(`
            <h1>Order Confirmed! 🎉</h1>
            <p>Hi ${name}, your order <strong>#PB-${orderId.substring(0, 8).toUpperCase()}</strong> has been received and our bakers are getting ready to prep it!</p>
            
            <div style="background: rgba(45,24,16,0.02); padding: 20px; border-radius: 16px; margin: 30px 0;">
                <h3 style="margin-top:0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(45,24,16,0.4);">Order Summary</h3>
                ${itemsHtml}
                <div class="total-row">
                    <span>Total</span>
                    <span>£${total.toLocaleString()}</span>
                </div>
            </div>

            <p>We'll notify you as soon as your order is on its way. You can always check the live status of your order.</p>
            <div style="text-align: center">
                <a href="https://example.com/track-order" class="btn">Track Your Order</a>
            </div>
        `);
    },

    statusUpdate: (name: string, orderId: string, status: string) => {
        const statuses: Record<string, string> = {
            processing: "is now being processed by our bakers 👨‍🍳",
            out_for_delivery: "is out for delivery! 🚚 Keep an eye out",
            delivered: "has been delivered! 🛍️ Enjoy your treats",
            cancelled: "has been cancelled."
        };

        const msg = statuses[status] || `status has been updated to: ${status}`;

        return withBaseTemplate(`
            <h1>Order Update 📦</h1>
            <p>Hi ${name},</p>
            <p>Good news! Your order <strong>#PB-${orderId.substring(0, 8).toUpperCase()}</strong> ${msg}.</p>
            
            <div style="text-align: center">
                <a href="https://example.com/track-order" class="btn">Track Order</a>
            </div>
        `);
    },

    reviewRequest: (name: string, orderId: string) => withBaseTemplate(`
        <h1>How did we do? ⭐️</h1>
        <p>Hi ${name},</p>
        <p>We hope you enjoyed your recent order! Your feedback means the world to us and helps other pastry lovers discover their new favorites.</p>
        <p>Could you take 60 seconds to leave a quick review on your items?</p>
        <div style="text-align: center">
            <a href="https://example.com/account" class="btn">Leave a Review</a>
        </div>
    `),

    referralCredited: (name: string, amount: number) => withBaseTemplate(`
        <h1>You've Got Store Credit! 💸</h1>
        <p>Hi ${name},</p>
        <p>Awesome! Someone just used your referral link to place their first order. We've added <strong>£${amount.toLocaleString()}</strong> in store credit to your account.</p>
        <p>This credit will be automatically applied to your next purchase.</p>
        <div style="text-align: center">
            <a href="https://example.com/menu" class="btn">Claim Your Treats</a>
        </div>
    `),

    adminNewOrder: (orderId: string, total: number) => withBaseTemplate(`
        <h1>🚨 New Order Alert!</h1>
        <p>A new order (<strong>#PB-${orderId.substring(0, 8).toUpperCase()}</strong>) has just been placed for <strong>£${total.toLocaleString()}</strong>.</p>
        <p>Log in to the admin dashboard to review and process this order.</p>
        <div style="text-align: center">
            <a href="https://example.com/admin/orders" class="btn">View Order</a>
        </div>
    `),

    adminCustomOrder: (orderId: string, customSpec: any, customer: any) => {
        const specsHtml = customSpec.aiPreview.specifications.map((spec: any) => `
            <div class="item-row">
                <span class="item-name">${spec.label}</span>
                <span class="item-price" style="color: #4A3A35; font-weight: normal;">${spec.value}</span>
            </div>
        `).join('');

        return withBaseTemplate(`
            <h1>✨ New Custom Order Request!</h1>
            <p>A new custom order request (<strong>#${orderId}</strong>) has been submitted for a <strong>${customSpec.productType}</strong>.</p>
            
            <div style="background: rgba(217,119,6,0.05); padding: 20px; border-radius: 16px; margin: 30px 0; border: 1px solid rgba(217,119,6,0.2);">
                <h3 style="margin-top:0; font-size: 16px; color: #D97706;">AI Visual Brief</h3>
                <p style="font-size: 14px; font-style: italic;">"${customSpec.aiPreview.visualDescription}"</p>
                <div class="total-row" style="margin-top: 15px; padding-top: 15px;">
                    <span>Estimated Price</span>
                    <span>${customSpec.aiPreview.priceEstimate}</span>
                </div>
            </div>

            <div style="background: rgba(45,24,16,0.02); padding: 20px; border-radius: 16px; margin: 30px 0;">
                <h3 style="margin-top:0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(45,24,16,0.4);">Specifications</h3>
                ${specsHtml}
            </div>

            <div style="background: rgba(45,24,16,0.02); padding: 20px; border-radius: 16px; margin: 30px 0;">
                <h3 style="margin-top:0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(45,24,16,0.4);">Customer Details</h3>
                <div class="item-row"><span class="item-name">Name</span> <span style="font-weight: normal;">${customer.name}</span></div>
                <div class="item-row"><span class="item-name">Email</span> <span style="font-weight: normal;">${customer.email}</span></div>
                <div class="item-row"><span class="item-name">Phone</span> <span style="font-weight: normal;">${customer.phone}</span></div>
                ${customer.notes ? `<div class="item-row" style="margin-top: 10px;"><span class="item-name">Notes</span></div><p style="font-size: 14px; margin-top: 5px;">${customer.notes}</p>` : ''}
            </div>

            <div style="text-align: center">
                <a href="https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=Hi ${encodeURIComponent(customer.name.split(' ')[0])}, I'm reaching out from Crave Bakery regarding your custom order for a ${encodeURIComponent(customSpec.productType)}." class="btn" style="background-color: #25D366; margin-right: 10px;">Message on WhatsApp</a>
                <a href="https://example.com/admin/orders" class="btn">View in Dashboard</a>
            </div>
        `);
    },

    abandonedBasket: (name: string) => withBaseTemplate(`
        <h1>You left something sweet behind... 🥺</h1>
        <p>Hi ${name},</p>
        <p>We noticed you left some delicious treats in your basket. Don't worry, we've saved them for you!</p>
        <p>Complete your order now before they sell out.</p>
        <div style="text-align: center">
            <a href="https://example.com/menu" class="btn">Return to Cart</a>
        </div>
    `)
};
