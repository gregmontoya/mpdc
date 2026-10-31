const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.local') });
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * 🎫 CREATE A 100% OFF COUPON & PROMO CODE
 * Run this if you need to give FREE access to someone!
 */
async function createFreeCoupon(code = 'MPDC_FREE_ACCESS') {
    if (!process.env.STRIPE_SECRET_KEY) {
        console.error('❌ STRIPE_SECRET_KEY is missing from .env.local');
        return;
    }

    try {
        console.log(`🎫 Creating 100% OFF Coupon for: ${code}...`);

        // 1. Create the Coupon (The logic)
        const coupon = await stripe.coupons.create({
            percent_off: 100,
            duration: 'once',
            name: 'FREE Access (Introductory Offer)',
        });

        // 2. Create the Promotion Code (The text the user types)
        const promoCode = await stripe.promotionCodes.create({
            coupon: coupon.id,
            code: code,
        });

        console.log('------------------------------------------');
        console.log('✅ COUPON CREATED SUCCESSFULLY!');
        console.log(`🆔 Coupon ID: ${coupon.id}`);
        console.log(`✨ Promo Code: ${promoCode.code}`);
        console.log('------------------------------------------');
        console.log('You can now give this code to your free clients!');

    } catch (error) {
        console.error('❌ Error creating coupon:', error.message);
    }
}

// Get code from command line or use default
const inputCode = process.argv[2] || 'MPDC_FREE_ACCESS';

createFreeCoupon(inputCode);
